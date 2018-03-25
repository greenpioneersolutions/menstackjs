export {createKey, checkKey}
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
const User = mongoose.model('users');
const settings = require('./configs/settings').get();

function createKey (user, apikey) {
  return jwt.sign({
    _id: user._id
  }, apikey || user.apikey, settings.jwt.options)
}

function checkKey (token, cb) {
  const decoded = jwt.decode(token, {complete: true});
  if (!decoded) return cb({message: 'Nothing to decode'})
  if (!decoded.payload) return cb({message: 'No payload to decode'})
  if (!decoded.payload._id) return cb({message: 'No user id was found in decode'})
  User.findOne({
    _id: decoded.payload._id
  }, (error, user) => {
    if (error) cb(error)
    if (!user) {
      cb({message: 'Authentication failed. User not found.'})
    } else {
      jwt.verify(token, user.apikey, (error, decoded) => {
        if (error) {
          switch (error.name) {
            case 'TokenExpiredError':
              cb({message: 'It appears your token has expired'}) // Date(error.expiredAt)
              break
            case 'JsonWebTokenError':
              cb({message: `It appears you have invalid signature Token Recieved:${token}`})
              break
          }
        } else {
          cb(null, user)
        }
      })
    }
  })
}