var http = require('http')

var Error500Page = require('./Error500Page.js')

var sessionNode = require('../config.js').sessionNode

module.exports = users => {
    return (req, res, parsedUrl) => {

        res.setHeader('Content-Type', 'application/json')

        var query = parsedUrl.query

        var username = query.username
        if (username === undefined) {
            res.end('"INVALID_USERNAME"')
            return
        }

        var password = query.password
        if (password === undefined) {
            res.end('"INVALID_PASSWORD"')
            return
        }

        var user = users[username]
        if (user === undefined) {
            res.end('"NO_SUCH_USER"')
            return
        }

        if (!user.passwordMatches(password)) {
            res.end('"INCORRECT_PASSWORD"')
            return
        }

        ;(() => {

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
                    res.end(JSON.stringify({
                        token: JSON.parse(responseText),
                        user: user.toClientObject(),
                    }))
                })

            })
            proxyReq.end()
            proxyReq.on('error', errorListener)

        })()

    }
}
