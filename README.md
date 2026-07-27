# FluxShare

> Production-quality, secure, peer-to-peer cross-platform desktop file sharing application for Windows, macOS, and Linux — inspired by Apple AirDrop.

[![Clean Architecture](https://img.shields.io/badge/Architecture-Clean%20%2F%20SOLID-blue.svg)](#architecture)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue.svg)](https://www.typescriptlang.org/)
[![Electron](https://img.shields.io/badge/Electron-Secure%20Sandbox-4B8BBE.svg)](https://www.electronjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 🌟 Overview

**FluxShare** enables lightning-fast, zero-cloud peer-to-peer file transfers across local area networks (LAN). Files are never uploaded to a server—devices discover each other automatically via **mDNS/Bonjour** and establish encrypted direct connections via **WebRTC DataChannels** with **AES-256-GCM** encryption and **SHA-256** integrity verification.

### ✨ Key Features (MVP)
- **Automatic LAN Discovery**: Seamlessly discover nearby devices on the same Wi-Fi using mDNS/Bonjour.
- **Direct P2P WebRTC Transfer**: Zero server bottleneck; transfers happen directly over local network interfaces.
- **Real-time Transfer Metrics**: Monitor speed (MB/s), progress percentage, remaining time (ETA), and byte transfer charts.
- **Accept/Reject Confirmations**: Explicit cryptographic handshake and user consent before saving files.
- **Modern Minimalist UI**: Arc Browser & Linear inspired dark mode aesthetic with glassmorphism and Framer Motion micro-animations.

---

## 🏗️ Monorepo Architecture

FluxShare is structured as a **monorepo** enforcing **Clean Architecture** and **SOLID principles**, isolating domain logic, protocol schemas, and crypto operations from the UI presentation layer.

```
fluxshare/
├── apps/
│   ├── desktop/              # Electron + React 18 + Vite + Tailwind CSS shell
│   └── signaling-server/     # Express + WebSocket LAN signaling fallback
└── packages/
    ├── shared/               # Domain entities, error classes, and constants
    ├── protocol/             # Signaling & DataChannel wire schemas
    ├── utils/                # Level-filtered logger, formatters, and validators
    ├── network/              # (Upcoming) mDNS discovery & WebRTC engine
    ├── crypto/               # (Upcoming) AES-256-GCM & ECDH key exchange
    └── transfer/             # (Upcoming) Chunking pipeline & throughput math
```

### 🔐 Electron Security Best Practices
- `nodeIntegration: false`
- `contextIsolation: true`
- `sandbox: true`
- Strictly typed IPC bridges (`window.fluxshare`) via `contextBridge`

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v20.x or higher
- **npm**: v10.x or higher

### Installation & Build

```bash
# 1. Clone the repository and install dependencies across all workspaces
npm install

# 2. Build domain packages and applications
npm run build

# 3. Launch the desktop app in development mode
npm run dev:desktop

# 4. (Optional) Launch the standalone LAN signaling server
npm run dev:signaling
```

---

## 🗺️ Engineering Roadmap

- [x] **Phase 1**: Project Setup, Monorepo Foundation & Core Domain Packages
- [ ] **Phase 2**: UI Design System & Component Library (`packages/ui`)
- [ ] **Phase 3**: Local Network Discovery (`packages/network` + mDNS/Bonjour)
- [ ] **Phase 4**: WebSocket Signaling Server & Client Handshake
- [ ] **Phase 5**: P2P WebRTC Connection Engine
- [ ] **Phase 6**: Single File Transfer MVP
- [ ] **Phase 7**: Chunked Multi-File Streaming Pipeline
- [ ] **Phase 8**: Pause/Resume & Throttling Support
- [ ] **Phase 9**: AES-256-GCM End-to-End Encryption
- [ ] **Phase 10**: Portfolio Polish & System Testing

---

## 📄 License
This project is licensed under the MIT License.
