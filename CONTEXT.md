# Project Context — Monopoly Deal (Indian Version)

## Project

**Name:** Monopoly Deal (Indian Version, "Dhandha")
**Objective:** React + Vite PWA implementing the Monopoly Deal card game with pass-and-play LAN and WebRTC multiplayer support. Full game rules, action modals, and player scoring via immutable state management.

## Problem

Players need a digital card game platform that supports three play modes: local (pass-and-play), LAN (QR-pairing via WebRTC), and (future) online multiplayer. Game state must be synchronized across devices, actions must be validated, and special cards (Sabotage, Insurance, custom rules for 3+ players) must be enforced. UI must show hand, properties, bank, and contextual action modals per game phase.

**Target Users:**
- Casual players (family game nights, friends)
- Platform: Mobile (iOS/Android PWA) + Desktop

**Pain Points:**
- Multiplayer sync failures (before Durable Object rewrite)
- Pass-and-play privacy (opponent sees hand during setup)
- Missing Sabotage card implementation
- Ambiguous action UI (which cards am I seeing? whose properties?)

## Success

**Acceptance Criteria:**
1. Pass-and-play mode works without privacy leaks (modal hides opponent hand)
2. WebRTC pairing works peer-to-peer via QR, with room fallback via signaling server
3. All 8 action modals display correct card context (hand, own properties, opponent properties per action)
4. Sabotage card swaps target's property with multi-opponent selection logic
5. Deal Breaker + Just Say No blocking behavior confirmed
6. Insurance blocks Deal Breaker only (not Sly/Forced Deal); optional pop-up
7. Scoring phase calculates property sets correctly and ranks players
8. Custom 3+ player deck (110 cards with Sabotage + Insurance) works in multiplayer
9. Full PWA (installable, offline fallback, service worker)
10. Beads issue tracking in sync; no 6th markdown file

## Constraints

**Technical:**
- React 19 + Vite 8 (ESM only)
- MUI 9 + Emotion for styling
- useReducer for immutable state (no Redux)
- WebRTC for P2P (no relay unless signaling required)
- Cloudflare Durable Objects for multiplayer room state (new, post-sprint-1)
- GitHub Pages static hosting (no server-side code in main build)

**Business:**
- Free-to-play, no monetization
- No authentication (localStorage for config only)
- No backend database (room state ephemeral via Durable Objects)

**Timeline:**
- Sprint 1 (Jun 17-20): Core game, pass-and-play, privacy + action UI fixes
- Sprint 2 (pending): Sabotage + Insurance, 3+ player custom deck, full multiplayer sync

## Architecture

Generated from GitNexus knowledge graph (38 processes, 24 communities, 798 symbols, 1185 relationships).

### Overview

React + Vite PWA implementing the Monopoly Deal card game with pass-and-play LAN and WebRTC multiplayer. State is managed via `useReducer` in `useGameState.js` — each game action dispatches through a central immutable reducer. UI renders in `GameScreen.jsx` with contextual action modals.

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19, Vite 8 |
| UI | MUI 9, Emotion |
| State | useReducer (useGameState.js) |
| PWA | vite-plugin-pwa, @vite-pwa/assets-generator |
| Multiplayer | WebRTC (manual offer/answer via QR), Node.js signaling server |
| Simulation | Node.js headless runner (scripts/simulate.js) |
| Deploy | GitHub Pages (static), Netlify, Cloudflare Worker (signaling relay) |

### Functional Areas

GitNexus detected 24 communities. The major ones:

| Area | Symbols | Cohesion | Key Files |
|------|---------|----------|-----------|
| **Core Game Engine** | 15 | 0.91 | `useGameState.js` (reducer), `gameLogic.js` (rules) |
| **Game UI** | 14 | 0.78 | `ActionModal.jsx`, `PlayerBoard.jsx`, `Card.jsx` |
| **Multiplayer** | 14 | 1.00 | `useWebRTC.js`, `useMultiplayer.js`, `rtcUtils.js` |
| **Scoring** | 11 | 0.96 | `scoring.js` (rankAndScore, compareSnapshots) |
| **Multiplayer UI** | 9 | 1.00 | `QRDisplay.jsx`, `QRScanner.jsx`, `LobbyScreen.jsx` |
| **Screen Routing** | 8 | 0.96 | `App.jsx`, `HomeScreen.jsx`, `GameScreen.jsx` |
| **Scripts** | 5 | 0.73 | `scripts/simulate.js`, `scripts/run-sim.mjs` |

### File Structure

```
src/
├── main.jsx                          # Entry point
├── App.jsx                           # Root + screen routing + multiplayer orchestration
├── theme.js                          # MUI theme
├── game/
│   ├── constants.js                  # 110 cards, deck creation, card IDs
│   ├── gameLogic.js                  # initGame, checkWinner, applyPayment, isSetComplete
│   ├── useGameState.js               # gameReducer — ALL game state transitions
│   ├── scoring.js                    # rankAndScore, pointsForPosition, compareSnapshots
│   ├── cardSort.js                   # Card sorting helpers
│   ├── series.js                     # Property set validation
│   └── sounds.js                     # SFX triggers
├── multiplayer/
│   ├── useWebRTC.js                  # PeerConnection lifecycle, data channels
│   ├── useMultiplayer.js             # Connection manager, room state
│   └── rtcUtils.js                   # ICE helpers, offer/answer parsing
├── components/
│   ├── game/
│   │   ├── ActionModal.jsx           # 8 action sheets (Sly Deal, Forced Deal, etc.)
│   │   ├── Card.jsx / CardArt.jsx    # Card face rendering
│   │   ├── CardHand.jsx              # Hand display
│   │   ├── PlayerBoard.jsx           # Property display per player
│   │   ├── GameLog.jsx               # Action log
│   │   └── PassDeviceModal.jsx       # Turn handoff in pass-and-play
│   ├── multiplayer/
│   │   ├── QRDisplay.jsx             # Outgoing WebRTC offer as QR
│   │   └── QRScanner.jsx             # Incoming WebRTC offer scan
│   └── screens/
│       ├── HomeScreen.jsx            # Mode picker (pass-and-play / LAN / online)
│       ├── SetupScreen.jsx           # Game config (players, custom cards toggle)
│       ├── LocalMultiplayerSetupScreen.jsx
│       ├── MultiplayerSetupScreen.jsx
│       ├── OfflineSetupScreen.jsx    # WebRTC pairing flow
│       ├── LobbyScreen.jsx           # Room-based waiting
│       ├── GameScreen.jsx            # Main game loop
│       └── ResultsScreen.jsx         # Final standings
├── server/
│   └── index.js                      # Node.js signaling server
└── worker/
    ├── index.js                      # Cloudflare Workers signaling relay
    └── wrangler.toml
```

### Key Execution Flows

#### 1. Start Game (`StartGame → Id` — 5 steps)

```
startGame (useGameState.js)
  └→ initGame (gameLogic.js) — shuffle players, deal 5 cards each
      └→ createDeck (constants.js) — build 106/110-card deck
          └→ makeProp (constants.js) — property card entries
              └→ id (constants.js) — card ID constants
```

#### 2. Game Action → Winner Check (`GameReducer → IsSetComplete` — 4 steps)

```
gameReducer (useGameState.js)
  └→ checkWinner (gameLogic.js) — does any player have 3+ complete sets?
      └→ countCompleteSets (gameLogic.js)
          └→ isSetComplete (gameLogic.js)
```

This flow runs after EVERY dispatched action. The reducer dispatches `{ type: "CHECK_WINNER" }` after mutations, which triggers the win condition check.

#### 3. Deal Breaker Steal (`ExecuteDealBreakerSteal → IsSetComplete` — 4 steps)

```
executeDealBreakerSteal (useGameState.js)
  └→ checkWinner (gameLogic.js)
      └→ countCompleteSets (gameLogic.js)
          └→ isSetComplete (gameLogic.js)
```

#### 4. Rent Payment (`ApplyPayment → IsSetComplete` — 3 steps)

```
applyPayment (gameLogic.js)
  └→ deactivateBuildings (gameLogic.js)
      └→ isSetComplete (gameLogic.js)
```

#### 5. Multiplayer Room Setup (`HandleRoomReady → Send` — 3 steps)

```
handleRoomReady (App.jsx)
  └→ connect (useMultiplayer.js)
      └→ send (useMultiplayer.js) — relay game state via data channel
```

#### 6. Offline (WebRTC) Pairing (`OfflineSetupScreen → NextPeerId` — 4 steps)

```
OfflineSetupScreen (JSX)
  └→ handleNameSubmit
      └→ createOffer (useWebRTC.js)
          └→ nextPeerId (useWebRTC.js)
```

### Mermaid Architecture Diagram

```mermaid
graph TB
    subgraph "Entry"
        main["main.jsx"] --> App["App.jsx"]
    end

    subgraph "Screens"
        Home["HomeScreen"]
        Setup["SetupScreen"]
        GameScreen["GameScreen"]
        Results["ResultsScreen"]
        Lobby["LobbyScreen"]
        OfflineSetup["OfflineSetupScreen"]
    end

    subgraph "Game Engine"
        reducer["useGameState.js<br/>(gameReducer)"]
        logic["gameLogic.js<br/>(initGame, checkWinner, etc.)"]
        constants["constants.js<br/>(deck, cards)"]
        scoring["scoring.js"]
    end

    subgraph "UI Components"
        ActionModal["ActionModal.jsx<br/>(8 action sheets)"]
        PlayerBoard["PlayerBoard.jsx"]
        Card["Card.jsx / CardArt.jsx"]
        CardHand["CardHand.jsx"]
        GameLog["GameLog.jsx"]
    end

    subgraph "Multiplayer"
        WebRTC["useWebRTC.js"]
        Multiplayer["useMultiplayer.js"]
        RTCUtils["rtcUtils.js"]
        QRDisplay["QRDisplay.jsx"]
        QRScanner["QRScanner.jsx"]
    end

    subgraph "Network Layer"
        SignalingServer["server/index.js<br/>(Node.js)"]
        CFWorker["worker/index.js<br/>(Cloudflare)"]
    end

    subgraph "Deploy"
        GHPages["GitHub Pages"]
        Netlify["Netlify"]
    end

    %% Screen routing
    App --> Home
    Home --> Setup
    Setup --> GameScreen
    GameScreen --> Results
    Home --> OfflineSetup
    OfflineSetup --> GameScreen
    Home --> Lobby
    Lobby --> GameScreen

    %% Game engine calls
    GameScreen --> reducer
    GameScreen --> ActionModal
    GameScreen --> PlayerBoard
    GameScreen --> CardHand
    GameScreen --> GameLog
    reducer --> logic
    reducer --> constants
    App --> scoring

    %% Component hierarchy
    CardHand --> Card
    PlayerBoard --> Card

    %% Multiplayer wiring
    App --> Multiplayer
    Multiplayer --> WebRTC
    WebRTC --> RTCUtils
    OfflineSetup --> WebRTC
    Lobby --> Multiplayer
    QRDisplay --> WebRTC
    QRScanner --> WebRTC

    %% Network
    WebRTC <--> SignalingServer
    WebRTC <--> CFWorker
    SignalingServer -.->|Offer/Answer| WebRTC

    %% Deploy
    GHPages -.->|Static build| dist/
    Netlify -.->|Static build| dist/

    style reducer fill:#e1f5fe
    style logic fill:#e1f5fe
    style ActionModal fill:#fff3e0
    style WebRTC fill:#e8f5e9
    style SignalingServer fill:#f3e5f5
    style CFWorker fill:#f3e5f5
    style GameScreen fill:#fff9c4
```

### State Flow

```
User Action (click card)
  → GameScreen.handleCardSelect(phase, card)
    → useGameState.dispatch(action)
      → gameReducer(state, action)
        → mutateState (immutable, spread)
        → checkWinner
          → dispatch CHECK_WINNER if triggered
      → re-render via React
```

### Game Phases (defined in constants.js)

| Phase | Description |
|-------|-------------|
| DRAW | Draw 2 cards |
| PLAY_ACTION | Play action/modifier card |
| DISCARD | Discard to hand limit (7) |
| SABOTAGE_SWAP | Target selects property to lose |
| INSURANCE_RESPONSE | Target chooses to use/decline Insurance |
| PAYMENT | Debtor pays rent |
| ACTION_RESPONSE | Target receives action (Sly Deal, Forced Deal, Deal Breaker) |

### Custom Cards (Sprint 2)

| Card | Behavior |
|------|----------|
| Sabotage | Unblockable — target loses one incomplete property. Replaces Trade Route. |
| Insurance | Blocks Deal Breaker only (optional pop-up). Consumed on use. |

Custom cards only appear when `playerCount > 2`. Both cards are excluded from the standard 106-card deck — total deck = 110 with custom toggle.

## Decisions

Durable architecture/tech decisions. Append dated entries below — never delete old ones, mark superseded ones with `[SUPERSEDED — see <date>]` instead.

| Date | Decision | Why |
|------|----------|-----|
| 2026-06-20 | Multiplayer relay rewritten as a Cloudflare Durable Object (`RoomDO`, one instance per room via `getByName`) using the Hibernatable WebSockets API. | Plain in-memory `Map` in the Worker had no cross-isolate affinity — host and guest could land on different edges, breaking roster sync. |
| 2026-06-20 | 3-file project memory system (CONTEXT.md / STATE.md / RULES.md) replaces 5-file protocol. All architecture, problem, decisions live in CONTEXT.md; execution state + handoffs in STATE.md; lessons in RULES.md. | Simpler coordination, faster handoffs, less file churn. Beads owns task tracking; STATE.md owns execution state. |
