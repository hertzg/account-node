var assert = require('assert'),
    crypto = require('crypto')

var SendMessage = require('./SendMessage.js')

module.exports = (password, fullName, email,
    phone, registerTime, sessions, contacts) => {

    function sendMessage (username, message, token) {
        var affectedSessions = []
        for (var i in sessions) {
            if (i !== token) affectedSessions.push(sessions[i])
        }
        if (affectedSessions.length === 0) return
        SendMessage(username, message, token, () => {
            affectedSessions.forEach(session => {
                session.close()
            })
        })
    }

    assert.strictEqual(typeof password, 'object')
    assert(password instanceof Object)

    assert(password.key instanceof Buffer)
    assert(password.digest instanceof Buffer)

    assert.strictEqual(typeof fullName, 'string')
    assert.strictEqual(typeof email, 'string')
    assert.strictEqual(typeof phone, 'string')
    assert.strictEqual(typeof registerTime, 'number')

    assert.strictEqual(typeof sessions, 'object')
    assert.notStrictEqual(sessions, null)
    assert(!(sessions instanceof Object))

    assert.strictEqual(typeof contacts, 'object')
    assert.notStrictEqual(contacts, null)
    assert(!(contacts instanceof Object))

    return {
        addContact: (username, contactUsername, user, token) => {
            assert.strictEqual(contacts[contactUsername], undefined)
            contacts[contactUsername] = user
            sendMessage(username, ['addContact', [contactUsername, user]], token)
        },
        addSession: (token, session) => {
            assert.strictEqual(sessions[token], undefined)
            sessions[token] = session
        },
        changePassword: _password => {
            assert(_password.key instanceof Buffer)
            assert(_password.digest instanceof Buffer)
            password = _password
        },
        editContact: (username, contactUsername, user, token) => {
            assert.notStrictEqual(contacts[contactUsername], undefined)
            contacts[contactUsername] = user
            sendMessage(username, ['editContact', [contactUsername, user]], token)
        },
        editProfile: (username, _fullName, _email, _phone, token) => {

            assert.strictEqual(typeof _fullName, 'string')
            assert.strictEqual(typeof _email, 'string')
            assert.strictEqual(typeof _phone, 'string')

            fullName = _fullName
            email = _email
            phone = _phone

            sendMessage(username, ['editProfile', {
                fullName: fullName,
                email: email,
                phone: phone,
            }], token)

        },
        getContact: username => {
            return contacts[username]
        },
        getSession: token => {
            return sessions[token]
        },
        passwordMatches: otherPassword => {
            var hmac = crypto.createHmac('sha512', password.key)
            var digest = hmac.update(otherPassword).digest()
            return digest.compare(password.digest) === 0
        },
        removeContact: (username, contactUsername, token) => {
            assert.notStrictEqual(contacts[contactUsername], undefined)
            delete contacts[contactUsername]
            sendMessage(username, ['removeContact', contactUsername], token)
        },
        removeSession: token => {
            assert.notStrictEqual(sessions[token], undefined)
            delete sessions[token]
        },
        toClientObject: () => {
            return {
                fullName: fullName,
                email: email,
                phone: phone,
                contacts: contacts,
            }
        },
        toPublicObject: () => {
            return {
                fullName: '',
                email: '',
                phone: '',
            }
        },
        toStorageObject: () => {

            var storageSessions = {}
            for (var i in sessions) storageSessions[i] = {}

            return {
                password: {
                    key: password.key.toString('base64'),
                    digest: password.digest.toString('base64'),
                },
                fullName: fullName,
                email: email,
                phone: phone,
                registerTime: registerTime,
                sessions: storageSessions,
                contacts: contacts,
            }

        },
    }

}
