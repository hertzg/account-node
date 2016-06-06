var http = require('http')

var Log = require('./Log.js')

var sessionNode = require('../config.js').sessionNode

var host = sessionNode.host,
    port = sessionNode.port

var logPrefix = 'session-node-client: ' + host + ':' + port + ': accountNode/close: '

module.exports = token => {

    function errorListener (err) {
        Log.error(logPrefix + err.code)
    }

    var proxyReq = http.request({
        host: host,
        port: port,
        path: '/accountNode/close?token=' + encodeURIComponent(token),
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
