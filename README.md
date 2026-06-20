<div align="center">

# 🏠 Dhandha — The Indian Property Card Game

**A full digital adaptation of Monopoly Deal — reimagined with Indian cities, desi flair, and built as a production-grade PWA from scratch.**

[![Live Demo](https://img.shields.io/badge/🎮_Live_Demo-Dhandha-E65100?style=for-the-badge)](https://satvik-jain-iitd.github.io/Monopoly-Deal-card-game-indian-version/)
[![PWA](https://img.shields.io/badge/📱_PWA-Installable-1565C0?style=for-the-badge)](https://satvik-jain-iitd.github.io/Monopoly-Deal-card-game-indian-version/)

</div>

---

## 👋 For Players

### What is Dhandha?

Dhandha is a **fast-paced property card game** for 2–6 players. Buy properties from Indian cities (Indore, Bengaluru, South Mumbai, and more), charge rent, steal from opponents, and be the first to complete 3 full property sets.

Every card has an Indian flavour — properties use real Indian cities, the UI speaks Hinglish, and two custom cards (Sabotage & Insurance) add unique desi twists.

### How to Play (60 seconds)

| Step | Action |
|------|--------|
| **1** | Draw 2 cards — har turn mein |
| **2** | Play up to 3 cards — property, money, ya action |
| **3** | Build sets — ek hi colour ki properties ikatthi karo |
| **4** | **Win** — sabse pehle 3 complete sets, you win! 🏆 |

### Play with Friends — 4 Ways

| Mode | What it does |
|------|-------------|
| 📱 **Pass & Play** | Ek hi phone pe, sab saath — pass the phone around |
| 🌐 **Online Khelo** | Internet ke saath remote players se khelo |
| 📡 **Hotspot Khelo** | Local network mein, no internet needed |
| 📵 **Offline Khelo** | WebRTC direct — bus/train mein bhi khelo |

No accounts. No signup. No backend. Open the link and play.

---

## 🛠️ For Engineers & Product Managers

### What this project proves about me as an engineer

| Competency | Evidence in this project |
|---|---|
| **Product thinking** | Indian-city-themed localization, Hinglish UI, custom cards (Sabotage, Insurance) designed from player pain points |
| **React architecture** | 40+ action type state machine, 12+ game phases, pure reducer with 3-layer defence-in-depth against illegal moves |
| **Real-time engineering** | WebRTC + WebSocket signalling with STUN/TURN, message queuing eliminates race conditions, auto-reconnect with exponential backoff |
| **PWA & mobile expertise** | Service worker, install prompt, offline support, full icon set, 375×667 mobile-first baseline |
| **UI/UX craftsmanship** | Consistent spatial system, animated transitions, tactile sound feedback, Hinglish microcopy |
| **Engineering process** | Multi-agent AI pipeline (Tech Lead → SDE → QA), UAT checklists with explicit pass/fail, deterministic headless simulation runner |
| **Code quality** | Every illegal move blocked at 3 layers: UI, action creator, reducer. Pure functions everywhere. Zero backend dependencies |

### Architecture Highlights

**Game Engine:** All state lives in a single `useReducer` driven by a deterministic `PHASE` enum:
```
DRAW → PLAY → ACTION_RESPONSE / RENT / SELECT → DISCARD → GAME_OVER
```
Every action deep-clones state and returns a clean next state — no side effects, no surprises.

**Multiplayer:** WebRTC peer-to-peer with WebSocket signalling, message queue for race-free handshakes, auto-reconnect (1s→2s→4s→8s exponential backoff), and LAN mode.

**Deck:** 110 cards — 28 properties (Indian cities), 20 money cards, 34 action cards, 13 rent cards, 11 wild properties, plus 4 optional custom cards.

### Tech Stack

| Technology | Why |
|---|---|
| **React 19** | Modern hooks-based component architecture |
| **Vite 8** | Fast builds, HMR, PWA plugin |
| **Material UI v9** | MD3 design system, accessible components |
| **WebRTC + WebSocket** | Real-time peer-to-peer + signalling relay |
| **vite-plugin-pwa** | Service worker, offline caching, install prompt |
| **Cloudflare Workers** | WebSocket signalling relay (optional, no backend otherwise) |

Zero backend. No database. No auth. Runs entirely on the client.

---

## 🚀 Try It

```bash
git clone https://github.com/satvik-jain-iitd/Monopoly-Deal-card-game-indian-version.git
cd Monopoly-Deal-card-game-indian-version
npm install
npm run dev
```

Open `http://localhost:5173`. For mobile testing, connect your phone to the same network.

```bash
npm run build      # Production build
npm run preview    # Serve production build locally
```

Live PWA: [satvik-jain-iitd.github.io/Monopoly-Deal-card-game-indian-version](https://satvik-jain-iitd.github.io/Monopoly-Deal-card-game-indian-version/)

---

<div align="center">

Built by [Satvik Jain](https://github.com/satvik-jain-iitd)

</div>
