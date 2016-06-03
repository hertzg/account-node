var Log = require('../Log.js')

module.exports = users => {
    return (req, res, parsedUrl) => {

        for (var i in users) {
            var user = users[i]
            for (var j in user.getContacts()) {
                if (j === parsedUrl.query.username) {
                    user.contactOffline(j)
                    break
                }
            }
        }

        res.setHeader('Content-Type', 'application/json')
        res.end('true')

    }
}
