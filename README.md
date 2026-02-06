# Finance Management Mobile App (React Native Expo)

A modern finance management mobile app built with **React Native** and **Expo** for iOS (and Android). All data is stored locally on device using AsyncStorage.

## Features

- **Dashboard** – Monthly summary (income, expenses, balance), quick-add by category, spending by category with progress bars, recent transactions, FAB to add entry
- **Add Entry** – Income/expense toggle, amount, category (with icons), payment method, date picker, notes; supports edit when opened from transaction list
- **Transactions** – List grouped by date, search, sort (newest/oldest, amount), filters (time period, category, payment method), swipe left/right on a row to delete or edit
- **Settings (Profile)** – Manage income/expense categories (add with name, icon, color), manage payment methods (add with name, type, icon)
- **Persistence** – Transactions, categories, and payment methods are saved to AsyncStorage and restored on app launch

## Run on iOS

```bash
cd finance-app-expo
npm install
npx expo start --ios
```

Or open the project in Xcode after running `npx expo prebuild` for a native build.

## Run on Android

```bash
npx expo start --android
```

## Tech Stack

- Expo SDK 54
- React Navigation (native stack + bottom tabs)
- AsyncStorage for local persistence
- date-fns for dates
- lucide-react-native for icons
- react-native-gesture-handler + react-native-reanimated for swipe actions
