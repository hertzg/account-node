var http = require('http')

var Error500Page = require('./Error500Page.js')

var sessionNode = require('../config.js').sessionNode

module.exports = (username, user, res) => {

    function errorListener (err) {
        console.log('ERROR: session-node-client: open: ' + JSON.stringify(err))
        Error500Page(res)
    }

    var proxyReq = http.request({
        host: sessionNode.host,
        port: sessionNode.port,
        path: '/open?username=' + encodeURIComponent(username),
    }, proxyRes => {

        var statusCode = proxyRes.statusCode
        if (statusCode !== 200) {
            console.log('ERROR: session-node-client:open: HTTP status code ' + statusCode)
            Error500Page(res)
            return
        }

        var responseText = ''
        proxyRes.setEncoding('utf8')
        proxyRes.on('data', chunk => {
            responseText += chunk
        })
        proxyRes.on('end', () => {
            var token = JSON.parse(responseText)
            user.addSession(token)
            res.end(JSON.stringify({
                token: token,
                user: user.toClientObject(),
            }))
        })

    })
    proxyReq.end()
    proxyReq.on('error', errorListener)

}