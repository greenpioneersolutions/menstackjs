//GLOBALS
import http from 'http';
import express from 'express';
import fs from 'fs';
import path from 'path';
import spdy from 'spdy';
//Server files
import db  from './db.js'
import middleware from './middleware.js'
import mail from './mail.js'
import register from './register.js'
import config from './config.js'
import authentication from './authentication.js'
import security from './security.js'
import header from './header.js'
import logger from './logger.js'
import tool from './tool.js'
import routes from './routes.js'
import error from './error.js'
import cdn from './cdn.js'

function men(options, done) {
    const self = this;
    self.port = {
        http:3000,
        https:3000,
        http2:3001,
    }
    self.environment = 'development'
    self.settings = {}
    self.options = options
    self.done = done
    self.app = express();
    register(self)
    config(self)
    db.init(self)
    middleware(self)
    mail(self)
    authentication(self)
    security(self)
    header(self)
    logger(self)
    tool(self)
    routes(self)
    error(self)
    cdn(self)
    //http.createServer(self.app).listen('3000', self.done)
    spdy.createServer({
        key: fs.readFileSync(path.join(__dirname , './../../../config/certificates/keyExample.pem')),
        cert: fs.readFileSync(path.join(__dirname , './../../../config/certificates/certExample.pem')),
        spdy: {
            protocols: [ 'h2'],
            }
    }, self.app).listen(self.port.http2, self.done)
}


export default men;