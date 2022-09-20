var fetch = require('axios')
var async = require('async')
var cp = require('child_process')
var city = require('./data/city.json')
var colors = require('./colors')
const { writeFileSync, appendFileSync, appendFile, writeFile, readdirSync, lstatSync } = require('fs')
var rootUrl = 'https://thongtindoanhnghiep.co'
var districtList = '/api/city/{id}/district'
var wardList = '/api/district/{id}/ward'
const CITIES = {}
;(async() => {
    for (let i = 0; i < city.LtsItem.length; i++) {
        const _city = city.LtsItem[i];
        var cmd = `curl -sL ${rootUrl}${districtList.replace('{id}', _city.ID)}`;
        console.log(colors.toGreen('Fetch district'), colors.toYellow(cmd))
        var output = cp.execSync(cmd)
        var Districts = JSON.parse(output.toString());
        for (let j = 0; j < Districts.length; j++) {
            const dist = Districts[j];
            var cmd2 = `curl -sL ${rootUrl}${wardList.replace('{id}', dist.ID)}`;
            console.log(colors.toBlue(' > Fetch ward'), colors.toCyan(cmd2))
            var output2 = cp.execSync(cmd2)
            var Wards = JSON.parse(output2.toString());
            Districts[j] = {
                ...dist,
                Wards
            }
        }
        CITIES[_city.SolrID] = {
            ..._city,
            Districts
        }
        writeFileSync('./data/all.json', JSON.stringify(CITIES))
    }
})
;(async() => {
    var all = require('./data/all.json')
    var wards = Object.keys(all).map(f => all[f]).flatMap(f => f.Districts).flatMap(f => f.Wards).map(({ ID, SolrID, Title, TinhThanhTitle, QuanHuyenTitle, QuanHuyenID, TinhThanhID }) => ({ ID, SolrID, Title, TinhThanhTitle, QuanHuyenTitle, QuanHuyenID, TinhThanhID, Url: 'https://thongtindoanhnghiep.co/api/company?l=' + SolrID }))
    writeFileSync('./wards.json', JSON.stringify(wards, null, 2))
});
;(async() => {
    var wards = require('./wards.json')
    var distDirs = []
    for (let i = 0; i < wards.length; i++) {
        const ward = wards[i];
        const parts = ward.SolrID.split(/\//g).filter(f => !!f)
        var cmd = `mkdir -p ./data/${parts[0]}/${parts[1]}`;
        distDirs.push(cmd)
    }
    const uniqDists = [...new Set(distDirs)];
    for (let i = 0; i < uniqDists.length; i++) {
        const cmd = uniqDists[i];
        console.log(cmd)
        cp.execSync(cmd)
    }
    console.log('DONE')
})
;(async() => {
    var wards = require('./wards.json')
    var tasks = wards.map(f => {
        return function(callback) {
            var cmd = `curl -sL ${f.Url}`;
            var output = cp.execSync(cmd)
            console.log(cmd)
            callback(null, cmd)
        }
    })
    // console.log(tasks)
    await async.parallelLimit(tasks, 10)
    console.log('DONE')
});
;(async() => {
    var wards = require('./wards.json')
    for (let i = 0; i < wards.length; i++) {
        const ward = wards[i];
        var filePath = `./data${ward.SolrID}.json`;
        console.log(filePath)
        appendFileSync(filePath, JSON.stringify(ward))
    }
    console.log('DONE')
});
;(async() => {
    var wards = require('./wards.json')
    let count = 0;
    wards = wards.map(f => {
        return function(callback) {
            var filePath = `./data${f.SolrID}.json`;
            count++;
            var cmd = `curl -sL ${f.Url}`;
            console.log(colors.toGreen(`[Thread ${count}]:`), cmd)
            cp.exec(cmd, (err, output) => {
                var res = JSON.parse(output)
                var newWard = {
                    ...f,
                    Total: res.Option.TotalRow
                }
                writeFile(filePath, JSON.stringify(newWard), () => {
                    count--;
                    callback()
                })
            })
        }
    })
    await async.parallelLimit(wards, 50)
    console.log('DONE')
});
;(async() => {
    var wards = require('./wards.json')
    let count = 0
    var stats = []
    for (let i = 0; i < wards.length; i++) {
        const w = wards[i]
        const wardPath = `./data${w.SolrID}.json`
        const ward = require(wardPath)
        count += ward.Total
        stats.push({
            path: wardPath,
            total: ward.Total
        })
    }
    stats.sort((a, b) => b.total - a.total)
    console.log(stats)
})

;(async() => {
    var pros = readdirSync('./data').filter(f => lstatSync('./data/' + f).isDirectory()).map(f => './data/' + f)
    console.log(pros)
})()