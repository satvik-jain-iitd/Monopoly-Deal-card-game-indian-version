import { useEffect, useRef } from 'react'
import { Box, CircularProgress, Typography } from '@mui/material'
import QRCode from 'qrcode'

export default function QRDisplay({ data, size = 240, label }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!data || !canvasRef.current) return
    QRCode.toCanvas(canvasRef.current, data, {
      width: size,
      margin: 2,
      errorCorrectionLevel: 'M',
    }).catch(() => {})
  }, [data, size])

  if (!data) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, py: 4 }}>
        <CircularProgress size={36} thickness={4} sx={{ color: 'primary.main' }} />
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
          QR ban raha hai...
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
      <Box
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          lineHeight: 0,
        }}
      >
        <canvas ref={canvasRef} />
      </Box>
      {label && (
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textAlign: 'center' }}>
          {label}
        </Typography>
      )}
    </Box>
  )
}
