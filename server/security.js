const cors = require('cors')
const helmet = require('helmet')

module.exports = { security }

function security (self) {
  self.app.use(helmet())
  self.app.use(cors())
  self.app.options('*', cors())
}
