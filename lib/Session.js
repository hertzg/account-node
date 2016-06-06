module.exports = (token, group, longTerm, accessTime, closeListener) => {

    function close () {
        group.remove(token)
        closeListener()
    }

    function startTimeout () {
        var milliseconds = accessTime - Date.now() + 1000 * 60
        timeout = setTimeout(close, milliseconds)
    }

    function stopTimeout () {
        clearTimeout(timeout)
    }

    var timeout = 0
    startTimeout()

    var that = {
        group: group,
        longTerm: longTerm,
        close: () => {
            stopTimeout()
            close()
        },
        toStorageObject: () => {
            return {
                accessTime: accessTime,
                group: group.identifier,
                longTerm: longTerm,
            }
        },
        wake: () => {
            accessTime = Date.now()
            stopTimeout()
            startTimeout()
        },
    }

    group.add(token, that)

    return that

}
