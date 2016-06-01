var http = require('http')

var Log = require('./Log.js')

var sessionNode = require('../config.js').sessionNode

module.exports = (username, message, token, closeListener) => {

    function errorListener (err) {
        Log.error('session-node-client: receiveMessage: ' + JSON.stringify(err))
    }

    var path = '/receiveMessage?username=' + encodeURIComponent(username)
    if (token !== undefined) path += '&token=' + encodeURIComponent(token)

    var proxyReq = http.request({
        host: sessionNode.host,
        port: sessionNode.port,
        path: path,
        method: 'post',
    }, proxyRes => {

        var statusCode = proxyRes.statusCode
        if (statusCode !== 200) {
            Log.error('session-node-client: receiveMessage: HTTP status code ' + statusCode)
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
                Log.error('session-node-client: receiveMessage: Invalid response: ' + JSON.stringify(response))
            }

        })

    })
    proxyReq.end(JSON.stringify(message))
    proxyReq.on('error', errorListener)

}
