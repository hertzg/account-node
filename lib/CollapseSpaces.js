module.exports = string => {
    return string.replace(/^\s+/, '').replace(/\s+$/, '').replace(/\s{2,}/g, ' ')
}
