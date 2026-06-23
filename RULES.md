# Rules & Lessons — Monopoly Deal

Append-only. One entry per mistake discovered during work. Build over time; never delete or summarize.

---

## Template

```yaml
- mistake: <description of what went wrong>
  root_cause: <why it happened>
  prevention_rule: <how to avoid next time>
  added_on: <YYYY-MM-DD>
```

---

## Lessons Logged

- mistake: Hand cards in ActionModal payment/selection sheets rendered as plain Typography boxes instead of colorful <Card> component, breaking strategic decision-making
  root_cause: Two read-only hand blocks (PaymentSheet + PlayerContextView) built inline Typography with bordered Box wrappers instead of reusing the existing <Card mini showValue /> pattern — even though Card was already imported and used for cash/property rows in the same file
  prevention_rule: Any place showing a hand card (even read-only) must reuse <Card card={card} mini showValue /> instead of inline Typography. Search for hand.map(card => in ActionModal/selection components before adding new blocks. Visual consistency = color per card type.
  added_on: 2026-06-20

- mistake: "Agent (Sonu + Aman) completed work and updated STATE.md without sending tmux notification to waiting agents (Sanika)"
  root_cause: "Assumed shared file visibility would alert waiting agents; did not realize agents cache file reads and miss background updates from other agents"
  prevention_rule: "EVERY agent, EVERY time work is done, MUST send direct tmux notification to ALL other team members. Non-negotiable. Checklist: (1) write to STATE.md, (2) send tmux msgs to both other agents with exact line reference. Read CLAUDE.md§AGENT COMPLETION CHECKLIST before finishing any work."
  incident: "monopoly-deal-fix-aii sprint, 2026-06-20 23:15–23:30 IST. Sonu signed off in STATE.md§156–179 + Aman signed off in STATE.md§125–154. Neither sent tmux notification. Sanika re-read STATE.md per Main's signal, found sign-offs, but only because Main detected silent write and manually escalated. Cost: 10+ min blockage. Bad precedent if repeated."
  added_on: 2026-06-20

- mistake: "Main (Claude Code) failed to launch agent CLIs correctly. Tried 'claude code' instead of 'opencode'; tried local tmux send without waiting for CLI initialization; did not understand that each agent needs a separate CLI instance in their tmux pane."
  root_cause: "Main did not have documented procedure for agent CLI launch. Made assumptions about command names and tmux automation without verifying against actual CLI behavior. Did not account for CLI initialization delay or need for cd to project root."
  prevention_rule: "BEFORE launching agents, read ~/.claude/team.yaml (agent_launch_procedure section) and project CLAUDE.md (Multi-Agent CLI Launch section). Use EXACT commands from documentation — no variations. Use 'opencode' for Sonu/Aman (Tech Lead / SDE2), 'agy' for Sanika (SDE1, fallback to opencode if quota exceeded). Always sleep 3 seconds after each launch to allow CLI initialization. Always verify with tmux capture-pane before assuming agent is ready."
  incident: "2026-06-21 11:00-11:10 IST. Main tried 'claude code' + failed. User had to manually launch 'opencode' in all three panes. Root cause: no documented procedure existed. Solution: added agent_launch_procedure to team.yaml + Multi-Agent CLI Launch section to CLAUDE.md with EXACT commands and sleep timing."
  added_on: 2026-06-21

- mistake: "Original plan called for mount-useEffect + setScreen to restore game state, causing 1-frame home screen flash before game appears"
  root_cause: Assumed setScreen must be called imperatively after state init. Did not realize useState can derive initial value from sync localStorage read at component top level.
  prevention_rule: "For sync-capable persistence (localStorage), use `useRef(loadGame())` + `useState(ref ? 'target' : 'default')` pattern. This sets both state AND screen before first render — zero flash. Reserve mount-useEffect + setScreen for async persistence (IndexedDB, network) where the init value isn't available synchronously. This pattern was used in monopoly-deal game-progress-persistence and eliminated the 1-frame flicker entirely."
  added_on: 2026-06-21
  deprecation_note: "Auto-persistence was removed on 2026-06-22 (Part A: session picker replaced auto-restore). The zero-flash pattern is no longer used in App.jsx — sessions are now manually selected via HomeScreen. Rule preserved for reference if sync persistence is re-added."

- mistake: "Auto-persistence (localStorage) caused game state leak across browser profiles on shared devices. Link sharing exposed saved games to unintended users."
  root_cause: "localStorage is per-origin per-browser, NOT per-user. App auto-saved after every action and auto-restored on load, with no user isolation."
  prevention_rule: "For client-only PWAs, never auto-save + auto-restore game state without user confirmation. If you need session persistence: (1) use a manual session picker UI where user selects which session to resume, (2) cap at 5 sessions, (3) never auto-navigate to game screen from saved state. For multiplayer, move state to server-side (Durable Objects SQLite) where it's isolated per-room, not per-browser."
  added_on: 2026-06-22
  phase: "post-ship reflection"

- mistake: "Double Rent card could be played even when player had no Rent card in hand or <2 plays remaining, wasting the card"
  root_cause: No validation guards on DOUBLE_RENT — neither in UI layer (PlayOptions) nor reducer layer (useGameState.js handler). Assumed player would always play Double Rent correctly, ignoring the follow-up Rent requirement.
  prevention_rule: "For action cards that require a follow-up card (like Double Rent → Rent), always add dual-layer guards: (1) reducer-level early return to prevent invalid state, (2) UI-level disabled button with reason text. The two guards are independent — one is defense-in-depth for the other. The reason text in UI should be specific ('Rent card nahi hai haath mein') not generic ('Cannot play')."
  added_on: 2026-06-22

- mistake: "Selected card translateY(-10px) lift + orange outline clipped inside CardHand container"
  root_cause: "Setting overflowX: 'auto' caused CSS to implicitly set overflowY: 'auto' (CSS spec: if one axis is not 'visible', the other cannot be 'visible'). This clipped the upward translate and outline at the container boundary."
  prevention_rule: "Whenever overflowX is set to any value other than 'visible' in a scrolling container that also contains elements with vertical transforms (translateY, scale transforms), always explicitly set overflowY: 'visible' to prevent the implicit CSS cascade from clipping the upward lift. This applies to any card/selection UI where selected cards rise above the row."
  added_on: 2026-06-23

- mistake: "endTurn() left stale PLAY turnTimeout/turnStartedAt in game state after advancing to DRAW phase, causing ~1 frame of a 90s timer in the DRAW UI before startTurn() reset it"
  root_cause: "Turn state fields (turnTimeout, turnStartedAt) were only initialized in initGame() and reset in startTurn(). endTurn() advanced the phase and player index but did not touch timer fields, letting the previous PLAY timeout leak into DRAW."
  prevention_rule: "Whenever game state has phase-dependent derived fields (like timer data), every function that changes the phase must also update those fields to match the new phase. In reactive UI, stale derived fields will render for at least one frame before the correct function (startTurn in this case) overwrites them. Apply the 'update on every phase change' rule."
  added_on: 2026-06-23

- mistake: "Timer color thresholds were specified as absolute seconds (>45s green, 22-45s amber, <22s red), which only works for 90s PLAY timer — for 30s DRAW timer it can never be >45s"
  root_cause: "Spec wrote absolute thresholds tuned to PLAY duration without considering DRAW's shorter 30s window. Absolute thresholds don't generalize across timer durations."
  prevention_rule: "For any UI component that renders different timer durations, use percentage-based thresholds (>50%, 25-50%, <25%) instead of absolute time values. Percentage-based thresholds automatically adapt to any duration and maintain consistent visual meaning (half+ remaining = green, quarter+ = amber, critical = red)."
  added_on: 2026-06-23

- mistake: "cloudflared tunnel route dns added a CNAME under the wrong Cloudflare account because it used the default cert.pem for API auth, not the tunnel credentials file"
  root_cause: "cloudflared tunnel route dns authenticates via cert.pem (linkright account). The tunnel credentials file (letsdwelo account) is only for tunnel runtime auth, not API operations."
  prevention_rule: "For DNS management on different Cloudflare accounts, never use cloudflared tunnel route dns from a server authenticated to a different account. Either: (1) use Cloudflare API directly with an API token for the target account, (2) login cloudflared separately for each account, or (3) add DNS records via Cloudflare Dashboard."
  added_on: 2026-06-23

- mistake: "PM2 cloudflared start command omitted --credentials-file, causing the tunnel to use default cert.pem auth and default ingress config (port 8000) instead of the correct tunnel/port"
  root_cause: "cloudflared launched as 'pm2 start cloudflared -- tunnel run' without UUID or credentials. This reverted to cert.pem-based auth even though config file declared the correct tunnel."
  prevention_rule: "When starting a cloudflared tunnel via PM2, always specify: --credentials-file + tunnel UUID. Full command: pm2 start cloudflared --name <name> -- --credentials-file <path.json> tunnel run <uuid>. Verify config.yml has correct ingress rules for THIS tunnel — replacing default config.yml breaks other tunnels."
  added_on: 2026-06-23

- mistake: "HOST_CHANGED handler only degraded old host to guest but never upgraded a guest to new host, leaving the promoted player stuck in guest mode"
  root_cause: "Handler was written with only one if-branch (host→guest). The reverse transition (guest→host) was simply not considered."
  prevention_rule: "For any multi-role state message handler that changes actor identity, always write ALL state transitions explicitly — both upgrade and downgrade paths. The transition matrix helps: enumerate currentRole × newRole → action. If only one transition is handled, the reverse is a guaranteed bug."
  added_on: 2026-06-23

- mistake: "handleMessage useCallback closed over mpGuestState but didn't include it in deps array — when HOST_CHANGED arrived, the callback might read stale state"
  root_cause: "React's useCallback captures closure variables at creation time. Adding state vars to deps causes re-creation on every update, which breaks WS message subscription. Used mpGuestState from closure instead of a ref."
  prevention_rule: "When a stable callback (like a WS message handler) needs the latest value of a frequently-changing state variable, use a useRef to store it and read ref.current at access time. This avoids: (1) stale closure reads, (2) unnecessary useCallback re-creation, (3) WS re-subscription churn. Pattern: write to ref.current alongside setState, read ref.current inside callback."
  added_on: 2026-06-23

- mistake: "Race condition: HOST_CHANGED could arrive before the newly-promoted player's first GAME_STATE, leaving them with no game state to init"
  root_cause: "Host disconnect and state broadcast are async. A player who just joined mid-game (no mpGuestState yet) could be promoted before receiving their first GAME_STATE packet."
  prevention_rule: "When a handler depends on state data that arrives via a different message type, use a pending/init flag pattern: (1) set a ref flag when data isn't available yet, (2) check the flag in the message handler that delivers the required data, (3) clear the flag after dispatch. This handles inter-message race conditions without coupling message ordering."
  added_on: 2026-06-23

- mistake: "Error 1033 persisted 15+ min because tunnel was connected but using wrong ingress config (oracle-linkright port 8000 instead of dhandha port 3001)"
  root_cause: "Tunnel connections register successfully even with wrong ingress rules. Tunnel health metrics look fine, but traffic doesn't reach the correct local service."
  prevention_rule: "When debugging tunnel error 1033: (1) verify tunnel connections are registered, (2) verify ingress rules match the local service port, (3) test local service directly (curl localhost:PORT/health), (4) check config.yml is the one actually being used. Never assume connected tunnel = correctly routing traffic."
  added_on: 2026-06-23
