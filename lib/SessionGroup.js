var SendSessionClose = require('./SendSessionClose.js')

module.exports = identifier => {

    var sessions = Object.create(null)

    return {
        identifier: identifier,
        add: (token, session) => {
            sessions[token] = session
        },
        close: () => {
            for (var i in sessions) {
                SendSessionClose(i)
                sessions[i].close()
            }
        },
        remove: token => {
            delete sessions[token]
        },
    }

}
