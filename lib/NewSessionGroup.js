var crypto = require('crypto')

var SessionGroup = require('./SessionGroup.js')

module.exports = () => {
    return SessionGroup(crypto.randomBytes(10).toString('hex'))
}
