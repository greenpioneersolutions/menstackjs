import crypto from 'crypto';
import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    lowercase: true,
    required: 'We need an email address to create your account.'
  },
  password: {
    type: String,
    required: true
  },
  tokens: {
    type: Array
  },
  roles: {
    type: Array,
    default: []
  },
  profile: {
    name: {
      type: String,
      index: true,
      required: 'We need a name to create your account.'
    },
    gender: {
      type: String,
      default: ''
    },
    location: {
      type: String,
      default: ''
    },
    website: {
      type: String,
      default: ''
    },
    picture: {
      type: String,
      default: ''
    }
  },
  lastLoggedIn: {
    type: Date,
    default: Date.now
  },
  salt: {
    type: String
  },
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  },
  apikey: {
    type: String,
    default: crypto.randomBytes(16).toString('base64')
  },
  type: {
    type: String,
    default: 'user' // Service Accounts later
  }
});
userSchema.pre('save', function (next) {
  // Password hash middleware.
  const user = this
  user.wasNew = user.isNew // for post-save
  if (!user.isModified('password')) {
    return next()
  } else {
    user.salt = new Buffer(crypto.randomBytes(16).toString('base64'),'base64')
    user.password = crypto.pbkdf2Sync(password, this.salt, 10000, 64).toString('base64')
    next()
  }
})

userSchema.methods.comparePassword = function (userPassword, cb) {
  // Helper method for validating user's password.
  const user = this;
  tempPassword = crypto.pbkdf2Sync(userPassword, user.salt, 10000, 64).toString('base64')
  if(tempPassword === user.password){
    user.lastLoggedIn = Date.now()
    user.save(error => {
      if (error) self.logger.warn(error)
    })
    cb(null, true)
  }else {
    cb(null, false)
  }
  // bcrypt.compare(candidatePassword, this.password, (error, res) => {
  //   if (res) {
  //     user.lastLoggedIn = Date.now()
  //     user.save(error => {
  //       if (error) self.logger.warn(error)
  //     })
  //   }
  //   cb(error, res)
  // })
}
userSchema.set('toObject', {
  virtuals: true,
  getters: true
})
userSchema.set('toJSON', {
  virtuals: true
})
userSchema.virtual('gravatar').get(function () {
  if (!this.email) {
    return 'https://gravatar.com/avatar/?s=200&d=retro'
  }
  const md5 = crypto.createHash('md5').update(this.email).digest('hex');
  return `https://gravatar.com/avatar/${md5}?s=200&d=retro`
})
userSchema.virtual('firstName').get(function () {
  return this.profile.name.split(' ')[0]
})
userSchema.virtual('lastName').get(function () {
  return this.profile.name.split(' ').slice(1).join(' ')
})
userSchema.pre('validate', function (next) {
  // Trim whitespace
  const self = this;
  if (typeof self.email === 'string') {
    self.email = self.email.trim()
  }
  if (typeof self.profile.name === 'string') self.profile.name = self.profile.name.trim()
  next()
})

export default userSchema;
