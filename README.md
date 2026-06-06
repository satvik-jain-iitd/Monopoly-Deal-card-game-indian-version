# Dhandha 🎴

> India ka apna property card game — a full-featured Monopoly Deal clone built as a Progressive Web App, playable on any phone with no install required.

**Live demo → [satvik-jain-iitd.github.io/New-Repo](https://satvik-jain-iitd.github.io/New-Repo/)**

---

## What is this?

Dhandha is a digital adaptation of **Monopoly Deal** — the fast-paced card game where players race to collect 3 complete property sets. It's built specifically for **pass-and-play on mobile**: one phone gets passed around the table between friends, with each player's hand hidden until it's their turn.

The game is fully localised for an Indian audience — all 20 property locations are **real Indian cities** (South Mumbai, Lutyens Delhi, Bengaluru, Goa, etc.), matched by color tier to their real-world prestige. The UI is in **Hinglish** (Hindi + English mix), the currency is **₹ Crore**, and the visual design uses a warm saffron palette inspired by Material You.

---

## Features

| Category | Details |
|---|---|
| **Game rules** | Full standard Monopoly Deal — draw 2, play up to 3, rent, action cards, Just Say No, houses & hotels |
| **Action cards** | Deal Breaker, Sly Deal, Forced Deal, Debt Collector, Birthday, Pass Go, Double Rent, House, Hotel |
| **Pass & Play** | Device-passing flow with hand-hiding screen between turns |
| **2–6 players** | Configurable player count and names at setup |
| **Bank tracking** | Per-player denomination breakdown shown face-up (real game rule) |
| **Property rent info** | Tap any color group header to see cards needed + full rent table |
| **Play zone** | Last played card animates into a shared center zone so everyone at the table sees it |
| **PWA** | Installable on iOS & Android home screen, works offline after first load |

---

## Tech stack

```
React 19          — UI framework
Vite 8            — build tool + dev server
Material UI v9    — component library (Material Design 3 / Material You)
Emotion           — CSS-in-JS styling
vite-plugin-pwa   — service worker + web app manifest
```

No backend. No database. No auth. Pure client-side state — the entire game engine lives in a single `useGameState` reducer hook.

---

## Project structure

```
src/
├── game/
│   ├── constants.js      # Card definitions, PROPERTY_SETS rent table, COLOR_DISPLAY
│   ├── gameLogic.js      # Pure functions: deal, play, steal, pay debt, win check
│   └── useGameState.js   # useReducer-based game state machine
│
└── components/
    ├── game/
    │   ├── Card.jsx          # Renders all card types (property, money, action, rent, wild)
    │   ├── CardArt.jsx       # 28 inline SVG city landmark icons
    │   ├── CardHand.jsx      # Horizontal scrollable hand with fan layout
    │   ├── PlayerBoard.jsx   # Bank (left) + property sets (right) per player
    │   ├── ActionModal.jsx   # Bottom-sheet modals for all action phases
    │   ├── PassDeviceModal.jsx
    │   ├── GameLog.jsx
    │   └── WinScreen.jsx
    └── screens/
        ├── HomeScreen.jsx
        ├── SetupScreen.jsx
        └── GameScreen.jsx    # Main game loop — draw / play / discard phases
```

---

## Running locally

```bash
git clone https://github.com/satvik-jain-iitd/New-Repo.git
cd New-Repo
npm install
npm run dev
```

Open `http://localhost:5173` — works on desktop browser or point your phone to your local IP for mobile testing.

---

## Design decisions worth noting

**Game engine as a pure reducer** — all game state lives in one `useReducer` with a `PHASE` enum driving the turn machine (`DRAW → PLAY → DISCARD → ACTION_RESPONSE` etc.). No side effects inside the reducer; all random operations (shuffle, deal) happen in action creators before dispatch.

**No server needed for pass-and-play** — rather than build real-time sync (Firebase, WebSockets), the MVP uses a device-passing UX pattern. This keeps the app offline-capable and zero-infrastructure.

**Indian city mapping** — cities are assigned to color tiers based on real property market prestige: South Mumbai and Lutyens Delhi anchor the dark blue (most expensive) tier; Indore and Lucknow sit at brown (entry tier). Each city has a custom inline SVG landmark icon (Gateway of India, Lotus Temple, Charminar, etc.).

**Material You theming** — saffron `#E65100` as primary, warm cream `#FFF8F0` as background surface. All MUI component overrides live in `src/theme.js`. Card colors match the official Monopoly Deal palette exactly.

---

## Roadmap

- [ ] Online multiplayer (Firebase Realtime Database)
- [ ] Animated card play transitions
- [ ] Sound effects
- [ ] Tournament mode / leaderboard

---

Built by [Satvik Jain](https://github.com/satvik-jain-iitd)
