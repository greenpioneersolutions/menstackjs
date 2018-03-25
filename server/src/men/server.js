//GLOBALS
import http from 'http';
import express from 'express';
import fs from 'fs';
import path from 'path';
import spdy from 'spdy';

function men(options, done) {
    const self = this;
    self.port = {
        http:3000,
        https:3000,
        http2:3001,
    }
    self.environment = 'development'
    self.settings = require('./configs/settings.js').get()
    self.options = options
    self.done = done
    self.logger = require('./logger.js').logger
    self.app = express();
    require('./register.js').register(self)
    require('./config.js').config(self)
    require('./db.js').init(self)
    self.middleware = require('./middleware.js')
    self.mail = require('./mail.js')
    require('./authentication.js').authentication(self)
    require('./security.js').security(self)
    require('./header.js').header(self)
    require('./tool.js').tool(self)
    require('./routes.js').routes(self)
    require('./error.js').middleware(self)
    require('./cdn.js').cdn(self)
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