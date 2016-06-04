var http = require('http')

var Log = require('./Log.js')

var accountNode = require('../config.js').accountNode

var host = accountNode.host,
    port = accountNode.port

var logPrefix = 'account-node-client: ' + host + ':' + port + ': userOffline: '

module.exports = (contacts, username) => {

    function errorListener (err) {
        Log.error(logPrefix + err.code)
    }

    var affectedContacts = []
    for (var i in contacts) affectedContacts.push(contacts[i])
    if (affectedContacts.length === 0) return

    var proxyReq = http.request({
        host: host,
        port: port,
        path: '/userOffline?username=' + encodeURIComponent(username),
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
