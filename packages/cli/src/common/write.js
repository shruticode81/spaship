const fs = require("fs");
// const yaml = require("js-yaml");
// const pkg = require("../../package.json");
// const validate = require("./validate");
const valid = require("./valid");

async function write(filename, data) {
  //validate the JSON data - calling valid func

  const { validate } = valid(data);
  if (!validate) {
    log.warn(`WARNING: configuration is invalid, `, data);
  }
  var stringify = JSON.stringify(data);

  fs.writeFileSync(filename, stringify, function (err) {
    if (err) {
      console.log(err);
    }
    // console.log("The file was saved!");
  });
}
module.exports = write;
