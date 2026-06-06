import { Box, Button, List, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

const RULES = [
  'Har turn mein 2 cards draw karo',
  '3 cards tak play kar sakte ho',
  'Property, Money ya Action card khelo',
  'Sabse pehle 3 complete sets — winner!',
]

export default function HomeScreen({ onPlay, onMultiplayer, onLocalMultiplayer }) {
  return (
    <Box sx={{
      height: '100dvh', width: '100%',
      backgroundColor: 'background.default',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      px: 3, overflow: 'auto',
    }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, width: '100%', maxWidth: 340 }}>
        {/* Logo */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{
            width: 72, height: 72, borderRadius: 4,
            background: 'linear-gradient(145deg, #E65100, #FF8A50)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(230,81,0,0.35)',
          }}>
            <Typography sx={{ color: '#fff', fontSize: '2rem', fontWeight: 900, lineHeight: 1 }}>
              ₹
            </Typography>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.5px', color: 'text.primary' }}>
            Dhandha
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            India ka apna property card game
          </Typography>
        </Box>

        {/* Preview cards */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end', my: 0.5 }}>
          {[
            { bg: '#1FB25A', rot: -8, label: 'New Delhi', sub: '₹4Cr' },
            { bg: '#ED1C24', rot: 0, label: 'Bengaluru', sub: '₹3Cr', elevated: true },
            { bg: '#003F9E', rot: 8, label: 'South Mumbai', sub: '₹4Cr' },
          ].map((card, i) => (
            <Box key={i} sx={{
              width: 60, height: 86,
              backgroundColor: '#fff',
              borderRadius: 1.5,
              overflow: 'hidden',
              transform: `rotate(${card.rot}deg) ${card.elevated ? 'translateY(-8px)' : ''}`,
              boxShadow: card.elevated ? '0 8px 20px rgba(0,0,0,0.25)' : '0 4px 12px rgba(0,0,0,0.15)',
              display: 'flex', flexDirection: 'column',
              flexShrink: 0,
            }}>
              <Box sx={{ height: 22, backgroundColor: card.bg }} />
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: 0.5 }}>
                <Typography sx={{ fontSize: '0.52rem', fontWeight: 700, textAlign: 'center', color: '#222', lineHeight: 1.2 }}>
                  {card.label}
                </Typography>
                <Typography sx={{ fontSize: '0.5rem', color: card.bg, fontWeight: 700, mt: 0.3 }}>
                  {card.sub}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>

        {/* Info */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            2–6 players • Pass &amp; Play ya Online
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            3 complete property sets jitao!
          </Typography>
        </Box>

        {/* CTAs */}
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button
            variant="contained"
            size="large"
            onClick={onPlay}
            fullWidth
            sx={{ borderRadius: 3, py: 1.5, fontSize: '1.05rem', fontWeight: 800, boxShadow: '0 6px 18px rgba(230,81,0,0.4)' }}
          >
            Khelo! (Pass &amp; Play)
          </Button>
          {onMultiplayer && (
            <Button
              variant="outlined"
              size="large"
              onClick={onMultiplayer}
              fullWidth
              sx={{ borderRadius: 3, py: 1.2, fontSize: '0.95rem', fontWeight: 700, borderWidth: 2 }}
            >
              🌐 Online Khelo (Internet)
            </Button>
          )}
          {onLocalMultiplayer && (
            <Button
              variant="outlined"
              size="large"
              onClick={onLocalMultiplayer}
              fullWidth
              sx={{ borderRadius: 3, py: 1.2, fontSize: '0.95rem', fontWeight: 700, borderWidth: 2, borderColor: 'success.main', color: 'success.main' }}
            >
              📡 Hotspot Khelo (No Internet)
            </Button>
          )}
        </Box>

        {/* Rules */}
        <Box sx={{ width: '100%', mt: 0.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', px: 0.5 }}>
            Quick Rules
          </Typography>
          <List dense disablePadding>
            {RULES.map((rule, i) => (
              <ListItem key={i} sx={{ py: 0.2, px: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 24 }}>
                  <CheckCircleIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                </ListItemIcon>
                <ListItemText
                  primary={rule}
                  primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>
    </Box>
  )
}
