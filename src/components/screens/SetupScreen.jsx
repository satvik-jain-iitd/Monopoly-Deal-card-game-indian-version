import { useState } from 'react'
import {
  AppBar, Avatar, Box, Button, IconButton, TextField,
  ToggleButton, ToggleButtonGroup, Toolbar, Typography,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import PersonIcon from '@mui/icons-material/Person'

const DEFAULT_NAMES = ['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5', 'Player 6']

export const PLAYER_COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c']

export default function SetupScreen({ onStart, onBack }) {
  const [playerCount, setPlayerCount] = useState(2)
  const [names, setNames] = useState(DEFAULT_NAMES.slice())

  function updateName(i, val) {
    const n = [...names]
    n[i] = val
    setNames(n)
  }

  function handleStart() {
    const finalNames = names.slice(0, playerCount).map((n, i) => n.trim() || `Player ${i + 1}`)
    onStart(finalNames)
  }

  return (
    <Box sx={{ height: '100dvh', display: 'flex', flexDirection: 'column', backgroundColor: 'background.default' }}>
      <AppBar position="static" elevation={0} sx={{ backgroundColor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar sx={{ minHeight: '52px !important' }}>
          <IconButton edge="start" onClick={onBack} sx={{ color: 'text.primary', mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', flex: 1 }}>
            Game Setup
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, overflow: 'auto', px: 2.5, py: 2.5, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Player count */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'text.secondary' }}>
            Kitne players? ({playerCount})
          </Typography>
          <ToggleButtonGroup
            value={playerCount}
            exclusive
            onChange={(_, val) => val && setPlayerCount(val)}
            sx={{ gap: 0.75, flexWrap: 'wrap' }}
          >
            {[2, 3, 4, 5, 6].map(n => (
              <ToggleButton
                key={n}
                value={n}
                sx={{
                  borderRadius: '24px !important',
                  minWidth: 48, minHeight: 44,
                  fontWeight: 700, fontSize: '1rem',
                  border: '1.5px solid',
                  borderColor: 'divider',
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: '#fff',
                    borderColor: 'primary.main',
                    '&:hover': { backgroundColor: 'primary.dark' },
                  },
                }}
              >
                {n}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        {/* Player names */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: 'text.secondary' }}>
            Player Names
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {Array.from({ length: playerCount }).map((_, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar
                  sx={{
                    width: 36, height: 36, flexShrink: 0,
                    backgroundColor: PLAYER_COLORS[i],
                    fontSize: '0.85rem', fontWeight: 700,
                  }}
                >
                  {names[i]?.[0]?.toUpperCase() || <PersonIcon fontSize="small" />}
                </Avatar>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  value={names[i]}
                  onChange={e => updateName(i, e.target.value)}
                  placeholder={`Player ${i + 1} ka naam`}
                  inputProps={{ maxLength: 15 }}
                  autoFocus={i === 0}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      <Box sx={{ px: 2.5, py: 2, pb: 'max(16px, env(safe-area-inset-bottom))', borderTop: '1px solid', borderColor: 'divider', backgroundColor: 'background.paper' }}>
        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={handleStart}
          sx={{ borderRadius: 3, py: 1.5, fontSize: '1rem', fontWeight: 800 }}
        >
          Game Shuru Karo!
        </Button>
      </Box>
    </Box>
  )
}
