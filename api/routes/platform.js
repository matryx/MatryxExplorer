/*
MatryxExplorer API routing for all platform based REST calls

author - sam@nanome.ai
Copyright Nanome Inc 2018
*/

// TODO versioning api calls for the abi and latest platform info

const express = require('express')
const router = express.Router()

const externalApiCalls = require('../controllers/gateway/externalApiCalls')
const matryxPlatformCalls = require('../controllers/gateway/matryxPlatformCalls')

let latestVersion = process.env.PLATFORM_VERSION

// Return a message that this route handles all platform specific requests
router.get('/', (req, res, next) => {
  res.status(200).json({
    message: 'handling GET requests to /platform'
  })
})

// TODO fix this one...showing up as undefined due to scope
// Return a message that this route handles all platform specific requests
router.get('/getLatestInfo', (req, res, next) => {
  try {
    externalApiCalls.getMatryxPlatformInfo(latestVersion).then(function (resultingInfo) {
      let addressReturned = resultingInfo['networks']['777']['address']
      let abiReturned = JSON.stringify(resultingInfo.abi)
      abiReturned = JSON.parse(abiReturned)
      res.status(200).json({
        address: addressReturned,
        abi: abiReturned
      })
    }).catch((err) => {
      res.status(500).json({
        error: err.message
      })
    })
  } catch (err) {
    console.log('Error loading the ABI')
    res.status(500).json({
      errorMessage: 'Sorry, that version does not exist.',
      error: err.message
    })
  }
})

router.get('/getLatestAddress', (req, res, next) => {
  try {
    externalApiCalls.getMatryxPlatformInfo(latestVersion).then(function (resultingInfo) {
      let addressReturned = resultingInfo['networks']['777']['address']
      res.status(200).json({
        address: addressReturned
      })
    }).catch((err) => {
      res.status(500).json({
        error: err.message
      })
    })
  } catch (err) {
    console.log('Error loading the ABI')
    res.status(500).json({
      errorMessage: 'Sorry, that version does not exist.',
      error: err.message
    })
  }
})

router.get('/getLatestAbi', (req, res, next) => {
  try {
    externalApiCalls.getMatryxPlatformInfo(latestVersion).then(function (resultingInfo) {
      let abiReturned = JSON.stringify(resultingInfo.abi)
      abiReturned = JSON.parse(abiReturned)

      res.status(200).json({
        abi: abiReturned
      })
    }).catch((err) => {
      res.status(500).json({
        error: err.message
      })
    })
  } catch (err) {
    console.log('Error loading the ABI')
    res.status(500).json({
      errorMessage: 'Sorry, that version does not exist.',
      error: err.message
    })
  }
})

// Return a confirmation the API is live
router.get('/getInfo/:version', (req, res, next) => {
  let version = req.params.version
  try {
    externalApiCalls.getMatryxPlatformInfo(version).then(function (resultingInfo) {
      let addressReturned = resultingInfo['networks']['777']['address']
      let abiReturned = JSON.stringify(resultingInfo.abi)
      abiReturned = JSON.parse(abiReturned)
      res.status(200).json({
        address: addressReturned,
        abi: abiReturned
      })
    }).catch((err) => {
      res.status(500).json({
        error: err.message
      })
    })
  } catch (err) {
    console.log('Error loading the ABI')
    res.status(500).json({
      errorMessage: 'Sorry, that version does not exist.',
      error: err.message
    })
  }
})

// Return a confirmation the API is live
router.get('/getAddress/:version', (req, res, next) => {
  let version = req.params.version
  try {
    externalApiCalls.getMatryxPlatformAddress(version).then(function (resultingInfo) {
      let addressReturned = resultingInfo['networks']['777']['address']
      res.status(200).json({
        address: addressReturned
      })
    }).catch((err) => {
      res.status(500).json({
        error: err.message
      })
    })
  } catch (err) {
    console.log('Error loading the ABI')
    res.status(500).json({
      errorMessage: 'Sorry, that version does not exist.',
      error: err.message
    })
  }
})

// Return a confirmation the API is live
router.get('/getAbi/:version', (req, res, next) => {
  let version = req.params.version
  try {
    externalApiCalls.getMatryxPlatformAbi(version).then(function (resultingAbi) {
      let abiReturned = JSON.stringify(resultingAbi.abi)
      abiReturned = JSON.parse(abiReturned)
      res.status(200).json({
        abi: abiReturned
      })
    }).catch((err) => {
      res.status(500).json({
        error: err.message
      })
    })
  } catch (err) {
    console.log('Error loading the ABI')
    res.status(500).json({
      errorMessage: 'Sorry, that version does not exist.',
      error: err.message
    })
  }
})


// Return a confirmation the API is live
router.get('/getTopCategories', (req, res, next) => {
  try {
    matryxPlatformCalls.getTopCategories().then(function (results) {
      res.status(200).json({
        categories: results
      })
    }).catch((err) => {
      res.status(500).json({
        error: err.message
      })
    })
  } catch (err) {
    console.log('Error loading the top categories')
    res.status(500).json({
      errorMessage: 'Sorry, something failed.',
      error: err.message
    })
  }
})

module.exports = router
