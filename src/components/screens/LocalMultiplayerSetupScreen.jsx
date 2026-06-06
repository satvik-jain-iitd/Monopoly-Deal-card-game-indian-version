import { useState } from 'react'
import {
  AppBar, Box, Button, IconButton, Tab, Tabs, TextField, Toolbar, Typography, Alert,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

function generateCode() {
  return Math.random().toString(36).slice(2, 6).toUpperCase()
}

// Infer the WS URL from the page origin if served from a local network IP.
function detectWsUrl() {
  const { hostname, port } = window.location
  const isLocal = /^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(hostname) ||
    hostname === 'localhost' || hostname === '127.0.0.1'
  if (!isLocal) return ''
  const p = port || '3001'
  return `ws://${hostname}:${p}`
}

// Local WiFi / hotspot multiplayer setup — no internet needed.
// onRoomReady(roomCode, isHost, myName, wsBase)  — wsBase is 'ws://192.168.x.x:3001'
export default function LocalMultiplayerSetupScreen({ onBack, onRoomReady }) {
  const [tab, setTab] = useState(0)
  const [name, setName] = useState('')
  const [roomCode] = useState(() => generateCode())
  const [joinCode, setJoinCode] = useState('')
  const [serverUrl, setServerUrl] = useState(() => detectWsUrl())
  const [error, setError] = useState('')

  const autoDetected = !!detectWsUrl()

  function handleCreate() {
    const n = name.trim()
    const url = serverUrl.trim()
    if (!n) { setError('Apna naam likho'); return }
    if (!url) { setError('Server URL chahiye (ws://...)'); return }
    onRoomReady(roomCode, true, n, url)
  }

  function handleJoin() {
    const n = name.trim()
    const code = joinCode.trim().toUpperCase()
    const url = serverUrl.trim()
    if (!n) { setError('Apna naam likho'); return }
    if (code.length < 2) { setError('Room code chahiye'); return }
    if (!url) { setError('Server URL chahiye (ws://...)'); return }
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
            📡 Hotspot / Local WiFi
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, overflowY: 'auto', px: 2, pt: 2, pb: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Server URL */}
        <Box sx={{ backgroundColor: 'background.paper', borderRadius: 2, p: 2 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 1 }}>
            SERVER URL {autoDetected ? '✓ auto-detect ho gaya' : '— host ke laptop ka WS address'}
          </Typography>
          <TextField
            fullWidth size="small" variant="outlined"
            placeholder="ws://192.168.1.5:3001"
            value={serverUrl}
            onChange={e => setServerUrl(e.target.value)}
            helperText={
              autoDetected
                ? 'App local server se serve ho raha hai — already set!'
                : 'Host ke laptop pe server chalaao, terminal mein IP dikheigi'
            }
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
              label="Room Code"
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

        {/* Instructions */}
        <Box sx={{ backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: 2, p: 2 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 1 }}>
            KESE KARTE HAIN?
          </Typography>
          {[
            '1. Ek laptop pe:  cd server && npm install && node index.js',
            '2. Terminal mein jo URL dikhega, woh URL copy karo',
            '3. Us URL ko upar "Server URL" mein daalo (ws://...)',
            '4. Sab phones ko usi laptop ke WiFi/hotspot se jodo',
            '5. Phones mein http://... URL browser mein kholein',
            '6. Host room banao, baaki "Room Jodo" se aayein!',
          ].map((s, i) => (
            <Typography key={i} variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.9, fontFamily: i === 0 || i === 2 || i === 4 ? 'monospace' : 'inherit' }}>
              {s}
            </Typography>
          ))}
        </Box>
      </Box>
    </Box>
  )
}
