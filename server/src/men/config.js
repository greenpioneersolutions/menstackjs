import morgan from 'morgan';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compress from 'compression';
import expressValidator from 'express-validator';
import methodOverride from 'method-override';
import path from 'path';

function config (self) {
    self.app.use(morgan('dev'));
    self.app.use(bodyParser.json({
        limit : '100kb'
    }))
    self.app.use(bodyParser.json({
        limit: '100kb', extended: true
    }))
    self.app.use(compress())
    self.app.use(methodOverride())
    self.app.use(cookieParser())
    self.dir = __dirname
    self.app.enable('trust proxy')
    self.app.disable('x-powered-by')
    self.app.set('view engine', 'html')
    self.app.set('views', path.join(self.dir, '/client'))
    self.app.set('port', self.port)
}
export {config};