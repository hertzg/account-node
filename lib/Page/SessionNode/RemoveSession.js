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
        var session = user.getSession(token)
        if (session === undefined) {
            var longSession = user.getLongSession(token)
            if (longSession === undefined) {
                res.end('"INVALID_TOKEN"')
                return
            }
            longSession.close()
        } else {
            session.close()
        }

        res.end('true')

    }
}
