import { useState, useEffect, useRef } from 'react'
import {
  AppBar, Box, Button, CircularProgress, IconButton,
  List, ListItem, ListItemText, TextField, Toolbar, Typography, Alert,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import QRDisplay from '../multiplayer/QRDisplay'
import QRScanner from '../multiplayer/QRScanner'

const STEPS_HOST = ['role', 'name', 'showOffer', 'scanAnswer']
const STEPS_GUEST = ['role', 'name', 'scanOffer', 'showAnswer']

const HOW_IT_WORKS = [
  { n: '1', text: 'Host apna QR dikhata hai' },
  { n: '2', text: 'Guest scan karta hai' },
  { n: '3', text: 'Guest ka QR host scan karta hai' },
  { n: '4', text: 'Connected! Internet ki zaroorat nahi 🎉' },
]

export default function OfflineSetupScreen({ webrtc, onModeSet, onConnectionMade, onBack }) {
  const [step, setStep] = useState('role')
  const [role, setRole] = useState(null)
  const [name, setName] = useState('')
  const [nameError, setNameError] = useState('')
  const [offerQR, setOfferQR] = useState(null)
  const [answerQR, setAnswerQR] = useState(null)
  const [busy, setBusy] = useState(false)
  const [scanError, setScanError] = useState('')
  const [connectedFired, setConnectedFired] = useState(false)
  const onConnectionMadeRef = useRef(onConnectionMade)
  useEffect(() => { onConnectionMadeRef.current = onConnectionMade }, [onConnectionMade])

  useEffect(() => {
    if (step === 'showAnswer' && webrtc.connected && !connectedFired) {
      setConnectedFired(true)
      onConnectionMadeRef.current()
    }
  }, [webrtc.connected, step, connectedFired])

  function goBack() {
    if (step === 'role') { onBack(); return }
    const flow = role === 'host' ? STEPS_HOST : STEPS_GUEST
    const idx = flow.indexOf(step)
    if (idx <= 1) { setStep('role'); return }
    setStep(flow[idx - 1])
    setScanError('')
    setNameError('')
  }

  async function handleNameSubmit() {
    const n = name.trim()
    if (!n) { setNameError('Naam likhna zaroori hai'); return }
    setBusy(true)
    setNameError('')
    try {
      if (role === 'host') {
        const offer = await webrtc.createOffer()
        setOfferQR(offer)
        onModeSet(true, n)
        setStep('showOffer')
      } else {
        onModeSet(false, n)
        setStep('scanOffer')
      }
    } catch {
      setNameError('Kuch gadbad ho gayi. Dobara try karo.')
    } finally {
      setBusy(false)
    }
  }

  async function handleScanOffer(data) {
    setBusy(true)
    try {
      const answer = await webrtc.createAnswer(data)
      setAnswerQR(answer)
      setStep('showAnswer')
    } catch {
      setScanError('Yeh QR sahi nahi laga. Host se dobara try karo.')
    } finally {
      setBusy(false)
    }
  }

  async function handleScanAnswer(data) {
    setBusy(true)
    setScanError('')
    try {
      await webrtc.acceptAnswer(data)
      onConnectionMade()
    } catch {
      setScanError('Answer QR mein kharaabi hai. Guest se dobara try karo.')
      setBusy(false)
    }
  }

  const appBarTitle = {
    role: '📡 Offline Multiplayer',
    name: role === 'host' ? '🎮 Host Setup' : '👥 Guest Setup',
    showOffer: 'Offer QR',
    scanAnswer: 'Answer Scan',
    scanOffer: 'Offer Scan',
    showAnswer: 'Answer QR',
  }

  return (
    <Box sx={{ height: '100dvh', display: 'flex', flexDirection: 'column', backgroundColor: 'background.default' }}>
      <AppBar position="static" elevation={1} sx={{ backgroundColor: 'background.paper' }}>
        <Toolbar sx={{ minHeight: '48px !important' }}>
          <IconButton edge="start" size="small" onClick={goBack} sx={{ color: 'text.secondary', mr: 1 }}>
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary' }}>
            {appBarTitle[step]}
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, overflowY: 'auto', px: 2, pt: 2, pb: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>

        {step === 'role' && (
          <>
            <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', mt: 1 }}>
              Jiske phone ka hotspot hai, woh host hai.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={() => { setRole('host'); setStep('name') }}
                sx={{ py: 2, fontSize: '1.05rem', fontWeight: 800 }}
              >
                🎮 Main Host Hoon
              </Button>
              <Button
                variant="outlined"
                size="large"
                fullWidth
                onClick={() => { setRole('guest'); setStep('name') }}
                sx={{ py: 2, fontSize: '1.05rem', fontWeight: 800, borderWidth: 2 }}
              >
                👥 Main Join Karunga
              </Button>
            </Box>

            <Box sx={{ backgroundColor: 'background.paper', borderRadius: 3, p: 2, mt: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '0.06em', display: 'block', mb: 1 }}>
                KAISE HOTA HAI
              </Typography>
              <List dense disablePadding>
                {HOW_IT_WORKS.map(({ n, text }) => (
                  <ListItem key={n} sx={{ px: 0, py: 0.5, gap: 1.5, alignItems: 'flex-start' }}>
                    <Box sx={{
                      width: 22, height: 22, borderRadius: '50%',
                      backgroundColor: 'primary.main', color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, mt: 0.1,
                    }}>
                      <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, lineHeight: 1 }}>{n}</Typography>
                    </Box>
                    <ListItemText
                      primary={text}
                      primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </>
        )}

        {step === 'name' && (
          <>
            <TextField
              fullWidth
              size="small"
              variant="outlined"
              label="Tumhara naam"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !busy && handleNameSubmit()}
              inputProps={{ maxLength: 20 }}
              autoFocus
              disabled={busy}
            />
            {nameError && (
              <Alert severity="error" onClose={() => setNameError('')} sx={{ borderRadius: 2 }}>
                {nameError}
              </Alert>
            )}
            <Button
              variant="contained"
              size="large"
              fullWidth
              disabled={busy}
              onClick={handleNameSubmit}
              sx={{ py: 1.5, fontWeight: 800, fontSize: '1rem' }}
            >
              {busy
                ? <CircularProgress size={22} thickness={5} sx={{ color: 'inherit' }} />
                : role === 'host' ? 'QR Banao →' : 'Scan Karo →'
              }
            </Button>
          </>
        )}

        {step === 'showOffer' && (
          <>
            <Typography variant="body1" sx={{ fontWeight: 700, textAlign: 'center', color: 'text.primary' }}>
              Guest ko dikhao 👇
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <QRDisplay data={offerQR} size={240} label="Guest is phone se scan kare" />
            </Box>
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={() => setStep('scanAnswer')}
              sx={{ py: 1.5, fontWeight: 800 }}
            >
              Guest ne scan kiya? Ab unka QR scan karo
            </Button>
          </>
        )}

        {step === 'scanAnswer' && (
          <>
            <Typography variant="body1" sx={{ fontWeight: 700, textAlign: 'center', color: 'text.primary' }}>
              Guest ka QR scan karo
            </Typography>
            {scanError && (
              <Alert
                severity="error"
                onClose={() => setScanError('')}
                action={
                  <Button size="small" color="error" onClick={() => { setScanError(''); setStep('showOffer') }}>
                    Dobara
                  </Button>
                }
                sx={{ borderRadius: 2 }}
              >
                {scanError}
              </Alert>
            )}
            {busy ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, py: 4 }}>
                <CircularProgress size={36} thickness={4} sx={{ color: 'primary.main' }} />
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Connect ho raha hai...
                </Typography>
              </Box>
            ) : (
              <QRScanner onScan={handleScanAnswer} active={!busy && !scanError} />
            )}
          </>
        )}

        {step === 'scanOffer' && (
          <>
            <Typography variant="body1" sx={{ fontWeight: 700, textAlign: 'center', color: 'text.primary' }}>
              Host ka QR scan karo
            </Typography>
            {scanError && (
              <Alert severity="error" onClose={() => setScanError('')} sx={{ borderRadius: 2 }}>
                {scanError}
              </Alert>
            )}
            {busy ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, py: 4 }}>
                <CircularProgress size={36} thickness={4} sx={{ color: 'primary.main' }} />
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Answer ban raha hai...
                </Typography>
              </Box>
            ) : (
              <QRScanner onScan={handleScanOffer} active={!busy && !scanError} />
            )}
          </>
        )}

        {step === 'showAnswer' && (
          <>
            {webrtc.connected ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, flex: 1, py: 6 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: 'success.main', textAlign: 'center' }}>
                  ✅ Connect ho gaye!
                </Typography>
                <CircularProgress size={36} thickness={4} sx={{ color: 'success.main' }} />
                <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                  Host ka intezaar karo...
                </Typography>
              </Box>
            ) : (
              <>
                <Typography variant="body1" sx={{ fontWeight: 700, textAlign: 'center', color: 'text.primary' }}>
                  Host ko dikhao 👇
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <QRDisplay data={answerQR} size={240} label="Host is phone se scan kare" />
                </Box>
                <Box sx={{ backgroundColor: 'background.paper', borderRadius: 2, p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Host scan karega toh automatically connected ho jaoge
                  </Typography>
                </Box>
              </>
            )}
          </>
        )}

      </Box>
    </Box>
  )
}
