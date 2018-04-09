const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

module.exports = { createKey, checkKey }

const User = mongoose.model('users')
const settings = require('../configs/settings').get()

function createKey (user, apikey) {
  return jwt.sign({
    _id: user._id
  }, apikey || user.apikey, settings.jwt.options)
}

function checkKey (token, cb) {
  const decoded = jwt.decode(token, {complete: true})
  let errorResponse = {message: ''}
  if (!decoded) errorResponse.message = 'Nothing to decode'
  if (!decoded.payload) errorResponse.message = 'No payload to decode'
  if (!decoded.payload._id) errorResponse.message = 'No user id was found in decode'
  if (errorResponse.message) return cb(errorResponse)
  User.findOne({
    _id: decoded.payload._id
  }, (error, user) => {
    if (error) cb(error)
    if (!user) {
      errorResponse.message = 'Authentication failed. User not found.'
      return cb(errorResponse)
    } else {
      jwt.verify(token, user.apikey, (error, decoded) => {
        if (error) {
          switch (error.name) {
            case 'TokenExpiredError':
              errorResponse.message = 'It appears your token has expired'
              return cb(errorResponse)
            case 'JsonWebTokenError':
              errorResponse.message = `It appears you have invalid signature Token Recieved:${token}`
              return cb(errorResponse)
          }
        } else {
          return cb(null, user)
        }
      })
    }
  })
}
