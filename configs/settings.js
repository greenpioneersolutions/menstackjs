require('dotenv').config({silent: true})

var path = require('path')
var _ = require('lodash')
var environment = require('./environment.js').get()
var baseLine = {
  app: {
    name: process.env.APP_NAME || 'MenStackJS'
  },
  cache: {
    maxAge: 0,
    headers: true
  },
  security: {
    cors: {
      active: true,
      options: {
        // origin: function (origin, callback) {
        //   var originIsWhitelisted = ['http://localhost:3000', 'localhost:3000'].indexOf(origin) !== -1
        //   callback(null, originIsWhitelisted)
        // }
      },
      preflight: true
    },
    contentLength: {
      active: true,
      options: {
        max: 99999,
        status: 400,
        message: 'Please make a small payload'
      }
    },
    helmet: {
      active: true,
      options: {}
    },
    hpp: {
      active: true,
      options: {}
    },
    contentSecurityPolicy: {
      active: false,
      options: {}
    },
    hpkp: {
      active: false,
      options: {}
    },
    throttler: {
      active: false,
      options: {}
    }
  },
  minify: 'default',
  render: {
    cli: 'lodash', // __ or ejs or lodash.
    seo: 'lodash', // ejs or lodash. default is lodash
    lodash: {
      options: {} // https://lodash.com/docs#template
    },
    ejs: {
      options: {} // https://www.npmjs.com/package/ejs#options
    }
  },
  env: environment,
  // Root path of server
  root: path.join(__dirname, '/../../..'),
  // Server IP
  ip: process.env.IP || '0.0.0.0',
  hostname: process.env.HOST || process.env.HOSTNAME || 'localhost',
  // Enable Swagger.io at localhost:[port]/api/
  swagger: true,
  // Enable the use of babel for ES6
  babel: {
    options: {
      // NOTE you must install the proper package to use here
      presets: [
        'babel-preset-es2015'
      ],
      plugins: [
        'transform-class-properties'
      ]
    },
    folder: 'dist',
    active: false
  },
  // Plato
  plato: {
    title: 'men stack',
    eslint: {
      lastsemic: true,
      asi: true
    }
  },
  // JWT Object https://github.com/auth0/node-jsonwebtoken
  jwt: {
    // is used to compute a JWT SIGN
    secret: 'MENSTACKJS',
    options: {
      expiresIn: 60 * 120 // 60 seconds * 120  = 2 hours
    }
  },
  // is used to compute a session hash
  sessionSecret: 'MENSTACKJS',
  // The name of the MongoDB collection to store sessions in
  sessionCollection: 'sessions',
  // The session cookie settings
  sessionCookie: {
    path: '/',
    httpOnly: true,
    // If secure is set to true then it will cause the cookie to be set
    // only when SSL-enabled (HTTPS) is used, and otherwise it won't
    // set a cookie. 'true' is recommended yet it requires the above
    // mentioned pre-requisite.
    secure: false,
    // Only set the maxAge to null if the cookie shouldn't be expired
    // at all. The cookie will expunge when the browser is closed.
    maxAge: null
  },
  sessionName: 'session.id',
  // Supports MAX CDN
  maxcdn: {
    companyAlias: process.env.MAXCDN_COMPANY_ALIAS || '',
    consumerKey: process.env.MAXCDN_CONSUMER_KEY || '',
    consumerSecret: process.env.MAXCDN_CONSUMER_SECRET || ''
  },
  // SEO - Default html setup
  googleAnalytics: process.env.GOOGLE_ANALYTICS || 'UA-71654331-1',
  seo: require('./seo.js'),
  bodyparser: {
    json: {limit: '100kb'},
    urlencoded: {limit: '100kb', extended: true}
  },
  expresValidator: {
    customValidators: {
      isArray: function (value) {
        // req.assert('param', 'Invalid Param').isArray()
        return _.isObject(value)
      },
      isObject: function (value) {
        // req.assert('param', 'Invalid Param').isObject()
        return _.isObject(value)
      },
      isString: function (value) {
        // req.assert('param', 'Invalid Param').isString()
        return _.isString(value)
      },
      isRegExp: function (value) {
        // req.assert('param', 'Invalid Param').isRegExp()
        return _.isRegExp(value)
      },
      isEmpty: function (value) {
        // req.assert('param', 'Invalid Param').isEmpty()
        return _.isEmpty(value)
      },
      gte: function (param, num) {
        // req.assert('param', 'Invalid Param').gte(5)
        return _.gte(param, num)
      },
      lte: function (param, num) {
        // req.assert('param', 'Invalid Param').lte(5)
        return _.lte(param, num)
      },
      gt: function (param, num) {
        // req.assert('param', 'Invalid Param').gt(5)
        return _.gt(param, num)
      },
      lt: function (param, num) {
        // req.assert('param', 'Invalid Param').lt(5)
        return _.lt(param, num)
      }
    },
    customSanitizers: {
      toArray: function (value) {
        // req.sanitize('postparam').toArray()
        return _.toArray(value)
      },
      toFinite: function (value) {
        // req.sanitize('postparam').toFinite()
        return _.toFinite(value)
      },
      toLength: function (value) {
        // req.sanitize('postparam').toLength()
        return _.toLength(value)
      },
      toPlainObject: function (value) {
        // req.sanitize('postparam').toPlainObject()
        return _.toPlainObject(value)
      },
      toString: function (value) {
        // req.sanitize('postparam').toString()
        return _.toString(value)
      }
    },
    errorFormatter: function (param, message, value) {
      var namespace = param.split('.')
      var root = namespace.shift()
      var formParam = root

      while (namespace.length) {
        formParam += '[' + namespace.shift() + ']'
      }
      return {
        param: formParam,
        message: message,
        value: value
      }
    }
  },
  buildreq: {
    console: true,
    response: {
      method: 'get',
      data: {},
      user: {},
      count: 0,
      hostname: '',
      type: '',
      actions: {
        prev: false,
        next: false,
        reload: false
      },
      delete: ['error']
    },
    query: {
      sort: '',
      limit: 20,
      select: '',
      filter: {},
      populateId: 'user',
      populateItems: '',
      lean: false,
      skip: 0,
      where: '',
      gt: 1,
      lt: 0,
      in: [],
      equal: '',
      errorMessage: 'Unknown Value'
    },
    routing: {
      schema: true,
      url: '/api/v1/',
      build: true
    }
  },
  email: {
    templates: {
      welcome: {
        subject: process.env.EMAIL_WELCOME_SUB || 'Welcome to Men Stack JS',
        text: function (username) {
          return process.env.EMAIL_WELCOME_TEXT_STRING || 'Hi ' + username + ',\n\n' +
          'Thanks for signing up for Men Stack JS.\n\n' +
          'If you have any questions about the site, you can reply to this ' +
          'email.\n\n' +
          '— Men Stack JS'
        }
      },
      reset: {
        subject: process.env.EMAIL_RESET_SUB || 'Reset your password on MENSTACKJS ',
        text: function (email) {
          return process.env.EMAIL_RESET_TEXT_STRING || 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + email + ' has just been changed.\n'
        }
      },
      forgot: {
        subject: process.env.EMAIL_FORGOT_SUB || 'Welcome to Men Stack JS',
        text: function (host, token) {
          return process.env.EMAIL_FORGOT_TEXT_STRING || 'You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        }
      }
    },
    from: process.env.EMAIL_FROM || 'MENSTACKJS@localhost.com',
    error: process.env.EMAIL_ERROR || 'MENSTACKJS@localhost.com',
    connect: {
      host: process.env.EMAIL_HOST || 'smtp.mandrillapp.com', // Gmail, SMTP
      port: process.env.EMAIL_PORT || '587',
      auth: {
        user: process.env.EMAIL_USER || 'hackathonstarterdemo',
        pass: process.env.EMAIL_PASS || 'E1K950_ydLR4mHw12a0ldA'
      }
    }
  }
}
if (environment === 'test') {
  baseLine = _.assign(baseLine, require('./environments/test.js'))
} else if (environment === 'production') {
  baseLine = _.assign(baseLine, require('./environments/production.js'))
} else if (environment === 'nightwatch') {
  baseLine = _.assign(baseLine, require('./environments/nightwatch.js'))
} else {
  baseLine = _.assign(baseLine, require('./environments/development.js'))
}

exports.get = function (env) {
  return baseLine
}
exports.set = function (identifer, value) {
  baseLine[identifer] = value
  return baseLine
}
