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

        var session = user.getSession(query.token)
        if (session === undefined) {
            res.end('"INVALID_TOKEN"')
            return
        }

        session.wake()
        res.end('true')

    }
}
