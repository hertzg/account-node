var http = require('http')

var Log = require('./Log.js')

var accountNode = require('../config.js').accountNode

module.exports = (username, contactUsername, text) => {

    function errorListener (err) {
        Log.error(logPrefix + err.code)
    }

    var host = accountNode.host,
        port = accountNode.port

    var logPrefix = 'account-node-client: ' + host + ':' + port + ': receiveTextMessage: '

    var proxyReq = http.request({
        host: host,
        port: port,
        path: '/receiveTextMessage' +
            '?username=' + encodeURIComponent(contactUsername) +
            '&contactUsername=' + encodeURIComponent(username) +
            '&text=' + encodeURIComponent(text),
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
