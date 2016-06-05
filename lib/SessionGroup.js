module.exports = identifier => {

    var sessions = Object.create(null)

    return {
        identifier: identifier,
        add: session => {
            sessions[session.token] = session
        },
        close: () => {
            for (var i in sessions) sessions[i].close()
        },
        remove: token => {
            delete sessions[token]
        },
    }

}
