const passUserToView = (req, res, next) => {
  res.locals.user = req.session.user
  console.log('res.locals.user:', req.session.user)
  next()
}

export default passUserToView