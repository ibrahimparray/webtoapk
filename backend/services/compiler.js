const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
const { createInterface } = require('readline');
const { ANDROID_TEMPLATE_DIR, BUILDS_DIR, OUTPUT_DIR } = require('../config/paths');

async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

async function replacePlaceholders(filePath, replacements) {
  try {
    let content = await fs.readFile(filePath, 'utf8');

    for (const [placeholder, value] of Object.entries(replacements)) {
      const regex = new RegExp(placeholder, 'g');
      content = content.replace(regex, value);
    }

    await fs.writeFile(filePath, content, 'utf8');
  } catch (error) {
    throw new Error(`Failed to update ${filePath}: ${error.message}`);
  }
}

async function moveMainActivity(buildDir, packageName, siteUrl) {
  const oldPath = path.join(buildDir, 'app/src/main/java/com/template/webview/MainActivity.kt');
  const packagePath = packageName.replace(/\./g, '/');
  const newDir = path.join(buildDir, 'app/src/main/java', packagePath);
  const newPath = path.join(newDir, 'MainActivity.kt');

  await fs.mkdir(newDir, { recursive: true });

  let content = await fs.readFile(oldPath, 'utf8');
  content = content.replace(/package com\.template\.webview/, `package ${packageName}`);
  content = content.replace(/\{\{TARGET_URL\}\}/g, siteUrl);

  await fs.writeFile(newPath, content, 'utf8');

  try {
    await fs.rm(path.join(buildDir, 'app/src/main/java/com/template'), { recursive: true, force: true });
  } catch (err) {
    console.error('Warning: Could not remove old template directory:', err);
  }

  return newPath;
}

async function updateStringsXml(buildDir, appName) {
  const stringsPath = path.join(buildDir, 'app/src/main/res/values/strings.xml');
  await replacePlaceholders(stringsPath, {
    '{{APP_NAME}}': escapeXml(appName),
  });
}

async function updateBuildGradle(buildDir, packageName) {
  const buildGradlePath = path.join(buildDir, 'app/build.gradle');
  await replacePlaceholders(buildGradlePath, {
    '{{PACKAGE_NAME}}': packageName,
  });
}

async function updateManifest(buildDir, packageName) {
  const manifestPath = path.join(buildDir, 'app/src/main/AndroidManifest.xml');
  await replacePlaceholders(manifestPath, {
    '{{PACKAGE_NAME}}': packageName,
  });
}

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function executeGradleBuild(buildDir, onLog) {
  return new Promise((resolve, reject) => {
    onLog('🔧 Starting Gradle build process...');
    onLog('⏳ This may take 1-2 minutes on first build...');

    const isWindows = process.platform === 'win32';
    const gradlewCmd = isWindows ? 'gradlew.bat' : './gradlew';
    const gradlewPath = path.join(buildDir, gradlewCmd);

    if (!isWindows) {
      try {
        require('fs').chmodSync(gradlewPath, '755');
      } catch (err) {
        
        onLog(`⚠️ Warning: Could not set gradlew permissions: ${err.message}`);
      }
    }

   onLog(`📝 Executing: ${gradlewCmd} assembleRelease in ${buildDir}`);

const buildProcess = isWindows
  ? spawn('cmd.exe', [
      '/c',
      gradlewCmd,
      'assembleRelease',
      '--no-daemon',
      '--max-workers=1'
    ], {
      cwd: buildDir
    })
  : spawn(gradlewCmd, [
      'assembleRelease',
      '--no-daemon',
      '--max-workers=1'
    ], {
      cwd: buildDir,
      timeout: 600000,
      env: {
        ...process.env,
        GRADLE_OPTS: '-Xmx256m -XX:MaxMetaspaceSize=128m'
      }
    });

    let allOutput = '';

    const stdoutRl = createInterface({ input: buildProcess.stdout });
    stdoutRl.on('line', (line) => {
      if (line.trim()) {
        allOutput += line + '\n';
        onLog(`  ${line.trim()}`);
      }
    });

    const stderrRl = createInterface({ input: buildProcess.stderr });
    stderrRl.on('line', (line) => {
      if (line.trim()) {
        allOutput += line + '\n';
        if (!line.includes('warning')) {
          onLog(`  ⚠️ ${line.trim()}`);
        }
      }
    });

    buildProcess.on('close', (code) => {
      if (code === 0) {
        onLog('✅ Gradle build completed successfully!');
        resolve({ success: true });
      } else {
        onLog(`❌ Gradle build failed with exit code ${code}`);

        const errorLines = allOutput
          .split('\n')
          .filter(line =>
            line.includes('error:') ||
            line.includes('ERROR') ||
            line.includes('FAILURE') ||
            line.includes('BUILD FAILED') ||
            line.includes('What went wrong') ||
            line.includes('Execution failed')
          )
          .slice(0, 15)
          .join('\n');

        reject(new Error(`Build failed (exit code ${code}):\n${errorLines || 'Check logs for details'}`));
      }
    });

    buildProcess.on('error', (error) => {
      onLog(`❌ Process error: ${error.message}`);
      reject(new Error(`Failed to execute Gradle: ${error.message}`));
    });
  });
}

async function findApkFile(buildDir) {
  const releaseDir = path.join(buildDir, 'app/build/outputs/apk/release');
  try {
    const files = await fs.readdir(releaseDir);
    const apkFile = files.find(f => f.endsWith('.apk'));
    if (apkFile) {
      return path.join(releaseDir, apkFile);
    }
  } catch (err) {
  }

  for (const name of ['app-release.apk', 'app-release-unsigned.apk', 'app-debug.apk']) {
    const p = path.join(releaseDir, name);
    try {
      await fs.access(p);
      return p;
    } catch (err) {
    }
  }
  throw new Error(`No APK file found in ${releaseDir}`);
}

async function copyApkToOutput(buildDir, packageName) {
  const apkSourcePath = await findApkFile(buildDir);

  const timestamp = Date.now();
  const sanitizedPackage = packageName.replace(/\./g, '-');
  const apkFileName = `${sanitizedPackage}-${timestamp}.apk`;
  const apkDestPath = path.join(OUTPUT_DIR, apkFileName);

  await fs.copyFile(apkSourcePath, apkDestPath);

  return apkDestPath;
}

async function cleanupBuild(buildDir) {
  try {
    await fs.rm(buildDir, { recursive: true, force: true });
  } catch (error) {
    console.error('Warning: Could not cleanup build directory:', error);
  }
}

async function processAppIcon(buildDir, iconPath, onLog) {
  const densities = [
    { dir: 'mipmap-mdpi', size: 48 },
    { dir: 'mipmap-hdpi', size: 72 },
    { dir: 'mipmap-xhdpi', size: 96 },
    { dir: 'mipmap-xxhdpi', size: 144 },
    { dir: 'mipmap-xxxhdpi', size: 192 },
  ];

  for (const density of densities) {
    const iconDir = path.join(buildDir, 'app/src/main/res', density.dir);
    await sharp(iconPath)
      .resize(density.size, density.size)
      .png()
      .toFile(path.join(iconDir, 'ic_launcher.png'));
    await sharp(iconPath)
      .resize(density.size, density.size)
      .png()
      .toFile(path.join(iconDir, 'ic_launcher_round.png'));
  }

  const anydpiDir = path.join(buildDir, 'app/src/main/res/mipmap-anydpi-v26');
  await fs.mkdir(anydpiDir, { recursive: true });
  const drawableDir = path.join(buildDir, 'app/src/main/res/drawable');
  await fs.mkdir(drawableDir, { recursive: true });

  await sharp(iconPath)
    .resize(192, 192)
    .png()
    .toFile(path.join(drawableDir, 'ic_launcher_foreground.png'));

  const adaptiveXml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@drawable/ic_launcher_foreground"/>
</adaptive-icon>`;

  await fs.writeFile(path.join(anydpiDir, 'ic_launcher.xml'), adaptiveXml, 'utf8');
  await fs.writeFile(path.join(anydpiDir, 'ic_launcher_round.xml'), adaptiveXml, 'utf8');

  onLog('   ✓ Custom icon resized and applied to all densities');
}

async function buildApk({ siteUrl, appName, packageName, iconPath, onLog }) {
  const buildId = `build-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const buildDir = path.join(BUILDS_DIR, buildId);

  try {
    onLog('1. 📂 Copying Android project template...');
    await copyDir(ANDROID_TEMPLATE_DIR, buildDir);
    onLog('   ✓ Template copied');

    const localPropsPath = path.join(buildDir, 'local.properties');
    const androidSdkPath = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT || path.join(process.env.USERPROFILE || '', 'AppData/Local/Android/Sdk');
    if (androidSdkPath) {
      const sdkDir = androidSdkPath.replace(/\\/g, '\\\\');
      await fs.writeFile(localPropsPath, `sdk.dir=${sdkDir}\n`, 'utf8');
      onLog(`   ✓ local.properties created with SDK: ${androidSdkPath}`);
    }

    onLog('2. 📝 Updating app name in strings.xml...');
    await updateStringsXml(buildDir, appName);
    onLog(`   ✓ App name set to: ${appName}`);

    onLog('3. 📦 Updating build.gradle with package name...');
    await updateBuildGradle(buildDir, packageName);
    onLog(`   ✓ Package name set to: ${packageName}`);

    onLog('4. 📋 Updating AndroidManifest.xml...');
    await updateManifest(buildDir, packageName);
    onLog('   ✓ Manifest updated');

    onLog('5. 🔀 Moving MainActivity to correct package...');
    await moveMainActivity(buildDir, packageName, siteUrl);
    onLog(`   ✓ MainActivity moved to package: ${packageName}`);
    onLog(`   ✓ Target URL set to: ${siteUrl}`);

    if (iconPath) {
      onLog('6. 🎨 Processing custom app icon...');
      await processAppIcon(buildDir, iconPath, onLog);
    } else {
      onLog('6. 🎨 Using default app icon');
    }

    onLog('7. 🔨 Compiling APK with Gradle...');
    await executeGradleBuild(buildDir, onLog);

    onLog('8. 📦 Copying APK to output directory...');
    const apkPath = await copyApkToOutput(buildDir, packageName);
    onLog(`   ✓ APK saved to: ${path.basename(apkPath)}`);

    onLog('9. 🧹 Cleaning up build files...');
    await cleanupBuild(buildDir);
    onLog('    ✓ Cleanup complete');

    return {
      success: true,
      apkPath,
    };
  } catch (error) {
    onLog(`❌ Build failed: ${error.message}`);

    try {
      await cleanupBuild(buildDir);
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    }

    return {
      success: false,
      error: error.message,
    };
  }
}

module.exports = {
  buildApk,
};
