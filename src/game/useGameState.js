import { useReducer, useCallback } from 'react'
import {
  initGame, startTurn, endTurn, drawCards,
  playCardToBank, playPropertyCard, applyPayment,
  collectPayment, checkWinner, countCompleteSets,
  getRentForColor, isSetComplete, getPlayerBankTotal,
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
          const drawn = s.deck.splice(0, 2)
          player.hand.push(...drawn)
          s.log.push(`${player.name} ne Pass Go khela — 2 extra cards mile!`)
          s.phase = nextPhaseAfterPlay(s)
          return s
        }
        case ACTION_TYPES.DOUBLE_RENT: {
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
          }
          return s
        }
        case ACTION_TYPES.HOUSE: {
          // Can only play on a complete set (not railroad/utility)
          player.hand.splice(cardIdx, 1)
          s.discard.push(card)
          s.cardsPlayedThisTurn++
          // pendingAction for picking which color set
          s.pendingAction = { type: ACTION_TYPES.HOUSE, actingPlayerId: s.currentPlayerIndex }
          s.phase = PHASE.ACTION_RESPONSE
          return s
        }
        case ACTION_TYPES.HOTEL: {
          player.hand.splice(cardIdx, 1)
          s.discard.push(card)
          s.cardsPlayedThisTurn++
          s.pendingAction = { type: ACTION_TYPES.HOTEL, actingPlayerId: s.currentPlayerIndex }
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
        case ACTION_TYPES.TRADE_ROUTE: {
          // Two-step selection — the card is only committed on swap, so a
          // cancel costs nothing (the discard pile may have no usable property).
          s.phase = PHASE.TRADE_ROUTE_SELECT
          s.pendingAction = { type: ACTION_TYPES.TRADE_ROUTE, actingPlayerId: s.currentPlayerIndex, cardId }
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
      const card = player.hand[cardIdx]

      player.hand.splice(cardIdx, 1)
      s.discard.push(card)
      s.cardsPlayedThisTurn++

      const playerProps = player.properties[targetColor] || []
      const count = playerProps.length
      let rentAmount = getRentForColor(targetColor, count, player.buildings)
      if (s.doubleRentActive) { rentAmount *= 2; s.doubleRentActive = false }

      // Determine who pays
      const payerIds = card.wild
        ? (targetPlayerId !== undefined ? [targetPlayerId] : [])
        : s.players.map((_, i) => i).filter(i => i !== s.currentPlayerIndex)

      s.log.push(`${player.name} ne ${targetColor} ka rent maanga — ₹${rentAmount}Cr!`)
      s.phase = PHASE.RENT_COLLECT
      s.pendingAction = {
        type: 'rent',
        actingPlayerId: s.currentPlayerIndex,
        payerIds,
        currentPayerIdx: 0,
        amount: rentAmount,
        targetColor,
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
      s.log.push(`${player.name} ne "Just Say No!" bola! Action cancel ho gaya.`)
      s.pendingAction = null
      s.phase = nextPhaseAfterPlay(s)
      return s
    }

    case 'SLY_DEAL_STEAL': {
      const { fromPlayerId, cardId, color } = action
      const s = deepClone(state)
      const thief = s.players[s.currentPlayerIndex]
      const victim = s.players[fromPlayerId]

      if (!victim.properties[color]) return state
      const cardIdx = victim.properties[color].findIndex(c => c.id === cardId)
      if (cardIdx === -1) return state

      // Can't steal from a complete set
      if (isSetComplete(color, victim.properties[color])) return state

      const [stolen] = victim.properties[color].splice(cardIdx, 1)
      if (victim.properties[color].length === 0) delete victim.properties[color]
      if (!thief.properties[color]) thief.properties[color] = []
      stolen.color = color
      thief.properties[color].push(stolen)

      s.log.push(`${thief.name} ne ${victim.name} se ${stolen.name} chura liya!`)
      s.pendingAction = null
      s.phase = nextPhaseAfterPlay(s)
      const winner = checkWinner(s.players)
      if (winner) return { ...s, phase: PHASE.GAME_OVER, winner }
      return s
    }

    case 'FORCED_DEAL_SWAP': {
      const { fromPlayerId, theirCardId, theirColor, myCardId, myColor } = action
      const s = deepClone(state)
      const player = s.players[s.currentPlayerIndex]
      const other = s.players[fromPlayerId]

      // Can't take from complete set
      if (isSetComplete(theirColor, other.properties[theirColor] || [])) return state

      const theirIdx = (other.properties[theirColor] || []).findIndex(c => c.id === theirCardId)
      const myIdx = (player.properties[myColor] || []).findIndex(c => c.id === myCardId)
      if (theirIdx === -1 || myIdx === -1) return state

      const [theirCard] = other.properties[theirColor].splice(theirIdx, 1)
      const [myCard] = player.properties[myColor].splice(myIdx, 1)

      if (other.properties[theirColor].length === 0) delete other.properties[theirColor]
      if (player.properties[myColor].length === 0) delete player.properties[myColor]

      theirCard.color = theirColor
      myCard.color = myColor

      if (!player.properties[theirColor]) player.properties[theirColor] = []
      player.properties[theirColor].push(theirCard)

      if (!other.properties[myColor]) other.properties[myColor] = []
      other.properties[myColor].push(myCard)

      s.log.push(`${player.name} ne ${other.name} ke saath deal force ki!`)
      s.pendingAction = null
      s.phase = nextPhaseAfterPlay(s)
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

      // Insurance auto-cancels a Deal Breaker (no Just Say No needed).
      if (victim.insurance) {
        s.discard.push(victim.insurance)
        victim.insurance = null
        s.log.push(`${victim.name} ke Insurance ne ${thief.name} ka Deal Breaker rok diya! 🛡️`)
        s.pendingAction = null
        s.phase = nextPhaseAfterPlay(s)
        return s
      }

      const set = victim.properties[color]
      delete victim.properties[color]
      if (victim.buildings?.[color]) delete victim.buildings[color]

      if (!thief.properties[color]) thief.properties[color] = []
      thief.properties[color].push(...set)

      s.log.push(`${thief.name} ne ${victim.name} ka poora ${color} set chura liya! Deal Breaker!`)
      s.pendingAction = null
      s.phase = nextPhaseAfterPlay(s)
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

    case 'TRADE_ROUTE_SWAP': {
      const { discardCardId, takeCardId } = action
      const s = deepClone(state)
      const pa = s.pendingAction
      if (!pa || pa.type !== ACTION_TYPES.TRADE_ROUTE) return state
      const player = s.players[s.currentPlayerIndex]

      const trCard = player.hand.find(c => c.id === pa.cardId)
      const handProp = player.hand.find(c => c.id === discardCardId)
      const takeCard = s.discard.find(c => c.id === takeCardId)
      if (!trCard || !handProp || !takeCard) return state
      // Must take a property of a *different* colour than the one discarded.
      if (takeCard.color === handProp.color) return state

      // Trade Route action card + the chosen hand property leave the hand → discard.
      player.hand = player.hand.filter(c => c.id !== pa.cardId && c.id !== discardCardId)
      s.discard = s.discard.filter(c => c.id !== takeCardId)
      s.discard.push(trCard, handProp)
      delete takeCard._from
      player.hand.push(takeCard)

      s.cardsPlayedThisTurn++
      s.log.push(`${player.name} ne Trade Route khela — ${handProp.name} di, ${takeCard.name} li.`)
      s.pendingAction = null
      s.phase = nextPhaseAfterPlay(s)
      return s
    }

    case 'SELECT_WILD_COLOR': {
      const { targetColor } = action
      const s = deepClone(state)
      const pending = s.pendingAction
      s.pendingAction = null
      s.phase = PHASE.PLAY
      return gameReducer(s, { type: 'PLAY_PROPERTY', cardId: pending.cardId, targetColor })
    }

    case 'DISCARD_CARD': {
      const s = deepClone(state)
      const player = s.players[s.currentPlayerIndex]
      const idx = player.hand.findIndex(c => c.id === action.cardId)
      if (idx === -1) return state
      const [card] = player.hand.splice(idx, 1)
      s.discard.push(card)
      if (player.hand.length <= 7) s.phase = PHASE.PLAY
      return s
    }

    case 'END_TURN': {
      return endTurn(state)
    }

    case '_CANCEL_PENDING': {
      const s = deepClone(state)
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
