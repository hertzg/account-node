module.exports = (token, group, accessTime, closeListener) => {

    function close () {
        group.remove(token)
        closeListener()
    }

    var milliseconds = accessTime - Date.now() + 1000 * 60 * 60 * 24 * 7
    var timeout = setTimeout(close, milliseconds)

    var that = {
        group: group,
        close: () => {
            clearTimeout(timeout)
            close()
        },
        toStorageObject: () => {
            return {
                accessTime: accessTime,
                group: group.identifier,
            }
        },
    }

    group.add(token, that)

    return that

}
