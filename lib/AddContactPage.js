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

        var contactUsername = query.contactUsername
        if (contactUsername === undefined || contactUsername.length < 6 ||
            contactUsername.match(/[^a-z0-9_.-]/i) || contactUsername === username) {

            res.end('"INVALID_CONTACT_USERNAME"')
            return

        }

        var contactUser = user.getContact(contactUsername)
        if (contactUser !== undefined) {
            res.end('"CONTACT_ALREADY_ADDED"')
            return
        }

        var fullName = query.fullName
        if (fullName === undefined) fullName = ''

        var email = query.email
        if (email === undefined) email = ''

        var phone = query.phone
        if (phone === undefined) phone = ''

        user.addContact(contactUsername, {
            fullName: fullName,
            email: email,
            phone: phone,
        })

        console.log('INFO: User ' + username + ' added contact user ' + contactUsername)
        res.end('true')

    }
}
