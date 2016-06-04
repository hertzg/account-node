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

        var longTerm
        var token = query.token
        var session = user.getSession(token)
        if (session === undefined) {
            var longTermSession = user.getLongTermSession(token)
            if (longTermSession === undefined) {
                res.end('"INVALID_TOKEN"')
                return
            } else {
                longTerm = true
            }
        } else {
            longTerm = session.longTerm
        }

        OpenSession(username, user, res, longTerm)

    }
}
