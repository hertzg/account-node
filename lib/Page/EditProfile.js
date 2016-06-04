var CollapseSpaces = require('../CollapseSpaces.js'),
    Log = require('../Log.js')

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
        if (token !== undefined) {
            var session = user.getSession(token)
            if (session === undefined) {
                res.end('"INVALID_TOKEN"')
                return
            }
            session.wake()
        }

        var fullName = query.fullName
        if (fullName === undefined) fullName = ''
        else fullName = CollapseSpaces(fullName)

        var email = query.email
        if (email === undefined) email = ''
        else email = CollapseSpaces(email)

        var phone = query.phone
        if (phone === undefined) phone = ''
        else phone = CollapseSpaces(phone)

        user.editProfile({
            fullName: fullName,
            email: email,
            phone: phone,
        }, token)

        Log.info('"' + username + '" edited profile')
        res.end('true')

    }
}
