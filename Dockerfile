FROM node:20-bullseye-slim

ENV DEBIAN_FRONTEND=noninteractive
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV ANDROID_HOME=/opt/android-sdk
ENV PATH=${PATH}:${ANDROID_HOME}/cmdline-tools/latest/bin:${ANDROID_HOME}/platform-tools
ENV GRADLE_OPTS="-Xmx256m -XX:MaxMetaspaceSize=128m"
ENV NODE_OPTIONS="--max-old-space-size=256"

RUN apt-get update && apt-get install -y \
    openjdk-17-jdk-headless \
    curl \
    unzip \
    git \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p ${ANDROID_HOME}/cmdline-tools && \
    curl -fL -sS "https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip" -o /tmp/cmdline-tools.zip && \
    unzip -q /tmp/cmdline-tools.zip -d ${ANDROID_HOME}/cmdline-tools && \
    mv ${ANDROID_HOME}/cmdline-tools/cmdline-tools ${ANDROID_HOME}/cmdline-tools/latest && \
    rm /tmp/cmdline-tools.zip

RUN yes | /opt/android-sdk/cmdline-tools/latest/bin/sdkmanager --licenses

RUN /opt/android-sdk/cmdline-tools/latest/bin/sdkmanager "platforms;android-34" "build-tools;34.0.0"

WORKDIR /app

COPY package.json ./
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/

RUN npm run install:all

COPY . .

RUN npm run build:frontend

ENV FRONTEND_DIST=/app/frontend/dist

EXPOSE 3001

CMD ["npm", "start"]
