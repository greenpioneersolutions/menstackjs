import _ from 'lodash'
import auto from 'run-auto'
import crypto from 'crypto'
import passport from 'passport'
import mongoose from 'mongoose'
import mail from '../../mail.js'
import tokenApi from './../../token.js'

export default {postAuthenticate, getAuthenticate, logout, postSignup, putUpdateProfile, putUpdatePassword, deleteDeleteAccount, getReset, postReset, postForgot, getKey, postKey, getKeyReset, checkLoginInformation, createResponseObject}

const User = mongoose.model('users')
const settings = require('../../configs/settings.js').get()

function postAuthenticate (req, res, next) {
  const redirect = req.body.redirect || false
  const token = tokenApi.createKey(req.user)
  res.cookie('token', token)
  return res.status(200).send(createResponseObject(req.user, token, redirect))
}

function getAuthenticate (req, res) {
  const redirect = req.body.redirect || false
  const token = req.headers.authorization || req.query.token || req.body.token || ''// || req.headers['x-access-token']
  if (req.isAuthenticated()) {
    return res.status(200).send(createResponseObject(req.user, tokenApi.createKey(req.user), redirect))
  } else if (token) {
    tokenApi.checkKey(token, (error, user) => {
      if (error) return res.status(200).send(createResponseObject(req.user, '', redirect))
      req.user = user
      return res.status(200).send(createResponseObject(req.user, token, redirect))
    })
  } else {
    return res.status(200).send(createResponseObject(req.user, '', redirect))
  }
}

function logout (req, res) {
  req.logout()
  return res.status(200).send()
}

function postSignup (req, res, next) {
  req.assert('profile', 'Name must not be empty').notEmpty()
  req.assert('email', 'Email is not valid').isEmail()
  req.assert('password', 'Password must be at least 6 characters long').len(6)
  req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password)

  const errors = req.validationErrors()
  const redirect = req.body.redirect || false
  if (errors) {
    return res.status(400).send({
      success: false,
      authenticated: false,
      message: errors[0].message,
      redirect: '/signup'
    })
  }
  const user = new User({
    email: req.body.email,
    password: req.body.password,
    profile: {
      name: req.body.profile.name
    }
  })

  User.findOne({ email: req.body.email }, (error, existingUser) => {
    if (error) {
      return res.status(400).send(error)
    }
    if (existingUser) {
      return res.status(400).send({ message: 'Account with that email address already exists.' })
    }
    user.save(error => {
      if (error && error.code === 11000) {
        return res.status(400).send({ message: 'Account with that email address already exists.' })
      } else if (error && error.name === 'ValidationError') {
        const keys = _.keys(error.errors)
        return res.status(400).send({ message: error.errors[keys[0]].message }) // error.message
      } else if (error) {
        next(error)
      } else {
        req.logIn(user, error => {
          if (error) {
            return next(error)
          } else {
            delete user['password']
            const token = tokenApi.createKey(user)
            res.cookie('token', token)
            return res.status(200).send(createResponseObject(user, token, redirect))
          }
        })
      }
    })
  })
}

function putUpdateProfile (req, res, next) {
  User.findById(req.user.id, (error, user) => {
    if (error) {
      return next(error)
    }
    user = _.assign(user, req.body)
    user.save(error => {
      if (error) {
        return next(error)
      }
      req.user = user
      return res.status(200).send()
    })
  })
}

function putUpdatePassword (req, res, next) {
  req.assert('password', 'Password must be at least 4 characters long').len(4)
  req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password)

  const errors = req.validationErrors()

  if (errors) {
    return res.status(200).send(errors)
  }

  User.findById(req.user.id, (error, user) => {
    if (error) {
      return next(error)
    }
    user.password = req.body.password
    user.save(error => {
      if (error) {
        return next(error)
      }

      res.status(200).send()
    })
  })
}

function deleteDeleteAccount (req, res, next) {
  User.remove({ _id: req.user.id }, error => {
    if (error) {
      return next(error)
    }
    req.logout()
    return res.status(200).send()
  })
}

function getReset (req, res) {
  if (req.isAuthenticated()) {
    return res.status(400).send({
      message: 'Already authenticated',
      valid: false
    })
  } else {
    User
      .findOne({ resetPasswordToken: req.params.token })
      .where('resetPasswordExpires').gt(Date.now())
      .exec((error, user) => {
        if (error) {
          return res.status(400).send(error)
        }
        if (!user) {
          return res.status(400).send({
            message: 'Password reset token is invalid or has expired.',
            valid: false
          })
        }
        res.status(200).send({
          message: 'token is valid',
          valid: true
        })
      })
  }
}

function postReset (req, res, next) {
  req.assert('password', 'Password must be at least 4 characters long.').len(4)
  req.assert('confirmPassword', 'Passwords must match.').equals(req.body.password)
  const errors = req.validationErrors()

  if (errors) {
    return res.status(400).send({message: errors})
  } else {
    auto({
      user (callback) {
        User
          .findOne({ resetPasswordToken: req.params.token })
          .where('resetPasswordExpires').gt(Date.now())
          .exec((error, user) => {
            if (error) {
              return next(error)
            }
            if (!user) {
              return res.status(400).send({message: 'no user found to reset password for. please hit reset password to get another token'})
            }
            user.password = req.body.password
            user.resetPasswordToken = undefined
            user.resetPasswordExpires = undefined
            user.save(error => {
              if (error) {
                return next(error)
              }
              req.logIn(user, error => {
                callback(error, user)
              })
            })
          })
      },
      sendEmail: ['user', (results, callback) => {
        mail.send({
          to: results.user.email,
          subject: settings.email.templates.reset.subject,
          text: settings.email.templates.reset.text(results.user.email)
        }, error => {
          callback(error, true)
        })
      }]
    }, (error, user) => {
      if (error) {
        return next(error)
      }
      delete user.password
      const redirect = req.body.redirect || '/'
      return res.status(200).send(createResponseObject(user, '', redirect))
    })
  }
}

function postForgot (req, res, next) {
  req.assert('email', 'Please enter a valid email address.').isEmail()

  const errors = req.validationErrors()

  if (errors) {
    return res.status(400).send(errors)
  }

  auto({
    token (done) {
      crypto.randomBytes(16, (error, buf) => {
        const token = buf.toString('hex')
        done(error, token)
      })
    },
    user: ['token', (results, callback) => {
      User.findOne({ email: req.body.email.toLowerCase() }, (error, user) => {
        if (error) {
          return res.status(400).send(error)
        }
        if (!user) {
          return res.status(200).send('/forgot')
        }
        user.resetPasswordToken = results.token
        user.resetPasswordExpires = Date.now() + 3600000 // 1 hour
        user.save(error => {
          callback(error, user)
        })
      })
    }],
    sendEmail: ['user', (results, callback) => {
      mail.send({
        to: results.user.email,
        subject: settings.email.templates.forgot.subject,
        text: settings.email.templates.forgot.text(req.headers.host, results.token)
      }, error => {
        callback(error, true)
      })
    }]
  }, error => {
    if (error) {
      return next(error)
    }
    return res.status(200).send({ message: 'Email has been sent' })
  })
}

function getKey (req, res, next) {
  return res.json({token: tokenApi.createKey(req.user)})
}

function postKey (req, res, next) {
  const token = tokenApi.createKey(req.user)
  res.cookie('token', token)
  return res.json({token})
}

function getKeyReset (req, res, next) {
  req.user.apikey = crypto.randomBytes(16).toString('base64')
  req.user.save(error => {
    if (error) return res.status(500).send(error)
    return res.json({token: tokenApi.createKey(req.user)})
  })
}

function checkLoginInformation (req, res, next) {
  const redirect = req.body.redirect || false
  req.assert('email', 'Email is not valid').isEmail()
  req.assert('password', 'Password cannot be blank').notEmpty()
  req.sanitize('email').normalizeEmail({ remove_dots: false })

  const errors = req.validationErrors()
  if (errors) {
    return res.status(401).send({
      success: false,
      authenticated: false,
      message: errors[0].message,
      redirect: '/signin'
    })
  } else {
    passport.authenticate('local', (error, user, info) => {
      if (error) return next(error)
      if (!user) {
        return res.status(400).send({
          success: false,
          authenticated: false,
          message: info.message,
          redirect
        })
      }
      req.logIn(user, error => {
        if (error) return next(error)
        next()
      })
    })(req, res, next)
  }
}

function createResponseObject (user, token, redirect) {
  return {
    success: !!user,
    authenticated: !!user,
    user: user ? {
      profile: user.profile,
      connected: user.connected || {},
      roles: user.roles,
      gravatar: user.gravatar,
      email: user.email,
      _id: user._id
    } : {},
    token,
    redirect: redirect || false
  }
}
