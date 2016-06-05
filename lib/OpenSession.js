var http = require('http')

var Error500Page = require('./Error500Page.js'),
    Log = require('./Log.js'),
    LongSession = require('./LongSession.js'),
    Session = require('./Session.js')

var sessionNode = require('../config.js').sessionNode

var host = sessionNode.host,
    port = sessionNode.port

var logPrefix = 'session-node-client: ' + host + ':' + port + ': open: '

module.exports = (username, user, res, longTerm) => {

    function errorListener (err) {
        Log.error(logPrefix + err.code)
        Error500Page(res)
    }

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
            user.addSession(token, Session(longTerm, Date.now(), () => {
                user.removeSession(token)
                if (longTerm) {
                    user.addLongSession(token, LongSession(Date.now(), () => {
                        user.removeLongSession(token)
                    }))
                }
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
