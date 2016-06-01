var PlainObject = require('./PlainObject.js'),
    Session = require('./Session.js'),
    User = require('./User.js')

module.exports = storageObject => {

    var password = storageObject.password
    password.key = Buffer.from(password.key, 'base64')
    password.digest = Buffer.from(password.digest, 'base64')

    var sessions = Object.create(null)
    for (var i in storageObject.sessions) {
        ;((i) => {
            sessions[i] = Session(() => {
                user.removeSession(i)
            })
        })(i)
    }

    var user = User(password, storageObject.profile,
        storageObject.registerTime, sessions,
        PlainObject(storageObject.contacts),
        PlainObject(storageObject.referers),
        PlainObject(storageObject.requests))

    return user

}
