export default run;
import Men from './men/server.js';
//import SocketIO from './server.socketio.js';
//import error from './server/error.js';
if (!module.parent) {
    run(Men)
}
function run (ServerConstructor, opts, cb) {
  console.log('start run - ServerConstructor')
  if (!opts) opts = {}
  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }
  const server = new ServerConstructor(opts, err => {
    if (err) {
      console.error(`Error during ${server.settings.title} startup. Abort.`)
      console.error(err.stack)
      process.exit(1)
    }
    
    console.log('end run - ServerConstructor')
    typeof cb === 'function' && cb()
  })  
}