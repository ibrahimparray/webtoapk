FROM node:20-bullseye

RUN apt-get update && apt-get install -y \
    openjdk-17-jdk \
    wget \
    unzip \
    git \
    curl && \
    rm -rf /var/lib/apt/lists/*

# Java Environment

ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV PATH="${JAVA_HOME}/bin:${PATH}"

# Android SDK

ENV ANDROID_HOME=/opt/android-sdk
ENV ANDROID_SDK_ROOT=/opt/android-sdk

RUN mkdir -p ${ANDROID_HOME}/cmdline-tools

WORKDIR /tmp

# Download Android Command Line Tools

RUN wget -O commandlinetools.zip https://dl.google.com/android/repository/commandlinetools-linux-13114758_latest.zip && 
unzip commandlinetools.zip && 
mkdir -p ${ANDROID_HOME}/cmdline-tools/latest && 
mv cmdline-tools ${ANDROID_HOME}/cmdline-tools/latest

ENV PATH="${PATH}:${ANDROID_HOME}/cmdline-tools/latest/bin:${ANDROID_HOME}/platform-tools"

# Install Android SDK packages

RUN yes | sdkmanager --licenses || true

RUN sdkmanager 
"platform-tools" 
"platforms;android-34" 
"build-tools;34.0.0"

# Install Gradle 8.2

RUN wget https://services.gradle.org/distributions/gradle-8.2-bin.zip -O /tmp/gradle.zip && 
unzip /tmp/gradle.zip -d /opt/gradle

ENV GRADLE_HOME=/opt/gradle/gradle-8.2
ENV PATH="${PATH}:${GRADLE_HOME}/bin"

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 3000

CMD ["npm", "start"]
