import { Box, Paper, Typography } from '@mui/material'
import GavelIcon from '@mui/icons-material/Gavel'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun'
import CakeIcon from '@mui/icons-material/Cake'
import BlockIcon from '@mui/icons-material/Block'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import HomeIcon from '@mui/icons-material/Home'
import HotelIcon from '@mui/icons-material/Hotel'
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee'
import ShieldIcon from '@mui/icons-material/Shield'
import RouteIcon from '@mui/icons-material/Route'
import { CARD_TYPES, ACTION_TYPES, COLOR_DISPLAY, COLORS, PROPERTY_SETS } from '../../game/constants'
import { CityLandmark } from './CardArt'

const ACTION_ICONS = {
  [ACTION_TYPES.DEAL_BREAKER]: GavelIcon,
  [ACTION_TYPES.DEBT_COLLECTOR]: AccountBalanceIcon,
  [ACTION_TYPES.FORCED_DEAL]: SwapHorizIcon,
  [ACTION_TYPES.SLY_DEAL]: VisibilityOffIcon,
  [ACTION_TYPES.PASS_GO]: DirectionsRunIcon,
  [ACTION_TYPES.BIRTHDAY]: CakeIcon,
  [ACTION_TYPES.JUST_SAY_NO]: BlockIcon,
  [ACTION_TYPES.DOUBLE_RENT]: TrendingUpIcon,
  [ACTION_TYPES.HOUSE]: HomeIcon,
  [ACTION_TYPES.HOTEL]: HotelIcon,
  [ACTION_TYPES.INSURANCE]: ShieldIcon,
  [ACTION_TYPES.TRADE_ROUTE]: RouteIcon,
}

const ACTION_DESC = {
  [ACTION_TYPES.DEAL_BREAKER]: 'Poora set chura lo',
  [ACTION_TYPES.DEBT_COLLECTOR]: 'Kisi se ₹5Cr lo',
  [ACTION_TYPES.FORCED_DEAL]: 'Property swap karo',
  [ACTION_TYPES.SLY_DEAL]: 'Ek property chura lo',
  [ACTION_TYPES.PASS_GO]: '2 extra cards lo',
  [ACTION_TYPES.BIRTHDAY]: 'Sabse ₹2Cr lo',
  [ACTION_TYPES.JUST_SAY_NO]: 'Action cancel karo',
  [ACTION_TYPES.DOUBLE_RENT]: 'Rent double karo',
  [ACTION_TYPES.HOUSE]: 'Complete set pe ghar',
  [ACTION_TYPES.HOTEL]: 'Ghar ke upar hotel',
  [ACTION_TYPES.INSURANCE]: 'Deal Breaker se bachao',
  [ACTION_TYPES.TRADE_ROUTE]: 'Discard se swap karo',
}

function getTextColor(hexBg) {
  if (!hexBg) return '#fff'
  const hex = hexBg.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.55 ? '#000000' : '#ffffff'
}

const CARD_W = 84
const CARD_H = 122
const MINI_W = 52
const MINI_H = 74

// Optional value pill for mini cards in selection contexts (so the player can
// read a property's cash value without tapping). Money minis already show value.
export default function Card({ card, mini = false, showValue = false }) {
  if (!card) return null
  const wantPill = mini && showValue && card.type !== CARD_TYPES.MONEY && (card.value || 0) > 0
  if (!wantPill) return <CardFace card={card} mini={mini} />
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
      <CardFace card={card} mini={mini} />
      <Box sx={{
        position: 'absolute', bottom: 2, right: 2,
        backgroundColor: 'rgba(0,0,0,0.78)', color: '#fff',
        borderRadius: '4px', px: 0.4, py: 0.1,
        fontSize: '0.5rem', fontWeight: 800, lineHeight: 1.2,
        pointerEvents: 'none',
      }}>
        ₹{card.value}
      </Box>
    </Box>
  )
}

function CardFace({ card, mini = false }) {
  if (!card) return null

  const w = mini ? MINI_W : CARD_W
  const h = mini ? MINI_H : CARD_H
  const r = mini ? 2 : 4

  // ── MONEY ───────────────────────────────────────────────────────────
  if (card.type === CARD_TYPES.MONEY) {
    return (
      <Paper elevation={1} sx={{
        width: w, height: h, borderRadius: `${r}px`,
        background: 'linear-gradient(145deg, #2E7D32, #43A047)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, overflow: 'hidden', userSelect: 'none',
      }}>
        <Typography sx={{
          color: '#fff', fontWeight: 900,
          fontSize: mini ? '0.82rem' : '1.15rem',
          lineHeight: 1, letterSpacing: '-0.5px',
        }}>
          ₹{card.value}Cr
        </Typography>
        {!mini && (
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.62rem', mt: 0.3, letterSpacing: '0.04em' }}>
            Money
          </Typography>
        )}
      </Paper>
    )
  }

  // ── PROPERTY ────────────────────────────────────────────────────────
  if (card.type === CARD_TYPES.PROPERTY) {
    const display = COLOR_DISPLAY[card.color] || {}
    const bandH = mini ? 16 : 30
    const textOnBand = getTextColor(display.hex)
    const set = PROPERTY_SETS[card.color]
    const rentValues = set?.rentValues || []
    const cardsNeeded = set?.cardsNeeded || rentValues.length

    // Mini — compact: band + name only (value shown via showValue pill).
    if (mini) {
      return (
        <Paper elevation={1} sx={{
          width: w, height: h, borderRadius: `${r}px`,
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden', flexShrink: 0, userSelect: 'none', backgroundColor: '#fff',
        }}>
          <Box sx={{ height: bandH, backgroundColor: display.hex, flexShrink: 0 }} />
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', px: 0.3 }}>
            <Typography sx={{
              fontSize: '0.5rem', fontWeight: 700, textAlign: 'center', lineHeight: 1.15, color: '#222',
              display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {card.name}
            </Typography>
          </Box>
        </Paper>
      )
    }

    // Full — cash-value corner badge + name band + rent ladder (like the real card).
    return (
      <Paper elevation={1} sx={{
        width: w, height: h, borderRadius: `${r}px`, position: 'relative',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden', flexShrink: 0, userSelect: 'none', backgroundColor: '#fff',
      }}>
        {/* Cash value (what it's worth if banked) — iconic corner circle */}
        <Box sx={{
          position: 'absolute', top: 2, left: 2, zIndex: 2,
          width: 18, height: 18, borderRadius: '50%',
          backgroundColor: '#fff', border: `1.5px solid ${display.hex}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 1px 2px rgba(0,0,0,0.25)',
        }}>
          <Typography sx={{ fontSize: '0.46rem', fontWeight: 900, color: display.hex, lineHeight: 1 }}>
            ₹{card.value}
          </Typography>
        </Box>

        {/* Colour band — property name */}
        <Box sx={{
          height: bandH, backgroundColor: display.hex, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center', px: 0.3, pl: 2.4,
        }}>
          <Typography sx={{
            fontSize: '0.56rem', fontWeight: 800, textAlign: 'center', lineHeight: 1.05,
            color: textOnBand, textShadow: textOnBand === '#ffffff' ? '0 1px 1px rgba(0,0,0,0.3)' : 'none',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {card.name}
          </Typography>
        </Box>

        {/* Body — landmark + rent ladder */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', px: 0.5, py: 0.3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.15 }}>
            <Typography sx={{ fontSize: '0.4rem', fontWeight: 800, color: '#888', letterSpacing: '0.06em' }}>
              RENT
            </Typography>
            {card.landmark && <CityLandmark cityKey={card.landmark} size={14} color={display.hex} />}
          </Box>
          {rentValues.map((rent, i) => {
            const full = i + 1 === cardsNeeded
            return (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', lineHeight: 1.1 }}>
                <Typography sx={{ fontSize: '0.42rem', fontWeight: full ? 800 : 600, color: full ? display.hex : '#666' }}>
                  {i + 1}{full ? ' (set)' : ''}
                </Typography>
                <Typography sx={{ fontSize: '0.46rem', fontWeight: 800, color: display.hex }}>
                  ₹{rent}
                </Typography>
              </Box>
            )
          })}
        </Box>
      </Paper>
    )
  }

  // ── WILD PROPERTY ───────────────────────────────────────────────────
  if (card.type === CARD_TYPES.WILD_PROPERTY) {
    const isFullWild = card.colors?.[0] === COLORS.WILD
    if (isFullWild) {
      return (
        <Paper elevation={1} sx={{
          width: w, height: h, borderRadius: `${r}px`,
          background: 'linear-gradient(135deg, #FF6B6B 0%, #FFE66D 25%, #4ECDC4 50%, #45B7D1 75%, #A855F7 100%)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, overflow: 'hidden', userSelect: 'none',
          px: 0.5,
        }}>
          {!mini && (
            <>
              <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '0.7rem', textAlign: 'center', textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
                Wild
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.56rem', textAlign: 'center', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                Kisi bhi color mein
              </Typography>
            </>
          )}
        </Paper>
      )
    }
    const colors = (card.colors || []).map(c => COLOR_DISPLAY[c]?.hex || '#aaa')
    return (
      <Paper elevation={1} sx={{
        width: w, height: h, borderRadius: `${r}px`,
        background: colors.length >= 2
          ? `linear-gradient(135deg, ${colors[0]} 50%, ${colors[1]} 50%)`
          : colors[0] || '#aaa',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, overflow: 'hidden', userSelect: 'none',
        px: 0.5,
      }}>
        {!mini && (
          <>
            <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.68rem', textAlign: 'center', textShadow: '0 1px 3px rgba(0,0,0,0.7)' }}>
              {card.name}
            </Typography>
            <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '0.62rem', textShadow: '0 1px 3px rgba(0,0,0,0.7)' }}>
              ₹{card.value}Cr
            </Typography>
          </>
        )}
      </Paper>
    )
  }

  // ── ACTION ──────────────────────────────────────────────────────────
  if (card.type === CARD_TYPES.ACTION) {
    const IconComponent = ACTION_ICONS[card.actionType]
    // Custom cards get a distinct gradient so they read as "special".
    const actionBg = card.actionType === ACTION_TYPES.INSURANCE
      ? 'linear-gradient(145deg, #00695C, #00897B)'
      : card.actionType === ACTION_TYPES.TRADE_ROUTE
        ? 'linear-gradient(145deg, #6A1B9A, #8E24AA)'
        : 'linear-gradient(145deg, #1A237E, #283593)'
    const isCustom = card.actionType === ACTION_TYPES.INSURANCE || card.actionType === ACTION_TYPES.TRADE_ROUTE
    return (
      <Paper elevation={1} sx={{
        width: w, height: h, borderRadius: `${r}px`,
        background: actionBg,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, overflow: 'hidden', userSelect: 'none',
        px: 0.5,
        position: 'relative',
        ...(isCustom && { boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.35)' }),
      }}>
        {isCustom && !mini && (
          <Typography sx={{
            position: 'absolute', top: 3, right: 4,
            fontSize: '0.4rem', fontWeight: 800, letterSpacing: '0.05em',
            color: 'rgba(255,255,255,0.7)',
          }}>
            ✦ CUSTOM
          </Typography>
        )}
        {IconComponent && (
          <Box sx={{ color: '#fff', opacity: 0.9, mb: mini ? 0 : 0.4 }}>
            <IconComponent sx={{ fontSize: mini ? 22 : 30 }} />
          </Box>
        )}
        {!mini && (
          <>
            <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.65rem', textAlign: 'center', lineHeight: 1.2 }}>
              {card.name}
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.54rem', textAlign: 'center', mt: 0.2, lineHeight: 1.2 }}>
              {ACTION_DESC[card.actionType]}
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.58rem', fontWeight: 800, mt: 0.3 }}>
              ₹{card.value}Cr
            </Typography>
          </>
        )}
      </Paper>
    )
  }

  // ── RENT ────────────────────────────────────────────────────────────
  if (card.type === CARD_TYPES.RENT) {
    if (card.wild) {
      return (
        <Paper elevation={1} sx={{
          width: w, height: h, borderRadius: `${r}px`,
          background: 'linear-gradient(145deg, #1B5E20, #2E7D32)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, overflow: 'hidden', userSelect: 'none',
          px: 0.5,
        }}>
          <CurrencyRupeeIcon sx={{ color: '#fff', fontSize: mini ? 22 : 32, opacity: 0.9 }} />
          {!mini && (
            <>
              <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.65rem', textAlign: 'center', mt: 0.3 }}>
                Wild Rent
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.54rem', textAlign: 'center' }}>
                Kisi se bhi rent lo
              </Typography>
            </>
          )}
        </Paper>
      )
    }
    const colors = (card.colors || []).map(c => COLOR_DISPLAY[c]?.hex || '#888')
    const bg = colors.length >= 2
      ? `linear-gradient(135deg, ${colors[0]} 50%, ${colors[1]} 50%)`
      : colors[0] || '#888'
    return (
      <Paper elevation={1} sx={{
        width: w, height: h, borderRadius: `${r}px`,
        background: bg,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, overflow: 'hidden', userSelect: 'none',
        px: 0.5,
      }}>
        <CurrencyRupeeIcon sx={{ color: '#fff', fontSize: mini ? 20 : 28, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.6))' }} />
        {!mini && (
          <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.65rem', textAlign: 'center', mt: 0.3, textShadow: '0 1px 3px rgba(0,0,0,0.7)' }}>
            {card.name}
          </Typography>
        )}
      </Paper>
    )
  }

  return (
    <Paper elevation={1} sx={{ width: w, height: h, borderRadius: `${r}px`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Typography sx={{ fontSize: '0.6rem' }}>{card.name}</Typography>
    </Paper>
  )
}
