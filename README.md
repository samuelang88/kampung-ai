# Kampung.ai 🏡

> **AI-Powered HDB & Private Property Valuation Tool for Singapore**

Kampung.ai is a React Native Expo app that provides instant, data-driven property valuations using machine learning and official Singapore government datasets. Search any HDB town, block, or private condo project to get an AI-generated valuation report with confidence intervals, comparable sales, lease decay projections, and buy vs. rent recommendations.

---

## ✨ Features

- **🔍 Smart Search** — Search by HDB town, block number, or private project name with auto-complete
- **🤖 AI Valuation** — Machine learning model estimates market value with confidence range
- **📊 Comparable Sales** — View recent transactions sorted by date with PSF analysis
- **📉 Lease Decay Projections** — Visualize how lease expiry affects property value over 20 years
- **👍 Buy vs. Rent Analysis** — Data-driven recommendation based on PSF, lease, and market trends
- **🚇 Nearby Amenities** — MRT station proximity and school catchment information
- **🏆 Popular Searches** — Quick access to trending Singapore towns

---

## 📸 Screenshots

*Coming soon — add screenshots of Home, Valuation Report, and Property Detail screens here.*

---

## 🏗️ Built With

| Technology | Purpose |
|---|---|
| [React Native](https://reactnative.dev/) | Cross-platform mobile framework |
| [Expo](https://expo.dev/) | Development platform & toolchain |
| [TypeScript](https://www.typescriptlang.org/) | Type-safe codebase |
| [React Navigation](https://reactnavigation.org/) | Screen navigation |
| [React Native Chart Kit](https://github.com/indiespirit/react-native-chart-kit) | Lease decay visualization |
| [React Native Maps](https://github.com/react-native-maps/react-native-maps) | Map integration (future) |
| [Expo Location](https://docs.expo.dev/versions/latest/sdk/location/) | Nearby amenities geolocation |

---

## 📡 Data Sources

Kampung.ai aggregates data from official Singapore government APIs:

| Source | Description | Access |
|---|---|---|
| **[data.gov.sg](https://data.gov.sg)** — HDB Resale Prices | 50K+ HDB resale transactions from 2017 onwards. Updated quarterly. | Free API key |
| **[URA Data Service](https://www.ura.gov.sg/maps/api/)** | Private property transaction data (condos, apartments, landed). Developer account required. | Application-based access key |
| **[OneMap API](https://www.onemap.gov.sg/docs/)** | Singapore Land Authority geospatial data — MRT stations, schools, amenities, and postal code lookup. | Free with registration |

> **URA API Integration:** The app now features a live integration with the URA Data Service API for private property transactions. When an access key is configured, real transaction data is fetched from the official URA API with automatic fallback to mock data if the API is unavailable. See [Setup](#setup) for configuration instructions.

---

## 🚀 Setup

### Prerequisites

- Node.js ≥ 18
- Expo CLI (`npm install -g expo-cli`) or use `npx expo`
- iOS Simulator (macOS) or Android Emulator

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/kampung-ai.git
cd kampung-ai

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start the development server
npx expo start
```

Scan the QR code with **Expo Go** (iOS/Android) or press `a` for Android emulator / `i` for iOS simulator.

### API Keys (Optional)

For production use, obtain the following credentials and add them to `.env`:

1. **URA Access Key** — Register at [URA Data Service Portal](https://www.ura.gov.sg/maps/api/)
   - Once set, the app automatically uses the live URA API for private property transactions
   - Falls back to mock data if the API is unreachable or returns errors
2. **data.gov.sg API Key** — Sign up at [data.gov.sg](https://data.gov.sg/developer)
3. **OneMap Credentials** — Register at [OneMap API](https://www.onemap.gov.sg/docs/)

---

## 📁 Project Structure

```
kampung-ai/
├── App.tsx                  # Expo entry point
├── src/
│   ├── App.tsx              # Root component (SafeAreaProvider + Navigator)
│   ├── navigation/
│   │   └── AppNavigator.tsx # Stack navigator config
│   ├── screens/
│   │   ├── HomeScreen.tsx   # Main search & discovery screen
│   │   ├── PropertyScreen.tsx # Property detail with tabs
│   │   ├── ValuationScreen.tsx # AI valuation report
│   │   └── AboutScreen.tsx  # About & contact
│   ├── services/
│   │   ├── types.ts         # Shared TypeScript types
│   │   ├── mockData.ts      # Real transaction mock data
│   │   ├── uraConfig.ts     # URA API configuration & district mappings
│   │   ├── uraApiReal.ts    # Real URA API client (token, batch queries, encoding)
│   │   ├── uraApi.ts        # URA service adapter (real API + mock fallback)
│   │   └── hdbApi.ts        # HDB resale data service
│   └── utils/
│       └── colors.ts        # SG-inspired color palette
├── app.json                 # Expo configuration
├── package.json
├── tsconfig.json
├── babel.config.js
└── .env.example
```

---

## 🧪 Roadmap

- [x] Real API integration (URA Data Service with live data + mock fallback)
- [ ] OneMap API integration (MRT, schools, geolocation)
- [ ] data.gov.sg HDB resale data live integration
- [ ] Property map with MRT overlay
- [ ] Saved valuations & favorites
- [ ] Mortgage calculator
- [ ] Price trend charts over 1/3/5 years
- [ ] School catchment zone maps
- [ ] Dark mode

---

## ⚖️ Disclaimer

Kampung.ai provides estimated property valuations for **informational purposes only**. These estimates do not constitute professional valuation advice. Always consult a licensed valuer or property agent before making real estate decisions. Transaction data is sourced from public government datasets and may not reflect off-market transactions.

---

## 📬 Contact

- **Email:** hello@kampung.ai
- **Website:** [kampung.ai](https://kampung.ai)
- **Address:** 79 Robinson Road, #15-01, Singapore 068897

---

<p align="center">
  Made with ❤️ in Singapore
</p>
