#!/usr/bin/env node
var colors = require('./colors')
var fetch = require('./fetch')
var fs = require('fs')
var path = require('path')
const { spawn } = require('child_process')
require('yargs')
  .scriptName("ttdn")
  .usage('$0 <cmd> [args]')
  .command('dl [tinhthanh]', 'Tải thông tin doanh nghiệp theo vùng!', (yargs) => {
    yargs.positional('tinhthanh', {
      type: 'string',
      describe: 'tinh-thanh hoặc tinh-thanh/quan-huyen hoặc tinh-thanh/quan-huyen/xa-phuong'
    })
  }, function (argv) {
    var { tinhthanh } = argv
    var parts = tinhthanh.split('/').filter(f => !!f)
    var dataPath = './data/'
    if (parts.length == 0) dataPath += parts[0]
    else if (parts.length == 1) dataPath += parts.join('/')
    else if (parts.length == 2) {
        dataPath += parts.join('/')
    }
    else if (parts.length == 3) {
        dataPath += parts.join('/')
    }
    else {
        dataPath = tinhthanh
    }
    if (!/\.json$/.test(dataPath) && !fs.existsSync(dataPath)) {
        dataPath += '.json';
    }
    if(!fs.existsSync(dataPath)) {
        return console.log(colors.toRed('NOT FOUND:'), colors.toYellow(dataPath))
    }
    console.log(colors.toGreen('Download:'), colors.toMagenta(tinhthanh))
    fetch(path.resolve(dataPath))
  })
  .command('init', 'Init data', (yargs) => {
    
  }, (args) => {
    var proc = spawn('unzip', ['-o', __dirname + 'data.zip', '-d', '.'], { stdio: 'pipe' })
    proc.stdout.on('data', function (data) {
      console.log(data.toString());
    });
    
    proc.stderr.on('data', function (data) {
      console.error(data.toString());
    });
    
    proc.on('exit', function (code) {
      console.log('Exit');
    });
  })
  .help()
  .argv