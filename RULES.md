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
