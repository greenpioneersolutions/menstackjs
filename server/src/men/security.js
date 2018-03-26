import cors from 'cors'
import helmet from 'helmet'

export {security}

function security (self) {
  self.app.use(helmet())
  self.app.use(cors())
  self.app.options('*', cors())
}
