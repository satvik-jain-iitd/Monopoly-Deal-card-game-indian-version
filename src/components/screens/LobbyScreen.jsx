import {
  AppBar, Box, Button, Chip, CircularProgress, IconButton, List,
  ListItem, ListItemText, Toolbar, Typography, Alert,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import WifiIcon from '@mui/icons-material/Wifi'
import WifiOffIcon from '@mui/icons-material/WifiOff'

export default function LobbyScreen({ roomCode, players, isHost, myName, connected, error, onStartGame, onLeave, readyPlayers = [], onToggleReady, showReadyGate = false }) {
  const nonHostPlayers = players.filter(p => !p.isHost)
  const allReady = nonHostPlayers.length === 0 || nonHostPlayers.every(p => readyPlayers.includes(p.name))
  const canStart = isHost && players.length >= 2 && (!showReadyGate || allReady)

  return (
    <Box sx={{ height: '100dvh', display: 'flex', flexDirection: 'column', backgroundColor: 'background.default' }}>
      <AppBar position="static" elevation={1} sx={{ backgroundColor: 'background.paper' }}>
        <Toolbar sx={{ minHeight: '48px !important' }}>
          <IconButton edge="start" size="small" onClick={onLeave} sx={{ color: 'text.secondary', mr: 1 }}>
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary', flex: 1 }}>
            Lobby
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {connected ? (
              <WifiIcon sx={{ fontSize: 18, color: 'success.main' }} />
            ) : (
              <WifiOffIcon sx={{ fontSize: 18, color: 'error.main' }} />
            )}
            {!isHost && !error && !showReadyGate && (
              <CircularProgress size={18} thickness={5} sx={{ color: 'primary.main' }} />
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, overflowY: 'auto', px: 2, pt: 3, pb: 4, display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
        {error && (
          <Alert severity="error" sx={{ width: '100%', borderRadius: 2 }}>
            {error}
          </Alert>
        )}
        {/* Room code display */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '0.08em' }}>
            ROOM CODE — doston ko yeh do
          </Typography>
          <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: '0.15em', color: 'primary.main', lineHeight: 1.1 }}>
            {roomCode}
          </Typography>
        </Box>

        {/* Player list */}
        <Box sx={{ width: '100%', backgroundColor: 'background.paper', borderRadius: 2, overflow: 'hidden' }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', px: 2, pt: 1.5, pb: 0.5, display: 'block' }}>
            PLAYERS ({players.length})
          </Typography>
          <List dense disablePadding>
            {players.map((p, i) => (
              <ListItem key={i} sx={{ px: 2, py: 0.75, borderTop: i > 0 ? '1px solid' : 'none', borderColor: 'divider' }}>
                <ListItemText
                  primary={p.name}
                  primaryTypographyProps={{ fontWeight: p.name === myName ? 800 : 500 }}
                />
                {p.isHost && <Chip label="Host 🎮" size="small" color="primary" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />}
                {!p.isHost && showReadyGate ? (
                  readyPlayers.includes(p.name)
                    ? <Chip label="Ready ✓" size="small" color="success" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />
                    : p.name === myName
                      ? <Button size="small" variant="outlined" color="primary" onClick={onToggleReady}
                          sx={{ fontWeight: 700, fontSize: '0.7rem', py: 0, minWidth: 70, borderRadius: 2 }}>
                          Ready?
                        </Button>
                      : <Chip label="Ready nahi" size="small" color="default" variant="outlined"
                          sx={{ fontWeight: 700, fontSize: '0.7rem' }} />
                ) : !p.isHost && (
                  <Chip label="Ready ✓" size="small" color="success" variant="outlined" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />
                )}
              </ListItem>
            ))}
          </List>
        </Box>

        {isHost ? (
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              variant="contained" size="large" fullWidth
              disabled={!canStart}
              onClick={onStartGame}
              sx={{ borderRadius: 3, py: 1.5, fontWeight: 800, fontSize: '1rem' }}
            >
              {canStart
                ? 'Shuru Karo! 🎲'
                : showReadyGate
                  ? 'Sab players ke ready karne ka wait karo'
                  : 'Aur players ka wait karo (min 2)'}
            </Button>
          </Box>
        ) : showReadyGate ? (
          readyPlayers.includes(myName) ? (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Host ke shuru karne ka intezaar...
              </Typography>
            </Box>
          ) : null
        ) : (
          <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={28} thickness={4} sx={{ color: 'primary.main' }} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Host ke shuru karne ka intezaar...
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  )
}
