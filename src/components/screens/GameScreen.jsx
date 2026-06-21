import { useState, useRef, useEffect } from 'react'
import {
  AppBar, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Paper, Toolbar, Typography,
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
import logoImg from '/images/monopoly-deal-indian-logo.png'

const PAYMENT_PHASES = [PHASE.RENT_COLLECT, PHASE.ACTION_RESPONSE, PHASE.BIRTHDAY_COLLECT]

// Phases where the acting player is making a PRIVATE decision (drawing,
// discarding, playing, rearranging a wild, or picking what to steal/swap).
// Spectators should keep seeing their own board during these — never the
// full-screen "X ki baari hai" block. The phases that actually need the
// other player to respond (rent/JSN/insurance/payment) are intentionally
// NOT here, so those still surface the waiting/response UI.
const SPECTATOR_PHASES = [
  PHASE.DRAW, PHASE.DISCARD, PHASE.PLAY,
  PHASE.WILD_COLOR_SELECT, PHASE.SLY_DEAL_SELECT, PHASE.FORCED_DEAL_SELECT,
  PHASE.DEAL_BREAKER_SELECT, PHASE.SABOTAGE_SELECT,
]

// Returns the index of the player who needs to interact RIGHT NOW
// (differs from currentPlayerIndex during rent/debt collection).
function getActiveInteractorIdx(state) {
  const pa = state.pendingAction
  if (state.phase === PHASE.RENT_COLLECT && pa?.payerIds) {
    return pa.payerIds[pa.currentPayerIdx] ?? state.currentPlayerIndex
  }
  if (state.phase === PHASE.ACTION_RESPONSE && pa) {
    if (pa.type === ACTION_TYPES.BIRTHDAY || pa.type === ACTION_TYPES.DEBT_COLLECTOR) {
      return pa.targetIds?.[pa.currentTargetIdx] ?? state.currentPlayerIndex
    }
    // Sly Deal, Forced Deal, Deal Breaker target a specific player
    if ([ACTION_TYPES.SLY_DEAL, ACTION_TYPES.FORCED_DEAL, ACTION_TYPES.DEAL_BREAKER].includes(pa.type)) {
      return pa.targetPlayerId ?? state.currentPlayerIndex
    }
  }
  // Insurance response targets the victim
  if (state.phase === PHASE.INSURANCE_RESPONSE && pa?.targetPlayerId != null) {
    return pa.targetPlayerId
  }
  return state.currentPlayerIndex
}

export default function GameScreen({ state, dispatch, onHome, myPlayerIndex }) {
  const [showLog, setShowLog] = useState(false)
  const [passConfirmed, setPassConfirmed] = useState(false)
  const [selectedCard, setSelectedCard] = useState(null)
  const [selectedAction, setSelectedAction] = useState(null)
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false)
  const prevPhaseRef = useRef(null)
  const drawClickedRef = useRef(false)
  const handleHomeClick = () => setLeaveConfirmOpen(true)
  const handleLeaveConfirm = () => { setLeaveConfirmOpen(false); onHome() }
  const handleLeaveCancel = () => setLeaveConfirmOpen(false)

  const isMultiplayer = myPlayerIndex != null
  const currentPlayer = state.players[state.currentPlayerIndex]
  const activeInteractorIdx = getActiveInteractorIdx(state)

  // Reset the draw-button guard when entering DRAW for a new turn
  useEffect(() => {
    if (state.phase === PHASE.DRAW) drawClickedRef.current = false
  }, [state.phase, state.currentPlayerIndex])

  // Hotfix 2: after a payment phase ends, reset passConfirmed so the acting
  // player must re-identify before seeing their hand again.
  useEffect(() => {
    const prev = prevPhaseRef.current
    prevPhaseRef.current = state.phase
    if (
      !isMultiplayer && prev !== null &&
      PAYMENT_PHASES.includes(prev) &&
      (state.phase === PHASE.PLAY || state.phase === PHASE.DISCARD)
    ) {
      setPassConfirmed(false)
    }
  }, [state.phase, isMultiplayer])

  // Reset pass screen when the active interactor changes
  useEffect(() => {
    if (!isMultiplayer) {
      setPassConfirmed(false)
    }
  }, [activeInteractorIdx, isMultiplayer])

  // ── PASS DEVICE (pass-and-play only) ──────────────────────────────
  if (!isMultiplayer && !passConfirmed) {
    return (
      <PassDeviceModal
        playerName={state.players[activeInteractorIdx].name}
        onConfirm={() => setPassConfirmed(true)}
      />
    )
  }

  // ── MULTIPLAYER WAITING SCREEN (non-turn-flow + non-payment phases only) ─────────
  if (isMultiplayer && activeInteractorIdx !== myPlayerIndex &&
    !SPECTATOR_PHASES.includes(state.phase) &&
    !PAYMENT_PHASES.includes(state.phase)) {
    const activePlayer = state.players[activeInteractorIdx]
    return (
      <Box sx={{ height: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'background.default', gap: 2, px: 3, textAlign: 'center' }}>
        <CircularProgress size={40} thickness={4} sx={{ color: 'primary.main' }} />
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          {activePlayer.name} ki baari hai...
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Intezaar karo
        </Typography>
        {/* Quit button intentionally absent — see Bug 3 analysis */}
      </Box>
    )
  }

  // ── SPECTATOR VIEW (multiplayer, not my turn, normal turn-flow + payment phases) ────
  if (isMultiplayer && (
    (myPlayerIndex !== state.currentPlayerIndex && SPECTATOR_PHASES.includes(state.phase)) ||
    (PAYMENT_PHASES.includes(state.phase) && activeInteractorIdx !== myPlayerIndex)
  )) {
    const viewerPlayer = state.players[myPlayerIndex]
    const otherPlayers = state.players.filter((_, i) => i !== myPlayerIndex)
    const topDiscard = state.discard[state.discard.length - 1]
    const activePlayer = state.players[activeInteractorIdx]
    const phaseLabel = state.phase === PHASE.DRAW
      ? `${currentPlayer.name} cards draw kar rahe hain...`
      : state.phase === PHASE.DISCARD
        ? `${currentPlayer.name} discard kar rahe hain...`
        : PAYMENT_PHASES.includes(state.phase)
          ? `${activePlayer.name} action kar rahe hain...`
          : `${currentPlayer.name} ki baari hai...`

    return (
      <Box sx={{ height: '100dvh', display: 'flex', flexDirection: 'column', backgroundColor: 'background.default', overflow: 'hidden' }}>
        <AppBar position="static" elevation={1} sx={{ backgroundColor: 'background.paper' }}>
          <Toolbar sx={{ minHeight: '48px !important', gap: 1 }}>
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1, overflow: 'hidden' }}>
              <Chip label={PAYMENT_PHASES.includes(state.phase) ? activePlayer.name : currentPlayer.name} color="primary" size="small" sx={{ fontWeight: 700, maxWidth: 100, overflow: 'hidden' }} />
              <Typography variant="caption" sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
                {PAYMENT_PHASES.includes(state.phase) ? 'action kar rahe hain...' : 'ki baari'}
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => setShowLog(!showLog)} sx={{ color: 'text.secondary' }}>
              <ListAltIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={handleHomeClick} sx={{ color: 'text.secondary' }}>
              <HomeIcon fontSize="small" />
            </IconButton>
          </Toolbar>
        </AppBar>

        {showLog && <GameLog logs={state.log} onClose={() => setShowLog(false)} />}

        {/* Main Scrollable Table Area */}
        <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {/* Opponent boards Grid (scales 2–6 players, symmetrically arranged) */}
          {otherPlayers.length > 0 && (
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: otherPlayers.length === 1 ? '1fr' : '1fr 1fr',
              gap: 1.25,
              px: 1.5,
              pt: 1.5,
              flexShrink: 0,
            }}>
              {otherPlayers.map(p => (
                <PlayerBoard key={p.id} player={p} compact />
              ))}
            </Box>
          )}

          {/* Center Zone: Draw Pile (Left) and Action Pile (Right) */}
          <Box sx={{
            display: 'flex',
            borderTop: '1px solid',
            borderBottom: '1px solid',
            borderColor: 'divider',
            py: 2,
            backgroundColor: 'background.paper',
            flexShrink: 0,
          }}>
            {/* Draw Pile */}
            <Box sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderRight: '1px solid',
              borderColor: 'divider',
              gap: 0.75,
            }}>
              <Typography sx={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.08em', color: 'text.secondary' }}>
                DRAW PILE
              </Typography>
              <Paper elevation={2} sx={{
                width: 52, height: 74, borderRadius: '4px',
                overflow: 'hidden', backgroundColor: '#0d47a1',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid #fff',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                p: 0.5,
              }}>
                <img src={logoImg} alt="Dhandha Logo" style={{ width: '85%', height: '85%', objectFit: 'contain' }} />
              </Paper>
              <Typography sx={{ fontSize: '0.6rem', color: 'text.secondary', fontWeight: 700 }}>
                Face down · {state.deck.length}
              </Typography>
            </Box>

            {/* Action Pile */}
            <Box sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.75,
            }}>
              <Typography sx={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.08em', color: 'text.secondary' }}>
                ACTION PILE
              </Typography>
              {topDiscard ? (
                <Box sx={{ boxShadow: '0 2px 5px rgba(0,0,0,0.2)', borderRadius: '4px' }}>
                  <Card card={topDiscard} mini />
                </Box>
              ) : (
                <Box sx={{
                  width: 52,
                  height: 74,
                  borderRadius: '4px',
                  border: '1.5px dashed rgba(0,0,0,0.15)',
                  backgroundColor: 'rgba(0,0,0,0.02)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Typography sx={{ fontSize: '0.55rem', color: 'text.disabled' }}>Khaali</Typography>
                </Box>
              )}
              <Typography sx={{ fontSize: '0.6rem', color: 'primary.main', fontWeight: 800 }}>
                {topDiscard ? `Last: ${topDiscard.name}!` : 'No action yet'}
              </Typography>
            </Box>
          </Box>

          {/* Current player board */}
          <Box sx={{ pb: 1.5 }}>
            <PlayerBoard player={viewerPlayer} />
          </Box>
        </Box>

        <Box sx={{ flexShrink: 0, pb: 0.5 }}>
          <CardHand
            cards={viewerPlayer.hand}
            selectable={false}
            label={`Tumhare ${viewerPlayer.hand.length} cards`}
          />
        </Box>

        <Paper elevation={4} sx={{
          borderTopLeftRadius: 16, borderTopRightRadius: 16,
          px: 1.5, py: 1.5,
          pb: 'max(12px, env(safe-area-inset-bottom))',
          flexShrink: 0, minHeight: 72,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
        }}>
          <CircularProgress size={20} thickness={5} sx={{ color: 'primary.main' }} />
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700 }}>
            {phaseLabel}
          </Typography>
        </Paper>
      </Box>
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
          disabled={drawClickedRef.current}
          onClick={() => { drawClickedRef.current = true; dispatch({ type: 'START_TURN' }) }}
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
    const newCardIds = state.passGoDrawnIds
    return (
      <Box sx={{ height: '100dvh', display: 'flex', flexDirection: 'column', backgroundColor: 'background.default' }}>
        <Box sx={{ px: 2, pt: 2, pb: 1, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          {newCardIds?.length > 0 && (
            <Chip
              label={`✦ Pass Go se ${newCardIds.length} naye cards mile (green highlighted)`}
              size="small"
              sx={{ fontWeight: 700, backgroundColor: '#E8F5E9', color: '#2E7D32', border: '1px solid #2E7D32', alignSelf: 'flex-start' }}
            />
          )}
          <Chip
            label={excess > 0 ? `${excess} card(s) discard karo (max 7)` : 'Discard complete!'}
            color={excess > 0 ? 'error' : 'success'}
            sx={{ fontWeight: 700, alignSelf: 'flex-start' }}
          />
        </Box>
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <CardHand
            cards={currentPlayer.hand}
            selectable
            highlightIds={newCardIds}
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
    PHASE.SABOTAGE_SELECT, PHASE.WILD_COLOR_SELECT,
    PHASE.INSURANCE_RESPONSE, PHASE.JSN_RESPONSE].includes(state.phase)) {
    return (
      <ActionModal
        state={state}
        dispatch={dispatch}
        onDone={() => { setSelectedCard(null); setSelectedAction(null) }}
        isMultiplayer={isMultiplayer}
      />
    )
  }

  // ── MAIN PLAY PHASE ────────────────────────────────────────────────
  const cardsLeft = state.maxCardsPerTurn - state.cardsPlayedThisTurn
  const otherPlayers = state.players.filter((_, i) => i !== state.currentPlayerIndex)
  const topDiscard = state.discard[state.discard.length - 1]

  function handleCardSelect(card) {
    if (cardsLeft <= 0) return
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
          <IconButton size="small" onClick={handleHomeClick} sx={{ color: 'text.secondary' }}>
            <HomeIcon fontSize="small" />
          </IconButton>
        </Toolbar>
      </AppBar>

      {showLog && <GameLog logs={state.log} onClose={() => setShowLog(false)} />}

      {/* Main Scrollable Table Area */}
      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {/* Opponent boards Grid (scales 2–6 players, symmetrically arranged) */}
        {otherPlayers.length > 0 && (
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: otherPlayers.length === 1 ? '1fr' : '1fr 1fr',
            gap: 1.25,
            px: 1.5,
            pt: 1.5,
            flexShrink: 0,
          }}>
            {otherPlayers.map(p => (
              <PlayerBoard key={p.id} player={p} compact />
            ))}
          </Box>
        )}

        {/* Center Zone: Draw Pile (Left) and Action Pile (Right) */}
        <Box sx={{
          display: 'flex',
          borderTop: '1px solid',
          borderBottom: '1px solid',
          borderColor: 'divider',
          py: 2,
          backgroundColor: 'background.paper',
          flexShrink: 0,
        }}>
          {/* Draw Pile */}
          <Box sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            borderRight: '1px solid',
            borderColor: 'divider',
            gap: 0.75,
          }}>
            <Typography sx={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.08em', color: 'text.secondary' }}>
              DRAW PILE
            </Typography>
            <Paper elevation={2} sx={{
              width: 52, height: 74, borderRadius: '4px',
              overflow: 'hidden', backgroundColor: '#0d47a1',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid #fff',
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
              p: 0.5,
            }}>
              <img src={logoImg} alt="Dhandha Logo" style={{ width: '85%', height: '85%', objectFit: 'contain' }} />
            </Paper>
            <Typography sx={{ fontSize: '0.6rem', color: 'text.secondary', fontWeight: 700 }}>
              Face down · {state.deck.length}
            </Typography>
          </Box>

          {/* Action Pile */}
          <Box sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.75,
          }}>
            <Typography sx={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.08em', color: 'text.secondary' }}>
              ACTION PILE
            </Typography>
            {topDiscard ? (
              <Box key={state.discard.length} sx={{
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                borderRadius: '4px',
                animation: 'playIn 250ms cubic-bezier(0.175,0.885,0.32,1.275)',
                '@keyframes playIn': {
                  from: { transform: 'translateY(-12px) scale(0.95)', opacity: 0 },
                  to: { transform: 'translateY(0) scale(1)', opacity: 1 },
                },
              }}>
                <Card card={topDiscard} mini />
              </Box>
            ) : (
              <Box sx={{
                width: 52,
                height: 74,
                borderRadius: '4px',
                border: '1.5px dashed rgba(0,0,0,0.15)',
                backgroundColor: 'rgba(0,0,0,0.02)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Typography sx={{ fontSize: '0.55rem', color: 'text.disabled' }}>Khaali</Typography>
              </Box>
            )}
            <Typography sx={{ fontSize: '0.6rem', color: 'primary.main', fontWeight: 800 }}>
              {topDiscard ? `Last: ${topDiscard.name}!` : 'No action yet'}
            </Typography>
          </Box>
        </Box>

        {/* Current player board */}
        <Box sx={{ pb: 1.5 }}>
          <PlayerBoard 
            player={currentPlayer} 
            onWildAction={(card) => dispatch({ type: 'START_WILD_COLOR_CHANGE', cardId: card.id })}
          />
        </Box>
      </Box>

      {/* Hand — primary focus, always fully visible at the bottom */}
      <Box sx={{ flexShrink: 0, pb: 0.5 }}>
        <CardHand
          cards={currentPlayer.hand}
          selectable={cardsLeft > 0}
          selectedId={selectedCard?.id}
          onCardClick={handleCardSelect}
          label={cardsLeft > 0
            ? `Haath mein ${currentPlayer.hand.length} cards`
            : `Plays khatam — Turn end karo (${currentPlayer.hand.length} cards)`}
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
            currentPlayer={currentPlayer}
            cardsLeft={cardsLeft}
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

      <Dialog open={leaveConfirmOpen} onClose={handleLeaveCancel}>
        <DialogTitle>Game chhod rahe ho?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Kya aap game chhodna chahte hain? Game ka sara progress kho jayega.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLeaveCancel}>Cancel</Button>
          <Button onClick={handleLeaveConfirm} color="error" variant="contained">Game Chhodo</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

function PlayOptions({ card, currentPlayer, onPlayAsProperty, onPlayAsMoney, onPlayAction, onPlayRent, onCancel, cardsLeft }) {
  const isProperty = card.type === CARD_TYPES.PROPERTY || card.type === CARD_TYPES.WILD_PROPERTY
  const isMoney = card.type === CARD_TYPES.MONEY
  const isAction = card.type === CARD_TYPES.ACTION
  const isRent = card.type === CARD_TYPES.RENT

  const hasMatchingProperty = !isRent || card.wild 
    ? Object.keys(currentPlayer.properties).length > 0
    : card.colors.some(color => (currentPlayer.properties[color]?.length || 0) > 0)

  const isDoubleRent = isAction && card.actionType === ACTION_TYPES.DOUBLE_RENT
  const hasRentCard = currentPlayer.hand.some(c => c.type === CARD_TYPES.RENT)
  const hasTwoPlaysLeft = cardsLeft >= 2
  const canPlayDoubleRent = !isDoubleRent || (hasRentCard && hasTwoPlaysLeft)
  const doubleRentBlockReason = isDoubleRent && !hasRentCard ? 'Rent card nahi hai haath mein'
    : isDoubleRent && !hasTwoPlaysLeft ? '2 plays nahi bache hain'
    : ''

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
          <Button 
            size="small" 
            variant={hasMatchingProperty ? "contained" : "outlined"}
            disabled={!hasMatchingProperty}
            onClick={onPlayRent} 
            sx={{ borderRadius: 3, fontWeight: 700, fontSize: '0.72rem' }}
          >
            {hasMatchingProperty ? "💰 Rent Maango" : "💰 Rent Maango (pehle property lagao)"}
          </Button>
        )}
        {isAction && (
          <Button size="small" variant={canPlayDoubleRent ? "contained" : "outlined"} disabled={!canPlayDoubleRent} onClick={onPlayAction} sx={{ borderRadius: 3, fontWeight: 700, fontSize: '0.72rem' }}>
            {doubleRentBlockReason || '⚡ Action Khelo'}
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

  if (eligibleColors.length === 0) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: 'error.main' }}>
          Pehle is rent card ke colour ki property lagao!
        </Typography>
        <Button variant="text" color="inherit" onClick={onCancel} sx={{ borderRadius: 3, fontSize: '0.72rem', alignSelf: 'flex-start' }}>
          Cancel — bank mein daalo ya kuch aur khelo
        </Button>
      </Box>
    )
  }

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
