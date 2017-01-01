var Men = require('./server.men.js')
var SocketIO = require('./server.socketio.js')
var run = require('./run.js')
var environment = require('./configs/environment.js').get()

if (!module.parent) {
  if (environment === 'development') {
    run(Men)
    run(SocketIO)
  } else {
    run(Men)
    run(SocketIO)
  }
}
