const axios = require('axios');
const fs = require('fs');
const jsonDB = require('simple-json-db')
const array = require('./forjson.json')
async function makeRequest() {
    let allResponses = new jsonDB('./jsonDB.json'); //initialize an array to store all responses

    try {
        for(let i = 0; i < array.length; i++) {
            const id = array[i].epub_uuid;

            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: `https://epub.is/admin/store/get_epub/${id}`,
                headers: { },
                body: {}
            };

            const response = await axios.request(config);
            console.log(i)
            // Push the response string data to allResponses array
            allResponses.set(id, response.data); // you may also want to add `null, 2` params if you want pretty JSON

        }
        allResponses.sync();
        // Save all responses to a single JSON file
    }
    catch (error) {
        console.error(error);
    }
}

makeRequest();