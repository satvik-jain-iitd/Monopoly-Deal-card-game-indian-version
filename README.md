# Dhandha — Monopoly Deal (Indian Edition)

**A production-grade Progressive Web App** — a complete digital adaptation of the Monopoly Deal card game, localised for an Indian audience. Built with React 19, Vite, and Material UI. Zero backend. Offline-capable. Installable on any device.

[Live Demo](https://satvik-jain-iitd.github.io/Monopoly-Deal-card-game-indian-version/) | [Deploy Preview](#)

---

## Why this project stands out

This is not a tutorial app or a toy project. It is a **fully-featured, rules-complete card game engine** with a polished mobile-first UI, originally built as a **pass-and-play PWA** and later extended with **real-time WebRTC multiplayer** and **custom card support**. It demonstrates proficiency across the full front-end stack:

| Area | What it shows |
|---|---|
| **React architecture** | Complex state machine with 40+ action types, 12+ game phases, deterministic reducer |
| **Real-time engineering** | WebRTC + WebSocket signalling, STUN/TURN, message queuing, auto-reconnect with exponential backoff |
| **PWA expertise** | Service worker, install prompt, offline support, asset caching, 64×64–512×512 icons |
| **UI/UX craftsmanship** | Mobile-first (375×667 baseline), consistent spatial map, Hinglish localisation, animated transitions |
| **Testing & debugging** | Headless simulation runner for deterministic game replay, 3-agent AI review pipeline (Tech Lead + QA + SDE) |
| **Engineering process** | Multi-agent AI workflow (plan → spec → implement → review → UAT), defence-in-depth on all rules |

---

## Architecture

### Game engine as a pure reducer

All game state lives in a single `useReducer` driven by a `PHASE` enum:

```
DRAW → PLAY → ACTION_RESPONSE / RENT_COLLECT / *_SELECT → INSURANCE_RESPONSE / JSN_RESPONSE → DISCARD → GAME_OVER
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
├── constants.js      # Source of truth: deck definition, rent tables, colour palette, custom cards
├── gameLogic.js      # Pure rules engine — deal, draw, rent, steal, pay, win check, phases
├── cardSort.js       # Display-only ordering helpers (never mutates game state)
├── scoring.js        # End-game ranking with 4-tier tiebreakers + point system
├── series.js         # localStorage-backed multi-game series standings
└── useGameState.js   # useReducer state machine — the only file with React hooks
```

### Card types

| Type | Count | Purpose |
|------|-------|---------|
| **Property** | 40 | Indian city properties across 10 colour sets |
| **Wild Property** | 6 | Multi-colour property cards |
| **Money** | 20 | Cash cards banked for payments |
| **Action** | 28 (standard) + 4 (custom) | Pass Go, Sly Deal, Forced Deal, Deal Breaker, Debt Collector, Birthday, House, Hotel, Double Rent, Just Say No, **Sabotage**, **Insurance** |
| **Rent** | 12 | Single-colour and wild rent cards |

**Total:** 106 standard cards. When custom cards are enabled (`customCards=true`, `playerCount>2`), 4 extra are added: 2× Insurance, 2× Sabotage.

### Multiplayer

The pass-and-play original was extended with real-time multiplayer via WebRTC:

- **WebSocket signalling** with connection state management (`CONNECTING → OPEN → CLOSED`)
- **Message queue** ensuring handshake packet (HELLO) is sent only when the socket is actually open — eliminating a fragile `setTimeout` race
- **Auto-reconnect** with exponential backoff: 1s → 2s → 4s → 8s, max 5 retries, capped at 30s
- **STUN server** (`stun:stun.l.google.com:19302`) for NAT traversal; `srflx` candidates preserved during SDP exchange
- **LAN (Hotspot) mode** via local WebSocket relay — no internet required

---

## Custom cards

### Sabotage ⚡ (Unblockable)
Force two opponents to swap one incomplete property each. The card is committed only when the swap is confirmed — cancelling the wizard leaves it in hand. Unblockable by design: no Just Say No, no Insurance can stop it.

### Insurance 🛡️
Play face-up on your board. When an opponent plays Deal Breaker against you, a popup asks "Use karein?" — accept to block the steal entirely (card discarded), or decline to proceed to JSN check. Can be played at any time during your turn.

### Just Say No (Extended)
Now works against **Sly Deal**, **Forced Deal**, AND **Deal Breaker** (previously only Sly Deal). During rent/birthday/debt payments, a full-width "Nahi!" button appears in the payment sheet.

---

## What I solved (real bugs, real fixes)

**Sprint 1 — Multiplayer extension (5 bugs):**

| # | Bug | Root cause | Fix |
|---|-----|-----------|-----|
| 1 | **Wild card colour stuck on board** | `assignedColor` was only written during play, never sent in render-phase state | Added `assignedColor` field to wild property objects; toggle button dispatches `CHANGE_WILD_COLOR` |
| 2 | **Deal Breaker not stealing** | Steal handler read `state.players` (pre-reducer clone) instead of `next.players` (mutated clone) | Changed all steal/payment references to use `next.players` |
| 3 | **Rent not enforcing on JSN-cancelled double** | JSN chain returned `newPhase` but kept `doubledRent = true` in next state | Reset doubledRent when JSN is accepted; set base rent as new target |
| 4 | **Deal Breaker JSN never fired** | JSN prompt condition checked `stealTarget` presence but phase transition skipped `ACTION_RESPONSE` | Phase transition routes through `ACTION_RESPONSE` with `debtTarget: stealTarget` |
| 5 | **Multiplayer connection flaky** | 600ms setTimeout for HELLO send + missing ICE candidates in SDP | Implemented `MessageQueue`; `stripSDP` preserves `host` + `srflx` candidates |

**Sprint 2 — Custom cards + hardening (4 bugs + 3 features):**

| # | Bug | Root cause | Fix |
|---|-----|-----------|-----|
| 6 | **Insurance_RESPONSE soft-lock** | `PHASE.INSURANCE_RESPONSE` missing from GameScreen render guard → modal never rendered, no buttons to click | Added phase to render guard list |
| 7 | **Sabotage card lost on Cancel** | Card committed to discard before wizard opened — Cancel couldn't undo | Deferred card commit to swap-execution (`SABOTAGE_SWAP`) instead of play |
| 8 | **Multiplayer: victim sees wrong modal** | `getActiveInteractorIdx` didn't handle `INSURANCE_RESPONSE` or targeted `ACTION_RESPONSE` | Added `targetPlayerId` routing for Sly/Forced/Deal Breaker + Insurance |
| 9 | **Sabotage dead-end with 1 opponent** | Wizard showed all opponents even those with no incomplete properties → player could get stuck | Added `validOpponents` filter + dead-end guard with Cancel-only |
| — | **JSN extended to all action cards** | JSN only worked for Sly Deal | Added JSN check + modal for Forced Deal and Deal Breaker paths |
| — | **PlayerContextView** | No visibility of hand/properties/bank during action selection | Added `PlayerContextView` to all 4 action sheets |
| — | **PaymentSheet JSN button** | Small inline JSN button was easy to miss | Full-width `size="large"` button with 🚫 icon |

Each fix was verified against a structured UAT checklist with explicit pass/fail criteria across a 3-agent AI review pipeline (Tech Lead + SDE2 + QA).

---

## Project structure

```
src/
├── App.jsx                          # Screen flow + series recording
├── game/
│   ├── constants.js                 # Deck definition, rent tables, colour palette, custom cards
│   ├── gameLogic.js                 # Pure rules engine — phases, rent, buildings
│   ├── cardSort.js                  # Display ordering helpers
│   ├── scoring.js                   # End-game ranking + points
│   ├── series.js                    # Multi-game series (localStorage)
│   └── useGameState.js              # Reducer state machine (40+ action types, 12 phases)
├── components/
│   ├── game/
│   │   ├── Card.jsx                 # Card renderer (all types, with gradient backgrounds)
│   │   ├── CardArt.jsx              # Inline SVG city landmark icons
│   │   ├── CardHand.jsx             # Ordered hand display with selection
│   │   ├── PlayerBoard.jsx          # Bank + property sets + buildings
│   │   ├── ActionModal.jsx          # Bottom-sheet action flows (10+ sub-components)
│   │   │   ├── BottomSheet          # Swipeable drawer wrapper
│   │   │   ├── CounterpartyStrip    # Compact opponent holdings summary
│   │   │   ├── PlayerContextView    # Hand + properties + bank snapshot
│   │   │   ├── ImpactBadge          # Set-completion hint per card
│   │   │   ├── PaymentSheet         # Rent/birthday/debt payment with asset selection
│   │   │   ├── StolenPropertySheet  # Sly Deal card picker
│   │   │   ├── ForcedDealSheet      # Two-way swap wizard
│   │   │   ├── SabotageSheet        # Four-step force-trade wizard
│   │   │   ├── JsnResponseSheet     # Just Say No counter modal
│   │   │   └── InsuranceSheet       # Insurance optional-use popup
│   │   ├── PassDeviceModal.jsx      # Turn handoff screen (pass-and-play)
│   │   └── GameLog.jsx              # Event log
│   ├── screens/
│   │   ├── HomeScreen.jsx
│   │   ├── SetupScreen.jsx
│   │   ├── GameScreen.jsx           # Main game loop with multiplayer routing
│   │   └── ResultsScreen.jsx        # Rankings + series standings
│   └── multiplayer/
│       ├── QRDisplay.jsx
│       └── QRScanner.jsx
└── multiplayer/
    ├── useWebRTC.js                 # WebRTC connection management
    ├── useMultiplayer.js            # WebSocket + state management
    └── rtcUtils.js                  # SDP utilities

## Worker (Cloudflare, optional)

```
worker/
├── index.js          # WebSocket signalling relay
└── wrangler.toml     # Cloudflare Workers config
```
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
- **110-card deck** (106 standard + 4 custom) with properties (Indian cities), money, action cards, and rent cards
- Rent, stealing, **Just Say No chains** (now works for Sly Deal, Forced Deal, AND Deal Breaker), houses/hotels — all official rules implemented
- **Custom cards** (playerCount > 2): **Sabotage** (unblockable force-trade between opponents) and **Insurance** (optional Deal Breaker block with popup)
- Multi-game series with frozen-board ranking and cumulative scoring

---

Built by [Satvik Jain](https://github.com/satvik-jain-iitd)
