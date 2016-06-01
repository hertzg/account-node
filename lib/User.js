var assert = require('assert'),
    crypto = require('crypto')

var AddReferer = require('./AddReferer.js'),
    RemoveReferer = require('./RemoveReferer.js'),
    SendMessage = require('./SendMessage.js')

module.exports = (password, profile, registerTime, sessions, contacts, referers) => {

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

    assert.strictEqual(typeof profile.fullName, 'string')
    assert.strictEqual(typeof profile.email, 'string')
    assert.strictEqual(typeof profile.phone, 'string')
    assert.strictEqual(typeof registerTime, 'number')

    assert.strictEqual(typeof sessions, 'object')
    assert.notStrictEqual(sessions, null)
    assert(!(sessions instanceof Object))

    assert.strictEqual(typeof contacts, 'object')
    assert.notStrictEqual(contacts, null)
    assert(!(contacts instanceof Object))

    assert.strictEqual(typeof referers, 'object')
    assert.notStrictEqual(referers, null)
    assert(!(referers instanceof Object))

    var publicProfile = {
        fullName: '',
        email: '',
        phone: '',
    }

    return {
        addContact: (username, contactUsername, user, token) => {
            assert.strictEqual(contacts[contactUsername], undefined)
            contacts[contactUsername] = user
            sendMessage(username, ['addContact', [contactUsername, user]], token)
            AddReferer(contactUsername, username, publicProfile)
        },
        addReferer: (username, refererUsername, user, token) => {
            assert.strictEqual(referers[refererUsername], undefined)
            referers[refererUsername] = user
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
        editProfile: (username, _profile, token) => {

            assert.strictEqual(typeof _profile.fullName, 'string')
            assert.strictEqual(typeof _profile.email, 'string')
            assert.strictEqual(typeof _profile.phone, 'string')

            profile = _profile

            sendMessage(username, ['editProfile', profile], token)

        },
        getContact: username => {
            return contacts[username]
        },
        getContacts: () => {
            return contacts
        },
        getProfile: () => {
            return profile
        },
        getPublicProfile: () => {
            return publicProfile
        },
        getReferer: username => {
            return referers[username]
        },
        getSession: token => {
            return sessions[token]
        },
        passwordMatches: otherPassword => {
            if (otherPassword === undefined) return false
            var hmac = crypto.createHmac('sha512', password.key)
            var digest = hmac.update(otherPassword).digest()
            return digest.compare(password.digest) === 0
        },
        removeContact: (username, contactUsername, token) => {
            assert.notStrictEqual(contacts[contactUsername], undefined)
            delete contacts[contactUsername]
            sendMessage(username, ['removeContact', contactUsername], token)
            RemoveReferer(contactUsername, username, publicProfile)
        },
        removeReferer: (username, refererUsername, token) => {
            assert.notStrictEqual(referers[refererUsername], undefined)
            delete referers[refererUsername]
            sendMessage(username, ['removeReferer', refererUsername], token)
        },
        removeSession: token => {
            assert.notStrictEqual(sessions[token], undefined)
            delete sessions[token]
        },
        toStorageObject: () => {

            var storageSessions = {}
            for (var i in sessions) storageSessions[i] = {}

            return {
                password: {
                    key: password.key.toString('base64'),
                    digest: password.digest.toString('base64'),
                },
                profile: profile,
                registerTime: registerTime,
                sessions: storageSessions,
                contacts: contacts,
                referers: referers,
            }

        },
    }

}
