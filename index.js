'use strict';

let fileName = '',
	source = '',
	dest = '';

const sourceFilePath = process.argv[2],
	destDir = process.argv[3];

const fs = require('fs'),
	archiver = require('archiver');

function extractFileName(sourceFilePath) {
	fileName = sourceFilePath.split('\\').pop();
	dest = destDir + '\\' + fileName;
}

async function copy() {
	return new Promise((resolve, reject) => {
		fs.copyFile(sourceFilePath, dest, (err) => {
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

		let path = `${destDir}\\${newFileName()}.zip`;
		let output = fs.createWriteStream(path);
		let input = fs.createReadStream(dest);
		let archive = archiver('zip', {
			zlib: {
				level: 9, // Sets the compression level.
			},
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
			fs.unlink(dest, (err) => {
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
	extractFileName(sourceFilePath);

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
