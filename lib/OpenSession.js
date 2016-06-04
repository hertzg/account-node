var http = require('http')

var Error500Page = require('./Error500Page.js'),
    Log = require('./Log.js'),
    Session = require('./Session.js')

var sessionNode = require('../config.js').sessionNode

module.exports = (username, user, res, longTerm, doneCallback) => {

    function errorListener (err) {
        Log.error(logPrefix + err.code)
        Error500Page(res)
    }

    var host = sessionNode.host,
        port = sessionNode.port

    var logPrefix = 'session-node-client: ' + host + ':' + port + ': open: '

    var path = '/open?username=' + encodeURIComponent(username)
    if (longTerm) path += '&longTerm=true'

    var proxyReq = http.request({
        host: host,
        port: port,
        path: path,
    }, proxyRes => {

        var statusCode = proxyRes.statusCode
        if (statusCode !== 200) {
            Log.error(logPrefix + 'HTTP status code ' + statusCode)
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
            user.addSession(token, Session(longTerm, () => {
                user.removeSession(token)
            }))
            res.end(JSON.stringify({
                token: token,
                profile: user.getProfile(),
                contacts: user.getContacts(),
                requests: user.getRequests(),
            }))
            if (doneCallback !== undefined) doneCallback()
        })

    })
    proxyReq.end()
    proxyReq.on('error', errorListener)

}
