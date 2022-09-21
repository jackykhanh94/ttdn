var fetch = require('axios')
var async = require('async')
var cp = require('child_process')
var colors = require('./colors')
var { writeFileSync, appendFileSync, appendFile, writeFile, readdirSync, lstatSync, readFileSync, existsSync } = require('fs')
const { glob } = require('glob')
var clean = require('./clean')
var reqUrl = 'https://thongtindoanhnghiep.co/api/company/{mst}'

var files = glob.sync('./data/*/**/*.json').slice(0, 100)
async.parallelLimit(files.map((f) => {
    return (callback) => {
        // console.log('Load', f)
        var { List } = require(f)
        callback(null, List.map(f => f.Title))
    }
}), 10, (err, result) => {
    // console.log(result.flat())
})

;(!existsSync('./data/cache') && writeFileSync('./data/cache', ''))

const Cache = readFileSync('./data/cache', 'utf-8').split('\n').filter(f => !!f).reduce((prev, cur) => {
    prev[cur] = true;
    return prev
}, {}) || {}
console.log('CACHE', Cache)
async function save(mst, data) {
    appendFileSync('./data/companydb.json', JSON.stringify(data) + '\n')
    Cache[mst] = true;
    appendFileSync('./data/cache', mst + '\n')
    return data;
}
async function fetchCompany(mst) {
    try {
        if (Cache[mst]) return console.log('Ignore, company downloaded!')
        var cmd = `curl -sL "${reqUrl.replace('{mst}',mst)}"`;
        console.log(colors.toGreen('    [fetchCompany]:'), colors.toYellow(cmd))
        var output = cp.execSync(cmd)
        var data = JSON.parse(output.toString())
        save(mst, data)
        return data
    } catch (e) {
        ++retry
        console.log(colors.toGreen('    [fetchCompany][Retry]:'), retry, colors.toYellow(cmd))
        if (retry < 10) return fetchCompany(lpath, page, retry)
        throw e;
    }
}