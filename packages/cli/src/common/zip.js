const path = require("path");
const fs = require("fs");
const os = require("os");
const archiver = require("archiver");
const readPkgUp = require("read-pkg-up");
const { v4: uuidv4 } = require("uuid");
// const readJson = require("read-package-json");
const { loadRcFile } = require("./spashiprc-loader");
// const exist = require("./exist");

/**
 * Compress the directory contents of `directoryPath` and creates a zip archive in the os temp dir
 * @param {string} directoryPath - Directory to compress
 * @param {string} rawSpashipYml - Contents of the spaship.yml file
 * @returns {Promise<string>} - Promise with the path of zip file created
 */
function zipDirectory(directoryPath) {
  const tempDir = os.tmpdir();
  try {
    fs.mkdirSync(tempDir); // If temp dir doesn't exist create it
  } catch (e) {
    // Do nothing
  }

  const pkgData = readPkgUp.sync();
  const configget = loadRcFile();
  let zipPath;
  if (pkgData == undefined) {
    //No nearest package.json present
    let packageExist;
    try {
      fs.accessSync(path.join(configget.file, "package.json"), fs.constants.F_OK);
      packageExist = true;
    } catch (err) {
      packageExist = false;
    }
    // console.log(packageExist);
    if (packageExist) {
      //package.json is present in file(SPA folder),extract the name & version
      let packageData = require(configget.file + "/package.json");
      // console.log(packageData);
      zipPath = path.join(
        tempDir,
        `${packageData.name.replace(/\//g, "_")}${packageData.version ? "-" + packageData.version : ""}.zip`
      );
    } else {
      //if package.json is not present inside the spa file
      const uuid = uuidv4();
      zipPath = path.join(tempDir, "SPAship" + uuid + ".zip");
    }
    // console.log(zipPath);
    return zipUtil(directoryPath, zipPath);
  } else {
    const pkgName =
      pkgData && pkgData.packageJson && pkgData.packageJson["name"] ? pkgData.packageJson["name"] : "SPAshipArchive";
    const pkgVersion =
      pkgData && pkgData.packageJson && pkgData.packageJson["version"] ? pkgData.packageJson["version"] : "";
    // create an absolute path to the zip file.  replace any '/' with '_' in the pkgName (forward slashes are used in
    // organization-scoped npm package names, such as: @spaship/cli
    zipPath = path.join(tempDir, `${pkgName.replace(/\//g, "_")}${pkgVersion ? "-" + pkgVersion : ""}.zip`);
    return zipUtil(directoryPath, zipPath);
  }
}

/**
 * Promisified implementation of Archiver
 * @param {string} source - directory to zip
 * @param {string} out - output zip file path
 * @returns {Promise<string>}
 */
function zipUtil(source, out) {
  const archive = archiver("zip", { zlib: { level: 9 } });
  const stream = fs.createWriteStream(out, { flags: "w" }); // Open in truncate mode

  return new Promise((resolve, reject) => {
    archive
      .directory(source, false, {})
      .on("error", (err) => reject(err))
      .pipe(stream);
    stream.on("close", () => resolve(out));
    archive.finalize();
  });
}

module.exports = { zipDirectory };
