const {Command} = require('@oclif/command');
const { loadRcFile } = require("../common/spashiprc-loader");
const fs = require("fs");
const path = require("path");
const write = require("../common/write");
const { zipDirectory } = require("../common/zip");
const fileUpload = require("../common/file-upload");
const chalk = require("chalk");
const exist = require("../common/exist");


class UploadCommand extends Command {
  async run() {
    const configContent = loadRcFile();
    if (configContent.file && configContent.dist) {
      //if .spaship file and distPath is present in the session file
      if(await exist(path.join(configContent.file, ".spaship"))){
        //check if configContent.file contain .spaship file
        let rawdata = fs.readFileSync(path.resolve(configContent.file, ".spaship"));
        let spashipContent = JSON.parse(rawdata);
        const webProperty = spashipContent.websiteName;
        await write(path.join(configContent.dist, ".spaship"), spashipContent);
        this.log(chalk.bold.cyanBright(".spaship file is saved inside dist folder"));

        this.log(chalk.bold("Creating a zip archive in tmp..."));
        try {
          //zip the entire dist folder
          const archive = await zipDirectory(configContent.dist);
          this.log(chalk.bold("Done creating the archive at location :"), chalk.bold.redBright(archive));
          //Upload the zip file
          const response = await fileUpload(archive,webProperty);
          // console.log(response);
          this.log(chalk.bold.greenBright(response.data.status));

        } catch (e) {
          this.error(e);
        }
      }else{
        console.log(chalk.yellow('.spaship file does\'nt exist at : ')+chalk.bold(configContent.file));
      }
      
    }else{
      this.error(chalk.redBright('.spashipsessionrc.yaml file does\'nt consist .spaship file path and dist path ')+chalk.cyanBright(',Try running Login & init Command'));
    }
  }
}

UploadCommand.description = ` deploy to a SPAship host
Send zip file containing a SPA to a SPAship host for deployment.

`
UploadCommand.examples = [
  `$ spaship upload`
]
module.exports = UploadCommand
