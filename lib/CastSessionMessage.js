var http = require('http')

var Log = require('./Log.js')

var sessionNode = require('../config.js').sessionNode

module.exports = (username, message, token, closeListener) => {

    function errorListener (err) {
        Log.error(logPrefix + err.code)
    }

    var path = '/receiveMessage?username=' + encodeURIComponent(username)
    if (token !== undefined) path += '&token=' + encodeURIComponent(token)

    var host = sessionNode.host,
        port = sessionNode.port

    var logPrefix = 'session-node-client: ' + host + ':' + port + ': receiveMessage: '

    var proxyReq = http.request({
        host: host,
        port: port,
        path: path,
        method: 'post',
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

            if (response === 'INVALID_USERNAME') {
                closeListener()
                return
            }

            if (response !== true) {
                Log.error(logPrefix + 'Invalid response: ' + JSON.stringify(response))
            }

        })

    })
    proxyReq.end(JSON.stringify(message))
    proxyReq.on('error', errorListener)

}
