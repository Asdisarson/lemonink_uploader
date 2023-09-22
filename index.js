require('dotenv').config();

const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const jsonDB = require('simple-json-db');
const winston = require('winston');
const API_KEY = process.env.API_KEY;
const BASE_URL = 'https://api.lemonink.co/v1';

const jsonHeaders = {
    'Authorization': `Token token=${API_KEY}`,
    'Content-Type': 'application/json'
};

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'user-service' },
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error', handleExceptions: true}),
        new winston.transports.File({ filename: 'combined.log' }),
    ],
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}


async function createMaster( name) {
    try {
        const response = await axios.post(`${BASE_URL}/masters`, {
            master: {
                name: name
            }
        }, {
            headers: jsonHeaders
        });
        return response.data.master.id;
    } catch (error) {
        logger.error('Error creating master:', error);
        return;
    }
}

async function attachFileToMaster(masterId, filepath, filename) {
    try {
        const form = new FormData();
        form.append('master_file[master_id]', masterId);
        form.append('master_file[file]', fs.createReadStream(filepath));
        form.append('master_file[name]', filename);

        const response = await axios.post(`${BASE_URL}/master_files`, form, {
            headers: {
                ...form.getHeaders(),
                'Authorization': `Token token=${API_KEY}`
            }
        });
        return response.data.master_file.id;
    } catch (error) {
        logger.error('Error attaching file to master:', error);
        return;
    }
}

(async () => {
    let db = new jsonDB('./jsonDB.json')

    async function processFile() {
        try {
            const data = await fs.promises.readFile('epubFiles.csv', 'utf8');
            const lines = data.split('\n');
            const result = lines.slice(1).map(line => {
                const [location, filenameWithExtension, epub_uuid] = line.split(',');
                return { location, filenameWithExtension, epub_uuid };
            });
            logger.info(JSON.stringify(result, null, 2));
            return result;
        } catch (err) {
            logger.error('Error reading file:', err);
            return;
        }
    }

    processFile().then(async (array) => {
        let output = [];
        let output_error = [];
        for (let i = 0; i < array.length; i++) {
            let item = array[i];
            console.log(i);

            try {
                if (item) {
                    let item_db = db.get(item.epub_uuid)
                    let name = item.epub_uuid;
                    if (!item_db || item_db === null || item_db === undefined) {
                        logger.error(`No item found in db with epub_uuid: ${item.epub_uuid}`);
                    }
                    else {
                        name =  item_db.epub?.title;
                    }
                    logger.info(item_db)

                    const masterId = await createMaster(name);
                    if (!masterId || masterId === null || masterId === undefined) {
                        logger.error(`Error creating master for ${name}`);
                        continue; // Skip iteration if there was an error creating master
                    }
                    logger.info(`Master ID: ${masterId}`);

                    const masterFileId = await attachFileToMaster(masterId, item?.location, item?.filenameWithExtension);
                    if (!masterFileId || masterFileId === null || masterFileId === undefined) {
                        logger.error(`Error attaching file to master: ${masterId}`);
                        continue; // Skip iteration if there was an error attaching file to master
                    }

                    logger.info(`Master File ID: ${masterFileId}`)

                    output.push({
                        masterFileId: masterFileId,
                        masterId: masterId,
                        epub_uuid: item?.epub_uuid,
                        name: name,
                        isbn: item_db.epub?.isbn,
                        epub_storage_uuid: item_db.epub?.storage_uuid,
                        imprint: item_db.epub?.imprint,
                        filename: item?.filenameWithExtension,
                        old_filename: item_db.storage?.file_name,
                        description: item_db.epub?.description,
                        creators: item_db.creators,
                        contributors: item_db.contributors,
                        categories: item_db.name
                    })
                }
            } catch (err) {
                logger.error(`Error processing array item at index ${i}:`, err);
            }
        }
        let output_db = new jsonDB('./output.json');
        output_db.JSON(output_db);
        output_db.sync()
    }).catch(err => {
        logger.error(err)
    });

})();