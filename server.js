const express = require('express')
const app = express()
const bcrypt = require('bcrypt-nodejs')
const { v4: uuidv4 } = require('uuid')
const cors = require('cors')

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors())

const database = {
  users: [
    {
      id: '123',
      name: 'John',
      email: 'john@gmail.com',
      password: 'cookies',
      entries: 0,
      joinedAt: new Date()
    },
    {
      id: '456',
      name: 'Sally',
      email: 'sally@gmail.com',
      // password: 'bananas',
      entries: 0,
      joinedAt: new Date()
    }
  ],
  logins: [
    {
      id: '123',
      hash: '',
      email: 'john@gmail.com'
    },
    {
      id: '456',
      hash: '',
      email: 'sally@gmail.com'
    }
  ]
}

app.get('/', (req, res) => {
  res.send(database.users)
})

app.post('/login', (req, res) => {
  // const found = false
  // database.logins.forEach(user => {
  //   const { email, hash } = user
  //   bcrypt.compare(req.body.password, hash, () => {

  //   })
  //   if (req.body.email === email &&
  //     req.body.password === hash) {
  //     found = true
  //     console.log('req:::', req.body)
  //     console.log('database:::', email, password)
  //     return res.json('success')
  //   }
  // })
  // if (!found) {
  //   res.status(400).json('wrong username or password')
  // }
  if (req.body.email === database.users[0].email &&
     req.body.password === database.users[0].password) {
    res.json({
      isSuccess: true,
      user: database.users[0]
    })
  } else {
    res.status(200).json({
      isSuccess: false,
      message: 'Login falied!'
    })
  }
})

app.post('/signup', (req, res) => {
  const { name, email, password } = req.body

  // 檢查 email 是否已經註冊
  database.users.forEach(user => {
    if (user.email === email) {
      return res.status(400).json({
        isSuccess: false,
        message: '此 email 已經註冊'
      })
    }
  })

  let hashedPassword = ''
  bcrypt.hash(password, null, null, function (err, hash) {
    hashedPassword = hash
  })

  const id = uuidv4()

  const user = {
    id,
    name,
    email,
    entries: 0,
    joinedAt: new Date()
  }
  database.users.push(user)

  const login = {
    id,
    email,
    hash: hashedPassword
  }
  database.logins.push(login)

  res.status(200).json({
    isSuccess: true,
    data: database.users[database.users.length - 1]
  })
})

app.get('/user/:id', (req, res) => {
  const { id } = req.params
  let found = false
  database.users.forEach(user => {
    if (user.id === id) {
      found = true
      return res.json(user)
    }
  })
  if (!found) {
    res.status(404).json('no such user')
  }
})

app.put('/image', (req, res) => {
  const { id } = req.body
  let found = false
  database.users.forEach(user => {
    if (user.id === id) {
      found = true
      user.entries++
      return res.json(user.entries)
    }
  })
  if (!found) {
    res.status(404).json('no such user')
  }
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`app is running on port ${port}`)
})
