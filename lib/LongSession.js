module.exports = (accessTime, closeListener) => {

    var milliseconds = accessTime - Date.now() + 1000 * 60 * 60 * 24 * 7
    var timeout = setTimeout(closeListener, milliseconds)

    return {
        close: () => {
            clearTimeout(timeout)
            closeListener()
        },
        toStorageObject: () => {
            return { accessTime: accessTime }
        },
    }

}
