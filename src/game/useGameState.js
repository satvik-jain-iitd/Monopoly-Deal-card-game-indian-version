import { useReducer, useCallback } from 'react'
import {
  initGame, startTurn, endTurn, drawCards,
  playCardToBank, playPropertyCard, applyPayment,
  collectPayment, checkWinner, countCompleteSets,
  getRentForColor, isSetComplete, getPlayerBankTotal,
  reactivateBuildings, deactivateBuildings,
  replenishDeck,
  PHASE,
} from './gameLogic'
import { CARD_TYPES, ACTION_TYPES, COLORS, PROPERTY_SETS } from './constants'

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

function nextPhaseAfterPlay(s) {
  if (s.cardsPlayedThisTurn < s.maxCardsPerTurn) return PHASE.PLAY
  return s.players[s.currentPlayerIndex].hand.length > 7 ? PHASE.DISCARD : PHASE.PLAY
}

function executeDealBreakerSteal(s, fromPlayerId, color) {
  const thief = s.players[s.currentPlayerIndex]
  const victim = s.players[fromPlayerId]
  const set = victim.properties[color]
  if (!set) return s

  delete victim.properties[color]
  // Transfer buildings to thief — Deal Breaker takes the whole set including house/hotel.
  if (victim.buildings?.[color]) {
    if (!thief.buildings) thief.buildings = {}
    thief.buildings[color] = victim.buildings[color]
    delete victim.buildings[color]
  }

  if (!thief.properties[color]) thief.properties[color] = []
  thief.properties[color].push(...set)
  // Also reactivate any of thief's inactive buildings on this color.
  reactivateBuildings(thief, color)

  s.log.push(`${thief.name} ne ${victim.name} ka poora ${color} set chura liya! Deal Breaker!`)
  s.pendingAction = null
  s.phase = nextPhaseAfterPlay(s)
  const winner = checkWinner(s.players)
  if (winner) {
    s.phase = PHASE.GAME_OVER
    s.winner = winner
  }
  return s
}

function executeSlyDeal(s, fromPlayerId, cardId, color) {
  const thief = s.players[s.currentPlayerIndex]
  const victim = s.players[fromPlayerId]
  const cardIdx = victim.properties[color].findIndex(c => c.id === cardId)
  if (cardIdx === -1) return s
  const [stolen] = victim.properties[color].splice(cardIdx, 1)
  if (victim.properties[color].length === 0) delete victim.properties[color]
  deactivateBuildings(victim, color)
  if (!thief.properties[color]) thief.properties[color] = []
  stolen.color = color
  thief.properties[color].push(stolen)
  reactivateBuildings(thief, color)
  s.log.push(`${thief.name} ne ${victim.name} se ${stolen.name} chura liya!`)
  s.pendingAction = null
  s.phase = nextPhaseAfterPlay(s)
  return s
}

function executeForcedDealSwap(s, fromPlayerId, theirCardId, theirColor, myCardId, myColor) {
  const player = s.players[s.currentPlayerIndex]
  const other = s.players[fromPlayerId]
  const theirIdx = (other.properties[theirColor] || []).findIndex(c => c.id === theirCardId)
  const myIdx = (player.properties[myColor] || []).findIndex(c => c.id === myCardId)
  if (theirIdx === -1 || myIdx === -1) return s
  const [theirCard] = other.properties[theirColor].splice(theirIdx, 1)
  const [myCard] = player.properties[myColor].splice(myIdx, 1)
  if (other.properties[theirColor].length === 0) delete other.properties[theirColor]
  if (player.properties[myColor].length === 0) delete player.properties[myColor]
  deactivateBuildings(other, theirColor)
  deactivateBuildings(player, myColor)
  theirCard.color = theirColor
  myCard.color = myColor
  if (!player.properties[theirColor]) player.properties[theirColor] = []
  player.properties[theirColor].push(theirCard)
  reactivateBuildings(player, theirColor)
  if (!other.properties[myColor]) other.properties[myColor] = []
  other.properties[myColor].push(myCard)
  reactivateBuildings(other, myColor)
  s.log.push(`${player.name} ne ${other.name} ke saath deal force ki!`)
  s.pendingAction = null
  s.phase = nextPhaseAfterPlay(s)
  return s
}

// Card-playing actions are capped at maxCardsPerTurn. We keep the phase in PLAY
// after the 3rd play (to skip an empty discard screen), so this guard is what
// actually prevents a 4th play from being registered.
const PLAY_ACTIONS = new Set(['PLAY_AS_MONEY', 'PLAY_PROPERTY', 'PLAY_ACTION', 'PLAY_RENT'])

function gameReducer(state, action) {
  if (state && PLAY_ACTIONS.has(action.type) && state.cardsPlayedThisTurn >= state.maxCardsPerTurn) {
    return state
  }

  switch (action.type) {

    case 'START_TURN': {
      const s = startTurn(state)
      const winner = checkWinner(s.players)
      if (winner) return { ...s, phase: PHASE.GAME_OVER, winner }
      return s
    }

    case 'PLAY_AS_MONEY': {
      const banking = state.players[state.currentPlayerIndex].hand.find(c => c.id === action.cardId)
      if (!banking || banking.type === CARD_TYPES.PROPERTY || banking.type === CARD_TYPES.WILD_PROPERTY) return state
      const s = playCardToBank(state, state.currentPlayerIndex, action.cardId)
      const winner = checkWinner(s.players)
      if (winner) return { ...s, phase: PHASE.GAME_OVER, winner }
      if (s.cardsPlayedThisTurn >= s.maxCardsPerTurn) {
        return { ...s, phase: nextPhaseAfterPlay(s) }
      }
      return s
    }

    case 'PLAY_PROPERTY': {
      const { cardId, targetColor } = action
      const card = state.players[state.currentPlayerIndex].hand.find(c => c.id === cardId)
      if (!card) return state

      // Wild property needs color selection
      if (card.type === CARD_TYPES.WILD_PROPERTY && !targetColor) {
        return { ...state, phase: PHASE.WILD_COLOR_SELECT, pendingAction: { cardId } }
      }

      const s = playPropertyCard(state, state.currentPlayerIndex, cardId, targetColor)
      const winner = checkWinner(s.players)
      if (winner) return { ...s, phase: PHASE.GAME_OVER, winner }
      if (s.cardsPlayedThisTurn >= s.maxCardsPerTurn) {
        return { ...s, phase: nextPhaseAfterPlay(s) }
      }
      return s
    }

    case 'PLAY_ACTION': {
      const { cardId } = action
      const s = deepClone(state)
      const player = s.players[s.currentPlayerIndex]
      const cardIdx = player.hand.findIndex(c => c.id === cardId)
      if (cardIdx === -1) return state
      const card = player.hand[cardIdx]

      switch (card.actionType) {
        case ACTION_TYPES.PASS_GO: {
          player.hand.splice(cardIdx, 1)
          s.discard.push(card)
          s.cardsPlayedThisTurn++
          replenishDeck(s)
          const drawn = s.deck.splice(0, 2)
          player.hand.push(...drawn)
          s.log.push(`${player.name} ne Pass Go khela — ${drawn.length} extra cards mile!`)
          s.phase = nextPhaseAfterPlay(s)
          // Mark drawn cards so the DISCARD screen can highlight them.
          s.passGoDrawnIds = drawn.map(c => c.id)
          return s
        }
        case ACTION_TYPES.DOUBLE_RENT: {
          if (!player.hand.some(c => c.type === CARD_TYPES.RENT)) return state
          if (s.cardsPlayedThisTurn >= s.maxCardsPerTurn - 1) return state
          player.hand.splice(cardIdx, 1)
          s.discard.push(card)
          s.cardsPlayedThisTurn++
          s.doubleRentActive = true
          s.log.push(`${player.name} ne Double The Rent lagaaya!`)
          s.phase = nextPhaseAfterPlay(s)
          return s
        }
        case ACTION_TYPES.BIRTHDAY: {
          player.hand.splice(cardIdx, 1)
          s.discard.push(card)
          s.cardsPlayedThisTurn++
          s.log.push(`${player.name} ka birthday hai! Sabko ₹2Cr dena hoga.`)
          s.phase = PHASE.ACTION_RESPONSE
          s.pendingAction = {
            type: ACTION_TYPES.BIRTHDAY,
            actingPlayerId: s.currentPlayerIndex,
            targetIds: s.players.map((_, i) => i).filter(i => i !== s.currentPlayerIndex),
            currentTargetIdx: 0,
            amountPerPlayer: 2,
            collected: 0,
          }
          return s
        }
        case ACTION_TYPES.DEBT_COLLECTOR: {
          player.hand.splice(cardIdx, 1)
          s.discard.push(card)
          s.cardsPlayedThisTurn++
          s.phase = PHASE.ACTION_RESPONSE
          s.pendingAction = {
            type: ACTION_TYPES.DEBT_COLLECTOR,
            actingPlayerId: s.currentPlayerIndex,
            targetIds: null, // need to pick one player
            amount: 5,
          }
          return s
        }
        case ACTION_TYPES.SLY_DEAL: {
          player.hand.splice(cardIdx, 1)
          s.discard.push(card)
          s.cardsPlayedThisTurn++
          s.phase = PHASE.SLY_DEAL_SELECT
          s.pendingAction = {
            type: ACTION_TYPES.SLY_DEAL,
            actingPlayerId: s.currentPlayerIndex,
            card,
          }
          return s
        }
        case ACTION_TYPES.FORCED_DEAL: {
          player.hand.splice(cardIdx, 1)
          s.discard.push(card)
          s.cardsPlayedThisTurn++
          s.phase = PHASE.FORCED_DEAL_SELECT
          s.pendingAction = {
            type: ACTION_TYPES.FORCED_DEAL,
            actingPlayerId: s.currentPlayerIndex,
            card,
          }
          return s
        }
        case ACTION_TYPES.DEAL_BREAKER: {
          player.hand.splice(cardIdx, 1)
          s.discard.push(card)
          s.cardsPlayedThisTurn++
          s.phase = PHASE.DEAL_BREAKER_SELECT
          s.pendingAction = {
            type: ACTION_TYPES.DEAL_BREAKER,
            actingPlayerId: s.currentPlayerIndex,
            card,
          }
          return s
        }
        case ACTION_TYPES.HOUSE: {
          // Can only play on a complete set (not railroad/utility).
          // Card is NOT discarded — held in pendingAction so _CANCEL_PENDING can restore it.
          player.hand.splice(cardIdx, 1)
          s.cardsPlayedThisTurn++
          s.pendingAction = { type: ACTION_TYPES.HOUSE, actingPlayerId: s.currentPlayerIndex, card }
          s.phase = PHASE.ACTION_RESPONSE
          return s
        }
        case ACTION_TYPES.HOTEL: {
          player.hand.splice(cardIdx, 1)
          s.cardsPlayedThisTurn++
          s.pendingAction = { type: ACTION_TYPES.HOTEL, actingPlayerId: s.currentPlayerIndex, card }
          s.phase = PHASE.ACTION_RESPONSE
          return s
        }
        case ACTION_TYPES.INSURANCE: {
          // Already insured? Can't stack — leave the play unspent.
          if (player.insurance) return state
          player.hand.splice(cardIdx, 1)
          player.insurance = card // stays face-up on the table
          s.cardsPlayedThisTurn++
          s.log.push(`${player.name} ne Insurance lagaya — Deal Breaker se safety! 🛡️`)
          s.phase = nextPhaseAfterPlay(s)
          return s
        }
        case ACTION_TYPES.SABOTAGE: {
          s.phase = PHASE.SABOTAGE_SELECT
          s.pendingAction = { type: ACTION_TYPES.SABOTAGE, actingPlayerId: s.currentPlayerIndex, cardId }
          return s
        }
        default: return state
      }
    }

    case 'PLAY_RENT': {
      const { cardId, targetColor, targetPlayerId } = action
      const s = deepClone(state)
      const player = s.players[s.currentPlayerIndex]
      const cardIdx = player.hand.findIndex(c => c.id === cardId)
      if (cardIdx === -1) return state

      // Guard — can't rent without matching property
      const playerProps = player.properties[targetColor] || []
      if (playerProps.length === 0) return state

      const card = player.hand[cardIdx]

      // Determine who pays — compute BEFORE mutating so we never discard the
      // card without a valid target (e.g. a wild rent with no opponent picked,
      // which would otherwise waste the card and collect no rent).
      const payerIds = card.wild
        ? (targetPlayerId !== undefined && targetPlayerId !== null ? [targetPlayerId] : [])
        : s.players.map((_, i) => i).filter(i => i !== s.currentPlayerIndex)
      if (payerIds.length === 0) return state

      player.hand.splice(cardIdx, 1)
      s.discard.push(card)
      s.cardsPlayedThisTurn++

      const count = playerProps.length
      const baseAmount = getRentForColor(targetColor, count, player.buildings)
      let rentAmount = baseAmount
      let wasDoubled = false
      if (s.doubleRentActive) { rentAmount = baseAmount * 2; s.doubleRentActive = false; wasDoubled = true }

      s.log.push(`${player.name} ne ${targetColor} ka rent maanga — ₹${rentAmount}Cr${wasDoubled ? ' (doubled!)' : ''}!`)
      s.phase = PHASE.RENT_COLLECT
      s.pendingAction = {
        type: 'rent',
        actingPlayerId: s.currentPlayerIndex,
        payerIds,
        currentPayerIdx: 0,
        amount: rentAmount,
        baseAmount,
        wasDoubled,
        targetColor,
      }
      return s
    }

    case 'START_WILD_COLOR_CHANGE': {
      return { ...state, phase: PHASE.WILD_COLOR_SELECT, pendingAction: { cardId: action.cardId, isChange: true } }
    }

    case 'CHANGE_WILD_COLOR': {
      const { cardId, newColor } = action
      const s = deepClone(state)
      const player = s.players[s.currentPlayerIndex]
      // Find wild card in player's property area
      let found = false
      for (const [color, cards] of Object.entries(player.properties)) {
        const idx = cards.findIndex(c => c.id === cardId && (c.type === CARD_TYPES.WILD_PROPERTY))
        if (idx >= 0) {
          const [card] = cards.splice(idx, 1)
          // Remove the colour key if now empty
          if (cards.length === 0) delete player.properties[color]
          // Assign to new colour
          if (!player.properties[newColor]) player.properties[newColor] = []
          card.assignedColor = newColor
          player.properties[newColor].push(card)
          // Handle building deactivation/reactivation
          deactivateBuildings(player, color)
          reactivateBuildings(player, newColor)
          s.log.push(`${player.name} ne wild card ${card.name} ka colour ${newColor} kar diya!`)
          found = true
          break
        }
      }
      if (!found) return state
      const winner = checkWinner(s.players)
      if (winner) {
        s.phase = PHASE.GAME_OVER
        s.winner = winner
      }
      return s
    }

    case 'SELECT_TARGET_PLAYER': {
      const s = deepClone(state)
      if (!s.pendingAction) return state
      s.pendingAction.targetIds = [action.targetPlayerId]
      s.pendingAction.currentTargetIdx = 0
      if (s.pendingAction.type === ACTION_TYPES.DEBT_COLLECTOR) {
        s.phase = PHASE.ACTION_RESPONSE
      }
      return s
    }

    case 'PAY_DEBT': {
      const { payerCards, payerId, amount } = action
      let s = deepClone(state)
      const pa = s.pendingAction
      if (!pa) return state

      const creditorId = pa.actingPlayerId
      s = applyPayment(s, payerId, creditorId, payerCards)

      // Property cards paid go to the collector's property area (not the pile) —
      // name them in the log so the transfer is transparent.
      const propsGiven = payerCards.filter(c => c._from === 'property')
      const propNote = propsGiven.length
        ? ` (${propsGiven.map(c => c.name).join(', ')} → ${s.players[creditorId].name})`
        : ''
      const log = `${s.players[payerId].name} ne ₹${payerCards.reduce((a, c) => a + c.value, 0)}Cr diya${propNote}.`
      s.log.push(log)

      // Move to next payer
      if (pa.type === 'rent') {
        pa.currentPayerIdx++
        if (pa.currentPayerIdx >= pa.payerIds.length) {
          s.pendingAction = null
          s.phase = nextPhaseAfterPlay(s)
        }
      } else if (pa.type === ACTION_TYPES.BIRTHDAY) {
        pa.currentTargetIdx++
        if (pa.currentTargetIdx >= pa.targetIds.length) {
          s.pendingAction = null
          s.phase = nextPhaseAfterPlay(s)
        }
      } else if (pa.type === ACTION_TYPES.DEBT_COLLECTOR) {
        s.pendingAction = null
        s.phase = nextPhaseAfterPlay(s)
      }
      s.pendingAction = pa
      const winner = checkWinner(s.players)
      if (winner) return { ...s, phase: PHASE.GAME_OVER, winner }
      return s
    }

    case 'JUST_SAY_NO': {
      const { playerId, jsnCardId } = action
      const s = deepClone(state)
      const player = s.players[playerId]
      const cardIdx = player.hand.findIndex(c => c.id === jsnCardId)
      if (cardIdx === -1) return state
      const [card] = player.hand.splice(cardIdx, 1)
      s.discard.push(card)
      s.log.push(`${player.name} ne "Just Say No!" bola!`)
      // Save the blocked action so the original actor can counter with their own JSN.
      s.pendingAction = {
        type: 'jsnBlock',
        jsnBlockerId: playerId,
        actingPlayerId: s.pendingAction?.actingPlayerId ?? s.currentPlayerIndex,
        savedAction: deepClone(s.pendingAction),
        savedPhase: s.phase,
      }
      s.phase = PHASE.JSN_RESPONSE
      return s
    }

    case 'COUNTER_JSN': {
      // Original actor plays their own JSN to cancel the block — action resumes.
      const { playerId, jsnCardId } = action
      const s = deepClone(state)
      const player = s.players[playerId]
      const cardIdx = player.hand.findIndex(c => c.id === jsnCardId)
      if (cardIdx === -1) return state
      const [card] = player.hand.splice(cardIdx, 1)
      s.discard.push(card)
      s.log.push(`${player.name} ne JSN ke against JSN bola! Action jaari hai!`)
      const saved = s.pendingAction.savedAction
      s.pendingAction = saved
      s.phase = s.pendingAction?.type === 'rent' ? PHASE.RENT_COLLECT : PHASE.ACTION_RESPONSE
      return s
    }

    case 'ACCEPT_JSN': {
      // Original actor accepts the block — action is cancelled.
      const s = deepClone(state)
      const saved = s.pendingAction?.savedAction
      // Special rule: JSN against a doubled rent cancels the doubling only;
      // the base rent still applies.
      if (saved?.type === 'rent' && saved.wasDoubled) {
        s.log.push(`Double Rent cancel hua — base rent ₹${saved.baseAmount}Cr baaki hai.`)
        s.pendingAction = { ...saved, amount: saved.baseAmount, wasDoubled: false }
        s.phase = PHASE.RENT_COLLECT
        return s
      }
      s.log.push('Action cancel ho gaya.')
      s.pendingAction = null
      s.phase = nextPhaseAfterPlay(s)
      return s
    }

    case 'SLY_DEAL_STEAL': {
      const { fromPlayerId, cardId, color } = action
      let s = deepClone(state)
      const thief = s.players[s.currentPlayerIndex]
      const victim = s.players[fromPlayerId]

      if (!victim.properties[color]) return state
      const cardIdx = victim.properties[color].findIndex(c => c.id === cardId)
      if (cardIdx === -1) return state

      // Can't steal from a complete set
      if (isSetComplete(color, victim.properties[color])) return state

      // Check if victim has Just Say No
      const hasJsn = victim.hand.some(c => c.actionType === ACTION_TYPES.JUST_SAY_NO)
      if (hasJsn) {
        s.pendingAction = {
          type: ACTION_TYPES.SLY_DEAL,
          actingPlayerId: s.currentPlayerIndex,
          targetPlayerId: fromPlayerId,
          cardId,
          color,
        }
        s.phase = PHASE.ACTION_RESPONSE
        s.log.push(`${victim.name} ko Sly Deal se bachne ka mauka! Just Say No?`)
        return s
      }

      s = executeSlyDeal(s, fromPlayerId, cardId, color)
      const winner = checkWinner(s.players)
      if (winner) return { ...s, phase: PHASE.GAME_OVER, winner }
      return s
    }

    case 'FORCED_DEAL_SWAP': {
      const { fromPlayerId, theirCardId, theirColor, myCardId, myColor } = action
      let s = deepClone(state)
      const player = s.players[s.currentPlayerIndex]
      const other = s.players[fromPlayerId]

      // Can't take from complete set
      if (isSetComplete(theirColor, other.properties[theirColor] || [])) return state

      const theirIdx = (other.properties[theirColor] || []).findIndex(c => c.id === theirCardId)
      const myIdx = (player.properties[myColor] || []).findIndex(c => c.id === myCardId)
      if (theirIdx === -1 || myIdx === -1) return state

      // Check if target has Just Say No
      const hasJsn = other.hand.some(c => c.actionType === ACTION_TYPES.JUST_SAY_NO)
      if (hasJsn) {
        s.pendingAction = {
          type: ACTION_TYPES.FORCED_DEAL,
          actingPlayerId: s.currentPlayerIndex,
          targetPlayerId: fromPlayerId,
          theirCardId,
          theirColor,
          myCardId,
          myColor,
        }
        s.phase = PHASE.ACTION_RESPONSE
        s.log.push(`${other.name} ko Forced Deal se bachne ka mauka! Just Say No?`)
        return s
      }

      s = executeForcedDealSwap(s, fromPlayerId, theirCardId, theirColor, myCardId, myColor)
      const winner = checkWinner(s.players)
      if (winner) return { ...s, phase: PHASE.GAME_OVER, winner }
      return s
    }

    case 'DEAL_BREAKER_STEAL': {
      const { fromPlayerId, color } = action
      const s = deepClone(state)
      const thief = s.players[s.currentPlayerIndex]
      const victim = s.players[fromPlayerId]

      if (!isSetComplete(color, victim.properties[color] || [])) return state

      // Insurance optional — victim decides whether to use it.
      if (victim.insurance) {
        s.pendingAction = {
          type: ACTION_TYPES.DEAL_BREAKER,
          actingPlayerId: s.currentPlayerIndex,
          targetPlayerId: fromPlayerId,
          color,
        }
        s.phase = PHASE.INSURANCE_RESPONSE
        s.log.push(`${victim.name} ke paas Insurance hai! Kya use karega?`)
        return s
      }

      // Check if victim has JSN
      const hasJsn = victim.hand.some(c => c.actionType === ACTION_TYPES.JUST_SAY_NO)
      if (hasJsn) {
        s.pendingAction = {
          type: ACTION_TYPES.DEAL_BREAKER,
          actingPlayerId: s.currentPlayerIndex,
          targetPlayerId: fromPlayerId,
          color,
        }
        s.phase = PHASE.ACTION_RESPONSE
        s.log.push(`${victim.name} ko Deal Breaker se bachne ka mauka! Just Say No?`)
        return s
      }

      return executeDealBreakerSteal(s, fromPlayerId, color)
    }

    case 'DEAL_BREAKER_ACCEPT': {
      const s = deepClone(state)
      const pa = s.pendingAction
      if (!pa || pa.type !== ACTION_TYPES.DEAL_BREAKER) return state
      return executeDealBreakerSteal(s, pa.targetPlayerId, pa.color)
    }

    case 'USE_INSURANCE': {
      const s = deepClone(state)
      const pa = s.pendingAction
      if (!pa || pa.type !== ACTION_TYPES.DEAL_BREAKER) return state
      const victim = s.players[pa.targetPlayerId]
      if (!victim.insurance) return state
      s.discard.push(victim.insurance)
      victim.insurance = null
      s.log.push(`${victim.name} ne Insurance use kiya — ${s.players[pa.actingPlayerId].name} ka Deal Breaker rok diya! 🛡️`)
      s.pendingAction = null
      s.phase = nextPhaseAfterPlay(s)
      return s
    }

    case 'DECLINE_INSURANCE': {
      const s = deepClone(state)
      const pa = s.pendingAction
      if (!pa || pa.type !== ACTION_TYPES.DEAL_BREAKER) return state
      // Insurance nahi use kiya — proceed to JSN check
      const victim = s.players[pa.targetPlayerId]
      const hasJsn = victim.hand.some(c => c.actionType === ACTION_TYPES.JUST_SAY_NO)
      if (hasJsn) {
        s.phase = PHASE.ACTION_RESPONSE
        s.log.push(`${victim.name} ne Insurance nahi use kiya. Just Say No?`)
        return s
      }
      return executeDealBreakerSteal(s, pa.targetPlayerId, pa.color)
    }

    case 'SLY_DEAL_ACCEPT': {
      let s = deepClone(state)
      const pa = s.pendingAction
      if (!pa || pa.type !== ACTION_TYPES.SLY_DEAL) return state
      s = executeSlyDeal(s, pa.targetPlayerId, pa.cardId, pa.color)
      const winner = checkWinner(s.players)
      if (winner) return { ...s, phase: PHASE.GAME_OVER, winner }
      return s
    }

    case 'FORCED_DEAL_ACCEPT': {
      let s = deepClone(state)
      const pa = s.pendingAction
      if (!pa || pa.type !== ACTION_TYPES.FORCED_DEAL) return state
      s = executeForcedDealSwap(s, pa.targetPlayerId, pa.theirCardId, pa.theirColor, pa.myCardId, pa.myColor)
      const winner = checkWinner(s.players)
      if (winner) return { ...s, phase: PHASE.GAME_OVER, winner }
      return s
    }

    case 'PLACE_HOUSE': {
      const { color } = action
      const s = deepClone(state)
      const player = s.players[s.currentPlayerIndex]
      if (!player.buildings) player.buildings = {}
      if (!player.buildings[color]) player.buildings[color] = { houses: 0, hotels: 0 }
      player.buildings[color].houses++
      s.log.push(`${player.name} ne ${color} pe ghar banaya!`)
      s.pendingAction = null
      s.phase = nextPhaseAfterPlay(s)
      return s
    }

    case 'PLACE_HOTEL': {
      const { color } = action
      const s = deepClone(state)
      const player = s.players[s.currentPlayerIndex]
      if (!player.buildings) player.buildings = {}
      if (!player.buildings[color]) player.buildings[color] = { houses: 0, hotels: 0 }
      player.buildings[color].hotels++
      s.log.push(`${player.name} ne ${color} pe hotel banaya!`)
      s.pendingAction = null
      s.phase = nextPhaseAfterPlay(s)
      return s
    }

    case 'SABOTAGE_SWAP': {
      const { opponentAId, cardAId, colorA, opponentBId, cardBId, colorB } = action
      const s = deepClone(state)
      const pa = s.pendingAction
      if (!pa || pa.type !== ACTION_TYPES.SABOTAGE) return state

      // Commit the Sabotage card to discard now.
      const player = s.players[pa.actingPlayerId]
      const cardIdx = player.hand.findIndex(c => c.id === pa.cardId)
      if (cardIdx === -1) return state
      const [sabotageCard] = player.hand.splice(cardIdx, 1)
      s.discard.push(sabotageCard)
      s.cardsPlayedThisTurn++

      const opponentA = s.players[opponentAId]
      const opponentB = s.players[opponentBId]

      // Can't take from complete sets
      if (isSetComplete(colorA, opponentA.properties[colorA] || [])) return state
      if (isSetComplete(colorB, opponentB.properties[colorB] || [])) return state

      const idxA = (opponentA.properties[colorA] || []).findIndex(c => c.id === cardAId)
      const idxB = (opponentB.properties[colorB] || []).findIndex(c => c.id === cardBId)
      if (idxA === -1 || idxB === -1) return state

      const [cardA] = opponentA.properties[colorA].splice(idxA, 1)
      const [cardB] = opponentB.properties[colorB].splice(idxB, 1)

      if (opponentA.properties[colorA].length === 0) delete opponentA.properties[colorA]
      if (opponentB.properties[colorB].length === 0) delete opponentB.properties[colorB]

      deactivateBuildings(opponentA, colorA)
      deactivateBuildings(opponentB, colorB)

      cardA.color = colorA
      cardB.color = colorB

      if (!opponentA.properties[colorB]) opponentA.properties[colorB] = []
      opponentA.properties[colorB].push(cardB)
      reactivateBuildings(opponentA, colorB)

      if (!opponentB.properties[colorA]) opponentB.properties[colorA] = []
      opponentB.properties[colorA].push(cardA)
      reactivateBuildings(opponentB, colorA)

      s.log.push(`${s.players[pa.actingPlayerId].name} ne Sabotage khela — ${opponentA.name} aur ${opponentB.name} ke beech swap!`)
      s.pendingAction = null
      s.phase = nextPhaseAfterPlay(s)
      const winner = checkWinner(s.players)
      if (winner) return { ...s, phase: PHASE.GAME_OVER, winner }
      return s
    }

    case 'SELECT_WILD_COLOR': {
      const { targetColor } = action
      const s = deepClone(state)
      const pending = s.pendingAction
      if (!pending) return state
      s.pendingAction = null
      s.phase = PHASE.PLAY
      if (pending.isChange) {
        return gameReducer(s, { type: 'CHANGE_WILD_COLOR', cardId: pending.cardId, newColor: targetColor })
      }
      return gameReducer(s, { type: 'PLAY_PROPERTY', cardId: pending.cardId, targetColor })
    }

    case 'DISCARD_CARD': {
      const s = deepClone(state)
      const player = s.players[s.currentPlayerIndex]
      const idx = player.hand.findIndex(c => c.id === action.cardId)
      if (idx === -1) return state
      const [card] = player.hand.splice(idx, 1)
      s.discard.push(card)
      if (player.hand.length <= 7) {
        s.phase = PHASE.PLAY
        s.passGoDrawnIds = null
      }
      return s
    }

    case 'END_TURN': {
      const s = endTurn(state)
      return { ...s, passGoDrawnIds: null }
    }

    case '_CANCEL_PENDING': {
      const s = deepClone(state)
      const pa = s.pendingAction
      if (pa?.card) {
        const discardIdx = s.discard.findIndex(c => c.id === pa.card.id)
        if (discardIdx !== -1) s.discard.splice(discardIdx, 1)
        s.players[pa.actingPlayerId].hand.push(pa.card)
        s.cardsPlayedThisTurn--
      }
      s.pendingAction = null
      s.phase = PHASE.PLAY
      return s
    }

    default:
      return state
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, null)
  const startGame = useCallback((playerNames) => {
    dispatch({ type: '_INIT', _state: initGame(playerNames) })
  }, [])

  const realDispatch = useCallback((action) => {
    if (action.type === '_INIT') {
      // handled separately
    }
    dispatch(action)
  }, [])

  return [state, dispatch]
}

// We need a custom init action handler — let's patch the reducer
const originalReducer = gameReducer
export function patchedGameReducer(state, action) {
  if (action.type === '_INIT') return action._state
  return originalReducer(state, action)
}
