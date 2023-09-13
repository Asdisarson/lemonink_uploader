// filename: request.js

const https = require('https');
const FormData = require('form-data');

const options = {
    hostname: 'api.lemonink.co',
    path: '/v1/masters',
    method: 'POST',
    headers: {
        'Authorization': 'Token token=change-to-your-api-key',
        'Content-Type': 'application/json'
    }
};

const jsonString = JSON.stringify({
    'master': {
        'name': 'My Beautiful Book'
    }
});

const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log(JSON.parse(data));
    });

}).on('error', (error) => {
    console.error(`Error: ${error.message}`);
});

req.write(jsonString);
req.end();