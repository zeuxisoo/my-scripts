var optimist = require('optimist'),
    request = require('request'),
    winston = require('winston'),
    mkdirp = require('mkdirp'),
    async = require('async'),
    fs = require('fs'),
    path = require('path'),
    child_process = require('child_process'),
    util = require('util');

var configs = {
    'outputDirectory': './output',
    'toolsDirectory' : './tools',
    'dex2jarFileUrl' : 'https://dex2jar.googlecode.com/files/dex2jar-0.0.9.15.zip',
    'apktoolFileUrl' : 'https://android-apktool.googlecode.com/files/apktool1.5.2.tar.bz2',
    'dex2jarFilename': 'dex2jar.zip',
    'apktoolFilename': 'apktool.tar.bz2'
}

var opts = optimist.usage("Usage: $0")
    .boolean('i').alias('i', 'install').describe('i', "Install the tools like dex2jar and apktool")
    .boolean('d').alias('d', 'decompile').describe('d', "Decompile the apk file")
    .default('a', null).alias('a', 'apk').describe('a', "Specific apk file")
    .argv

if (opts.install === true) {
    winston.info("Starting to install");

    toolsDirectory  = configs.toolsDirectory;
    dex2jarZipPath  = toolsDirectory + '/' + configs.dex2jarFilename;
    apktoolZipPath  = toolsDirectory + '/' + configs.apktoolFilename;

    function createToolsDirectory(callback) {
        if (fs.existsSync(toolsDirectory) === false) {
            winston.info(util.format("Creating tools directory in %s", toolsDirectory));
            mkdirp.sync(toolsDirectory, 0777);
        }else{
            winston.warn("Tools directory already exists, Please remove tools directory before run install");
            process.exit(0);
        }
        callback(null);
    }

    function downloadDex2Jar(callback) {
        winston.info("Downloading the dex2jar file");
        request(configs.dex2jarFileUrl).pipe(fs.createWriteStream(dex2jarZipPath)).on('close', function() {
            callback(null);
        });
    }

    function downloadApkTool(callback) {
        winston.info("Downloading the apktool file");
        request(configs.apktoolFileUrl).pipe(fs.createWriteStream(apktoolZipPath)).on('close', function() {
            callback(null);
        });
    }

    function extractDex2Jar(callback) {
        winston.info("Extracting the dex2jar file");
        child_process.exec(util.format("unzip %s -d %s", dex2jarZipPath, toolsDirectory), function(error, stdout, stderr) {
            callback(null);
        });
    }

    function extractApkTool(callback) {
        winston.info("Extracting the apktool file");
        child_process.exec(util.format("tar jxvf %s -C %s", apktoolZipPath, toolsDirectory), function(error, stdout, stderr) {
            callback(null);
        });
    }

    function cleanZipFiles(callback) {
        winston.info("Cleaning zip files");
        fs.unlinkSync(dex2jarZipPath);
        fs.unlinkSync(apktoolZipPath);
        callback(null);
    }

    function renameExtractedDex2Jar(callback) {
        winston.info("Renaming the extacted dex2jar file");
        child_process.exec(util.format("mv %s/dex2jar* %s/dex2jar", toolsDirectory, toolsDirectory), function(error, stdout, stderr) {
            callback(null);
        })
    }

    function renameExtractedApkTool(callback) {
        winston.info("Renaming the extacted apktool file");
        child_process.exec(util.format("mv %s/apktool* %s/apktool", toolsDirectory, toolsDirectory), function(error, stdout, stderr) {
            callback(null);
        })
    }

    async.series([
        createToolsDirectory,
        downloadDex2Jar, downloadApkTool,
        extractDex2Jar, extractApkTool,
        cleanZipFiles,
        renameExtractedDex2Jar, renameExtractedApkTool
    ], function(error, results) {
        if (error) {
            throw error;
        }else{
            winston.info("Install completed");
        }
    });
}else if (opts.decompile === true) {
    winston.info("Starting to decompile");

    if (opts.apk === null) {
        winston.warn('Please specific apk file using "-a [APK FILE]"');
    }else{
        winston.info(util.format("Your apk file is %s", opts.apk));

        apktoolBinPath  = configs.toolsDirectory + '/apktool/apktool.jar';
        dex2jarBinPath  = configs.toolsDirectory + '/dex2jar/dex2jar.sh';

        outputDirectory = configs.outputDirectory;

        function createOutputDirectory(callback) {
            if (fs.existsSync(outputDirectory) === false) {
                winston.info(util.format("Creating output directory in %s", outputDirectory));
                mkdirp.sync(outputDirectory, 0777);
            }
            callback(null);
        }

        function runApkTool(callback) {
            winston.info("Running apktool");
            child_process.exec(util.format('java -jar "%s" d -d -f "%s"', apktoolBinPath, opts.apk), function(error, stdout, stderr) {
                callback(null);
            });
        }

        function runDex2Jar(callback) {
            winston.info("Running dex2jar");
            child_process.exec(util.format('%s -f "%s" -o "%s"', dex2jarBinPath, opts.apk,
             + '.jar'), function(error, stdout, stderr) {
                callback(null);
            });
        }

        function cleanOutputDirectory(callback) {
            winston.info("Cleaning output directory");
            child_process.exec(util.format("rm -rf %s/*", outputDirectory), function(error, stdout, stderr) {
                callback(null);
            });
        }

        function moveApkToolDecompiledFile(callback) {
            winston.info("Moving apktool decompiled file");

            decompiledDirectory = path.basename(opts.apk, path.extname(opts.apk));
            child_process.exec(util.format('mv ./%s %s/', decompiledDirectory, outputDirectory), function(error, stdout, stderr) {
                callback(null);
            });
        }

        function moveDex2JarDecompiledFile(callback) {
            winston.info("Moving dex2jar decompiled file");

            decompiledFilePath = opts.apk.replace(".apk", "_dex2jar.jar");
            child_process.exec(util.format('mv %s %s/', decompiledFilePath, outputDirectory), function(error, stdout, stderr) {
                callback(null);
            });
        }

        async.series([
            createOutputDirectory,
            runApkTool, runDex2Jar,
            cleanOutputDirectory,
            moveApkToolDecompiledFile, moveDex2JarDecompiledFile
        ], function(error, results) {
            if (error) {
                throw error;
            }else{
                winston.info("Decompile completed");
            }
        });
    }
}
