# Use an explicit, highly stable Debian-based Node image
FROM node:20-bullseye-slim

# Set environment variables for non-interactive installs and Android Paths
ENV DEBIAN_FRONTEND=noninteractive
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV ANDROID_HOME=/opt/android-sdk
ENV PATH=${PATH}:${ANDROID_HOME}/cmdline-tools/latest/bin:${ANDROID_HOME}/platform-tools

# 1. Install Java 17, Curl, and essential build tools
RUN apt-get update && apt-get install -y \
    openjdk-17-jdk-headless \
    curl \
    unzip \
    git \
    && rm -rf /var/lib/apt/lists/*

# 2. Install Android SDK Command-line tools
RUN mkdir -p ${ANDROID_HOME}/cmdline-tools && \
    curl -fL -sS "https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip" -o /tmp/cmdline-tools.zip && \
    unzip -q /tmp/cmdline-tools.zip -d ${ANDROID_HOME}/cmdline-tools && \
    mv ${ANDROID_HOME}/cmdline-tools/cmdline-tools ${ANDROID_HOME}/cmdline-tools/latest && \
    rm /tmp/cmdline-tools.zip

# 3. Automatically accept all Android SDK Licenses
RUN yes | sdkmanager --licenses

# 4. Install specific required Android Build Tools and Platform SDK
RUN sdkmanager "platforms;android-34" "build-tools;34.0.0"

# Set up the working directory inside the container
WORKDIR /app

# Copy package management files and install production dependencies
# Copy package management files and install production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy the rest of your application code
COPY . .

# 5. FIX THE BINARY FAILURE: Download the physical gradle-wrapper.jar dynamically
RUN mkdir -p android-template/gradle/wrapper && \
    curl -sS -L https://raw.githubusercontent.com/gradle/gradle/v8.5.0/gradle/wrapper/gradle-wrapper.jar -o android-template/gradle/wrapper/gradle-wrapper.jar

# 6. Set explicit global execution permissions for Linux environment
RUN chmod +x android-template/gradlew

# Expose the port your Express server listens on
EXPOSE 10000

# Start the application
CMD ["npm", "run", "server"]
