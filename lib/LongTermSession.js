var assert = require('assert')

module.exports = closeListener => {

    function close () {
        closed = true
        closeListener()
    }

    function startTimeout () {
        timeout = setTimeout(close, 1000 * 60 * 60 * 24 * 7)
    }

    var closed = false

    var timeout
    startTimeout()

    return {
        close: () => {
            assert.strictEqual(closed, false)
            clearTimeout(timeout)
            close()
        },
        toStorageObject: () => {
            return {}
        },
        wake: () => {
            assert.strictEqual(closed, false)
            clearTimeout(timeout)
            startTimeout()
        },
    }

}
