const handleLogin = async (req, res, db, bcrypt) => {
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
}

module.exports = handleLogin
