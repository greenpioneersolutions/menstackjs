var _ = require('lodash')
// var babel = require('babel-core')
var debug = require('debug')('menstackjs:register')
var fs = require('fs')
var mongoose = require('mongoose')
var path = require('path')
var pathExists = require('is-there')
var dir = __dirname
function Register (self, done) {
  // Start Build Process
  // getFolderContents > Used to dynamically get all of the contents of all module folders.
  this.getFolderContents(self)
  // compileBackendScripts > Used to compile all of the info need for all of the backend modules.
  this.compileBackendScripts(self)
  // setupServerModels > Used to set up the mongoose modules.
  this.setupServerModels(self)
  // setupServerRoutes > Used to set up the module routes.
  this.setupServerRoutes(self)
  // frontendFiles > Returns the files to send to the frontend
  return self.frontendFiles
}

Register.prototype.getFolderContents = function (self) {
  debug('started Info')

  function expandModules (arr, dir) {
    var returnConfigs = []
    arr.forEach(function (value, key) {
      var obj = {
        'name': value,
        'lookup': dir + '/' + value
      }
      var files = fs.readdirSync(dir + '/' + value)
      files = _.filter(files, function (n) {
        return !_.startsWith(n, '.')
      })
      obj.files = []
      files.forEach(function (f) {
        var fileData = _.words(f, /[^. ]+/g)
        obj.files.push({
          'type': fileData[1],
          'ext': fileData[2],
          'name': fileData[0],
          'orginal': f
        })
      })
      returnConfigs.push(obj)
    })
    return returnConfigs
  }

  var backendPath = path.resolve(dir, './modules')

  if (!pathExists(backendPath)) {
    throw new Error('Critical Folder Missing:Expected Server Modules Directory ./server/modules/')
  }

  var backendConfigs = expandModules(_.filter(fs.readdirSync(backendPath), function (n) {
    return !_.startsWith(n, '.')
  }), backendPath)

  self.backendFolders = backendConfigs
  debug('end Info')
}

Register.prototype.compileBackendScripts = function (self) {
  debug('started compileBackendScripts')

  // var self = this
  self.backendFiles = {
    'model': [],
    'controllers': [],
    'routes': []
  }
  self.backendFolders.forEach(function (r) {
    r.files.forEach(function (j) {
      var baseDirectory = './modules/'
      // if (j.ext === 'js' && self.settings.babel.active && j.type !== 'spec') {
      //   self.transformFiles.push('/' + r.name + '/' + j.orginal)
      //   self.transformFolders.push(r.name)
      //   baseDirectory = './' + self.settings.babel.folder + '/'
      // }
      if (j.type === 'controller') {
        self.backendFiles.controllers.push({name: r.name, url: baseDirectory + r.name + '/' + j.orginal})
      } else if (j.type === 'model') {
        self.backendFiles.model.push({name: j.name, url: baseDirectory + r.name + '/' + j.orginal})
      } else if (j.type === 'routes') {
        self.backendFiles.routes.push({name: r.name, url: baseDirectory + r.name + '/' + j.orginal})
      } else {
        // debug(j.type)
      }
    })
  })
  debug('end compileBackendScripts')
}

Register.prototype.setupServerModels = function (self) {
  debug('started createBackendModels')
  // var self = this
  self.models = {}
  self.backendFiles.model.forEach(function (n) {
    debug('Model: %s - %s', n.name, n.url)
    self.models[n.name] = mongoose.model(n.name, require(n.url))
    self.models[n.name].on('index', function (err) {
      if (err) throw err
    })
  })
  debug('end createBackendModels')
}

Register.prototype.setupServerRoutes = function (self) {
  debug('started createBackendRoutes')
  // var self = this

  self.backendFiles.routes.forEach(function (n) {
    debug('Route : %s', n.url)
    require(n.url)(self.app, self.middleware, self.mail, self.settings, self.models)
  })

  debug('end createBackendRoutes')
}

function build (options) {
  return new Register(options)
}

module.exports = build
