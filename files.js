const fs = require('fs');
const path = require('path');

const main = async () => {
    try {
        const dirPath = './epub';
        const jsonFilePath = './epub_info.json';
        const data = [];

        // Read directory and store data
        const files = fs.readdirSync(dirPath);

        files.forEach(file => {
            const filePath = path.resolve(dirPath, file);
            const fileInfo = fs.statSync(filePath);

            // Push detailed file info into data array
            data.push({
                name: path.basename(file),
                path: filePath,
                size: fileInfo.size,
                createdAt: fileInfo.birthtime,
                updatedAt: fileInfo.mtime,
                isDirectory: fileInfo.isDirectory()
            });
        });

        // Write data to JSON file
        fs.writeFileSync(jsonFilePath, JSON.stringify(data, null, 2));

        console.log('All operations completed successfully.');
    } catch (error) {
        console.error('Error:', error);
    }
};

main().catch(err => console.error(err));