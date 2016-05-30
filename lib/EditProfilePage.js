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

        var fullName = query.fullName
        if (fullName === undefined) fullName = ''

        var email = query.email
        if (email === undefined) email = ''

        var phone = query.phone
        if (phone === undefined) phone = ''

        user.editProfile(fullName, email, phone)

        console.log('INFO: User ' + username + ' edited profile')
        res.end('true')

    }
}