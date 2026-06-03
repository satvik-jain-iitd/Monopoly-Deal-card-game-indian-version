import { useState } from 'react'
import { PHASE } from '../../game/gameLogic'
import { ACTION_TYPES, COLOR_DISPLAY, CARD_TYPES, PROPERTY_SETS, COLORS } from '../../game/constants'
import { isSetComplete, collectPayment, getPlayerBankTotal } from '../../game/gameLogic'
import Card from './Card'
import '../../styles/ActionModal.css'

export default function ActionModal({ state, dispatch, onDone }) {
  const { phase, pendingAction, players, currentPlayerIndex } = state
  const actor = players[pendingAction?.actingPlayerId ?? currentPlayerIndex]

  // ── WILD COLOR SELECTOR ────────────────────────────────────────────
  if (phase === PHASE.WILD_COLOR_SELECT) {
    const card = actor.hand.find(c => c.id === pendingAction.cardId)
    const isFullWild = card?.colors?.[0] === COLORS.WILD
    const colorOptions = isFullWild
      ? Object.keys(PROPERTY_SETS)
      : (card?.colors || [])

    return (
      <div className="modal-overlay">
        <div className="modal-box">
          <h3>Kaunse color mein lagaoge?</h3>
          <div className="color-grid">
            {colorOptions.map(color => (
              <button key={color}
                className="color-tile"
                style={{ background: COLOR_DISPLAY[color]?.hex, color: '#fff' }}
                onClick={() => dispatch({ type: 'SELECT_WILD_COLOR', targetColor: color })}>
                {COLOR_DISPLAY[color]?.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── RENT COLLECT ───────────────────────────────────────────────────
  if (phase === PHASE.RENT_COLLECT && pendingAction) {
    const { payerIds, currentPayerIdx, amount } = pendingAction
    if (currentPayerIdx >= payerIds.length) return null
    const payerId = payerIds[currentPayerIdx]
    const payer = players[payerId]
    return (
      <PaymentScreen
        payer={payer}
        creditor={actor}
        amount={amount}
        dispatch={dispatch}
        label={`${actor.name} ne rent maanga — $${amount}M do!`}
        actionType="PAY_DEBT"
        extraData={{ payerId }}
      />
    )
  }

  // ── BIRTHDAY COLLECT ───────────────────────────────────────────────
  if (phase === PHASE.ACTION_RESPONSE && pendingAction?.type === ACTION_TYPES.BIRTHDAY) {
    const { targetIds, currentTargetIdx, amountPerPlayer } = pendingAction
    if (!targetIds || currentTargetIdx >= targetIds.length) return null
    const payerId = targetIds[currentTargetIdx]
    const payer = players[payerId]
    return (
      <PaymentScreen
        payer={payer}
        creditor={actor}
        amount={amountPerPlayer}
        dispatch={dispatch}
        label={`${actor.name} ka birthday! Tumhe $${amountPerPlayer}M dena hai!`}
        actionType="PAY_DEBT"
        extraData={{ payerId }}
      />
    )
  }

  // ── DEBT COLLECTOR — pick target ───────────────────────────────────
  if (phase === PHASE.ACTION_RESPONSE && pendingAction?.type === ACTION_TYPES.DEBT_COLLECTOR) {
    if (!pendingAction.targetIds) {
      const others = players.filter((_, i) => i !== currentPlayerIndex)
      return (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Debt Collector — Kisse $5M loge?</h3>
            <div className="player-select-list">
              {others.map(p => (
                <button key={p.id} className="player-select-btn"
                  onClick={() => dispatch({ type: 'SELECT_TARGET_PLAYER', targetPlayerId: p.id })}>
                  {p.name} (Bank: ${getPlayerBankTotal(p)}M)
                </button>
              ))}
            </div>
          </div>
        </div>
      )
    }
    // Now collect from selected target
    const payerId = pendingAction.targetIds[0]
    const payer = players[payerId]
    return (
      <PaymentScreen
        payer={payer}
        creditor={actor}
        amount={pendingAction.amount}
        dispatch={dispatch}
        label={`${actor.name} collector ban gaya — $${pendingAction.amount}M do!`}
        actionType="PAY_DEBT"
        extraData={{ payerId }}
      />
    )
  }

  // ── HOUSE PLACEMENT ────────────────────────────────────────────────
  if (phase === PHASE.ACTION_RESPONSE && pendingAction?.type === ACTION_TYPES.HOUSE) {
    const eligibleColors = Object.keys(actor.properties).filter(color => {
      if (color === COLORS.RAILROAD || color === COLORS.UTILITY) return false
      const cards = actor.properties[color] || []
      const complete = isSetComplete(color, cards)
      const hasHouse = actor.buildings?.[color]?.houses > 0
      return complete && !hasHouse
    })
    return (
      <div className="modal-overlay">
        <div className="modal-box">
          <h3>Kaunse set pe ghar banayenge?</h3>
          {eligibleColors.length === 0 ? (
            <p>Koi eligible complete set nahi! (House ke liye complete set chahiye, railroad/utility nahi)</p>
          ) : (
            <div className="color-grid">
              {eligibleColors.map(color => (
                <button key={color} className="color-tile"
                  style={{ background: COLOR_DISPLAY[color]?.hex, color: '#fff' }}
                  onClick={() => dispatch({ type: 'PLACE_HOUSE', color })}>
                  {COLOR_DISPLAY[color]?.name}
                </button>
              ))}
            </div>
          )}
          <button className="btn-cancel mt" onClick={() => dispatch({ type: '_CANCEL_PENDING' })}>Cancel</button>
        </div>
      </div>
    )
  }

  // ── HOTEL PLACEMENT ────────────────────────────────────────────────
  if (phase === PHASE.ACTION_RESPONSE && pendingAction?.type === ACTION_TYPES.HOTEL) {
    const eligibleColors = Object.keys(actor.properties).filter(color => {
      if (color === COLORS.RAILROAD || color === COLORS.UTILITY) return false
      const cards = actor.properties[color] || []
      const complete = isSetComplete(color, cards)
      const hasHouse = actor.buildings?.[color]?.houses > 0
      const hasHotel = actor.buildings?.[color]?.hotels > 0
      return complete && hasHouse && !hasHotel
    })
    return (
      <div className="modal-overlay">
        <div className="modal-box">
          <h3>Kaunse set pe hotel banayenge?</h3>
          <p className="hint">(Pehle ghar chahiye)</p>
          {eligibleColors.length === 0 ? (
            <p>Koi eligible set nahi! (Pehle ghar banao)</p>
          ) : (
            <div className="color-grid">
              {eligibleColors.map(color => (
                <button key={color} className="color-tile"
                  style={{ background: COLOR_DISPLAY[color]?.hex, color: '#fff' }}
                  onClick={() => dispatch({ type: 'PLACE_HOTEL', color })}>
                  {COLOR_DISPLAY[color]?.name}
                </button>
              ))}
            </div>
          )}
          <button className="btn-cancel mt" onClick={() => dispatch({ type: '_CANCEL_PENDING' })}>Cancel</button>
        </div>
      </div>
    )
  }

  // ── SLY DEAL SELECT ────────────────────────────────────────────────
  if (phase === PHASE.SLY_DEAL_SELECT) {
    const others = players.filter((_, i) => i !== currentPlayerIndex)
    return (
      <StolenPropertySelector
        title="Sly Deal — Kaunsi property churaoge?"
        subtitle="(Incomplete sets se hi chura sakte ho)"
        others={others}
        canSteal={(player, color) => !isSetComplete(color, player.properties[color] || [])}
        onSelect={({ fromPlayerId, cardId, color }) =>
          dispatch({ type: 'SLY_DEAL_STEAL', fromPlayerId, cardId, color })}
      />
    )
  }

  // ── FORCED DEAL SELECT ─────────────────────────────────────────────
  if (phase === PHASE.FORCED_DEAL_SELECT) {
    return (
      <ForcedDealSelector
        currentPlayer={actor}
        others={players.filter((_, i) => i !== currentPlayerIndex)}
        onSwap={(data) => dispatch({ type: 'FORCED_DEAL_SWAP', ...data })}
      />
    )
  }

  // ── DEAL BREAKER SELECT ────────────────────────────────────────────
  if (phase === PHASE.DEAL_BREAKER_SELECT) {
    const others = players.filter((_, i) => i !== currentPlayerIndex)
    const targets = []
    for (const p of others) {
      for (const [color, cards] of Object.entries(p.properties)) {
        if (isSetComplete(color, cards)) {
          targets.push({ player: p, color })
        }
      }
    }
    return (
      <div className="modal-overlay">
        <div className="modal-box">
          <h3>Deal Breaker — Kaunsa complete set churaoge?</h3>
          {targets.length === 0 ? (
            <p>Kisi ke paas koi complete set nahi!</p>
          ) : (
            <div className="deal-breaker-list">
              {targets.map(({ player, color }) => (
                <button key={`${player.id}-${color}`} className="deal-breaker-btn"
                  style={{ borderColor: COLOR_DISPLAY[color]?.hex }}
                  onClick={() => dispatch({ type: 'DEAL_BREAKER_STEAL', fromPlayerId: player.id, color })}>
                  <span style={{ color: COLOR_DISPLAY[color]?.hex }}>■</span> {player.name} ka {COLOR_DISPLAY[color]?.name} set
                </button>
              ))}
            </div>
          )}
          <button className="btn-cancel mt" onClick={() => dispatch({ type: '_CANCEL_PENDING' })}>Cancel</button>
        </div>
      </div>
    )
  }

  return null
}

// ── PAYMENT SCREEN ─────────────────────────────────────────────────
function PaymentScreen({ payer, creditor, amount, dispatch, label, actionType, extraData }) {
  const [selectedAssets, setSelectedAssets] = useState([])
  const [passConfirmed, setPassConfirmed] = useState(false)

  const bankTotal = payer.bank.reduce((s, c) => s + c.value, 0)
  const allAssets = [
    ...payer.bank.map(c => ({ ...c, _from: 'bank', _color: null })),
    ...Object.entries(payer.properties).flatMap(([color, cards]) =>
      cards.map(c => ({ ...c, _from: 'property', _color: color }))),
  ]
  const totalSelected = selectedAssets.reduce((s, c) => s + c.value, 0)

  function toggleAsset(asset) {
    const exists = selectedAssets.find(a => a.id === asset.id)
    if (exists) setSelectedAssets(selectedAssets.filter(a => a.id !== asset.id))
    else setSelectedAssets([...selectedAssets, asset])
  }

  const jsnCard = payer.hand?.find(c => c.type === CARD_TYPES.ACTION && c.actionType === ACTION_TYPES.JUST_SAY_NO)

  if (!passConfirmed) {
    return (
      <div className="modal-overlay">
        <div className="modal-box">
          <p className="pass-prompt">📱 Device do <strong>{payer.name}</strong> ko</p>
          <button className="btn-primary" onClick={() => setPassConfirmed(true)}>
            Main {payer.name} hoon — Ready!
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box payment-box">
        <h3>{label}</h3>
        <p className="payment-info">
          Selected: ${totalSelected}M / ${amount}M needed
          {totalSelected >= amount && <span className="payment-ok"> ✓</span>}
        </p>

        {jsnCard && (
          <button className="btn-jsn"
            onClick={() => dispatch({ type: 'JUST_SAY_NO', playerId: payer.id, jsnCardId: jsnCard.id })}>
            🚫 Just Say No!
          </button>
        )}

        <div className="asset-label">Apni assets select karo:</div>
        <div className="asset-grid">
          {allAssets.map(asset => {
            const sel = !!selectedAssets.find(a => a.id === asset.id)
            return (
              <div key={asset.id}
                className={`asset-item ${sel ? 'selected' : ''}`}
                onClick={() => toggleAsset(asset)}>
                <Card card={asset} mini />
                <div className="asset-val">${asset.value}M</div>
              </div>
            )
          })}
          {allAssets.length === 0 && <p className="no-assets">Koi asset nahi — seedha pass!</p>}
        </div>

        <button
          className="btn-primary"
          disabled={totalSelected < amount && allAssets.length > 0}
          onClick={() => {
            dispatch({
              type: actionType,
              payerCards: selectedAssets.length > 0 ? selectedAssets : allAssets,
              payerId: payer.id,
              amount,
              ...extraData,
            })
          }}>
          {allAssets.length === 0 ? 'Pass (kuch nahi hai)' : `Pay $${Math.min(totalSelected, amount)}M`}
        </button>
      </div>
    </div>
  )
}

// ── STOLEN PROPERTY SELECTOR ───────────────────────────────────────
function StolenPropertySelector({ title, subtitle, others, canSteal, onSelect }) {
  const [selectedPlayer, setSelectedPlayer] = useState(null)

  const stealableProps = selectedPlayer
    ? Object.entries(selectedPlayer.properties)
        .filter(([color]) => canSteal(selectedPlayer, color))
        .flatMap(([color, cards]) => cards.map(c => ({ card: c, color, player: selectedPlayer })))
    : []

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>{title}</h3>
        {subtitle && <p className="hint">{subtitle}</p>}
        <div className="player-select-list">
          {others.map(p => (
            <button key={p.id}
              className={`player-select-btn ${selectedPlayer?.id === p.id ? 'active' : ''}`}
              onClick={() => setSelectedPlayer(p)}>
              {p.name}
            </button>
          ))}
        </div>
        {selectedPlayer && (
          <div className="stealable-grid">
            {stealableProps.length === 0 && <p>Koi stealable property nahi</p>}
            {stealableProps.map(({ card, color }) => (
              <div key={card.id} className="stealable-item"
                onClick={() => onSelect({ fromPlayerId: selectedPlayer.id, cardId: card.id, color })}>
                <Card card={card} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── FORCED DEAL SELECTOR ───────────────────────────────────────────
function ForcedDealSelector({ currentPlayer, others, onSwap }) {
  const [myColor, setMyColor] = useState(null)
  const [myCardId, setMyCardId] = useState(null)
  const [theirPlayer, setTheirPlayer] = useState(null)
  const [theirColor, setTheirColor] = useState(null)
  const [theirCardId, setTheirCardId] = useState(null)

  const myProps = Object.entries(currentPlayer.properties)
    .flatMap(([color, cards]) => cards.map(c => ({ card: c, color })))

  const theirProps = theirPlayer
    ? Object.entries(theirPlayer.properties)
        .filter(([color]) => !isSetComplete(color, theirPlayer.properties[color] || []))
        .flatMap(([color, cards]) => cards.map(c => ({ card: c, color })))
    : []

  const ready = myCardId && theirCardId

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>Forced Deal — Property Swap Karo</h3>

        <div className="fd-section">
          <p className="fd-label">Tumhari property (dogi):</p>
          <div className="stealable-grid">
            {myProps.map(({ card, color }) => (
              <div key={card.id}
                className={`stealable-item ${myCardId === card.id ? 'selected' : ''}`}
                onClick={() => { setMyCardId(card.id); setMyColor(color) }}>
                <Card card={card} />
              </div>
            ))}
          </div>
        </div>

        <div className="fd-section">
          <p className="fd-label">Kissa property loge?</p>
          <div className="player-select-list">
            {others.map(p => (
              <button key={p.id}
                className={`player-select-btn ${theirPlayer?.id === p.id ? 'active' : ''}`}
                onClick={() => setTheirPlayer(p)}>
                {p.name}
              </button>
            ))}
          </div>
          {theirPlayer && (
            <div className="stealable-grid">
              {theirProps.length === 0 && <p>Koi stealable property nahi</p>}
              {theirProps.map(({ card, color }) => (
                <div key={card.id}
                  className={`stealable-item ${theirCardId === card.id ? 'selected' : ''}`}
                  onClick={() => { setTheirCardId(card.id); setTheirColor(color) }}>
                  <Card card={card} />
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          className="btn-primary"
          disabled={!ready}
          onClick={() => onSwap({
            fromPlayerId: theirPlayer.id,
            theirCardId, theirColor,
            myCardId, myColor,
          })}>
          Swap Karo!
        </button>
      </div>
    </div>
  )
}
