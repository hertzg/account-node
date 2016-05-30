function shutdown () {
    for (var i in users) {
        var object = users[i].toStorageObject()
        fs.writeFileSync('dump/' + i, JSON.stringify(object, null, 4))
    }
    process.exit()
}

var fs = require('fs'),
    http = require('http'),
    url = require('url')

var config = require('./config.js'),
    Error404Page = require('./lib/Error404Page.js'),
    RestoreUser = require('./lib/RestoreUser.js')

var users = Object.create(null)
fs.readdirSync('dump').forEach(username => {
    if (username === '.gitignore') return
    var content = fs.readFileSync('dump/' + username, 'utf8')
    users[username] = RestoreUser(JSON.parse(content))
})

var pages = Object.create(null)
pages['/'] = require('./lib/IndexPage.js')
pages['/addContact'] = require('./lib/AddContactPage.js')(users)
pages['/changePassword'] = require('./lib/ChangePasswordPage.js')(users)
pages['/editContact'] = require('./lib/EditContactPage.js')(users)
pages['/editProfile'] = require('./lib/EditProfilePage.js')(users)
pages['/publicProfile'] = require('./lib/PublicProfilePage.js')(users)
pages['/removeContact'] = require('./lib/RemoveContactPage.js')(users)
pages['/signIn'] = require('./lib/SignInPage.js')(users)
pages['/signOut'] = require('./lib/SignOutPage.js')(users)
pages['/signUp'] = require('./lib/SignUpPage.js')(users)

http.createServer((req, res) => {
    var parsedUrl = url.parse(req.url, true)
    var page = pages[parsedUrl.pathname]
    if (page === undefined) page = Error404Page
    page(req, res, parsedUrl)
}).listen(config.port, config.host)

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
