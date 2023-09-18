// fileData.js

const path = require('path');
const fs = require('fs-extra');

async function generateFileData(dir) {
    let data = [];

    try {
        const files = await fs.walk(dir);

        for (let file of files) {
            try {
                let fileStats = await fs.stat(file);
                data.push({
                    filenameWithExtension: path.basename(file),
                    filename: path.basename(file, path.extname(file)),
                    filepath: file,
                    filesize: fileStats.size,
                    filetype: path.extname(file).slice(1)
                });
            } catch (fileError) {
                console.error(`Error occurred while processing file ${file}: `, fileError);
            }
        }

        try {
            await fs.writeJson('filedb.json', data);
            console.log('Successfully wrote file data to filedb.json');
        } catch (writeError) {
            console.error('Error occurred while writing file data to filedb.json: ', writeError);
        }
    } catch (error) {
        console.error('Error occurred while walking the directory: ', error);
    }
}

module.exports = generateFileData;