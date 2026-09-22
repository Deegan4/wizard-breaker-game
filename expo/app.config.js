// Dynamic config so the GitHub Pages subpath base URL only applies during
// that one deploy step (GH_PAGES_BASE_PATH set in .github/workflows/deploy.yml),
// never in local dev or the Rork tunnel preview, both of which serve at "/".
const basePath = process.env.GH_PAGES_BASE_PATH ?? '';

module.exports = {
  expo: {
    name: 'Wizard Breaker Game',
    slug: 'wizard-breaker-game',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'wizardbreaker',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    splash: {
      image: './assets/images/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#0A0618',
    },
    ios: {
      supportsTablet: false,
      bundleIdentifier: 'app.rork.wizard-breaker-game',
      infoPlist: {
        NSAppTransportSecurity: {
          NSAllowsArbitraryLoads: true,
        },
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#0A0618',
      },
      package: 'app.rork.wizard_breaker_game',
      permissions: ['android.permission.VIBRATE'],
      versionCode: 1,
      softwareKeyboardLayoutMode: 'resize',
    },
    web: {
      favicon: './assets/images/favicon.png',
      bundler: 'metro',
    },
    plugins: [
      [
        'expo-router',
        {
          origin: 'https://rork.com/',
        },
      ],
      'expo-font',
      'expo-web-browser',
    ],
    experiments: {
      typedRoutes: true,
      baseUrl: basePath,
    },
    owner: 'your-expo-username',
    runtimeVersion: {
      policy: 'appVersion',
    },
    updates: {
      url: 'https://u.expo.dev/your-project-id',
    },
  },
};
