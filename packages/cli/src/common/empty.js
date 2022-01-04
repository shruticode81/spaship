const fs = require('fs');

async function isDirEmpty(path) {
    return fs.promises.readdir(path).then(files => {
        return files.length === 0;
    });
}

module.exports = isDirEmpty;