import morgan from 'morgan'
import fs from 'fs'
import path from 'path'
import winston from 'winston'

export {middleware}

const logDir = path.resolve('./logs')
try {
  fs.statSync(logDir)
} catch (e) {
  fs.mkdirSync(logDir)
}
const logger = winston.createLogger({
  format: winston.format.simple(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: './logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: './logs/warn.log', level: 'warn' }),
    new winston.transports.File({ filename: './logs/info.log', level: 'info' }),
    new winston.transports.File({ filename: './logs/debug.log', level: 'debug' })
  ]
})

function middleware (self) {
  if (self.settings.logger) {
    self.app.use(morgan(self.settings.logger, {
      stream: {
        write (message) {
          self.logger.info(message.replace(/\n$/, ''))
        }
      }
    }))
  }
}
export {logger}
