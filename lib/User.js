var crypto = require('crypto')

module.exports = (password, fullName, email, phone, registerTime, sessions) => {

    return {
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
        passwordMatches: otherPassword => {
            var hmac = crypto.createHmac('sha512', password.key)
            var digest = hmac.update(otherPassword).digest()
            return digest.compare(password.digest) === 0
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
            }
        },
    }

}
