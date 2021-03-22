const path = require("path");
const fs = require("fs");
const os = require("os");
const _7zip = require("7zip-min");
const readPkgUp = require("read-pkg-up");

/**
 * Compress the directory contents of `directoryPath` and creates a 7zip archive in the os temp dir
 * @param {string} directoryPath - Directory to compress
 * @param {string} rawSpashipYml - Contents of the spaship.yml file
 * @returns {Promise<string>} - Promise with the path of zip file created
 */
function zipDirectory(directoryPath, rawSpashipYml) {
  const tempDir = os.tmpdir();
  try {
    fs.mkdirSync(tempDir); // If temp dir doesn't exist create it
  } catch (e) {
    // Do nothing
  }
  try {
    fs.writeFileSync(path.join(directoryPath, "spaship.yaml"), rawSpashipYml); // Write spaship.yaml if not found
  } catch (e) {
    // Do nothing
  }
  const pkgData = readPkgUp.sync();
  const pkgName =
    pkgData && pkgData.packageJson && pkgData.packageJson["name"] ? pkgData.packageJson["name"] : "SPAShipArchive";
  const pkgVersion =
    pkgData && pkgData.packageJson && pkgData.packageJson["version"] ? pkgData.packageJson["version"] : "";
  // create an absolute path to the zip file.  replace any '/' with '_' in the pkgName (forward slashes are used in
  // organization-scoped npm package names, such as: @spaship/cli
  const zipPath = path.join(tempDir, `${pkgName.replace(/\//g, "_")}${pkgVersion ? "-" + pkgVersion : ""}.7z`);
  return zipUtil(directoryPath, zipPath);
}

/**
 * Promisified implementation of 7zip-min pack.
 * @param {string} source - directory to compress with 7zip
 * @param {string} out - output .7z file path
 * @returns {Promise<string>}
 */
function zipUtil(source, out) {
  return new Promise((resolve, reject) => {
    _7zip.pack(source, out, (err) => {
      if (err) {
        reject(err);
      }
      resolve(out);
    });
  });
}
module.exports = { zipDirectory };
