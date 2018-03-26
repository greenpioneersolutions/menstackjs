import glob from 'glob'
import path from 'path'
import Men from '../server.js'
import run from '../../run.js'

process.env.NODE_ENV = 'nightwatch'

describe('MENSTACKJS API Testing', function () {
  before(function (done) {
    this.timeout(20000)
    run(Men, {
      seed: true
    }, function () {
      setTimeout(done, 1500)
    })
  })
  glob.sync('./server/dist/**/modules/**/*.spec.js').forEach(function (file) {
    require(path.resolve(file))
  })
})
