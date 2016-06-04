var LongTermSession = require('./LongTermSession.js'),
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
                    user.addLongTermSession(i, LongTermSession(Date.now(), () => {
                        user.removeLongTermSession(i)
                    }))
                }
            })
        })(i)
    }

    var longTermSessions = Object.create(null)
    var storageLongTermSessions = storageObject.longTermSessions
    for (var i in storageLongTermSessions) {
        ;((i) => {
            var storageLongTermSession = storageLongTermSessions[i]
            longTermSessions[i] = LongTermSession(storageLongTermSession.accessTime, () => {
                user.removeLongTermSession(i)
            })
        })(i)
    }

    var user = User(username, password, storageObject.profile,
        storageObject.registerTime, sessions,
        PlainObject(storageObject.contacts),
        PlainObject(storageObject.referers),
        PlainObject(storageObject.requests),
        PlainObject(storageObject.ignoreds), longTermSessions)

    return user

}
