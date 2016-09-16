process.env.NODE_ENV = 'nightwatch'
describe('MENSTACKJS API Testing', function () {
  before(function (done) {
    this.timeout(10000)
    var Men = require('../../server.js')
    var server = new Men({}, function (err) {
      if (err) {
        console.error('Error during ' + server.settings.title + ' startup. Abort.')
        console.error(err)
        process.exit(1)
      }
      require('../seed.js')(function () {
        done()
      })
    })
  })
  require('glob').sync('server/modules/**/*.spec.js').forEach(function (file) {
    require('../../' + file)
  })
})
