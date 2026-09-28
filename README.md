# RailTrack 🚆 | Real-Time Indian Railways Live Tracking & GPS Hub

**RailTrack** is a modern, high-performance Indian Railways Live Train Running Status, Route Tracker, Station Board, and PNR Inquiry platform built with Next.js 14, React 18, Leaflet, and Tailwind CSS.

---

## ✨ Features

- 🛰️ **Interactive Leaflet GPS Map**:
  - Live moving train location marker with glowing radar beacon and real-time speed badge.
  - Complete railway track route visualization with color-coded passed and upcoming stations.
  - Custom SVG station pins with platform numbers and stoppage duration.
  - Map theme switch: High-contrast Dark mode, Voyager terrain, and Standard OpenStreetMap.
- ⏱️ **Live Running Status & Telemetry**:
  - Real-time speedometer gauge showing current GPS train velocity.
  - Next station ETA countdown, distance remaining, and platform allocation.
  - Vertical timeline stepper with delay badges and halt times.
  - Live satellite telemetry simulator with active speed adjustments.
- 🚉 **Live Station Display Board**:
  - Electronic departure and arrival boards for major railway hubs (NDLS, MMCT, HWH, MAS, SBC, BPL, etc.).
  - Instant filters for all train movements, arrivals only, or departures only.
  - Real-time delay indicators and platform numbers.
- 🎫 **PNR Status & Confirmation Forecast**:
  - 10-digit PNR validator with preloaded sample tickets (Vande Bharat, Rajdhani).
  - Detailed passenger booking status vs current status (CNF, RAC, WL).
  - Coach, berth allocation (Window, Aisle, Side Lower), and confirmation probability percentage.
  - Reservation chart preparation status.
- 💺 **Seat Availability & Live Fare Inquiry**:
  - Station-to-station train search with journey date and quota selection (General, Tatkal, Ladies, Senior).
  - Instant fare breakdown in ₹ (INR) for 1A, 2A, 3A, CC, EC, SL.
  - Direct 1-click booking link integration with IRCTC.
- 🛡️ **Safety & Assistance**:
  - Integrated 139 RailMadad Railway Helpline quick dialer.
  - IST live digital clock.

---

## 🚀 Getting Started

### 1. Development Server
Run the local development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### 2. Production Build
```bash
npm run build
npm start
```

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI & Styling**: Tailwind CSS, Lucide React Icons, Framer Motion
- **Maps**: Leaflet & React-Leaflet (dynamic client-side rendering with custom div icons)
- **Type Safety**: TypeScript 5
