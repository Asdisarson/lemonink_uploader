require('dotenv').config();

const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const jsonDB = require('simple-json-db');
// Replace this with your API key from LemonInk
const API_KEY = process.env.API_KEY;

// Base URL for LemonInk API
const BASE_URL = 'https://api.lemonink.co/v1';

// Common headers for JSON requests
const jsonHeaders = {
    'Authorization': `Token token=${API_KEY}`,
    'Content-Type': 'application/json'
};

// Create a Master File
async function createMaster() {
    try {
        const response = await axios.post(`${BASE_URL}/masters`, {
            master: {
                name: key.epub.title
            }
        }, {
            headers: jsonHeaders
        });
        return response.data.master.id;
    } catch (error) {
        console.error('Error creating master:', error);
    }
}

// Attach a File to the Master
async function attachFileToMaster(masterId,key) {
    try {
        const form = new FormData();
        form.append('master_file[master_id]', masterId);
        form.append('master_file[file]', fs.createReadStream(key.epub.storage_uuid.epub));
        form.append('master_file[name]', key.epub.storage_uuid+'.epub');

        const response = await axios.post(`${BASE_URL}/master_files`, form, {
            headers: {
                ...form.getHeaders(),
                'Authorization': `Token token=${API_KEY}`
            }
        });
        return response.data.master_file.id;
    } catch (error) {
        console.error('Error attaching file to master:', error);
    }
}

// Watermark a File
async function watermarkFile(masterId) {
    try {
        const response = await axios.post(`${BASE_URL}/transactions`, {
            transaction: {
                master_id: masterId,
                watermark_value: "A text that will be inserted into the file"
            }
        }, {
            headers: jsonHeaders
        });
        return response.data.transaction.id;
    } catch (error) {
        console.error('Error watermarking file:', error);
    }
}

// Construct Delivery URL
function constructDeliveryURL(transactionId, format) {
    return `https://dl.lemonink.co/transactions/${transactionId}/${transactionId}.${format}`;
}

// Main Function to Execute All Steps
(async () => {
    let json = new jsonDB('./jsonDB.json')
    let db = json.JSON();
    const fs = require('fs').promises;

    async function processFile() {
        try {
            const data = await fs.readFile('epubFiles.csv', 'utf8');

            const lines = data.split('\n');

            const result = lines.slice(1).map(line => {
                const [location, filenameWithExtension, epub_uuid] = line.split(',');
                return { location, filenameWithExtension, epub_uuid };
            });

            console.log(JSON.stringify(result, null, 2));

        } catch (err) {
            console.error('Error reading file:', err);
        }
    }

    let item = await processFile();
    if(item?.epub) {
        item = db.get(item.epub.epub_uuid)

        const masterId = await createMaster(item);
        console.log(`Master ID: ${masterId}`);

        const masterFileId = await attachFileToMaster(masterId, item);
        console.log(`Master File ID: ${masterFileId}`);
    }
})();
