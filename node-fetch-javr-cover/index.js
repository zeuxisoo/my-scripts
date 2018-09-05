const fs = require('fs');
const path = require('path');
const request = require('request');

//
const config = require('./config.json');

//
function sleep(time) {
    const stop = new Date().getTime() + time;

    while(new Date().getTime() < stop);
}

function findCoverUrl(imagePageUrl) {
    return new Promise((resolve, reject) => {
        request.get(imagePageUrl, (error, response, body) => {
            if (response.statusCode == 200) {
                const pattern = /var\s+img\s+=\s+'(?<url>.*?)';/i;
                const matches = body.match(pattern);

                if (matches != null) {
                    resolve(`${matches.groups.url}`);
                }

                reject(`Cannot find the cover url`);
            }

            reject(`Cannot fetch the page`);
        });
    });
}

async function findFolderCovers(baseImageUrl, folderPaths) {
    let coverList = [];

    for(let folderPath of folderPaths) {
        const folderName   = path.basename(folderPath);
        const imagePageUrl = `${baseImageUrl}/${folderName}`;

        let baseCover = {
            ok          : false,
            message     : '',
            folderPath  : folderPath,
            folderName  : folderName,
            imagePageUrl: imagePageUrl,
            coverUrl    : ''
        };

        console.log(`[${folderName}]`);
        console.log(`=> Folder: ${folderPath}`);
        console.log(`=> Page  : ${imagePageUrl}`);

        try {
            const coverUrl = await findCoverUrl(imagePageUrl);

            coverList.push(Object.assign(baseCover, {
                ok      : true,
                coverUrl: coverUrl,
            }));

            console.log(`=> Cover : ${coverUrl}`);
        }catch(e) {
            coverList.push(Object.assign(baseCover, {
                message: e
            }));

            console.log(`=> Cover : ${e}`);
        }

        sleep(2000);
    }

    return coverList;
}

function downloadCover(coverUrl, saveCoverFilePath)  {
    return new Promise((resolve, reject) => {
        request.get(coverUrl)
            .on('error', error => reject('Cannot fetch the cover'))
            .on('response', response => {
                if (response.statusCode != 200) {
                    reject('Cannot read the cover url');
                }
            })
            .pipe(fs.createWriteStream(saveCoverFilePath))
            .on('finish', error => {
                if (error) {
                    reject('Cannot save cover file');
                }else{
                    resolve(coverUrl);
                }
            });
    });
}

async function downloadCovers(covers) {
    let statusList = [];

    for(let cover of covers) {
        const folderPath = cover.folderPath;
        const saveFile   = `${folderPath}/${cover.folderName}.png`;

        let status = {
            ok        : false,
            message   : '',
            folderName: cover.folderName,
            folderPath: folderPath,
            saveFile  : saveFile
        };

        console.log(`[${cover.folderName}]`);
        console.log(`=> folderPath: ${folderPath}`);
        console.log(`=> SavePath  : ${saveFile}`);

        try {
            const downloadStatus = await downloadCover(cover.coverUrl, saveFile);

            statusList.push(Object.assign(status, {
                ok: true
            }));
        }catch(e) {
            statusList.push(Object.assign(status, {
                message: e
            }));
        }

        sleep(2000);
    }

    return statusList;
}

async function main(basePath) {
    const baseImageUrl = config.baseImageUrl;

    //
    console.log("Reading folder list ...");
    const folderPaths = fs.readdirSync(basePath)
        .map(name => path.join(basePath, name))
        .filter(fullPath => fs.lstatSync(fullPath).isDirectory() === true)
        .sort();

    //
    console.log("Finding folder cover list ...");
    const folderCovers  = await findFolderCovers(baseImageUrl, folderPaths);

    //
    console.log("Downloading folder cover list ...");
    const successCovers  = folderCovers.filter(cover => cover.ok == true);
    const failedCovers   = folderCovers.filter(cover => cover.ok == false);
    const downloadStatus = await downloadCovers(successCovers);

    //
    console.log("Summarizing results ...");
    const notFoundCoverNumbers    = failedCovers
        .map(cover => cover.folderName)
        .join(", ");

    const notDownloadCoverNumbers = downloadStatus
        .filter(status => status.ok == false)
        .map(status => status.folderName)
        .join(",");

    console.log(`=> Not found covers   : ${notFoundCoverNumbers}`);
    console.log(`=> Not download covers: ${notDownloadCoverNumbers}`)
}

//
const args = process.argv.slice(2);

if (args.length <= 0) {
    console.log('Please pass target path');
}else{
    main(args[0]);
}
