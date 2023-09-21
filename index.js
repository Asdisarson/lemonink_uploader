require('dotenv').config();
const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const csvParser = require('csv-parser');
const winston = require('winston'); // logging library

const API_KEY = process.env.API_KEY || "";
const BASE_URL = 'https://api.lemonink.co/v1';

const JSON_HEADERS = {
    Authorization: `Token token=${API_KEY}`,
    'Content-Type': 'application/json',
};

const db = {};

// Configure winston to log to both the console and file system
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
    ],
});

async function createMaster(name) {
    try {
        const url = `${BASE_URL}/masters`;
        const payload = { master: { name } };
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: JSON_HEADERS,
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return [await response.json()];
    } catch (error) {
        logger.error('Error in createMaster:', error);
        throw error;
    }
}

async function attachFiles(masterId, filePath, fileName) {
    try {
        console.log(`Master ID: ${masterId}, File Path: ${filePath}, File Name: ${fileName}`);

        const url = `${BASE_URL}/master_files`;
        const form = new FormData();
        form.append('master_file[master_id]', masterId);
        form.append('master_file[file]', fs.createReadStream(filePath));
        form.append('master_file[name]', fileName);

        const headers = {
            ...form.getHeaders(),
            Authorization: `Token token=${API_KEY}`,
        };

        const response = await fetch(url, {
            method: 'POST',
            body: form,
            headers: headers,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return [await response.json()];
    } catch (error) {
        logger.error('Error in attachFiles:', error);
        throw error;
    }
}

function readCSVFile(filePath) {
    return new Promise((resolve, reject) => {
        const books = [];
        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on('data', (row) => books.push(row))
            .on('end', () => resolve(books))
            .on('error', err => {
                logger.error('Error in readCSVFile:', err);
                reject(err);
            });
    });
}

(async function main() {
    try {
        const books = await readCSVFile('./input.csv');
        const csvOutput = ["name,epub_uuid,master_id"];

        for (const book of books) {
            if (!book.hasOwnProperty('epub_uuid') || !book['epub_uuid']) {
                logger.error(`The epub_uuid property does not exist or is empty for this book: ${JSON.stringify(book, null, 2)}`);
                continue;
            }

            const fullPath = `storage/${book['epub_uuid']}.epub`;

            try {
                const masterResponse = await createMaster(book['Title']);
                if (!masterResponse || !masterResponse[0].master) {
                    logger.error(`Failed to create Master for book: ${JSON.stringify(book, null, 2)}`);
                    continue;
                }

                const masterId = masterResponse[0].master.id;
                logger.info(`Created Master ID: ${masterId}`);

                const attachResponse = await attachFiles(masterId, fullPath, book['epub_uuid']);
                if (!attachResponse) {
                    logger.error(`Failed to attach files for Master ID: ${masterId} and book: ${JSON.stringify(book, null, 2)}`);
                    continue;
                }
                logger.info(`Attached File: ${JSON.stringify(attachResponse[0], null, 2)}`);

                db[book['Title']] = {
                    masterId,
                    attachResponse: attachResponse[0],
                };

                csvOutput.push(`${book['Title']},${book['epub_uuid']},${masterId}`);
            } catch (error) {
                logger.error(`An error occurred processing book: ${JSON.stringify(book, null, 2)} - Error: ${JSON.stringify(error, null, 2)}`);
            }
        }

        fs.writeFileSync('database.json', JSON.stringify(db, null, 2));
        fs.writeFileSync('output.csv', csvOutput.join('\n'));

    } catch (error) {
        logger.error('Error in main:', error);
    }
})();
