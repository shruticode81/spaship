const path = require("path");
const yaml = require("js-yaml");
const fs = require("fs");
const os = require("os");
const chalk = require("chalk");
const { loadRcFile } = require("./spashiprc-loader");

async function distSession(filepath) {
  const yamlContent = loadRcFile();
  const HomeDir = os.homedir();
  let data;
  let yamlString;
  if (yamlContent.dist) {
    // spaship path will always be present in session , before saving dist path in session
    const { token, server, file } = yamlContent;
    data = {
      token: token,
      server: server,
      file: file,
      dist: filepath,
    };
    yamlString = yaml.dump(data);
    fs.writeFileSync(path.join(HomeDir, ".spashipsessionrc.yaml"), yamlString, "utf8");
    console.log(chalk.bold.greenBright("Dist path is successfully overwritten & saved in session"));
  } else {
    data = {
      dist: filepath,
    };
    yamlString = yaml.dump(data);
    fs.appendFileSync(path.join(HomeDir, ".spashipsessionrc.yaml"), yamlString, "utf8");
    console.log(chalk.bold.redBright("Dist path is successfully saved in session"));
  }
}
module.exports = distSession;
