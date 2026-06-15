import { useEffect } from 'react'
import {
  Box, Button, Chip, Paper, Table, TableBody, TableCell,
  TableHead, TableRow, Typography,
} from '@mui/material'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium'
import ReplayIcon from '@mui/icons-material/Replay'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import HomeIcon from '@mui/icons-material/Home'
import { tiebreakerLabel } from '../../game/scoring'
import { sounds } from '../../game/sounds'

const RANK_MEDAL = { 1: '🥇', 2: '🥈', 3: '🥉' }

export default function ResultsScreen({
  ranked, standings, gamesPlayed, isGuest, onNextGame, onNewSeries, onHome,
}) {
  const winner = ranked[0]
  const champion = standings[0]

  useEffect(() => { sounds.win() }, [])

  return (
    <Box sx={{
      height: '100dvh', width: '100%',
      background: 'linear-gradient(160deg, #E65100 0%, #F57F17 45%, #1B5E20 100%)',
      overflowY: 'auto',
      px: 2, py: 3,
    }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.25, width: '100%', maxWidth: 380, mx: 'auto' }}>
        <EmojiEventsIcon sx={{
          fontSize: 64, color: '#FFD700',
          animation: 'bounce 1s infinite',
          '@keyframes bounce': { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        }} />
        <Typography variant="h5" sx={{ color: '#fff', fontWeight: 900, letterSpacing: '-0.5px', lineHeight: 1 }}>
          Badhai Ho!
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <WorkspacePremiumIcon sx={{ color: '#FFD700', fontSize: 24 }} />
          <Typography variant="h6" sx={{ color: '#FFD700', fontWeight: 800 }}>
            {winner?.name} jeet gaya! 🎉
          </Typography>
        </Box>

        {/* ── This game's result ──────────────────────────────────── */}
        <Paper elevation={3} sx={{ width: '100%', borderRadius: 3, overflow: 'hidden', mt: 0.5 }}>
          <Box sx={{ backgroundColor: '#E65100', px: 2, py: 0.85 }}>
            <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '0.78rem' }}>
              Is Game Ka Result
            </Typography>
          </Box>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 800, fontSize: '0.6rem', py: 0.6, px: 1, color: 'text.secondary' } }}>
                <TableCell>#</TableCell>
                <TableCell>Player</TableCell>
                <TableCell align="center">Sets</TableCell>
                <TableCell align="center">Prop</TableCell>
                <TableCell align="right">Bank</TableCell>
                <TableCell align="center">Hand</TableCell>
                <TableCell align="right">Pts</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ranked.map((r, i) => {
                const note = i > 0 ? tiebreakerLabel(ranked[i - 1], r) : null
                return (
                  <TableRow key={r.name} sx={{
                    backgroundColor: r.rank === 1 ? 'rgba(230,81,0,0.08)' : 'transparent',
                    '& td': { fontSize: '0.66rem', py: 0.5, px: 1, borderBottom: note ? 'none' : undefined },
                  }}>
                    <TableCell sx={{ fontWeight: 800 }}>{RANK_MEDAL[r.rank] || r.rank}</TableCell>
                    <TableCell sx={{ fontWeight: r.rank === 1 ? 800 : 500, color: r.rank === 1 ? 'primary.main' : 'text.primary' }}>
                      {r.name}
                      {note && (
                        <Typography component="span" sx={{ display: 'block', fontSize: '0.52rem', color: 'text.disabled', fontWeight: 600 }}>
                          ↑ {note}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>{r.completedSets}</TableCell>
                    <TableCell align="center">{r.propertyCardsOnTable}</TableCell>
                    <TableCell align="right" sx={{ color: 'success.main', fontWeight: 700 }}>₹{r.bankCash}</TableCell>
                    <TableCell align="center">{r.handCards}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 900, color: '#E65100' }}>+{r.pointsThisGame}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Paper>

        {/* ── Series standings ────────────────────────────────────── */}
        <Paper elevation={3} sx={{ width: '100%', borderRadius: 3, overflow: 'hidden' }}>
          <Box sx={{ backgroundColor: '#1B5E20', px: 2, py: 0.85, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '0.78rem' }}>
              Series Standings
            </Typography>
            <Chip label={`${gamesPlayed} game${gamesPlayed !== 1 ? 's' : ''}`} size="small"
              sx={{ height: 18, fontSize: '0.58rem', fontWeight: 700, backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff' }} />
          </Box>
          {standings.length > 0 ? (
            <Table size="small">
              <TableHead>
                <TableRow sx={{ '& th': { fontWeight: 800, fontSize: '0.6rem', py: 0.6, px: 1, color: 'text.secondary' } }}>
                  <TableCell>#</TableCell>
                  <TableCell>Player</TableCell>
                  <TableCell align="center">Games</TableCell>
                  <TableCell align="center">🥇</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {standings.map((s, i) => {
                  const isChamp = i === 0
                  return (
                    <TableRow key={s.name} sx={{
                      backgroundColor: isChamp ? 'rgba(27,94,32,0.08)' : 'transparent',
                      '& td': { fontSize: '0.66rem', py: 0.55, px: 1 },
                    }}>
                      <TableCell sx={{ fontWeight: 800 }}>{isChamp ? '👑' : i + 1}</TableCell>
                      <TableCell sx={{ fontWeight: isChamp ? 800 : 500, color: isChamp ? 'success.dark' : 'text.primary' }}>
                        {s.name}
                      </TableCell>
                      <TableCell align="center">{s.gamesPlayed}</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>{s.wins}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 900, color: 'success.dark' }}>{s.totalPoints}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <Box sx={{ px: 2, py: 3, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Series stats sirf host ke paas save hote hain
              </Typography>
            </Box>
          )}
        </Paper>

        {/* ── Actions ─────────────────────────────────────────────── */}
        {isGuest ? (
          <Box sx={{ mt: 0.5, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
              Host ke agla game shuru karne ka intezaar karo...
            </Typography>
          </Box>
        ) : (
          <Button variant="contained" size="large" fullWidth startIcon={<ReplayIcon />} onClick={onNextGame}
            sx={{ mt: 0.5, backgroundColor: '#fff', color: '#E65100', fontWeight: 800, borderRadius: 3, py: 1.35, fontSize: '0.95rem', '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' } }}>
            Agla Game — Same Players
          </Button>
        )}
        <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
          <Button variant="outlined" fullWidth startIcon={<RestartAltIcon />} onClick={onNewSeries}
            sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.6)', fontWeight: 700, borderRadius: 3, fontSize: '0.78rem', '&:hover': { borderColor: '#fff', backgroundColor: 'rgba(255,255,255,0.1)' } }}>
            Nayi Series
          </Button>
          <Button variant="outlined" fullWidth startIcon={<HomeIcon />} onClick={onHome}
            sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.6)', fontWeight: 700, borderRadius: 3, fontSize: '0.78rem', '&:hover': { borderColor: '#fff', backgroundColor: 'rgba(255,255,255,0.1)' } }}>
            Home
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
