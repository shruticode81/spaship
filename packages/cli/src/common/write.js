const fs = require("fs");
const chalk = require("chalk");
const valid = require("./valid");
// const { log } = require("../../../common/lib/logging/pino");

async function write(filename, data) {
  //validate the JSON data - calling valid func

  const { validate } = valid(data);
  if (!validate) {
    console.log(chalk.bold(`WARNING: configuration is invalid,`) + chalk.redBright.bold(`Environment field is empty`));
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
