const { Command, flags } = require("@oclif/command");
const path = require("path");
const inquirer = require("inquirer");
// const { config } = require("@spaship/common");
const { assign, omit } = require("lodash");
const fs = require("fs");
const chalk = require("chalk");
const { loadRcFile } = require("../common/spashiprc-loader");
// const { isEmpty } = require("lodash");
const write = require("../common/write");
const exist = require("../common/exist");
const session = require("../common/session");
const valid = require("../common/valid");
const dirEmpty = require("../common/empty");
const distSession = require("../common/dist-session");
const { isJwtExpired } = require("jwt-check-expiration");

class InitCommand extends Command {
  async run() {
    const configValid = loadRcFile();
    //Check jwt expiry, if jwt expires doesn't let user ran init command
    // console.log(configValid.token);
    let isExpired;
    if (configValid.token && configValid.server) {
      isExpired = isJwtExpired(configValid.token);
      if (!isExpired) {
        //check if user have mention path of .spaship file - process user's command
        const { flags } = this.parse(InitCommand);
        let newData;
        let data;
        if (flags.file) {
          //check if .spaship file exists in the user's input path
          let existingConfigfile;
          existingConfigfile = await exist(path.join(flags.file, ".spaship"));
          // console.log(existingConfigfile);

          if (existingConfigfile) {
            //save the flag path value into session
            await session(flags.file);
          } else {
            //if .spaship doesn't exist
            do {
              var prompts = await inquirer.prompt([
                {
                  name: "SpashipFile",
                  type: "input",
                  message: ".spaship doesn't exist Please enter correct path?",
                },
              ]);
            } while (!(await exist(path.join(prompts.SpashipFile, ".spaship"))));

            //save the user input path into session.

            await session(path.join(prompts.SpashipFile));
          }
        } else {
          //prompt user with two option either to enter whole .spaship file path or prompt user with ques and create .spaship file in current location
          //check if .spaship file exist in current location
          let existingConfig;
          existingConfig = await exist(".spaship");
          if (!existingConfig) {
            this.log(
              chalk.cyanBright("Please provide inputs in all mandatory fields") +
                chalk.redBright(" * ") +
                chalk.cyanBright("and .spaship will be generated!")
            );
          }

          // go into interactive questionaire mode
          let responses = {};

          // show questions if there is no existing config, or if overwrite was approved.
          const showQuestions = (r) => !existingConfig || (existingConfig && r.overwrite);
          // function to determine spa folder name
          const res = () => {
            var folder = process.cwd().split("/");
            return folder.splice(folder.length - 1, 1)[0];
          };

          inquirer.registerPrompt("loop", require("inquirer-loop")(inquirer));

          const questions = [
            {
              name: "websiteVersion",
              message: "Website Version",
              type: "input",
              default: "1.0",
              filter: function (val) {
                //Appending 'v' prefix to version no.
                return ("v" + val).replace(/\s/g, "");
              },
              when: showQuestions,
            },
            {
              name: "websiteName",
              message: chalk.redBright("* ") + "Website Name",
              type: "input",
              filter: function (value) {
                return value.replace(/\s/g, "");
              },
              when: showQuestions,
            },
            {
              name: "name",
              message: chalk.redBright("* ") + "Name",
              type: "input",
              default: res(),
              filter: function (value) {
                return value.replace(/\s/g, "");
              },
              when: showQuestions,
            },
            {
              name: "mapping",
              message: chalk.redBright("* ") + "Route",
              type: "input",
              filter: function (value) {
                return (
                  value
                    .replace(/^\//, "") // Trim off leading /
                    .replace(/_/g, "")
                    .replace(/\/$/, "") // Convert normal path to flat path by replacing / with _
                    // .replace("/", "")
                    .replace(/\s/g, "")
                );
              },
              when: showQuestions,
            },
            {
              type: "loop",
              message: "New Environment?",
              name: "environments",
              when: showQuestions,
              questions: [
                {
                  type: "input",
                  name: "name",
                  message: chalk.redBright("* ") + "Environment Name",
                  default: "prod",
                },
                {
                  type: "confirm",
                  name: "updateRestriction",
                  message: chalk.redBright("* ") + "Do you want to restrict the update?",
                  default: true,
                },
                {
                  type: "confirm",
                  name: "exclude",
                  message: chalk.redBright("* ") + "Do you want to skip SPA deployment?",
                  default: false,
                },
                {
                  type: "input",
                  name: "name",
                  message: "Environment Name",
                  default: "dev",
                },
                {
                  type: "confirm",
                  name: "updateRestriction",
                  message: "Do you want to restrict the update?",
                  default: false,
                },
                {
                  type: "confirm",
                  name: "exclude",
                  message: "Do you want to skip SPA deployment?",
                  default: false,
                },
                {
                  type: "input",
                  name: "name",
                  message: "Environment Name",
                  default: "stage",
                },
                {
                  type: "confirm",
                  name: "updateRestriction",
                  message: "Do you want to restrict the update?",
                  default: false,
                },
                {
                  type: "confirm",
                  name: "exclude",
                  message: "Do you want to skip SPA deployment?",
                  default: false,
                },
              ],
            },
          ];

          // if a config file already exists, pre-empt the other questions with one
          // about whether to overwrite or not
          if (existingConfig) {
            questions.unshift({
              name: "overwrite",
              message: "A .spaship file already exists, overwrite it?",
              type: "confirm",
            });
          }
          responses = await inquirer.prompt(questions);
          // console.log(responses);

          // smush cli options, questionnaire answers, and anything extra into a data
          // object to pass into the template

          data = assign({}, responses);

          if (!existingConfig || data.overwrite) {
            // if .spaship file doesn't exist create it
            newData = omit(data, "overwrite");
            this.log(chalk.yellowBright.bold(".spaship content is :"));
            this.log(newData);
            const response = await write(".spaship", newData);
            if (response == "invalid") {
              console.log(chalk.redBright.bold(`.spaship generation failed :-(`));
            } else {
              this.log(chalk.bold("Generated .spaship file !"));
              //save the .spaship path in session
              await session(process.cwd());
            }
          } else {
            //save the pre-existing .spaship file
            await session(process.cwd());
          }
        }

        //check if user have mention path of distribution folder - process user's command
        if (flags.dist) {
          //check if the dist path entered is empty or not
          const isEmpty = await dirEmpty(flags.dist);
          if (isEmpty) {
            this.error(chalk.bold("Your distribution folder is Empty , Please enter correct dist path"));
          } else {
            //save the dist path into the session
            await distSession(flags.dist);
          }
        }
        if (data || newData) {
          const { validate } = valid(newData);
          if (validate || !data.overwrite) {
            //check if distribution folder is present or not in current dir.
            try {
              if (fs.existsSync("./dist")) {
                console.log("Dist Directory exists :", path.resolve("dist"));
                await distSession(path.resolve("dist"));
              } else if (fs.existsSync("./build")) {
                console.log("Directory build exists :", path.resolve("build"));
                await distSession(path.resolve("build"));
              } else if (fs.existsSync(`./${flags.builddir}`)) {
                console.log(`./${flags.builddir} exists`);
                await distSession(path.join(process.cwd(), `./${flags.builddir}`));
              } else {
                //Distribution file doesn't exist - prompt user to enter the dist path
                this.log(chalk.bold.cyanBright("Please input distribution folder path"));
                do {
                  var promptDist = await inquirer.prompt([
                    {
                      name: "DistPath",
                      type: "input",
                      message: "Please enter the correct dist path",
                    },
                  ]);
                } while (await dirEmpty(promptDist.DistPath));

                //save the dist path input in session file
                await distSession(promptDist.DistPath);
              }
            } catch (e) {
              this.error("An error occurred! dist path is missing");
            }
          }
        }
      } else {
        this.error(chalk.redBright.bold("Token got expired, Run login command !"));
      }
    } else {
      this.error("Run spaship login command before spaship init !");
    }
  }
}

InitCommand.description = `Initialize a SPAship config file for your app.
Without arguments, init will ask you a few questions and generate a .spaship config file.
`;

InitCommand.flags = {
  dist: flags.string({
    char: "d",
    description: "the URL path for dist folder",
  }),
  file: flags.string({
    char: "m",
    description: "the URL path for .spaship file",
  }),
  builddir: flags.string({
    char: "b",
    required: false,
    description: "path of your SPAs artifact. Defaults to 'buildDir' if specified in the spaship.yaml.",
  }),
};

InitCommand.examples = [
  `$ spaship init --file=/home/shranand/Documents/one-platform/packages/home-spa --dist=/home/shranand/Documents/one-platform/packages/home-spa/dist`,
  `$ spaship init --builddir=build`,
];
module.exports = InitCommand;
