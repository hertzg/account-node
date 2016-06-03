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

        var refererUsername = query.refererUsername
        if (refererUsername === undefined || refererUsername.length < 6 ||
            refererUsername.match(/[^a-z0-9_.-]/i) || refererUsername === username) {

            res.end('"INVALID_REFERER_USERNAME"')
            return

        }

        if (user.getReferer(refererUsername) !== undefined) {
            res.end('"REFERER_ALREADY_ADDED"')
            return
        }

        var fullName = query.fullName
        if (fullName === undefined) fullName = ''

        var email = query.email
        if (email === undefined) email = ''

        var phone = query.phone
        if (phone === undefined) phone = ''

        user.addReferer(refererUsername, {
            fullName: fullName,
            email: email,
            phone: phone,
        })

        Log.info('User ' + username + ' added referer user ' + refererUsername)
        res.end('true')

    }
}
