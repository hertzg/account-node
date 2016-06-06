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
    Log = require('./lib/Log.js')

var users = require('./lib/RestoreUsers.js')()

var pages = Object.create(null)
pages['/'] = require('./lib/Page/Index.js')
pages['/accountNode/addReferer'] = require('./lib/Page/AccountNode/AddReferer.js')(users)
pages['/accountNode/contactOnline'] = require('./lib/Page/AccountNode/ContactOnline.js')(users)
pages['/accountNode/contactProfile'] = require('./lib/Page/AccountNode/ContactProfile.js')(users)
pages['/accountNode/editContactProfile'] = require('./lib/Page/AccountNode/EditContactProfile.js')(users)
pages['/accountNode/receiveTextMessage'] = require('./lib/Page/AccountNode/ReceiveTextMessage.js')(users)
pages['/accountNode/removeReferer'] = require('./lib/Page/AccountNode/RemoveReferer.js')(users)
pages['/accountNode/userOffline'] = require('./lib/Page/AccountNode/UserOffline.js')(users)
pages['/accountNode/userOnline'] = require('./lib/Page/AccountNode/UserOnline.js')(users)
pages['/frontNode/publicProfile'] = require('./lib/Page/FrontNode/PublicProfile.js')(users)
pages['/frontNode/restoreSession'] = require('./lib/Page/FrontNode/RestoreSession.js')(users)
pages['/frontNode/signIn'] = require('./lib/Page/FrontNode/SignIn.js')(users)
pages['/frontNode/signUp'] = require('./lib/Page/FrontNode/SignUp.js')(users)
pages['/sessionNode/addContact'] = require('./lib/Page/SessionNode/AddContact.js')(users)
pages['/sessionNode/changePassword'] = require('./lib/Page/SessionNode/ChangePassword.js')(users)
pages['/sessionNode/editProfile'] = require('./lib/Page/SessionNode/EditProfile.js')(users)
pages['/sessionNode/ignoreRequest'] = require('./lib/Page/SessionNode/IgnoreRequest.js')(users)
pages['/sessionNode/overrideContactProfile'] = require('./lib/Page/SessionNode/OverrideContactProfile.js')(users)
pages['/sessionNode/removeContact'] = require('./lib/Page/SessionNode/RemoveContact.js')(users)
pages['/sessionNode/removeRequest'] = require('./lib/Page/SessionNode/RemoveRequest.js')(users)
pages['/sessionNode/sendTextMessage'] = require('./lib/Page/SessionNode/SendTextMessage.js')(users)
pages['/sessionNode/signOut'] = require('./lib/Page/SessionNode/SignOut.js')(users)
pages['/sessionNode/wakeSession'] = require('./lib/Page/SessionNode/WakeSession.js')(users)

http.createServer((req, res) => {
    Log.http(req.method + ' ' + req.url)
    var parsedUrl = url.parse(req.url, true)
    var page = pages[parsedUrl.pathname]
    if (page === undefined) page = Error404Page
    page(req, res, parsedUrl)
}).listen(config.port, config.host)

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
