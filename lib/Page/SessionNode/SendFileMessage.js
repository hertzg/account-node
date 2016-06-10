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

        var name = query.name
        if (name === undefined) {
            res.end('"INVALID_NAME"')
            return
        }

        var size = parseInt(query.size, 10)
        if (!isFinite(size)) {
            res.end('"INVALID_SIZE"')
            return
        }

        var contactUsername = query.contactUsername
        if (contactUsername === undefined) {
            res.end('"INVALID_CONTACT_USERNAME"')
            return
        }

        var token = query.token
        var session = user.getSession(token)
        if (session === undefined) {
            res.end('"INVALID_TOKEN"')
            return
        }
        session.wake()

        if (user.getContact(contactUsername) === undefined) {
            res.end('"CONTACT_NOT_ADDED"')
            return
        }

        var time = Date.now()
        user.sendFileMessage(contactUsername, name, size, time, token)
        res.end(JSON.stringify(time))

    }
}
