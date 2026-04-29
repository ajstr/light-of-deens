#!/usr/bin/env node
/**
 * Sync iOS MARKETING_VERSION and CURRENT_PROJECT_VERSION from package.json
 * into ios/App/App.xcodeproj/project.pbxproj.
 *
 * Version source (in priority order):
 *   1. APP_VERSION env var
 *   2. package.json "appVersion" field
 *   3. package.json "version" field (if not "0.0.0")
 *   4. fallback "1.0.0"
 *
 * Build number source (in priority order):
 *   1. BUILD_NUMBER env var
 *   2. package.json "buildNumber" field
 *   3. auto-increment current pbxproj CURRENT_PROJECT_VERSION by 1
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const pkgPath = resolve(root, 'package.json');
const pbxPath = resolve(root, 'ios/App/App.xcodeproj/project.pbxproj');

if (!existsSync(pbxPath)) {
  console.log('[sync-ios-version] iOS project not found, skipping.');
  process.exit(0);
}

const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));

const version =
  process.env.APP_VERSION ||
  pkg.appVersion ||
  (pkg.version && pkg.version !== '0.0.0' ? pkg.version : null) ||
  '1.0.0';

let pbx = readFileSync(pbxPath, 'utf8');

// Determine build number
let buildNumber = process.env.BUILD_NUMBER || pkg.buildNumber;
if (!buildNumber) {
  const m = pbx.match(/CURRENT_PROJECT_VERSION = (\d+);/);
  const current = m ? parseInt(m[1], 10) : 0;
  buildNumber = String(current + 1);
}
buildNumber = String(buildNumber);

const beforeMarketing = pbx;
pbx = pbx.replace(/MARKETING_VERSION = [^;]+;/g, `MARKETING_VERSION = ${version};`);
pbx = pbx.replace(/CURRENT_PROJECT_VERSION = [^;]+;/g, `CURRENT_PROJECT_VERSION = ${buildNumber};`);

if (pbx === beforeMarketing) {
  console.warn('[sync-ios-version] No version fields matched in pbxproj.');
} else {
  writeFileSync(pbxPath, pbx);
  console.log(`[sync-ios-version] iOS set to version ${version} (build ${buildNumber}).`);
}
