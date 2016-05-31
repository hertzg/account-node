var Log = require('./Log.js')

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
            res.end('"INVALID_TOKEN"')
            return
        }

        session.wake()

        var contactUsername = query.contactUsername
        var contactUser = user.getContact(contactUsername)
        if (contactUser === undefined) {
            res.end('"CONTACT_NOT_ADDED"')
            return
        }

        user.removeContact(username, contactUsername, token)

        Log.info('User ' + username + ' removed contact user ' + contactUsername)
        res.end('true')

    }
}
