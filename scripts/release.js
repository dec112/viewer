// removes unnecessary files after building the application

const fs = require('fs');
const path = require('path');

const dirToCheck = './build';

const files = fs.readdirSync(dirToCheck);

const configFilesToRemove = files
  // remove all config jsons that are not named "dec112.config.json"
  .filter(x => /.*config.json/.test(x))
  .filter(x => x !== 'dec112.config.json');

for (const file of configFilesToRemove) {
  fs.unlinkSync(path.join(dirToCheck, file));
  console.log(`Removed config file "${file}" from build directory.`);
}