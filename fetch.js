var async = require('async')
var glob = require('glob')
var cp = require('child_process')
var colors = require('./colors')
const { writeFileSync, appendFileSync, appendFile, writeFile, readdirSync, lstatSync } = require('fs')
const path = require('path')
var reqUrl = 'https://thongtindoanhnghiep.co/api/company?l={path}&r=100&p={page}'

function getAllJsonFiles(dataPath) {
    var files = []
    if (path.extname(dataPath) == '.json') files = [dataPath]
    else files = glob.sync(dataPath + '/**/*.json')
    return files
}

async function fetchPage(lpath, page, retry = 0) {
    try {
        var cmd = `curl -sL "${reqUrl.replace(`{path}`, lpath).replace('{page}', page)}"`;
        console.log(colors.toGreen('    [fetchPage]:'), colors.toYellow(cmd))
        var output = cp.execSync(cmd)
        return JSON.parse(output.toString())
    } catch (e) {
        ++retry
        console.log(colors.toGreen('    [fetchPage][Retry]:'), retry, colors.toYellow(cmd))
        if (retry < 10) return fetchPage(lpath, page, retry)
        throw e;
    }
}
async function fetchUtilLast(lpath) {
    var page = 1;
    var finish = false;
    var result = [];
    console.log(colors.toBlue('  [fetchUtilLast][START]:'), lpath)
    while (!finish) {
        var data = await fetchPage(lpath, page)
        var { Option: { RowPerPage, CurrentPage, TotalRow }, LtsItems } = data;
        finish = RowPerPage * CurrentPage >= TotalRow
        page++;
        console.log(colors.toBlue('  [fetchUtilLast][NEXT]:'), page, lpath, { RowPerPage, CurrentPage, TotalRow })
        result.push(...LtsItems)
    }
    console.log(colors.toBlue('  [fetchUtilLast][FINISH]:'), lpath)
    return result.map(f => clean(f));
}
function clean(obj) {
    for (var propName in obj) {
        if (obj[propName] === null || obj[propName] === undefined || obj[propName].length === 0 || obj[propName] === '') {
            delete obj[propName];
        }
    }
    return obj
}
module.exports = async function (dataPath) {
    var files = getAllJsonFiles(dataPath)
    var tasks = files.map((f) => {
        var ward = require(f)
        return (callback) => {
            if (ward.Total == ward.List?.length) {
                console.log(colors.toYellow('IGNORE DOWNLOAD DONE'), colors.toCyan(ward.Title))
                return callback(null)
            }
            fetchUtilLast(ward.SolrID)
                .then((result) => {
                    var newWard = {
                        ...ward,
                        List: result
                    }
                    writeFile(f, JSON.stringify(newWard), (err) => {
                        console.log('  SAVE', f)
                        if (err) return callback(err)
                        callback(null, newWard)
                    })
                })
                .catch(callback)
        }
    })

    await async.parallelLimit(tasks, 50)
    console.log('DONE', dataPath)
}