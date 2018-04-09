const _ = require('lodash')
const glob = require('glob')
const path = require('path')

module.exports = { tool }

function tool (self) {
  const files = glob.sync(path.join(__dirname, './tools/*/package.json'))
  files.forEach((n, k) => {
    const packageInfo = require(`${n}`)
    if (packageInfo.active || _.isUndefined(packageInfo.active)) {
      const mainPath = _.replace(n, 'package.json', packageInfo.main)
      require(`${mainPath}`)(self)
    }
  })
}
