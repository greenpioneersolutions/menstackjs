module.exports = routes
var ejs = require('ejs')
var path = require('path')

function nothingFoundHandler (msg) {
  return function (req, res) {
    res.status(400).send({
      error: msg
    })
  }
}

function routes (self) {
    // {
  //   app: self.app,
  //   settings: self.settings,
  //   middleware: self.middleware,
  //   environment: self.environment
  // }
  // Dynamic Routes / Manually enabling them . You can change it back to automatic in the settings
  // build.routing(app, mongoose) - if reverting back to automatic

  // self.app.use(self.build.responseMiddleware({mongoose: mongoose}))
  // self.build.routing({
  //   mongoose: mongoose,
  //   remove: ['users'],
  //   middleware: {
  //     auth: [self.middleware.verify, self.middleware.isAuthenticated]
  //   }
  // }, function (error, data) {
  //   if (error) console.log(error)
  //   _.forEach(data, function (m) {
  //     debug('Route Built by NPM buildreq:', m.route)
  //     self.app.use(m.route, m.app)
  //   })
  // })
  self.app.get('/api/*', nothingFoundHandler('nothing found in api'))
  self.app.get('/*', function (req, res) {
    ejs.renderFile(path.join(__dirname, './layout/index.html'), {}, {
      cache: true
    }, function (err, str) {
      if (err)console.log(err)
      res.send(str)
    })
  })
}
