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

        var contactUsername = query.contactUsername
        if (contactUsername === undefined) {
            res.end('"INVALID_CONTACT_USERNAME"')
            return
        }

        if (user.getContact(contactUsername) === undefined) {
            res.end('"CONTACT_NOT_ADDED"')
            return
        }

        user.contactOnline(contactUsername)

        res.end('true')

    }
}
