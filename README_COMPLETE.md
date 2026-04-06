# 🏥 MediBook - React Native Appointment Booking App

A modern, feature-rich React Native mobile application for seamless appointment scheduling with healthcare service providers. Built with TypeScript, AsyncStorage, and real-time notifications.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Running the App](#running-the-app)
- [Features in Detail](#features-in-detail)
- [API & Data Storage](#api--data-storage)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**MediBook** is a comprehensive appointment booking platform that connects patients with healthcare providers. Users can browse providers, book appointments, manage their schedule, receive reminders, and track appointment history—all from a single, intuitive mobile app.

**Target Users:** Patients seeking convenient healthcare appointment scheduling
**Platform:** Android & iOS (React Native)
**Status:** ✅ Production Ready

---

## ✨ Key Features

### 🔐 Authentication & User Management
- **User Registration** — Email, password, password strength indicator
- **User Login** — Secure authentication with AsyncStorage
- **Password Reset** — Forgot password recovery flow
- **Session Management** — Persistent login state, logout functionality

### 🏥 Service Provider Discovery
- **Provider Listing** — Browse 4+ healthcare providers with profiles
- **Search & Filter** — Real-time search by name/specialty, category filtering
- **Provider Details** — View ratings, reviews, experience, specializations, contact info
- **Availability Status** — See provider availability at a glance

### 📅 Appointment Scheduling
- **Dynamic Date Selection** — 5-day forward booking window
- **Time Slot Management** — Morning/Afternoon slots with real-time availability
- **Slot Validation** — Prevents booking of:
  - Already booked slots (shows "Booked" label)
  - Past time slots on today's date (shows "Past" label)
  - Past dates (disabled entirely)
- **Booking Confirmation** — Summary card with provider, service, date, time, reminder info
- **Appointment Storage** — Persistent storage via AsyncStorage

### 🔔 Smart Reminders & Notifications
- **Push Notifications** — Local scheduled notifications via @notifee/react-native
- **Configurable Timing** — 10, 30, or 60 minutes before appointment (default: 30 min)
- **Email Reminders** — Multi-recipient email support (up to 3 additional recipients)
- **Email Validation** — Format validation, duplicate prevention, max 3 cap
- **In-App Polling** — Automatic reminder check every 60 seconds
- **Notification Status** — Shows "🔔 X min before" or "✅ Reminded" on cards

### 📱 Appointment Management
- **View Appointments** — Dashboard with upcoming appointments
- **Stats Dashboard** — Total scheduled count + today's appointments
- **Cancel Appointments** — Remove bookings with confirmation
- **Auto-Expiry** — Appointments automatically move to history when time passes
- **Reminder Metadata** — Each appointment stores reminder timing and notification status

### 📜 Appointment History
- **History Screen** — View all past/completed appointments
- **Filter Options** — All / Today / Completed filters
- **Completion Status** — Shows "✅ Completed" badge with timestamp
- **Faded UI** — Visual distinction between active and completed appointments
- **Sorted Display** — Newest appointments first

### 🎨 Theme & Customization
- **Dark/Light Mode** — Toggle via menu, persisted preference
- **Responsive Design** — Works on all Android/iOS screen sizes
- **Consistent Styling** — Unified color scheme, spacing, typography
- **Accessibility** — Proper contrast, touch targets, semantic structure

### ⚙️ Settings & Preferences
- **Reminder Settings** — Enable/disable, configure timing, manage email recipients
- **Email Management** — Add/remove additional email recipients with validation
- **Theme Toggle** — Switch between dark and light modes
- **About Screen** — App info, version, developer details

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React Native 0.84.1 |
| **Language** | TypeScript 5.8.3 |
| **Navigation** | React Navigation 7.2.2 (Native Stack) |
| **State Management** | React Hooks (useState, useCallback, useRef) |
| **Storage** | AsyncStorage 2.1.0 |
| **Notifications** | @notifee/react-native 9.1.8 |
| **UI Components** | React Native built-ins |
| **Icons** | Emoji + react-native-vector-icons 10.3.0 |
| **Toasts** | react-native-toast-message 2.3.3 |
| **Build Tool** | Gradle (Android), Xcode (iOS) |
| **Package Manager** | npm |

---

## 📁 Project Structure

```
appoinment-app/
├── src/
│   ├── screens/
│   │   ├── LoginScreen.tsx              # User login with validation
│   │   ├── RegisterScreen.tsx           # User registration with strength indicator
│   │   ├── ResetPasswordScreen.tsx      # Password recovery
│   │   ├── ProviderListScreen.tsx       # Browse providers, search, filter
│   │   ├── ProviderDetailsScreen.tsx    # Provider profile & info
│   │   ├── BookingScreen.tsx            # Appointment booking with slot validation
│   │   ├── AppointmentsScreen.tsx       # Active appointments dashboard
│   │   ├── HistoryScreen.tsx            # Past appointments with filters
│   │   ├── ReminderSettingsScreen.tsx   # Configure reminders & emails
│   │   └── AboutScreen.tsx              # App info & developer details
│   ├── components/
│   │   ├── MenuModal.tsx                # Hamburger menu with dark mode toggle
│   │   ├── PasswordInput.tsx            # Secure password input component
│   │   └── PasswordStrength.tsx         # Password strength indicator
│   ├── context/
│   │   └── ThemeContext.tsx             # Dark/Light theme provider
│   └── utils/
│       ├── appointmentUtils.ts          # Appointment logic, expiry detection
│       ├── notificationUtils.ts         # Push notification scheduling
│       └── reminderUtils.ts             # Reminder timing, email logic
├── android/
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── java/com/appointmentapptemp/
│   │   │   │   └── MainActivity.kt      # Android entry point
│   │   │   ├── AndroidManifest.xml      # App permissions & config
│   │   │   └── res/
│   │   │       └── values/
│   │   │           ├── styles.xml       # Android theme
│   │   │           └── strings.xml      # String resources
│   │   └── build.gradle                 # Android build config
│   └── gradle.properties                # Gradle settings
├── ios/
│   ├── AppointmentAppTemp/              # iOS app files
│   ├── AppointmentAppTemp.xcodeproj/    # Xcode project
│   └── Podfile                          # CocoaPods dependencies
├── App.tsx                              # Root navigation setup
├── index.js                             # App entry point
├── package.json                         # Dependencies & scripts
├── tsconfig.json                        # TypeScript config
├── babel.config.js                      # Babel transpiler config
└── metro.config.js                      # Metro bundler config
```

---

## 🚀 Installation & Setup

### Prerequisites

- **Node.js** ≥ 22.11.0
- **npm** or **yarn**
- **Android SDK** (for Android development)
- **Xcode** (for iOS development, macOS only)
- **Java Development Kit (JDK)** 11+
- **Android Emulator** or **Physical Android Device**

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/appoinment-app.git
cd appoinment-app
```

### Step 2: Install Dependencies

```bash
npm install
```

Or with yarn:

```bash
yarn install
```

### Step 3: Install iOS Dependencies (macOS only)

```bash
cd ios
bundle install
bundle exec pod install
cd ..
```

### Step 4: Set Up Android Environment

Ensure your `ANDROID_HOME` environment variable is set:

```bash
# Windows (PowerShell)
$env:ANDROID_HOME = "C:\Users\<YourUsername>\AppData\Local\Android\Sdk"

# macOS/Linux
export ANDROID_HOME=$HOME/Library/Android/sdk
```

### Step 5: Verify Setup

```bash
npx react-native doctor
```

This will check your environment and report any issues.

---

## ▶️ Running the App

### Android

**Option 1: Using Emulator**

Start the emulator first:
```bash
emulator -avd Pixel_5
```

Then run the app:
```bash
npm run android
```

**Option 2: Using Physical Device**

1. Enable USB Debugging on your Android device
2. Connect via USB cable
3. Run:
```bash
npm run android
```

### iOS (macOS only)

**Option 1: Using Simulator**

```bash
npm run ios
```

**Option 2: Using Physical Device**

```bash
npm run ios -- --device "Your Device Name"
```

### Metro Dev Server

In a separate terminal, start the Metro bundler:

```bash
npm start
```

This enables Fast Refresh for live code reloading.

---

## 🎯 Features in Detail

### 1. User Authentication

**Registration Flow:**
- Email validation (regex pattern)
- Password strength indicator (Weak/Medium/Strong)
- Password confirmation matching
- Persistent storage via AsyncStorage

**Login Flow:**
- Email & password validation
- Error handling with toast notifications
- Session persistence
- Logout clears auth state

**Password Reset:**
- Email-based recovery
- New password validation
- Confirmation flow

### 2. Provider Discovery

**Search & Filter:**
- Real-time search by provider name or specialty
- Category-based filtering (All, Dental, Cardiology, Skin Care, Bone & Joint, Neurology)
- Result count display
- Empty state messaging

**Provider Details:**
- Profile image with availability indicator
- Ratings (★ out of 5)
- Review count
- Years of experience
- Specializations (tags)
- Contact information
- Working hours

### 3. Appointment Booking

**Slot Validation Logic:**

```typescript
// Past date check
const isPastDate = selectedDate < today;

// Past time check (today only)
const slotDateTime = new Date(selectedDate);
slotDateTime.setHours(hours, minutes, 0);
const isPastTime = selectedDate === today && slotDateTime < currentTime;

// Booked slot check
const isBooked = bookedSlots.includes(slot);

// Final disable condition
const isDisabled = isBooked || isPastTime || isPastDate;
```

**Booking Summary:**
- Provider name & service
- Selected date & time
- Reminder timing
- Confirmation alert with details

### 4. Appointment Management

**Dashboard Features:**
- Stats pills (Total Scheduled, Today's Count)
- Appointment cards with:
  - Provider name & service
  - Status badge (TODAY/UPCOMING)
  - Time & date chips
  - Reminder status (🔔 X min before / ✅ Reminded)
  - Cancel button
- Empty state when no appointments

**Auto-Expiry:**
- Runs on screen focus
- Runs every 60 seconds via interval
- Moves expired appointments to history
- Updates appointment status

### 5. Reminder System

**Push Notifications:**
- Scheduled via @notifee/react-native
- Configurable timing (10/30/60 minutes before)
- Automatic scheduling on booking
- Cancellation on appointment deletion

**Email Reminders:**
- Multi-recipient support (up to 3 additional emails)
- Email validation with regex
- Duplicate prevention
- Deduplication on save
- In-app polling every 60 seconds
- Fallback when app is active

**Settings Screen:**
- Enable/disable toggle
- Timing radio options
- Email recipient management
- Add/remove email UI
- Validation error messages
- Capacity indicator (X/3)

### 6. History & Expiry

**History Screen:**
- Filter tabs (All / Today / Completed)
- Faded card styling for completed appointments
- Completion timestamp
- Sorted by newest first
- Empty state per filter

**Auto-Move Logic:**
- Compares appointment time with current time
- Moves to history when expired
- Stores expiration timestamp
- Prevents duplicate moves

### 7. Theme System

**Dark/Light Mode:**
- Toggle in hamburger menu
- Persisted preference
- Applied to all screens
- Consistent color palette

**Color Scheme:**
- Dark: `#0D1117` (bg), `#161B22` (surface), `#1C2230` (card)
- Light: Inverted colors
- Accent: `#6C63FF` (purple)
- Status: Gold (`#F5C842`), Red (`#FF4757`), Green (`#3DD68C`)

---

## 💾 API & Data Storage

### AsyncStorage Keys

| Key | Type | Purpose |
|---|---|---|
| `loggedIn` | string | Auth state ("true"/"false") |
| `user` | JSON | User credentials {email, password} |
| `ACTIVE_APPOINTMENTS` | JSON[] | Current/upcoming appointments |
| `APPOINTMENT_HISTORY` | JSON[] | Past/completed appointments |
| `REMINDER_SETTINGS` | JSON | Reminder preferences {enabled, minutesBefore, emailsEnabled, additionalEmails} |

### Data Structures

**Appointment Object:**
```typescript
{
  id: string;                    // Unique ID (timestamp)
  providerId: string;            // Provider reference
  name: string;                  // Provider name
  service: string;               // Service type
  category: string;              // Specialty category
  image: string;                 // Provider image URL
  day: string;                   // Day label (e.g., "Today", "Mon")
  dayKey: string;                // Date key (toDateString())
  timeSlot: string;              // Time (e.g., "10:00 AM")
  bookedAt: string;              // ISO timestamp
  expiredAt?: string;            // ISO timestamp when moved to history
  reminderMinutes?: number;      // Minutes before appointment
  reminderTime?: string;         // ISO timestamp of reminder
  notificationId?: string;       // Notifee notification ID
  notified?: boolean;            // Whether reminder fired
}
```

**Reminder Settings Object:**
```typescript
{
  enabled: boolean;              // Push notifications on/off
  minutesBefore: number;         // 10 | 30 | 60
  emailsEnabled: boolean;        // Email reminders on/off
  additionalEmails: string[];    // Up to 3 recipient emails
}
```

### Email Reminder Payload

```json
{
  "emails": ["user@example.com", "family@example.com"],
  "providerName": "Dr. John Mitchell",
  "service": "Dental Checkup",
  "timeSlot": "10:00 AM",
  "date": "Mon, Jun 9",
  "subject": "Appointment Reminder",
  "body": "Hello,\n\nThis is a reminder for your upcoming appointment..."
}
```

---

## ⚙️ Configuration

### Android Configuration

**AndroidManifest.xml Permissions:**
```xml
<uses-permission android:name="android.permission.INTERNET" />
```

**MainActivity.kt:**
- No FLAG_SECURE (allows screenshots & screen recording)
- Default React Native setup
- New Architecture support enabled

### iOS Configuration

**Podfile:**
- CocoaPods dependencies auto-linked
- Notification permissions required

### Environment Variables

Create a `.env` file (optional):
```
REACT_APP_API_URL=https://your-api.com
REACT_APP_ENV=development
```

### Build Configuration

**Android (android/app/build.gradle):**
```gradle
compileSdk 36
targetSdk 36
minSdk 24
```

**iOS (ios/Podfile):**
```ruby
platform :ios, '13.0'
```

---

## 🐛 Troubleshooting

### Common Issues

**1. Metro Bundler Won't Start**
```bash
# Clear cache and restart
npm start -- --reset-cache
```

**2. Android Build Fails**
```bash
# Clean build
cd android
./gradlew clean
cd ..
npm run android
```

**3. Emulator Offline**
```bash
# Restart ADB
adb kill-server
adb devices
```

**4. iOS Pod Issues**
```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

**5. TypeScript Errors**
```bash
# Regenerate types
npm install
```

**6. Notification Permissions Denied**
- Go to Settings → Apps → MediBook → Permissions
- Enable "Notifications"

**7. Screen Recording Blocked**
- ✅ Already enabled (no FLAG_SECURE set)
- Try: Settings → Developer Options → Verify app permissions

### Debug Mode

Enable verbose logging:
```bash
npm start -- --verbose
npx react-native run-android --verbose
```

### Performance Optimization

- Use React DevTools: `npm install -g react-devtools`
- Profile with Android Profiler (Android Studio)
- Check memory leaks with Xcode Instruments (iOS)

---

## 📝 Development Workflow

### Code Style

- **Language:** TypeScript (strict mode)
- **Formatting:** Prettier (2.8.8)
- **Linting:** ESLint (8.19.0)

### Linting & Formatting

```bash
# Lint code
npm run lint

# Format code
npx prettier --write src/
```

### Testing

```bash
# Run tests
npm test

# Watch mode
npm test -- --watch
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/appointment-reminders

# Commit changes
git commit -m "feat: add email reminder support"

# Push to remote
git push origin feature/appointment-reminders

# Create pull request
```

---

## 🔒 Security Considerations

### Data Protection

- ✅ Passwords stored locally (not recommended for production)
- ✅ AsyncStorage used for non-sensitive data
- ✅ No API keys exposed in code
- ✅ HTTPS recommended for production APIs

### Recommendations for Production

1. **Backend Authentication:**
   - Use JWT tokens instead of storing passwords
   - Implement secure session management
   - Add OAuth2/SSO support

2. **Data Encryption:**
   - Encrypt sensitive data at rest
   - Use HTTPS for all API calls
   - Implement certificate pinning

3. **Permissions:**
   - Request only necessary permissions
   - Handle permission denials gracefully
   - Explain permission usage to users

4. **Screen Recording:**
   - Currently allowed (no FLAG_SECURE)
   - Add FLAG_SECURE for sensitive screens if needed

---

## 📦 Deployment

### Android APK Build

```bash
# Debug APK
npm run android

# Release APK
cd android
./gradlew assembleRelease
cd ..
# APK location: android/app/build/outputs/apk/release/app-release.apk
```

### iOS Build

```bash
# Debug build
npm run ios

# Release build
cd ios
xcodebuild -workspace AppointmentAppTemp.xcworkspace \
  -scheme AppointmentAppTemp \
  -configuration Release \
  -derivedDataPath build
cd ..
```

### Play Store Submission

1. Create Google Play Developer account
2. Generate signed APK with keystore
3. Upload to Play Store Console
4. Fill app details, screenshots, description
5. Submit for review

### App Store Submission

1. Create Apple Developer account
2. Create App ID in Apple Developer Portal
3. Build and archive in Xcode
4. Upload to App Store Connect
5. Fill app details and submit for review

---

## 📚 Additional Resources

- [React Native Documentation](https://reactnative.dev)
- [React Navigation Docs](https://reactnavigation.org)
- [@notifee Documentation](https://notifee.app)
- [AsyncStorage Guide](https://react-native-async-storage.github.io/async-storage/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Guidelines

- Follow TypeScript strict mode
- Use functional components with hooks
- Add JSDoc comments for complex functions
- Test on both Android and iOS
- Update README if adding new features

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👨‍💻 Author

**Nikil** — Full Stack Developer

- GitHub: [@nikil](https://github.com/nikil)
- Email: nikil@example.com

---

## 🙏 Acknowledgments

- React Native community for excellent documentation
- @notifee team for notification library
- All contributors and testers

---

## 📞 Support

For issues, questions, or suggestions:

1. **GitHub Issues:** [Create an issue](https://github.com/yourusername/appoinment-app/issues)
2. **Email:** support@medibook.app
3. **Documentation:** Check README_COMPLETE.md

---

## 🎉 Version History

| Version | Date | Changes |
|---|---|---|
| 1.0.0 | 2025-04-04 | Initial release with core features |
| 0.9.0 | 2025-03-15 | Beta with reminder system |
| 0.5.0 | 2025-02-01 | Alpha with basic booking |

---

**Last Updated:** April 4, 2025  
**Status:** ✅ Production Ready  
**Maintained By:** Nikil

---

## Quick Start Checklist

- [ ] Clone repository
- [ ] Install dependencies (`npm install`)
- [ ] Install iOS pods (`cd ios && pod install && cd ..`)
- [ ] Start Metro (`npm start`)
- [ ] Run on Android (`npm run android`) or iOS (`npm run ios`)
- [ ] Register a new account
- [ ] Browse providers
- [ ] Book an appointment
- [ ] Configure reminders
- [ ] Test screen recording ✅

**Happy Booking! 🏥📱**
