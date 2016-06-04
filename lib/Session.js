var assert = require('assert')

module.exports = (longTerm, accessTime, closeListener) => {

    function close () {
        closed = true
        closeListener()
    }

    function startTimeout () {
        var milliseconds = accessTime - Date.now() + 1000 * 30
        timeout = setTimeout(close, milliseconds)
    }

    assert.strictEqual(typeof longTerm, 'boolean')
    assert.strictEqual(typeof accessTime, 'number')
    assert.strictEqual(typeof closeListener, 'function')

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
            return {
                accessTime: accessTime,
                longTerm: longTerm,
            }
        },
        wake: () => {
            assert.strictEqual(closed, false)
            accessTime = Date.now()
            clearTimeout(timeout)
            startTimeout()
        },
    }

}
