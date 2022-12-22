const packager = require('electron-packager');
const fs = require('fs');

fs.copyFileSync('./src/electron/main.js', './dist/uwt-softphone/main.js');
fs.copyFileSync('./src/electron/package.json', './dist/uwt-softphone/package.json');

packager({
  dir: './dist/uwt-softphone',
  out: './dist',
  icon: './favicon.ico',
  overwrite: true
}).then((appPaths) => {
  fs.unlinkSync('./dist/uwt-softphone/main.js');
  fs.unlinkSync('./dist/uwt-softphone/package.json');
  console.log(`Packaged electron app is available at: ${appPaths}`);
});
