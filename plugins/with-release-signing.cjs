const { withAppBuildGradle } = require('expo/config-plugins');

const begin = '// @bonghwa-release-signing:start';
const end = '// @bonghwa-release-signing:end';

module.exports = function withReleaseSigning(config) {
  return withAppBuildGradle(config, (mod) => {
    if (mod.modResults.language !== 'groovy') {
      throw new Error('Bonghwajigi release signing requires the Expo Groovy template.');
    }
    let contents = mod.modResults.contents;
    const start = contents.indexOf(begin);
    if (start !== -1) {
      const finish = contents.indexOf(end, start);
      if (finish === -1) throw new Error('Incomplete Bonghwajigi signing block.');
      contents = contents.slice(0, start) + contents.slice(finish + end.length);
    }
    // A release without private signing material must never inherit Expo's debug key.
    contents = contents.replace(
      /(release\s*\{[\s\S]*?)signingConfig signingConfigs\.debug/,
      '$1signingConfig null',
    );
    mod.modResults.contents = `${contents.trimEnd()}\n\n${begin}
def bonghwaSigningRoot = System.getenv('BONGHWA_ANDROID_SIGNING_DIR')
def bonghwaReleaseRequested = gradle.startParameter.taskNames.any { it.toLowerCase().contains('release') }
if (bonghwaSigningRoot) {
    def signingDirectory = new File(bonghwaSigningRoot)
    def signingStore = new File(signingDirectory, 'release.p12')
    def signingPasswordFile = new File(signingDirectory, 'store-password.txt')
    if (!signingStore.isFile() || !signingPasswordFile.isFile()) {
        throw new GradleException('Private Android signing files are missing. Run scripts/build-apk.mjs.')
    }
    android {
        signingConfigs {
            internalRelease {
                storeFile signingStore
                storeType 'PKCS12'
                storePassword signingPasswordFile.text.trim()
                keyAlias 'bonghwajigi-internal'
                keyPassword signingPasswordFile.text.trim()
            }
        }
        buildTypes {
            release { signingConfig signingConfigs.internalRelease }
        }
    }
} else if (bonghwaReleaseRequested) {
    throw new GradleException('Release signing is required. Run scripts/build-apk.mjs; debug signing is not allowed.')
}
// Rebuild embedded JS when a public connection setting changes, even if source is unchanged.
tasks.matching { it.name == 'createBundleReleaseJsAndAssets' }.configureEach {
    ['EXPO_PUBLIC_API_MODE', 'EXPO_PUBLIC_API_BASE_URL', 'EXPO_PUBLIC_ALLOW_LOOPBACK_HTTP',
     'EXPO_PUBLIC_NAVER_MAP_CLIENT_ID', 'EXPO_PUBLIC_ENABLE_BACKGROUND_LOCATION',
     'EXPO_PUBLIC_DEMO_LATITUDE', 'EXPO_PUBLIC_DEMO_LONGITUDE'].each { key ->
        inputs.property(key, System.getenv(key) ?: '')
    }
}
${end}\n`;
    return mod;
  });
};
