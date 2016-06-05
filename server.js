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
    Log = require('./lib/Log.js'),
    RestoreUser = require('./lib/RestoreUser.js')

var users = Object.create(null)
;(() => {
    var groups = Object.create(null)
    fs.readdirSync('dump').forEach(username => {
        if (username === '.gitignore') return
        var content = fs.readFileSync('dump/' + username, 'utf8')
        users[username] = RestoreUser(groups, username, JSON.parse(content))
    })
})()

var pages = Object.create(null)
pages['/'] = require('./lib/Page/Index.js')
pages['/addContact'] = require('./lib/Page/AddContact.js')(users)
pages['/addReferer'] = require('./lib/Page/AddReferer.js')(users)
pages['/changePassword'] = require('./lib/Page/ChangePassword.js')(users)
pages['/contactOnline'] = require('./lib/Page/ContactOnline.js')(users)
pages['/contactProfile'] = require('./lib/Page/ContactProfile.js')(users)
pages['/editContactProfile'] = require('./lib/Page/EditContactProfile.js')(users)
pages['/editProfile'] = require('./lib/Page/EditProfile.js')(users)
pages['/ignoreRequest'] = require('./lib/Page/IgnoreRequest.js')(users)
pages['/overrideContactProfile'] = require('./lib/Page/OverrideContactProfile.js')(users)
pages['/publicProfile'] = require('./lib/Page/PublicProfile.js')(users)
pages['/receiveTextMessage'] = require('./lib/Page/ReceiveTextMessage.js')(users)
pages['/removeContact'] = require('./lib/Page/RemoveContact.js')(users)
pages['/removeReferer'] = require('./lib/Page/RemoveReferer.js')(users)
pages['/removeRequest'] = require('./lib/Page/RemoveRequest.js')(users)
pages['/restoreSession'] = require('./lib/Page/RestoreSession.js')(users)
pages['/sendTextMessage'] = require('./lib/Page/SendTextMessage.js')(users)
pages['/signIn'] = require('./lib/Page/SignIn.js')(users)
pages['/signOut'] = require('./lib/Page/SignOut.js')(users)
pages['/signUp'] = require('./lib/Page/SignUp.js')(users)
pages['/userOffline'] = require('./lib/Page/UserOffline.js')(users)
pages['/userOnline'] = require('./lib/Page/UserOnline.js')(users)
pages['/wakeSession'] = require('./lib/Page/WakeSession.js')(users)

http.createServer((req, res) => {
    Log.http(req.method + ' ' + req.url)
    var parsedUrl = url.parse(req.url, true)
    var page = pages[parsedUrl.pathname]
    if (page === undefined) page = Error404Page
    page(req, res, parsedUrl)
}).listen(config.port, config.host)

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
