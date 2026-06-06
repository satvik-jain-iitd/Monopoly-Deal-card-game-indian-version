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
import { CARD_TYPES, ACTION_TYPES, COLOR_DISPLAY, COLORS } from '../../game/constants'
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

const CARD_W = 72
const CARD_H = 105
const MINI_W = 44
const MINI_H = 62

export default function Card({ card, mini = false }) {
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
          fontSize: mini ? '0.7rem' : '1rem',
          lineHeight: 1, letterSpacing: '-0.5px',
        }}>
          ₹{card.value}Cr
        </Typography>
        {!mini && (
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.6rem', mt: 0.3 }}>
            Money
          </Typography>
        )}
      </Paper>
    )
  }

  // ── PROPERTY ────────────────────────────────────────────────────────
  if (card.type === CARD_TYPES.PROPERTY) {
    const display = COLOR_DISPLAY[card.color] || {}
    const bandH = mini ? 14 : 26
    const textOnBand = getTextColor(display.hex)
    return (
      <Paper elevation={1} sx={{
        width: w, height: h, borderRadius: `${r}px`,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden', flexShrink: 0, userSelect: 'none',
        backgroundColor: '#fff',
      }}>
        <Box sx={{
          height: bandH, backgroundColor: display.hex,
          flexShrink: 0,
        }} />
        <Box sx={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          px: 0.4, pb: 0.5,
        }}>
          {!mini && card.landmark && (
            <Box sx={{ mb: 0.3, opacity: 0.85 }}>
              <CityLandmark cityKey={card.landmark} size={22} color={display.hex} />
            </Box>
          )}
          <Typography sx={{
            fontSize: mini ? '0.48rem' : '0.62rem',
            fontWeight: 700, textAlign: 'center',
            lineHeight: 1.2, color: '#222',
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
            wordBreak: 'break-word',
          }}>
            {card.name}
          </Typography>
          {!mini && (
            <Typography sx={{
              fontSize: '0.55rem', color: display.hex,
              fontWeight: 700, mt: 'auto', pt: 0.3,
            }}>
              ₹{card.value}Cr
            </Typography>
          )}
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
              <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '0.62rem', textAlign: 'center', textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
                Wild
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.5rem', textAlign: 'center', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
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
            <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.6rem', textAlign: 'center', textShadow: '0 1px 3px rgba(0,0,0,0.7)' }}>
              {card.name}
            </Typography>
            <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.55rem', textShadow: '0 1px 3px rgba(0,0,0,0.7)' }}>
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
    return (
      <Paper elevation={1} sx={{
        width: w, height: h, borderRadius: `${r}px`,
        background: 'linear-gradient(145deg, #1A237E, #283593)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, overflow: 'hidden', userSelect: 'none',
        px: 0.5,
      }}>
        {IconComponent && (
          <Box sx={{ color: '#fff', opacity: 0.9, mb: mini ? 0 : 0.3 }}>
            <IconComponent sx={{ fontSize: mini ? 18 : 26 }} />
          </Box>
        )}
        {!mini && (
          <>
            <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.58rem', textAlign: 'center', lineHeight: 1.2 }}>
              {card.name}
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.48rem', textAlign: 'center', mt: 0.2, lineHeight: 1.2 }}>
              {ACTION_DESC[card.actionType]}
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.52rem', fontWeight: 700, mt: 0.3 }}>
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
          <CurrencyRupeeIcon sx={{ color: '#fff', fontSize: mini ? 18 : 28, opacity: 0.9 }} />
          {!mini && (
            <>
              <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.58rem', textAlign: 'center', mt: 0.3 }}>
                Wild Rent
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.48rem', textAlign: 'center' }}>
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
        <CurrencyRupeeIcon sx={{ color: '#fff', fontSize: mini ? 16 : 24, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.6))' }} />
        {!mini && (
          <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.58rem', textAlign: 'center', mt: 0.3, textShadow: '0 1px 3px rgba(0,0,0,0.7)' }}>
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
