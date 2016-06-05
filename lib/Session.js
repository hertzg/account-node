module.exports = (longTerm, accessTime, closeListener) => {

    function close () {
        closed = true
        closeListener()
    }

    function startTimeout () {
        var milliseconds = accessTime - Date.now() + 1000 * 30
        timeout = setTimeout(close, milliseconds)
    }

    var closed = false

    var timeout
    startTimeout()

    return {
        longTerm: longTerm,
        close: () => {
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
            accessTime = Date.now()
            clearTimeout(timeout)
            startTimeout()
        },
    }

}
