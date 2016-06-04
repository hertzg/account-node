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

        var token = query.token
        var session = user.getSession(query.token)
        if (session === undefined) {
            res.end('"INVALID_TOKEN"')
            return
        }

        OpenSession(username, user, res, session.longTerm, () => {
            session.close()
        })

    }
}
