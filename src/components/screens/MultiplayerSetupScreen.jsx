import { useState } from 'react'
import {
  AppBar, Box, Button, IconButton, Tab, Tabs, TextField, Toolbar, Typography,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'

function randomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export default function MultiplayerSetupScreen({ onBack, onRoomReady }) {
  const [tab, setTab] = useState(0)
  const [roomCode] = useState(randomCode)
  const [createName, setCreateName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [joinName, setJoinName] = useState('')

  function handleCopy(code) {
    navigator.clipboard.writeText(code).catch(() => {})
  }

  return (
    <Box sx={{ height: '100dvh', display: 'flex', flexDirection: 'column', backgroundColor: 'background.default' }}>
      <AppBar position="static" elevation={0} sx={{ backgroundColor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar sx={{ minHeight: '52px !important' }}>
          <IconButton edge="start" onClick={onBack} sx={{ color: 'text.primary', mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', flex: 1 }}>
            Multiplayer
          </Typography>
        </Toolbar>
      </AppBar>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="fullWidth"
        sx={{
          backgroundColor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          '& .MuiTab-root': { fontWeight: 700, fontSize: '0.95rem' },
          '& .Mui-selected': { color: 'primary.main' },
          '& .MuiTabs-indicator': { backgroundColor: 'primary.main' },
        }}
      >
        <Tab label="Banao (Create)" />
        <Tab label="Jodo (Join)" />
      </Tabs>

      <Box sx={{ flex: 1, overflow: 'auto', px: 2.5, py: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {tab === 0 ? (
          <>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: 'text.secondary' }}>
                Tumhara Room Code
              </Typography>
              <Box sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
                border: '2px solid', borderColor: 'primary.main',
                borderRadius: 3, p: 2,
                backgroundColor: 'rgba(230,81,0,0.04)',
              }}>
                <Typography sx={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '0.15em', color: 'primary.main', lineHeight: 1 }}>
                  {roomCode}
                </Typography>
                <IconButton onClick={() => handleCopy(roomCode)} sx={{ color: 'primary.main' }}>
                  <ContentCopyIcon />
                </IconButton>
              </Box>
            </Box>

            <TextField
              fullWidth
              variant="outlined"
              label="Tumhara naam"
              value={createName}
              onChange={e => setCreateName(e.target.value)}
              inputProps={{ maxLength: 15 }}
              autoFocus
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </>
        ) : (
          <>
            <TextField
              fullWidth
              variant="outlined"
              label="Room Code"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase().slice(0, 4))}
              inputProps={{ maxLength: 4 }}
              autoFocus
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              fullWidth
              variant="outlined"
              label="Tumhara naam"
              value={joinName}
              onChange={e => setJoinName(e.target.value)}
              inputProps={{ maxLength: 15 }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </>
        )}
      </Box>

      <Box sx={{ px: 2.5, py: 2, pb: 'max(16px, env(safe-area-inset-bottom))', borderTop: '1px solid', borderColor: 'divider', backgroundColor: 'background.paper' }}>
        {tab === 0 ? (
          <Button
            variant="contained"
            size="large"
            fullWidth
            disabled={!createName.trim()}
            onClick={() => onRoomReady(roomCode, true, createName.trim())}
            sx={{ borderRadius: 3, py: 1.5, fontSize: '1rem', fontWeight: 800 }}
          >
            Lobby mein jao →
          </Button>
        ) : (
          <Button
            variant="contained"
            size="large"
            fullWidth
            disabled={joinCode.length !== 4 || !joinName.trim()}
            onClick={() => onRoomReady(joinCode, false, joinName.trim())}
            sx={{ borderRadius: 3, py: 1.5, fontSize: '1rem', fontWeight: 800 }}
          >
            Join Karo →
          </Button>
        )}
      </Box>
    </Box>
  )
}
