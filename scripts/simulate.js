// Headless game simulator + invariant checker.
// Drives the REAL reducer with an automated legal-move agent, plays many
// 6-player games, and verifies invariants after every dispatch.
//
// Run via: npm run simulate   (bundled through rolldown so Vite-style
// extensionless imports resolve outside the browser).

import { patchedGameReducer as reduce } from '../src/game/useGameState.js'
import { initGame, PHASE, isSetComplete } from '../src/game/gameLogic.js'
import { CARD_TYPES, ACTION_TYPES, PROPERTY_SETS, COLORS } from '../src/game/constants.js'

// ── RNG (seeded, so failures are reproducible) ─────────────────────
function makeRng(seed) {
  let x = seed >>> 0
  return () => {
    x ^= x << 13; x >>>= 0
    x ^= x >> 17
    x ^= x << 5; x >>>= 0
    return x / 4294967296
  }
}
const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)]

// ── Invariants ─────────────────────────────────────────────────────
const EXPECTED_TOTAL = (customCards) => (customCards ? 108 : 106)

function allCards(s) {
  const out = []
  out.push(...s.deck, ...s.discard)
  for (const p of s.players) {
    out.push(...p.hand, ...p.bank)
    for (const color of Object.keys(p.properties)) out.push(...p.properties[color])
    if (p.insurance) out.push(p.insurance)
  }
  return out
}

function checkInvariants(s, ctx, customCards) {
  const errors = []
  const cards = allCards(s)

  // 1. Card conservation (count)
  if (cards.length !== EXPECTED_TOTAL(customCards)) {
    errors.push(`CARD COUNT: ${cards.length} != ${EXPECTED_TOTAL(customCards)}`)
  }
  // 2. No duplicate card IDs (a card existing in two zones)
  const ids = new Set()
  for (const c of cards) {
    if (ids.has(c.id)) errors.push(`DUPLICATE CARD ID: ${c.id} (${c.name})`)
    ids.add(c.id)
  }
  // 3. Plays never exceed cap / go negative
  if (s.cardsPlayedThisTurn > s.maxCardsPerTurn) {
    errors.push(`PLAYS OVER CAP: cardsPlayedThisTurn=${s.cardsPlayedThisTurn} > ${s.maxCardsPerTurn}`)
  }
  if (s.cardsPlayedThisTurn < 0) errors.push(`PLAYS NEGATIVE: ${s.cardsPlayedThisTurn}`)

  for (const p of s.players) {
    // 4. Bank holds only money-valued cards, never properties
    for (const c of p.bank) {
      if (c.type === CARD_TYPES.PROPERTY || c.type === CARD_TYPES.WILD_PROPERTY) {
        errors.push(`PROPERTY IN BANK: ${p.name} bank has ${c.name}`)
      }
    }
    // 5. Property piles hold only property/wild cards
    for (const color of Object.keys(p.properties)) {
      for (const c of p.properties[color]) {
        if (c.type !== CARD_TYPES.PROPERTY && c.type !== CARD_TYPES.WILD_PROPERTY) {
          errors.push(`NON-PROPERTY IN PROPERTIES: ${p.name}/${color} has ${c.name} (${c.type})`)
        }
      }
      // 6. No empty property pile left dangling
      if (p.properties[color].length === 0) errors.push(`EMPTY PROPERTY PILE: ${p.name}/${color}`)
    }
    // 7. Insurance, if present, is the insurance custom card
    if (p.insurance && p.insurance.actionType !== ACTION_TYPES.INSURANCE) {
      errors.push(`BAD INSURANCE CARD: ${p.name} insurance=${p.insurance.name}`)
    }
  }
  // 8. Bank value never negative
  for (const p of s.players) {
    const bankVal = p.bank.reduce((a, c) => a + (c.value || 0), 0)
    if (bankVal < 0) errors.push(`NEGATIVE BANK: ${p.name} = ${bankVal}`)
  }

  return errors.map(e => `[${ctx}] ${e}`)
}

// ── Agent: pick a legal action for the current phase ────────────────
// Mirrors what the UI components would dispatch.
function chooseAssetsToPay(payer, amount) {
  // Greedy: smallest assets first to cover the amount (bank + properties).
  const assets = [
    ...payer.bank.map(c => ({ ...c, _from: 'bank', _color: null })),
    ...Object.entries(payer.properties).flatMap(([color, cards]) =>
      cards.map(c => ({ ...c, _from: 'property', _color: color }))),
  ].sort((a, b) => (a.value || 0) - (b.value || 0))
  const chosen = []
  let total = 0
  for (const a of assets) {
    if (total >= amount) break
    chosen.push(a)
    total += a.value || 0
  }
  return chosen
}

function eligibleRentColors(player, card) {
  return Object.keys(player.properties).filter(color => {
    if (!card.wild) return (card.colors || []).includes(color)
    return true
  })
}

// Returns the action to dispatch, or { done: true } if the game is over.
function nextAction(s, rng) {
  const me = s.players[s.currentPlayerIndex]
  const pa = s.pendingAction

  switch (s.phase) {
    case PHASE.GAME_OVER:
      return { done: true }

    case PHASE.DRAW:
      return { type: 'START_TURN' }

    case PHASE.DISCARD: {
      if (me.hand.length > 7) return { type: 'DISCARD_CARD', cardId: pick(rng, me.hand).id }
      return { type: 'END_TURN' }
    }

    case PHASE.WILD_COLOR_SELECT: {
      const card = me.hand.find(c => c.id === pa.cardId)
      const opts = card?.colors?.[0] === COLORS.WILD ? Object.keys(PROPERTY_SETS) : (card?.colors || [])
      return { type: 'SELECT_WILD_COLOR', targetColor: pick(rng, opts) }
    }

    case PHASE.RENT_COLLECT: {
      const payerId = pa.payerIds[pa.currentPayerIdx]
      const payer = s.players[payerId]
      return { type: 'PAY_DEBT', payerId, amount: pa.amount, payerCards: chooseAssetsToPay(payer, pa.amount) }
    }

    case PHASE.ACTION_RESPONSE: {
      if (pa?.type === ACTION_TYPES.BIRTHDAY) {
        const payerId = pa.targetIds[pa.currentTargetIdx]
        const payer = s.players[payerId]
        return { type: 'PAY_DEBT', payerId, amount: pa.amountPerPlayer, payerCards: chooseAssetsToPay(payer, pa.amountPerPlayer) }
      }
      if (pa?.type === ACTION_TYPES.DEBT_COLLECTOR) {
        if (!pa.targetIds) {
          const others = s.players.map((_, i) => i).filter(i => i !== s.currentPlayerIndex)
          return { type: 'SELECT_TARGET_PLAYER', targetPlayerId: pick(rng, others) }
        }
        const payerId = pa.targetIds[0]
        const payer = s.players[payerId]
        return { type: 'PAY_DEBT', payerId, amount: pa.amount, payerCards: chooseAssetsToPay(payer, pa.amount) }
      }
      if (pa?.type === ACTION_TYPES.HOUSE || pa?.type === ACTION_TYPES.HOTEL) {
        const wantHotel = pa.type === ACTION_TYPES.HOTEL
        const eligible = Object.keys(me.properties).filter(color => {
          if (color === COLORS.RAILROAD || color === COLORS.UTILITY) return false
          if (!isSetComplete(color, me.properties[color])) return false
          const b = me.buildings?.[color] || { houses: 0, hotels: 0 }
          return wantHotel ? (b.houses > 0 && !(b.hotels > 0)) : !(b.houses > 0)
        })
        if (eligible.length === 0) return { type: '_CANCEL_PENDING' }
        return { type: wantHotel ? 'PLACE_HOTEL' : 'PLACE_HOUSE', color: pick(rng, eligible) }
      }
      return { type: '_CANCEL_PENDING' }
    }

    case PHASE.SLY_DEAL_SELECT: {
      const targets = []
      s.players.forEach((p, i) => {
        if (i === s.currentPlayerIndex) return
        for (const [color, cards] of Object.entries(p.properties)) {
          if (!isSetComplete(color, cards)) cards.forEach(c => targets.push({ fromPlayerId: i, cardId: c.id, color }))
        }
      })
      if (targets.length === 0) return { type: '_CANCEL_PENDING' }
      return { type: 'SLY_DEAL_STEAL', ...pick(rng, targets) }
    }

    case PHASE.FORCED_DEAL_SELECT: {
      const mine = Object.entries(me.properties).flatMap(([color, cards]) => cards.map(c => ({ myCardId: c.id, myColor: color })))
      const theirs = []
      s.players.forEach((p, i) => {
        if (i === s.currentPlayerIndex) return
        for (const [color, cards] of Object.entries(p.properties)) {
          if (!isSetComplete(color, cards)) cards.forEach(c => theirs.push({ fromPlayerId: i, theirCardId: c.id, theirColor: color }))
        }
      })
      if (mine.length === 0 || theirs.length === 0) return { type: '_CANCEL_PENDING' }
      return { type: 'FORCED_DEAL_SWAP', ...pick(rng, mine), ...pick(rng, theirs) }
    }

    case PHASE.DEAL_BREAKER_SELECT: {
      const sets = []
      s.players.forEach((p, i) => {
        if (i === s.currentPlayerIndex) return
        for (const [color, cards] of Object.entries(p.properties)) {
          if (isSetComplete(color, cards)) sets.push({ fromPlayerId: i, color })
        }
      })
      if (sets.length === 0) return { type: '_CANCEL_PENDING' }
      return { type: 'DEAL_BREAKER_STEAL', ...pick(rng, sets) }
    }

    case PHASE.TRADE_ROUTE_SELECT: {
      const isProp = c => c.type === CARD_TYPES.PROPERTY || c.type === CARD_TYPES.WILD_PROPERTY
      const myProps = me.hand.filter(isProp)
      const pileProps = s.discard.filter(isProp)
      if (myProps.length === 0) return { type: '_CANCEL_PENDING' }
      const discardCard = pick(rng, myProps)
      const eligible = pileProps.filter(c => c.color !== discardCard.color)
      if (eligible.length === 0) return { type: '_CANCEL_PENDING' }
      return { type: 'TRADE_ROUTE_SWAP', discardCardId: discardCard.id, takeCardId: pick(rng, eligible).id }
    }

    case PHASE.PLAY: {
      const left = s.maxCardsPerTurn - s.cardsPlayedThisTurn
      if (left <= 0 || me.hand.length === 0) return { type: 'END_TURN' }
      if (rng() < 0.08) return { type: 'END_TURN' } // occasionally stop early

      // Bias toward building sets so games actually converge to a winner,
      // while still exercising every action type.
      const props = me.hand.filter(c => c.type === CARD_TYPES.PROPERTY || c.type === CARD_TYPES.WILD_PROPERTY)
      if (props.length && rng() < 0.7) {
        return { type: 'PLAY_PROPERTY', cardId: pick(rng, props).id }
      }

      const card = pick(rng, me.hand)
      switch (card.type) {
        case CARD_TYPES.MONEY:
          return { type: 'PLAY_AS_MONEY', cardId: card.id }
        case CARD_TYPES.PROPERTY:
        case CARD_TYPES.WILD_PROPERTY:
          return { type: 'PLAY_PROPERTY', cardId: card.id } // wild routes to WILD_COLOR_SELECT
        case CARD_TYPES.RENT: {
          const colors = eligibleRentColors(me, card)
          if (colors.length === 0) return { type: 'PLAY_AS_MONEY', cardId: card.id }
          const targetColor = pick(rng, colors)
          const others = s.players.map((_, i) => i).filter(i => i !== s.currentPlayerIndex)
          const targetPlayerId = card.wild ? pick(rng, others) : undefined
          return { type: 'PLAY_RENT', cardId: card.id, targetColor, targetPlayerId }
        }
        case CARD_TYPES.ACTION: {
          // Some actions need a target/board state; if none, bank it instead.
          if (rng() < 0.5) return { type: 'PLAY_AS_MONEY', cardId: card.id }
          return { type: 'PLAY_ACTION', cardId: card.id }
        }
        default:
          return { type: 'END_TURN' }
      }
    }

    default:
      return { type: '_CANCEL_PENDING' }
  }
}

// ── Run one game ────────────────────────────────────────────────────
function runGame(seed, customCards, names) {
  const rng = makeRng(seed)
  let s = reduce(null, { type: '_INIT', _state: initGame(names, { customCards }) })
  const bugs = []
  let steps = 0
  const MAX_STEPS = 6000
  let lastAction = 'INIT'
  let noProgress = 0 // consecutive steps where the reducer returned the same state ref

  bugs.push(...checkInvariants(s, `seed ${seed} init`, customCards))

  while (steps < MAX_STEPS) {
    steps++
    let action
    try {
      action = nextAction(s, rng)
    } catch (e) {
      bugs.push(`[seed ${seed} step ${steps}] AGENT THREW after ${lastAction} (phase=${s.phase}): ${e.message}`)
      break
    }
    if (action.done) break

    let next
    try {
      next = reduce(s, action)
    } catch (e) {
      bugs.push(`[seed ${seed} step ${steps}] REDUCER THREW on ${action.type} (after ${lastAction}): ${e.message}`)
      break
    }

    // True soft-lock detector: the reducer returns the *same* state object on a
    // no-op (rejected/invalid action). Many in a row = the agent is wedged.
    if (next === s) {
      noProgress++
      if (noProgress > 40) {
        bugs.push(`[seed ${seed} step ${steps}] SOFT-LOCK: ${action.type} is a no-op (phase=${s.phase})`)
        break
      }
    } else {
      noProgress = 0
    }

    bugs.push(...checkInvariants(next, `seed ${seed} step ${steps} ${action.type}`, customCards))

    s = next
    lastAction = action.type
    if (s.phase === PHASE.GAME_OVER) break
  }

  const stalled = steps >= MAX_STEPS
  return { bugs, finished: s.phase === PHASE.GAME_OVER, stalled, steps, winner: s.winner?.name }
}

// ── Main ────────────────────────────────────────────────────────────
const GAMES = Number(process.env.GAMES || 100)
const NAMES = ['satvik', 'sanika', 'aman', 'sonu', 'priya', 'rahul']
let totalBugs = 0
const seen = new Map()
let finishedCount = 0
let stalledCount = 0
let totalSteps = 0

for (let i = 0; i < GAMES; i++) {
  const seed = 1000 + i
  const customCards = i % 2 === 0 // alternate custom cards on/off
  const { bugs, finished, stalled, steps } = runGame(seed, customCards, NAMES)
  if (finished) finishedCount++
  if (stalled) stalledCount++
  totalSteps += steps
  for (const b of bugs) {
    totalBugs++
    // De-dupe by the message after the [ctx] prefix
    const key = b.replace(/\[[^\]]*\]\s*/, '')
    seen.set(key, (seen.get(key) || 0) + 1)
    if (seen.get(key) <= 3) console.log(b) // print first few occurrences of each
  }
}

console.log('\n──────── SIMULATION SUMMARY ────────')
console.log(`Games:           ${GAMES} (6 players, custom cards alternating)`)
console.log(`Finished (win):  ${finishedCount}/${GAMES}`)
console.log(`Stalled (cap):   ${stalledCount}/${GAMES}  (random agents, no winner — not a correctness bug)`)
console.log(`Avg steps/game:  ${Math.round(totalSteps / GAMES)}`)
console.log(`Total bug hits:  ${totalBugs}`)
if (seen.size === 0) {
  console.log('Distinct issues: 0  ✓ all invariants held')
} else {
  console.log(`Distinct issues: ${seen.size}`)
  console.log('\nIssue counts:')
  for (const [k, n] of [...seen.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${n}×  ${k}`)
  }
  process.exitCode = 1
}
