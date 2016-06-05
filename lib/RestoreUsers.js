var fs = require('fs')

var RestoreUser = require('./RestoreUser.js'),
    SessionGroup = require('./SessionGroup.js')

module.exports = () => {

    function getGroup (identifier) {
        var group = sessionGroups[identifier]
        if (group === undefined) {
            group = sessionGroups[identifier] = SessionGroup(identifier)
        }
        return group
    }

    var users = Object.create(null)
    var sessionGroups = Object.create(null)

    fs.readdirSync('dump').forEach(username => {
        if (username === '.gitignore') return
        var content = fs.readFileSync('dump/' + username, 'utf8')
        users[username] = RestoreUser(getGroup, username, JSON.parse(content))
    })

    return users

}
