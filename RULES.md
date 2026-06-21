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

## Example Entry (DELETE once first real entry exists)

```yaml
- mistake: Assumed bd command syntax from memory without reading help first
  root_cause: Skipped `bd --help` on first use, trusted prior knowledge
  prevention_rule: Always run help_command before first tool usage in session; check tools.yaml
  added_on: 2026-06-20
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
