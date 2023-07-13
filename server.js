const express = require('express')
const app = express()
const bcrypt = require('bcrypt-nodejs')
const cors = require('cors')
const knex = require('knex')

const handleSignup = require('./controllers/signup')
const handleLogin = require('./controllers/login')
const handleProfileGet = require('./controllers/profile')
const handleImage = require('./controllers/image')

const db = knex({
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    port: 5432,
    user: 'yachu',
    password: '',
    database: 'smart-brain'
  }
})

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
  db.select('*').from('users')
    .then(users => res.send(users))
})

app.post('/login', (req, res) => { handleLogin(req, res, db, bcrypt) })

app.post('/signup', (req, res) => { handleSignup(req, res, db, bcrypt) })

app.get('/user/:id', (req, res) => { handleProfileGet(req, res, db) })

app.put('/image', (req, res) => { handleImage(req, res, db) })

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`app is running on port ${port}`)
})
