module.exports = function clean(obj) {
    for (var propName in obj) {
        if (obj[propName] === null || obj[propName] === undefined || obj[propName].length === 0 || obj[propName] === '') {
            delete obj[propName];
        }
    }
    return obj
}