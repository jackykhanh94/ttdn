var fetch = require('axios')
var async = require('async')
var cp = require('child_process')
var colors = require('./colors')
var { writeFileSync, appendFileSync, appendFile, writeFile, readdirSync, lstatSync, readFileSync, existsSync } = require('fs')
const { glob } = require('glob')
var clean = require('./clean')
var reqUrl = 'https://thongtindoanhnghiep.co/api/company/{mst}'

;(!existsSync('./data/cache') && writeFileSync('./data/cache', ''))

const Cache = readFileSync('./data/cache', 'utf-8').split('\n').filter(f => !!f).reduce((prev, cur) => {
    prev[cur] = true;
    return prev
}, {}) || {}
// console.log('CACHE', Cache)
async function save(mst, data) {
    appendFileSync('./data/companydb.json', JSON.stringify(data) + '\n')
    Cache[mst] = true;
    appendFileSync('./data/cache', mst + '\n')
    return data;
}
var fetchCount = 0;
async function fetchCompany(mst, retry = 0) {
    try {
        if (retry == 0) fetchCount++
        if (Cache[mst]) return console.log(colors.toGreen('[Load]:'), 'Ignore, company downloaded!', colors.toMagenta(`[${fetchCount}]`))
        var cmd = `curl -sL "${reqUrl.replace('{mst}',mst)}"`;
        console.log(colors.toGreen('[Load]:'), colors.toYellow(cmd), colors.toMagenta(`[${fetchCount}]`))
        var output = cp.execSync(cmd)
        var data = JSON.parse(output.toString())
        save(mst, data)
        return data
    } catch (e) {
        ++retry
        console.log(colors.toGreen('[Load][Retry]:'), retry, colors.toYellow(cmd), colors.toMagenta(`[${fetchCount}]`))
        if (retry < 10) return fetchCompany(mst, retry)
        throw e;
    }
}

;(async() => {
    console.log('Download from', process.argv[2], 'to', process.argv[3])
    var files = glob.sync('./data/*/**/*.json').slice(process.argv[2], process.argv[3]);
    writeFileSync('queque-' + process.argv[2] + '-' + process.argv[3], new Date().toString())
    var count = 0;
    var tasks = async.parallelLimit(files.map((f) => {
        return (callback) => {
            var { List } = require(f)
            async.parallelLimit(List.map(cmp => {
                return (callback2) => {
                    var mst = cmp.MaSoThue
                    fetchCompany(mst)
                        .then((res) => {
                            count++
                            console.log(colors.toGreen('[Done]:'), colors.toYellow(mst), colors.toMagenta(`[${count}/${process.argv[3]}]`))
                            callback2(null, res)
                        })
                        .catch(callback2)
                }
            }), 10)
            .then(() => {
                callback()
            })
            .catch(callback)
        }
    }), 10)
    await tasks;
})()