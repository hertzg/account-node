var http = require('http')

var Log = require('./Log.js')

var sessionNode = require('../config.js').sessionNode

module.exports = closeListener => {

    function close () {
        closed = true
        closeListener()
    }

    var closed = false

    return {
        close: function () {
            assert.strictEqual(closed, false)
            close()
        },
        sendMessage: (token, message) => {

            function errorListener (err) {
                Log.error('session-node-client: receiveMessage: ' + JSON.stringify(err))
            }

            var proxyReq = http.request({
                host: sessionNode.host,
                port: sessionNode.port,
                path: '/receiveMessage?token=' + encodeURIComponent(token),
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

                    if (response === 'INVALID_TOKEN') {
                        if (!closed) close()
                        return
                    }

                    if (response !== true) {
                        Log.error('session-node-client: receiveMessage: Invalid response: ' + JSON.stringify(responseText))
                    }

                })

            })
            proxyReq.end(JSON.stringify(message))
            proxyReq.on('error', errorListener)

        },
    }

}
