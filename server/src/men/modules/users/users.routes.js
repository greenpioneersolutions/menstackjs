import user from './users.controller.js';

module.exports = (app, auth, mail, settings, models, logger) => {
  app.post('/api/user/authenticate', user.checkLoginInformation, user.postAuthenticate)
  app.get('/api/user/authenticate', user.getAuthenticate)
  app.post('/api/user/logout', user.logout)
  app.post('/api/user/forgot', user.postForgot)
  app.get('/api/user/reset/:token', user.getReset)
  app.post('/api/user/reset/:token', user.postReset)
  app.post('/api/user/signup', user.postSignup)
  app.put('/api/user/profile', auth.isAuthenticated, user.putUpdateProfile)
  app.put('/api/user/password', auth.isAuthenticated, user.putUpdatePassword)
  app.delete('/api/user/delete', auth.isAuthenticated, user.deleteDeleteAccount)
  app.get('/api/user/token', auth.isAuthenticated, user.getKey)
  app.post('/api/user/token', user.checkLoginInformation, user.postKey)
  app.get('/api/user/token/reset', auth.isAuthenticated, user.getKeyReset)
};
