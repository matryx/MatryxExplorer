/**
 * submissions.js
 * /submissions routes for getting Submission info
 *
 * Authors sam@nanome.ai dev@nanome.ai
 * Copyright (c) 2018, Nanome Inc
 * Licensed under ISC. See LICENSE.md in project root.
 */

const express = require('express')
const router = express.Router()

const submissionController = require('../controllers/submissionController')
const { errorHelper, validateSubmission } = require('../helpers/responseHelpers')

const abis = require('../helpers/getAbis')

// Return a message showing this endpoint series handles submission requests
router.get('/', (req, res, next) => {
  res.status(200).json({
    message: 'handling GET requests to /submissions'
  })
})

router.get('/getAbi', (req, res, next) => {
  res.status(200).json(abis.submission)
})

// Return the submission details for a specific submission address
router.get('/address/:submissionAddress', async (req, res, next) => {
  const { submissionAddress } = req.params
  if (!await validateSubmission(next, submissionAddress)) return

  submissionController
    .getSubmissionByAddress(submissionAddress)
    .then(submission => res.status(200).json({ submission }))
    .catch(errorHelper(next, `Error getting Submission ${submissionAddress}`))
})

// Return the submission owner/author for a specific submission address
router.get('/address/:submissionAddress/owner', async (req, res, next) => {
  const { submissionAddress } = req.params
  if (!await validateSubmission(next, submissionAddress)) return

  submissionController
    .getSubmissionOwnerByAddress(submissionAddress)
    .then(owner => res.status(200).json({ owner }))
    .catch(errorHelper(next, `Error getting Submission ${submissionAddress} owner`))
})

module.exports = router
