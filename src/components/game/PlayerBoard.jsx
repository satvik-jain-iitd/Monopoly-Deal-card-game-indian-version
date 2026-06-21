import { useState } from 'react'
import {
  Box, Card as MuiCard, CardContent, Chip, Dialog, DialogContent,
  DialogTitle, IconButton, Table, TableBody, TableCell, TableHead,
  TableRow, Typography, LinearProgress,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import HomeIcon from '@mui/icons-material/Home'
import HotelIcon from '@mui/icons-material/Hotel'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import CloseIcon from '@mui/icons-material/Close'
import SyncIcon from '@mui/icons-material/Sync'
import Card from './Card'
import { COLOR_DISPLAY, PROPERTY_SETS, CARD_TYPES, COLORS } from '../../game/constants'
import { isSetComplete, countCompleteSets, getPlayerBankTotal, getRentForColor } from '../../game/gameLogic'
import { groupedBank, orderPropertyColors } from '../../game/cardSort'

function RentInfoDialog({ info, onClose }) {
  if (!info) return null
  const { color, count = 0, buildings } = info
  const display = COLOR_DISPLAY[color] || {}
  const set = PROPERTY_SETS[color]
  if (!set) return null
  const remaining = Math.max(0, set.cardsNeeded - count)
  const currentRent = getRentForColor(color, count, buildings)

  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth
      PaperProps={{ sx: { borderRadius: 3, mx: 2 } }}>
      <DialogTitle sx={{ pb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: display.hex, flexShrink: 0 }} />
        <Typography sx={{ fontWeight: 800, flex: 1, fontSize: '1rem' }}>
          {display.name} — Rent Table
        </Typography>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        {/* Current status banner */}
        <Box sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: 2, px: 1.5, py: 1, mb: 1.5,
        }}>
          <Box>
            <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', fontWeight: 600 }}>
              Abhi tumhare paas
            </Typography>
            <Typography sx={{ fontWeight: 800, fontSize: '0.85rem' }}>
              {count}/{set.cardsNeeded} cards
              {remaining > 0
                ? <Box component="span" sx={{ color: 'text.secondary', fontWeight: 600 }}> · {remaining} aur chahiye</Box>
                : <Box component="span" sx={{ color: 'success.main', fontWeight: 700 }}> · Complete! ✓</Box>}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography sx={{ fontSize: '0.6rem', color: 'text.secondary', fontWeight: 600 }}>Abhi ka rent</Typography>
            <Typography sx={{ fontWeight: 900, fontSize: '1.1rem', color: 'text.primary', lineHeight: 1 }}>
              ₹{currentRent}Cr
            </Typography>
          </Box>
        </Box>

        <Table size="small" sx={{ mb: 1 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', py: 0.5, px: 1 }}>Cards</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', py: 0.5, px: 1 }}>Rent</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {set.rentValues.map((rent, i) => {
              const isCurrent = i + 1 === Math.min(count, set.rentValues.length) && count > 0
              return (
                <TableRow key={i} sx={isCurrent ? { backgroundColor: `${display.hex}22` } : undefined}>
                  <TableCell sx={{ fontSize: '0.72rem', py: 0.5, px: 1, fontWeight: isCurrent ? 800 : 400 }}>
                    {i + 1} card{i > 0 ? 's' : ''}{isCurrent ? '  ← abhi' : ''}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.72rem', fontWeight: isCurrent ? 900 : 700, color: 'text.primary', py: 0.5, px: 1 }}>₹{rent}Cr</TableCell>
                </TableRow>
              )
            })}
            {set.houseBonus > 0 && (
              <TableRow>
                <TableCell sx={{ fontSize: '0.72rem', py: 0.5, px: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <HomeIcon sx={{ fontSize: 12, color: '#4CAF50' }} /> + House
                </TableCell>
                <TableCell sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#4CAF50', py: 0.5, px: 1 }}>+₹{set.houseBonus}Cr</TableCell>
              </TableRow>
            )}
            {set.hotelBonus > 0 && (
              <TableRow>
                <TableCell sx={{ fontSize: '0.72rem', py: 0.5, px: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <HotelIcon sx={{ fontSize: 12, color: '#E65100' }} /> + Hotel
                </TableCell>
                <TableCell sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#E65100', py: 0.5, px: 1 }}>+₹{set.hotelBonus}Cr</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  )
}

export default function PlayerBoard({ player, compact = false, onWildAction }) {
  const [rentInfo, setRentInfo] = useState(null)
  const sets = countCompleteSets(player)
  const bankTotal = getPlayerBankTotal(player)
  const propertyColors = orderPropertyColors(player.properties)

  const openRent = (color) => setRentInfo({
    color,
    count: (player.properties[color] || []).length,
    buildings: player.buildings,
  })

  // ── COMPACT (opponents — horizontal swipe tile) ────────────────────
  if (compact) {
    return (
      <>
        <RentInfoDialog info={rentInfo} onClose={() => setRentInfo(null)} />
        <MuiCard variant="outlined" sx={{
          borderRadius: '6px', overflow: 'hidden',
          width: 120, flexShrink: 0,
        }}>
          <CardContent sx={{ py: '6px !important', px: '6px !important' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.4 }}>
              <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.66rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {player.name}
              </Typography>
              <Chip label={`🏠${sets}`} size="small" sx={{ height: 16, fontSize: '0.5rem', '& .MuiChip-label': { px: 0.5 } }} />
              {player.insurance && (
                <Chip label="🛡️" size="small" title="Insured vs Deal Breaker"
                  sx={{ height: 16, fontSize: '0.5rem', backgroundColor: 'rgba(0,121,107,0.15)', '& .MuiChip-label': { px: 0.4 } }} />
              )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 0.4 }}>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 900, color: 'success.main', lineHeight: 1 }}>
                ₹{bankTotal}Cr
              </Typography>
              <Typography sx={{ fontSize: '0.45rem', color: 'text.secondary', fontWeight: 700 }}>bank</Typography>
            </Box>
            {propertyColors.length > 0 ? (
              <Box sx={{ display: 'flex', gap: 0.3, flexWrap: 'wrap' }}>
                {propertyColors.map(color => {
                  const cards = player.properties[color]
                  const complete = isSetComplete(color, cards)
                  const display = COLOR_DISPLAY[color] || {}
                  return (
                    <Box key={color} onClick={() => openRent(color)} sx={{
                      display: 'flex', alignItems: 'center', gap: 0.15,
                      backgroundColor: display.hex, borderRadius: '3px',
                      px: 0.3, py: 0.2, cursor: 'pointer',
                      opacity: complete ? 1 : 0.78,
                      border: complete ? '1.5px solid rgba(0,0,0,0.35)' : '1px solid transparent',
                    }}>
                      {cards.map(c => {
                        const isWild = c.type === CARD_TYPES.WILD_PROPERTY
                        const wildColors = c.colors || []
                        const isFullWild = isWild && wildColors.length === 1 && wildColors[0] === COLORS.WILD
                        return (
                          <Box key={c.id} sx={{
                            width: 12, height: 16, borderRadius: '2px',
                            background: isFullWild
                              ? 'linear-gradient(135deg, #E53935, #FB8C00, #FDD835, #43A047, #1E88E5, #8E24AA)'
                              : isWild && wildColors.length >= 2
                                ? `linear-gradient(135deg, ${COLOR_DISPLAY[wildColors[0]]?.hex || display.hex} 50%, ${COLOR_DISPLAY[wildColors[1]]?.hex || display.hex} 50%)`
                                : display.hex,
                          }} />
                        )
                      })}
                      <Typography sx={{ color: '#fff', fontSize: '0.4rem', fontWeight: 800, lineHeight: 1, ml: 0.1 }}>
                        {complete && '✓'}
                      </Typography>
                    </Box>
                  )
                })}
              </Box>
            ) : (
              <Typography sx={{ fontSize: '0.5rem', color: 'text.disabled' }}>Koi property nahi</Typography>
            )}
          </CardContent>
        </MuiCard>
      </>
    )
  }

  // ── FULL (current player) ──────────────────────────────────────────
  return (
    <>
      <RentInfoDialog info={rentInfo} onClose={() => setRentInfo(null)} />
      <MuiCard elevation={2} sx={{ borderRadius: '6px', mx: 1, my: 0.5, overflow: 'hidden' }}>
        <CardContent sx={{ py: '8px !important', px: '12px !important' }}>
          {/* Header row */}
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
                {player.insurance && (
                  <Chip label="🛡️ Insured" size="small"
                    sx={{ height: 20, fontSize: '0.58rem', fontWeight: 700, backgroundColor: 'rgba(0,121,107,0.15)', color: '#00695C' }} />
                )}
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

          {/* Two-column: bank LEFT, properties RIGHT */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
            {/* LEFT — Bank */}
            <Box sx={{ minWidth: 58, flexShrink: 0 }}>
              <Typography sx={{ fontSize: '0.48rem', fontWeight: 800, color: 'text.secondary', letterSpacing: '0.05em', mb: 0.3 }}>
                BANK
              </Typography>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 900, color: 'success.main', lineHeight: 1.1 }}>
                ₹{bankTotal}Cr
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, mt: 0.4 }}>
                {player.bank.length === 0 ? (
                  <Typography sx={{ fontSize: '0.45rem', color: 'text.disabled' }}>Khaali</Typography>
                ) : (
                  groupedBank(player.bank).map(({ value, count }) => (
                    <Typography key={value} sx={{
                      fontSize: '0.48rem', color: 'success.main', fontWeight: 700,
                      backgroundColor: 'rgba(46,125,50,0.1)', borderRadius: '4px',
                      px: 0.5, py: 0.15, lineHeight: 1.4,
                    }}>
                      ₹{value}{count > 1 ? ` ×${count}` : ''}
                    </Typography>
                  ))
                )}
              </Box>
            </Box>

            {/* RIGHT — Properties */}
            {propertyColors.length > 0 ? (
              <Box sx={{
                flex: 1, display: 'flex', gap: 0.75, overflowX: 'auto', pb: 0.5,
                '&::-webkit-scrollbar': { display: 'none' },
                scrollbarWidth: 'none',
              }}>
                {propertyColors.map(color => {
                  const cards = player.properties[color]
                  const complete = isSetComplete(color, cards)
                  const needed = PROPERTY_SETS[color]?.cardsNeeded || 0
                  const remaining = Math.max(0, needed - cards.length)
                  const display = COLOR_DISPLAY[color] || {}
                  const buildings = player.buildings?.[color] || { houses: 0, hotels: 0 }
                  const rentNow = getRentForColor(color, cards.length, player.buildings)

                  return (
                    <Box key={color}
                      onClick={() => openRent(color)}
                      sx={{
                        flexShrink: 0, borderRadius: '4px', overflow: 'hidden', cursor: 'pointer',
                        border: complete ? `2px solid ${display.hex}` : '1.5px solid rgba(0,0,0,0.12)',
                        minWidth: 56,
                        '&:active': { transform: 'scale(0.98)' },
                        transition: 'transform 100ms ease',
                      }}>
                      {/* Color header — set progress + tap affordance */}
                      <Box sx={{
                        backgroundColor: display.hex, py: 0.35, px: 0.5,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.3,
                      }}>
                        <Typography sx={{ color: '#fff', fontSize: '0.5rem', fontWeight: 800, lineHeight: 1 }}>
                          {cards.length}/{needed}
                        </Typography>
                        <InfoOutlinedIcon sx={{ fontSize: 12, color: 'rgba(255,255,255,0.95)' }} />
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.3, p: 0.4, flexWrap: 'wrap', backgroundColor: '#fff' }}>
                        {cards.map(c => (
                          <Box key={c.id} sx={{ position: 'relative' }}>
                            <Card card={c} mini />
                            {onWildAction && c.type === CARD_TYPES.WILD_PROPERTY && (
                              <IconButton
                                size="small"
                                onClick={(e) => { e.stopPropagation(); onWildAction(c) }}
                                sx={{
                                  position: 'absolute', top: -4, right: -4,
                                  backgroundColor: 'background.paper',
                                  boxShadow: 1, p: 0.15,
                                  '&:hover': { backgroundColor: 'primary.light', color: 'white' },
                                  zIndex: 1,
                                }}
                              >
                                <SyncIcon sx={{ fontSize: 11 }} />
                              </IconButton>
                            )}
                          </Box>
                        ))}
                      </Box>
                      {/* Always-visible current rent + remaining */}
                      <Box sx={{ px: 0.5, pb: 0.35, backgroundColor: '#fff' }}>
                        <Typography sx={{ fontSize: '0.48rem', fontWeight: 800, color: display.hex, lineHeight: 1.3 }}>
                          Rent ₹{rentNow}Cr
                        </Typography>
                        {remaining > 0 && (
                          <Typography sx={{ fontSize: '0.44rem', color: 'text.secondary', fontWeight: 600, lineHeight: 1.2 }}>
                            +{remaining} for set
                          </Typography>
                        )}
                        {(buildings.houses > 0 || buildings.hotels > 0) && (
                          <Box sx={{ display: 'flex', gap: 0.3, mt: 0.2 }}>
                            {buildings.houses > 0 && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.2 }}>
                                <HomeIcon sx={{ fontSize: 10, color: '#4CAF50' }} />
                                <Typography sx={{ fontSize: '0.44rem', color: '#4CAF50', fontWeight: 700 }}>×{buildings.houses}</Typography>
                              </Box>
                            )}
                            {buildings.hotels > 0 && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.2 }}>
                                <HotelIcon sx={{ fontSize: 10, color: '#E65100' }} />
                                <Typography sx={{ fontSize: '0.44rem', color: '#E65100', fontWeight: 700 }}>×{buildings.hotels}</Typography>
                              </Box>
                            )}
                          </Box>
                        )}
                        {(() => {
                          const inactive = player.inactiveBuildings?.[color] || {}
                          return (inactive.houses > 0 || inactive.hotels > 0) ? (
                            <Box sx={{ display: 'flex', gap: 0.3, mt: 0.15, opacity: 0.45 }} title="Inactive buildings (set broken)">
                              {inactive.houses > 0 && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.2 }}>
                                  <HomeIcon sx={{ fontSize: 9, color: 'text.secondary' }} />
                                  <Typography sx={{ fontSize: '0.4rem', color: 'text.secondary', fontWeight: 700 }}>×{inactive.houses}💤</Typography>
                                </Box>
                              )}
                              {inactive.hotels > 0 && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.2 }}>
                                  <HotelIcon sx={{ fontSize: 9, color: 'text.secondary' }} />
                                  <Typography sx={{ fontSize: '0.4rem', color: 'text.secondary', fontWeight: 700 }}>×{inactive.hotels}💤</Typography>
                                </Box>
                              )}
                            </Box>
                          ) : null
                        })()}
                      </Box>
                    </Box>
                  )
                })}
              </Box>
            ) : (
              <Typography variant="caption" sx={{ color: 'text.disabled', flex: 1, fontSize: '0.6rem', pt: 0.5 }}>
                Abhi koi property nahi
              </Typography>
            )}
          </Box>
        </CardContent>
      </MuiCard>
    </>
  )
}
