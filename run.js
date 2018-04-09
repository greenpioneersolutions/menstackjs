module.exports = run

if (!module.parent) {
  const serverFiles = require('./server/server.js')
  run(serverFiles)
}
function run (ServerConstructor, opts, cb) {
  if (!opts) opts = {}
  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }
  const server = new ServerConstructor(opts, (err, data) => {
    if (err) {
      console.error(`Error during ${server.settings.title} startup. Abort.`)
      console.error(err.stack)
      process.exit(1)
    }
    typeof cb === 'function' && cb()
  })
}
