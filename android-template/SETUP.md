# Android Template Setup

This directory contains the master Android project template that gets copied and customized for each APK build.

## Required Setup (One-Time)

Before using the converter, you need to download the Gradle wrapper JAR file:

### Linux/macOS:
```bash
chmod +x ../setup-gradle.sh
../setup-gradle.sh
```

### Windows:
```cmd
..\setup-gradle.bat
```

### Manual Setup:
If the scripts don't work, manually download the Gradle wrapper:

1. Download: https://raw.githubusercontent.com/gradle/gradle/master/gradle/wrapper/gradle-wrapper.jar
2. Place it in: `android-template/gradle/wrapper/gradle-wrapper.jar`
3. Make gradlew executable (Linux/macOS): `chmod +x gradlew`

## App Icons

The template uses default Android launcher icons. To add custom icons:

1. Create launcher icon resources in `app/src/main/res/mipmap-*dpi/` directories
2. Generate all density variants (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi)
3. Use Android Asset Studio: https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html

For now, the system uses Android's default icons, which will be replaced during the build process if a custom icon is uploaded.

## Template Structure

```
android-template/
├── app/                                    # Application module
│   ├── src/main/
│   │   ├── java/com/template/webview/     # Source code directory
│   │   │   └── MainActivity.kt            # Main WebView Activity (Kotlin)
│   │   ├── res/                           # Resources directory
│   │   │   ├── values/
│   │   │   │   ├── strings.xml           # App name (replaced: {{APP_NAME}})
│   │   │   │   └── themes.xml            # Material Design theme
│   │   │   └── xml/
│   │   │       ├── network_security_config.xml  # HTTPS enforcement
│   │   │       ├── backup_rules.xml
│   │   │       └── data_extraction_rules.xml
│   │   └── AndroidManifest.xml           # Manifest (replaced: {{PACKAGE_NAME}})
│   ├── build.gradle                       # App-level build config (replaced: {{PACKAGE_NAME}})
│   └── proguard-rules.pro                # ProGuard optimization rules
├── gradle/wrapper/
│   ├── gradle-wrapper.properties         # Gradle distribution config
│   └── gradle-wrapper.jar               # ⚠️ MUST BE DOWNLOADED (see above)
├── build.gradle                          # Project-level build config
├── settings.gradle                       # Project settings
├── gradle.properties                     # Gradle JVM options
├── gradlew                               # Unix Gradle wrapper script
└── gradlew.bat                           # Windows Gradle wrapper script
```

## Placeholders

The following placeholders are replaced during the build process:

- `{{APP_NAME}}` - Display name of the application (in strings.xml)
- `{{PACKAGE_NAME}}` - Unique package identifier (in build.gradle and AndroidManifest.xml)
- `{{TARGET_URL}}` - The HTTPS website URL to load (in MainActivity.kt)

## Testing the Template

To test if the template is set up correctly:

```bash
cd android-template

# Unix/macOS
./gradlew clean assembleRelease

# Windows
gradlew.bat clean assembleRelease
```

This should compile successfully and produce an APK in:
`app/build/outputs/apk/release/app-release.apk`

## Requirements

- JDK 11 or higher
- JAVA_HOME environment variable set
- Internet connection (for first build to download dependencies)
- ~2GB free disk space (for Gradle cache and dependencies)

## Build Configuration

### Current SDK Versions:
- compileSdk: 34 (Android 14)
- minSdk: 24 (Android 7.0 Nougat)
- targetSdk: 34 (Android 14)

### Dependencies:
- AndroidX Core KTX
- AppCompat
- Material Components
- ConstraintLayout
- Activity KTX

All dependencies are managed by Gradle and downloaded automatically during the first build.
