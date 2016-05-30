module.exports = object => {
    var plain = Object.create(null)
    for (var i in object) plain[i] = object[i]
    return plain
}
