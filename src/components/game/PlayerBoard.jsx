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
import Card from './Card'
import { COLOR_DISPLAY, PROPERTY_SETS } from '../../game/constants'
import { isSetComplete, countCompleteSets, getPlayerBankTotal } from '../../game/gameLogic'

function groupedBank(bankCards) {
  const counts = {}
  for (const c of bankCards) counts[c.value] = (counts[c.value] || 0) + 1
  return Object.entries(counts)
    .map(([v, n]) => ({ value: Number(v), count: n }))
    .sort((a, b) => b.value - a.value)
}

function RentInfoDialog({ color, onClose }) {
  if (!color) return null
  const display = COLOR_DISPLAY[color] || {}
  const set = PROPERTY_SETS[color]
  if (!set) return null
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
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
          Full set = {set.cardsNeeded} cards
        </Typography>
        <Table size="small" sx={{ mb: 1 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', py: 0.5, px: 1 }}>Cards</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', py: 0.5, px: 1 }}>Rent</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {set.rentValues.map((rent, i) => (
              <TableRow key={i}>
                <TableCell sx={{ fontSize: '0.72rem', py: 0.5, px: 1 }}>{i + 1} card{i > 0 ? 's' : ''}</TableCell>
                <TableCell sx={{ fontSize: '0.72rem', fontWeight: 700, color: display.hex, py: 0.5, px: 1 }}>₹{rent}Cr</TableCell>
              </TableRow>
            ))}
            {set.houseBonus > 0 && (
              <TableRow>
                <TableCell sx={{ fontSize: '0.72rem', py: 0.5, px: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <HomeIcon sx={{ fontSize: 12, color: '#4CAF50' }} /> House
                </TableCell>
                <TableCell sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#4CAF50', py: 0.5, px: 1 }}>+₹{set.houseBonus}Cr</TableCell>
              </TableRow>
            )}
            {set.hotelBonus > 0 && (
              <TableRow>
                <TableCell sx={{ fontSize: '0.72rem', py: 0.5, px: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <HotelIcon sx={{ fontSize: 12, color: '#E65100' }} /> Hotel
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

export default function PlayerBoard({ player, compact = false }) {
  const [rentInfoColor, setRentInfoColor] = useState(null)
  const sets = countCompleteSets(player)
  const bankTotal = getPlayerBankTotal(player)
  const propertyColors = Object.keys(player.properties).filter(c => player.properties[c].length > 0)

  // ── COMPACT (opponents) ────────────────────────────────────────────
  if (compact) {
    return (
      <>
        <RentInfoDialog color={rentInfoColor} onClose={() => setRentInfoColor(null)} />
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
            {player.bank.length > 0 && (
              <Box sx={{ display: 'flex', gap: 0.4, flexWrap: 'wrap', mb: 0.4 }}>
                {groupedBank(player.bank).map(({ value, count }) => (
                  <Typography key={value} sx={{
                    fontSize: '0.52rem', color: 'success.main', fontWeight: 700, lineHeight: 1,
                    backgroundColor: 'rgba(46,125,50,0.1)', borderRadius: '4px', px: 0.5, py: 0.2,
                  }}>
                    ₹{value}{count > 1 ? ` ×${count}` : ''}
                  </Typography>
                ))}
              </Box>
            )}
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {propertyColors.map(color => {
                const cards = player.properties[color]
                const complete = isSetComplete(color, cards)
                const display = COLOR_DISPLAY[color] || {}
                return (
                  <Box key={color} onClick={() => setRentInfoColor(color)} sx={{
                    display: 'flex', alignItems: 'center', gap: 0.2,
                    backgroundColor: display.hex, borderRadius: '4px',
                    px: 0.5, py: 0.2, cursor: 'pointer',
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
      </>
    )
  }

  // ── FULL (current player) ──────────────────────────────────────────
  return (
    <>
      <RentInfoDialog color={rentInfoColor} onClose={() => setRentInfoColor(null)} />
      <MuiCard elevation={2} sx={{ borderRadius: 2, mx: 1, my: 0.5, overflow: 'hidden' }}>
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
                  const display = COLOR_DISPLAY[color] || {}
                  const buildings = player.buildings?.[color] || { houses: 0, hotels: 0 }

                  return (
                    <Box key={color} sx={{
                      flexShrink: 0, borderRadius: 1.5, overflow: 'hidden',
                      border: complete ? `2px solid ${display.hex}` : '1.5px solid rgba(0,0,0,0.1)',
                      minWidth: 50,
                    }}>
                      {/* Color header — tap for rent info */}
                      <Box
                        onClick={() => setRentInfoColor(color)}
                        sx={{
                          backgroundColor: display.hex, py: 0.3, px: 0.5,
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          cursor: 'pointer',
                          '&:active': { opacity: 0.85 },
                        }}>
                        <Typography sx={{ color: '#fff', fontSize: '0.45rem', fontWeight: 700, lineHeight: 1 }}>
                          {display.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.2 }}>
                          <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.45rem', fontWeight: 700 }}>
                            {cards.length}/{needed}
                          </Typography>
                          <InfoOutlinedIcon sx={{ fontSize: 8, color: 'rgba(255,255,255,0.8)' }} />
                        </Box>
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
