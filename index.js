'use strict';

const sourceFilePath = process.argv[2],
    destinationDirectory = process.argv[3];

const fs = require('fs'),
    os = require('os'),
    util = require('util'),
    promisify = util.promisify,
    archiver = require('archiver');

let fileSeparator = getFileSeparator(),
    fileName = sourceFilePath.split(fileSeparator).pop(),
    destination = destinationDirectory + fileSeparator + fileName;

const copyFile = promisify(fs.copyFile),
    unlink = promisify(fs.unlink);

function getFileSeparator() {
    switch (os.platform()) {
        case 'win32': return '\\';
        case 'darwin': case 'linux': return '/';
        default: process.exit();
    }
}

async function copy() {
    await copyFile(sourceFilePath, destination);
    console.log('File copy successful!');
    return;
}

async function zip() {
    return new Promise((resolve, reject) => {
        console.log('Zipping copied file');
        let path = destinationDirectory + fileSeparator + newFileName() + '.zip';
        let output = fs.createWriteStream(path);
        let input = fs.createReadStream(destination);
        let archive = archiver('zip', {
            zlib: {
                level: 9, // Sets the compression level.
            }
        });

        function listener(err) {
            if (!err) {
                console.log('Zipping complete');
                resolve();
            } else {
                reject(err);
            }
        }

        archive
            .on('warning', listener)
            .on('error', listener)
            .on('end', listener);

        archive.pipe(output);
        archive.append(input, {
            name: fileName,
        });
        archive.finalize();
    });
}

async function remove() {
    console.log('Removing leftovers');
    return await unlink(destination);
}

function newFileName() {
    let date = new Date();
    let name = date.toISOString().substr(0, 10);
    return name;
}

(async function init() {
    try {
        await copy();
        await zip();
        await remove();
        console.log('All done!');
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
})();
