var User = require('./User.js')

module.exports = (username, password) => {

    var profile = {
        fullName: '',
        email: '',
        phone: '',
    }

    return User(username, password, profile, Date.now(),
        Object.create(null), Object.create(null), Object.create(null),
        Object.create(null), Object.create(null))

}
