# AGAPORAS Mobile (Expo Go)

React Native client for the AGAPORAS lovebird breeding API. Works with **Expo Go**.

## Prerequisites

- Node.js 18+
- Expo Go app on your phone (same Wi‑Fi as this PC)
- Laravel backend running and reachable on your LAN

## 1. Configure API URL

Edit [`.env`](.env):

```
EXPO_PUBLIC_API_URL=http://YOUR_LAN_IP:8000/api
```

Find your PC IP (Windows PowerShell):

```powershell
Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike '127.*' }
```

**Do not use `localhost`** on a physical phone — that points at the phone itself.

Current default in this repo: `http://192.168.0.110:8000/api` (change if your IP differs).

## 2. Start the backend on all interfaces

From `backend/`:

```bash
php artisan serve --host=0.0.0.0 --port=8000
```

## 3. Start Expo

```bash
cd mobile
npm install
npm start
```

Scan the QR code with Expo Go (Android) or the Camera app (iOS).

## Features (parity with web)

- Home species carousel
- About / Help
- Login, Sign up, Forgot password
- Breeding form + parent genetic fields
- On-device genetic computation engine
- Breeding pairs list + result preview
- Full computation results tabs
- Admin dashboard (admin role)
- Terms acceptance after login

## Project layout

```
mobile/
  App.js
  src/
    api/
    components/
    context/
    navigation/
    screens/
    theme.js
    utils/GeneticComputationEngine.js
  assets/
```
