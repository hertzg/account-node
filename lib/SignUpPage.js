var crypto = require('crypto'),
    http = require('http')

var Error500Page = require('./Error500Page.js'),
    Log = require('./Log.js'),
    OpenSession = require('./OpenSession.js'),
    User = require('./User.js')

var captchaNode = require('../config.js').captchaNode

module.exports = users => {
    return (req, res, parsedUrl) => {

        res.setHeader('Content-Type', 'application/json')

        var query = parsedUrl.query

        var username = query.username
        if (username === undefined || username.length < 6 ||
            username.match(/[^a-z0-9_.-]/i)) {

            res.end('"INVALID_USERNAME"')
            return

        }

        var password = query.password
        if (password === undefined || password.length < 6 ||
            password.match(/^\d+$/)) {

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
                Log.error('captcha-node-client: verify: ' + JSON.stringify(err))
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
                    Log.error('captcha-node-client: verify: HTTP status code ' + statusCode)
                    Error500Page(res)
                    return
                }

                var responseText = ''
                proxyRes.setEncoding('utf8')
                proxyRes.on('data', chunk => {
                    responseText += chunk
                })
                proxyRes.on('end', () => {

                    var response = JSON.parse(responseText)

                    if (response.error === 'INVALID_TOKEN') {
                        res.end(JSON.stringify({
                            error: 'INVALID_CAPTCHA_TOKEN',
                            newCaptcha: response.newCaptcha,
                        }))
                        return
                    }

                    if (response === 'INVALID_VALUE') {
                        res.end('"INVALID_CAPTCHA_VALUE"')
                        return
                    }

                    if (response !== true) {
                        Log.error('captcha-node-client: verify: Invalid response: ' + JSON.stringify(response))
                        Error500Page(res)
                        return
                    }

                    var passwordKey = crypto.randomBytes(64)
                    var hmac = crypto.createHmac('sha512', passwordKey)

                    var user = User({
                        key: passwordKey,
                        digest: hmac.update(password).digest(),
                    }, '', '', '', Date.now(), Object.create(null), Object.create(null))
                    users[username] = user

                    Log.info('User ' + username + ' signed up')
                    OpenSession(username, user, res)

                })

            })
            proxyReq.end()
            proxyReq.on('error', errorListener)

        })()

    }
}
