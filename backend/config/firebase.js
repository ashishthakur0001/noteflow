const admin = require('firebase-admin');
const path = require('path');

function buildCredential() {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

  if (serviceAccountPath) {
    const resolvedPath = path.isAbsolute(serviceAccountPath)
      ? serviceAccountPath
      : path.join(__dirname, '..', serviceAccountPath);
    return admin.credential.cert(require(resolvedPath));
  }

  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    return admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    });
  }

  return admin.credential.applicationDefault();
}

if (!admin.apps.length) {
  const options = {};

  if (process.env.FIRESTORE_EMULATOR_HOST) {
    options.projectId = process.env.FIREBASE_PROJECT_ID || 'noteflow-local';
  } else {
    options.credential = buildCredential();
  }

  admin.initializeApp(options);
}

const db = admin.firestore();

module.exports = { admin, db };
