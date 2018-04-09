/*
MatryxExplorer API routing for all round based REST calls

author - sam@nanome.ai
Copyright Nanome Inc 2018
*/

const express = require('express')
const bodyParser = require('body-parser')
const formidable = require('formidable')
const tmp = require('tmp')
const fs = require('fs')
const util = require('util')
const router = express.Router()

const externalApiCalls = require('../controllers/gateway/externalApiCalls')
const matryxPlatformCalls = require('../controllers/gateway/matryxPlatformCalls')
const ipfsCalls = require('../controllers/gateway/ipfsCalls')

// Return a message that this route handles activity calls
// TODO return the landing page events to the UI
// Finish Backend
router.get('/', (req, res, next) => {
  res.status(200).json({
    message: 'handles all requests to /ipfs'
  })
})

router.get('/download/hash/:hash', (req, res, next) => {
  let hash = req.params.hash
  console.log('>IPFS Router: /download/hash/', hash, 'hit')
  ipfsCalls.getIpfsDataFiles(hash).then(function (result) {
    res.status(200).json({
      message: result
    })
  })
})

router.get('/getDescription/hash/:hash', (req, res, next) => {
  let hash = req.params.hash
  console.log(hash)
  ipfsCalls.getIpfsDescriptionOnly(hash).then(function (result) {
    console.log('The returned result is: ', result)
    res.status(200).json({
      message: result
    })
  }).catch(function (err) {
    res.status(500).json({
      message: err.message
    })
  })
})

router.get('/getTournamentDescription/address/:address', (req, res, next) => {
  let address = req.params.address
  console.log(address)
  matryxPlatformCalls.getTournamentDescription(address).then(function (result) {
    res.status(200).json({
      message: result
    })
  })
})

/*
Takes in a multipart/form-data post call with the following inputs
@input description (string)
@input jsonContent (stringify(json))
@input files (files)

It puts them in a temp folder and then uploads them to IPFS and returns a hash

@returns IPFS Hash (string)

// TODO: Save the uploaded files with their own name
*/
router.post('/upload', (req, res, next) => {
  var form = new formidable.IncomingForm(),
    files = [],
    fields = []

  var tmpobj = tmp.dirSync()
  console.log('Dir: ', tmpobj.name)

  form.uploadDir = tmpobj.name

// TODO: Throw this all in a try/catch block
  form
      .on('field', function (field, value) {
        // console.log(field, value)
        fields.push([field, value])
      })
      .on('file', function (field, file) {
        // console.log(field, file)
        files.push([field, file])
      })
      .on('progress', function (bytesReceived, bytesExpected) {
        var percent = (bytesReceived / bytesExpected * 100) | 0
        console.log('Uploading: %' + percent + '\r')
      })
      .on('end', function () {
          // Logic for handling the files + IPFS
        console.log('-> Upload Complete')

        let tempDirectory = tmpobj.name

        // console.log(util.inspect(files[0][1].path)) // This is where the first file was stored
        // console.log(fields[0][0]) // This is if the first field is 'description', it returns 'description' and fields[0][1] is the description content

        fields.forEach(function (field) {
            // Check to see if there is a description key in the fields
          if (field[0] == 'description') {
            console.log(field[1]) // This is the description content
            descriptionContent = Buffer.from(field[1])
            descriptionPath = tempDirectory + '/description.txt'
            // Store the descriptionContent into the tempFolder
            ipfsCalls.storeDescriptionToTmp(descriptionContent, descriptionPath).then(function (result) {
              console.log(result)
            })
          }
          // Check to see if there is a jsonContent key in the fields
          if (field[0] == 'jsonContent') {
            console.log(field[1]) // This is the json content
            jsonContent = Buffer.from(field[1])
            jsonPath = tempDirectory + '/jsonContent.json'
            ipfsCalls.storeDescriptionToTmp(jsonContent, jsonPath).then(function (result) {
              console.log(result)
            })
          }
        })

        // Add the tmp folder to IPFS and get back a hash
        ipfsCalls.pushTmpFolderToIPFS(tempDirectory).then(function (ipfsHashResult) {
          // externalApiCalls.curlIpfsIo(ipfsHashResult).then(function (tmp) {
          res.status(200).json({
            folderHash: ipfsHashResult
          })
          // })
        })

        fs.readdir(tempDirectory, (err, files) => {
          console.log('These are the files in the directory')
          files.forEach(file => {
            console.log(file)
          })
        })
      })
  form.parse(req)
})

module.exports = router
