var CollapseSpaces = require('../../CollapseSpaces.js')

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

        var fullName = query.fullName
        if (fullName === undefined) fullName = ''
        else fullName = CollapseSpaces(fullName)

        var email = query.email
        if (email === undefined) email = ''
        else email = CollapseSpaces(email)

        var phone = query.phone
        if (phone === undefined) phone = ''
        else phone = CollapseSpaces(phone)

        user.removeReferer(refererUsername, {
            fullName: fullName,
            email: email,
            phone: phone,
        })

        res.end('true')

    }
}
