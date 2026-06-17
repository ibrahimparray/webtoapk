const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const cors = require('cors');
const buildRoutes = require('./routes/build');
const { UPLOADS_DIR, BUILDS_DIR, OUTPUT_DIR, FRONTEND_DIST } = require('./config/paths');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

async function ensureDirectories() {
  try {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
    await fs.mkdir(BUILDS_DIR, { recursive: true });
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    console.log('✅ Directories initialized');
  } catch (error) {
    console.error('❌ Error creating directories:', error);
  }
}

app.use('/output', express.static(OUTPUT_DIR));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.use('/api', buildRoutes);

// Serve built frontend in production
app.use(express.static(FRONTEND_DIST));
app.use((req, res) => {
  res.sendFile(path.join(FRONTEND_DIST, 'index.html'));
});

// Ensure Android SDK environment is set
if (!process.env.ANDROID_HOME && !process.env.ANDROID_SDK_ROOT) {
  const defaultSdk = path.join(process.env.USERPROFILE || '', 'AppData/Local/Android/Sdk');
  process.env.ANDROID_HOME = defaultSdk;
  console.log(`ℹ️ ANDROID_HOME set to: ${defaultSdk}`);
}

ensureDirectories().then(() => {
  app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 Website to APK Converter Server                     ║
║                                                           ║
║   Server running on: http://localhost:${PORT}              ║
║   Ready to build Android applications!                   ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    `);
  });
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
