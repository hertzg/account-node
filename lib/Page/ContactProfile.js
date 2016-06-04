var CollapseSpaces = require('../CollapseSpaces.js'),
    Log = require('../Log.js')

module.exports = users => {
    return (req, res, parsedUrl) => {

        var query = parsedUrl.query

        var fullName = query.fullName
        if (fullName === undefined) fullName = ''
        else fullName = CollapseSpaces(fullName)

        var email = query.email
        if (email === undefined) email = ''
        else email = CollapseSpaces(email)

        var phone = query.phone
        if (phone === undefined) phone = ''
        else phone = CollapseSpaces(phone)

        var profile = {
            fullName: fullName,
            email: email,
            phone: phone,
        }

        for (var i in users) {
            var user = users[i]
            for (var j in user.getContacts()) {
                if (j === query.username) {
                    user.editContactProfile(j, profile)
                    break
                }
            }
        }

        res.setHeader('Content-Type', 'application/json')
        res.end('true')

    }
}
