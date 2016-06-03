var PlainObject = require('./PlainObject.js'),
    Session = require('./Session.js'),
    User = require('./User.js')

module.exports = (username, storageObject) => {

    var password = storageObject.password
    password.key = Buffer.from(password.key, 'base64')
    password.digest = Buffer.from(password.digest, 'base64')

    var sessions = Object.create(null)
    var storageSessions = storageObject.sessions
    for (var i in storageSessions) {
        ;((i) => {
            sessions[i] = Session(storageSessions[i].longTerm, () => {
                user.removeSession(i)
            })
        })(i)
    }

    var user = User(username, password, storageObject.profile,
        storageObject.registerTime, sessions,
        PlainObject(storageObject.contacts),
        PlainObject(storageObject.referers),
        PlainObject(storageObject.requests),
        PlainObject(storageObject.ignoreds))

    return user

}
