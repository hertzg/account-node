var LongSession = require('./LongSession.js'),
    PlainObject = require('./PlainObject.js'),
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
            var storageSession = storageSessions[i]
            var longTerm = storageSession.longTerm
            sessions[i] = Session(longTerm, storageSession.accessTime, () => {
                user.removeSession(i)
                if (longTerm) {
                    user.addLongSession(i, LongSession(Date.now(), () => {
                        user.removeLongSession(i)
                    }))
                }
            })
        })(i)
    }

    var longSessions = Object.create(null)
    var storageLongSessions = storageObject.longSessions
    for (var i in storageLongSessions) {
        ;((i) => {
            var storageLongSession = storageLongSessions[i]
            longSessions[i] = LongSession(storageLongSession.accessTime, () => {
                user.removeLongSession(i)
            })
        })(i)
    }

    var user = User(username, password, storageObject.profile,
        storageObject.registerTime, PlainObject(storageObject.contacts),
        PlainObject(storageObject.referers),
        PlainObject(storageObject.requests),
        PlainObject(storageObject.ignoreds), sessions, longSessions)

    return user

}
