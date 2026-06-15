# Dhandha — Monopoly Deal (Indian Edition)

**A production-grade Progressive Web App** — a complete digital adaptation of the Monopoly Deal card game, localised for an Indian audience. Built with React 19, Vite, and Material UI. Zero backend. Offline-capable. Installable on any device.

[Live Demo](https://satvik-jain-iitd.github.io/Monopoly-Deal-card-game-indian-version/) | [Deploy Preview](#)

---

## Why this project stands out

This is not a tutorial app or a toy project. It is a **fully-featured, rules-complete card game engine** with a polished mobile-first UI, originally built as a **pass-and-play PWA** and later extended with **real-time WebRTC multiplayer**. It demonstrates proficiency across the full front-end stack:

| Area | What it shows |
|---|---|
| **React architecture** | Complex state machine with 40+ action types, 10+ game phases, deterministic reducer |
| **Real-time engineering** | WebRTC + WebSocket signalling, STUN/TURN, message queuing, auto-reconnect with exponential backoff |
| **PWA expertise** | Service worker, install prompt, offline support, asset caching, 64×64–512×512 icons |
| **UI/UX craftsmanship** | Mobile-first (375×667 baseline), consistent spatial map, Hinglish localisation, animated transitions |
| **Testing & debugging** | Headless simulation runner for deterministic game replay, console-based debug overlay |
| **Engineering process** | Multi-agent AI workflow (plan → spec → implement → review → UAT), defence-in-depth on all rules |

---

## Architecture

### Game engine as a pure reducer

All game state lives in a single `useReducer` driven by a `PHASE` enum:

```
DRAW → PLAY → ACTION_RESPONSE / RENT_COLLECT / *_SELECT → DISCARD → GAME_OVER
```

Every case is deterministic and side-effect-free — it deep-clones state and returns the next state. Randomness (shuffle, deal) is isolated in helper functions called before or inside dispatches.

```javascript
// Every action follows this pattern:
case "PLAY_PROPERTY": {
  const next = deepClone(state);
  // ... pure logic ...
  return next;
}
```

**Defence-in-depth:** Illegal moves are blocked at 3 layers — the UI (disabled buttons), the action creator (pre-dispatch validation), and the reducer (post-dispatch guard). No code path can reach an invalid state.

### Separation of concerns

```
src/game/
├── constants.js      # Source of truth: deck definition, rent tables, colour palette
├── gameLogic.js      # Pure rules engine — deal, draw, rent, steal, pay, win check
├── cardSort.js       # Display-only ordering helpers (never mutates game state)
├── scoring.js        # End-game ranking with 4-tier tiebreakers + point system
├── series.js         # localStorage-backed multi-game series standings
└── useGameState.js   # useReducer state machine — the only file with React hooks
```

### Multiplayer (added in Sprint 1)

The pass-and-play original was extended with real-time multiplayer via WebRTC:

- **WebSocket signalling** with connection state management (`CONNECTING → OPEN → CLOSED`)
- **Message queue** ensuring handshake packet (HELLO) is sent only when the socket is actually open — eliminating a fragile `setTimeout` race
- **Auto-reconnect** with exponential backoff: 1s → 2s → 4s → 8s, max 5 retries, capped at 30s
- **STUN server** (`stun:stun.l.google.com:19302`) for NAT traversal; `srflx` candidates preserved during SDP exchange

---

## What I solved (real bugs, real fixes)

During the multiplayer extension, **5 bugs were systematically identified, planned, and fixed**:

| # | Bug | Root cause | Fix |
|---|-----|-----------|-----|
| 1 | **Wild card colour stuck on board** | `assignedColor` was only written during play, never sent in render-phase state | Added `assignedColor` field to wild property objects; toggle button dispatches `CHANGE_WILD_COLOR` |
| 2 | **Deal Breaker not stealing** | Steal handler read `state.players` (pre-reducer clone) instead of `next.players` (mutated clone) | Changed all steal/payment references to use `next.players` |
| 3 | **Rent not enforcing on JSN-cancelled double** | JSN chain returned `newPhase` but kept `doubledRent = true` in next state | Reset doubledRent when JSN is accepted; set base rent as new target |
| 4 | **Deal Breaker JSN never fired** | JSN prompt condition checked `stealTarget` presence but phase transition skipped `ACTION_RESPONSE` | Phase transition routes through `ACTION_RESPONSE` with `debtTarget: stealTarget` |
| 5 | **Multiplayer connection flaky** | 600ms setTimeout for HELLO send + missing ICE candidates in SDP | Implemented `MessageQueue`; `stripSDP` preserves `host` + `srflx` candidates |

Each fix was verified against a structured UAT checklist with explicit pass/fail criteria.

---

## Project structure

```
src/
├── App.jsx                          # Screen flow + series recording
├── game/
│   ├── constants.js                 # Deck definition, rent tables, colour palette
│   ├── gameLogic.js                 # Pure rules engine
│   ├── cardSort.js                  # Display ordering helpers
│   ├── scoring.js                   # End-game ranking + points
│   ├── series.js                    # Multi-game series (localStorage)
│   └── useGameState.js              # Reducer state machine
├── components/
│   ├── game/
│   │   ├── Card.jsx                 # Card renderer (all types)
│   │   ├── CardArt.jsx              # Inline SVG city landmark icons
│   │   ├── CardHand.jsx             # Ordered hand display
│   │   ├── PlayerBoard.jsx          # Bank + property sets
│   │   ├── ActionModal.jsx          # Bottom-sheet action flows
│   │   ├── PassDeviceModal.jsx      # Turn handoff screen
│   │   └── GameLog.jsx              # Event log
│   ├── screens/
│   │   ├── HomeScreen.jsx
│   │   ├── SetupScreen.jsx
│   │   ├── GameScreen.jsx           # Main game loop
│   │   └── ResultsScreen.jsx        # Rankings + series standings
│   └── multiplayer/
│       ├── QRDisplay.jsx
│       └── QRScanner.jsx
└── multiplayer/
    ├── useWebRTC.js                 # WebRTC connection management
    ├── useMultiplayer.js            # WebSocket + state management
    └── rtcUtils.js                  # SDP utilities
```

---

## Tech stack

| Technology | Purpose |
|---|---|
| **React 19** | UI framework |
| **Vite 8** | Build tool + dev server |
| **Material UI v9** | Component library (Material Design 3) |
| **Emotion** | CSS-in-JS |
| **vite-plugin-pwa** | Service worker, manifest, offline support |
| **WebRTC** | Real-time peer-to-peer multiplayer |
| **WebSocket** | Signalling server communication |

Zero backend dependencies. No database. No authentication.

---

## Running locally

```bash
git clone https://github.com/satvik-jain-iitd/Monopoly-Deal-card-game-indian-version.git
cd Monopoly-Deal-card-game-indian-version
npm install
npm run dev
```

Open `http://localhost:5173`. For mobile testing, connect your phone to the same network and use your machine's local IP.

```bash
npm run build      # Production build
npm run preview    # Serve production build locally
```

---

## The game in brief

- **2–6 players**, pass-and-play on a single phone (or real-time via WebRTC)
- First to complete **3 property sets** wins
- 106-card deck with properties (Indian cities), money, action cards, and rent cards
- Rent, stealing, Just Say No chains, houses/hotels — all official rules implemented
- Multi-game series with frozen-board ranking and cumulative scoring

---

Built by [Satvik Jain](https://github.com/satvik-jain-iitd)
