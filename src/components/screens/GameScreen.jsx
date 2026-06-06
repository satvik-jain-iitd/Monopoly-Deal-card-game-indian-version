import { useState } from 'react'
import {
  AppBar, Box, Button, Chip, IconButton, Paper, Toolbar, Typography,
} from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import ListAltIcon from '@mui/icons-material/ListAlt'
import { PHASE } from '../../game/gameLogic'
import { CARD_TYPES, ACTION_TYPES, COLOR_DISPLAY } from '../../game/constants'
import { getRentForColor } from '../../game/gameLogic'
import Card from '../game/Card'
import PlayerBoard from '../game/PlayerBoard'
import CardHand from '../game/CardHand'
import ActionModal from '../game/ActionModal'
import GameLog from '../game/GameLog'
import PassDeviceModal from '../game/PassDeviceModal'

export default function GameScreen({ state, dispatch, onHome }) {
  const [showLog, setShowLog] = useState(false)
  const [passConfirmed, setPassConfirmed] = useState(false)
  const [selectedCard, setSelectedCard] = useState(null)
  const [selectedAction, setSelectedAction] = useState(null)

  const currentPlayer = state.players[state.currentPlayerIndex]

  // ── PASS DEVICE ────────────────────────────────────────────────────
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
      <Box sx={{ height: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'background.default', gap: 2, px: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, textAlign: 'center' }}>
          <Box component="span" sx={{ color: 'primary.main' }}>{currentPlayer.name}</Box> ki baari!
        </Typography>
        <Typography sx={{ fontSize: '3.5rem', lineHeight: 1 }}>🃏</Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', textAlign: 'center' }}>
          {currentPlayer.hand.length === 0 ? '5 cards draw karo!' : '2 cards draw karo!'}
        </Typography>
        <Button
          variant="contained" size="large"
          onClick={() => dispatch({ type: 'START_TURN' })}
          sx={{ borderRadius: 3, px: 4, py: 1.5, fontWeight: 800, fontSize: '1rem', mt: 1 }}
        >
          Cards Draw Karo
        </Button>
      </Box>
    )
  }

  // ── DISCARD PHASE ──────────────────────────────────────────────────
  if (state.phase === PHASE.DISCARD) {
    const excess = currentPlayer.hand.length - 7
    return (
      <Box sx={{ height: '100dvh', display: 'flex', flexDirection: 'column', backgroundColor: 'background.default' }}>
        <Box sx={{ px: 2, pt: 2, pb: 1 }}>
          <Chip
            label={excess > 0 ? `${excess} card(s) discard karo (max 7)` : 'Discard complete!'}
            color={excess > 0 ? 'error' : 'success'}
            sx={{ fontWeight: 700 }}
          />
        </Box>
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <CardHand
            cards={currentPlayer.hand}
            selectable
            onCardClick={(card) => excess > 0 && dispatch({ type: 'DISCARD_CARD', cardId: card.id })}
            label="Kaunsa card hatoge?"
          />
        </Box>
        {excess <= 0 && (
          <Box sx={{ px: 2, py: 1.5, pb: 'max(16px, env(safe-area-inset-bottom))' }}>
            <Button variant="contained" fullWidth size="large"
              sx={{ borderRadius: 3, fontWeight: 800 }}
              onClick={() => { dispatch({ type: 'END_TURN' }); setPassConfirmed(false); setSelectedCard(null) }}>
              Turn Khatam
            </Button>
          </Box>
        )}
      </Box>
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
        onDone={() => { setSelectedCard(null); setSelectedAction(null) }}
      />
    )
  }

  // ── MAIN PLAY PHASE ────────────────────────────────────────────────
  const cardsLeft = state.maxCardsPerTurn - state.cardsPlayedThisTurn
  const otherPlayers = state.players.filter((_, i) => i !== state.currentPlayerIndex)
  const topDiscard = state.discard[state.discard.length - 1]

  function handleCardSelect(card) {
    setSelectedCard(selectedCard?.id === card.id ? null : card)
    setSelectedAction(null)
  }

  return (
    <Box sx={{ height: '100dvh', display: 'flex', flexDirection: 'column', backgroundColor: 'background.default', overflow: 'hidden' }}>
      {/* AppBar */}
      <AppBar position="static" elevation={1} sx={{ backgroundColor: 'background.paper' }}>
        <Toolbar sx={{ minHeight: '48px !important', gap: 1 }}>
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1, overflow: 'hidden' }}>
            <Chip
              label={currentPlayer.name}
              color="primary"
              size="small"
              sx={{ fontWeight: 700, maxWidth: 100, overflow: 'hidden' }}
            />
            <Typography variant="caption" sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
              {cardsLeft} plays left
            </Typography>
            {state.doubleRentActive && (
              <Chip label="2× RENT!" color="warning" size="small" sx={{ fontWeight: 800, animation: 'pulse 1s infinite', '@keyframes pulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.6 } } }} />
            )}
          </Box>
          <IconButton size="small" onClick={() => setShowLog(!showLog)} sx={{ color: 'text.secondary' }}>
            <ListAltIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={onHome} sx={{ color: 'text.secondary' }}>
            <HomeIcon fontSize="small" />
          </IconButton>
        </Toolbar>
      </AppBar>

      {showLog && <GameLog logs={state.log} onClose={() => setShowLog(false)} />}

      {/* Opponent boards — horizontal swipe strip (scales 2–6 players) */}
      <Box sx={{
        display: 'flex', gap: 0.75, px: 1, pt: 0.5, pb: 0.25, flexShrink: 0,
        overflowX: 'auto',
        '&::-webkit-scrollbar': { display: 'none' },
        scrollbarWidth: 'none',
      }}>
        {otherPlayers.map(p => (
          <PlayerBoard key={p.id} player={p} compact />
        ))}
      </Box>

      {/* Play zone — persistent shared pile (top of discard, never auto-clears) */}
      <Box sx={{
        flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5,
        borderTop: '1px solid', borderBottom: '1px solid', borderColor: 'divider',
        background: 'radial-gradient(ellipse at center, rgba(230,81,0,0.07), transparent 72%)',
        px: 1, py: 0.75, minHeight: 36,
      }}>
        {topDiscard ? (
          <>
            <Box sx={{ textAlign: 'right', minWidth: 50 }}>
              <Typography sx={{ fontSize: '0.5rem', fontWeight: 800, letterSpacing: '0.08em', color: 'text.secondary' }}>
                MEZ PAR
              </Typography>
              <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: 'text.disabled' }}>
                {state.discard.length} card{state.discard.length !== 1 ? 's' : ''}
              </Typography>
            </Box>

            {/* Pile with depth — a fresh card pops in, then stays */}
            <Box key={state.discard.length} sx={{
              position: 'relative',
              animation: 'playIn 300ms cubic-bezier(0.175,0.885,0.32,1.275)',
              '@keyframes playIn': {
                from: { transform: 'translateY(-16px) scale(0.82) rotate(-5deg)', opacity: 0 },
                to: { transform: 'translateY(0) scale(1) rotate(0)', opacity: 1 },
              },
            }}>
              {state.discard.length > 1 && (
                <>
                  <Box sx={{ position: 'absolute', inset: 0, transform: 'rotate(-6deg)', borderRadius: '4px', backgroundColor: 'rgba(0,0,0,0.10)' }} />
                  <Box sx={{ position: 'absolute', inset: 0, transform: 'rotate(4deg)', borderRadius: '4px', backgroundColor: 'rgba(0,0,0,0.07)' }} />
                </>
              )}
              <Box sx={{ position: 'relative', boxShadow: '0 4px 14px rgba(0,0,0,0.18)', borderRadius: '4px' }}>
                <Card card={topDiscard} />
              </Box>
            </Box>

            <Box sx={{ minWidth: 50 }}>
              <Typography sx={{ fontSize: '0.5rem', fontWeight: 800, letterSpacing: '0.08em', color: 'text.secondary' }}>
                LAST PLAY
              </Typography>
              <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: 'primary.main', lineHeight: 1.2 }}>
                {topDiscard.name}
              </Typography>
            </Box>
          </>
        ) : (
          <Typography sx={{ fontSize: '0.6rem', color: 'text.disabled', letterSpacing: '0.04em' }}>
            — Mez khaali · koi card abhi nahi khela —
          </Typography>
        )}
      </Box>

      {/* Current player board — scrolls so the hand below stays pinned & fully visible */}
      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <PlayerBoard player={currentPlayer} />
      </Box>

      {/* Hand — primary focus, always fully visible at the bottom */}
      <Box sx={{ flexShrink: 0, pb: 0.5 }}>
        <CardHand
          cards={currentPlayer.hand}
          selectable
          selectedId={selectedCard?.id}
          onCardClick={handleCardSelect}
          label={`Haath mein ${currentPlayer.hand.length} cards`}
        />
      </Box>

      {/* Action bar */}
      <Paper elevation={4} sx={{
        borderTopLeftRadius: 16, borderTopRightRadius: 16,
        px: 1.5, pt: 1.5,
        pb: 'max(12px, env(safe-area-inset-bottom))',
        flexShrink: 0, minHeight: 72,
      }}>
        {selectedCard && !selectedAction && (
          <PlayOptions
            card={selectedCard}
            onPlayAsProperty={() => { dispatch({ type: 'PLAY_PROPERTY', cardId: selectedCard.id }); setSelectedCard(null) }}
            onPlayAsMoney={() => { dispatch({ type: 'PLAY_AS_MONEY', cardId: selectedCard.id }); setSelectedCard(null) }}
            onPlayAction={() => { dispatch({ type: 'PLAY_ACTION', cardId: selectedCard.id }); setSelectedCard(null) }}
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
              setSelectedAction(null); setSelectedCard(null)
            }}
            onCancel={() => setSelectedAction(null)}
          />
        )}
        {!selectedCard && !selectedAction && (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {cardsLeft > 0 ? (
              <>
                <Typography variant="caption" sx={{ color: 'text.disabled', flex: 1 }}>
                  Ek card select karo play karne ke liye
                </Typography>
                {currentPlayer.hand.length > 0 && (
                  <Button size="small" variant="outlined" color="inherit"
                    sx={{ borderRadius: 3, fontSize: '0.72rem', whiteSpace: 'nowrap' }}
                    onClick={() => { dispatch({ type: 'END_TURN' }); setPassConfirmed(false); setSelectedCard(null) }}>
                    Turn End Karo
                  </Button>
                )}
              </>
            ) : (
              <Button variant="contained" fullWidth size="large"
                sx={{ borderRadius: 3, fontWeight: 800 }}
                onClick={() => { dispatch({ type: 'END_TURN' }); setPassConfirmed(false); setSelectedCard(null) }}>
                Turn Khatam → Pass Karo
              </Button>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  )
}

function PlayOptions({ card, onPlayAsProperty, onPlayAsMoney, onPlayAction, onPlayRent, onCancel }) {
  const isProperty = card.type === CARD_TYPES.PROPERTY || card.type === CARD_TYPES.WILD_PROPERTY
  const isMoney = card.type === CARD_TYPES.MONEY
  const isAction = card.type === CARD_TYPES.ACTION
  const isRent = card.type === CARD_TYPES.RENT

  return (
    <Box>
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1, fontWeight: 600 }}>
        {card.name} — kya karna hai?
      </Typography>
      <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
        {isProperty && (
          <Button size="small" variant="contained" onClick={onPlayAsProperty} sx={{ borderRadius: 3, fontWeight: 700, fontSize: '0.72rem' }}>
            🏠 Property Lagao
          </Button>
        )}
        {isRent && (
          <Button size="small" variant="contained" onClick={onPlayRent} sx={{ borderRadius: 3, fontWeight: 700, fontSize: '0.72rem' }}>
            💰 Rent Maango
          </Button>
        )}
        {isAction && (
          <Button size="small" variant="contained" onClick={onPlayAction} sx={{ borderRadius: 3, fontWeight: 700, fontSize: '0.72rem' }}>
            ⚡ Action Khelo
          </Button>
        )}
        {/* Property cards can NEVER be banked — only action/rent (as an alternative) and money. */}
        {(isAction || isRent) && (
          <Button size="small" variant="outlined" color="success" onClick={onPlayAsMoney} sx={{ borderRadius: 3, fontWeight: 700, fontSize: '0.72rem' }}>
            🏦 Bank (₹{card.value}Cr)
          </Button>
        )}
        {isMoney && (
          <Button size="small" variant="contained" color="success" onClick={onPlayAsMoney} sx={{ borderRadius: 3, fontWeight: 700, fontSize: '0.72rem' }}>
            🏦 Bank Mein Daalo
          </Button>
        )}
        <Button size="small" variant="text" color="inherit" onClick={onCancel} sx={{ borderRadius: 3, fontSize: '0.72rem' }}>
          Cancel
        </Button>
      </Box>
    </Box>
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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
        Kaunse color ka rent maangoge?
      </Typography>
      <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
        {eligibleColors.map(color => (
          <Chip
            key={color}
            label={`${COLOR_DISPLAY[color]?.name} ₹${getRent(color)}Cr`}
            onClick={() => setSelectedColor(color)}
            sx={{
              backgroundColor: selectedColor === color ? COLOR_DISPLAY[color]?.hex : 'transparent',
              color: selectedColor === color ? '#fff' : COLOR_DISPLAY[color]?.hex,
              border: `2px solid ${COLOR_DISPLAY[color]?.hex}`,
              fontWeight: 700, fontSize: '0.65rem',
              '&:hover': { backgroundColor: COLOR_DISPLAY[color]?.hex, color: '#fff' },
            }}
          />
        ))}
      </Box>

      {card.wild && selectedColor && (
        <>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
            Kisse rent maangoge?
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
            {otherPlayers.map(p => (
              <Chip
                key={p.id}
                label={p.name}
                onClick={() => setSelectedTarget(p.id)}
                color={selectedTarget === p.id ? 'primary' : 'default'}
                variant={selectedTarget === p.id ? 'filled' : 'outlined'}
                sx={{ fontWeight: 700 }}
              />
            ))}
          </Box>
        </>
      )}

      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          variant="contained" size="small"
          disabled={!selectedColor || (card.wild && selectedTarget === null)}
          onClick={() => onPlay(selectedColor, selectedTarget)}
          sx={{ borderRadius: 3, fontWeight: 800, flex: 1 }}
        >
          Rent Maango! 💰
        </Button>
        <Button variant="text" color="inherit" size="small" onClick={onCancel} sx={{ borderRadius: 3 }}>
          Cancel
        </Button>
      </Box>
    </Box>
  )
}
