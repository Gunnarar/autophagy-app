// Expo config derives version metadata from package.json to avoid double updates.
const packageJson = require('./package.json');

const versionInfo = packageJson.versionInfo ?? {};

module.exports = {
  expo: {
    name: 'genesis4pd-app',
    slug: 'genesis4pd-app',
    version: packageJson.version,
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
      icon: './assets/icon.png',
    },
    android: {
      icon: './assets/icon.png',
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
      versionCode: versionInfo.androidVersionCode ?? 1,
      package: 'com.gunnarar.genesis4pd',
    },
    web: {
      favicon: './assets/favicon.png',
    },
    extra: {
      eas: {
        projectId: '15b49c20-73ca-4581-92db-888342de302a',
      },
    },
    owner: 'gunnarar',
  },
};
