var http = require('http')

var Log = require('./Log.js')

var accountNode = require('../config.js').accountNode

var host = accountNode.host,
    port = accountNode.port

var logPrefix = 'account-node-client: ' + host + ':' + port + ': accountNode/contactProfile: '

module.exports = (contacts, referers, username, contactsProfile, publicProfile) => {

    function errorListener (err) {
        Log.error(logPrefix + err.code)
    }

    var affectedUsernames = []
    for (var i in contacts) affectedUsernames.push(contacts[i])
    for (var i in referers) affectedUsernames.push(referers[i])
    if (affectedUsernames.length === 0) return

    var proxyReq = http.request({
        host: host,
        port: port,
        path: '/accountNode/contactProfile?username=' + encodeURIComponent(username) +
            '&contactsFullName=' + encodeURIComponent(contactsProfile.fullName) +
            '&contactsEmail=' + encodeURIComponent(contactsProfile.email) +
            '&contactsPhone=' + encodeURIComponent(contactsProfile.phone) +
            '&publicFullName=' + encodeURIComponent(publicProfile.fullName) +
            '&publicEmail=' + encodeURIComponent(publicProfile.email) +
            '&publicPhone=' + encodeURIComponent(publicProfile.phone),
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
