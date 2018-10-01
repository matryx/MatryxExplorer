const express = require('express')
const compression = require('compression')
const app = express()
const morgan = require('morgan')
const bodyParser = require('body-parser')
const cors = require('cors')
require('dotenv').config()

const platformRoutes = require('./api/routes/platform')
const tournamentRoutes = require('./api/routes/tournaments')
const roundRoutes = require('./api/routes/rounds')
const submissionRoutes = require('./api/routes/submissions')
// const activityRoutes = require('./api/routes/activity')
const tokenRoutes = require('./api/routes/token')
const ipfsRoutes = require('./api/routes/ipfs')

const abis = require('./api/helpers/getAbis')

// make sure ABIs loaded before requests
app.use(async (req, res, next) => {
  await abis.loadedAbis
  next()
})

app.use(compression())
app.use(morgan('dev'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())

app.use('/platform', platformRoutes)
app.use('/tournaments', tournamentRoutes)
app.use('/rounds', roundRoutes)
app.use('/submissions', submissionRoutes)
// app.use('/activity', activityRoutes)
app.use('/token', tokenRoutes)
app.use('/ipfs', ipfsRoutes)

console.log('стремиться к победе')

app.get('/', (req, res) => {
  res.send('Somewhere, something incredible is waiting to be known. <br> - Carl Sagan')
})

app.get('/update', async (req, res, next) => {
  try {
    const updated = await abis.attemptUpdate()
    const message = updated ? 'ABIs updated' : 'ABIs already up to date'
    res.status(200).json({ message })
  } catch (err) {
    next({ response: 'ABIs update failed' })
  }
})

// 404 error handling
app.use((req, res, next) => {
  next({ status: 404, response: 'Not Found' })
})

// error handling
app.use((error, req, res, next) => {
  const dev = process.env.NODE_ENV !== 'production'

  console.error(`ERR ${req.originalUrl} - ${error.message || error.response}`)
  // istanbul ignore next
  if (error.stack) console.error(`    ${error.stack}`)

  // istanbul ignore next
  res.status(error.status || 500)

  // istanbul ignore next
  res.json({
    error: {
      message: error.response || 'Something went wrong!',
      error: dev ? error : undefined
    }
  })
})

module.exports = app
