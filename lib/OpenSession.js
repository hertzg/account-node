var http = require('http')

var Error500Page = require('./Error500Page.js'),
    Log = require('./Log.js'),
    Session = require('./Session.js')

var sessionNode = require('../config.js').sessionNode

module.exports = (username, user, res) => {

    function errorListener (err) {
        Log.error('session-node-client: open: ' + JSON.stringify(err))
        Error500Page(res)
    }

    var proxyReq = http.request({
        host: sessionNode.host,
        port: sessionNode.port,
        path: '/open?username=' + encodeURIComponent(username),
    }, proxyRes => {

        var statusCode = proxyRes.statusCode
        if (statusCode !== 200) {
            Log.error('session-node-client: open: HTTP status code ' + statusCode)
            Error500Page(res)
            return
        }

        var responseText = ''
        proxyRes.setEncoding('utf8')
        proxyRes.on('data', chunk => {
            responseText += chunk
        })
        proxyRes.on('end', () => {
            var token = JSON.parse(responseText)
            user.addSession(username, token, Session(() => {
                user.removeSession(username, token)
            }))
            res.end(JSON.stringify({
                token: token,
                profile: user.getProfile(),
                contacts: user.getContacts(),
                requests: user.getRequests(),
            }))
        })

    })
    proxyReq.end()
    proxyReq.on('error', errorListener)

}
