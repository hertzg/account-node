var assert = require('assert'),
    crypto = require('crypto')

var AddReferer = require('./AddReferer.js'),
    CastContactProfile = require('./CastContactProfile.js'),
    CastSessionMessage = require('./CastSessionMessage.js'),
    CastUserOnline = require('./CastUserOnline.js'),
    CastUserOffline = require('./CastUserOffline.js'),
    RemoveReferer = require('./RemoveReferer.js'),
    SendContactOnline = require('./SendContactOnline.js'),
    SendEditContactProfile = require('./SendEditContactProfile.js'),
    SendTextMessage = require('./SendTextMessage.js')

module.exports = (username, password, profile, registerTime,
    sessions, contacts, referers, requests, ignoreds) => {

    function castSessionMessage (message, token) {
        var affectedSessions = []
        for (var i in sessions) {
            if (i !== token) affectedSessions.push(sessions[i])
        }
        if (affectedSessions.length === 0) return
        CastSessionMessage(username, message, token, () => {
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
    ;(() => {
        for (var i in contacts) {
            var contact = contacts[i]
            assert(contact instanceof Object)
            assert.strictEqual(typeof contact.online, 'boolean')
            assert(contact.profile instanceof Object)
            assert(contact.overrideProfile instanceof Object)
        }
    })()

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
        addContact: (contactUsername, contact, token) => {
            assert.strictEqual(contacts[contactUsername], undefined)
            contacts[contactUsername] = contact
            castSessionMessage(['addContact', [contactUsername, contact]], token)
            if (requests[contactUsername] !== undefined) {
                delete requests[contactUsername]
            }
            if (ignoreds[contactUsername] !== undefined) {
                delete ignoreds[contactUsername]
            }
            AddReferer(contactUsername, username, publicProfile)
        },
        addReferer: (refererUsername, refererProfile) => {

            assert.strictEqual(referers[refererUsername], undefined)
            referers[refererUsername] = {}

            var contact = contacts[refererUsername]
            if (contact === undefined) {
                if (requests[refererUsername] === undefined &&
                    ignoreds[refererUsername] === undefined) {

                    requests[refererUsername] = refererProfile
                    castSessionMessage(['addRequest', [refererUsername, refererProfile]])

                }
            } else {
                contact.online = true
                contact.profile = refererProfile
                castSessionMessage(['online', refererUsername])
                castSessionMessage(['editContactProfile', [refererUsername, refererProfile]])
                if (Object.keys(sessions).length !== 0) {
                    SendContactOnline(username, refererUsername)
                }
                SendEditContactProfile(username, refererUsername, profile, true)
            }

        },
        addSession: (token, session) => {

            assert.strictEqual(sessions[token], undefined)
            sessions[token] = session

            if (Object.keys(sessions).length === 1) {
                CastUserOnline(contacts, username)
            }

        },
        changePassword: _password => {
            assert(_password.key instanceof Buffer)
            assert(_password.digest instanceof Buffer)
            password = _password
        },
        contactOffline: contactUsername => {
            assert.notStrictEqual(contacts[contactUsername], undefined)
            contacts[contactUsername].online = false
            castSessionMessage(['offline', contactUsername])
        },
        contactOnline: contactUsername => {
            assert.notStrictEqual(contacts[contactUsername], undefined)
            contacts[contactUsername].online = true
            castSessionMessage(['online', contactUsername])
        },
        editContactProfile: (contactUsername, contactProfile, requestReturn) => {
            assert.notStrictEqual(contacts[contactUsername], undefined)
            contacts[contactUsername].profile = contactProfile
            castSessionMessage(['editContactProfile', [contactUsername, contactProfile]])
            if (requestReturn) {
                SendEditContactProfile(username, contactUsername, profile, false)
            }
        },
        editProfile: (_profile, token) => {

            assert.strictEqual(typeof _profile.fullName, 'string')
            assert.strictEqual(typeof _profile.email, 'string')
            assert.strictEqual(typeof _profile.phone, 'string')

            profile = _profile

            castSessionMessage(['editProfile', profile], token)
            CastContactProfile(contacts, username, profile)

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
        ignoreRequest: (requestUsername, token) => {
            assert.notStrictEqual(requests[requestUsername], undefined)
            delete requests[requestUsername]
            castSessionMessage(['ignoreRequest', requestUsername], token)
            ignoreds[requestUsername] = {}
        },
        overrideContactProfile: (contactUsername, profile, token) => {
            assert.notStrictEqual(contacts[contactUsername], undefined)
            contacts[contactUsername].overrideProfile = profile
            castSessionMessage(['overrideContactProfile', [contactUsername, profile]], token)
        },
        passwordMatches: otherPassword => {
            if (otherPassword === undefined) return false
            var hmac = crypto.createHmac('sha512', password.key)
            var digest = hmac.update(otherPassword).digest()
            return digest.compare(password.digest) === 0
        },
        receiveTextMessage: (contactUsername, text, token) => {
            assert.notStrictEqual(contacts[contactUsername], undefined)
            castSessionMessage(['receiveTextMessage', [contactUsername, text]], token)
        },
        removeContact: (contactUsername, token) => {
            assert.notStrictEqual(contacts[contactUsername], undefined)
            delete contacts[contactUsername]
            castSessionMessage(['removeContact', contactUsername], token)
            RemoveReferer(contactUsername, username, publicProfile)
        },
        removeReferer: (refererUsername, publicProfile) => {

            assert.notStrictEqual(referers[refererUsername], undefined)
            delete referers[refererUsername]

            var contact = contacts[refererUsername]
            if (contact === undefined || !contact.online) return
            contact.online = false
            contact.profile = publicProfile
            castSessionMessage(['offline', refererUsername])

        },
        removeRequest: (requestUsername, token) => {
            assert.notStrictEqual(requests[requestUsername], undefined)
            delete requests[requestUsername]
            castSessionMessage(['removeRequest', requestUsername], token)
        },
        removeSession: token => {

            assert.notStrictEqual(sessions[token], undefined)
            delete sessions[token]

            if (Object.keys(sessions).length === 0) {
                CastUserOffline(contacts, username)
            }

        },
        sendTextMessage: (contactUsername, text, token) => {
            assert.notStrictEqual(contacts[contactUsername], undefined)
            castSessionMessage(['sendTextMessage', [contactUsername, text]], token)
            SendTextMessage(username, contactUsername, text)
        },
        toStorageObject: () => {

            var storageSessions = {}
            for (var i in sessions) {
                storageSessions[i] = sessions[i].toStorageObject()
            }

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
