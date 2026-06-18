import { useState } from 'react'
import {
  Box, Button, Chip, List, ListItemButton, ListItemText,
  Paper, SwipeableDrawer, Typography,
} from '@mui/material'
import BlockIcon from '@mui/icons-material/Block'
import { PHASE } from '../../game/gameLogic'
import { ACTION_TYPES, COLOR_DISPLAY, CARD_TYPES, PROPERTY_SETS, COLORS } from '../../game/constants'
import { isSetComplete, getPlayerBankTotal } from '../../game/gameLogic'
import { orderPropertyColors } from '../../game/cardSort'
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
    let card = actor.hand.find(c => c.id === pendingAction.cardId)
    if (!card) {
      // If not in hand, must be on board (changing colour)
      for (const cards of Object.values(actor.properties)) {
        card = cards.find(c => c.id === pendingAction.cardId)
        if (card) break
      }
    }

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
        {/* Mind changed before picking a colour? Cancel — card stays in hand, no play used. */}
        <Box sx={{ px: 2.5, pb: 1, pt: 0.5 }}>
          <Button variant="outlined" fullWidth onClick={() => dispatch({ type: '_CANCEL_PENDING' })} sx={{ borderRadius: 3 }}>
            Cancel — wapas haath mein rakho
          </Button>
        </Box>
      </BottomSheet>
    )
  }

  // ── ACTION RESPONSE (JSN chance for SLY_DEAL / FORCED_DEAL / DEAL_BREAKER) ──
  if (phase === PHASE.ACTION_RESPONSE &&
    [ACTION_TYPES.SLY_DEAL, ACTION_TYPES.FORCED_DEAL, ACTION_TYPES.DEAL_BREAKER].includes(pendingAction?.type)) {
    const victim = players[pendingAction.targetPlayerId]
    const jsnCard = victim.hand.find(c => c.type === CARD_TYPES.ACTION && c.actionType === ACTION_TYPES.JUST_SAY_NO)
    const actionName = { slyDeal: 'Sly Deal', forcedDeal: 'Forced Deal', dealBreaker: 'Deal Breaker' }[pendingAction.type] || 'Action'
    const acceptType = { slyDeal: 'SLY_DEAL_ACCEPT', forcedDeal: 'FORCED_DEAL_ACCEPT', dealBreaker: 'DEAL_BREAKER_ACCEPT' }[pendingAction.type]

    return (
      <BottomSheet title={`${actor.name} ne ${actionName} khela!`}>
        <Box sx={{ px: 2.5, pb: 2 }}>
          <Typography variant="body2" sx={{ mb: 2, fontWeight: 600 }}>
            {pendingAction.type === ACTION_TYPES.DEAL_BREAKER
              ? `${actor.name} tumhara ${COLOR_DISPLAY[pendingAction.color]?.name} set chura raha hai!`
              : `${actor.name} tumhe target kar raha hai!`}
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {jsnCard ? (
              <Button
                variant="contained" color="error" size="large"
                startIcon={<BlockIcon />}
                sx={{ borderRadius: 3, fontWeight: 800 }}
                onClick={() => dispatch({ type: 'JUST_SAY_NO', playerId: victim.id, jsnCardId: jsnCard.id })}>
                Nahi! (Play Just Say No)
              </Button>
            ) : (
              <Typography variant="caption" sx={{ color: 'text.disabled', textAlign: 'center', mb: 1 }}>
                Tumhare paas "Nahi!" card nahi hai.
              </Typography>
            )}

            <Button
              variant={jsnCard ? 'outlined' : 'contained'}
              size="large" fullWidth
              sx={{ borderRadius: 3, fontWeight: 700 }}
              onClick={() => dispatch({ type: acceptType })}>
              {jsnCard ? 'Theek hai, le jaane do' : 'Theek hai (Accept)'}
            </Button>
          </Box>
        </Box>
      </BottomSheet>
    )
  }

  // ── INSURANCE RESPONSE ─────────────────────────────────────────────
  if (phase === PHASE.INSURANCE_RESPONSE && pendingAction?.type === ACTION_TYPES.DEAL_BREAKER) {
    const victim = players[pendingAction.targetPlayerId]
    return (
      <BottomSheet title="Insurance — Use karein?">
        <Box sx={{ px: 2.5, pb: 2 }}>
          <Typography variant="body2" sx={{ mb: 2, fontWeight: 600 }}>
            {actor.name} tumhara set chura raha hai! Insurance hai — kya use karna chahte ho?
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Button variant="contained" color="success" size="large"
              sx={{ borderRadius: 3, fontWeight: 800 }}
              onClick={() => dispatch({ type: 'USE_INSURANCE' })}>
              🛡️ Haan — Insurance use karo!
            </Button>
            <Button variant="outlined" size="large"
              sx={{ borderRadius: 3, fontWeight: 700 }}
              onClick={() => dispatch({ type: 'DECLINE_INSURANCE' })}>
              Nahi — Insurance mat use karo
            </Button>
          </Box>
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
        key={`rent-${payerId}-${currentPayerIdx}`}
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
        key={`bday-${payerId}-${currentTargetIdx}`}
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
        key={`debt-${payerId}`}
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
        subtitle="(Incomplete sets se hi chura sakte ho · ✓ = tumhara set badhega)"
        others={others}
        thief={actor}
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
        <Box sx={{ px: 2.5 }}>
          <PlayerContextView player={actor} title="Tumhaari Jaankari:" />
        </Box>
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

  // ── JUST SAY NO — COUNTER RESPONSE ────────────────────────────────
  if (phase === PHASE.JSN_RESPONSE && pendingAction) {
    const { actingPlayerId, jsnBlockerId } = pendingAction
    const originalActor = players[actingPlayerId]
    const blocker = players[jsnBlockerId]
    return (
      <JsnResponseSheet
        originalActor={originalActor}
        blocker={blocker}
        dispatch={dispatch}
      />
    )
  }

  // ── SABOTAGE SELECT (custom card) ──────────────────────────────────
  if (phase === PHASE.SABOTAGE_SELECT) {
    const others = players.filter((_, i) => i !== currentPlayerIndex)
    return (
      <SabotageSheet
        player={actor}
        others={others}
        onSwap={({ opponentAId, cardAId, colorA, opponentBId, cardBId, colorB }) =>
          dispatch({ type: 'SABOTAGE_SWAP', opponentAId, cardAId, colorA, opponentBId, cardBId, colorB })}
        onCancel={() => dispatch({ type: '_CANCEL_PENDING' })}
      />
    )
  }

  return null
}

// ── COUNTERPARTY STRIP ─────────────────────────────────────────────
// Always-on summary of the other player's *public* holdings (bank total +
// property colour sets), so you can judge what's safe to give or worth taking.
function CounterpartyStrip({ player, title, highlightColors = [] }) {
  if (!player) return null
  const colors = orderPropertyColors(player.properties)
  const hl = new Set(highlightColors)
  return (
    <Box sx={{ mx: 2.5, mb: 1, p: 1, borderRadius: 2, backgroundColor: 'rgba(0,0,0,0.045)' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: colors.length ? 0.5 : 0 }}>
        <Typography sx={{ fontSize: '0.66rem', fontWeight: 800 }}>
          {title || `${player.name} ke paas:`}
        </Typography>
        <Chip size="small" label={`🏦 ₹${getPlayerBankTotal(player)}Cr`}
          sx={{ height: 18, fontSize: '0.58rem', fontWeight: 700, ml: 'auto' }} />
      </Box>
      {colors.length === 0 ? (
        <Typography sx={{ fontSize: '0.58rem', color: 'text.disabled' }}>Koi property nahi</Typography>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {colors.map(color => {
            const cards = player.properties[color]
            const complete = isSetComplete(color, cards)
            const needed = PROPERTY_SETS[color]?.cardsNeeded || 0
            const display = COLOR_DISPLAY[color] || {}
            return (
              <Box key={color} sx={{
                display: 'flex', alignItems: 'center', gap: 0.3,
                backgroundColor: display.hex, borderRadius: '4px', px: 0.5, py: 0.2,
                opacity: complete ? 1 : 0.85,
                outline: hl.has(color) ? '2px solid #E65100' : 'none', outlineOffset: '1px',
              }}>
                <Typography sx={{ color: '#fff', fontSize: '0.55rem', fontWeight: 800, lineHeight: 1, textShadow: '0 1px 1px rgba(0,0,0,0.4)' }}>
                  {COLOR_DISPLAY[color]?.name} {cards.length}/{needed}{complete ? ' ✓' : ''}
                </Typography>
              </Box>
            )
          })}
        </Box>
      )}
    </Box>
  )
}

// ── PLAYER CONTEXT VIEW ──────────────────────────────────────────
// Shows a player's hand (compact list) + properties (color chips) + bank cards.
function PlayerContextView({ player, title }) {
  if (!player) return null
  const colors = orderPropertyColors(player.properties)
  return (
    <Box sx={{ mb: 1.25, p: 1, borderRadius: 2, backgroundColor: 'rgba(0,0,0,0.03)' }}>
      {title && <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.5 }}>{title}</Typography>}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 0.75 }}>
        {colors.map(color => {
          const cards = player.properties[color]
          const complete = isSetComplete(color, cards)
          const needed = PROPERTY_SETS[color]?.cardsNeeded || 0
          const display = COLOR_DISPLAY[color] || {}
          return (
            <Box key={color} sx={{ display: 'flex', alignItems: 'center', gap: 0.3, backgroundColor: display.hex, borderRadius: '4px', px: 0.5, py: 0.2, opacity: complete ? 1 : 0.85 }}>
              <Typography sx={{ color: '#fff', fontSize: '0.5rem', fontWeight: 800, lineHeight: 1, textShadow: '0 1px 1px rgba(0,0,0,0.4)' }}>
                {COLOR_DISPLAY[color]?.name} {cards.length}/{needed}{complete ? ' ✓' : ''}
              </Typography>
            </Box>
          )
        })}
      </Box>
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
        {player.bank?.map(c => (
          <Box key={c.id} sx={{ p: 0.3, borderRadius: '3px', backgroundColor: 'rgba(0,0,0,0.04)', border: '1px solid', borderColor: 'divider' }}>
            <Typography sx={{ fontSize: '0.5rem', fontWeight: 600, color: 'success.main' }}>₹{c.value}Cr</Typography>
          </Box>
        ))}
        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', ml: 'auto' }}>
          ✋ {player.hand.length} cards
        </Typography>
      </Box>
    </Box>
  )
}

// What would a property of `color` do for `receiver`'s set?
//   'completes' = this card finishes their set · 'collecting' = they hold some
//   'complete'  = they already have a full set · null = they don't collect it
function setImpact(receiver, color) {
  const cards = receiver?.properties?.[color] || []
  if (cards.length === 0) return null
  const needed = PROPERTY_SETS[color]?.cardsNeeded || Infinity
  if (cards.length >= needed) return 'complete'
  if (cards.length + 1 >= needed) return 'completes'
  return 'collecting'
}

// Per-card hint shown under a selectable card. mode: 'give' (warn) | 'take' (help).
function ImpactBadge({ impact, mode, color }) {
  if (!impact) return null
  const name = COLOR_DISPLAY[color]?.name || color
  let text, bg
  if (mode === 'give') {
    if (impact === 'collecting') { text = `⚠️ ${name} le raha hai`; bg = '#B26A00' }
    else { text = `⚠️ Set pura kar dega!`; bg = '#C62828' }
  } else {
    if (impact === 'collecting') { text = `+1 tumhare ${name}`; bg = '#2E7D32' }
    else { text = `Set complete! ✓`; bg = '#1B5E20' }
  }
  return (
    <Typography sx={{
      mt: 0.3, maxWidth: 84, fontSize: '0.48rem', fontWeight: 800, color: '#fff',
      backgroundColor: bg, borderRadius: '4px', px: 0.4, py: 0.15,
      textAlign: 'center', lineHeight: 1.2,
    }}>
      {text}
    </Typography>
  )
}

// ── JSN RESPONSE SHEET ────────────────────────────────────────────
function JsnResponseSheet({ originalActor, blocker, dispatch }) {
  const [passConfirmed, setPassConfirmed] = useState(false)
  const jsnCard = originalActor.hand?.find(c => c.actionType === ACTION_TYPES.JUST_SAY_NO)

  if (!passConfirmed) {
    return (
      <BottomSheet>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, px: 2.5, pb: 1, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            📱 Device do <Box component="span" sx={{ color: 'primary.main' }}>{originalActor.name}</Box> ko
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {blocker.name} ne Just Say No bola! Kya tum counter karoge?
          </Typography>
          <Button variant="contained" size="large" fullWidth
            sx={{ borderRadius: 3, fontWeight: 800 }}
            onClick={() => setPassConfirmed(true)}>
            Main {originalActor.name} hoon — Ready!
          </Button>
        </Box>
      </BottomSheet>
    )
  }

  return (
    <BottomSheet title="Just Say No! ⚡">
      <Box sx={{ px: 2.5, pb: 1 }}>
        <Typography variant="body2" sx={{ mb: 2, textAlign: 'center', color: 'text.secondary' }}>
          {blocker.name} ne tumhara action cancel kiya!
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {jsnCard && (
            <Button variant="contained" color="error" size="large" fullWidth
              startIcon={<BlockIcon />}
              sx={{ borderRadius: 3, fontWeight: 800 }}
              onClick={() => dispatch({ type: 'COUNTER_JSN', playerId: originalActor.id, jsnCardId: jsnCard.id })}>
              Counter JSN! (Nahi re, mera action rahega!)
            </Button>
          )}
          <Button
            variant={jsnCard ? 'outlined' : 'contained'}
            size="large" fullWidth
            sx={{ borderRadius: 3, fontWeight: 700 }}
            onClick={() => dispatch({ type: 'ACCEPT_JSN' })}>
            {jsnCard ? 'Theek hai, cancel ho jaye' : 'OK (JSN nahi hai mere paas)'}
          </Button>
        </Box>
      </Box>
    </BottomSheet>
  )
}

// ── PAYMENT SHEET ──────────────────────────────────────────────────
function PaymentSheet({ payer, creditor, amount, dispatch, label, actionType, extraData }) {
  const [selectedAssets, setSelectedAssets] = useState([])
  const [passConfirmed, setPassConfirmed] = useState(false)

  const cashAssets = [...payer.bank].sort((a, b) => b.value - a.value).map(c => ({ ...c, _from: 'bank', _color: null }))
  const propAssets = orderPropertyColors(payer.properties).flatMap(color =>
    payer.properties[color].map(c => ({ ...c, _from: 'property', _color: color })))
  const buildingAssets = []
  for (const [color, b] of Object.entries(payer.buildings || {})) {
    for (let i = 0; i < (b.houses || 0); i++)
      buildingAssets.push({ id: `bldg-active-house-${color}-${i}`, _from: 'building', buildingType: 'house', _color: color, color, value: 3, name: `🏠 House (${COLOR_DISPLAY[color]?.name || color})` })
    for (let i = 0; i < (b.hotels || 0); i++)
      buildingAssets.push({ id: `bldg-active-hotel-${color}-${i}`, _from: 'building', buildingType: 'hotel', _color: color, color, value: 4, name: `🏨 Hotel (${COLOR_DISPLAY[color]?.name || color})` })
  }
  for (const [color, b] of Object.entries(payer.inactiveBuildings || {})) {
    for (let i = 0; i < (b.houses || 0); i++)
      buildingAssets.push({ id: `bldg-inactive-house-${color}-${i}`, _from: 'building', buildingType: 'house', _color: color, color, value: 3, name: `🏠 House (${COLOR_DISPLAY[color]?.name || color}, inactive)`, isInactive: true })
    for (let i = 0; i < (b.hotels || 0); i++)
      buildingAssets.push({ id: `bldg-inactive-hotel-${color}-${i}`, _from: 'building', buildingType: 'hotel', _color: color, color, value: 4, name: `🏨 Hotel (${COLOR_DISPLAY[color]?.name || color}, inactive)`, isInactive: true })
  }
  const allAssets = [...cashAssets, ...propAssets, ...buildingAssets]
  const totalSelected = selectedAssets.reduce((s, c) => s + c.value, 0)
  const selectedColors = selectedAssets.filter(a => a._from === 'property').map(a => a._color)

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

  const renderAsset = (asset) => {
    const sel = !!selectedAssets.find(a => a.id === asset.id)
    const impact = asset._from === 'property' ? setImpact(creditor, asset._color) : null
    return (
      <Box key={asset.id} onClick={() => toggleAsset(asset)}
        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
        <Box sx={{
          outline: sel ? '2px solid #E65100' : '2px solid transparent',
          outlineOffset: '2px', borderRadius: '10px',
          transform: sel ? 'translateY(-4px)' : 'none',
          transition: 'all 150ms ease',
        }}>
          <Card card={asset} mini showValue />
        </Box>
        <ImpactBadge impact={impact} mode="give" color={asset._color} />
      </Box>
    )
  }

  const renderBuildingAsset = (asset) => {
    const sel = !!selectedAssets.find(a => a.id === asset.id)
    const hex = COLOR_DISPLAY[asset.color]?.hex || '#888'
    return (
      <Box key={asset.id} onClick={() => toggleAsset(asset)}
        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
        <Box sx={{
          outline: sel ? '2px solid #E65100' : '2px solid transparent',
          outlineOffset: '2px', borderRadius: '8px',
          transform: sel ? 'translateY(-4px)' : 'none',
          transition: 'all 150ms ease',
          backgroundColor: asset.isInactive ? 'rgba(0,0,0,0.08)' : hex,
          px: 0.75, py: 0.5, minWidth: 52, textAlign: 'center', opacity: asset.isInactive ? 0.65 : 1,
        }}>
          <Typography sx={{ fontSize: '1.1rem', lineHeight: 1.1 }}>
            {asset.buildingType === 'house' ? '🏠' : '🏨'}
          </Typography>
          <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, color: asset.isInactive ? 'text.primary' : '#fff', lineHeight: 1.2 }}>
            ₹{asset.value}Cr
          </Typography>
          {asset.isInactive && (
            <Typography sx={{ fontSize: '0.46rem', color: 'text.disabled', lineHeight: 1.1 }}>inactive</Typography>
          )}
        </Box>
      </Box>
    )
  }

  return (
    <BottomSheet title={label}>
      <CounterpartyStrip player={creditor} highlightColors={selectedColors} />
      <Box sx={{ px: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Chip
            label={`₹${totalSelected}Cr / ₹${amount}Cr`}
            color={totalSelected >= amount ? 'success' : 'default'}
            sx={{ fontWeight: 700 }}
          />
        </Box>
          {jsnCard && (
            <Button
              variant="contained" color="error" size="large" fullWidth
              startIcon={<BlockIcon />}
              sx={{ borderRadius: 3, fontWeight: 800, mb: 1 }}
              onClick={() => dispatch({ type: 'JUST_SAY_NO', playerId: payer.id, jsnCardId: jsnCard.id })}>
              🚫 Nahi! (Just Say No)
            </Button>
          )}

        <Box sx={{ maxHeight: '34dvh', overflowY: 'auto', pb: 1 }}>
          {/* Hand section (read-only) */}
          <Box sx={{ mb: 1.25, p: 1, borderRadius: 2, backgroundColor: 'rgba(0,0,0,0.03)' }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.5 }}>
              ✋ Haath mein ({payer.hand.length} cards):
            </Typography>
            {payer.hand.length === 0 ? (
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>Haath khaali</Typography>
            ) : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {payer.hand.map(card => (
                  <Box key={card.id} sx={{ 
                    p: 0.5, borderRadius: '4px', 
                    border: '1px solid', borderColor: 'divider',
                    backgroundColor: 'background.paper'
                  }}>
                    <Typography sx={{ fontSize: '0.58rem', fontWeight: 600 }}>
                      {card.name} {card.value ? `(₹${card.value}Cr)` : ''}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          {cashAssets.length > 0 && (
            <>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                💵 Cash:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.25 }}>
                {cashAssets.map(renderAsset)}
              </Box>
            </>
          )}
          {propAssets.length > 0 && (
            <>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                🏠 Property (⚠️ = {creditor.name} ka set badhega):
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.25 }}>
                {propAssets.map(renderAsset)}
              </Box>
            </>
          )}
          {buildingAssets.length > 0 && (
            <>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                🏗️ Buildings (house=₹3Cr, hotel=₹4Cr):
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.25 }}>
                {buildingAssets.map(renderBuildingAsset)}
              </Box>
            </>
          )}
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
function StolenPropertySheet({ title, subtitle, others, thief, canSteal, onSelect, onCancel }) {
  const [selectedPlayer, setSelectedPlayer] = useState(null)

  const stealableProps = selectedPlayer
    ? orderPropertyColors(selectedPlayer.properties)
        .filter(color => canSteal(selectedPlayer, color))
        .flatMap(color => selectedPlayer.properties[color].map(c => ({ card: c, color, player: selectedPlayer })))
    : []

  return (
    <BottomSheet title={title}>
      <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {subtitle && <Typography variant="caption" sx={{ color: 'text.secondary', px: 2.5, display: 'block', mb: 1 }}>{subtitle}</Typography>}
        {/* Scrollable content */}
        <Box sx={{ px: 2.5, overflowY: 'auto', flex: 1, maxHeight: 'calc(75dvh - 100px)' }}>
          <PlayerContextView player={thief} title="Tumhaari Jaankari:" />
          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 1 }}>
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
            <Box sx={{ mb: 1, mx: -1 }}>
              <CounterpartyStrip player={selectedPlayer} title={`${selectedPlayer.name} ke paas:`} />
            </Box>
          )}
          {selectedPlayer && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1 }}>
              {stealableProps.length === 0 && (
                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                  Koi stealable property nahi
                </Typography>
              )}
              {stealableProps.map(({ card, color }) => (
                <Box key={card.id}
                  onClick={() => onSelect({ fromPlayerId: selectedPlayer.id, cardId: card.id, color })}
                  sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', '&:hover': { opacity: 0.85 } }}>
                  <Card card={card} />
                  <ImpactBadge impact={setImpact(thief, color)} mode="take" color={color} />
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

  const myProps = orderPropertyColors(currentPlayer.properties)
    .flatMap(color => currentPlayer.properties[color].map(c => ({ card: c, color })))

  const theirProps = theirPlayer
    ? orderPropertyColors(theirPlayer.properties)
        .filter(color => !isSetComplete(color, theirPlayer.properties[color] || []))
        .flatMap(color => theirPlayer.properties[color].map(c => ({ card: c, color })))
    : []

  return (
    <BottomSheet title="Forced Deal — Property Swap Karo">
      <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Scrollable content */}
        <Box sx={{ px: 2.5, overflowY: 'auto', flex: 1, maxHeight: 'calc(75dvh - 120px)' }}>
          <PlayerContextView player={currentPlayer} title="Tumhaari Jaankari:" />
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.75 }}>
            Tumhari property (dogi){theirPlayer ? ` — ⚠️ = ${theirPlayer.name} ka set badhega` : ''}:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}>
            {myProps.map(({ card, color }) => (
              <Box key={card.id}
                onClick={() => { setMyCardId(card.id); setMyColor(color) }}
                sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
                <Box sx={{
                  borderRadius: '6px',
                  outline: myCardId === card.id ? '2px solid #E65100' : '2px solid transparent',
                  outlineOffset: '2px',
                  transform: myCardId === card.id ? 'translateY(-4px)' : 'none',
                  transition: 'all 150ms ease',
                }}>
                  <Card card={card} />
                </Box>
                <ImpactBadge impact={theirPlayer ? setImpact(theirPlayer, color) : null} mode="give" color={color} />
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
            <Box sx={{ mb: 1, mx: -1 }}>
              <CounterpartyStrip player={theirPlayer} title={`${theirPlayer.name} ke paas:`} />
            </Box>
          )}
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
                  sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
                  <Box sx={{
                    borderRadius: '6px',
                    outline: theirCardId === card.id ? '2px solid #E65100' : '2px solid transparent',
                    outlineOffset: '2px',
                    transform: theirCardId === card.id ? 'translateY(-4px)' : 'none',
                    transition: 'all 150ms ease',
                  }}>
                    <Card card={card} />
                  </Box>
                  <ImpactBadge impact={setImpact(currentPlayer, color)} mode="take" color={color} />
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

// ── SABOTAGE SHEET (custom card) ───────────────────────────────────
function SabotageSheet({ player, others, onSwap, onCancel }) {
  const [step, setStep] = useState('pickA')
  const [opponentA, setOpponentA] = useState(null)
  const [cardA, setCardA] = useState(null)
  const [colorA, setColorA] = useState(null)
  const [opponentB, setOpponentB] = useState(null)
  const [cardB, setCardB] = useState(null)
  const [colorB, setColorB] = useState(null)

  const incompleteProps = (p) =>
    orderPropertyColors(p.properties)
      .filter(color => !isSetComplete(color, p.properties[color] || []))
      .flatMap(color => p.properties[color].map(c => ({ card: c, color })))

  const aProps = opponentA ? incompleteProps(opponentA) : []
  const bProps = opponentB ? incompleteProps(opponentB) : []
  const remaining = others.filter(p => p.id !== opponentA?.id)
  const validOpponents = others.filter(p => incompleteProps(p).length > 0)

  return (
    <BottomSheet title="Sabotage — Do Logo Mein Trade Karwao">
      <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box sx={{ px: 2.5, overflowY: 'auto', flex: 1, maxHeight: 'calc(75dvh - 120px)' }}>
          <PlayerContextView player={player} title="Tumhaari Jaankari:" />

          {/* No valid targets — dead-end guard */}
          {validOpponents.length < 2 ? (
            <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mb: 1 }}>
              Kam se kam 2 opponents ke paas incomplete property honi chahiye. Cancel karo.
            </Typography>
          ) : (
            <>
              {/* STEP 1 — Pick opponent A */}
              {step === 'pickA' && (
                <>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.75 }}>
                    1. Pehla opponent chuno:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 1 }}>
                    {validOpponents.map(p => (
                      <Chip key={p.id} label={p.name}
                        onClick={() => { setOpponentA(p); setStep('pickCardA') }}
                        sx={{ fontWeight: 700 }}
                      />
                    ))}
                  </Box>
                </>
              )}

              {/* STEP 2 — Pick card from opponent A */}
              {step === 'pickCardA' && opponentA && (
                <>
                  <CounterpartyStrip player={opponentA} title={`${opponentA.name} ke paas:`} />
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.75, mt: 1 }}>
                    {opponentA.name} se kaunsi property nikaaloge? (yeh {opponentB ? opponentB.name : 'doosre'} ko milegi)
                  </Typography>
                  {aProps.length === 0 ? (
                    <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mb: 1 }}>
                      Koi incomplete property nahi. Doosra opponent chuno.
                    </Typography>
                  ) : (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1 }}>
                      {aProps.map(({ card, color }) => (
                        <Box key={card.id}
                          onClick={() => { setCardA(card); setColorA(color); setStep('pickB') }}
                          sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
                          <Box sx={{
                            borderRadius: '6px',
                            outline: cardA?.id === card.id ? '2px solid #E65100' : '2px solid transparent',
                            outlineOffset: '2px',
                            transform: cardA?.id === card.id ? 'translateY(-4px)' : 'none',
                            transition: 'all 150ms ease',
                          }}>
                            <Card card={card} />
                          </Box>
                          <ImpactBadge impact={setImpact(opponentB, color)} mode="take" color={color} />
                        </Box>
                      ))}
                    </Box>
                  )}
                  <Button variant="outlined" size="small" onClick={() => { setOpponentA(null); setStep('pickA') }} sx={{ borderRadius: 3 }}>
                    Wapas — doosra opponent chuno
                  </Button>
                </>
              )}

              {/* STEP 3 — Pick opponent B */}
              {step === 'pickB' && (
                <>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.75 }}>
                    2. Doosra opponent chuno:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 1 }}>
                    {remaining.filter(p => incompleteProps(p).length > 0).map(p => (
                      <Chip key={p.id} label={p.name}
                        onClick={() => { setOpponentB(p); setStep('pickCardB') }}
                        sx={{ fontWeight: 700 }}
                      />
                    ))}
                  </Box>
                </>
              )}

              {/* STEP 4 — Pick card from opponent B */}
              {step === 'pickCardB' && opponentB && (
                <>
                  <CounterpartyStrip player={opponentB} title={`${opponentB.name} ke paas:`} />
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.75, mt: 1 }}>
                    {opponentB.name} se kaunsi property nikaaloge? (yeh {opponentA.name} ko milegi)
                  </Typography>
                  {bProps.length === 0 ? (
                    <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mb: 1 }}>
                      Koi incomplete property nahi. Doosra opponent chuno.
                    </Typography>
                  ) : (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1 }}>
                      {bProps.map(({ card, color }) => (
                        <Box key={card.id}
                          onClick={() => { setCardB(card); setColorB(color) }}
                          sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
                          <Box sx={{
                            borderRadius: '6px',
                            outline: cardB?.id === card.id ? '2px solid #E65100' : '2px solid transparent',
                            outlineOffset: '2px',
                            transform: cardB?.id === card.id ? 'translateY(-4px)' : 'none',
                            transition: 'all 150ms ease',
                          }}>
                            <Card card={card} />
                          </Box>
                          <ImpactBadge impact={setImpact(opponentA, color)} mode="take" color={color} />
                        </Box>
                      ))}
                    </Box>
                  )}
                  <Button variant="outlined" size="small" onClick={() => { setOpponentB(null); setStep('pickB') }} sx={{ borderRadius: 3 }}>
                    Wapas — doosra opponent chuno
                  </Button>
                </>
              )}

              {/* Summary once both selected */}
              {cardA && cardB && step === 'pickCardB' && (
                <Box sx={{ mt: 1, p: 1, borderRadius: 2, backgroundColor: 'rgba(0,0,0,0.04)' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
                    Saari — {opponentA.name} ka <b>{cardA.name}</b> ↔ {opponentB.name} ka <b>{cardB.name}</b>
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Box>

        {/* Sticky CTAs */}
        <Box sx={{ px: 2.5, pt: 1, pb: 1.5, flexShrink: 0, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 1 }}>
          <Button variant="contained" size="large"
            disabled={!cardA || !cardB}
            sx={{ borderRadius: 3, fontWeight: 800, flex: 1 }}
            onClick={() => onSwap({ opponentAId: opponentA.id, cardAId: cardA.id, colorA, opponentBId: opponentB.id, cardBId: cardB.id, colorB })}>
            Sabotage Karo!
          </Button>
          <Button variant="outlined" onClick={onCancel} sx={{ borderRadius: 3 }}>
            Cancel
          </Button>
        </Box>
      </Box>
    </BottomSheet>
  )
}
