var http = require('http')

var Log = require('./Log.js')

var accountNode = require('../config.js').accountNode

module.exports = (contactUsername, username) => {

    function errorListener (err) {
        Log.error('account-node-client: removeReferer: ' + JSON.stringify(err))
    }

    var proxyReq = http.request({
        host: accountNode.host,
        port: accountNode.port,
        path: '/removeReferer?username=' + encodeURIComponent(contactUsername) +
            '&refererUsername=' + encodeURIComponent(username),
    }, proxyRes => {

        var statusCode = proxyRes.statusCode
        if (statusCode !== 200) {
            Log.error('account-node-client: removeReferer: HTTP status code ' + statusCode)
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
                Log.error('account-node-client: removeReferer: Invalid response: ' + JSON.stringify(response))
            }
        })

    })
    proxyReq.end()
    proxyReq.on('error', errorListener)

}
