const fs = require("fs");
const chalk = require("chalk");
const valid = require("./valid");
// const { log } = require("../../../common/lib/logging/pino");

async function write(filename, data) {
  //validate the JSON data - calling valid func
  const { validate } = valid(data);
  if (!validate) {
    // if (data.websiteName.length === 0 || data.name.length === 0 || data.mapping === 0) {
    //   console.log(
    //     chalk.bold(".spaship file configuration is invalid,") + chalk.redBright.bold(` All fields are Mandatory.`)
    //   );
    // }
    console.log(
      chalk.bold(".spaship file configuration is invalid, ") + chalk.redBright.bold(`NOTE: All fields are Mandatory.`)
    );
    // log.warn(`WARNING: configuration is invalid, `, data);

    return "invalid";
  } else {
    var stringify = JSON.stringify(data);
    fs.writeFileSync(filename, stringify, function (err) {
      if (err) {
        console.log(err);
      }
      // console.log("The file was saved!");
    });
  }
}
module.exports = write;
