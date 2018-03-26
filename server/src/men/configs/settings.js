const globalSettings = require('./../../../../config/settings.js')
const environment = process.env.NODE_ENV || 'development'
const localSetting = {
  mongodb: {
    uri: 'mongodb://localhost/dev',
    options: {}
  },
  app: {
    name: process.env.APP_NAME || 'MenStackJS'
  },
  port: {
    http: 3000,
    https: 3000,
    http2: 3001
  }
}
var settings = {}
export function init (options) {
  if (!options) options = {}
  settings = Object.assign({}, globalSettings, localSetting, {
    ...getEnvSettings(environment)
  }, options, {
    environment: environment
  })
  return settings
}
export function get () {
  return settings
}

export function set (identifer, value) {
  settings[identifer] = value
  return settings
}
function getEnvSettings (env) {
  return require(`./environments/${env}.js`)
}
