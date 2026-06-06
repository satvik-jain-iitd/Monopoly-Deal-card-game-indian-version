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

  // ── Additional Monopoly Deal rule checks ───────────────────────────
  for (const p of s.players) {
    for (const [color, cards] of Object.entries(p.properties)) {
      const setDef = PROPERTY_SETS[color]

      // 9. Non-wild (regular) property cards in a pile must never exceed the
      //    set's cardsNeeded — the deck has exactly that many non-wild cards per color.
      //    Wilds are free to stack on top (official rules allow it).
      if (setDef) {
        const nonWildCount = cards.filter(c => c.type === CARD_TYPES.PROPERTY).length
        if (nonWildCount > setDef.cardsNeeded) {
          errors.push(`TOO MANY REGULAR CARDS: ${p.name}/${color} has ${nonWildCount} non-wild cards, set only needs ${setDef.cardsNeeded}`)
        }
      }

      // 10. Wild cards in property piles must match that color
      //     (either dual-color wild including this color, or an all-color wild).
      for (const c of cards) {
        if (c.type === CARD_TYPES.WILD_PROPERTY) {
          const isAllWild = !c.colors || c.colors.length === 0 || c.colors.includes('wild')
          if (!isAllWild && !c.colors.includes(color)) {
            errors.push(`WILD COLOR MISMATCH: ${p.name} wild ${c.name} in ${color} pile but colors=${JSON.stringify(c.colors)}`)
          }
        }
      }

      // 11. Buildings only exist on complete sets
      const bld = p.buildings?.[color]
      if (bld && (bld.houses > 0 || bld.hotels > 0)) {
        if (!isSetComplete(color, cards)) {
          errors.push(`BUILDING ON INCOMPLETE SET: ${p.name}/${color} has house/hotel but set incomplete`)
        }
        // 12. At most 1 house and 1 hotel per set
        if (bld.houses > 1) errors.push(`TOO MANY HOUSES: ${p.name}/${color} houses=${bld.houses}`)
        if (bld.hotels > 1) errors.push(`TOO MANY HOTELS: ${p.name}/${color} hotels=${bld.hotels}`)
        // 13. Hotel requires a house first
        if (bld.hotels > 0 && !(bld.houses > 0)) {
          errors.push(`HOTEL WITHOUT HOUSE: ${p.name}/${color} hotel but no house`)
        }
      }
    }

    // 14. Hand size during DISCARD phase must be > 7
    if (s.phase === PHASE.DISCARD && s.currentPlayerIndex === p.id) {
      if (p.hand.length <= 7) {
        errors.push(`SPURIOUS DISCARD: ${p.name} in DISCARD with only ${p.hand.length} cards (should be > 7)`)
      }
    }

    // 15. At DRAW phase (start of turn) every player should have ≤ 7 cards
    //     (they all discarded to 7 at end of their previous turn)
    if (s.phase === PHASE.DRAW) {
      if (p.hand.length > 7) {
        errors.push(`HAND OVERFLOW AT DRAW: ${p.name} starts turn with ${p.hand.length} cards (max 7)`)
      }
    }
  }

  // 16. Winner must have 3+ complete sets (win condition)
  if (s.phase === PHASE.GAME_OVER && s.winner) {
    const winnerPlayer = s.players.find(pl => pl === s.winner)
    if (winnerPlayer) {
      const completeSets = Object.entries(winnerPlayer.properties)
        .filter(([color, cards]) => color !== COLORS.WILD && isSetComplete(color, cards)).length
      if (completeSets < 3) {
        errors.push(`INVALID WIN: ${winnerPlayer.name} has only ${completeSets} complete sets`)
      }
    }
  }

  // 17. doubleRentActive must be cleared after END_TURN (persisting across turns is illegal)
  //     It CAN be true mid-turn across action phases (played Double Rent, then played Deal
  //     Breaker before Rent) — that is valid. Only flag it if stuck at DRAW phase.
  if (s.doubleRentActive && s.phase === PHASE.DRAW) {
    errors.push(`DOUBLE_RENT SURVIVED TURN END: still active at DRAW phase`)
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

// ── Helpers shared by both agents ───────────────────────────────────
function completeSetsCount(player) {
  return Object.entries(player.properties)
    .filter(([c, cards]) => c !== COLORS.WILD && isSetComplete(c, cards)).length
}

// For a color, how many more cards does `player` need to complete it?
function cardsNeededToComplete(player, color) {
  const needed = PROPERTY_SETS[color]?.cardsNeeded || 99
  const have = (player.properties[color] || []).length
  return Math.max(0, needed - have)
}

// Index of the opponent with the most complete sets (the "leader").
function leaderIdx(s, myIdx) {
  let best = -1, bestScore = -1
  s.players.forEach((p, i) => {
    if (i === myIdx) return
    const score = completeSetsCount(p) * 100 +
      Object.values(p.properties).reduce((a, c) => a + c.length, 0)
    if (score > bestScore) { bestScore = score; best = i }
  })
  return best
}

// ── Strategy A: "Property Hoarder" (original random agent) ───────────
// 70% bias toward properties, 50% chance to bank action cards, random targets.
function nextActionHoarder(s, rng) {
  const me = s.players[s.currentPlayerIndex]
  const pa = s.pendingAction

  switch (s.phase) {
    case PHASE.GAME_OVER: return { done: true }
    case PHASE.DRAW: return { type: 'START_TURN' }

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
      return { type: 'PAY_DEBT', payerId, amount: pa.amount, payerCards: chooseAssetsToPay(s.players[payerId], pa.amount) }
    }

    case PHASE.ACTION_RESPONSE: {
      if (pa?.type === ACTION_TYPES.BIRTHDAY) {
        const payerId = pa.targetIds[pa.currentTargetIdx]
        return { type: 'PAY_DEBT', payerId, amount: pa.amountPerPlayer, payerCards: chooseAssetsToPay(s.players[payerId], pa.amountPerPlayer) }
      }
      if (pa?.type === ACTION_TYPES.DEBT_COLLECTOR) {
        if (!pa.targetIds) {
          const others = s.players.map((_, i) => i).filter(i => i !== s.currentPlayerIndex)
          return { type: 'SELECT_TARGET_PLAYER', targetPlayerId: pick(rng, others) }
        }
        const payerId = pa.targetIds[0]
        return { type: 'PAY_DEBT', payerId, amount: pa.amount, payerCards: chooseAssetsToPay(s.players[payerId], pa.amount) }
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
        for (const [color, cards] of Object.entries(p.properties))
          if (!isSetComplete(color, cards)) cards.forEach(c => targets.push({ fromPlayerId: i, cardId: c.id, color }))
      })
      if (targets.length === 0) return { type: '_CANCEL_PENDING' }
      return { type: 'SLY_DEAL_STEAL', ...pick(rng, targets) }
    }

    case PHASE.FORCED_DEAL_SELECT: {
      const mine = Object.entries(me.properties).flatMap(([color, cards]) => cards.map(c => ({ myCardId: c.id, myColor: color })))
      const theirs = []
      s.players.forEach((p, i) => {
        if (i === s.currentPlayerIndex) return
        for (const [color, cards] of Object.entries(p.properties))
          if (!isSetComplete(color, cards)) cards.forEach(c => theirs.push({ fromPlayerId: i, theirCardId: c.id, theirColor: color }))
      })
      if (mine.length === 0 || theirs.length === 0) return { type: '_CANCEL_PENDING' }
      return { type: 'FORCED_DEAL_SWAP', ...pick(rng, mine), ...pick(rng, theirs) }
    }

    case PHASE.DEAL_BREAKER_SELECT: {
      const sets = []
      s.players.forEach((p, i) => {
        if (i === s.currentPlayerIndex) return
        for (const [color, cards] of Object.entries(p.properties))
          if (isSetComplete(color, cards)) sets.push({ fromPlayerId: i, color })
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
      if (rng() < 0.08) return { type: 'END_TURN' }
      const props = me.hand.filter(c => c.type === CARD_TYPES.PROPERTY || c.type === CARD_TYPES.WILD_PROPERTY)
      if (props.length && rng() < 0.7) return { type: 'PLAY_PROPERTY', cardId: pick(rng, props).id }
      const card = pick(rng, me.hand)
      switch (card.type) {
        case CARD_TYPES.MONEY: return { type: 'PLAY_AS_MONEY', cardId: card.id }
        case CARD_TYPES.PROPERTY:
        case CARD_TYPES.WILD_PROPERTY: return { type: 'PLAY_PROPERTY', cardId: card.id }
        case CARD_TYPES.RENT: {
          const colors = eligibleRentColors(me, card)
          if (colors.length === 0) return { type: 'PLAY_AS_MONEY', cardId: card.id }
          const targetColor = pick(rng, colors)
          const others = s.players.map((_, i) => i).filter(i => i !== s.currentPlayerIndex)
          return { type: 'PLAY_RENT', cardId: card.id, targetColor, targetPlayerId: card.wild ? pick(rng, others) : undefined }
        }
        case CARD_TYPES.ACTION:
          return rng() < 0.5 ? { type: 'PLAY_AS_MONEY', cardId: card.id } : { type: 'PLAY_ACTION', cardId: card.id }
        default: return { type: 'END_TURN' }
      }
    }

    default: return { type: '_CANCEL_PENDING' }
  }
}

// ── Strategy B: "Tactical Aggressor" ────────────────────────────────
// Prioritises: Pass Go > set-completing property > max-rent play >
// action cards (never banked) > money banking > any property.
// Steals/deals always target the leader. Wild goes to the color closest
// to completion. Discards lowest-value money first.
function nextActionAggressor(s, rng) {
  const me = s.players[s.currentPlayerIndex]
  const pa = s.pendingAction
  const myIdx = s.currentPlayerIndex

  switch (s.phase) {
    case PHASE.GAME_OVER: return { done: true }
    case PHASE.DRAW: return { type: 'START_TURN' }

    case PHASE.DISCARD: {
      if (me.hand.length <= 7) return { type: 'END_TURN' }
      // Discard lowest-value money card; if none, lowest-value action/rent; last resort: property.
      const sorted = [...me.hand].sort((a, b) => {
        const typePriority = c =>
          c.type === CARD_TYPES.MONEY ? 0
          : (c.type === CARD_TYPES.ACTION || c.type === CARD_TYPES.RENT) ? 1 : 2
        const tp = typePriority(a) - typePriority(b)
        return tp !== 0 ? tp : (a.value || 0) - (b.value || 0)
      })
      return { type: 'DISCARD_CARD', cardId: sorted[0].id }
    }

    case PHASE.WILD_COLOR_SELECT: {
      const card = me.hand.find(c => c.id === pa.cardId)
      const opts = card?.colors?.[0] === COLORS.WILD ? Object.keys(PROPERTY_SETS) : (card?.colors || [])
      // Pick color where I need the fewest more cards (closest to completing).
      const best = opts.slice().sort((a, b) => {
        const diff = cardsNeededToComplete(me, a) - cardsNeededToComplete(me, b)
        if (diff !== 0) return diff
        return (PROPERTY_SETS[a]?.cardsNeeded || 99) - (PROPERTY_SETS[b]?.cardsNeeded || 99)
      })
      return { type: 'SELECT_WILD_COLOR', targetColor: best[0] || pick(rng, opts) }
    }

    case PHASE.RENT_COLLECT: {
      const payerId = pa.payerIds[pa.currentPayerIdx]
      return { type: 'PAY_DEBT', payerId, amount: pa.amount, payerCards: chooseAssetsToPay(s.players[payerId], pa.amount) }
    }

    case PHASE.ACTION_RESPONSE: {
      if (pa?.type === ACTION_TYPES.BIRTHDAY) {
        const payerId = pa.targetIds[pa.currentTargetIdx]
        return { type: 'PAY_DEBT', payerId, amount: pa.amountPerPlayer, payerCards: chooseAssetsToPay(s.players[payerId], pa.amountPerPlayer) }
      }
      if (pa?.type === ACTION_TYPES.DEBT_COLLECTOR) {
        if (!pa.targetIds) {
          // Target the leader.
          const target = leaderIdx(s, myIdx)
          const others = s.players.map((_, i) => i).filter(i => i !== myIdx)
          return { type: 'SELECT_TARGET_PLAYER', targetPlayerId: target >= 0 ? target : pick(rng, others) }
        }
        const payerId = pa.targetIds[0]
        return { type: 'PAY_DEBT', payerId, amount: pa.amount, payerCards: chooseAssetsToPay(s.players[payerId], pa.amount) }
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
      // Prefer to steal from the leader; prefer cards that set them back most
      // (i.e. take a card from a pile that's 1 away from being complete).
      const leader = leaderIdx(s, myIdx)
      const targets = []
      s.players.forEach((p, i) => {
        if (i === myIdx) return
        const priority = i === leader ? 0 : 1
        for (const [color, cards] of Object.entries(p.properties)) {
          if (!isSetComplete(color, cards)) {
            const setback = (PROPERTY_SETS[color]?.cardsNeeded || 0) - cards.length === 1 ? 0 : 1
            cards.forEach(c => targets.push({ fromPlayerId: i, cardId: c.id, color, score: priority * 10 + setback }))
          }
        }
      })
      if (targets.length === 0) return { type: '_CANCEL_PENDING' }
      targets.sort((a, b) => a.score - b.score)
      const { score: _, ...best } = targets[0]
      return { type: 'SLY_DEAL_STEAL', ...best }
    }

    case PHASE.FORCED_DEAL_SELECT: {
      // Give away my lowest-value property from a non-completing pile.
      // Take from the leader's most-advanced pile.
      const leader = leaderIdx(s, myIdx)
      const mine = Object.entries(me.properties).flatMap(([color, cards]) =>
        cards.map(c => ({ myCardId: c.id, myColor: color, val: c.value || 0 }))
      ).sort((a, b) => a.val - b.val) // give away lowest value
      const theirs = []
      s.players.forEach((p, i) => {
        if (i === myIdx) return
        const priority = i === leader ? 0 : 1
        for (const [color, cards] of Object.entries(p.properties))
          if (!isSetComplete(color, cards))
            cards.forEach(c => theirs.push({ fromPlayerId: i, theirCardId: c.id, theirColor: color, score: priority }))
      })
      if (mine.length === 0 || theirs.length === 0) return { type: '_CANCEL_PENDING' }
      theirs.sort((a, b) => a.score - b.score)
      const { val: _v, ...myBest } = mine[0]
      const { score: _s, ...theirBest } = theirs[0]
      return { type: 'FORCED_DEAL_SWAP', ...myBest, ...theirBest }
    }

    case PHASE.DEAL_BREAKER_SELECT: {
      // Steal from the leader first.
      const leader = leaderIdx(s, myIdx)
      const sets = []
      s.players.forEach((p, i) => {
        if (i === myIdx) return
        for (const [color, cards] of Object.entries(p.properties))
          if (isSetComplete(color, cards)) sets.push({ fromPlayerId: i, color, score: i === leader ? 0 : 1 })
      })
      if (sets.length === 0) return { type: '_CANCEL_PENDING' }
      sets.sort((a, b) => a.score - b.score)
      const { score: _, ...best } = sets[0]
      return { type: 'DEAL_BREAKER_STEAL', ...best }
    }

    case PHASE.TRADE_ROUTE_SELECT: {
      const isProp = c => c.type === CARD_TYPES.PROPERTY || c.type === CARD_TYPES.WILD_PROPERTY
      const myProps = me.hand.filter(isProp)
      const pileProps = s.discard.filter(isProp)
      if (myProps.length === 0) return { type: '_CANCEL_PENDING' }
      // Give up the property from my most-overloaded color; take the pile card
      // that's most useful (color where I have the most already).
      const discardCard = myProps.slice().sort((a, b) => {
        const aHave = (me.properties[a.color] || []).length
        const bHave = (me.properties[b.color] || []).length
        return bHave - aHave // give from the color I have most of
      })[0]
      const eligible = pileProps.filter(c => c.color !== discardCard.color)
        .sort((a, b) => (me.properties[b.color] || []).length - (me.properties[a.color] || []).length)
      if (eligible.length === 0) return { type: '_CANCEL_PENDING' }
      return { type: 'TRADE_ROUTE_SWAP', discardCardId: discardCard.id, takeCardId: eligible[0].id }
    }

    case PHASE.PLAY: {
      const left = s.maxCardsPerTurn - s.cardsPlayedThisTurn
      if (left <= 0 || me.hand.length === 0) return { type: 'END_TURN' }
      if (rng() < 0.02) return { type: 'END_TURN' } // rarely quit early

      // 1. Pass Go first — more cards = more options.
      const passGo = me.hand.find(c => c.actionType === ACTION_TYPES.PASS_GO)
      if (passGo) return { type: 'PLAY_ACTION', cardId: passGo.id }

      // 2. Play any property that would complete a set.
      const props = me.hand.filter(c => c.type === CARD_TYPES.PROPERTY || c.type === CARD_TYPES.WILD_PROPERTY)
      const completing = props.filter(c => {
        const color = c.color
        if (!color || !PROPERTY_SETS[color]) return false
        const have = (me.properties[color] || []).length
        return have + 1 >= PROPERTY_SETS[color].cardsNeeded
      })
      if (completing.length) return { type: 'PLAY_PROPERTY', cardId: completing[0].id }

      // 3. Play rent when I own 2+ cards in an eligible color (max rent value).
      const rentCard = me.hand.find(c => c.type === CARD_TYPES.RENT)
      if (rentCard) {
        const colors = eligibleRentColors(me, rentCard).filter(color => (me.properties[color] || []).length >= 2)
        if (colors.length) {
          const best = colors.slice().sort((a, b) =>
            (me.properties[b] || []).length - (me.properties[a] || []).length)[0]
          const others = s.players.map((_, i) => i).filter(i => i !== myIdx)
          return { type: 'PLAY_RENT', cardId: rentCard.id, targetColor: best, targetPlayerId: rentCard.wild ? pick(rng, others) : undefined }
        }
      }

      // 4. Play any action card (never bank it) — skip cards that would be no-ops.
      const isPropCard = c => c.type === CARD_TYPES.PROPERTY || c.type === CARD_TYPES.WILD_PROPERTY
      const pileProps = s.discard.filter(isPropCard)
      const handProps = me.hand.filter(isPropCard)
      const action = me.hand.find(c => {
        if (c.type !== CARD_TYPES.ACTION) return false
        // Insurance: skip if already insured (reducer returns no-op).
        if (c.actionType === ACTION_TYPES.INSURANCE && me.insurance) return false
        // Trade Route: only useful if there's a pile property of a different colour.
        if (c.actionType === ACTION_TYPES.TRADE_ROUTE) {
          return handProps.length > 0 && pileProps.some(p => handProps.some(m => m.color !== p.color))
        }
        // Just Say No: can't be played proactively (no pending action in PLAY phase).
        if (c.actionType === ACTION_TYPES.JUST_SAY_NO) return false
        return true
      })
      if (action) return { type: 'PLAY_ACTION', cardId: action.id }

      // Bank unplayable action cards (Insurance already held, JSN, etc.).
      const bankable = me.hand.find(c =>
        (c.type === CARD_TYPES.ACTION || c.type === CARD_TYPES.RENT) &&
        !(c.type === CARD_TYPES.PROPERTY) && !(c.type === CARD_TYPES.WILD_PROPERTY)
      )
      if (bankable && !me.hand.find(c => c.type === CARD_TYPES.MONEY)) {
        return { type: 'PLAY_AS_MONEY', cardId: bankable.id }
      }

      // 5. Bank money.
      const money = me.hand.find(c => c.type === CARD_TYPES.MONEY)
      if (money) return { type: 'PLAY_AS_MONEY', cardId: money.id }

      // 6. Play any property (prefer color closest to completion).
      if (props.length) {
        const sorted = props.slice().sort((a, b) => {
          const aNeed = cardsNeededToComplete(me, a.color)
          const bNeed = cardsNeededToComplete(me, b.color)
          return aNeed - bNeed
        })
        return { type: 'PLAY_PROPERTY', cardId: sorted[0].id }
      }

      // 7. Bank any remaining card (rent/action as last resort).
      const remaining = me.hand.find(c => c.type !== CARD_TYPES.PROPERTY && c.type !== CARD_TYPES.WILD_PROPERTY)
      if (remaining) return { type: 'PLAY_AS_MONEY', cardId: remaining.id }

      return { type: 'END_TURN' }
    }

    default: return { type: '_CANCEL_PENDING' }
  }
}

// Route to the right agent based on player index parity:
// even index = Hoarder (A), odd index = Aggressor (B).
function nextAction(s, rng) {
  const isAggressor = s.currentPlayerIndex % 2 === 1
  return isAggressor ? nextActionAggressor(s, rng) : nextActionHoarder(s, rng)
}

// ── Run one game ────────────────────────────────────────────────────
function runGame(seed, customCards, names) {
  const rng = makeRng(seed)
  let s = reduce(null, { type: '_INIT', _state: initGame(names, { customCards }) })
  const bugs = []
  let steps = 0
  const MAX_STEPS = 6000
  let lastAction = 'INIT'
  let noProgress = 0
  let turns = 0

  // Per-action-type play counts
  const actionCounts = {}
  // Steals: { slyDeal, forcedDeal, dealBreaker }
  let slySteals = 0, forcedSwaps = 0, dealBreakers = 0
  // Rents collected
  let rentEvents = 0
  // Times a player had to discard
  let discardEvents = 0
  // Track previous phase to count transitions
  let prevPhase = s.phase
  // Track which colors ended up completed by the winner
  let winnerColors = []
  // Track turn counts per player
  const playerTurns = Object.fromEntries(names.map(n => [n, 0]))
  // Payments: total ₹ transferred
  let totalCrTransferred = 0
  // Pass Go plays
  let passGoCount = 0

  bugs.push(...checkInvariants(s, `seed ${seed} init`, customCards))

  while (steps < MAX_STEPS) {
    steps++
    let action
    try { action = nextAction(s, rng) }
    catch (e) {
      bugs.push(`[seed ${seed} step ${steps}] AGENT THREW after ${lastAction} (phase=${s.phase}): ${e.message}`)
      break
    }
    if (action.done) break

    // Count action plays before dispatch
    if (action.type === 'PLAY_ACTION' || action.type === 'PLAY_AS_MONEY' ||
        action.type === 'PLAY_PROPERTY' || action.type === 'PLAY_RENT') {
      actionCounts[action.type] = (actionCounts[action.type] || 0) + 1
    }
    if (action.type === 'SLY_DEAL_STEAL') slySteals++
    if (action.type === 'FORCED_DEAL_SWAP') forcedSwaps++
    if (action.type === 'DEAL_BREAKER_STEAL') dealBreakers++
    if (action.type === 'START_TURN') {
      turns++
      if (s.players[s.currentPlayerIndex]) {
        playerTurns[s.players[s.currentPlayerIndex].name] = (playerTurns[s.players[s.currentPlayerIndex].name] || 0) + 1
      }
    }
    if (action.type === 'PAY_DEBT' && action.payerCards) {
      totalCrTransferred += action.payerCards.reduce((a, c) => a + (c.value || 0), 0)
      rentEvents++
    }

    let next
    try { next = reduce(s, action) }
    catch (e) {
      bugs.push(`[seed ${seed} step ${steps}] REDUCER THREW on ${action.type} (after ${lastAction}): ${e.message}`)
      break
    }

    if (next === s) {
      noProgress++
      if (noProgress > 40) {
        bugs.push(`[seed ${seed} step ${steps}] SOFT-LOCK: ${action.type} is a no-op (phase=${s.phase})`)
        break
      }
    } else {
      noProgress = 0
    }

    // Count PASS_GO draws after transition
    if (action.type === 'PLAY_ACTION') {
      const prevPlayer = s.players[s.currentPlayerIndex]
      const card = prevPlayer?.hand.find(c => c.id === action.cardId)
      if (card?.actionType === ACTION_TYPES.PASS_GO) passGoCount++
    }
    if (next.phase === PHASE.DISCARD && prevPhase !== PHASE.DISCARD) discardEvents++
    prevPhase = next.phase

    bugs.push(...checkInvariants(next, `seed ${seed} step ${steps} ${action.type}`, customCards))
    s = next
    lastAction = action.type
    if (s.phase === PHASE.GAME_OVER) break
  }

  // Final board snapshot
  const finalPlayers = s.players.map(p => {
    const sets = Object.entries(p.properties)
      .filter(([c, cards]) => c !== COLORS.WILD && isSetComplete(c, cards))
      .map(([c]) => c)
    const bankTotal = p.bank.reduce((a, c) => a + (c.value || 0), 0)
    const propCount = Object.values(p.properties).reduce((a, c) => a + c.length, 0)
    return { name: p.name, sets, bankTotal, propCount, handSize: p.hand.length }
  })

  if (s.winner) {
    const wp = s.players.find(p => p === s.winner)
    if (wp) winnerColors = Object.entries(wp.properties)
      .filter(([c, cards]) => c !== COLORS.WILD && isSetComplete(c, cards))
      .map(([c]) => c)
  }

  const stalled = steps >= MAX_STEPS
  return {
    bugs, finished: s.phase === PHASE.GAME_OVER, stalled, steps, turns,
    winner: s.winner?.name,
    winnerColors,
    finalPlayers,
    actionCounts,
    slySteals, forcedSwaps, dealBreakers,
    rentEvents, discardEvents, passGoCount,
    totalCrTransferred,
    playerTurns,
    customCards,
  }
}

// ── Main ────────────────────────────────────────────────────────────
const GAMES = Number(process.env.GAMES || 100)
const BASE_SEED = Number(process.env.SEED || Date.now())
// Even indices = Hoarder (A), Odd indices = Aggressor (B)
const NAMES = ['satvik(A)', 'sanika(B)', 'aman(A)', 'sonu(B)', 'priya(A)', 'rahul(B)']
let totalBugs = 0
const seen = new Map()
let finishedCount = 0, stalledCount = 0, totalSteps = 0, totalTurns = 0
let totalSly = 0, totalForced = 0, totalBreaker = 0
let totalRentEvents = 0, totalCrTransferred = 0, totalPassGo = 0, totalDiscard = 0
const winCounts = {}, colorWinCounts = {}, actionTotals = {}
const allGames = []

console.log(`Seeds: ${BASE_SEED} … ${BASE_SEED + GAMES - 1}  (pass SEED=N to reproduce)\n`)

for (let i = 0; i < GAMES; i++) {
  const seed = BASE_SEED + i
  const customCards = i % 2 === 0
  const r = runGame(seed, customCards, NAMES)
  allGames.push({ seed, ...r })
  if (r.finished) finishedCount++
  if (r.stalled) stalledCount++
  totalSteps += r.steps
  totalTurns += r.turns
  totalSly += r.slySteals; totalForced += r.forcedSwaps; totalBreaker += r.dealBreakers
  totalRentEvents += r.rentEvents; totalCrTransferred += r.totalCrTransferred
  totalPassGo += r.passGoCount; totalDiscard += r.discardEvents
  if (r.winner) winCounts[r.winner] = (winCounts[r.winner] || 0) + 1
  for (const c of r.winnerColors) colorWinCounts[c] = (colorWinCounts[c] || 0) + 1
  for (const [k, v] of Object.entries(r.actionCounts)) actionTotals[k] = (actionTotals[k] || 0) + v
  for (const b of r.bugs) {
    totalBugs++
    const key = b.replace(/\[[^\]]*\]\s*/, '')
    seen.set(key, (seen.get(key) || 0) + 1)
    if (seen.get(key) <= 3) console.log(b)
  }
}

const fin = finishedCount || 1
console.log('══════════════════════════════════════════════')
console.log('               GAME PATTERN ANALYSIS         ')
console.log('══════════════════════════════════════════════')
console.log(`\nGames: ${GAMES}  |  Finished: ${finishedCount}  |  Stalled: ${stalledCount}`)
console.log(`Avg turns/game: ${(totalTurns/GAMES).toFixed(1)}  |  Avg steps/game: ${Math.round(totalSteps/GAMES)}`)

console.log('\n── Per-game breakdown ─────────────────────��───')
for (const g of allGames) {
  const cc = g.customCards ? '+custom' : '       '
  const result = g.finished ? `Winner: ${g.winner} (${g.winnerColors.join(', ')})` : 'STALLED'
  console.log(`  seed ${g.seed}  ${cc}  ${g.turns} turns  ${result}`)
}

console.log('\n── Win counts  [A=Hoarder  B=Aggressor] ───────')
const sortedWins = Object.entries(winCounts).sort((a,b) => b[1]-a[1])
let hoarderWins = 0, aggressorWins = 0
for (const [name, n] of sortedWins) {
  const tag = name.includes('(B)') ? 'B' : 'A'
  if (tag === 'A') hoarderWins += n; else aggressorWins += n
  console.log(`  ${name.padEnd(14)} ${n} wins  [${tag}]`)
}
console.log(`  ──`)
console.log(`  Hoarder (A) total:    ${hoarderWins}`)
console.log(`  Aggressor (B) total:  ${aggressorWins}`)

console.log('\n── Winning color sets (how often each color closes a win) ─')
const sortedColors = Object.entries(colorWinCounts).sort((a,b) => b[1]-a[1])
for (const [color, n] of sortedColors) console.log(`  ${color.padEnd(12)} ${n}×`)

console.log('\n── Action card usage (total across all games) ─')
console.log(`  PLAY_PROPERTY  ${actionTotals['PLAY_PROPERTY'] || 0}`)
console.log(`  PLAY_AS_MONEY  ${actionTotals['PLAY_AS_MONEY'] || 0}`)
console.log(`  PLAY_RENT      ${actionTotals['PLAY_RENT'] || 0}`)
console.log(`  PLAY_ACTION    ${actionTotals['PLAY_ACTION'] || 0}`)
console.log(`  Pass Go plays  ${totalPassGo}`)
console.log(`  Sly Deals      ${totalSly}`)
console.log(`  Forced Deals   ${totalForced}`)
console.log(`  Deal Breakers  ${totalBreaker}`)

console.log('\n── Payment / economy ──────────────────────────')
console.log(`  Rent events:      ${totalRentEvents}  (avg ${(totalRentEvents/GAMES).toFixed(1)}/game)`)
console.log(`  ₹Cr transferred:  ${totalCrTransferred}  (avg ${(totalCrTransferred/GAMES).toFixed(1)}/game)`)
console.log(`  Discard events:   ${totalDiscard}  (avg ${(totalDiscard/GAMES).toFixed(1)}/game)`)

console.log('\n── Final board (avg across ALL players, finished games) ─')
const fpFlat = allGames.filter(g => g.finished).flatMap(g => g.finalPlayers)
const avgBank = (fpFlat.reduce((a,p)=>a+p.bankTotal,0)/fpFlat.length).toFixed(1)
const avgProps = (fpFlat.reduce((a,p)=>a+p.propCount,0)/fpFlat.length).toFixed(1)
const avgHand = (fpFlat.reduce((a,p)=>a+p.handSize,0)/fpFlat.length).toFixed(1)
console.log(`  Avg bank: ₹${avgBank}Cr  |  Avg props on table: ${avgProps}  |  Avg hand: ${avgHand} cards`)

console.log('\n── Invariant check ────────────────────────────')
if (seen.size === 0) {
  console.log('  0 issues  ✓ all invariants held across all games')
} else {
  console.log(`  ${seen.size} distinct issues (${totalBugs} total hits):`)
  for (const [k, n] of [...seen.entries()].sort((a,b)=>b[1]-a[1])) console.log(`    ${n}×  ${k}`)
  process.exitCode = 1
}
console.log('══════════════════════════════════════════════')
