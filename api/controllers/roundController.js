
/*
The Matryx submission controller

authors - sam@nanome.ai
Nanome 2018
*/

/*
Imports
*/
const ipfsCalls = require('./gateway/ipfsCalls')

const MatryxTournament = require('../contracts/MatryxTournament')
const MatryxRound = require('../contracts/MatryxRound')
const MatryxSubmission = require('../contracts/MatryxSubmission')

let abis
require('../helpers/getAbis').then(a => abis = a)

let roundController = {}

roundController.getSubmissionsFromRound = async (roundAddress) => {
  const Round = new MatryxRound(roundAddress, abis.round.abi)

  let response = {
    roundStatus: '',
    submissions: []
  }

  let status = await Round.getState()
  response.roundStatus = status

  // istanbul ignore next
  if (['notYetOpen', 'notFunded', 'isOpen', 'inReview', 'hasWinners'].includes(status)) return response

  if ([/* 'hasWinners', */'isClosed', 'isAbandoned'].includes(status)) {
    let [winners, addresses] = await Promise.all([
      Round.getWinningSubmissionAddresses(),
      Round.getSubmissions()
    ])

    let submissionPromises = addresses.map(address => (async () => {
      const Submission = new MatryxSubmission(address, abis.submission.abi)

      let winner = winners.includes(address)

      let [title, owner, timeSubmitted, reward] = await Promise.all([
        Submission.getTitle(),
        Submission.getOwner(),
        Submission.getTimeSubmitted(),
        Submission.getTotalWinnings()
      ])

      return { address, title, owner, timeSubmitted, winner, reward }
    })())

    response.submissions = await Promise.all(submissionPromises)
    return response
  }
}

roundController.getRoundDetails = async function (roundAddress) {
  const Round = new MatryxRound(roundAddress, abis.round.abi)

  let data = await Promise.all([
    Round.getTournament(),
    Round.getData(),
    roundController.getSubmissionsFromRound(roundAddress)
  ])

  const [tournamentAddress, roundDetails, submissionsFromRound] = data
  const { roundStatus, submissions } = submissionsFromRound

  const Tournament = new MatryxTournament(tournamentAddress, abis.tournament.abi)

  data = await Promise.all([
    Tournament.getTitle(),
    Tournament.getDescriptionHash()
  ])
  const [tournamentTitle, descriptionHash] = data

  const tournamentDescription = await ipfsCalls.getIpfsFile(descriptionHash)

  return {
    tournamentAddress,
    tournamentTitle,
    tournamentDescription,
    ...roundDetails,
    roundStatus,
    submissions
  }
}
module.exports = roundController
