var assert = require('assert'),
    crypto = require('crypto')

var Log = require('./Log.js')

module.exports = (password, fullName, email,
    phone, registerTime, sessions, contacts) => {

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
        addContact: (username, user) => {
            assert.strictEqual(contacts[username], undefined)
            contacts[username] = user
        },
        addSession: token => {
            assert.strictEqual(sessions[token], undefined)
            sessions[token] = {}
        },
        changePassword: _password => {
            assert(_password.key instanceof Buffer)
            assert(_password.digest instanceof Buffer)
            password = _password
        },
        editContact: (username, user) => {
            assert.notStrictEqual(contacts[username], undefined)
            contacts[username] = user
        },
        editProfile: (_fullName, _email, _phone) => {
            assert.strictEqual(typeof _fullName, 'string')
            assert.strictEqual(typeof _email, 'string')
            assert.strictEqual(typeof _phone, 'string')
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
            assert.notStrictEqual(contacts[username], undefined)
            delete contacts[username]
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
