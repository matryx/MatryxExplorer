/**
 * externalApiCalls.js
 * Helper methods for getting address and ABI of
 * contracts from MatryxPlatform GitHub
 *
 * Authors sam@nanome.ai dev@nanome.ai
 * Copyright (c) 2018, Nanome Inc
 * Licensed under ISC. See LICENSE.md in project root.
 */

let contractUrl = branch => `https://raw.githubusercontent.com/matryx/MatryxPlatform/${branch}/build/contracts/`
// let contractUrl = branch => `http://localhost:8081/`

let externalApiCalls = {}

const getInfo = async (contract, branch) => {
  const url = contractUrl(branch) + `${contract}.json`
  const res = await fetch(url)

  if (res.status !== 200) {
    throw Error(`Error getting ${contract} ABI`)
  }

  if (contract.includes("Matryx")) {
    console.log(`Got ${contract} ABI from MatryxPlatform GitHub for ${branch}`)
  }

  return res.json()
}

externalApiCalls.getMatryxPlatformInfo  = branch => getInfo('MatryxPlatform', branch)
externalApiCalls.getMatryxTokenInfo     = branch => getInfo('MatryxToken', branch)
externalApiCalls.getMatryxTournamentAbi = branch => getInfo('MatryxTournament', branch)
externalApiCalls.getMatryxSubmissionAbi = branch => getInfo('MatryxSubmission', branch)
externalApiCalls.getMatryxRoundAbi      = branch => getInfo('MatryxRound', branch)
externalApiCalls.getMigrationsInfo      = branch => getInfo('Migrations', branch)

module.exports = externalApiCalls
