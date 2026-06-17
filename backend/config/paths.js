const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const ANDROID_TEMPLATE_DIR = path.join(ROOT_DIR, 'android-template');
const UPLOADS_DIR = path.join(ROOT_DIR, 'uploads');
const BUILDS_DIR = path.join(ROOT_DIR, 'builds');
const OUTPUT_DIR = path.join(ROOT_DIR, 'output');
const FRONTEND_DIST = path.resolve(ROOT_DIR, process.env.FRONTEND_DIST || '../frontend/dist');

module.exports = {
  ROOT_DIR,
  ANDROID_TEMPLATE_DIR,
  UPLOADS_DIR,
  BUILDS_DIR,
  OUTPUT_DIR,
  FRONTEND_DIST,
};
