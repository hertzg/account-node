var http = require('http')

var Log = require('./Log.js'),
    OpenSession = require('./OpenSession.js')

module.exports = users => {
    return (req, res, parsedUrl) => {

        res.setHeader('Content-Type', 'application/json')

        var query = parsedUrl.query

        var username = query.username
        if (username === undefined) {
            res.end('"INVALID_USERNAME"')
            return
        }

        var password = query.password
        if (password === undefined) {
            res.end('"INVALID_PASSWORD"')
            return
        }

        var user = users[username]
        if (user === undefined) {
            res.end('"NO_SUCH_USER"')
            return
        }

        if (!user.passwordMatches(password)) {
            res.end('"INCORRECT_PASSWORD"')
            return
        }

        Log.info('User ' + username + ' signed in')
        OpenSession(username, user, res)

    }
}
