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

function gameReducer(state, action) {
  switch (action.type) {

    case 'START_TURN': {
      const s = startTurn(state)
      const winner = checkWinner(s.players)
      if (winner) return { ...s, phase: PHASE.GAME_OVER, winner }
      return s
    }

    case 'PLAY_AS_MONEY': {
      const s = playCardToBank(state, state.currentPlayerIndex, action.cardId)
      const winner = checkWinner(s.players)
      if (winner) return { ...s, phase: PHASE.GAME_OVER, winner }
      if (s.cardsPlayedThisTurn >= s.maxCardsPerTurn) {
        return { ...s, phase: PHASE.DISCARD }
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
        return { ...s, phase: PHASE.DISCARD }
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
          if (s.cardsPlayedThisTurn >= s.maxCardsPerTurn) s.phase = PHASE.DISCARD
          return s
        }
        case ACTION_TYPES.DOUBLE_RENT: {
          player.hand.splice(cardIdx, 1)
          s.discard.push(card)
          s.cardsPlayedThisTurn++
          s.doubleRentActive = true
          s.log.push(`${player.name} ne Double The Rent lagaaya!`)
          if (s.cardsPlayedThisTurn >= s.maxCardsPerTurn) s.phase = PHASE.DISCARD
          return s
        }
        case ACTION_TYPES.BIRTHDAY: {
          player.hand.splice(cardIdx, 1)
          s.discard.push(card)
          s.cardsPlayedThisTurn++
          s.log.push(`${player.name} ka birthday hai! Sabko $2M dena hoga.`)
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

      s.log.push(`${player.name} ne ${targetColor} ka rent maanga — $${rentAmount}M!`)
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

      const log = `${s.players[payerId].name} ne $${payerCards.reduce((a,c) => a+c.value,0)}M diya.`
      s.log.push(log)

      // Move to next payer
      if (pa.type === 'rent') {
        pa.currentPayerIdx++
        if (pa.currentPayerIdx >= pa.payerIds.length) {
          s.pendingAction = null
          s.phase = s.cardsPlayedThisTurn >= s.maxCardsPerTurn ? PHASE.DISCARD : PHASE.PLAY
        }
      } else if (pa.type === ACTION_TYPES.BIRTHDAY) {
        pa.currentTargetIdx++
        if (pa.currentTargetIdx >= pa.targetIds.length) {
          s.pendingAction = null
          s.phase = s.cardsPlayedThisTurn >= s.maxCardsPerTurn ? PHASE.DISCARD : PHASE.PLAY
        }
      } else if (pa.type === ACTION_TYPES.DEBT_COLLECTOR) {
        s.pendingAction = null
        s.phase = s.cardsPlayedThisTurn >= s.maxCardsPerTurn ? PHASE.DISCARD : PHASE.PLAY
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
      s.phase = s.cardsPlayedThisTurn >= s.maxCardsPerTurn ? PHASE.DISCARD : PHASE.PLAY
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
      s.phase = s.cardsPlayedThisTurn >= s.maxCardsPerTurn ? PHASE.DISCARD : PHASE.PLAY
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
      s.phase = s.cardsPlayedThisTurn >= s.maxCardsPerTurn ? PHASE.DISCARD : PHASE.PLAY
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

      const set = victim.properties[color]
      delete victim.properties[color]
      if (victim.buildings?.[color]) delete victim.buildings[color]

      if (!thief.properties[color]) thief.properties[color] = []
      thief.properties[color].push(...set)

      s.log.push(`${thief.name} ne ${victim.name} ka poora ${color} set chura liya! Deal Breaker!`)
      s.pendingAction = null
      s.phase = s.cardsPlayedThisTurn >= s.maxCardsPerTurn ? PHASE.DISCARD : PHASE.PLAY
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
      s.phase = s.cardsPlayedThisTurn >= s.maxCardsPerTurn ? PHASE.DISCARD : PHASE.PLAY
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
      s.phase = s.cardsPlayedThisTurn >= s.maxCardsPerTurn ? PHASE.DISCARD : PHASE.PLAY
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
