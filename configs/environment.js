var environment = 'development'

exports.get = function (env) {
  environment = env || process.env.NODE_ENV || environment
  return environment
}
exports.set = function (env) {
  environment = process.env.NODE_ENV = env
  return environment
}
