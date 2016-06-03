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

        var contactUsername = query.contactUsername
        if (contactUsername === undefined || contactUsername.length < 6 ||
            contactUsername.match(/[^a-z0-9_.-]/i) || contactUsername === username) {

            res.end('"INVALID_CONTACT_USERNAME"')
            return

        }

        if (user.getContact(contactUsername) !== undefined) {
            res.end('"CONTACT_ALREADY_ADDED"')
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

        var contact = {
            online: false,
            profile: {
                fullName: fullName,
                email: email,
                phone: phone,
            },
        }

        user.addContact(contactUsername, contact, token)

        Log.info('User ' + username + ' added contact user ' + contactUsername)
        res.end(JSON.stringify(contact))

    }
}
