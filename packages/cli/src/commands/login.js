const { Command, flags } = require("@oclif/command");
const fs = require("fs");
const { loadRcFile } = require("../common/spashiprc-loader");
const { isEmpty } = require("lodash");
const inquirer = require("inquirer");
const yaml = require("js-yaml");
const axios = require("axios");
const os = require("os");
const path = require("path");
const chalk = require("chalk");

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

class LoginCommand extends Command {
  async run() {
    const { flags } = this.parse(LoginCommand);
    const configSession = loadRcFile();
    const userHomeDir = os.homedir();
    let token;
    let server;

    let result = {};
    //if flags is not empty
    if (!isEmpty(flags)) {
      token = flags.token;
      server = flags.server;
      // console.log(flags);
    } else {
      // prompt user to enter token & server value
      do {
        var TokenPrompts = await inquirer.prompt([
          {
            name: "token",
            type: "input",
            message: "Please enter token",
          },
          {
            type: "list",
            name: "server",
            message: "Please select API base-url",
            choices: [
              "http://dev.api.apps.int.spoke.preprod.us-west-2.aws.paas.redhat.com",
              "https://qa.api.apps.int.spoke.preprod.us-west-2.aws.paas.redhat.com",
              "https://stage.api.apps.int.spoke.preprod.us-east-1.aws.paas.redhat.com",
            ],
          },
        ]);
      } while (TokenPrompts.token.replace(/\s/g, "") === "" || TokenPrompts.server.replace(/\s/g, "") === "");

      // console.log(TokenPrompts);

      token = TokenPrompts.token;
      server = TokenPrompts.server;
    }

    //validate the token by making req to api
    const AuthStr = "Bearer " + token; //the token is a variable which holds the token
    // console.log(AuthStr);
    // console.log(`${server}` + `/api/v1/applications/validate`);
    try {
      const url = `${server}` + `/api/v1/applications/validate`;
      const res = await axios({
        method: "post",
        url: url,
        headers: {
          Authorization: AuthStr,
          // rejectUnauthorized: false,
        },
      });
      this.log(chalk.bold.magentaBright("Token", res.data.message));
      result = res.data;
      token = result.data.token;
    } catch (err) {
      // console.log(err);
      this.log(chalk.bold.redBright("Error type : 401 Authentication"));
    }

    if (result.status === "success") {
      if (isEmpty(configSession)) {
        //if .spashipsessionrc.yaml file is not found , create it and assign data into it.
        let data = {
          token: `${token}`,
          server: `${server}`,
        };
        // console.log("data", data);
        let yamlStr = yaml.dump(data);
        fs.writeFileSync(path.join(userHomeDir, ".spashipsessionrc.yaml"), yamlStr, "utf8");
        console.log(
          chalk.bold.blueBright(".spashipsessionrc.yaml file got created at :") + chalk.bold.yellowBright(userHomeDir)
        );
      } else {
        // console.log(".spashipsession.yaml file already exists : ",configSession);
        let prompts = await inquirer.prompt([
          {
            name: "Overwrite",
            type: "confirm",
            message: "A .spashipsessionrc.yaml file already exists, do want to overwrite it?",
          },
        ]);
        if (prompts.Overwrite) {
          //overwrite data into .spashipsession.yaml file
          let dataOverwrite = {
            token: `${token}`,
            server: `${server}`,
          };
          // console.log("dataOverwrite ", dataOverwrite);
          let yamlData = yaml.dump(dataOverwrite);
          fs.writeFileSync(path.join(userHomeDir, ".spashipsessionrc.yaml"), yamlData, "utf8");
          this.log(chalk.bold(".spashipsessionrc.yaml file got overwritten !"));
        }
      }
    } else {
      this.error(chalk.bold.redBright("Token has been expired or revoked !"));
    }
  }
}

LoginCommand.description = `Authenticate and Authorize users inorder to deploy SPA
user access token && server url is saved inside config file(.spashipsessionrc.yaml) .
spaship login command can be copied from web-ui.
`;

LoginCommand.flags = {
  token: flags.string({
    char: "t",
    description: "jwt token for authentication",
  }),
  server: flags.string({
    char: "s",
    description: "orchestrator-base-url it is responsible for loading file from cli",
  }),
};

LoginCommand.examples = [
  `$ spaship login --token=eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiS --server=http://dev.api.apps.int.spoke.preprod.us-west-2.aws.paas.redhat.com`,
  `Here server refer to api Base-URL && token refer to jwt access token for authorization`,
];

module.exports = LoginCommand;
