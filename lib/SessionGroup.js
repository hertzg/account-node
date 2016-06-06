var SendSessionClose = require('./SendSessionClose.js')

module.exports = identifier => {

    var sessions = Object.create(null)

    return {
        identifier: identifier,
        add: (token, session) => {
            sessions[token] = session
        },
        close: token => {
            var affectedTokens = []
            for (var i in sessions) {
                if (i !== token) affectedTokens.push(i)
                sessions[i].close()
            }
            SendSessionClose(affectedTokens)
        },
        remove: token => {
            delete sessions[token]
        },
    }

}
