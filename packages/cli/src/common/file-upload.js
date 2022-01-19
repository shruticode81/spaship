const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const chalk = require("chalk");
const { loadRcFile } = require("../common/spashiprc-loader");

async function fileUpload(archive, webProperty) {
  const config = loadRcFile();
  // console.log(config);
  if (config.token && config.server) {
    // console.log(archive);
    // console.log(webProperty);
    const formData = new FormData();
    formData.append("upload", fs.createReadStream(archive));
    formData.append("webPropertyName", webProperty);
    formData.append("description", "uploading zip file");
    const headers = Object.assign(
      {
        Authorization: "Bearer " + config.token,
      },
      formData.getHeaders(),
    
    );
    let options = {
      method: "POST",
      url: `${config.server}` + `/api/v1/applications/deploy`,
      data: formData,
      headers: headers,
      maxBodyLength: Infinity,
    };

    try {
      const response = await axios(options);
      // console.log(response);
      return response.data;
    } catch (err) {
      console.log(err);
      console.log(chalk.bold.redBright("Error type : Request failed with status code 503"));
      throw new Error(chalk.bold.redBright("Please Check the Status of API pod !"));
    }
  } else {
    this.error(chalk.bold("Run spaship login command with required token and server flags !"));
  }
}
module.exports = fileUpload;
