const jwt = require('jsonwebtoken')



const verifyToken = (req, res, next) => {
  try {

    let token = req.headers.authorization?.split(' ')[1]

    if (token) {
      const decodedUser = jwt.verify(token, process.env.SECRET_KEY);
      if (decodedUser) {
        req.user = decodedUser
        req.user.role = "user"
        next()
      } else {
        return res.send({ message: "invalid token" })
      }
    } else {
      res.status(401).send({
        message: "Authentication headers required"
      })
    }

  } catch (error) {
    res.status(500).send({
      message: error.message
    })
  }
}

const admin = (req, res, next) => {
  try {

    let token = req.headers.authorization?.split(' ')[1]

    if (token) {
      const decodedUser = jwt.verify(token, process.env.SECRET_KEY);
      if (decodedUser) {
        console.log(decodedUser);
        if (decodedUser.id === process.env.ADMIN_ID) {
          req.user = decodedUser
          req.user.role = "admin"
          next()
        } else {
          res.status(401).send({ message: "You are not admin" })
        }
      } else {
        return res.status(401).send({ message: "invalid token" })
      }
    } else {
      res.send({
        message: "Authentication headers required"
      })
    }
  } catch (error) {
    res.status(500).send({
      message: error.message
    })
  }
}


module.exports = {
  verifyToken,
  admin
}