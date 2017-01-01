process.env.NODE_ENV = 'nightwatch'
var Men = require('../../server.men.js')
var run = require('../../run.js')
describe('MENSTACKJS API Testing', function () {
  before(function (done) {
    this.timeout(20000)
    run(Men, function () {
      require('../seed.js')(function () {
        done()
      })
    })
  })
  require('glob').sync('server/modules/**/*.spec.js').forEach(function (file) {
    require('../../' + file)
  })
})
