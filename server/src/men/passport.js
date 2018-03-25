
import {Strategy as LocalStrategy} from 'passport-local';

import mongoose from 'mongoose';
const User = mongoose.model('users');

function serializeUser (user, done) {
  // Passport serialize user function.
  process.nextTick(() => {
    done(null, user.id)
  })
}

function deserializeUser (id, done) {
  // Passport deserialize user function.
  User.findOne({
    _id: id
  }, '-password', (error, user) => {
    done(error, user)
  })
}

const localStrategy = new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
  // Sign in using Email and Password.
  email = email.toLowerCase()
  User.findOne({
    email
  }, (error, user) => {
    if (error) {
      return done(error)
    }
    if (!user) {
      return done(null, false, {
        message: `Email ${email} not found`
      })
    }
    user.comparePassword(password, (error, isMatch) => {
      if (error) {
        return done(error)
      }
      if (isMatch) {
        return done(null, user)
      } else {
        return done(null, false, { message: 'Invalid email or password.' })
      }
    })
  })
});
export default { localStrategy,serializeUser,deserializeUser }