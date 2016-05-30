var crypto = require('crypto')

module.exports = (password, fullName, email,
    phone, registerTime, sessions, contacts) => {

    return {
        addContact: (username, user) => {
            console.log('DEBUG: User.addContact: ' + username)
            contacts[username] = user
        },
        addSession: token => {
            sessions[token] = {}
        },
        changePassword: _password => {
            password = _password
        },
        editProfile: (_fullName, _email, _phone) => {
            fullName = _fullName
            email = _email
            phone = _phone
        },
        getContact: username => {
            return contacts[username]
        },
        passwordMatches: otherPassword => {
            var hmac = crypto.createHmac('sha512', password.key)
            var digest = hmac.update(otherPassword).digest()
            return digest.compare(password.digest) === 0
        },
        removeContact: username => {
            console.log('DEBUG: User.removeContact: ' + username)
            delete contacts[username]
        },
        removeSession: token => {
            delete sessions[token]
        },
        toClientObject: () => {
            return {
                fullName: fullName,
                email: email,
                phone: phone,
            }
        },
        toPublicObject: () => {
            return {}
        },
        toStorageObject: () => {
            return {
                password: {
                    key: password.key.toString('base64'),
                    digest: password.digest.toString('base64'),
                },
                fullName: fullName,
                email: email,
                phone: phone,
                registerTime: registerTime,
                sessions: sessions,
                contacts: contacts,
            }
        },
    }

}
