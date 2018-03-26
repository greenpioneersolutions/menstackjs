import cors from 'cors'
import helmet from 'helmet'

function security (self) {
  // HELMET SECURITY MIDDLEWARE
  self.app.use(helmet())
  // CORS
  self.app.use(cors())
  self.app.options('*', cors()) // include before other routes
}
export {security}
