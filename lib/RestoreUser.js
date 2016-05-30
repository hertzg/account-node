var PlainObject = require('./PlainObject.js'),
    User = require('./User.js')

module.exports = storageObject => {
    var password = storageObject.password
    password.key = Buffer.from(password.key, 'base64')
    password.digest = Buffer.from(password.digest, 'base64')
    return User(password, storageObject.fullName,
        storageObject.email, storageObject.phone,
        storageObject.registerTime, PlainObject(storageObject.sessions))
}
