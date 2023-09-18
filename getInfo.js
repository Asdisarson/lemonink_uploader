const axios = require('axios');
const fs = require('fs').promises;

async function makeRequest(uuid) {
    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://epub.is/admin/store/get_epub/' + uuid,
        headers: {},
    };

    try {
        const response = await axios.request(config);
        console.log(JSON.stringify(response.data));

        // Save the response data using the uuid as the key
        await saveData(uuid, response.data);
    } catch (error) {
        console.error(error);
    }
}

async function saveData(uuid, data) {
    // Load existing data from file
    let existingData;
    try {
        existingData = JSON.parse(await fs.readFile('./data.json', 'utf8'));
    } catch (err) {
        // If file doesn't exist, start with empty data
        if (err.code === 'ENOENT') {
            existingData = {};
        } else {
            throw err;
        }
    }

    // Update data
    existingData[uuid] = data;

    // Write data back to file
    await fs.writeFile('./data.json', JSON.stringify(existingData));

    console.log(`Data for ${uuid} saved successfully.`);
}

module.exports = { makeRequest, saveData };