var CollapseSpaces = require('../../CollapseSpaces.js')

module.exports = users => {
    return (req, res, parsedUrl) => {

        var query = parsedUrl.query

        var contactsFullName = query.contactsFullName
        if (contactsFullName === undefined) contactsFullName = ''
        else contactsFullName = CollapseSpaces(contactsFullName)

        var contactsEmail = query.contactsEmail
        if (contactsEmail === undefined) contactsEmail = ''
        else contactsEmail = CollapseSpaces(contactsEmail)

        var contactsPhone = query.contactsPhone
        if (contactsPhone === undefined) contactsPhone = ''
        else contactsPhone = CollapseSpaces(contactsPhone)

        var publicFullName = query.publicFullName
        if (publicFullName === undefined) publicFullName = ''
        else publicFullName = CollapseSpaces(publicFullName)

        var publicEmail = query.publicEmail
        if (publicEmail === undefined) publicEmail = ''
        else publicEmail = CollapseSpaces(publicEmail)

        var publicPhone = query.publicPhone
        if (publicPhone === undefined) publicPhone = ''
        else publicPhone = CollapseSpaces(publicPhone)

        var contactsProfile = {
            fullName: contactsFullName,
            email: contactsEmail,
            phone: contactsPhone,
        }

        var publicProfile = {
            fullName: publicFullName,
            email: publicEmail,
            phone: publicPhone,
        }

        var username = query.username
        for (var i in users) {
            var user = users[i]
            for (var j in user.getContacts()) {
                if (j === username) {
                    if (user.getReferer(username) === undefined) {
                        user.editContactProfile(j, publicProfile)
                    } else {
                        user.editContactProfile(j, contactsProfile)
                    }
                    break
                }
            }
            for (var j in user.getRequests()) {
                if (j === username) {
                    user.editRequest(j, contactsProfile)
                    break
                }
            }
        }

        res.setHeader('Content-Type', 'application/json')
        res.end('true')

    }
}
