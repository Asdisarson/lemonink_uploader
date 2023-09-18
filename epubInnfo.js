const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function makeRequest(uuid) {
    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://epub.is/admin/store/get_epub/' + uuid,
        headers: { }
    };

    try {
        const response = await axios.request(config);
        // Save the response regardless whether it is JSON or not
        fs.writeFileSync(uuid + '.txt', JSON.stringify(response.data));
    } catch (error) {
        console.error(error);
    }
}

// Specify the directory
const dir = './epub';

// Read the directory
fs.readdir(dir, (err, files) => {
    if (err) {
        console.error('Could not list the directory.', err);
        process.exit(1);
    }

    // Iterate over every file
    files.forEach((file, index) => {
        // Get the full file name
        const fullFilePath = path.join(dir, file);

        // Get the UUID (filename without extension)
        const uuid = path.basename(fullFilePath, path.extname(fullFilePath));

        // Make the request
        makeRequest(uuid);
    });
});