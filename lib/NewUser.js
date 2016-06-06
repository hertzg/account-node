var User = require('./User.js')

module.exports = (username, password) => {

    var profile = {
        fullName: '',
        fullNamePrivacy: 'contacts',
        email: '',
        emailPrivacy: 'private',
        phone: '',
        phonePrivacy: 'private',
    }

    return User(username, password, profile, Date.now(),
        Object.create(null), Object.create(null), Object.create(null),
        Object.create(null), Object.create(null), Object.create(null))

}
