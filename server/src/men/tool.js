import _ from 'lodash'
import glob from 'glob'

export {tool}

function tool (self) {
  const files = glob.sync('./tools/*/package.json')
  files.forEach((n, k) => {
    const packageInfo = require(`../${n}`)
    if (packageInfo.active || _.isUndefined(packageInfo.active)) {
      const mainPath = _.replace(n, 'package.json', packageInfo.main)
      require(`../${mainPath}`)(self)
    }
  })
}
