import { useState } from 'react'
import {
  Box, Button, Chip, List, ListItemButton, ListItemText,
  Paper, SwipeableDrawer, Typography,
} from '@mui/material'
import BlockIcon from '@mui/icons-material/Block'
import { PHASE } from '../../game/gameLogic'
import { ACTION_TYPES, COLOR_DISPLAY, CARD_TYPES, PROPERTY_SETS, COLORS } from '../../game/constants'
import { isSetComplete, getPlayerBankTotal } from '../../game/gameLogic'
import Card from './Card'

const SheetHandle = () => (
  <Box sx={{ width: 40, height: 4, backgroundColor: 'divider', borderRadius: 2, mx: 'auto', mt: 1, mb: 0.5 }} />
)

function BottomSheet({ children, title }) {
  return (
    <SwipeableDrawer
      anchor="bottom"
      open
      onClose={() => {}}
      onOpen={() => {}}
      disableSwipeToOpen
      PaperProps={{
        sx: {
          borderTopLeftRadius: 20, borderTopRightRadius: 20,
          maxHeight: '85dvh',
          pb: 'max(16px, env(safe-area-inset-bottom))',
        },
      }}
    >
      <SheetHandle />
      {title && (
        <Typography variant="subtitle1" sx={{ fontWeight: 800, px: 2.5, pb: 1 }}>
          {title}
        </Typography>
      )}
      {children}
    </SwipeableDrawer>
  )
}

export default function ActionModal({ state, dispatch, onDone }) {
  const { phase, pendingAction, players, currentPlayerIndex } = state
  const actor = players[pendingAction?.actingPlayerId ?? currentPlayerIndex]

  // ── WILD COLOR SELECTOR ────────────────────────────────────────────
  if (phase === PHASE.WILD_COLOR_SELECT) {
    const card = actor.hand.find(c => c.id === pendingAction.cardId)
    const isFullWild = card?.colors?.[0] === COLORS.WILD
    const colorOptions = isFullWild ? Object.keys(PROPERTY_SETS) : (card?.colors || [])

    return (
      <BottomSheet title="Kaunse color mein lagaoge?">
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, px: 2.5, pb: 1 }}>
          {colorOptions.map(color => (
            <Chip
              key={color}
              label={COLOR_DISPLAY[color]?.name}
              onClick={() => dispatch({ type: 'SELECT_WILD_COLOR', targetColor: color })}
              sx={{
                backgroundColor: COLOR_DISPLAY[color]?.hex,
                color: '#fff',
                fontWeight: 700, fontSize: '0.8rem',
                height: 40,
                '&:hover': { opacity: 0.9 },
              }}
            />
          ))}
        </Box>
      </BottomSheet>
    )
  }

  // ── RENT COLLECT ───────────────────────────────────────────────────
  if (phase === PHASE.RENT_COLLECT && pendingAction) {
    const { payerIds, currentPayerIdx, amount } = pendingAction
    if (currentPayerIdx >= payerIds.length) return null
    const payerId = payerIds[currentPayerIdx]
    const payer = players[payerId]
    return (
      <PaymentSheet
        payer={payer} creditor={actor} amount={amount} dispatch={dispatch}
        label={`${actor.name} ne rent maanga — ₹${amount}Cr do!`}
        actionType="PAY_DEBT" extraData={{ payerId }}
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
      <PaymentSheet
        payer={payer} creditor={actor} amount={amountPerPlayer} dispatch={dispatch}
        label={`${actor.name} ka birthday! Tumhe ₹${amountPerPlayer}Cr dena hai!`}
        actionType="PAY_DEBT" extraData={{ payerId }}
      />
    )
  }

  // ── DEBT COLLECTOR ─────────────────────────────────────────────────
  if (phase === PHASE.ACTION_RESPONSE && pendingAction?.type === ACTION_TYPES.DEBT_COLLECTOR) {
    if (!pendingAction.targetIds) {
      const others = players.filter((_, i) => i !== currentPlayerIndex)
      return (
        <BottomSheet title="Debt Collector — Kisse ₹5Cr loge?">
          <List dense sx={{ px: 1 }}>
            {others.map(p => (
              <ListItemButton key={p.id} sx={{ borderRadius: 2, mb: 0.5 }}
                onClick={() => dispatch({ type: 'SELECT_TARGET_PLAYER', targetPlayerId: p.id })}>
                <ListItemText
                  primary={p.name}
                  secondary={`Bank: ₹${getPlayerBankTotal(p)}Cr`}
                  primaryTypographyProps={{ fontWeight: 700 }}
                />
              </ListItemButton>
            ))}
          </List>
        </BottomSheet>
      )
    }
    const payerId = pendingAction.targetIds[0]
    const payer = players[payerId]
    return (
      <PaymentSheet
        payer={payer} creditor={actor} amount={pendingAction.amount} dispatch={dispatch}
        label={`${actor.name} collector ban gaya — ₹${pendingAction.amount}Cr do!`}
        actionType="PAY_DEBT" extraData={{ payerId }}
      />
    )
  }

  // ── HOUSE PLACEMENT ────────────────────────────────────────────────
  if (phase === PHASE.ACTION_RESPONSE && pendingAction?.type === ACTION_TYPES.HOUSE) {
    const eligibleColors = Object.keys(actor.properties).filter(color => {
      if (color === COLORS.RAILROAD || color === COLORS.UTILITY) return false
      const cards = actor.properties[color] || []
      return isSetComplete(color, cards) && !(actor.buildings?.[color]?.houses > 0)
    })
    return (
      <BottomSheet title="Kaunse set pe ghar banayenge?">
        {eligibleColors.length === 0 ? (
          <Typography variant="body2" sx={{ px: 2.5, color: 'text.secondary', pb: 1 }}>
            Koi eligible complete set nahi! (House ke liye complete set chahiye)
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, px: 2.5, pb: 1 }}>
            {eligibleColors.map(color => (
              <Chip key={color}
                label={COLOR_DISPLAY[color]?.name}
                onClick={() => dispatch({ type: 'PLACE_HOUSE', color })}
                sx={{ backgroundColor: COLOR_DISPLAY[color]?.hex, color: '#fff', fontWeight: 700, height: 40 }}
              />
            ))}
          </Box>
        )}
        <Box sx={{ px: 2.5, pb: 1 }}>
          <Button variant="outlined" fullWidth onClick={() => dispatch({ type: '_CANCEL_PENDING' })} sx={{ borderRadius: 3 }}>
            Cancel
          </Button>
        </Box>
      </BottomSheet>
    )
  }

  // ── HOTEL PLACEMENT ────────────────────────────────────────────────
  if (phase === PHASE.ACTION_RESPONSE && pendingAction?.type === ACTION_TYPES.HOTEL) {
    const eligibleColors = Object.keys(actor.properties).filter(color => {
      if (color === COLORS.RAILROAD || color === COLORS.UTILITY) return false
      const cards = actor.properties[color] || []
      const hasHouse = actor.buildings?.[color]?.houses > 0
      return isSetComplete(color, cards) && hasHouse && !(actor.buildings?.[color]?.hotels > 0)
    })
    return (
      <BottomSheet title="Kaunse set pe hotel banayenge?">
        {eligibleColors.length === 0 ? (
          <Typography variant="body2" sx={{ px: 2.5, color: 'text.secondary', pb: 1 }}>
            Koi eligible set nahi! (Pehle ghar banao)
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, px: 2.5, pb: 1 }}>
            {eligibleColors.map(color => (
              <Chip key={color}
                label={COLOR_DISPLAY[color]?.name}
                onClick={() => dispatch({ type: 'PLACE_HOTEL', color })}
                sx={{ backgroundColor: COLOR_DISPLAY[color]?.hex, color: '#fff', fontWeight: 700, height: 40 }}
              />
            ))}
          </Box>
        )}
        <Box sx={{ px: 2.5, pb: 1 }}>
          <Button variant="outlined" fullWidth onClick={() => dispatch({ type: '_CANCEL_PENDING' })} sx={{ borderRadius: 3 }}>
            Cancel
          </Button>
        </Box>
      </BottomSheet>
    )
  }

  // ── SLY DEAL SELECT ────────────────────────────────────────────────
  if (phase === PHASE.SLY_DEAL_SELECT) {
    const others = players.filter((_, i) => i !== currentPlayerIndex)
    return (
      <StolenPropertySheet
        title="Sly Deal — Kaunsi property churaoge?"
        subtitle="(Incomplete sets se hi chura sakte ho)"
        others={others}
        canSteal={(player, color) => !isSetComplete(color, player.properties[color] || [])}
        onSelect={({ fromPlayerId, cardId, color }) =>
          dispatch({ type: 'SLY_DEAL_STEAL', fromPlayerId, cardId, color })}
        onCancel={() => dispatch({ type: '_CANCEL_PENDING' })}
      />
    )
  }

  // ── FORCED DEAL SELECT ─────────────────────────────────────────────
  if (phase === PHASE.FORCED_DEAL_SELECT) {
    return (
      <ForcedDealSheet
        currentPlayer={actor}
        others={players.filter((_, i) => i !== currentPlayerIndex)}
        onSwap={(data) => dispatch({ type: 'FORCED_DEAL_SWAP', ...data })}
        onCancel={() => dispatch({ type: '_CANCEL_PENDING' })}
      />
    )
  }

  // ── DEAL BREAKER SELECT ────────────────────────────────────────────
  if (phase === PHASE.DEAL_BREAKER_SELECT) {
    const others = players.filter((_, i) => i !== currentPlayerIndex)
    const targets = []
    for (const p of others) {
      for (const [color, cards] of Object.entries(p.properties)) {
        if (isSetComplete(color, cards)) targets.push({ player: p, color })
      }
    }
    return (
      <BottomSheet title="Deal Breaker — Kaunsa complete set churaoge?">
        {targets.length === 0 ? (
          <Typography variant="body2" sx={{ px: 2.5, color: 'text.secondary', pb: 1 }}>
            Kisi ke paas koi complete set nahi!
          </Typography>
        ) : (
          <List dense sx={{ px: 1, overflow: 'auto', maxHeight: '50dvh' }}>
            {targets.map(({ player, color }) => (
              <ListItemButton key={`${player.id}-${color}`} sx={{ borderRadius: 2, mb: 0.5, border: `2px solid ${COLOR_DISPLAY[color]?.hex}` }}
                onClick={() => dispatch({ type: 'DEAL_BREAKER_STEAL', fromPlayerId: player.id, color })}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: COLOR_DISPLAY[color]?.hex, mr: 1, flexShrink: 0 }} />
                <ListItemText
                  primary={`${player.name} ka ${COLOR_DISPLAY[color]?.name} set`}
                  primaryTypographyProps={{ fontWeight: 700, fontSize: '0.85rem' }}
                />
              </ListItemButton>
            ))}
          </List>
        )}
        <Box sx={{ px: 2.5, pb: 1 }}>
          <Button variant="outlined" fullWidth onClick={() => dispatch({ type: '_CANCEL_PENDING' })} sx={{ borderRadius: 3 }}>
            Cancel
          </Button>
        </Box>
      </BottomSheet>
    )
  }

  return null
}

// ── PAYMENT SHEET ──────────────────────────────────────────────────
function PaymentSheet({ payer, creditor, amount, dispatch, label, actionType, extraData }) {
  const [selectedAssets, setSelectedAssets] = useState([])
  const [passConfirmed, setPassConfirmed] = useState(false)

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
      <BottomSheet>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, px: 2.5, pb: 1, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            📱 Device do <Box component="span" sx={{ color: 'primary.main' }}>{payer.name}</Box> ko
          </Typography>
          <Button variant="contained" size="large" fullWidth
            sx={{ borderRadius: 3, fontWeight: 800 }}
            onClick={() => setPassConfirmed(true)}>
            Main {payer.name} hoon — Ready!
          </Button>
        </Box>
      </BottomSheet>
    )
  }

  return (
    <BottomSheet title={label}>
      <Box sx={{ px: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Chip
            label={`₹${totalSelected}Cr / ₹${amount}Cr`}
            color={totalSelected >= amount ? 'success' : 'default'}
            sx={{ fontWeight: 700 }}
          />
          {jsnCard && (
            <Button
              variant="contained" color="error" size="small"
              startIcon={<BlockIcon />}
              sx={{ borderRadius: 3, fontWeight: 800, ml: 'auto' }}
              onClick={() => dispatch({ type: 'JUST_SAY_NO', playerId: payer.id, jsnCardId: jsnCard.id })}>
              Nahi!
            </Button>
          )}
        </Box>

        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.75 }}>
          Apni assets select karo:
        </Typography>
        <Box sx={{
          display: 'flex', flexWrap: 'wrap', gap: 0.75, maxHeight: '30dvh',
          overflowY: 'auto', pb: 1,
        }}>
          {allAssets.map(asset => {
            const sel = !!selectedAssets.find(a => a.id === asset.id)
            return (
              <Box key={asset.id} onClick={() => toggleAsset(asset)}
                sx={{
                  cursor: 'pointer',
                  outline: sel ? '2px solid #E65100' : '2px solid transparent',
                  outlineOffset: '2px',
                  borderRadius: '10px',
                  transform: sel ? 'translateY(-4px)' : 'none',
                  transition: 'all 150ms ease',
                }}>
                <Card card={asset} mini />
              </Box>
            )
          })}
          {allAssets.length === 0 && (
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              Koi asset nahi — seedha pass!
            </Typography>
          )}
        </Box>

        <Button
          variant="contained" fullWidth size="large"
          disabled={totalSelected < amount && allAssets.length > 0}
          sx={{ borderRadius: 3, fontWeight: 800, mt: 0.5 }}
          onClick={() => {
            dispatch({
              type: actionType,
              payerCards: selectedAssets.length > 0 ? selectedAssets : allAssets,
              payerId: payer.id,
              amount,
              ...extraData,
            })
          }}>
          {allAssets.length === 0 ? 'Pass (kuch nahi hai)' : `Pay ₹${Math.min(totalSelected, amount)}Cr`}
        </Button>
      </Box>
    </BottomSheet>
  )
}

// ── STOLEN PROPERTY SHEET ──────────────────────────────────────────
function StolenPropertySheet({ title, subtitle, others, canSteal, onSelect, onCancel }) {
  const [selectedPlayer, setSelectedPlayer] = useState(null)

  const stealableProps = selectedPlayer
    ? Object.entries(selectedPlayer.properties)
        .filter(([color]) => canSteal(selectedPlayer, color))
        .flatMap(([color, cards]) => cards.map(c => ({ card: c, color, player: selectedPlayer })))
    : []

  return (
    <BottomSheet title={title}>
      <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {subtitle && <Typography variant="caption" sx={{ color: 'text.secondary', px: 2.5, display: 'block', mb: 1 }}>{subtitle}</Typography>}
        {/* Scrollable content */}
        <Box sx={{ px: 2.5, overflowY: 'auto', flex: 1, maxHeight: 'calc(75dvh - 100px)' }}>
          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 1.5 }}>
            {others.map(p => (
              <Chip key={p.id} label={p.name}
                onClick={() => setSelectedPlayer(p)}
                color={selectedPlayer?.id === p.id ? 'primary' : 'default'}
                variant={selectedPlayer?.id === p.id ? 'filled' : 'outlined'}
                sx={{ fontWeight: 700 }}
              />
            ))}
          </Box>
          {selectedPlayer && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1 }}>
              {stealableProps.length === 0 && (
                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                  Koi stealable property nahi
                </Typography>
              )}
              {stealableProps.map(({ card, color }) => (
                <Box key={card.id} sx={{ cursor: 'pointer', borderRadius: '6px', '&:hover': { opacity: 0.8 } }}
                  onClick={() => onSelect({ fromPlayerId: selectedPlayer.id, cardId: card.id, color })}>
                  <Card card={card} />
                </Box>
              ))}
            </Box>
          )}
        </Box>
        {/* Sticky Cancel */}
        <Box sx={{ px: 2.5, pt: 1, pb: 1.5, flexShrink: 0, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button variant="outlined" fullWidth onClick={onCancel} sx={{ borderRadius: 3 }}>
            Cancel
          </Button>
        </Box>
      </Box>
    </BottomSheet>
  )
}

// ── FORCED DEAL SHEET ──────────────────────────────────────────────
function ForcedDealSheet({ currentPlayer, others, onSwap, onCancel }) {
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

  return (
    <BottomSheet title="Forced Deal — Property Swap Karo">
      <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Scrollable content */}
        <Box sx={{ px: 2.5, overflowY: 'auto', flex: 1, maxHeight: 'calc(75dvh - 120px)' }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.75 }}>
            Tumhari property (dogi):
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}>
            {myProps.map(({ card, color }) => (
              <Box key={card.id}
                onClick={() => { setMyCardId(card.id); setMyColor(color) }}
                sx={{
                  cursor: 'pointer', borderRadius: '6px',
                  outline: myCardId === card.id ? '2px solid #E65100' : '2px solid transparent',
                  outlineOffset: '2px',
                  transform: myCardId === card.id ? 'translateY(-4px)' : 'none',
                  transition: 'all 150ms ease',
                }}>
                <Card card={card} />
              </Box>
            ))}
          </Box>

          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.75 }}>
            Kissa property loge?
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 1 }}>
            {others.map(p => (
              <Chip key={p.id} label={p.name}
                onClick={() => setTheirPlayer(p)}
                color={theirPlayer?.id === p.id ? 'primary' : 'default'}
                variant={theirPlayer?.id === p.id ? 'filled' : 'outlined'}
                sx={{ fontWeight: 700 }}
              />
            ))}
          </Box>
          {theirPlayer && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1 }}>
              {theirProps.length === 0 && (
                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                  Koi stealable property nahi
                </Typography>
              )}
              {theirProps.map(({ card, color }) => (
                <Box key={card.id}
                  onClick={() => { setTheirCardId(card.id); setTheirColor(color) }}
                  sx={{
                    cursor: 'pointer', borderRadius: '6px',
                    outline: theirCardId === card.id ? '2px solid #E65100' : '2px solid transparent',
                    outlineOffset: '2px',
                    transform: theirCardId === card.id ? 'translateY(-4px)' : 'none',
                    transition: 'all 150ms ease',
                  }}>
                  <Card card={card} />
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* Sticky CTAs — always visible */}
        <Box sx={{ px: 2.5, pt: 1, pb: 1.5, flexShrink: 0, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 1 }}>
          <Button variant="contained" size="large"
            disabled={!myCardId || !theirCardId}
            sx={{ borderRadius: 3, fontWeight: 800, flex: 1 }}
            onClick={() => onSwap({ fromPlayerId: theirPlayer.id, theirCardId, theirColor, myCardId, myColor })}>
            Swap Karo!
          </Button>
          <Button variant="outlined" onClick={onCancel} sx={{ borderRadius: 3 }}>
            Cancel
          </Button>
        </Box>
      </Box>
    </BottomSheet>
  )
}
