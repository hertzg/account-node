var http = require('http')

var Log = require('./Log.js')

var accountNode = require('../config.js').accountNode

module.exports = (username, closeListener) => {

    function errorListener (err) {
        Log.error('account-node-client: userOffline: ' + JSON.stringify(err))
    }

    var proxyReq = http.request({
        host: accountNode.host,
        port: accountNode.port,
        path: '/userOffline?username=' + encodeURIComponent(username),
    }, proxyRes => {

        var statusCode = proxyRes.statusCode
        if (statusCode !== 200) {
            Log.error('account-node-client: userOffline: HTTP status code ' + statusCode)
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
                Log.error('account-node-client: userOffline: Invalid response: ' + JSON.stringify(response))
            }
        })

    })
    proxyReq.end()
    proxyReq.on('error', errorListener)

}
