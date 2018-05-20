'use strict';

let fileName = '',
    source = '',
    dest = '';

const sourceFilePath = process.argv[2],
    destDir = process.argv[3];

const fs = require('fs'),
    archiver = require('archiver'),
    async = require('async');

function extractFileName(sourceFilePath) {
    fileName = sourceFilePath.split('\\').pop();
    dest = destDir + '\\' + fileName;
}

function copy(callback) {
    fs.copyFile(sourceFilePath, dest, (err) => {
        if (!err) {
            console.log('File copy successful!');
        }
        callback(err);
    })
}

function zip(callback) {
    console.log('Zipping copied file')

    let path = `${destDir}\\${newFileName()}.zip`;
    let output = fs.createWriteStream(path);
    let input = fs.createReadStream(dest);
    let archive = archiver('zip', {
        zlib: {
            level: 9 // Sets the compression level.
        }
    });

    archive.on('warning', (err) => {
        callback(err);
    }).on('error', (err) => {
        callback(err);
    }).on('end', (err) => {
        console.log('Zipping complete');
        callback();
    });

    archive.pipe(output);
    archive.append(input, {
        name: fileName
    });
    archive.finalize();
}

function remove(callback) {
    console.log('Removing leftovers');
    try {
        fs.unlink(dest, callback);
    } catch (err) {
        callback();
    }
}

function newFileName() {
    let date = new Date();
    let name = date.toISOString().substr(0, 10);
    return name;
}

(function init() {
    extractFileName(sourceFilePath);

    async.series([
        (cb) => copy(cb),
        (cb) => zip(cb),
        (cb) => remove(cb)
    ], (err) => {
        !err ? console.log('All done!') : console.error(err);
        process.exit(0);
    });
})();