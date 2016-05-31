var Log = require('./Log.js')

module.exports = users => {
    return (req, res, parsedUrl) => {

        res.setHeader('Content-Type', 'application/json')

        var query = parsedUrl.query

        var username = query.username
        if (username === undefined) {
            res.end('"INVALID_USERNAME"')
            return
        }

        var user = users[username]
        if (user === undefined) {
            res.end('"NO_SUCH_USER"')
            return
        }

        var token = query.token
        if (token === undefined) {
            res.end('"INVALID_TOKEN"')
            return
        }

        user.removeSession(token)

        Log.info('User ' + username + ' signed out')
        res.end('true')

    }
}
