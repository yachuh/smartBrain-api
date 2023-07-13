const handleProfileGet = (req, res, db) => {
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
}

module.exports = handleProfileGet
