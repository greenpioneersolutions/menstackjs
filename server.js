module.exports = Men

var _ = require('lodash')
var auto = require('run-auto')
var auth = require('./server/passport.js')
var bodyParser = require('body-parser')
var compress = require('compression')
var cookieParser = require('cookie-parser')
var cors = require('cors')
var ejs = require('ejs')
var express = require('express')
var expressValidator = require('express-validator')
var fs = require('fs')
var helmet = require('helmet')
var https = require('https')
var logger = require('morgan')
var mongoose = require('mongoose')
var methodOverride = require('method-override')
var passport = require('passport')
var path = require('path')
var session = require('express-session')
var MongoStore = require('connect-mongo')(session)

function Men (opts, done) {
  var self = this
  self.opts = opts
  self.app = express()
  self.environment = require('./configs/environment.js').get()
  self.settings = require('./configs/settings.js').get()
  self.port = self.settings.http.port
  self.middleware = require('./server/middleware.js')
  self.mail = require('./server/mail.js')
  self.dir = __dirname
  // Start of the build process
  // setupExpressConfigs > Used to set up expressjs initially, middleware & passport.
  self.setupExpressConfigs()
  // setupExpressErrorHandler > Used to set up our customer error handler in the server folder.
  self.setupExpressErrorHandler()
  // setupExpressSecurity > Used to set up helmet, hpp, cors & content length.
  self.setupExpressSecurity()
  // setupExpressHeaders > Used to set up the headers that go out on every route.
  self.setupExpressHeaders()
  // setupExpressLogger > Used to set up our morgan logger & debug statements on all routes.
  self.setupExpressLogger()
  // setupServerModels > Used to set up all mongoose models.
  self.setupServerModels()
  // setupToolSwagger - *** OPTIONAL *** >  Used to set up swagger.io to represent the api with a nice ui. http://localhost:3000/api/
  self.setupToolSwagger()
  // setupServerRoutes > Used to set up all module routes.
  self.setupServerRoutes()
  // setupStaticRoutes > Used to set up all system static routes including the main '/*' route with ejs templating.
  self.setupStaticRoutes()
  // auto  - connectMongoDb :  server > Used to finsh the final set up of the server. at the same time we start connecting to mongo and turning on the server.
  auto({
    connectMongoDb: function (callback) {
      mongoose.Promise = Promise
      mongoose.set('debug', self.settings.mongodb.debug)
      mongoose.connect(self.settings.mongodb.uri, self.settings.mongodb.options)
      mongoose.connection.on('error', function (err) {
        console.log('MongoDB Connection Error. Please make sure that MongoDB is running.')
        callback(err, null)
      })
      mongoose.connection.on('open', function () {
        callback(null, {
          db: self.settings.mongodb.uri,
          dbOptions: self.settings.mongodb.options
        })
      })
    },
    server: function (callback) {
      if (self.settings.https.active) {
        https.createServer({
          key: fs.readFileSync(self.settings.https.key),
          cert: fs.readFileSync(self.settings.https.cert)
        }, self.app).listen(self.settings.https.port, function () {
          console.log('HTTPS Express server listening on port %d in %s mode', self.settings.https.port, self.app.get('env'))
          if (!self.settings.http.active)callback(null, true)
        })
      }
      // OR - check if you set both to false we default to turn on http
      if (self.settings.http.active || (self.settings.https.active === false) === (self.settings.http.active === false)) {
        self.app.listen(self.app.get('port'), function () {
          console.log('HTTP Express server listening on port %d in %s mode', self.app.get('port'), self.app.get('env'))
          callback(null, true)
        })
      }
    }
  },
    function (err, results) {
      if (!done)done = function () {}
      done(err)
    })
}

Men.prototype.setupExpressConfigs = function () {
  var self = this
  self.app.set('port', self.port)
  self.app.use(compress())
  self.app.use(bodyParser.json(self.settings.bodyparser.json))
  self.app.use(bodyParser.urlencoded(self.settings.bodyparser.urlencoded))
  self.app.use(expressValidator(self.settings.expresValidator))
  self.app.use(methodOverride())
  self.app.use(cookieParser())
  self.app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: self.settings.sessionSecret,
    store: new MongoStore({
      url: self.settings.mongodb.uri,
      autoReconnect: true
    })
  }))
  self.app.use(passport.initialize())
  self.app.use(passport.session())
  passport.serializeUser(auth.serializeUser)
  passport.deserializeUser(auth.deserializeUser)
  passport.use(auth.passportStrategy)
}
Men.prototype.setupExpressErrorHandler = function () {
  var self = this
  require('./server/error.js')(self)
}
Men.prototype.setupExpressSecurity = function () {
  var self = this
  self.app.use(helmet(self.settings.bodyparser.helmet))
}
Men.prototype.setupExpressHeaders = function () {
  var self = this
  self.app.use(cors())
}
Men.prototype.setupExpressLogger = function () {
  var self = this
  if (self.settings.logger)self.app.use(logger(self.settings.logger))
}
Men.prototype.setupServerModels = function () {
  var self = this
  self.models = {}
  self.models.blog = mongoose.model('blog', require('./server/modules/blog/blog.model.js'))
  self.models.users = mongoose.model('users', require('./server/modules/users/users.model.js'))
}
Men.prototype.setupServerRoutes = function () {
  var self = this
  // BUILDREQ - Query Parser , Route Builder & Response Builder
  self.build = require('buildreq')(self.settings.buildreq)
  // self.app.use(self.build.queryMiddleware())
  self.app.use(self.build.queryMiddleware({mongoose: mongoose}))
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

  require('./server/modules/users/users.routes.js')(self.app, self.middleware, self.mail, self.settings)
  require('./server/modules/blog/blog.routes.js')(self.app, self.middleware, self.mail, self.settings)
}
Men.prototype.setupToolSwagger = function () {
  var self = this
  function handleIndex (req, res, next) {
    if (req.url !== '/' && req.url !== '/index.html') {
      return next()
    }
    if (req.originalUrl === '/api') {
      return res.redirect(301, '/api' + '/')
    }
    if (html) {
      return res.send(html)
    }
    fs.readFile(swaggerUI.dist + '/index.html', {
      encoding: 'utf8'
    }, function (err, data) {
      if (err) {
        console.error(err)
        return res.send(500)
      }
      html = data.replace('http://petstore.swagger.io/v2/swagger.json', '/api-docs')
      res.send(html)
    })
  }
  if (self.settings.swagger) {
    var Swagger = require('swagger-node-express')
    var swaggerUI = require('swagger-ui')
    self.app.use('/api' + '/index.html', handleIndex)
    self.app.use('/api' + '/', handleIndex)
    self.app.use('/api', express.static(swaggerUI.dist))
    var html

    var swagger = Swagger.createNew(self.app)

    var paramTypes = swagger.paramTypes
    var sortParm = paramTypes.query('sort', 'Comma seperated list of params to sort by.  (e.g "-created,name") ', 'string')
    var limitParm = paramTypes.query('limit', 'Number of items to return', 'number')
    var skipParm = paramTypes.query('skip', 'Number of items to skip', 'number')

    var defaultGetParams = [
      sortParm,
      limitParm,
      skipParm
    ]

    var swaggerPath = path.resolve(self.dir, './server/swagger')
    if (!fs.existsSync(swaggerPath)) {
      throw new Error('Critical Folder Missing:')
    }
    var swaggerDir = _.filter(fs.readdirSync(swaggerPath), function (n) {
      return !_.startsWith(n, '.')
    })
    _.forEach(swaggerDir, function (n) {
      var model = require(path.join(self.dir, '/server/swagger/', n, '/models'))
      swagger.addModels(model)
      require(path.join(self.dir, '/server/swagger/', n, '/services'))
        .load(swagger, {
          searchableOptions: defaultGetParams
        })
    })
    swagger.configureSwaggerPaths('', '/api-docs', '')
    swagger.configureDeclaration('Meanstackjs', {
      description: 'Meanstackjs API',
      authorizations: [''],
      produces: ['application/json']
    })
    swagger.setApiInfo({
      title: 'Meanstackjs',
      description: 'Meanstackjs API',
      termsOfServiceUrl: 'http://meanstackjs.com',
      contact: 'info@meanstackjs.com',
      licenseUrl: 'http://en.wikipedia.org/wiki/MIT_License'
    })
    swagger.setAuthorizations({
      apiKey: {
        type: 'apiKey',
        passAs: 'header'
      }
    })
    swagger.configure('/api', '1.0')
  }
}
Men.prototype.setupStaticRoutes = function () {
  var self = this
  self.app.use(express.static(path.join(__dirname, './client/'), {
    maxAge: 31557600000
  }))
  self.app.get('/api/*', function (req, res) {
    res.status(400).send({
      error: 'nothing found in api'
    })
  })
  // Primary app routes
  self.app.get('/*', function (req, res, next) {
    if (_.isUndefined(req.user)) {
      req.user = {}
      req.user.authenticated = false
    } else {
      req.user.authenticated = true
    }
    var html = self.settings.html

    ejs.renderFile(path.join(__dirname, './server/layout/index.html'), {
      html: html,
      assets: self.app.locals.frontendFilesFinal,
      environment: self.environment
    }, {
      cache: true
    }, function (err, str) {
      if (err) next(err)
      res.send(str)
    })
  })
}

if (!module.parent) {
  var server = new Men({}, function (err) {
    if (err) {
      console.error('Error during ' + server.settings.title + ' startup. Abort.')
      console.error(err)
      process.exit(1)
    }
  })
}
