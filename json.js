var fs = require('fs');

// Read the file
fs.readFile('jsondb.json', 'utf8', function(err, data) {
    if (err) {
        console.error('Could not open file: %s', err);
    }

    // parse stringified JSON to a JavaScript object
    var jsonObject = JSON.parse(data);

    // write parsed JSON to a file
        fs.writeFile('output.json', JSON.stringify(jsonObject, null, 2), function(err) {
        if (err) throw err;
        console.log('Data written to file');
    });
});