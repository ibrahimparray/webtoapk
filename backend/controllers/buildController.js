const fs = require('fs').promises;
const path = require('path');
const { buildApk } = require('../services/compiler');
const { validateInput } = require('../services/validator');

async function handleBuild(req, res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendLog = (message) => {
    res.write(`data: ${JSON.stringify({ type: 'log', message })}\n\n`);
  };

  const sendError = (message) => {
    res.write(`data: ${JSON.stringify({ type: 'error', message })}\n\n`);
    res.end();
  };

  const sendSuccess = (downloadUrl) => {
    res.write(`data: ${JSON.stringify({ type: 'success', downloadUrl })}\n\n`);
    res.end();
  };

  try {
    const { siteUrl, appName, packageName } = req.body;
    const iconPath = req.file ? req.file.path : null;

    sendLog('📝 Validating input parameters...');

    const validation = validateInput({ siteUrl, appName, packageName });
    if (!validation.isValid) {
      sendError(`Validation failed: ${validation.errors.join(', ')}`);
      return;
    }

    sendLog('✅ Validation passed');
    sendLog(`🌐 Target URL: ${siteUrl}`);
    sendLog(`📱 App Name: ${appName}`);
    sendLog(`📦 Package: ${packageName}`);

    const result = await buildApk({
      siteUrl,
      appName,
      packageName,
      iconPath,
      onLog: sendLog,
    });

    if (result.success) {
      const fileName = path.basename(result.apkPath);
      const downloadUrl = `/output/${fileName}`;

      sendLog(`✅ APK built successfully: ${fileName}`);
      sendSuccess(downloadUrl);
    } else {
      sendError(result.error || 'Build failed');
    }

    if (iconPath) {
      try {
        await fs.unlink(iconPath);
      } catch (err) {
        console.error('Error deleting uploaded icon:', err);
      }
    }
  } catch (error) {
    console.error('Build error:', error);
    sendError(error.message || 'Internal server error');
  }
}

module.exports = {
  handleBuild,
};
