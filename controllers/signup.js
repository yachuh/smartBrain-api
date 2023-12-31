const handleSignup = async (req, res, db, bcrypt) => {
  const { name, email, password } = req.body

  // Check if data is empty
  if (!name || !email || !password) {
    return res.status(200).json({ isSuccess: false, message: 'Incorrect form submissions' })
  }
  // Check if email is registered
  if (db.select('*').from('users').where('email', '=', email)) {
    return res.status(200).json({ isSuccess: false, message: 'Email is already registered.' })
  }

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
}

module.exports = handleSignup
