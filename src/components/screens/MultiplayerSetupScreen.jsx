import { useState } from 'react'
import {
  AppBar, Box, Button, IconButton, Tab, Tabs, TextField, Toolbar, Typography, Alert,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

function generateCode() {
  return Math.random().toString(36).slice(2, 6).toUpperCase()
}

const DEFAULT_WS_URL = 'wss://dhandha-multiplayer.klickbae8yt.workers.dev'

// Cloud multiplayer setup — requires a WebSocket relay server.
// Set VITE_WS_URL in .env. Falls back to Hotspot (LAN) mode.
export default function MultiplayerSetupScreen({ onBack, onRoomReady }) {
  const [tab, setTab] = useState(0)
  const [name, setName] = useState('')
  const [roomCode] = useState(() => generateCode())
  const [joinCode, setJoinCode] = useState('')
  const [error, setError] = useState('')
  const [serverUrlInput, setServerUrlInput] = useState(import.meta.env.VITE_WS_URL || DEFAULT_WS_URL)

  function handleCreate() {
    const n = name.trim()
    if (!n) { setError('Apna naam likho'); return }
    onRoomReady(roomCode, true, n, serverUrlInput)
  }

  function handleJoin() {
    const n = name.trim()
    const code = joinCode.trim().toUpperCase()
    if (!n) { setError('Apna naam likho'); return }
    if (code.length < 2) { setError('Room code chahiye'); return }
    onRoomReady(code, false, n, serverUrlInput)
  }

  return (
    <Box sx={{ height: '100dvh', display: 'flex', flexDirection: 'column', backgroundColor: 'background.default' }}>
      <AppBar position="static" elevation={1} sx={{ backgroundColor: 'background.paper' }}>
        <Toolbar sx={{ minHeight: '48px !important' }}>
          <IconButton edge="start" size="small" onClick={onBack} sx={{ color: 'text.secondary', mr: 1 }}>
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary' }}>
            🌐 Online Multiplayer
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, overflowY: 'auto', px: 2, pt: 2, pb: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Alert severity="info" sx={{ borderRadius: 2, fontSize: '0.8rem' }}>
          {serverUrlInput ? 'Cloud se khelo — koi bhi jagah!' : 'Hotspot (LAN) mode — same WiFi pe khelo. Internet nahi chahiye.'}
        </Alert>

        <TextField
          fullWidth size="small" variant="outlined"
          label="Server URL (optional)"
          value={serverUrlInput}
          onChange={e => setServerUrlInput(e.target.value)}
          placeholder="ws://your-server-url"
        />

        <TextField
          fullWidth size="small" variant="outlined"
          label="Tumhara naam"
          value={name}
          onChange={e => setName(e.target.value)}
          inputProps={{ maxLength: 20 }}
        />

        {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

        <Tabs value={tab} onChange={(_, v) => { setTab(v); setError('') }} variant="fullWidth"
          sx={{ borderRadius: 2, backgroundColor: 'background.paper' }}>
          <Tab label="Room Banao" />
          <Tab label="Room Jodo" />
        </Tabs>

        {tab === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ backgroundColor: 'background.paper', borderRadius: 2, p: 2, textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                ROOM CODE — doston ko batao
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '0.15em', color: 'primary.main', my: 1 }}>
                {roomCode}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                Dost bhi "Room Jodo" mein yahi code type karenge
              </Typography>
            </Box>
            <Button variant="contained" size="large" onClick={handleCreate}
              sx={{ borderRadius: 3, py: 1.5, fontWeight: 800 }}>
              Room Banao →
            </Button>
          </Box>
        )}

        {tab === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth size="small" variant="outlined"
              label="Room Code (host ne bataya)"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              inputProps={{ maxLength: 8, style: { letterSpacing: '0.15em', fontWeight: 800, fontSize: '1.1rem' } }}
            />
            <Button variant="contained" size="large" onClick={handleJoin}
              sx={{ borderRadius: 3, py: 1.5, fontWeight: 800 }}>
              Room Jodo →
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  )
}
