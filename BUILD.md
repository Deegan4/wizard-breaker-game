# EAS Build Configuration

This document describes how to build and deploy Wizard Breaker Game using Expo Application Services (EAS).

## Prerequisites

1. **Expo account** - Create one at https://expo.dev
2. **EAS CLI** - Install globally: `npm install -g eas-cli`
3. **Login to EAS** - Run `eas login`

## Configuration Files

- `eas.json` - Build profiles (development, preview, production)
- `app.config.js` - App configuration (bundle ID, version, plugins, etc.)
- `google-play-service-account.json` - Required for Google Play submission (not committed)
- Apple credentials - Configured via `eas credentials`

## Build Profiles

### Development
```bash
eas build --profile development
```
- Creates development client with hot reload
- Internal distribution (APK for Android, simulator for iOS)

### Preview
```bash
eas build --profile preview
```
- Release build for internal testing
- APK for Android, Release config for iOS

### Production
```bash
eas build --profile production
```
- Production-ready builds
- AAB for Android (Google Play), Release for iOS (App Store)
- Auto-increments version code

## First-Time Setup

1. **Configure project on Expo:**
   ```bash
   eas build:configure
   ```

2. **Set up credentials:**
   ```bash
   eas credentials
   ```
   - Android: Keystore (generated or upload existing)
   - iOS: Distribution certificate + provisioning profile

3. **Configure app.config.js:**
   - Update `owner` with your Expo username
   - Update `bundleIdentifier` / `package` for your app
   - Set `runtimeVersion` policy

## Building

### Android Production
```bash
eas build --platform android --profile production
```

### iOS Production
```bash
eas build --platform ios --profile production
```

### All Platforms
```bash
eas build --profile production
```

## Submitting to Stores

### Google Play
```bash
eas submit --platform android --profile production
```
Requires `google-play-service-account.json` with appropriate permissions.

### Apple App Store
```bash
eas submit --platform ios --profile production
```
Requires Apple ID, App Store Connect App ID, and Team ID configured in `eas.json` or via prompts.

## Version Management

- Version in `app.config.js` (`version`) for user-facing version
- `versionCode` (Android) auto-incremented in production profile
- `runtimeVersion` policy set to `appVersion` for OTA updates

## Environment Variables

For production secrets, use EAS Secrets:
```bash
eas secret:create --scope project --name API_KEY --value your-secret-value
```

## Troubleshooting

- **Build fails:** Check `eas build:list` for logs
- **Credentials issues:** Run `eas credentials` to reconfigure
- **Metro bundler issues:** Clear cache with `expo start -c`

## Local Development

```bash
cd expo
bun install
bun run start
```

For web:
```bash
bun run start-web
```

## GitHub Actions Integration

The repo includes `.github/workflows/deploy.yml` for automatic web deployment to GitHub Pages on push to main.