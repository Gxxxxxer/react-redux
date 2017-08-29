/**
 *  Created by wangjun on 2017/8/29.
 **/
process.env.NODE_ENV = 'production'

var fs = require('fs')
var path = require('path')
var ora = require('ora')
var webpack = require('webpack')
var webpackConfig = require('./webpack.config')
var co = require('co')

var gulp = require('gulp')
var zip = require('gulp-zip')
var moment = require('moment')
var appConfig = require('./app.config.js')
console.log(
    '  Tip:\n' +
    '  Built files are meant to be served over an HTTP server.\n' +
    '  Opening index.html over file:// won\'t work.\n'
)

var spinner = ora('building for production...')
spinner.start()
// start -- 生成app.config配置


var config = {
    'signatures': '',
    'version': appConfig.version,
    'domain': 'app.wy.guahao.com',
    'updates': '内容更新',
    'timestamp': moment().format('YYYY-MM-DD HH:mm:ss')
}

var writeConfig = function (cb) {
    fs.writeFile(path.join(__dirname, './build/config.json'), JSON.stringify(config), function (err) {
        if(err){
            throw err
        }
        cb && cb()
    })
}
// end -- 生成app.config配置

// start -- zip压缩



var notValidFileName = /[\\\/\:\*\?\"\<\>\|\,]/g
// 过滤文件名不能使用的字符
appConfig.description = appConfig.description.replace(notValidFileName, '')

var zipBuild = function (cb) {
    var time = moment().format('YYYYMMDDHHmmss')

    gulp.src(path.join(__dirname, './build/**/*'))
        .pipe(zip(`app_${appConfig.version}_${time}_${appConfig.description}.zip`))
        .pipe(gulp.dest(path.join(__dirname, './zip')))
        .on('end', function () {
            cb && cb()
        })
}
// end -- zip压缩


// var assetsPath = path.join(config.build.assetsRoot, config.build.assetsSubDirectory)
// rm('-rf', assetsPath)
// mkdir('-p', assetsPath)
// cp('-R', 'static/', assetsPath)

var build = function (resolve) {
    webpack(webpackConfig, function (err, stats) {
        spinner.stop()
        if (err) throw err
        process.stdout.write(stats.toString({
            colors: true,
            modules: false,
            children: false,
            chunks: false,
            chunkModules: false
        }) + '\n')
        resolve()
    })
}

co(function * () {
    yield new Promise(build)
    // yield new Promise(replaceStaticPath)
    yield new Promise(writeConfig)
    yield new Promise(zipBuild)
    console.log('build finished...')
})
