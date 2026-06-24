import { useState, useEffect, useRef } from 'react'
import { Box, Typography } from '@mui/material'

const pctColor = (pct) => {
  if (pct > 50) return 'success'
  if (pct > 25) return 'warning'
  return 'error'
}

export default function TurnTimer({ turnTimeout, turnStartedAt, onTimeout }) {
  const [remaining, setRemaining] = useState(null)
  const firedRef = useRef(false)

  useEffect(() => {
    firedRef.current = false
    if (!turnTimeout || !turnStartedAt) { setRemaining(null); return }
    const tick = () => {
      const elapsed = Date.now() - turnStartedAt
      const rem = Math.max(0, Math.floor((turnTimeout - elapsed) / 1000))
      setRemaining(rem)
      if (rem === 0 && !firedRef.current && onTimeout) {
        firedRef.current = true
        onTimeout()
      }
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [turnTimeout, turnStartedAt, onTimeout])

  if (remaining == null) return null

  const pct = Math.round((remaining / (turnTimeout / 1000)) * 100)
  const color = pctColor(pct)
  const display = `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}`

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', ml: '8px' }}>
      <Typography
        variant="caption"
        sx={{
          color: `${color}.main`,
          fontWeight: 700,
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1,
          fontSize: '0.72rem',
          ...(pct <= 25 && {
            animation: 'pulse 1s infinite',
            '@keyframes pulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.5 } },
          }),
        }}
      >
        {display}
      </Typography>
      <Box sx={{ width: '32px', height: '4px', borderRadius: '2px', bgcolor: 'grey.300', overflow: 'hidden', flexShrink: 0 }}>
        <Box sx={{ width: `${pct}%`, height: '100%', bgcolor: `${color}.main`, borderRadius: '2px', transition: 'width 1s linear' }} />
      </Box>
    </Box>
  )
}
