# FitAI Coach - iOS Build Instructions

## Prerequisites

You need a **Mac** with the following installed:

1. **Xcode 15+** (free from Mac App Store)
2. **Node.js 18+** (https://nodejs.org)
3. **CocoaPods** (if needed): `sudo gem install cocoapods`

## Apple Developer Account

To install on a real iPhone or submit to the App Store, you need:

- **Free Apple ID**: Can test on your own device via Xcode (7-day signing)
- **Apple Developer Program ($99/year)**: Required for App Store submission and TestFlight

## Build Steps

### 1. Transfer the project to your Mac

Copy the entire `AI Personalized Fitness Coach` folder to your Mac.

### 2. Install dependencies

```bash
cd "AI Personalized Fitness Coach"
npm install
```

### 3. Sync web assets to iOS

```bash
npx cap sync ios
```

### 4. Open in Xcode

```bash
npx cap open ios
```

This opens the Xcode project at `ios/App/App.xcworkspace`.

### 5. Configure Signing in Xcode

1. In Xcode, select the **App** project in the navigator
2. Go to **Signing & Capabilities** tab
3. Check **Automatically manage signing**
4. Select your **Team** (your Apple ID or Developer account)
5. The Bundle Identifier should be: `com.mindpilot.fitaicoach`

### 6. Select Target Device

- For **Simulator**: Select any iPhone simulator from the device dropdown (e.g., iPhone 15, iPhone 16)
- For **Real iPhone**: Connect your iPhone via USB, trust the computer, and select it

### 7. Build & Run

- Press **Cmd + R** or click the Play button in Xcode
- The app will build and launch on the selected device/simulator

## App Store Submission

### 1. Create App in App Store Connect

1. Go to https://appstoreconnect.apple.com
2. Click **My Apps** → **+** → **New App**
3. Fill in:
   - **Platform**: iOS
   - **Name**: FitAI Coach
   - **Bundle ID**: com.mindpilot.fitaicoach
   - **SKU**: fitai-coach
   - **Primary Language**: English

### 2. Archive the App

1. In Xcode, select **Any iOS Device** as the build target
2. Go to **Product** → **Archive**
3. Wait for the archive to complete

### 3. Upload to App Store Connect

1. In the **Organizer** window (Window → Organizer), select the archive
2. Click **Distribute App**
3. Select **App Store Connect** → **Upload**
4. Follow the prompts

### 4. Submit for Review

1. In App Store Connect, go to your app
2. Fill in all required metadata:
   - App description
   - Screenshots (required sizes: 6.7", 6.5", 5.5")
   - Keywords, categories
   - Privacy policy URL
   - Support URL
3. Select the uploaded build
4. Click **Submit for Review**

## App Configuration

| Setting | Value |
|---------|-------|
| Bundle ID | `com.mindpilot.fitaicoach` |
| App Name | FitAI Coach |
| Version | 1.0.0 |
| Min iOS | 14.0 |
| Supported Devices | All iPhones (Universal) |
| Orientations | Portrait, Landscape Left, Landscape Right |

## RevenueCat (In-App Purchases) for iOS

To enable premium subscriptions on iOS:

1. Create products in **App Store Connect** → **Monetization** → **Subscriptions**
2. Add the RevenueCat iOS SDK to the project:
   - In Xcode, go to **File** → **Add Package Dependencies**
   - Add: `https://github.com/RevenueCat/purchases-ios.git`
3. Configure RevenueCat with your iOS API key in `AppDelegate.swift`
4. Create an iOS app in the RevenueCat dashboard and link your App Store Connect products

## Troubleshooting

### "No signing certificate" error
- Go to Xcode → Settings → Accounts → Add your Apple ID
- Select your team in Signing & Capabilities

### App crashes on launch
- Check Xcode console for errors
- Ensure `npx cap sync ios` was run after any web changes

### White screen on launch
- Run `npx cap sync ios` to ensure web assets are copied
- Check that `www/` folder has all the app files

### "Untrusted Developer" on real device
- On iPhone: Settings → General → VPN & Device Management → Trust your developer certificate
