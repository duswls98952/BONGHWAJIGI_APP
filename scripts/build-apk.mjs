#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { randomBytes, createHash } from 'node:crypto';
import { chmodSync, copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
process.umask(0o077);
const args = process.argv.slice(2);
if (args.includes('--help')) {
  console.log('Usage: node scripts/build-apk.mjs [--prepare-only] [--clean] [--no-minify] [--api-url https://private-server] [--output directory]');
  console.log('Default: live USB-connected API at http://127.0.0.1:18080; arm64-v8a; internal release signing.');
  process.exit(0);
}
const option = (name, fallback) => {
  const index = args.indexOf(name);
  if (index === -1) return fallback;
  const value = args[index + 1];
  if (!value || value.startsWith('--')) throw new Error(`Missing value for ${name}`);
  return value;
};
for (let index = 0; index < args.length; index += 1) {
  if (['--prepare-only', '--clean', '--no-minify'].includes(args[index])) continue;
  if (['--api-url', '--output'].includes(args[index])) { index += 1; continue; }
  throw new Error(`Unknown argument: ${args[index]}`);
}
if (Number(process.versions.node.split('.')[0]) !== 24) throw new Error('Use Node 24 as required by this repository.');

const apiUrl = new URL(option('--api-url', 'http://127.0.0.1:18080'));
const loopback = apiUrl.protocol === 'http:' && ['127.0.0.1', 'localhost', '10.0.2.2'].includes(apiUrl.hostname);
if ((!loopback && apiUrl.protocol !== 'https:') || apiUrl.username || apiUrl.password || apiUrl.search || apiUrl.hash) {
  throw new Error('API URL must be HTTPS, or explicit local USB/emulator HTTP, without credentials/query/hash.');
}
const sdk = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
if (!sdk || !existsSync(join(sdk, 'platform-tools', 'adb'))) throw new Error('ANDROID_HOME must point to an installed Android SDK.');
const output = resolve(option('--output', join(root, 'artifacts', 'apk')));
const signing = resolve(process.env.BONGHWA_ANDROID_SIGNING_DIR || join(root, '.local-private', 'android-signing'));
const env = {
  ...process.env,
  // Avoid ambient .env contents changing the verified release configuration.
  EXPO_NO_DOTENV: '1',
  EXPO_NO_TELEMETRY: '1',
  NODE_ENV: 'production',
  EXPO_PUBLIC_API_MODE: 'live',
  EXPO_PUBLIC_API_BASE_URL: apiUrl.href.replace(/\/$/, ''),
  EXPO_PUBLIC_ALLOW_LOOPBACK_HTTP: String(loopback),
  BONGHWA_ANDROID_SIGNING_DIR: signing,
};
const run = (command, parameters, cwd = root, capture = false) => {
  const result = spawnSync(command, parameters, { cwd, env, stdio: capture ? 'pipe' : 'inherit', encoding: 'utf8' });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    if (capture) console.error(result.stderr || 'Command failed.');
    throw new Error(`${command} failed with status ${result.status}`);
  }
  return result.stdout;
};

mkdirSync(signing, { recursive: true, mode: 0o700 });
chmodSync(signing, 0o700);
const store = join(signing, 'release.p12');
const password = join(signing, 'store-password.txt');
if (existsSync(store) !== existsSync(password)) throw new Error('Incomplete signing material; restore the matching key/password files without replacing the existing key.');
if (!existsSync(store)) {
  writeFileSync(password, `${randomBytes(32).toString('hex')}\n`, { mode: 0o600, flag: 'wx' });
  run('keytool', ['-genkeypair', '-noprompt', '-storetype', 'PKCS12', '-keystore', store,
    '-storepass:file', password, '-keypass:file', password, '-alias', 'bonghwajigi-internal',
    '-keyalg', 'RSA', '-keysize', '3072', '-validity', '10000',
    '-dname', 'CN=Bonghwajigi Internal Demo,OU=Development,O=Bonghwajigi,C=KR']);
}
chmodSync(store, 0o600);
chmodSync(password, 0o600);
// This verifies that the reusable file pair is consistent without printing its secret.
run('keytool', ['-list', '-keystore', store, '-storepass:file', password, '-alias', 'bonghwajigi-internal'], root, true);
const nativeFingerprint = createHash('sha256');
for (const name of ['app.config.ts', 'package-lock.json', ...readdirSync(join(root, 'plugins')).sort().map((name) => `plugins/${name}`)]) {
  nativeFingerprint.update(name).update(readFileSync(join(root, name)));
}
for (const name of ['EXPO_PUBLIC_ALLOW_LOOPBACK_HTTP', 'EXPO_PUBLIC_NAVER_MAP_CLIENT_ID',
  'EXPO_PUBLIC_ENABLE_BACKGROUND_LOCATION', 'EXPO_PUBLIC_EAS_PROJECT_ID', 'GOOGLE_SERVICES_JSON']) {
  nativeFingerprint.update(name).update(env[name] || '');
}
if (env.GOOGLE_SERVICES_JSON) nativeFingerprint.update(readFileSync(env.GOOGLE_SERVICES_JSON));
const nativeDigest = nativeFingerprint.digest('hex');
const nativeMarker = join(root, 'android', '.bonghwa-native-config');
const cleanNative = args.includes('--clean') || !existsSync(nativeMarker) || readFileSync(nativeMarker, 'utf8').trim() !== nativeDigest;
run(process.execPath, [join(root, 'node_modules', 'expo', 'bin', 'cli'), 'prebuild', '--platform', 'android', '--no-install',
  ...(cleanNative ? [] : ['--no-clean'])]);
writeFileSync(nativeMarker, `${nativeDigest}\n`);
if (args.includes('--prepare-only')) {
  console.log('Android project and private release signing are prepared. No APK has been built.');
  process.exit(0);
}
run(join(root, 'android', 'gradlew'), [':app:assembleRelease', '--max-workers=2', '--console=plain', '--no-daemon', '--build-cache',
  '-PreactNativeArchitectures=arm64-v8a',
  ...(args.includes('--no-minify') ? ['-Pandroid.enableMinifyInReleaseBuilds=false', '-Pandroid.enableShrinkResourcesInReleaseBuilds=false'] : [])], join(root, 'android'));
const source = join(root, 'android', 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk');
if (!existsSync(source)) throw new Error('Gradle completed without the expected release APK.');
const buildTools = readdirSync(join(sdk, 'build-tools')).filter((version) => existsSync(join(sdk, 'build-tools', version, 'apksigner')))
  .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))[0];
if (!buildTools) throw new Error('Android SDK build-tools/apksigner not found.');
const signature = run(join(sdk, 'build-tools', buildTools, 'apksigner'), ['verify', '--verbose', '--print-certs', source], root, true);
if (!signature.includes('CN=Bonghwajigi Internal Demo') || signature.includes('CN=Android Debug')) throw new Error('Unexpected release signing certificate.');
const badging = run(join(sdk, 'build-tools', buildTools, 'aapt'), ['dump', 'badging', source], root, true);
if (!badging.includes("package: name='com.bonghwajigi.app'") || badging.includes('application-debuggable')) throw new Error('Unexpected package ID or debuggable APK.');
if (!/^native-code: 'arm64-v8a'$/m.test(badging)) throw new Error('Expected a single arm64-v8a release.');
const permissions = [...badging.matchAll(/uses-permission(?:-sdk-\d+)?: name='([^']+)'/g)].map((match) => match[1]);
if (permissions.some((name) => ['android.permission.CALL_PHONE', 'android.permission.SEND_SMS'].includes(name))) {
  throw new Error('This MVP opens the dialer/composer; direct call/SMS permissions are not allowed.');
}
const contents = run('unzip', ['-Z1', source], root, true).split('\n');
if (!contents.includes('assets/index.android.bundle')) throw new Error('Release APK is missing its embedded JS bundle.');
mkdirSync(output, { recursive: true });
const packageInfo = badging.match(/^package: name='([^']+)' versionCode='([^']+)' versionName='([^']+)'/m);
if (!packageInfo) throw new Error('APK package/version metadata not found.');
const target = join(output, `bonghwajigi-${packageInfo[3]}-${loopback ? 'usb' : 'private'}-arm64.apk`);
copyFileSync(source, target);
const gitHead = run('git', ['rev-parse', 'HEAD'], root, true).trim();
const report = {
  built_at: new Date().toISOString(),
  source_head: gitHead,
  source_dirty: Boolean(run('git', ['status', '--porcelain'], root, true).trim()),
  app_id: 'com.bonghwajigi.app',
  version_name: packageInfo[3],
  version_code: Number(packageInfo[2]),
  naver_map_configured: Boolean(env.EXPO_PUBLIC_NAVER_MAP_CLIENT_ID),
  architecture: 'arm64-v8a',
  minified: !args.includes('--no-minify'),
  debuggable: false,
  embedded_js_bundle: true,
  permissions,
  api_mode: 'live',
  api_url: env.EXPO_PUBLIC_API_BASE_URL,
  usb_reverse_required: loopback,
  apk: target,
  bytes: statSync(target).size,
  sha256: createHash('sha256').update(readFileSync(target)).digest('hex'),
  signature_verification: signature.trim(),
};
writeFileSync(`${target}.json`, `${JSON.stringify(report, null, 2)}\n`);
console.log(`Verified APK: ${target}\nSHA256: ${report.sha256}`);
