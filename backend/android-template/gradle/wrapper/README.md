# Gradle Wrapper JAR

## ⚠️ Important Notice

The `gradle-wrapper.jar` file is **NOT included** in this repository due to its binary nature.

## 📥 How to Get It

You must download it before building APKs. Use one of these methods:

### Method 1: Run Setup Script (Recommended)

From the project root:

**Linux/macOS:**
```bash
./setup-gradle.sh
```

**Windows:**
```cmd
setup-gradle.bat
```

### Method 2: Manual Download

1. Download the file from:
   ```
   https://raw.githubusercontent.com/gradle/gradle/master/gradle/wrapper/gradle-wrapper.jar
   ```

2. Save it to this directory:
   ```
   android-template/gradle/wrapper/gradle-wrapper.jar
   ```

### Method 3: Using Gradle Wrapper Task

If you have Gradle installed globally:

```bash
cd android-template
gradle wrapper --gradle-version 8.0
```

## ✅ Verification

After downloading, verify the file exists:

**Linux/macOS:**
```bash
ls -lh android-template/gradle/wrapper/gradle-wrapper.jar
```

**Windows:**
```cmd
dir android-template\gradle\wrapper\gradle-wrapper.jar
```

You should see a file approximately 60-100KB in size.

## 🔒 Security Note

Always download Gradle wrapper from official sources:
- GitHub: https://github.com/gradle/gradle
- Gradle Services: https://services.gradle.org/

## 🚀 After Setup

Once the JAR is in place, you can build Android APKs:

```bash
cd android-template
./gradlew clean assembleRelease  # Linux/macOS
gradlew.bat clean assembleRelease  # Windows
```

This is automatically handled by the APK converter backend during builds.
