const fs = require("fs");

async function exist(filepath) {
  let existingConfigfile;
  try {
    fs.accessSync(filepath, fs.constants.F_OK);
    existingConfigfile = true;
    return existingConfigfile;
  } catch (err) {
    existingConfigfile = false;
    return existingConfigfile;
  }
}
module.exports = exist;
