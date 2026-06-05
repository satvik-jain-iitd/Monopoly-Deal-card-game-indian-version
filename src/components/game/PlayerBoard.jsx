import { Box, Card as MuiCard, CardContent, Chip, Typography, LinearProgress } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import HomeIcon from '@mui/icons-material/Home'
import HotelIcon from '@mui/icons-material/Hotel'
import Card from './Card'
import { COLOR_DISPLAY, PROPERTY_SETS } from '../../game/constants'
import { isSetComplete, countCompleteSets, getPlayerBankTotal } from '../../game/gameLogic'

export default function PlayerBoard({ player, compact = false }) {
  const sets = countCompleteSets(player)
  const bankTotal = getPlayerBankTotal(player)
  const propertyColors = Object.keys(player.properties).filter(c => player.properties[c].length > 0)

  // ── COMPACT (opponents) ────────────────────────────────────────────
  if (compact) {
    return (
      <MuiCard variant="outlined" sx={{ borderRadius: 2, py: 0, px: 0, mb: 0.5, overflow: 'hidden' }}>
        <CardContent sx={{ py: '6px !important', px: '10px !important' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.4 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.7rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {player.name}
            </Typography>
            <Chip label={`🏠 ${sets}`} size="small" sx={{ height: 18, fontSize: '0.6rem' }} />
            <Chip label={`₹${bankTotal}Cr`} size="small" color="success" sx={{ height: 18, fontSize: '0.6rem' }} />
            <Chip label={`🃏 ${player.hand?.length || 0}`} size="small" sx={{ height: 18, fontSize: '0.6rem' }} />
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {propertyColors.map(color => {
              const cards = player.properties[color]
              const complete = isSetComplete(color, cards)
              const display = COLOR_DISPLAY[color] || {}
              return (
                <Box key={color} sx={{
                  display: 'flex', alignItems: 'center', gap: 0.2,
                  backgroundColor: display.hex, borderRadius: '4px',
                  px: 0.5, py: 0.2,
                  opacity: complete ? 1 : 0.75,
                  border: complete ? '1.5px solid rgba(0,0,0,0.3)' : '1px solid transparent',
                }}>
                  <Typography sx={{ color: '#fff', fontSize: '0.5rem', fontWeight: 700, lineHeight: 1 }}>
                    {cards.length}
                    {complete && ' ✓'}
                  </Typography>
                </Box>
              )
            })}
          </Box>
        </CardContent>
      </MuiCard>
    )
  }

  // ── FULL (current player) ──────────────────────────────────────────
  return (
    <MuiCard elevation={2} sx={{ borderRadius: 2, mx: 1, my: 0.5, overflow: 'hidden' }}>
      <CardContent sx={{ py: '8px !important', px: '12px !important' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.72rem', display: 'block' }}>
              {player.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.3 }}>
              <Chip
                label={`${sets}/3 sets`}
                size="small"
                color={sets >= 3 ? 'success' : 'default'}
                icon={sets >= 3 ? <CheckCircleIcon /> : undefined}
                sx={{ height: 20, fontSize: '0.6rem' }}
              />
              <Chip
                label={`Bank ₹${bankTotal}Cr`}
                size="small"
                color="success"
                variant="outlined"
                sx={{ height: 20, fontSize: '0.6rem' }}
              />
            </Box>
          </Box>
          {sets > 0 && (
            <LinearProgress
              variant="determinate"
              value={(sets / 3) * 100}
              sx={{ width: 48, height: 6, borderRadius: 3 }}
              color={sets >= 3 ? 'success' : 'primary'}
            />
          )}
        </Box>

        {propertyColors.length > 0 ? (
          <Box sx={{
            display: 'flex', gap: 0.75, overflowX: 'auto', pb: 0.5,
            '&::-webkit-scrollbar': { display: 'none' },
            scrollbarWidth: 'none',
          }}>
            {propertyColors.map(color => {
              const cards = player.properties[color]
              const complete = isSetComplete(color, cards)
              const needed = PROPERTY_SETS[color]?.cardsNeeded || 0
              const display = COLOR_DISPLAY[color] || {}
              const buildings = player.buildings?.[color] || { houses: 0, hotels: 0 }

              return (
                <Box key={color} sx={{
                  flexShrink: 0,
                  borderRadius: 1.5,
                  overflow: 'hidden',
                  border: complete ? `2px solid ${display.hex}` : '1.5px solid rgba(0,0,0,0.1)',
                  minWidth: 50,
                }}>
                  <Box sx={{
                    backgroundColor: display.hex, py: 0.3, px: 0.5,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <Typography sx={{ color: '#fff', fontSize: '0.48rem', fontWeight: 700, lineHeight: 1 }}>
                      {display.name}
                    </Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.48rem', fontWeight: 700 }}>
                      {cards.length}/{needed}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.3, p: 0.4, flexWrap: 'wrap', backgroundColor: '#fff' }}>
                    {cards.map(c => <Card key={c.id} card={c} mini />)}
                  </Box>
                  {(buildings.houses > 0 || buildings.hotels > 0) && (
                    <Box sx={{ display: 'flex', gap: 0.3, px: 0.5, pb: 0.3, backgroundColor: '#fff' }}>
                      {buildings.houses > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.2 }}>
                          <HomeIcon sx={{ fontSize: 10, color: '#4CAF50' }} />
                          <Typography sx={{ fontSize: '0.45rem', color: '#4CAF50', fontWeight: 700 }}>×{buildings.houses}</Typography>
                        </Box>
                      )}
                      {buildings.hotels > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.2 }}>
                          <HotelIcon sx={{ fontSize: 10, color: '#E65100' }} />
                          <Typography sx={{ fontSize: '0.45rem', color: '#E65100', fontWeight: 700 }}>×{buildings.hotels}</Typography>
                        </Box>
                      )}
                    </Box>
                  )}
                </Box>
              )
            })}
          </Box>
        ) : (
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            Abhi koi property nahi
          </Typography>
        )}
      </CardContent>
    </MuiCard>
  )
}
