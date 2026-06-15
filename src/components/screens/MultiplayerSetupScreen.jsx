import { useState } from 'react'
import {
  AppBar, Box, Button, IconButton, Tab, Tabs, TextField, Toolbar, Typography, Alert,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

function generateCode() {
  return Math.random().toString(36).slice(2, 6).toUpperCase()
}

// Cloud multiplayer setup — requires a WebSocket relay server.
// Set VITE_WS_URL in .env, or manually enter the server URL below.
// Run the server: cd worker && wrangler deploy (Cloudflare Worker)
export default function MultiplayerSetupScreen({ onBack, onRoomReady }) {
  const [tab, setTab] = useState(0)
  const [name, setName] = useState('')
  const [roomCode] = useState(() => generateCode())
  const [joinCode, setJoinCode] = useState('')
  const [error, setError] = useState('')
  const [serverUrl, setServerUrl] = useState(import.meta.env.VITE_WS_URL || '')

  function handleCreate() {
    const n = name.trim()
    const url = serverUrl.trim()
    if (!n) { setError('Apna naam likho'); return }
    if (!url) { setError('Server URL daalo (wss://...) ya Hotspot mode use karo'); return }
    onRoomReady(roomCode, true, n, url)
  }

  function handleJoin() {
    const n = name.trim()
    const code = joinCode.trim().toUpperCase()
    const url = serverUrl.trim()
    if (!n) { setError('Apna naam likho'); return }
    if (code.length < 2) { setError('Room code chahiye'); return }
    if (!url) { setError('Server URL daalo (wss://...) ya Hotspot mode use karo'); return }
    onRoomReady(code, false, n, url)
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
          Koi bhi jagah se khelo — internet chahiye.
          {!import.meta.env.VITE_WS_URL && (
            <Box component="span" sx={{ display: 'block', mt: 0.5, fontSize: '0.72rem', color: 'warning.main' }}>
              ⚠ Server deploy nahi hua? worker/ folder mein wrangler deploy karo, ya VITE_WS_URL env set karo.
            </Box>
          )}
        </Alert>

        <Box sx={{ backgroundColor: 'background.paper', borderRadius: 2, p: 2 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 1 }}>
            SERVER URL {serverUrl ? '✓ ' : '— Cloudflare Worker ya koi WS relay'}
          </Typography>
          <TextField
            fullWidth size="small" variant="outlined"
            placeholder="wss://dhandha-multiplayer.my-account.workers.dev"
            value={serverUrl}
            onChange={e => setServerUrl(e.target.value)}
            helperText="worker/ folder deploy karo, phir yahan URL daalo"
            inputProps={{ style: { fontFamily: 'monospace', fontSize: '0.85rem' } }}
          />
        </Box>

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
