const { Command, flags } = require("@oclif/command");
const { loadRcFile } = require("../common/spashiprc-loader");
const fs = require("fs");
const os = require("os");
const path = require("path");
const inquirer = require("inquirer");
const write = require("../common/write");
const { zipDirectory } = require("../common/zip");
const fileUpload = require("../common/file-upload");
const chalk = require("chalk");
const exist = require("../common/exist");
const { isJwtExpired } = require("jwt-check-expiration");

class UploadCommand extends Command {
  async run() {
    const configContent = loadRcFile();
    let isExpired;
    if (configContent.token && configContent.server) {
      //check if token is expire
      isExpired = isJwtExpired(configContent.token);
      if (!isExpired) {
        const { args } = this.parse(UploadCommand);
        if (configContent.file && configContent.dist) {
          //if .spaship file and distPath is present in the session file
          if (await exist(path.join(configContent.file, ".spaship"))) {
            let response = {};
            let rawdata = fs.readFileSync(path.resolve(configContent.file, ".spaship"));
            let spashipContent = JSON.parse(rawdata);
            const webProperty = spashipContent.websiteName;
            if (args.zip) {
              //upload the zip provided in flag
              try {
                response = await fileUpload(path.join(os.tmpdir(), args.zip), webProperty);
                this.log(chalk.bold.greenBright(response.data.status));
              } catch (e) {
                this.error(e);
              }
            } else {
              let zipPrompt = await inquirer.prompt([
                {
                  name: "zipConfirm",
                  type: "confirm",
                  message: "Do you want to provide zip file?",
                },
              ]);

              if (zipPrompt.zipConfirm) {
                //user wants to provide zip file
                let zipPrompts = await inquirer.prompt([
                  {
                    name: "zipFile",
                    type: "input",
                    message: "Zip File",
                  },
                ]);
                //upload the user's input zip
                try {
                  response = await fileUpload(path.join(os.tmpdir(), zipPrompts.zipFile), webProperty);
                  this.log(chalk.bold.greenBright(response.data.status));
                } catch (e) {
                  this.error(e);
                }
              } else {
                //user doesn't provided zip file,save .spaship file & zip it
                await write(path.join(configContent.dist, ".spaship"), spashipContent);
                this.log(
                  chalk.bold.cyanBright(".spaship at ") +
                    chalk.bold.yellowBright(configContent.file) +
                    chalk.bold.cyanBright(` is saved inside ${path.basename(configContent.dist)} at `) +
                    chalk.bold.yellowBright(configContent.dist)
                );
                this.log(chalk.bold("Creating a zip archive in tmp..."));
                try {
                  //zip the entire dist folder
                  const archive = await zipDirectory(configContent.dist);
                  this.log(chalk.bold("Done creating the archive at location :"), chalk.bold.yellowBright(archive));
                  //Upload the zip file
                  response = await fileUpload(archive, webProperty);
                  // console.log(response);
                  if (response.status === "success") {
                    this.log(chalk.bold.greenBright(response.data.status));
                  }
                } catch (err) {
                  this.log(chalk.bold.redBright(err));
                }
              }
            }
          } else {
            console.log(chalk.yellow(".spaship file does'nt exist at : ") + chalk.bold(configContent.file));
          }
        } else {
          this.error(
            chalk.bold.redBright(".spashipsessionrc.yaml file does'nt consist .spaship file path and dist path, ") +
              chalk.bold.cyanBright("Please run spaship init Command")
          );
        }
      } else {
        this.error(chalk.redBright.bold("Token got expired, Run login command !"));
      }
    } else {
      this.error("Run spaship login command , session file is missing !");
    }
  }
}
UploadCommand.description = ` deploy to a SPAship host
Send zip file containing a SPA to a SPAship host for deployment.

`;
UploadCommand.args = [
  {
    name: "zip",
    required: false,
    default: null,
    description: "An archive (zip) file containing SPA static assets and a .spaship configfile.",
  },
];

UploadCommand.examples = [
  `$ spaship upload your-app-1.0.0.zip #here your-app-1.0.0.zip refer to zip created by pack command`,
  `$spaship upload # will prompt to enter your-app-1.0.0.zip`,
  `If no your-app-1.0.0.zip is provided it will zip and upload it.`,
];
module.exports = UploadCommand;
