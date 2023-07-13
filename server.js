const express = require('express')
const app = express()
const bcrypt = require('bcrypt-nodejs')
const cors = require('cors')
const knex = require('knex')
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
    .then(users => {
      res.send(users)
    })
})

app.post('/login', async (req, res) => {
  const { email, password } = req.body
  try {
    // Get the hash from login
    const login = await db.select('email', 'hash').from('login').where('email', '=', email)
    const hash = login[0].hash
    // Compare hash with user-entered password
    bcrypt.compare(password, hash, async function (err, isValid) {
      if (isValid) {
        try {
          const user = await db.select('*').from('users').where('email', '=', email)
          return res.json({ isSuccess: true, user: user[0] })
        } catch (error) {
          res.status(400).json({ isSuccess: false, message: 'Unable to get user' })
        }
      } else {
        res.status(400).json({ isSuccess: false, message: err || 'Invalid password' })
      }
    })
  } catch (error) {
    console.log(error)
    res.status(400).json({ isSuccess: false, message: 'Unable to get login' })
  }
})

app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body
  // Get the hashed password
  const hash = await bcrypt.hashSync(password)
  // Start Transaction
  db.transaction(trx => {
    // Insert into login table
    trx.insert({
      hash,
      email
    })
      .into('login')
      .returning('email')
      // Insert into users table
      .then(loginEmail => {
        return db('users')
          .returning('*')
          .insert({
            email: loginEmail[0].email,
            name,
            joined: new Date()
          })
          // Sending Response
          .then(user => {
            res.status(200).json({
              isSuccess: true,
              data: user[0]
            })
          })
      })
      .then(trx.commit)
      .catch(trx.rollback)
  })
    .catch(err => {
      console.log(err)
      res.status(400).json({ isSuccess: false, message: 'Unable to register' })
    })
})

app.get('/user/:id', (req, res) => {
  const { id } = req.params
  db.select('*').from('users').where({ id })
    .then(user => {
      user.length // check if user exists
        ? res.json({ isSuccess: true, data: user[0] })
        : res.status(400).json({ isSuccess: false, message: 'User not found' })
    })
    .catch(err => {
      console.log(err)
      res.status(400).json({ isSuccess: false, message: 'Error getting user' })
    })
})

app.put('/image', (req, res) => {
  const { id } = req.body
  db('users')
    .where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
      res.json(entries[0].entries)
    })
    .catch(err => {
      console.log(err)
      res.status(400).json({ isSuccess: false, message: 'unable to get entries' })
    })
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`app is running on port ${port}`)
})
