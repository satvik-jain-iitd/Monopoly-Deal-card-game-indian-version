import { useState } from 'react'
import { PHASE } from '../../game/gameLogic'
import { CARD_TYPES, ACTION_TYPES, COLOR_DISPLAY, PROPERTY_SETS, COLORS } from '../../game/constants'
import { isSetComplete, countCompleteSets, getRentForColor } from '../../game/gameLogic'
import PlayerBoard from '../game/PlayerBoard'
import CardHand from '../game/CardHand'
import ActionModal from '../game/ActionModal'
import GameLog from '../game/GameLog'
import WinScreen from '../game/WinScreen'
import PassDeviceModal from '../game/PassDeviceModal'
import '../../styles/GameScreen.css'

export default function GameScreen({ state, dispatch, onHome }) {
  const [showLog, setShowLog] = useState(false)
  const [showPassModal, setShowPassModal] = useState(false)
  const [passConfirmed, setPassConfirmed] = useState(false)
  const [selectedCard, setSelectedCard] = useState(null)
  const [selectedAction, setSelectedAction] = useState(null) // { type, data }

  const currentPlayer = state.players[state.currentPlayerIndex]
  const isMyTurn = !showPassModal && passConfirmed

  // ── GAME OVER ──────────────────────────────────────────────────────
  if (state.phase === PHASE.GAME_OVER) {
    return <WinScreen winner={state.winner} players={state.players} onHome={onHome} />
  }

  // ── PASS DEVICE SCREEN ─────────────────────────────────────────────
  if (!passConfirmed) {
    return (
      <PassDeviceModal
        playerName={currentPlayer.name}
        onConfirm={() => setPassConfirmed(true)}
      />
    )
  }

  // ── DRAW PHASE ─────────────────────────────────────────────────────
  if (state.phase === PHASE.DRAW) {
    return (
      <div className="game-screen">
        <div className="turn-banner">
          <span className="turn-name">{currentPlayer.name}</span> ki baari!
        </div>
        <div className="draw-prompt">
          <div className="deck-visual">🃏</div>
          <p>{currentPlayer.hand.length === 0 ? '5 cards draw karo!' : '2 cards draw karo!'}</p>
          <button className="btn-primary btn-large" onClick={() => dispatch({ type: 'START_TURN' })}>
            Cards Draw Karo
          </button>
        </div>
      </div>
    )
  }

  // ── DISCARD PHASE ──────────────────────────────────────────────────
  if (state.phase === PHASE.DISCARD) {
    const excess = currentPlayer.hand.length - 7
    return (
      <div className="game-screen">
        <div className="turn-banner discard">
          {excess > 0 ? `${excess} card(s) discard karo (max 7)` : 'Discard complete!'}
        </div>
        <CardHand
          cards={currentPlayer.hand}
          selectable
          onCardClick={(card) => {
            if (excess > 0) dispatch({ type: 'DISCARD_CARD', cardId: card.id })
          }}
          label="Kaunsa card haटaoge?"
        />
        {excess <= 0 && (
          <button className="btn-primary" onClick={() => {
            dispatch({ type: 'END_TURN' })
            setPassConfirmed(false)
            setSelectedCard(null)
          }}>
            Turn Khatam
          </button>
        )}
      </div>
    )
  }

  // ── ACTION RESPONSE PHASES ─────────────────────────────────────────
  if ([PHASE.ACTION_RESPONSE, PHASE.RENT_COLLECT, PHASE.BIRTHDAY_COLLECT,
    PHASE.SLY_DEAL_SELECT, PHASE.FORCED_DEAL_SELECT, PHASE.DEAL_BREAKER_SELECT,
    PHASE.WILD_COLOR_SELECT].includes(state.phase)) {
    return (
      <ActionModal
        state={state}
        dispatch={dispatch}
        onDone={() => {
          setSelectedCard(null)
          setSelectedAction(null)
        }}
      />
    )
  }

  // ── MAIN PLAY PHASE ────────────────────────────────────────────────
  const cardsLeft = state.maxCardsPerTurn - state.cardsPlayedThisTurn
  const otherPlayers = state.players.filter((_, i) => i !== state.currentPlayerIndex)

  function handleCardSelect(card) {
    setSelectedCard(selectedCard?.id === card.id ? null : card)
    setSelectedAction(null)
  }

  function handlePlayCard() {
    if (!selectedCard) return
    const card = selectedCard
    setSelectedCard(null)

    if (card.type === CARD_TYPES.MONEY || card.type === CARD_TYPES.ACTION &&
      [ACTION_TYPES.JUST_SAY_NO, ACTION_TYPES.DOUBLE_RENT].includes(card.actionType)) {
      // Money & some actions can go to bank
      setSelectedAction({ type: 'choose', card })
    } else if (card.type === CARD_TYPES.PROPERTY || card.type === CARD_TYPES.WILD_PROPERTY) {
      dispatch({ type: 'PLAY_PROPERTY', cardId: card.id })
    } else if (card.type === CARD_TYPES.ACTION) {
      dispatch({ type: 'PLAY_ACTION', cardId: card.id })
    } else if (card.type === CARD_TYPES.RENT) {
      setSelectedAction({ type: 'rent', card })
    }
  }

  return (
    <div className="game-screen">
      {/* Header */}
      <div className="game-header">
        <button className="btn-icon" onClick={() => setShowLog(!showLog)}>📋</button>
        <div className="turn-info">
          <span className="turn-name">{currentPlayer.name}</span>
          <span className="cards-left"> · {cardsLeft} plays left</span>
          {state.doubleRentActive && <span className="double-rent-badge">2x RENT!</span>}
        </div>
        <button className="btn-icon" onClick={onHome}>🏠</button>
      </div>

      {showLog && <GameLog logs={state.log} onClose={() => setShowLog(false)} />}

      {/* Other players' boards (collapsed) */}
      <div className="other-players">
        {otherPlayers.map(p => (
          <PlayerBoard key={p.id} player={p} compact />
        ))}
      </div>

      {/* Current player's full board */}
      <PlayerBoard player={currentPlayer} full />

      {/* Hand */}
      <div className="hand-area">
        <CardHand
          cards={currentPlayer.hand}
          selectable
          selectedId={selectedCard?.id}
          onCardClick={handleCardSelect}
          label={`Haath mein ${currentPlayer.hand.length} cards`}
        />
      </div>

      {/* Action bar */}
      <div className="action-bar">
        {selectedCard && !selectedAction && (
          <PlayOptions
            card={selectedCard}
            onPlayAsProperty={() => dispatch({ type: 'PLAY_PROPERTY', cardId: selectedCard.id }) || setSelectedCard(null)}
            onPlayAsMoney={() => dispatch({ type: 'PLAY_AS_MONEY', cardId: selectedCard.id }) || setSelectedCard(null)}
            onPlayAction={() => dispatch({ type: 'PLAY_ACTION', cardId: selectedCard.id }) || setSelectedCard(null)}
            onPlayRent={() => setSelectedAction({ type: 'rent', card: selectedCard })}
            onCancel={() => setSelectedCard(null)}
          />
        )}
        {selectedAction?.type === 'rent' && (
          <RentSelector
            card={selectedAction.card}
            currentPlayer={currentPlayer}
            allPlayers={state.players}
            currentIdx={state.currentPlayerIndex}
            doubleRentActive={state.doubleRentActive}
            onPlay={(targetColor, targetPlayerId) => {
              dispatch({ type: 'PLAY_RENT', cardId: selectedAction.card.id, targetColor, targetPlayerId })
              setSelectedAction(null)
            }}
            onCancel={() => setSelectedAction(null)}
          />
        )}
        {!selectedCard && !selectedAction && cardsLeft > 0 && (
          <p className="hint-text">Ek card select karo play karne ke liye</p>
        )}
        {!selectedCard && !selectedAction && cardsLeft <= 0 && (
          <button className="btn-primary" onClick={() => {
            dispatch({ type: 'END_TURN' })
            setPassConfirmed(false)
            setSelectedCard(null)
          }}>
            Turn Khatam → Pass Karo
          </button>
        )}
        {!selectedCard && !selectedAction && cardsLeft > 0 && currentPlayer.hand.length > 0 && (
          <button className="btn-secondary" onClick={() => {
            dispatch({ type: 'END_TURN' })
            setPassConfirmed(false)
            setSelectedCard(null)
          }}>
            Turn End Karo
          </button>
        )}
      </div>
    </div>
  )
}

function PlayOptions({ card, onPlayAsProperty, onPlayAsMoney, onPlayAction, onPlayRent, onCancel }) {
  const isProperty = card.type === CARD_TYPES.PROPERTY || card.type === CARD_TYPES.WILD_PROPERTY
  const isMoney = card.type === CARD_TYPES.MONEY
  const isAction = card.type === CARD_TYPES.ACTION
  const isRent = card.type === CARD_TYPES.RENT

  return (
    <div className="play-options">
      <p className="selected-card-name">{card.name} — kya karna hai?</p>
      <div className="play-btn-row">
        {isProperty && (
          <button className="btn-play" onClick={onPlayAsProperty}>
            🏠 Property Lagao
          </button>
        )}
        {isRent && (
          <button className="btn-play" onClick={onPlayRent}>
            💰 Rent Maango
          </button>
        )}
        {isAction && (
          <button className="btn-play" onClick={onPlayAction}>
            ⚡ Action Khelo
          </button>
        )}
        {!isMoney && (
          <button className="btn-play btn-bank" onClick={onPlayAsMoney}>
            🏦 Bank Mein Daalo (${card.value}M)
          </button>
        )}
        {isMoney && (
          <button className="btn-play" onClick={onPlayAsMoney}>
            🏦 Bank Mein Daalo
          </button>
        )}
        <button className="btn-cancel" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}

function RentSelector({ card, currentPlayer, allPlayers, currentIdx, doubleRentActive, onPlay, onCancel }) {
  const [selectedColor, setSelectedColor] = useState(null)
  const [selectedTarget, setSelectedTarget] = useState(null)

  const eligibleColors = Object.keys(currentPlayer.properties).filter(color => {
    if (!card.wild) return card.colors.includes(color)
    return true
  })

  const otherPlayers = allPlayers.filter((_, i) => i !== currentIdx)

  function getRent(color) {
    const count = (currentPlayer.properties[color] || []).length
    let r = getRentForColor(color, count, currentPlayer.buildings)
    if (doubleRentActive) r *= 2
    return r
  }

  return (
    <div className="rent-selector">
      <p className="rent-label">Kaunse color ka rent maangoge?</p>
      <div className="color-chips">
        {eligibleColors.map(color => (
          <button
            key={color}
            className={`color-chip ${selectedColor === color ? 'selected' : ''}`}
            style={{ background: COLOR_DISPLAY[color]?.hex || '#888' }}
            onClick={() => setSelectedColor(color)}
          >
            {COLOR_DISPLAY[color]?.name} (${getRent(color)}M)
          </button>
        ))}
      </div>

      {card.wild && selectedColor && (
        <>
          <p className="rent-label">Kisse rent maangoge?</p>
          <div className="player-chips">
            {otherPlayers.map(p => (
              <button
                key={p.id}
                className={`player-chip ${selectedTarget === p.id ? 'selected' : ''}`}
                onClick={() => setSelectedTarget(p.id)}
              >
                {p.name}
              </button>
            ))}
          </div>
        </>
      )}

      <div className="rent-actions">
        <button
          className="btn-primary"
          disabled={!selectedColor || (card.wild && selectedTarget === null)}
          onClick={() => onPlay(selectedColor, selectedTarget)}
        >
          Rent Maango! 💰
        </button>
        <button className="btn-cancel" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}
