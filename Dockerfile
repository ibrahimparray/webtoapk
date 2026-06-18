# Step 1: Use an official Gradle image with JDK 17 as the base
FROM gradle:8.2-jdk17 AS builder

USER root

# Step 2: Install required system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    unzip \
    git \
    && rm -rf /var/lib/apt/lists/*

# Step 3: Set environment variables for Android SDK
ENV ANDROID_HOME=/opt/android-sdk
ENV ANDROID_SDK_ROOT=/opt/android-sdk
ENV PATH=${PATH}:${ANDROID_HOME}/cmdline-tools/latest/bin:${ANDROID_HOME}/platform-tools

# Step 4: Download and extract the real Android Command-line Tools
RUN mkdir -p ${ANDROID_HOME}/cmdline-tools && \
    curl -L https://dl.google.com/android/repository/commandlinetools-linux-13114758_latest.zip \
    -o /tmp/cmdline.zip && \
    unzip -q /tmp/cmdline.zip -d ${ANDROID_HOME}/cmdline-tools && \
    mv ${ANDROID_HOME}/cmdline-tools/cmdline-tools \
       ${ANDROID_HOME}/cmdline-tools/latest && \
    rm /tmp/cmdline.zip

# Step 5: Accept Android SDK Licenses automatically
RUN yes | sdkmanager --licenses

# Step 6: Install required Android platform tools and build targets
RUN sdkmanager "platform-tools" \
               "platforms;android-34" \
               "build-tools;34.0.0"

# Step 7: Set workspace and build project
WORKDIR /app
COPY . .

# Run your Gradle build
RUN gradle assembleRelease --no-daemon
