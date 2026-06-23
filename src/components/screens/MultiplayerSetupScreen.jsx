import { useState } from 'react'
import {
  AppBar, Box, Button, Chip, IconButton, Tab, Tabs, TextField, Toolbar, Typography, Alert,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import LanguageIcon from '@mui/icons-material/Language'

function generateCode() {
  return Math.random().toString(36).slice(2, 6).toUpperCase()
}

const DEFAULT_WS_URL = 'wss://dhandha.letsdwelo.in'
const MP_SESSION_KEY = 'dhandha.mp.sessions'

function loadMpSessions() {
  try { return JSON.parse(localStorage.getItem(MP_SESSION_KEY)) || [] } catch { return [] }
}

function formatTimeAgo(timestamp) {
  const diff = Date.now() - timestamp
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

// Cloud multiplayer setup — requires a WebSocket relay server.
// Set VITE_WS_URL in .env. Falls back to Hotspot (LAN) mode.
export default function MultiplayerSetupScreen({ onBack, onRoomReady, onRejoinMpSession }) {
  const [mpSavedSessions] = useState(() => loadMpSessions())
  const [tab, setTab] = useState(0)
  const [name, setName] = useState('')
  const [roomCode] = useState(() => generateCode())
  const [joinCode, setJoinCode] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const serverUrl = import.meta.env.VITE_WS_URL || localStorage.getItem('dhandha.wsUrl') || DEFAULT_WS_URL

  function handleCreate() {
    const n = name.trim()
    if (!n) { setError('Apna naam likho'); return }
    onRoomReady(roomCode, true, n, serverUrl, password.trim())
  }

  function handleJoin() {
    const n = name.trim()
    const code = joinCode.trim().toUpperCase()
    if (!n) { setError('Apna naam likho'); return }
    if (code.length < 2) { setError('Room code chahiye'); return }
    onRoomReady(code, false, n, serverUrl, password.trim())
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
        <TextField
          fullWidth size="small" variant="outlined"
          label="Tumhara naam"
          value={name}
          onChange={e => setName(e.target.value)}
          inputProps={{ maxLength: 20 }}
        />

        {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

        <Tabs value={tab} onChange={(_, v) => { setTab(v); setError(''); setPassword('') }} variant="fullWidth"
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
            <TextField
              fullWidth size="small" variant="outlined" type="password"
              label="Password (optional — room lock karne ke liye)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              inputProps={{ maxLength: 20 }}
            />
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
            <TextField
              fullWidth size="small" variant="outlined" type="password"
              label="Password (host ne set kiya hai to)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              inputProps={{ maxLength: 20 }}
            />
            <Button variant="contained" size="large" onClick={handleJoin}
              sx={{ borderRadius: 3, py: 1.5, fontWeight: 800 }}>
              Room Jodo →
            </Button>
          </Box>
        )}

        {mpSavedSessions.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', px: 0.5, mb: 1, display: 'block', letterSpacing: '0.02em' }}>
              RESUME ONLINE GAME
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {mpSavedSessions.map(session => (
                <Box
                  key={session.roomCode}
                  sx={{
                    backgroundColor: 'background.paper', borderRadius: 2, p: 1.5,
                    display: 'flex', alignItems: 'center', gap: 1.5,
                    border: '1.5px solid rgba(21,101,192,0.15)',
                    transition: 'all 0.15s ease',
                    '&:hover': { borderColor: '#1565C0' },
                  }}
                >
                  <Box sx={{
                    width: 32, height: 32, borderRadius: '8px',
                    backgroundColor: '#1565C0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', flexShrink: 0,
                  }}>
                    <LanguageIcon sx={{ fontSize: 18 }} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.25 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.8rem' }}>
                        {session.players?.slice(0, 3).join(', ')}{session.players?.length > 3 ? ` +${session.players.length - 3}` : ''}
                      </Typography>
                      <Chip label={session.roomCode} size="small" sx={{ height: 18, fontSize: '0.5rem', fontWeight: 800, backgroundColor: 'rgba(21,101,192,0.1)', color: '#1565C0', letterSpacing: '0.05em' }} />
                    </Box>
                    <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.6rem' }}>
                      {formatTimeAgo(session.savedAt)}
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => onRejoinMpSession?.(session.roomCode, session.playerName)}
                    sx={{
                      borderRadius: '8px', fontSize: '0.65rem', fontWeight: 700, py: 0.35, px: 1.5,
                      backgroundColor: '#1565C0', flexShrink: 0, minWidth: 60,
                      '&:hover': { backgroundColor: '#0D47A1' },
                    }}
                  >
                    Rejoin
                  </Button>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  )
}
