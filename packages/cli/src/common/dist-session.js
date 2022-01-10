const path = require("path");
const yaml = require("js-yaml");
const fs = require("fs");
const os = require("os");
const chalk = require("chalk");

async function distSession(filepath) {
  //Read .spashipsessionrc.yaml file and get the content
  const HomeDir = os.homedir();
  let sessionData;
  try {
    let fileContents = fs.readFileSync(path.join(HomeDir, ".spashipsessionrc.yaml"), "utf8");
    sessionData = yaml.load(fileContents);
    // console.log(sessionData);
  } catch (e) {
    console.log(e);
  }

  let data;
  let yamlString;
  if (sessionData.dist) {
    // spaship path will always be present in session , before saving dist path in session
    let { token, server, file } = sessionData;
    data = {
      token: token,
      server: server,
      file: file,
      dist: filepath,
    };
    // console.log(data);
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
