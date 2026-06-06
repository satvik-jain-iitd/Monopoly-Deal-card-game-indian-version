import {
  AppBar, Box, Button, Chip, CircularProgress, IconButton,
  List, ListItem, ListItemText, Toolbar, Typography,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'

export default function LobbyScreen({ roomCode, players, isHost, myName, onStartGame, onLeave }) {
  function handleCopy() {
    navigator.clipboard.writeText(roomCode).catch(() => {})
  }

  return (
    <Box sx={{ height: '100dvh', display: 'flex', flexDirection: 'column', backgroundColor: 'background.default' }}>
      <AppBar position="static" elevation={0} sx={{ backgroundColor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar sx={{ minHeight: '52px !important' }}>
          <IconButton edge="start" onClick={onLeave} sx={{ color: 'text.primary', mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', flex: 1 }}>
            Lobby
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, overflow: 'auto', px: 2.5, py: 3, display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
        <Box sx={{ width: '100%', textAlign: 'center' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'text.secondary' }}>
            Room Code
          </Typography>
          <Box sx={{
            display: 'inline-flex', alignItems: 'center', gap: 1,
            border: '2px solid', borderColor: 'primary.main',
            borderRadius: 3, px: 3, py: 1.5,
            backgroundColor: 'rgba(230,81,0,0.04)',
          }}>
            <Typography sx={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '0.15em', color: 'primary.main', lineHeight: 1 }}>
              {roomCode}
            </Typography>
            <IconButton onClick={handleCopy} sx={{ color: 'primary.main' }}>
              <ContentCopyIcon />
            </IconButton>
          </Box>
          <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary', fontWeight: 500 }}>
            Doston ko ye code do
          </Typography>
        </Box>

        <Box sx={{ width: '100%' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'text.secondary' }}>
            Players ({players.length})
          </Typography>
          <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {players.map((player, i) => (
              <ListItem
                key={i}
                sx={{
                  backgroundColor: 'background.paper',
                  borderRadius: 2,
                  border: '1.5px solid',
                  borderColor: player.name === myName ? 'primary.main' : 'divider',
                  px: 2, py: 1,
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {player.isHost && (
                        <Typography component="span" sx={{ fontSize: '1rem' }}>🎮</Typography>
                      )}
                      <Typography sx={{ fontWeight: player.name === myName ? 800 : 600 }}>
                        {player.name}
                      </Typography>
                      {player.name === myName && (
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>(tum)</Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>

        {!isHost && (
          <Chip
            icon={<CircularProgress size={14} sx={{ color: 'inherit !important' }} />}
            label="Host ka wait kar rahe hain..."
            sx={{ fontWeight: 600 }}
          />
        )}
      </Box>

      <Box sx={{ px: 2.5, py: 2, pb: 'max(16px, env(safe-area-inset-bottom))', borderTop: '1px solid', borderColor: 'divider', backgroundColor: 'background.paper', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {isHost && (
          <Button
            variant="contained"
            size="large"
            fullWidth
            disabled={players.length < 2}
            onClick={onStartGame}
            sx={{ borderRadius: 3, py: 1.5, fontSize: '1rem', fontWeight: 800, boxShadow: '0 6px 18px rgba(230,81,0,0.4)' }}
          >
            Shuru Karo! 🎲
          </Button>
        )}
        <Button
          variant="outlined"
          size="large"
          fullWidth
          onClick={onLeave}
          sx={{ borderRadius: 3, py: 1.5, fontSize: '1rem', fontWeight: 700 }}
        >
          Wapas Jao
        </Button>
      </Box>
    </Box>
  )
}
