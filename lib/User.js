var assert = require('assert'),
    crypto = require('crypto')

var AddReferer = require('./AddReferer.js'),
    RemoveReferer = require('./RemoveReferer.js'),
    SendMessage = require('./SendMessage.js')

module.exports = (password, profile, registerTime,
    sessions, contacts, referers, requests, ignoreds) => {

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

    assert.strictEqual(typeof requests, 'object')
    assert.notStrictEqual(requests, null)
    assert(!(requests instanceof Object))

    assert.strictEqual(typeof ignoreds, 'object')
    assert.notStrictEqual(ignoreds, null)
    assert(!(ignoreds instanceof Object))

    var publicProfile = {
        fullName: '',
        email: '',
        phone: '',
    }

    return {
        addContact: (username, contactUsername, contact, token) => {
            assert.strictEqual(contacts[contactUsername], undefined)
            contacts[contactUsername] = contact
            sendMessage(username, ['addContact', [contactUsername, contact]], token)
            AddReferer(contactUsername, username, publicProfile)
            if (requests[contactUsername] !== undefined) {
                delete requests[contactUsername]
            }
        },
        addReferer: (username, refererUsername, profile, token) => {

            assert.strictEqual(referers[refererUsername], undefined)
            referers[refererUsername] = profile

            if (contacts[refererUsername] === undefined &&
                requests[refererUsername] === undefined) {

                requests[refererUsername] = profile
                sendMessage(username, ['addRequest', [refererUsername, profile]])

            }

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
        editContact: (username, contactUsername, profile, token) => {
            assert.notStrictEqual(contacts[contactUsername], undefined)
            contacts[contactUsername].profile = profile
            sendMessage(username, ['editContact', [contactUsername, profile]], token)
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
        getRequest: username => {
            return requests[username]
        },
        getRequests: () => {
            return requests
        },
        getSession: token => {
            return sessions[token]
        },
        ignoreRequest: (username, requestUsername, token) => {
            assert.notStrictEqual(requests[requestUsername], undefined)
            delete requests[requestUsername]
            sendMessage(username, ['ignoreRequest', requestUsername], token)
            ignoreds[requestUsername] = {}
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
                requests: requests,
                ignoreds: ignoreds,
            }

        },
    }

}
