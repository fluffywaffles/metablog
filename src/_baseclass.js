var Classy = require('classy-js')
  , IsInstance = require('classy-js/core/is-instance')
  , Compose = require('classy-js/core/compose')
  , ToString = require('classy-js/core/to-string')
  , Equals = require('classy-js/core/equals')

module.exports = Classy().use([ IsInstance, Compose, ToString, Equals ])
