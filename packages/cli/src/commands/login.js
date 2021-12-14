const {Command, flags} = require('@oclif/command');
const fs = require('fs');
const { loadRcFile } = require("../common/spashiprc-loader");
const {isEmpty} = require("lodash");
const inquirer = require("inquirer");
const yaml = require("js-yaml");
const axios = require("axios");
const os = require("os");
const path = require("path");


class LoginCommand extends Command {
  
  async run() {
    
    var {flags} = this.parse(LoginCommand)
    console.log(flags);
    var token = flags.token;
    var server = flags.server;

    const configSession = loadRcFile();
    // console.log(configSession);

    //validate the token by making req to api 
    if(!isEmpty(flags)){
      const AuthStr = 'Bearer ' + flags.token;     //the token is a variable which holds the token
      console.log(AuthStr);
      console.log(`${flags.server}`+`/api/v1/applications/validate`);
      try{
        
        const res = await axios.post(`${flags.server}`+`/api/v1/applications/validate`, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': AuthStr,
            }
        });
          console.log(res.data);
        }      
      catch(err){
        this.log("Error type : ",err);
      }
        
    }else{
      this.log("Run spaship login command with --token && --server flags");
    }
      
    // const tempDir = os.tmpdir();
    // console.log(path.join(tempDir,"spaship.yaml"));
    const userHomeDir = os.homedir();
    console.log(userHomeDir);
    // try {
    //   fs.mkdirSync(tempDir); // If temp dir doesn't exist create it
    // } catch (e) {
    //   // Do nothing
    // }
  
    if(res.status == "success"){
      if(isEmpty(configSession)){
        //if .spashipsessionrc.yaml file is not found , create it and assign data into it
        if(!isEmpty(flags)){
          //if flags have data then create .spashipsession.yaml file
          
          let data = { 
            token: `${token}`,
            server: `${server}`
          };
          console.log("data",data);
          let yamlStr = yaml.dump(data);
          fs.writeFileSync(path.join(userHomeDir, ".spashipsessionrc.yaml"), yamlStr, 'utf8');
          // this.log(".spashipsessionrc.yaml file got created at :",process.cwd());
  
          
        }else{
          //flags object is empty and configSession is also empty
          console.log(" Run spaship login command with --token && --server flags ");
        }
        
        
      }
      else{
        console.log(".spashipsession.yaml file already exists : ",configSession);
        var prompts = await inquirer
        .prompt([
          {
            name: "Overwrite",
            type: "confirm",
            message: "A .spashipsessionrc.yaml file already exists, overwrite it?",
          },
        ])
        if(prompts.Overwrite){
          //overwrite data into .spashipsession.yaml file
          if(!isEmpty(flags)){
            let dataOverwrite = { 
              token: `${token}`,
              server: `${server}`
            };
            console.log("data",dataOverwrite);
            let yamlData = yaml.dump(dataOverwrite);
            fs.writeFileSync(path.join(userHomeDir,".spashipsessionrc.yaml"), yamlData, 'utf8');
            this.log(".spashipsessionrc.yaml file got overwritten !!");
    
          }
          
        }
      }
    }
    else{
      console.log("Token is invalid !!")
    }
    
  }
  
    
}



LoginCommand.description = `Describe the command here
...
Extra documentation goes here
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

module.exports = LoginCommand


