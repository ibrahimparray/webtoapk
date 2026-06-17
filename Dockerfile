FROM node:20-bullseye

# Install Java 17 and required tools

RUN apt-get update && apt-get install -y 
openjdk-17-jdk 
wget 
unzip 
git 
curl 
&& rm -rf /var/lib/apt/lists/*

# Java Environment

ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV PATH=$JAVA_HOME/bin:$PATH

# Android SDK Configuration

ENV ANDROID_HOME=/opt/android-sdk
ENV ANDROID_SDK_ROOT=/opt/android-sdk

RUN mkdir -p ${ANDROID_HOME}/cmdline-tools
WORKDIR /tmp

# Download Android Command Line Tools

RUN wget -O commandlinetools.zip 
https://dl.google.com/android/repository/commandlinetools-linux-13114758_latest.zip && 
unzip commandlinetools.zip && 
mkdir -p ${ANDROID_HOME}/cmdline-tools/latest && 
mv cmdline-tools/* ${ANDROID_HOME}/cmdline-tools/latest/ || true

# Android SDK PATH

ENV PATH=${PATH}:${ANDROID_HOME}/cmdline-tools/latest/bin:${ANDROID_HOME}/platform-tools

# Accept Android licenses

RUN yes | sdkmanager --licenses

# Install Android SDK Packages

RUN sdkmanager 
"platform-tools" 
"platforms;android-34" 
"build-tools;34.0.0"

# Verify Installation

RUN java -version
RUN sdkmanager --version

# Install Gradle 8.2

RUN wget https://services.gradle.org/distributions/gradle-8.2-bin.zip -P /tmp && 
unzip -d /opt/gradle /tmp/gradle-8.2-bin.zip

ENV GRADLE_HOME=/opt/gradle/gradle-8.2
ENV PATH=${PATH}:${GRADLE_HOME}/bin

# Verify Gradle

RUN gradle --version

# Application Directory

WORKDIR /app

# Copy Project

COPY . .

# Install Dependencies

RUN npm install

# Expose Port

EXPOSE 3000

# Start Application

CMD ["npm", "start"]
