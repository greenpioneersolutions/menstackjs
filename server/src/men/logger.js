export {middleware}
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import winston from 'winston';
const settings = require('./configs/settings').get();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
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
        write(message) {
          self.logger.info(message.replace(/\n$/, ''))
        }
      }
    }))
  }
}
export {logger}