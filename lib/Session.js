var assert = require('assert')

module.exports = closeListener => {

    function close () {
        closed = true
        closeListener()
    }

    function startTimeout () {
        timeout = setTimeout(close, 1000 * 30)
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
        wake: () => {
            clearTimeout(timeout)
            startTimeout()
        },
    }

}
