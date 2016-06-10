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

        var time = parseInt(query.time, 10)
        if (!isFinite(time)) {
            res.end('"INVALID_TIME"')
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

        user.receiveFileMessage(contactUsername, name, size, time)

        res.end('true')

    }
}
