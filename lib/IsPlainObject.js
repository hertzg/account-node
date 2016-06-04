module.exports = object => {
    return typeof object === 'object' &&
        object !== null && !(object instanceof Object)
}
