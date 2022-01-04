const yaml = require("js-yaml");
const fs = require("fs");
const path = require("path");
const os = require("os");
const chalk = require("chalk");
const { loadRcFile } = require("./spashiprc-loader");

async function session(filepath) {
  const yamlContent = loadRcFile();
  const HomeDir = os.homedir();
  let data;
  let yamlString;
  if (yamlContent.file) {
    if (yamlContent.dist) {
      const { token, server, dist } = yamlContent;
      data = {
        token: token,
        server: server,
        file: filepath,
        dist: dist,
      };

      yamlString = yaml.dump(data);
      fs.writeFileSync(path.join(HomeDir, ".spashipsessionrc.yaml"), yamlString, "utf8");
      console.log(chalk.bold.greenBright("spaship path is successfully overwritten & saved in session"));
    } else {
      const { token, server } = yamlContent;
      data = {
        token: token,
        server: server,
        file: filepath,
      };

      yamlString = yaml.dump(data);
      fs.writeFileSync(path.join(HomeDir, ".spashipsessionrc.yaml"), yamlString, "utf8");
      console.log(chalk.bold.greenBright("spaship path is successfully overwritten & saved in session"));
    }
  } else {
    data = {
      file: filepath,
    };
    yamlString = yaml.dump(data);
    //   fs.writeFileSync(path.join(userHomeDir, ".spashipsessionrc.yaml"), yamlStr, "utf8");
    fs.appendFileSync(path.join(HomeDir, ".spashipsessionrc.yaml"), yamlString, "utf8");
    console.log(chalk.bold.redBright("spaship path is successfully saved in session"));
  }
}
module.exports = session;
