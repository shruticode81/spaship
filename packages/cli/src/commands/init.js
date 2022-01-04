const { Command, flags } = require("@oclif/command");
const path = require("path");
const inquirer = require("inquirer");
// const { config } = require("@spaship/common");
const { assign,omit } = require("lodash");
const fs = require("fs");
const chalk = require("chalk");
const { loadRcFile } = require("../common/spashiprc-loader");
const { isEmpty } = require("lodash");
const write = require("../common/write");
const exist = require("../common/exist");
const session = require("../common/session");
const dirEmpty = require("../common/empty");
const distSession = require("../common/dist-session");

class InitCommand extends Command {
  async run() {
    const configValid = loadRcFile();
    if (!isEmpty(configValid)) {
      //check if user have mention path of .spaship file - process user's command
      const { flags } = this.parse(InitCommand);
    
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
          this.log(chalk.cyanBright("Please input required field and .spaship will be generated!"));
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
        inquirer.registerPrompt("recursive", require("inquirer-recursive"));
        const questions = [
          {
            name: "websiteVersion",
            message: "Website Version",
            type: "input",
            default: "1.0",
            filter: function (val) {
              //Appending 'v' prefix to version no.
              return "v" + val;
            },
            when: showQuestions,
          },
          {
            name: "websiteName",
            message: "Website Name",
            type: "input",
            when: showQuestions,
          },
          {
            name: "name",
            message: "Name",
            type: "input",
            default: res(),
            when: showQuestions,
          },
          {
            name: "mapping",
            message: "Path",
            type: "input",
            filter: function (value) {
              //Removing leading '/' from mapping or SPA path:
              // var spaMapping = value.replace(/ +/g, "");

              // if (spaMapping.charAt(0) === "/") {
              //   spaMapping = spaMapping.slice(1);
              // }
              // return spaMapping;
              return value
              .replace(/^\//, "") // Trim off leading /
              .replace(/_/g, "") // Convert normal path to flat path by replacing / with _
              .replace('/', '')
              .replace(" ",'')
            },
            when: showQuestions,
          },
          {
            type: "recursive",
            message: "Add a new Enviroment?",
            name: "environments",
            //when: showQuestions,
            prompts: [
              {
                type: "input",
                name: "name",
                message: "Environment Name",
                default: "prod",
              },
              {
                type: "confirm",
                name: "updateRestriction",
                message: "Do you want to restrict the update?",
                default: true,
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

        // smush cli options, questionnaire answers, and anything extra into a data
        // object to pass into the template

        const data = assign({}, responses);

        if (!existingConfig || data.overwrite) {
          // if .spaship file doesn't exist create it
          const newData = omit(data, "overwrite");
          this.log(".spaship content is :",chalk.yellowBright(JSON.stringify(newData)));
          await write(".spaship", newData);
          this.log(chalk.bold("Generated .spaship file !"));
          
        }

        //save the .spaship path in session
        // console.log(process.cwd());
        await session(process.cwd());
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
      } else {
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
            this.log(chalk.cyanBright("Hey! It seem like you missed to input distribution folder path"));
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
    } else {
      this.error("Ran spaship login command before spaship init !!");
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
