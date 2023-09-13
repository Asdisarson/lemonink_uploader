// filename: upload.js

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const form = new FormData();
form.append('master_file[master_id]', 'id-of-the-new-master');
form.append('master_file[file]', fs.createReadStream('My_Beautiful_Book.epub'), { knownLength: fs.statSync('My_Beautiful_Book.epub').size });
form.append('master_file[name]', 'My_Beautiful_Book.epub');

axios.post('https://api.lemonink.co/v1/master_files',
           form,
           {
               headers: {
                   ...form.getHeaders(),
                   'Authorization': 'Token token=change-to-your-api-key'
               }
           }
           ).then((response) => {
               console.log(response.data);
           }).catch((error) => {
               console.error(error);
           });