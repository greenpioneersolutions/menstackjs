const { logger } = require('./logger.js')

module.exports = { middleware, log }

function log (error, cb) {
  if (typeof cb !== 'function') {
    cb = () => {}
  }
  if (!(error instanceof Error)) {
    error = new Error(error)
  }
  logger.error(error.message, error)
  console.error(error.message, error)
}

function jsonStringify (obj) {
  return JSON.stringify(obj, null, 2)
}

function middleware (self) {
  self.app.use((error, req, res, next) => {
    let code = typeof error.status === 'number' ? error.status : 500
    let message = error.message || error.msg
    let type = 'express'
    const ip = req.ip || req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress

    if (error.name === 'ValidationError') {
      code = 400
      message = 'Validation Error'
      type = 'mongo'
    }
    if (error.name === 'CastError') {
      code = 400
      message = 'Invalid Cast'
      type = 'mongo'
    }
    if (error.message === 'MongoError') {
      code = 400
      if (error.code === 11000) message = 'Duplicate key error '
      else message = 'Database Error'
      type = 'mongo'
    }

    const text = `\n=== EXCEPTION ===\n  \nMessage:\n${message}\n\nCode:\n${code}\n \nUser:\n${req.user ? req.user.email : 'no user info'}\n \nIP Address:\n${ip || 'no IP'}\n \nUser-Agent:\n${jsonStringify(req.headers['user-agent'])}\n \nRoute:\n${req.method}-${req.url}\n \nHeaders:\n\n${jsonStringify(req.headers)}\n \nParams:\n\n${jsonStringify(req.params)}\n \nBody:\n\n${jsonStringify(req.body)}\n \nSession:\n\n${jsonStringify(req.session)}\n \nStack:\n${error.stack}\n`

    res.status(code)

    if (code >= 500) {
      error.type = type
      error.stack = text
      log(error)
    }

    const renderData = {
      text: '',
      message,
      code,
      title: `${code}`
    }
    if (self.settings.environment !== 'production') {
      renderData.text = text
    }
    return res.send(renderData)
  })
}

process.on('unhandledRejection', function (reason) {
  console.error('[UNHANDLED REJECTION]')
  console.error(reason)
})
process.on('uncaughtException', function (err) {
  console.log('[UNCAUGHT EXCEPTION] - ', err.message)
  switch (err.code) {
    case 'EACCES':
      console.log('(Permission denied): An attempt was made to access a file in a way forbidden by its file access permissions.')
      break
    case 'EADDRINUSE':
      console.log('(Address already in use): An attempt to bind a server (net, http, or https) to a local address failed due to another server on the local system already occupying that address.')
      break
    case 'ECONNREFUSED':
      console.log('(Connection refused): No connection could be made because the target machine actively refused it. This usually results= require(trying to connect to a service that is inactive on the foreign host.')
      break
    case 'ECONNRESET':
      console.log('(Connection reset by peer): A connection was forcibly closed by a peer. This normally results= require(a loss of the connection on the remote socket due to a timeout or reboot. Commonly encountered via the http and net modules.')
      break
    case 'EEXIST':
      console.log('(File exists): An existing file was the target of an operation that required that the target not exist.')
      break
    case 'EISDIR':
      console.log('(Is a directory): An operation expected a file, but the given pathname was a directory.')
      break
    case 'EMFILE':
      console.log('(Too many open files in system): Maximum number of file descriptors allowable on the system has been reached, and requests for another descriptor cannot be fulfilled until at least one has been closed. This is encountered when opening many files at once in parallel, especially on systems (in particular, OS X) where there is a low file descriptor limit for processes. To remedy a low limit, run ulimit -n 2048 in the same shell that will run the Node.js process.')
      break
    case 'ENOENT':
      console.log('(No such file or directory): Commonly raised by fs operations to indicate that a component of the specified pathname does not exist -- no entity (file or directory) could be found by the given path.')
      break
    case 'ENOTDIR':
      console.log('(Not a directory): A component of the given pathname existed, but was not a directory as expected. Commonly raised by fs.readdir.')
      break
    case 'ENOTEMPTY':
      console.log('(Directory not empty): A directory with entries was the target of an operation that requires an empty directory -- usually fs.unlink.')
      break
    case 'EPERM':
      console.log('(Operation not permitted): An attempt was made to perform an operation that requires elevated privileges.')
      break
    case 'EPIPE':
      console.log('(Broken pipe): A write on a pipe, socket, or FIFO for which there is no process to read the data. Commonly encountered at the net and http layers, indicative that the remote side of the stream being written to has been closed.')
      break
    case 'ETIMEDOUT':
      console.log('(Operation timed out): A connect or send request failed because the connected party did not properly respond after a period of time. Usually encountered by http or net -- often a sign that a socket.end() was not properly called.')
      break
  }
  process.exit(1)
})