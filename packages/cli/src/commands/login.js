const {Command, flags} = require('@oclif/command');
const fs = require('fs');
const { loadRcFile } = require("../common/spashiprc-loader");
const {isEmpty} = require("lodash");
const inquirer = require("inquirer");
const yaml = require("js-yaml");
const axios = require("axios");
const os = require("os");
const path = require("path");
const chalk = require("chalk")

class LoginCommand extends Command {
  
  async run() {
    
    const {flags} = this.parse(LoginCommand);
    let token = flags.token;
    let server = flags.server;

    const configSession = loadRcFile();

    //validate the token by making req to api 
    let result;
    if(!isEmpty(flags)){
      const AuthStr = 'Bearer ' + flags.token;     //the token is a variable which holds the token
      // console.log(AuthStr);
      // console.log(`${flags.server}`+`/api/v1/applications/validate`);
      try{
        const url = `${flags.server}`+`/api/v1/applications/validate`;
        const res = await axios({
          method: "post",
          url:url,
          headers: {
            'Authorization': AuthStr,
          }
        })
          this.log(chalk.bold.magentaBright("Token ",res.data.message));
          result = res.data;
        }      
      catch(err){
        this.log(chalk.redBright("Error type : 401 Authentication"));
      }
        
    }else{
      this.error(chalk.bold("Run spaship login command with --token && --server flags"));
    }
   
    const userHomeDir = os.homedir();
    if(result.status == "success"){
      if(isEmpty(configSession)){
        //if .spashipsessionrc.yaml file is not found , create it and assign data into it
        if(!isEmpty(flags)){
          //if flags have data then create .spashipsession.yaml file
          
          let data = { 
            token: `${token}`,
            server: `${server}`
          };
          // console.log("data",data);
          let yamlStr = yaml.dump(data);
          fs.writeFileSync(path.join(userHomeDir, ".spashipsessionrc.yaml"), yamlStr, 'utf8');
          console.log(chalk.bold.blueBright('.spashipsessionrc.yaml file got created at :') + chalk.bold.yellowBright(userHomeDir));
        }else{
          //flags object is empty and configSession is also empty
          this.error(" Run spaship login command with --token && --server flags ");
        }
      }
      else{
        // console.log(".spashipsession.yaml file already exists : ",configSession);
        var prompts = await inquirer
        .prompt([
          {
            name: "Overwrite",
            type: "confirm",
            message: "A .spashipsessionrc.yaml file already exists, do want to overwrite it?",
          },
        ])
        if(prompts.Overwrite){
          //overwrite data into .spashipsession.yaml file
          if(!isEmpty(flags)){
            let dataOverwrite = { 
              token: `${token}`,
              server: `${server}`
            };
            // console.log("data",dataOverwrite);
            let yamlData = yaml.dump(dataOverwrite);
            fs.writeFileSync(path.join(userHomeDir,".spashipsessionrc.yaml"), yamlData, 'utf8');
            this.log(chalk.bold(".spashipsessionrc.yaml file got overwritten !!"));
    
          }
          
        }
      }
    }
    else{
      this.error(chalk.bold.redBright("Token is invalid !!"));
    }
    
  }
  
    
}

LoginCommand.description = `Authenticate and Authorize users inorder to deploy SPA
user access token && server url is saved inside config file(.spashipsessionrc.yaml) .
spaship login command can be copied from web-ui.
`

LoginCommand.flags = {
  token: flags.string({
        char: "t",
        description: "jwt token for authentication",
      }),
  server: flags.string({
    char: "s",
    description: "orchestrator-base-url it is responsible for loading file from cli",
  }),
}

LoginCommand.examples = [
  `$ spaship login --token=eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiS --server=http://dev.api.apps.int.spoke.preprod.us-west-2.aws.paas.redhat.com`,
  `Here server refer to api Base-URL && token refer to jwt access token for authorization`

];

module.exports = LoginCommand

