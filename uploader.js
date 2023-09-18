const axios = require('axios');

// Function to get authentication headers
function getAuthHeader(apiKey) {
    return {
        'Authorization': `Token token=${apiKey}`,
        'Content-Type': 'application/json',
    };
}

// Function to create a "master" file
async function createMasterFile(apiKey, masterFileName) {
    const authHeader = getAuthHeader(apiKey);

    try {
        const response = await axios.post('https://api.lemonink.co/v1/masters', {
            master: {
                name: masterFileName
            }
        }, { headers: authHeader });

        return response.data;
    } catch (error) {
        console.error(`Error creating master file: ${error.message}`);
        return null;
    }
}

// Function to watermark a file
async function watermarkFile(apiKey, masterId, watermarkValue) {
    const authHeader = getAuthHeader(apiKey);

    try {
        const response = await axios.post('https://api.lemonink.co/v1/transactions', {
            transaction: {
                master_id: masterId,
                watermark_value: watermarkValue
            }
        }, { headers: authHeader });

        return response.data;
    } catch (error) {
        console.error(`Error watermarking file: ${error.message}`);
        return null;
    }
}

// Function to generate download link
function getLink(token, id, format) {
    return `https://dl.lemonink.co/transactions/${token}/${id}.${format}`;
}

module.exports = {
    getAuthHeader,
    createMasterFile,
    watermarkFile,
    getLink
};