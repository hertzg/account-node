var http = require('http')

var captchaNode = require('../config.js').captchaNode

module.exports = users => {
    return (req, res, parsedUrl) => {

        res.setHeader('Content-Type', 'application/json')

        var query = parsedUrl.query

        var username = query.username
        if (username === undefined || username.length < 6 ||
            username.match(/[^a-z0-9._-]/i)) {

            res.end('"INVALID_USERNAME"')
            return

        }

        var password = query.password
        if (password === undefined || password.length < 6) {
            res.end('"INVALID_PASSWORD"')
            return
        }

        var captcha_token = query.captcha_token,
            captcha_value = query.captcha_value
        if (captcha_token === undefined || captcha_value === undefined) {
            res.end('"CAPTCHA_REQUIRED"')
            return
        }

        if (users[username] !== undefined) {
            res.end('"USERNAME_UNAVAILABLE"')
            return
        }

        ;(() => {

            function errorListener (err) {
                console.log('ERROR: captcha-node-client: ' + JSON.stringify(err))
                Error500Page(res)
            }

            var proxyReq = http.request({
                host: captchaNode.host,
                port: captchaNode.port,
                path: '/verify?token=' + encodeURIComponent(captcha_token) +
                    '&value=' + encodeURIComponent(captcha_value),
            }, proxyRes => {

                proxyReq.removeListener('error', errorListener)

                var statusCode = proxyRes.statusCode
                if (statusCode !== 200) {
                    console.log('ERROR: captcha-node-client: HTTP status code ' + statusCode)
                    Error500Page(res)
                    return
                }

                var data = ''
                proxyRes.setEncoding('utf8')
                proxyRes.on('data', chunk => {
                    data += chunk
                })
                proxyRes.on('end', () => {

                    if (data === '"INVALID_TOKEN"') {
                        res.end('"INVALID_CAPTCHA_TOKEN"')
                        return
                    }

                    if (data === '"INVALID_VALUE"') {
                        res.end('"INVALID_CAPTCHA_VALUE"')
                        return
                    }

                    if (data !== 'true') {
                        console.log('ERROR: captcha-node-client: Invalid response ' + JSON.stringify(data))
                        Error500Page(res)
                        return
                    }

                    users[username] = {
                        password: password,
                        registerTime: Date.now(),
                    }
                    console.log('INFO: User:' + username + ' signed up.')
                    res.end('true')

                })

            })
            proxyReq.end()
            proxyReq.on('error', errorListener)

        })()

    }
}
