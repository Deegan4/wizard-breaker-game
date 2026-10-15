// Optional subpath base URL for hosting under a path (e.g. the old GitHub
// Pages deploy used GH_PAGES_BASE_PATH=/wizard-breaker-game). The Cloudflare
// Pages deploy, local dev and the Rork preview all serve at "/", so it's unset.
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
      'expo-image',
      'expo-splash-screen',
      'expo-status-bar',
    ],
    experiments: {
      typedRoutes: true,
      baseUrl: basePath,
    },
  },
};
