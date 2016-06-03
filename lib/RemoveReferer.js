var http = require('http')

var Log = require('./Log.js')

var accountNode = require('../config.js').accountNode

module.exports = (contactUsername, username) => {

    function errorListener (err) {
        Log.error(logPrefix + err.code)
    }

    var host = accountNode.host,
        port = accountNode.port

    var logPrefix = 'account-node-client: ' + host + ':' + port + ': removeReferer: '

    var proxyReq = http.request({
        host: host,
        port: port,
        path: '/removeReferer?username=' + encodeURIComponent(contactUsername) +
            '&refererUsername=' + encodeURIComponent(username),
    }, proxyRes => {

        var statusCode = proxyRes.statusCode
        if (statusCode !== 200) {
            Log.error(logPrefix + 'HTTP status code ' + statusCode)
            return
        }

        var responseText = ''
        proxyRes.setEncoding('utf8')
        proxyRes.on('data', chunk => {
            responseText += chunk
        })
        proxyRes.on('end', () => {
            var response = JSON.parse(responseText)
            if (response !== true) {
                Log.error(logPrefix + 'Invalid response: ' + JSON.stringify(response))
            }
        })

    })
    proxyReq.end()
    proxyReq.on('error', errorListener)

}
