import { Box, Button, Typography } from '@mui/material'
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid'

export default function PassDeviceModal({ playerName, onConfirm }) {
  return (
    <Box sx={{
      height: '100dvh', width: '100%',
      background: 'linear-gradient(160deg, #E65100 0%, #BF360C 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      px: 3,
    }}>
      <Box sx={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 2, textAlign: 'center',
      }}>
        <PhoneAndroidIcon sx={{ fontSize: 80, color: 'rgba(255,255,255,0.9)' }} />

        <Typography variant="h5" sx={{ color: '#fff', fontWeight: 800 }}>
          Device Pass Karo!
        </Typography>

        <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.95)', fontWeight: 700 }}>
          {playerName} ki baari hai
        </Typography>

        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)', maxWidth: 240 }}>
          Dusre players apni screen mat dekho!
        </Typography>

        <Button
          variant="contained"
          size="large"
          onClick={onConfirm}
          sx={{
            mt: 1,
            backgroundColor: '#fff',
            color: '#E65100',
            fontWeight: 800,
            borderRadius: 3,
            px: 4, py: 1.5,
            fontSize: '0.95rem',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' },
          }}
        >
          Main {playerName} hoon — Ready!
        </Button>
      </Box>
    </Box>
  )
}
