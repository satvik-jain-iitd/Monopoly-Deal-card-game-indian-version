# Dhandha 🎴

> **India ka apna property card game** — a full-featured *Monopoly Deal* clone built as an installable Progressive Web App. Pass one phone around the table; no install, no signup, no server.

**Live demo → [satvik-jain-iitd.github.io/Monopoly-Deal-card-game-indian-version](https://satvik-jain-iitd.github.io/Monopoly-Deal-card-game-indian-version/)**

---

## Table of contents

- [What is this?](#what-is-this)
- [How to play](#how-to-play)
- [Rules implemented](#rules-implemented)
- [The deck (106 cards)](#the-deck-106-cards)
- [Indian city map](#indian-city-map)
- [UX & design decisions](#ux--design-decisions)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Project structure](#project-structure)
- [Running locally](#running-locally)
- [Roadmap](#roadmap)

---

## What is this?

Dhandha is a digital adaptation of **Monopoly Deal** — the fast card game where the first player to complete **3 full property sets** wins. It is built specifically for **pass-and-play on a single mobile phone**: the device is handed around the table and each player's hand stays hidden until it's their turn.

Everything is localised for an Indian audience:

- All properties are **real Indian cities**, mapped to colour tiers by real-world property-market prestige (South Mumbai & Lutyens Delhi at the top; Indore & Lucknow at the entry tier).
- The interface is in **Hinglish** (Hindi + English).
- Currency is **₹ Crore** (₹Cr).
- The visual language is a warm saffron Material You palette with custom inline-SVG city landmarks.

---

## How to play

1. **Setup** — choose **2–6 players** and enter names.
2. **Pass the device** — a hand-off screen hides the previous player's cards. The new player taps "Ready" to reveal their hand.
3. **Draw** — start your turn by drawing **2 cards** (or **5** on your very first turn if your hand is empty).
4. **Play up to 3 cards** per turn. Each card can be used in one of several ways:
   - **Money card** → into your **bank** (cash for paying debts).
   - **Action card** → play its **action**, *or* bank it as money for its printed value.
   - **Rent card** → **charge rent** on a colour you own, *or* bank it as money.
   - **Property / Wild property** → place into your **property area**. *(Property cards can never be banked.)*
5. **End your turn.** If you're holding **more than 7 cards**, you discard down to 7; otherwise the turn passes straight to the next player.
6. **Win** by being the first to lay down **3 complete property sets**.

---

## Rules implemented

| Rule | Behaviour |
|---|---|
| **Turn structure** | Draw 2 (5 on an empty opening hand) → play up to 3 → discard to 7 |
| **Win condition** | First to **3 complete sets** wins (checked after every state change) |
| **Bank** | Money + action/rent cards played for value. **Properties can never be banked.** |
| **Rent** | Charged on a colour you own; amount scales with set size + houses/hotels |
| **Double The Rent** | Doubles the next rent you charge this turn (consumes a play) |
| **Just Say No** | Cancels an action targeted at you (playable from the payment prompt) |
| **Deal Breaker** | Steal an opponent's **complete** set (with its buildings) |
| **Sly Deal** | Steal a single property from an **incomplete** set |
| **Forced Deal** | Swap one of your properties for an opponent's (from an incomplete set) |
| **Debt Collector** | Demand ₹5Cr from one chosen player |
| **Birthday** | Every other player pays you ₹2Cr |
| **Pass Go** | Draw 2 extra cards |
| **House / Hotel** | Add to a **complete** set to boost its rent (hotel needs a house first) |
| **Wild properties** | Assigned a colour when played; full wilds can be any colour |
| **Paying debts** | Pay from bank and/or properties; property given in payment **leaves play** (it is never converted to your cash) |

> **Card conservation:** every transfer (banking, property play, steals, swaps, payments) is move-only — the deck total stays at exactly **106** for the whole game.

---

## The deck (106 cards)

| Group | Count | Detail |
|---|---:|---|
| **Properties** | 28 | Brown ×2, Light Blue ×3, Pink ×3, Orange ×3, Red ×3, Yellow ×3, Green ×3, Dark Blue ×2, Stations ×4, Utilities ×2 |
| **Wild properties** | 10 | 2 full wilds + 8 two-colour wilds |
| **Money** | 20 | ₹10 ×1, ₹5 ×2, ₹4 ×3, ₹3 ×3, ₹2 ×5, ₹1 ×6 |
| **Action** | 35 | Pass Go ×10, Debt Collector / Forced Deal / Sly Deal / Birthday / Just Say No / House / Hotel ×3 each, Deal Breaker / Double Rent ×2 each |
| **Rent** | 13 | 5 colour-pair rents ×2 + 3 wild rents |
| **Total** | **106** | |

### Set sizes & rent ladders

| Colour | Cards needed | Rent ladder (₹Cr) | +House | +Hotel |
|---|:--:|---|:--:|:--:|
| Brown | 2 | 1 → 2 | +3 | +4 |
| Light Blue | 3 | 1 → 2 → 3 | +4 | +5 |
| Pink | 3 | 1 → 2 → 4 | +4 | +5 |
| Orange | 3 | 1 → 3 → 5 | +4 | +5 |
| Red | 3 | 2 → 3 → 6 | +4 | +5 |
| Yellow | 3 | 2 → 4 → 6 | +4 | +5 |
| Green | 3 | 2 → 4 → 7 | +4 | +5 |
| Dark Blue | 2 | 3 → 8 | +4 | +5 |
| Stations | 4 | 1 → 2 → 3 → 4 | — | — |
| Utilities | 2 | 1 → 2 | — | — |

---

## Indian city map

Cities are assigned to colour tiers by real-world property prestige:

- 🟤 **Brown** (₹1Cr) — Indore, Lucknow
- 🔵 **Light Blue** (₹1Cr) — Chandigarh, Bhopal, Kochi
- 🟣 **Pink** (₹2Cr) — Jaipur, Ahmedabad, Kolkata
- 🟠 **Orange** (₹2Cr) — Chennai, Hyderabad, Noida
- 🔴 **Red** (₹3Cr) — Pune, Bengaluru, Gurugram
- 🟡 **Yellow** (₹3Cr) — Goa, Coimbatore, Vizag
- 🟢 **Green** (₹4Cr) — New Delhi, Navi Mumbai, Thane
- 🔵 **Dark Blue** (₹4Cr) — South Mumbai, Lutyens Delhi
- 🚂 **Stations** (₹2Cr) — Mumbai Local, Delhi Metro, Namma Metro, Howrah Express
- 💡 **Utilities** (₹2Cr) — Power Grid, Water Works

Each city has its own inline-SVG landmark icon rendered in `CardArt.jsx`.

---

## UX & design decisions

The interface is designed for a **small phone (≈375×667, iPhone 6/7-class)** and around the question *"what is the player actually looking at right now?"*

- **Information hierarchy by attention.** On your turn you mostly ask *"what can I play?"* — so the **hand is the star**: it has the biggest cards and is pinned, fully visible, at the bottom. Your own **board scrolls** above it. Opponents and the play pile stay glanceable.

- **One consistent spatial map, everywhere.** Every surface that shows cards — your hand, the payment sheet, the Sly/Forced Deal sheets, and all player boards — uses the same ordering: **cash on the left → action/rent (special) in the middle → properties on the right, grouped by colour.** Wild properties sit next to a colour you already hold (or cluster together if there's no match). Learning the layout once means you reuse it on every screen. *(See `src/game/cardSort.js`.)*

- **Bank left, properties right.** Mirrors how the physical game is laid out in front of each player. Bank shows a prominent total plus a denomination breakdown; each property group shows live set-progress (X/Y, ✓) and current rent.

- **Persistent play zone.** The centre of the screen is the shared **discard pile** (bound to game state, never auto-cleared). A freshly played action/rent card pops in and **stays** with a stacked-pile depth effect and a live card count — so the table reads like a live, ongoing game rather than a flash that vanishes.

- **Peek at opponents during actions.** When resolving a Forced Deal or Sly Deal you can expand every opponent's board inline, so you can see what they hold before deciding what to give or take.

- **Tap any colour group** to open a full rent table for that colour, with your current tier highlighted.

- **No dead-end screens.** The discard step is skipped entirely when your hand is already ≤ 7 after your final play.

- **Rectangular cards, minimal corner radius** so no printed detail is clipped; Utility (teal) and Green are deliberately distinct shades.

---

## Tech stack

```
React 19          — UI framework
Vite 8            — build tool + dev server
Material UI v9    — component library (Material Design 3 / Material You)
Emotion           — CSS-in-JS styling
vite-plugin-pwa   — service worker + web app manifest
```

No backend. No database. No auth. Pure client-side state — the entire game engine is a single reducer.

---

## Architecture

**Game engine as a pure reducer.** All game state lives in one `useReducer` (`src/game/useGameState.js`) driven by a `PHASE` enum (`DRAW → PLAY → ACTION_RESPONSE / RENT_COLLECT / *_SELECT → DISCARD → GAME_OVER`). The reducer is deterministic — every case deep-clones state and returns the next state with no side effects. All randomness (shuffle, deal) happens in `gameLogic.js` helpers called before/inside dispatch.

**Pure logic vs. display.**
- `src/game/gameLogic.js` — the rules: deal, draw, bank, play property, rent maths, steals, swaps, payments, win check. All pure functions.
- `src/game/cardSort.js` — display-only ordering helpers (`orderHandCards`, `orderPropertyColors`, `groupedBank`). These never mutate game state; they only decide render order so every screen looks consistent.
- `src/game/constants.js` — the deck definition, colour palette, and `PROPERTY_SETS` rent tables (single source of truth).

**No server for pass-and-play.** Instead of real-time sync, the app uses a device-passing UX with a hand-hiding screen between turns. This keeps it offline-capable and zero-infrastructure.

**Defense-in-depth on rules.** Illegal moves (e.g. banking a property) are blocked both in the UI *and* in the engine, so no code path can reach an invalid state.

---

## Project structure

```
src/
├── game/
│   ├── constants.js      # Deck, COLOR_DISPLAY, PROPERTY_SETS rent tables
│   ├── gameLogic.js      # Pure rules: deal, play, rent, steal, pay, win check
│   ├── cardSort.js       # Display ordering: hand / properties / bank
│   └── useGameState.js   # useReducer game state machine (PHASE-driven)
│
└── components/
    ├── game/
    │   ├── Card.jsx          # Renders every card type (property/money/action/rent/wild)
    │   ├── CardArt.jsx       # Inline SVG city landmark icons
    │   ├── CardHand.jsx      # Horizontal, consistently-ordered hand
    │   ├── PlayerBoard.jsx   # Bank (left) + property sets (right); compact & full modes
    │   ├── ActionModal.jsx   # Bottom-sheet flows for every action/response phase
    │   ├── PassDeviceModal.jsx
    │   ├── GameLog.jsx
    │   └── WinScreen.jsx
    └── screens/
        ├── HomeScreen.jsx
        ├── SetupScreen.jsx
        └── GameScreen.jsx    # Main loop: draw / play / discard + persistent play zone
```

---

## Running locally

```bash
git clone https://github.com/satvik-jain-iitd/Monopoly-Deal-card-game-indian-version.git
cd Monopoly-Deal-card-game-indian-version
npm install
npm run dev
```

Open `http://localhost:5173` — works in a desktop browser, or point your phone at your machine's local IP for real-device testing. For the best feel, emulate an iPhone SE/6/7 viewport in DevTools.

```bash
npm run build     # production build into dist/
npm run preview   # serve the production build locally
```

---

## Roadmap

- [ ] Online multiplayer (Firebase Realtime Database)
- [ ] Animated card-to-board transitions
- [ ] Sound effects
- [ ] Tournament mode / leaderboard

---

Built by [Satvik Jain](https://github.com/satvik-jain-iitd)
