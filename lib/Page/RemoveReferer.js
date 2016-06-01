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
        if (user.getReferer(refererUsername) === undefined) {
            res.end('"REFERER_NOT_ADDED"')
            return
        }

        user.removeReferer(username, refererUsername)

        Log.info('User ' + username + ' removed referere user ' + refererUsername)
        res.end('true')

    }
}