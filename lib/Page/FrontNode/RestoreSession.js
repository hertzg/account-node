var http = require('http')

var OpenSession = require('../../OpenSession.js')

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

        var longTerm, group
        var token = query.token
        var session = user.getSession(token)
        if (session === undefined) {
            var longSession = user.getLongSession(token)
            if (longSession === undefined) {
                res.end('"INVALID_TOKEN"')
                return
            }
            longTerm = true
            group = longSession.group
        } else {
            longTerm = session.longTerm
            group = session.group
        }

        OpenSession(group, username, user, res, longTerm)

    }
}
