var http = require('http')

var Log = require('../Log.js'),
    OpenSession = require('../OpenSession.js')

module.exports = users => {
    return (req, res, parsedUrl) => {

        res.setHeader('Content-Type', 'application/json')

        var query = parsedUrl.query

        var username = query.username
        var user = users[username]
        if (user === undefined) {
            res.end('"INVALID_USERNAME"')
            return
        }

        if (!user.passwordMatches(query.password)) {
            res.end('"INVALID_PASSWORD"')
            return
        }

        Log.info('User ' + username + ' signed in')
        OpenSession(username, user, res)

    }
}