var crypto = require('crypto')

var Log = require('../Log.js')

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

        var newPassword = query.newPassword
        if (newPassword === undefined || newPassword.length < 6 ||
            newPassword.match(/^\d+$/)) {

            res.end('"INVALID_NEW_PASSWORD"')
            return

        }

        if (!user.passwordMatches(query.currentPassword)) {
            res.end('"INVALID_CURRENT_PASSWORD"')
            return
        }

        var passwordKey = crypto.randomBytes(64)
        var hmac = crypto.createHmac('sha512', passwordKey)

        user.changePassword({
            key: passwordKey,
            digest: hmac.update(newPassword).digest(),
        })

        Log.info('User ' + username + ' changed password')
        res.end('true')

    }
}
