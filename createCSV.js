const fs = require('fs');
const path = require('path');
const ObjectsToCsv = require('objects-to-csv');

// Function to get the list of .epub files in a directory
function getEpubFiles(dirPath) {
    let files = fs.readdirSync(dirPath);
    let epubFiles = [];

    files.forEach(file => {
        if (path.extname(file) === '.epub') {
            epubFiles.push({
                location: path.join(dirPath, file),
                filenameWithExtension: file,
                filenameWithoutExtension: path.basename(file, '.epub')
            });
        }
    });

    return epubFiles;
}

// Path of the directory to scan
let dirPath = './storage'; // change this to your directory

// Get the .epub files and their details
let epubFiles = getEpubFiles(dirPath);

// Create a CSV file from the data
new ObjectsToCsv(epubFiles).toDisk('./epubFiles.csv');