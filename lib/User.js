var assert = require('assert'),
    crypto = require('crypto')

var AddReferer = require('./AddReferer.js'),
    CastContactProfile = require('./CastContactProfile.js'),
    CastSessionMessage = require('./CastSessionMessage.js'),
    CastUserOnline = require('./CastUserOnline.js'),
    CastUserOffline = require('./CastUserOffline.js'),
    IsPlainObject = require('./IsPlainObject.js'),
    RemoveReferer = require('./RemoveReferer.js'),
    SendContactOnline = require('./SendContactOnline.js'),
    SendEditContactProfile = require('./SendEditContactProfile.js'),
    SendTextMessage = require('./SendTextMessage.js')

module.exports = (username, password, profile, registerTime,
    sessions, contacts, referers, requests, ignoreds) => {

    function castSessionMessage (message, token) {
        CastSessionMessage(sessions, username, message, token)
    }

    assert.strictEqual(typeof password, 'object')
    assert(password instanceof Object)

    assert(password.key instanceof Buffer)
    assert(password.digest instanceof Buffer)

    assert.strictEqual(typeof profile.fullName, 'string')
    assert.strictEqual(typeof profile.email, 'string')
    assert.strictEqual(typeof profile.phone, 'string')
    assert.strictEqual(typeof registerTime, 'number')

    assert(IsPlainObject(sessions))
    assert(IsPlainObject(contacts))
    assert(IsPlainObject(referers))
    assert(IsPlainObject(requests))
    assert(IsPlainObject(ignoreds))

    ;(() => {
        for (var i in contacts) {
            var contact = contacts[i]
            assert(contact instanceof Object)
            assert.strictEqual(typeof contact.online, 'boolean')
            assert(contact.profile instanceof Object)
            assert(contact.overrideProfile instanceof Object)
        }
    })()

    var contactsProfile = {
        fullName: profile.fullName,
        email: '',
        phone: '',
    }

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
            AddReferer(contactUsername, username, contactsProfile)
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
                SendEditContactProfile(username, refererUsername, contactsProfile, true)
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
                SendEditContactProfile(username, contactUsername, contactsProfile, false)
            }
        },
        editProfile: (_profile, token) => {
            profile = _profile
            castSessionMessage(['editProfile', profile], token)
            contactsProfile.fullName = profile.fullName
            CastContactProfile(contacts, username, contactsProfile)
        },
        editRequest: (requestUsername, requestProfile) => {
            assert.notStrictEqual(requests[requestUsername], undefined)
            requests[requestUsername] = requestProfile
            castSessionMessage(['editRequest', [requestUsername, requestProfile]])
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
        overrideContactProfile: (contactUsername, overrideProfile, token) => {
            assert.notStrictEqual(contacts[contactUsername], undefined)
            contacts[contactUsername].overrideProfile = overrideProfile
            castSessionMessage(['overrideContactProfile', [contactUsername, overrideProfile]], token)
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
