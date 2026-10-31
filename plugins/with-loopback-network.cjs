const {withAndroidManifest, withDangerousMod} = require('@expo/config-plugins');
const fs = require('node:fs/promises');
const path = require('node:path');

module.exports = function withLoopbackNetwork(config) {
  config = withAndroidManifest(config, mod => {
    const application = mod.modResults.manifest.application[0];
    application.$['android:networkSecurityConfig'] = '@xml/bonghwa_network_security';
    application.$['android:usesCleartextTraffic'] = 'false';
    return mod;
  });
  return withDangerousMod(config, ['android', async mod => {
    const folder = path.join(mod.modRequest.platformProjectRoot, 'app/src/main/res/xml');
    await fs.mkdir(folder, {recursive:true});
    await fs.writeFile(path.join(folder, 'bonghwa_network_security.xml'), `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
  <base-config cleartextTrafficPermitted="false" />
  <domain-config cleartextTrafficPermitted="true">
    <domain includeSubdomains="false">localhost</domain>
    <domain includeSubdomains="false">127.0.0.1</domain>
    <domain includeSubdomains="false">10.0.2.2</domain>
  </domain-config>
</network-security-config>\n`);
    return mod;
  }]);
};
