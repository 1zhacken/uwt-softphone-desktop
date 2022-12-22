const { notarize } = require('electron-notarize');

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;  
  if (electronPlatformName !== 'darwin') {
    return;
  }

  const appName = context.packager.appInfo.productFilename;
  console.log('---->>> Attempting notarization...');

  return await notarize({
    appBundleId: 'com.softphone-mac.uwt',
    appPath: `${appOutDir}/${appName}.app`,
    appleId: 'jasper@unitedworldtelecom.com',
    appleIdPassword: 'zhjx-aood-wrdp-ewvn',
  });
};
