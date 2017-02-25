const { DEBUG } = require('../config.json')

function debug (... args) {
  if (DEBUG) console.log(...args)
}

module.exports.debug = debug
