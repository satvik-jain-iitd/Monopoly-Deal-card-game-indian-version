import { createDeck, CARD_TYPES, ACTION_TYPES, COLORS, PROPERTY_SETS } from './constants'

export const PHASE = {
  DRAW: 'draw',
  PLAY: 'play',
  ACTION_RESPONSE: 'actionResponse',  // waiting for target player's JSN response
  RENT_COLLECT: 'rentCollect',
  BIRTHDAY_COLLECT: 'birthdayCollect',
  FORCED_DEAL_SELECT: 'forcedDealSelect',
  SLY_DEAL_SELECT: 'slyDealSelect',
  DEAL_BREAKER_SELECT: 'dealBreakerSelect',
  TRADE_ROUTE_SELECT: 'tradeRouteSelect',  // custom card: pick hand prop + discard-pile prop
  WILD_COLOR_SELECT: 'wildColorSelect',
  DISCARD: 'discard',
  GAME_OVER: 'gameOver',
}

export function initGame(playerNames, { customCards = false } = {}) {
  const deck = createDeck(customCards)
  const players = playerNames.map((name, i) => ({
    id: i,
    name,
    hand: [],
    bank: [],       // money + action cards played as money
    properties: {}, // { color: [cards] }
    buildings: {},  // { color: { houses: 0, hotels: 0 } }
    insurance: null, // custom card: face-up Deal Breaker shield (or null)
  }))

  // Deal 5 cards each
  players.forEach(p => {
    p.hand = deck.splice(0, 5)
  })

  return {
    gameId: Date.now(),
    customCards,
    players,
    deck,
    discard: [],
    currentPlayerIndex: 0,
    phase: PHASE.DRAW,
    cardsPlayedThisTurn: 0,
    maxCardsPerTurn: 3,
    pendingAction: null,   // { type, card, actingPlayer, targetPlayer, ... }
    doubleRentActive: false,
    winner: null,
    log: [`Game shuru! ${playerNames[0]} ki baari hai.`],
  }
}

export function getRentForColor(color, count, buildings) {
  const set = PROPERTY_SETS[color]
  if (!set) return 0
  const base = set.rentValues[Math.min(count, set.rentValues.length) - 1] || 0
  const b = buildings?.[color] || { houses: 0, hotels: 0 }
  return base + (b.houses > 0 ? set.houseBonus : 0) + (b.hotels > 0 ? set.hotelBonus : 0)
}

export function isSetComplete(color, cards) {
  const needed = PROPERTY_SETS[color]?.cardsNeeded
  if (!needed) return false
  const nonWild = cards.filter(c => c.type === CARD_TYPES.PROPERTY).length
  const wild = cards.filter(c => c.type === CARD_TYPES.WILD_PROPERTY).length
  return (nonWild + wild) >= needed
}

export function countCompleteSets(player) {
  let count = 0
  for (const [color, cards] of Object.entries(player.properties)) {
    if (color === COLORS.WILD) continue
    if (isSetComplete(color, cards)) count++
  }
  return count
}

export function checkWinner(players) {
  return players.find(p => countCompleteSets(p) >= 3) || null
}

export function getPlayerBankTotal(player) {
  return player.bank.reduce((sum, c) => sum + (c.value || 0), 0)
}

export function getPropertyCount(player, color) {
  return (player.properties[color] || []).length
}

// Collect payment from a player towards an amount owed
// Returns { paid: cards[], remaining: number }
export function collectPayment(debtor, amount) {
  const allAssets = [
    ...debtor.bank.map(c => ({ ...c, _from: 'bank' })),
    ...Object.entries(debtor.properties)
      .flatMap(([color, cards]) => cards.map(c => ({ ...c, _from: 'property', _color: color }))),
  ].sort((a, b) => b.value - a.value)

  const paid = []
  let remaining = amount

  for (const asset of allAssets) {
    if (remaining <= 0) break
    paid.push(asset)
    remaining -= asset.value
  }

  return { paid, remaining: Math.max(0, remaining) }
}

export function applyPayment(state, debtorId, creditorId, paidCards) {
  const s = deepClone(state)
  const debtor = s.players[debtorId]
  const creditor = s.players[creditorId]

  for (const card of paidCards) {
    if (card._from === 'bank') {
      const before = debtor.bank.length
      debtor.bank = debtor.bank.filter(c => c.id !== card.id)
      // Only credit the collector if the card was actually removed from the
      // debtor — prevents duplication if a stale/invalid card id is passed in.
      if (debtor.bank.length < before) {
        creditor.bank.push({ ...card, _from: undefined, _color: undefined })
      }
    } else if (card._from === 'property') {
      const color = card._color
      const pile = debtor.properties[color] || []
      const before = pile.length
      const remaining = pile.filter(c => c.id !== card.id)
      if (remaining.length < before) {
        if (remaining.length === 0) delete debtor.properties[color]
        else debtor.properties[color] = remaining
        if (!creditor.properties[color]) creditor.properties[color] = []
        creditor.properties[color].push({ ...card, _from: undefined, _color: undefined })
      }
    }
  }
  return s
}

export function drawCards(state, playerId, count) {
  const s = deepClone(state)
  const player = s.players[playerId]
  if (s.deck.length === 0) {
    s.deck = shuffle(s.discard)
    s.discard = []
  }
  const drawn = s.deck.splice(0, Math.min(count, s.deck.length))
  player.hand.push(...drawn)
  return s
}

export function playCardToBank(state, playerId, cardId) {
  const s = deepClone(state)
  const player = s.players[playerId]
  const cardIdx = player.hand.findIndex(c => c.id === cardId)
  if (cardIdx === -1) return state
  const card = player.hand[cardIdx]
  // Property cards can never be banked as cash — they only go to the property
  // area, or leave play entirely when paid to an opponent.
  if (card.type === CARD_TYPES.PROPERTY || card.type === CARD_TYPES.WILD_PROPERTY) return state
  player.hand.splice(cardIdx, 1)
  player.bank.push(card)
  s.cardsPlayedThisTurn++
  s.log.push(`${player.name} ne ₹${card.value}Cr bank mein daala.`)
  return s
}

export function playPropertyCard(state, playerId, cardId, targetColor = null) {
  const s = deepClone(state)
  const player = s.players[playerId]
  const cardIdx = player.hand.findIndex(c => c.id === cardId)
  if (cardIdx === -1) return state
  const [card] = player.hand.splice(cardIdx, 1)

  let color = card.color
  if (card.type === CARD_TYPES.WILD_PROPERTY && targetColor) {
    color = targetColor
    card.color = targetColor
  }

  if (!player.properties[color]) player.properties[color] = []
  player.properties[color].push(card)
  s.cardsPlayedThisTurn++
  s.log.push(`${player.name} ne ${card.name} property play kiya.`)
  return s
}

export function endTurn(state) {
  const s = deepClone(state)
  const player = s.players[s.currentPlayerIndex]

  // Discard down to 7
  if (player.hand.length > 7) {
    const excess = player.hand.splice(7)
    s.discard.push(...excess)
    s.log.push(`${player.name} ne ${excess.length} card(s) discard kiye.`)
  }

  s.currentPlayerIndex = (s.currentPlayerIndex + 1) % s.players.length
  s.cardsPlayedThisTurn = 0
  s.doubleRentActive = false
  s.phase = PHASE.DRAW

  const nextPlayer = s.players[s.currentPlayerIndex]
  s.log.push(`${nextPlayer.name} ki baari!`)
  return s
}

export function startTurn(state) {
  const s = deepClone(state)
  const player = s.players[s.currentPlayerIndex]
  const drawCount = player.hand.length === 0 ? 5 : 2

  if (s.deck.length === 0) {
    s.deck = shuffle(s.discard)
    s.discard = []
    s.log.push('Deck khatam ho gaya, discard pile se naya deck bana.')
  }

  const drawn = s.deck.splice(0, Math.min(drawCount, s.deck.length))
  player.hand.push(...drawn)
  s.phase = PHASE.PLAY
  s.log.push(`${player.name} ne ${drawn.length} card draw kiye.`)
  return s
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}
