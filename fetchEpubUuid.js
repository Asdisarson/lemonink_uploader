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
            //Get storage_uuid from response data using Nullish coalescing operator (?.)
            let storage_uuid = response.data.epub?.storage_uuid;

//Check if response.data is not empty and if storage_uuid exists
            if(response.data && storage_uuid){
                //if response is not empty and storage_uuid exists then set it in allResponses
                allResponses.set(storage_uuid, response.data); // you may also want to add `null, 2` params if you want pretty JSON
            }// you may also want to add `null, 2` params if you want pretty JSON
            else {
                // Push the response string data to allResponses array
                allResponses.set(id, response.data);
            }
        }
        allResponses.sync();
        // Save all responses to a single JSON file
    }
    catch (error) {
        console.error(error);
    }
}

makeRequest();