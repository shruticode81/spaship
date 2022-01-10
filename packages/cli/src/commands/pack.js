const { Command, flags } = require("@oclif/command");
const { loadRcFile } = require("../common/spashiprc-loader");
const fs = require("fs");
const path = require("path");
const write = require("../common/write");
const { zipDirectory } = require("../common/zip");
const chalk = require("chalk");
const exist = require("../common/exist");
const { isJwtExpired } = require("jwt-check-expiration");

class PackCommand extends Command {
  async run() {
    //load the content of session file
    const configContent = loadRcFile();
    // console.log(configContent);
    let isExpired;
    if (configContent.token && configContent.server) {
      //check if token is expire
      isExpired = isJwtExpired(configContent.token);
      if (!isExpired) {
        if (configContent.file && configContent.dist) {
          //if .spaship file and distPath is present in the session file
          if (await exist(path.join(configContent.file, ".spaship"))) {
            let rawdata = fs.readFileSync(path.resolve(configContent.file, ".spaship"));
            let spashipContent = JSON.parse(rawdata);
            await write(path.join(configContent.dist, ".spaship"), spashipContent);
            this.log(chalk.bold.cyanBright(".spaship file is saved inside dist folder"));

            //zip the entire dist folder
            this.log(chalk.bold("Creating a zip archive in tmp folder..."));
            try {
              const archive = await zipDirectory(configContent.dist);
              this.log(chalk.bold("Done creating the archive at location :"), chalk.bold.redBright(archive));
            } catch (e) {
              this.error(e);
            }
          } else {
            this.log(chalk.yellow(".spaship file does'nt exist at : ") + chalk.bold(configContent.file));
          }
        } else {
          this.error(chalk.bold("Please run spaship init with required file and dist input!!"));
        }
      } else {
        this.error(chalk.redBright.bold("Token got expired, Run login command!!"));
      }
    } else {
      this.error("Ran spaship login command , session file is missing !!");
    }
  }
}

PackCommand.description = ` pack the distribution folder
create and save the zip file of distribution folder which is consist of SPA content inside tmp.
`;

PackCommand.examples = [`$ spaship pack`];
module.exports = PackCommand;
