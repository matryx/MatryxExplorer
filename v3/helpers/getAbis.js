/**
 * getAbis.js
 * Helper file for getting current ABIs for use throughout the app
 *
 * Authors dev@nanome.ai
 * Copyright (c) 2018, Nanome Inc
 * Licensed under ISC. See LICENSE.md in project root
 */

const fs = require('fs')
const EventEmitter = require('events')
const MatryxSystem = require('../contracts/MatryxSystem')
const MatryxPlatform = require('../contracts/MatryxPlatform')

const networkId = process.env.NETWORK_ID

const loadArtifact = name => {
  const path = `./v3/artifacts/${name}.json`
  const artifact = fs.readFileSync(path, 'utf8')
  return JSON.parse(artifact)
}

class ABIs extends EventEmitter {
  constructor() {
    super()

    this.updateInProgress = false
    this.lastUpdate = null
    this.system = null
    this.platform = null
    this.tournament = null
    this.round = null
    this.submission = null

    this.loadedAbis = new Promise(async done => {
      await this.update()
      done()
    })
  }

  async attemptUpdate() {
    const { updatedAt } = loadArtifact('Migrations')
    if (this.lastUpdate === updatedAt || this.updateInProgress) return false

    await this.update()
    return true
  }

  async update() {
    this.updateInProgress = true

    const artifacts = {
      token: loadArtifact('MatryxToken'),
      system: loadArtifact('MatryxSystem'),
      platform: loadArtifact('IMatryxPlatform'),
      tournament: loadArtifact('IMatryxTournament'),
      round: loadArtifact('IMatryxRound'),
      submission: loadArtifact('IMatryxSubmission')
    }

    const systemAddress = artifacts.system.networks[networkId].address
    const system = new MatryxSystem(systemAddress, artifacts.system.abi)

    // TODO: put in .env
    const version = 1 // await system.getVersion()
    const platformAddress = await system.getContract(version, 'MatryxPlatform')

    const abis = {}
    Object.entries(artifacts).forEach(([name, artifact]) => {
      abis[name] = { abi: artifact.abi }
    })

    const platform = new MatryxPlatform(platformAddress, artifacts.platform.abi)
    const tokenAddress = (await platform.getInfo()).token

    abis.token.address = tokenAddress
    abis.system.address = systemAddress
    abis.platform.address = platformAddress
    Object.assign(this, abis)

    const { updatedAt } = loadArtifact('Migrations')
    this.lastUpdate = updatedAt
    this.updateInProgress = false
    this.emit('update', this)
  }
}

module.exports = new ABIs()
