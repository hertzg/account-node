var crypto = require('crypto')

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
    contacts, referers, requests, ignoreds, sessions, longSessions) => {

    function castSessionMessage (message, token) {
        CastSessionMessage(sessions, username, message, token)
    }

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
        addLongSession: (token, session) => {
            longSessions[token] = session
        },
        addReferer: (refererUsername, refererProfile) => {

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

            sessions[token] = session

            if (Object.keys(sessions).length === 1) {
                CastUserOnline(contacts, username)
            }

        },
        changePassword: _password => {
            password = _password
        },
        contactOffline: contactUsername => {
            contacts[contactUsername].online = false
            castSessionMessage(['offline', contactUsername])
        },
        contactOnline: contactUsername => {
            contacts[contactUsername].online = true
            castSessionMessage(['online', contactUsername])
        },
        editContactProfile: (contactUsername, contactProfile, requestReturn) => {
            contacts[contactUsername].profile = contactProfile
            castSessionMessage(['editContactProfile', [contactUsername, contactProfile]])
            if (requestReturn) {
                SendEditContactProfile(username, contactUsername, contactsProfile, false)
            }
        },
        editProfile: (newProfile, token) => {

            var profileChanged = false,
                contactsProfileChanged = false,
                publicProfileChanged = false

            var fullName = newProfile.fullName
            if (profile.fullName !== fullName) {
                profile.fullName = fullName
                profileChanged = true
            }

            var fullNamePrivacy = newProfile.fullNamePrivacy
            if (profile.fullNamePrivacy !== fullNamePrivacy) {
                profile.fullNamePrivacy = fullNamePrivacy
                profileChanged = true
            }

            var contactsFullName = fullNamePrivacy === 'private' ? '' : fullName
            if (contactsProfile.fullName !== contactsFullName) {
                contactsProfile.fullName = contactsFullName
                contactsProfileChanged = true
            }

            var publicFullName = fullNamePrivacy === 'public' ? fullName : ''
            if (publicProfile.fullName !== publicFullName) {
                publicProfile.fullName = publicFullName
                publicProfileChanged = true
            }

            var email = newProfile.email
            if (profile.email !== email) {
                profile.email = email
                profileChanged = true
            }

            var emailPrivacy = newProfile.emailPrivacy
            if (profile.emailPrivacy !== emailPrivacy) {
                profile.emailPrivacy = emailPrivacy
                profileChanged = true
            }

            var contactsEmail = emailPrivacy === 'private' ? '' : email
            if (contactsProfile.email !== contactsEmail) {
                contactsProfile.email = contactsEmail
                contactsProfileChanged = true
            }

            var publicEmail = emailPrivacy === 'public' ? email : ''
            if (publicProfile.email !== publicEmail) {
                publicProfile.email = publicEmail
                publicProfileChanged = true
            }

            var phone = newProfile.phone
            if (profile.phone !== phone) {
                profile.phone = phone
                profileChanged = true
            }

            var phonePrivacy = newProfile.phonePrivacy
            if (profile.phonePrivacy !== phonePrivacy) {
                profile.phonePrivacy = phonePrivacy
                profileChanged = true
            }

            var contactsPhone = phonePrivacy === 'private' ? '' : phone
            if (contactsProfile.phone !== contactsPhone) {
                contactsProfile.phone = contactsPhone
                contactsProfileChanged = true
            }

            var publicPhone = phonePrivacy === 'public' ? phone : ''
            if (publicProfile.phone !== publicPhone) {
                publicProfile.phone = publicPhone
                publicProfileChanged = true
            }

            if (profileChanged) {
                castSessionMessage(['editProfile', profile], token)
            }
            if (contactsProfileChanged || publicProfileChanged) {
                CastContactProfile(contacts, referers, username, contactsProfile, publicProfile)
            }

        },
        editRequest: (requestUsername, requestProfile) => {
            requests[requestUsername] = requestProfile
            castSessionMessage(['editRequest', [requestUsername, requestProfile]])
        },
        getContact: username => {
            return contacts[username]
        },
        getContacts: () => {
            return contacts
        },
        getLongSession: token => {
            return longSessions[token]
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
            delete requests[requestUsername]
            castSessionMessage(['ignoreRequest', requestUsername], token)
            ignoreds[requestUsername] = {}
        },
        overrideContactProfile: (contactUsername, overrideProfile, token) => {
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
            castSessionMessage(['receiveTextMessage', [contactUsername, text]], token)
        },
        removeContact: (contactUsername, token) => {
            delete contacts[contactUsername]
            castSessionMessage(['removeContact', contactUsername], token)
            RemoveReferer(contactUsername, username, publicProfile)
        },
        removeLongSession: token => {
            delete longSessions[token]
        },
        removeReferer: (refererUsername, publicProfile) => {

            delete referers[refererUsername]

            var contact = contacts[refererUsername]
            if (contact === undefined || !contact.online) return
            contact.online = false
            contact.profile = publicProfile
            castSessionMessage(['offline', refererUsername])

        },
        removeRequest: (requestUsername, token) => {
            delete requests[requestUsername]
            castSessionMessage(['removeRequest', requestUsername], token)
        },
        removeSession: token => {

            delete sessions[token]

            if (Object.keys(sessions).length === 0) {
                CastUserOffline(contacts, username)
            }

        },
        sendTextMessage: (contactUsername, text, token) => {
            castSessionMessage(['sendTextMessage', [contactUsername, text]], token)
            SendTextMessage(username, contactUsername, text)
        },
        toStorageObject: () => {
            return {
                password: {
                    key: password.key.toString('base64'),
                    digest: password.digest.toString('base64'),
                },
                profile: profile,
                registerTime: registerTime,
                contacts: contacts,
                referers: referers,
                requests: requests,
                ignoreds: ignoreds,
                sessions: (() => {
                    var object = {}
                    for (var i in sessions) {
                        object[i] = sessions[i].toStorageObject()
                    }
                    return object
                })(),
                longSessions: (() => {
                    var object = {}
                    for (var i in longSessions) {
                        object[i] = longSessions[i].toStorageObject()
                    }
                    return object
                })(),
            }

        },
    }

}
