import auth from './passport.js'
import passport from 'passport'
import session from 'express-session'
const MongoStore = require('connect-mongo')(session)

function authentication (self) {
  self.app.use(session({
    name: self.settings.sessionName,
    resave: true,
    saveUninitialized: true,
    secret: self.settings.sessionSecret || 'mean',
    store: new MongoStore({
      url: self.settings.mongodb.uri,
      autoReconnect: true
    })
  }))
  self.app.use(passport.initialize())
  self.app.use(passport.session())
  passport.serializeUser(auth.serializeUser)
  passport.deserializeUser(auth.deserializeUser)
  // Local Strategy
  passport.use(auth.localStrategy)
  // Azure Strategy
  // passport.use(auth.passportAzureStrategy)
  // Instagram Strategy
  // passport.use(auth.passportInstagramStrategy)
  // Facebook Strategy
  // passport.use(auth.passportFacebookStrategy)
  // Twitter Strategy
  // passport.use(auth.passportTwitterStrategy)
  // GitHub Strategy
  // passport.use(auth.passportGitHubStrategy)
  // Google Strategy
  // passport.use(auth.passportGoogleStrategy)
  // LinkedIn Strategy
  // passport.use(auth.passportLinkedInStrategy)
  // OpenID Strategy
  // passport.use(auth.passportOpenIDStrategy)
}
export {authentication}
