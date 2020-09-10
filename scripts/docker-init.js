// This script ensures file nginx.conf is always available when building a docker image

const findRoot = require('find-root');
const fs = require('fs');
const path = require('path');

// finds closest folder with a "package.json" in it -> project root
const rootFolder = findRoot(__dirname);

const nginxConfFilename = 'nginx.conf';

if (!fs.existsSync(path.join(rootFolder, nginxConfFilename))) {
  console.log('nginx config does not exist. Creating default file.')
  fs.copyFileSync(path.join(rootFolder, 'templates','nginx', nginxConfFilename), path.join(rootFolder, nginxConfFilename));
}