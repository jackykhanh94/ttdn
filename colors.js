let toBlack = (text) => `\x1b[30m${text}\x1b[0m`
let toRed = (text) => `\x1b[31m${text}\x1b[0m`
let toGreen = (text) => `\x1b[32m${text}\x1b[0m`
let toYellow = (text) => `\x1b[33m${text}\x1b[0m`
let toBlue = (text) => `\x1b[34m${text}\x1b[0m`
let toMagenta = (text) => `\x1b[35m${text}\x1b[0m`
let toCyan = (text) => `\x1b[36m${text}\x1b[0m`
let toWhite = (text) => `\x1b[37m${text}\x1b[0m`
module.exports = { toBlack, toRed, toGreen, toYellow, toBlue, toMagenta, toCyan, toWhite }