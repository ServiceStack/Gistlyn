﻿/*global require*/
(function () {
    var argv = require('yargs').argv;
    var WEB = 'web';
    var NATIVE = 'native';
    var msbuildToolsVersion = 15;
    var webBuildDir = argv.serviceStackSettingsDir || './wwwroot_build/';

    var COPY_FILES = [
        { src: './bin/**/*', dest: 'bin/', host: WEB },
        { src: './img/**/*', dest: 'img/' },
        { src: './css/**/*', dest: 'css/' },
        //{ src: './App_Data/**/*', dest: 'App_Data/', host: WEB },
        { src: './Global.asax', host: WEB },
        { src: './node_modules/bootstrap/dist/fonts/*.*', dest: 'lib/fonts/' },
        { src: './node_modules/react/dist/react.min.js', dest: 'dist/' },
        { src: './node_modules/react/dist-dom/react-dom.min.js', dest: 'dist/' },
        { src: ['./favicon.ico'], dest: '/' },
        { src: ['./platform.js', './platform.css', './offline.html'], dest: '/', host: WEB },
        { src: webBuildDir + 'deploy/*.*', host: WEB },
        {
            src: './web.config',
            host: [WEB],
            afterReplace: [{
                from: '<compilation debug="true" targetFramework="4.5"',
                to: '<compilation targetFramework="4.5"'
            }]
        }
    ];

    var fs = require('fs');
    var path = require('path');
    // include gulp
    var gulp = require('gulp');
    var gulpUtil = require('gulp-util');
    // include plug-ins
    var del = require('del');
    var newer = require('gulp-newer');
    var useref = require('gulp-useref');
    var gulpif = require('gulp-if');
    var minifyCss = require('gulp-clean-css');
    var uglify = require('gulp-uglify');
    var gulpReplace = require('gulp-replace');
    var htmlBuild = require('gulp-htmlbuild');
    var eventStream = require('event-stream');
    var rename = require('gulp-rename');
    var runSequence = require('run-sequence');
    var nugetRestore = require('gulp-nuget-restore');
    var msbuild = require('gulp-msbuild');
    var msdeploy = require('gulp-msdeploy');
    var exec = require('child_process').exec;
    var exec = require('child_process').exec;
    var nugetpack = require('gulp-nuget-pack');
    var webpack = require('webpack');

    var resourcesRoot = '../Gistlyn.Resources/';
    var webRoot = 'wwwroot/';
    var resourcesLib = '../../lib/';
    var configFile = 'config.json';
    var configDir = webBuildDir + 'publish/';
    var configPath = configDir + configFile;
    var appSettingsFile = 'appsettings.txt';
    var appSettingsDir = webBuildDir + 'deploy/';
    var appSettingsPath = appSettingsDir + appSettingsFile;
    var winFormsAssemblyInfoPath = '../Gistlyn.AppWinForms/Properties/AssemblyInfo.cs';

    function createConfigsIfMissing() {
        if (!fs.existsSync(configPath)) {
            if (!fs.existsSync(configDir)) {
                fs.mkdirSync(configDir);
            }
            fs.writeFileSync(configPath, JSON.stringify({
                "iisApp": "Gistlyn",
                "serverAddress": "deploy-server.example.com",
                "userName": "{WebDeployUserName}",
                "password": "{WebDeployPassword}"
            }, null, 4));
        }
        if (!fs.existsSync(appSettingsPath)) {
            if (!fs.existsSync(appSettingsDir)) {
                fs.mkdirSync(appSettingsDir);
            }
            fs.writeFileSync(appSettingsPath,
                '# Release App Settings\r\nDebugMode false');
        }
    }

    createConfigsIfMissing();
    var config = require(configPath); // Deployment config

    var webpackConfig = require('./webpack.config.js');

    // htmlbuild replace for CDN references
    function pipeTemplate(block, template) {
        eventStream.readArray([
            template
        ].map(function (str) {
            return block.indent + str;
        })).pipe(block);
    }

    function onWebpackBuild(done) {
        return function (err, stats) {
            if (err) {
                gulpUtil.log('Error', err);
                if (done) {
                    done();
                }
            } else {
                Object.keys(stats.compilation.assets).forEach(function(key) {
                    gulpUtil.log('Webpack: output ', gulpUtil.colors.green(key));
                });
                gulpUtil.log('Webpack: ', gulpUtil.colors.blue('finished ', stats.compilation.name));
                if (done) {
                    done();
                }
            }
        }
    }

    // Tasks
    gulp.task('www-clean-dlls', function (callback) {
        var binPath = webRoot + '/bin/';
        del(binPath, callback);
    });
    gulp.task('www-clean-client-assets', function (callback) {
        del([
            webRoot + '**/*.*',
            '!wwwroot/bin/**/*.*', //Don't delete dlls
            //'!wwwroot/App_Data/**/*.*', //Don't delete App_Data
            '!wwwroot/**/*.asax', //Don't delete asax
            '!wwwroot/**/*.config', //Don't delete config
            '!wwwroot/appsettings.txt' //Don't delete deploy settings
        ], callback);
    });
    gulp.task('www-copy-files', function(callback) {
        var count = 0;
        var length = COPY_FILES.length;
        var result = [];
        var processCopy = function (index) {
            var copy = COPY_FILES[index];
            var dest = copy.dest || '';
            var src = copy.src;
            var copyTask = gulp.src(src);
            if (copy.afterReplace) {
                for (var i = 0; i < copy.afterReplace.length; i++) {
                    var replace = copy.afterReplace[i];
                    copyTask = copyTask.pipe(gulpReplace(replace.from, replace.to));
                }
            }
            if (copy.after) {
                copyTask = copyTask.pipe(copy.after());
            }

            var hosts = [WEB, NATIVE];
            if (copy.host) {
                hosts = typeof copy.host === 'string'
                    ? [copy.host]
                    : copy.host;
            }

            if (hosts.indexOf(WEB) >= 0) {
                copyTask = copyTask
                    .pipe(newer(webRoot + dest))
                    .pipe(gulp.dest(webRoot + dest));
            }
            if (hosts.indexOf(NATIVE) >= 0) {
                copyTask = copyTask
                    .pipe(newer(resourcesRoot + dest))
                    .pipe(gulp.dest(resourcesRoot + dest));
            }

            copyTask.on('finish', function () {
                gulpUtil.log(gulpUtil.colors.green('Copied ' + copy.src));
                count++;
                if (count === length) {
                    callback();
                }
            });
            return copyTask;
        }
        for (var i = 0; i < length; i++) {
            result.push(processCopy(i));
        }
    });
    gulp.task('www-bundle-html', function () {
        return gulp.src('./default.html')
            .pipe(useref())
            .pipe(gulpif('*.css', minifyCss()))
            .pipe(gulpif('*.js', uglify()))
            .pipe(gulp.dest(webRoot))
            .pipe(gulp.dest(resourcesRoot));
    });
    gulp.task('www-webpack-build', function (done) {
        var config = Object.create(webpackConfig);
        config.output.path = __dirname + "/wwwroot/dist";
        config.plugins = (config.plugins || []).concat(
            new webpack.DefinePlugin({
                'process.env': {
                    'NODE_ENV': JSON.stringify('production')
                }
            }),
            new webpack.optimize.DedupePlugin(),
            new webpack.optimize.UglifyJsPlugin()
        );
        var compiler = webpack(config);
        compiler.run(onWebpackBuild(function () {
            var copyTask = gulp.src(config.output.path + "/bundle.js")
                .pipe(gulp.dest(resourcesRoot + "dist"));

            copyTask.on('finish', function () {
                done();
            });
        }));
    });
    gulp.task('www-copy-resources-lib', function() {
        return gulp.src('../Gistlyn.Resources/bin/Release/Gistlyn.Resources.dll')
            .pipe(newer(resourcesLib))
            .pipe(gulp.dest(resourcesLib));
    })
    gulp.task('www-copy-deploy-files', function () {
        return gulp.src(webBuildDir + 'deploy/*.*')
            .pipe(newer(webRoot))
            .pipe(gulp.dest(webRoot));
    });

    gulp.task('www-msbuild-web', function() {
        return gulp.src('./Gistlyn.csproj')
            .pipe(msbuild({
                toolsVersion: msbuildToolsVersion,
                targets: ['Clean', 'Rebuild'],
                properties: {
                    Configuration: 'Release',
                    DefineConstants: 'WEB'
                },
                stdout: true,
                verbosity: 'quiet'
            }));
    });
    gulp.task('www-msbuild-resources', function () {
        return gulp.src('../Gistlyn.Resources/Gistlyn.Resources.csproj')
            .pipe(msbuild({
                toolsVersion: msbuildToolsVersion,
                targets: ['Clean', 'Rebuild'],
                properties: {
                    Configuration: 'Release'
                },
                stdout: true,
                verbosity: 'quiet'
            }));
    });
    gulp.task('www-msbuild-console', function () {
        return gulp.src('../Gistlyn.AppConsole/Gistlyn.AppConsole.csproj')
            .pipe(msbuild({
                toolsVersion: msbuildToolsVersion,
                targets: ['Clean', 'Rebuild'],
                properties: {
                    Configuration: 'Release'
                },
                stdout: true,
                verbosity: 'quiet'
            }));
    });
    gulp.task('www-msbuild-winforms', function () {
        return gulp.src('../Gistlyn.AppWinforms/Gistlyn.AppWinforms.csproj')
            .pipe(msbuild({
                toolsVersion: msbuildToolsVersion,
                targets: ['Clean', 'Rebuild'],
                properties: {
                    Configuration: 'Release'
                },
                stdout: true,
                verbosity: 'quiet'
            }));
    });

    gulp.task('www-nuget-restore', function() {
        return gulp.src('../../Gistlyn.sln')
            .pipe(nugetRestore());
    });

    function extractAssemblyAttribute(filePath, attrName) {
        var assemblyInfoContents = fs.readFileSync(filePath, { encoding: 'utf8' });
        var lines = assemblyInfoContents.split('\n');
        var result = null;
        for (var i = 0; i < lines.length; i++) {
            if(lines[i].startsWith('//'))
                continue;
            var line = lines[i].trim();
            if (line.startsWith('[assembly: ') && line.indexOf(attrName) > 0) {
                var startIndex = line.indexOf('(') + 1;
                var endIndex = line.indexOf(')');
                if (line.indexOf('("') > -1) {
                    //String value
                    startIndex = line.indexOf('("') + 2;
                    endIndex = line.indexOf('")');
                }
                result = line.substr(startIndex, endIndex - startIndex);
                break;
            }
        }
        return result;
    }

    function initWinformsReleaseDirectory() {
        var appsDir = webBuildDir + 'apps/';
        var winFormsInstall = appsDir + 'winforms-installer/';
        if (!fs.existsSync(appsDir)) {
            fs.mkdirSync(appsDir);
        }
        if (!fs.existsSync(winFormsInstall)) {
            fs.mkdirSync(winFormsInstall);
        }
    }

gulp.task('www-nuget-pack-winforms', function (callback) {
        var globule = require('globule');
        initWinformsReleaseDirectory();
        var version = extractAssemblyAttribute(winFormsAssemblyInfoPath, 'AssemblyVersion');
        var title = extractAssemblyAttribute(winFormsAssemblyInfoPath, 'AssemblyTitle');
        var description = extractAssemblyAttribute(winFormsAssemblyInfoPath, 'AssemblyDescription') || 'Test';
        var authors = extractAssemblyAttribute(winFormsAssemblyInfoPath, 'AssemblyCompany');
        var excludes = globule.find([
            '../Gistlyn.AppWinForms/bin/x86/Release/*.pdb',
            '../Gistlyn.AppWinForms/bin/x86/Release/*.vshost.*'
        ]);
        var includes = [
        { src: '../Gistlyn.AppWinForms/bin/x86/Release/*.*', dest: '/lib/net45/' },
        { src: '../Gistlyn.AppWinForms/bin/x86/Release/locales/*.*', dest: '/lib/net45/locales/' }];
        return nugetpack({
            id: title,
            title: title,
                version: version,
                authors: authors,
                description: description,
                excludes: excludes,
                iconUrl: 'https://raw.githubusercontent.com/ServiceStack/Assets/master/img/artwork/logo-100sq.png',
                outputDir: 'wwwroot_build/apps/winforms-installer/'
            },
            includes,
            callback);
    });

    gulp.task('www-exec-package-console', function (callback) {
        exec('cmd /c "cd wwwroot_build && package-deploy-console.bat"', function (err, stdout, stderr) {
            console.log(stdout);
            console.log(stderr);
            callback(err);
        });
    });

    gulp.task('www-exec-package-winforms', function (callback) {
        initWinformsReleaseDirectory();
        var squirrelPath = path.resolve('../packages/squirrel.windows.1.3.0/tools/');
        var appName = extractAssemblyAttribute(winFormsAssemblyInfoPath, 'AssemblyTitle');
        var version = extractAssemblyAttribute(winFormsAssemblyInfoPath, 'AssemblyVersion');
        var rootDir = 'wwwroot_build\\apps\\winforms-installer\\';
        var nugetPkg = rootDir + appName + '.' + version + '.nupkg';
        var releaseDir = rootDir + 'Releases';
        gulpUtil.log(gulpUtil.colors.green('Packaging using Squirrel: ') + gulpUtil.colors.white(nugetPkg));
        exec('Squirrel.exe --releasify ' + nugetPkg + ' --releaseDir ' + releaseDir + ' --no-msi', { env: { 'PATH': squirrelPath + ';' } }, function (err, stdout, stderr) {
            console.log(stdout);
            console.log(stderr);
            if (!err) {
                gulpUtil.log(gulpUtil.colors.green('Package created/updated at: ') + gulpUtil.colors.white(releaseDir));
            }
            callback(err);
        });
    });

    gulp.task('webpack-build', callback => {
        process.env.FORCE_COLOR = 1;
        var proc = exec('npm run build');
        proc.stdout.pipe(process.stdout);
        proc.stderr.pipe(process.stderr);
        proc.on('exit', callback);
    });

    gulp.task('00-webpack-watch', callback => {
        process.env.FORCE_COLOR = 1;
        var proc = exec('npm run watch');
        proc.stdout.pipe(process.stdout);
        proc.stderr.pipe(process.stderr);
        proc.on('exit', callback);
    });

    gulp.task('tests-run', callback => {
        process.env.FORCE_COLOR = 1;
        var proc = exec('npm run test');
        proc.stdout.pipe(process.stdout);
        proc.stderr.pipe(process.stderr);
        proc.on('exit', callback);
    });

    gulp.task('tests-watch', callback => {
        process.env.FORCE_COLOR = 1;
        var proc = exec('npm run test -- --watch');
        proc.stdout.pipe(process.stdout);
        proc.stderr.pipe(process.stderr);
        proc.on('exit', callback);
    });

    gulp.task('01-bundle-all', function(callback) {
        runSequence(
            'www-clean-dlls',
            'www-clean-client-assets',
            'www-nuget-restore',
            'www-msbuild-web',
            'www-copy-files',
            'www-webpack-build',
            'www-bundle-html',
            'www-msbuild-resources',
            'www-copy-resources-lib',
            callback
        );
    });

    gulp.task('02-package-console', function(callback) {
        runSequence(
            'www-nuget-restore',
            '01-bundle-all',
            'www-msbuild-console',
            'www-exec-package-console',
            callback);
    });
    
    gulp.task('02-package-winforms', function (callback) {
        runSequence(
            'www-nuget-restore',
            '01-bundle-all',
            'www-msbuild-winforms',
            'www-nuget-pack-winforms',
            'www-exec-package-winforms',
            callback);
    });

    gulp.task('01-package-server', function (callback) {
        runSequence('www-nuget-restore',
            'www-msbuild-web', 'www-clean-dlls',
                [
                    'www-copy-files',
                    'www-copy-deploy-files'
                ],
                callback);
    });

    gulp.task('02-package-client', function (callback) {
        runSequence('www-clean-client-assets',
                [
                    'www-copy-files',
                    'www-bundle-html'
                ],
                'www-webpack-build',
                callback);
    });

    gulp.task('www-msdeploy-pack', function () {
        return gulp.src('wwwroot/')
            .pipe(msdeploy({
                verb: 'sync',
                sourceType: 'iisApp',
                dest: {
                    'package': path.resolve('./webdeploy.zip')
                }
            }));
    });

    gulp.task('www-msdeploy-push', function () {
        return gulp.src('./webdeploy.zip')
            .pipe(msdeploy({
                verb: 'sync',
                allowUntrusted: 'true',
                sourceType: 'package',
                dest: {
                    iisApp: config.iisApp,
                    wmsvc: config.serverAddress,
                    UserName: config.userName,
                    Password: config.password
                }
            }));
    });

    gulp.task('03-deploy-app', function (callback) {
        runSequence('www-msdeploy-pack', 'www-msdeploy-push',
            callback);
    });

    gulp.task('package-and-deploy', function (callback) {
        runSequence('01-package-server', '02-package-client', '03-deploy-app',
            callback);
    });
    gulp.task('default', function (callback) {
        runSequence('01-package-server',
            '02-package-client',
            '02-package-console',
            '02-package-winforms',
                callback);
    });
})();