const Papa = require('papaparse');
const fs = require('fs');
const _ = require('lodash');

function combineCsvFiles(inputFile, epubFile, outputFile) {
    const inputCsv = fs.readFileSync(inputFile, 'utf8');
    const epubCsv = fs.readFileSync(epubFile, 'utf8');

    let inputRecords = Papa.parse(inputCsv, { header: true }).data;
    let epubRecords = Papa.parse(epubCsv, { header: true }).data;

    // Filter records, keeping only those with non-empty epub_uuid field
    epubRecords = epubRecords.filter(record => record.epub_uuid && _.trim(record.epub_uuid) !== '');
    inputRecords = inputRecords.filter(record => record.epub_uuid && _.trim(record.epub_uuid) !== '');

    // Collect records where the epub_uuid exists in both CSVs
    const matchedRecords = [];

    epubRecords.forEach(record => {
        const match = inputRecords.find(input => input.epub_uuid === record.epub_uuid);
        if (match) {
            matchedRecords.push({...match, ...record});
        }
    });

    // Write only matched records
    const combinedCsv = Papa.unparse(matchedRecords);
    fs.writeFileSync(outputFile, combinedCsv);
}

combineCsvFiles('input.csv', 'epubFiles.csv', 'combined.csv');