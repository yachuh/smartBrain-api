const handleLogin = async (req, res, db, bcrypt) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.json({ isSuccess: false, message: 'Incorrect form submissions' })
  }
  try {
    // Get the hash from login
    const login = await db.select('email', 'hash').from('login').where('email', '=', email)
    const hash = login[0]?.hash
    // Check if email exists
    if (hash === undefined) {
      return res.status(200).json({ isSuccess: false, message: 'Email does not exist.' })
    }
    // Compare hash with user-entered password
    bcrypt.compare(password, hash, async function (err, isValid) {
      if (isValid) {
        try {
          const user = await db.select('*').from('users').where('email', '=', email)
          return res.json({ isSuccess: true, user: user[0] })
        } catch (error) {
          res.status(200).json({ isSuccess: false, message: 'Unable to get user' })
        }
      } else {
        res.status(200).json({ isSuccess: false, message: err || 'Invalid email or password.' })
      }
    })
  } catch (error) {
    console.log(error)
    res.status(400).json({ isSuccess: false, message: 'Unable to login' })
  }
}

module.exports = handleLogin
