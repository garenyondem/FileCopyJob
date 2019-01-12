'use strict';

const sourceFilePath = process.argv[2],
    destinationDirectory = process.argv[3];

const fs = require('fs'),
    os = require('os'),
    archiver = require('archiver');

let fileSeparator = getFileSeparator(),
    fileName = sourceFilePath.split(fileSeparator).pop(),
    destination = destinationDirectory + fileSeparator + fileName,
    source = '';

function getFileSeparator() {
    switch (os.platform()) {
        case 'win32': return '\\';
        case 'darwin': case 'linux': return '/';
        default: process.exit();
    }
}

async function copy() {
    return new Promise((resolve, reject) => {
        fs.copyFile(sourceFilePath, destination, (err) => {
            if (!err) {
                console.log('File copy successful!');
                return resolve();
            }
            reject(err);
        });
    });
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
    return new Promise((resolve, reject) => {
        console.log('Removing leftovers');
        try {
            fs.unlink(destination, (err) => {
                !err ? resolve() : reject(err);
            });
        } catch (err) {
            resolve();
        }
    });
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
