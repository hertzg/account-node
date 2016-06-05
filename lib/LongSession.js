module.exports = (accessTime, closeListener) => {

    function close () {
        closed = true
        closeListener()
    }

    function startTimeout () {
        var milliseconds = accessTime - Date.now() + 1000 * 60 * 60 * 24 * 7
        timeout = setTimeout(close, milliseconds)
    }

    var closed = false

    var timeout
    startTimeout()

    return {
        close: () => {
            clearTimeout(timeout)
            close()
        },
        toStorageObject: () => {
            return { accessTime: accessTime }
        },
        wake: () => {
            accessTime = Date.now()
            clearTimeout(timeout)
            startTimeout()
        },
    }

}
