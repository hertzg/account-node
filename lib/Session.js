module.exports = (longTerm, accessTime, closeListener) => {

    function startTimeout () {
        var milliseconds = accessTime - Date.now() + 1000 * 30
        timeout = setTimeout(closeListener, milliseconds)
    }

    function stopTimeout () {
        clearTimeout(timeout)
    }

    var timeout = 0
    startTimeout()

    return {
        longTerm: longTerm,
        close: () => {
            stopTimeout()
            closeListener()
        },
        toStorageObject: () => {
            return {
                accessTime: accessTime,
                longTerm: longTerm,
            }
        },
        wake: () => {
            accessTime = Date.now()
            stopTimeout()
            startTimeout()
        },
    }

}
