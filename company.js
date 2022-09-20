var fetch = require('axios')
var async = require('async')
var cp = require('child_process')
var city = require('./data/city.json')
var colors = require('./colors')
var { writeFileSync, appendFileSync, appendFile, writeFile, readdirSync, lstatSync } = require('fs')
const { glob } = require('glob')
var rootUrl = 'https://thongtindoanhnghiep.co'
var districtList = '/api/city/{id}/district'
var wardList = '/api/district/{id}/ward'

var files = glob.sync('./data/*/**/*.json')
async.parallelLimit(files.map((f) => {
    return (callback) => {
        console.log('Load', f)
        var { List } = require(f)
        callback(null, List)
    }
}), 100, (result) => {
    console.log(result)
})
