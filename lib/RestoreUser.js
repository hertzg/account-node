var LongSession = require('./LongSession.js'),
    PlainObject = require('./PlainObject.js'),
    Session = require('./Session.js'),
    SessionGroup = require('./SessionGroup.js'),
    User = require('./User.js')

module.exports = (getGroup, username, storageObject) => {

    var password = storageObject.password
    password.key = Buffer.from(password.key, 'base64')
    password.digest = Buffer.from(password.digest, 'base64')

    var sessions = Object.create(null)
    ;(() => {
        var objects = storageObject.sessions
        for (var i in objects) {
            ;((i) => {

                var object = objects[i],
                    group = getGroup(object.group),
                    longTerm = object.longTerm

                sessions[i] = Session(i, group, longTerm, object.accessTime, () => {
                    user.removeSession(i)
                    if (longTerm) {
                        user.addLongSession(i, LongSession(i, group, Date.now(), () => {
                            user.removeLongSession(i)
                        }))
                    }
                })

            })(i)
        }
    })()

    var longSessions = Object.create(null)
    ;(() => {
        var objects = storageObject.longSessions
        for (var i in objects) {
            ;((i) => {

                var object = objects[i],
                    group = getGroup(object.group)

                longSessions[i] = LongSession(i, group, object.accessTime, () => {
                    user.removeLongSession(i)
                })

            })(i)
        }
    })()

    var user = User(username, password, storageObject.profile,
        storageObject.registerTime, PlainObject(storageObject.contacts),
        PlainObject(storageObject.referers),
        PlainObject(storageObject.requests),
        PlainObject(storageObject.ignoreds), sessions, longSessions)

    return user

}
