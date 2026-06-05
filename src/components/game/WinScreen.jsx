import { Box, Button, Table, TableBody, TableCell, TableHead, TableRow, Typography, Paper } from '@mui/material'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium'
import { countCompleteSets, getPlayerBankTotal } from '../../game/gameLogic'

export default function WinScreen({ winner, players, onHome }) {
  const sorted = [...players].sort((a, b) => countCompleteSets(b) - countCompleteSets(a))

  return (
    <Box sx={{
      height: '100dvh', width: '100%',
      background: 'linear-gradient(160deg, #E65100 0%, #F57F17 50%, #1B5E20 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      px: 2, overflow: 'auto',
    }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, width: '100%', maxWidth: 360 }}>
        <EmojiEventsIcon sx={{
          fontSize: 80, color: '#FFD700',
          animation: 'bounce 1s infinite',
          '@keyframes bounce': {
            '0%, 100%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-10px)' },
          },
        }} />

        <Typography variant="h4" sx={{ color: '#fff', fontWeight: 900, letterSpacing: '-0.5px' }}>
          Badhai Ho!
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WorkspacePremiumIcon sx={{ color: '#FFD700', fontSize: 28 }} />
          <Typography variant="h5" sx={{ color: '#FFD700', fontWeight: 800 }}>
            {winner.name}
          </Typography>
        </Box>

        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.85)' }}>
          ne Dhandha jeet liya! 🎉
        </Typography>

        <Paper elevation={3} sx={{ width: '100%', borderRadius: 3, overflow: 'hidden', mt: 1 }}>
          <Box sx={{ backgroundColor: '#E65100', px: 2, py: 1 }}>
            <Typography variant="caption" sx={{ color: '#fff', fontWeight: 700, fontSize: '0.75rem' }}>
              Final Scores
            </Typography>
          </Box>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, fontSize: '0.65rem', py: 0.5 } }}>
                <TableCell>#</TableCell>
                <TableCell>Player</TableCell>
                <TableCell align="center">Sets</TableCell>
                <TableCell align="right">Bank</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sorted.map((p, i) => (
                <TableRow key={p.id} sx={{
                  backgroundColor: p.id === winner.id ? 'rgba(230,81,0,0.08)' : 'transparent',
                  '& td': { fontSize: '0.68rem', py: 0.6 },
                }}>
                  <TableCell sx={{ fontWeight: p.id === winner.id ? 800 : 400 }}>
                    {i === 0 ? '👑' : i + 1}
                  </TableCell>
                  <TableCell sx={{ fontWeight: p.id === winner.id ? 800 : 400, color: p.id === winner.id ? 'primary.main' : 'text.primary' }}>
                    {p.name}
                  </TableCell>
                  <TableCell align="center">{countCompleteSets(p)}</TableCell>
                  <TableCell align="right" sx={{ color: 'success.main', fontWeight: 700 }}>
                    ₹{getPlayerBankTotal(p)}Cr
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        <Button
          variant="contained"
          size="large"
          onClick={onHome}
          sx={{
            mt: 1, backgroundColor: '#fff', color: '#E65100',
            fontWeight: 800, borderRadius: 3, px: 4, py: 1.5,
            fontSize: '0.95rem',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' },
          }}
        >
          Phir Khelo! 🎮
        </Button>
      </Box>
    </Box>
  )
}
