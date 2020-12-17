const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
require('dotenv').config()

// Basic Configuration
app.use(bodyParser.urlencoded({extended: false}))
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// Connect to Database
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})

const connection = mongoose.connection
connection.on('error', console.error.bind(console, "connection error"))
connection.once('open', () => {
  console.log("MongoDB database connection established successfully")
})

// Create Model
const Schema = mongoose.Schema
const userSchema = new Schema({
  username: {type: String, required: true}
})
const trackerSchema = new Schema({
  userId: {type: String},
  date: {type: Date},
  duration: {type: Number, required: true},
  description: {type: String, required: true}
})
const User = mongoose.model("User", userSchema)
const Tracker = mongoose.model("Tracker", trackerSchema)

// API Endpoint
app.post('/api/exercise/new-user', async function(req, res) {
  const name = req.body.username
  let findOne = await User.findOne({username: name})
  
  if(findOne) {
    res.send("username already taken")
  } else {
    findOne = new User({username: name})
    await findOne.save((err, data) => {
      if(err) return res.send(err.errors.username.message)
      res.json({_id: data._id, username: data.username})
    })
  }
})

app.get('/api/exercise/users', (req, res) => {
  User.find({}, (err, users) => {
    if(err) return console.log(err)

    const userMap = []
    users.forEach(user => {
      userMap.push(user._id = user)
    })

    res.send(userMap)
  })
})

app.post('/api/exercise/add', async function(req, res) {
  const { userId, description, duration, date } = req.body
  const users = await User.findById(userId, (err, user) => {
    if(err) return res.send(err.message)
    if(!user) return res.send("unknown userId")

    let tracker = new Tracker({
      userId: userId,
      date: date,
      description: description,
      duration: duration
    })
    tracker.save((err, data) => {
      if(err) return res.send(err.errors[err.errors.date ? "date" : err.errors.description ? "description" : "duration"].message)

      res.json({
        _id: user._id,
        username: user.username,
        date: new Date(tracker.date ? tracker.date : Date.now()).toDateString(),
        duration: tracker.duration, description: tracker.description})
    })
  })
})

app.get('/api/exercise/log', (req, res) => {
  const {userId: id, from: dateFrom, to: dateTo, limit: limit} = req.query
  const findOne = User.findById(id, (err, user) => {
    if(err || !user) return res.send("unknown userId")

    const log = []
    const exercise = Tracker.find({userId: id}, (err, data) => {
      if(dateFrom || dateTo) {
        data = data.filter(d => new Date(d.date ? d.date : Date.now()) <= new Date(dateTo) || new Date(d.date ? d.date : Date.now()) >= new Date(dateFrom))
      }

      data.forEach(d => {
        log.push({
          description: d.description,
          duration: d.duration,
          date: new Date(d.date ? d.date : Date.now()).toDateString()
        })
      })

      res.json({
        _id: id,
        username: user.username,
        count: log.length,
        log: log.slice(0, limit)
      })
    })
  })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
