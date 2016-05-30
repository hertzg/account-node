var crypto = require('crypto')

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

        var currentPassword = query.currentPassword
        if (currentPassword === undefined) {
            res.end('"INVALID_CURRENT_PASSWORD"')
            return
        }

        var newPassword = query.newPassword
        if (newPassword === undefined || newPassword.length < 6 ||
            newPassword.match(/^\d+$/)) {

            res.end('"INVALID_NEW_PASSWORD"')
            return

        }

        if (!user.passwordMatches(currentPassword)) {
            res.end('"INCORRECT_CURRENT_PASSWORD"')
            return
        }

        var passwordKey = crypto.randomBytes(64)
        var hmac = crypto.createHmac('sha512', passwordKey)

        user.changePassword({
            key: passwordKey,
            digest: hmac.update(newPassword).digest(),
        })

        res.end('true')

    }
}
