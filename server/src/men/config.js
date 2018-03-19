import morgan from 'morgan';
import bodyParser from 'body-parser';

function config (self) {
    self.app.use(morgan('dev'));
    self.app.use(bodyParser.json({
        limit : '100kb'
    }))
    self.app.use(bodyParser.json({
        limit: '100kb', extended: true
    }))

    self.dir = __dirname
}
export default config;