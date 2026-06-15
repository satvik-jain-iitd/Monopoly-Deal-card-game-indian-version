import { useReducer, useState, useRef, useEffect, useCallback } from 'react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import HomeScreen from './components/screens/HomeScreen'
import SetupScreen from './components/screens/SetupScreen'
import MultiplayerSetupScreen from './components/screens/MultiplayerSetupScreen'
import LocalMultiplayerSetupScreen from './components/screens/LocalMultiplayerSetupScreen'
import OfflineSetupScreen from './components/screens/OfflineSetupScreen'
import LobbyScreen from './components/screens/LobbyScreen'
import GameScreen from './components/screens/GameScreen'
import ResultsScreen from './components/screens/ResultsScreen'
import { initGame, PHASE } from './game/gameLogic'
import { patchedGameReducer } from './game/useGameState'
import { rankAndScore } from './game/scoring'
import { loadSeries, saveSeries, resetSeries, recordGame, getStandings, rosterKey } from './game/series'
import { sounds, ACTION_SOUND_MAP, ACTION_TYPE_SOUND } from './game/sounds'
import { useMultiplayer } from './multiplayer/useMultiplayer'
import { useWebRTC } from './multiplayer/useWebRTC'
import theme from './theme'

export default function App() {
  const [screen, setScreen] = useState('home')
  const [gameState, rawDispatch] = useReducer(patchedGameReducer, null)
  const [results, setResults] = useState(null) // { ranked, standings, gamesPlayed }
  const recordedGameIdRef = useRef(null)
  const gameStateRef = useRef(gameState)
  useEffect(() => { gameStateRef.current = gameState }, [gameState])

  // ── MULTIPLAYER STATE ─────────────────────────────────────────────────
  const [mpMode, setMpMode] = useState(null)      // null | 'host' | 'guest'
  const [mpRoom, setMpRoom] = useState('')
  const [mpMyName, setMpMyName] = useState('')
  const [mpMyIndex, setMpMyIndex] = useState(null)
  const [mpPlayers, setMpPlayers] = useState([])
  const [mpGuestState, setMpGuestState] = useState(null)
  const [mpError, setMpError] = useState(null)
  const mpModeRef = useRef(null)
  const mpMyNameRef = useRef('')
  const mpTransportRef = useRef('cloud') // 'cloud' | 'offline'
  // Points to whichever send fn is active for the current session
  const activeSendRef = useRef(null)

  // ── MULTIPLAYER MESSAGE HANDLER ───────────────────────────────────────
  const handleMessage = useCallback((msg) => {
    if (msg.type === 'HELLO') {
      setMpPlayers(prev => {
        if (prev.find(p => p.name === msg.name)) return prev
        const next = [...prev, { name: msg.name, isHost: false }]
        setTimeout(() => activeSendRef.current?.({ type: 'ROSTER', players: next }), 0)
        return next
      })
    } else if (msg.type === 'ROSTER') {
      setMpPlayers(msg.players)
    } else if (msg.type === 'PLAYER_LEFT') {
      setMpPlayers(prev => prev.length > 0 ? [prev[0]] : prev)
      setMpError('Koi player disconnect ho gaya!')
    } else if (msg.type === 'GAME_STATE') {
      setMpGuestState(msg.state)
      setMpMyIndex(prev => {
        if (prev !== null) return prev
        const idx = msg.state.players?.findIndex(p => p.name === mpMyNameRef.current)
        return idx >= 0 ? idx : 0
      })
      setScreen('game')
    } else if (msg.type === 'GAME_ACTION' && mpModeRef.current === 'host') {
      rawDispatch(msg.action)
    }
  }, [rawDispatch])

  // ── CLOUD / LOCAL-SERVER TRANSPORT ───────────────────────────────────
  const mp = useMultiplayer({ onMessage: handleMessage })
  const mpRef = useRef(mp)
  useEffect(() => { mpRef.current = mp }, [mp])
  const mpSend = useCallback((msg) => mpRef.current.send(msg), [])

  // ── WEBRTC (OFFLINE P2P) TRANSPORT ───────────────────────────────────
  const handlePeerConnected = useCallback(() => {
    // Guest sends HELLO when DataChannel opens; host waits for guest's HELLO
    if (mpModeRef.current === 'guest') {
      activeSendRef.current?.({ type: 'HELLO', name: mpMyNameRef.current })
    }
  }, [])

  const webrtcMp = useWebRTC({ onMessage: handleMessage, onPeerConnected: handlePeerConnected })
  const webrtcMpRef = useRef(webrtcMp)
  useEffect(() => { webrtcMpRef.current = webrtcMp }, [webrtcMp])
  const webrtcMpSend = useCallback((msg) => webrtcMpRef.current.send(msg), [])

  // ── HOST BROADCASTS STATE AFTER EVERY CHANGE ──────────────────────────
  useEffect(() => {
    if (mpModeRef.current !== 'host' || !gameState) return
    activeSendRef.current?.({ type: 'GAME_STATE', state: gameState })
  }, [gameState]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── UNIFIED DISPATCH (sounds + multiplayer routing) ───────────────────
  const dispatch = useCallback((action) => {
    // Play sound locally for every action (UI feedback, safe to ignore errors)
    try {
      const state = gameStateRef.current
      let soundKey = ACTION_SOUND_MAP[action.type]
      if (action.type === 'PLAY_ACTION' && state) {
        const player = state.players[state.currentPlayerIndex]
        const card = player?.hand.find(c => c.id === action.cardId)
        soundKey = card?.actionType ? (ACTION_TYPE_SOUND[card.actionType] ?? 'cardPlay') : 'cardPlay'
      }
      if (soundKey) sounds[soundKey]()
    } catch (_) {}

    if (!mpModeRef.current) {
      rawDispatch(action)
    } else if (mpModeRef.current === 'host') {
      rawDispatch(action)  // broadcast happens via the gameState effect above
    } else {
      activeSendRef.current?.({ type: 'GAME_ACTION', action })  // guest → host
    }
  }, [rawDispatch])

  // ── SERIES RECORDING ──────────────────────────────────────────────────
  const effectiveState = mpMode === 'guest' ? mpGuestState : gameState
  const isGameOver = screen === 'game' && effectiveState?.phase === PHASE.GAME_OVER

  useEffect(() => {
    if (!isGameOver || mpMode === 'guest') return
    if (recordedGameIdRef.current === effectiveState.gameId) return
    recordedGameIdRef.current = effectiveState.gameId
    const ranked = rankAndScore(effectiveState.players)
    const key = rosterKey(effectiveState.players)
    const series = recordGame(loadSeries(), ranked, key)
    saveSeries(series)
    setResults({ ranked, standings: getStandings(series), gamesPlayed: series.gamesPlayed })
  }, [isGameOver, effectiveState?.gameId, mpMode])

  // ── HANDLERS ──────────────────────────────────────────────────────────
  function resetMpState() {
    mp.disconnect()
    webrtcMp.disconnect()
    mpModeRef.current = null
    mpMyNameRef.current = ''
    mpTransportRef.current = 'cloud'
    activeSendRef.current = mpSend
    setMpMode(null); setMpRoom(''); setMpMyName(''); setMpMyIndex(null)
    setMpPlayers([]); setMpGuestState(null); setMpError(null)
  }

  function handleGoHome() {
    resetMpState()
    setScreen('home')
  }

  function handleStartGame(playerNames, customCards = false) {
    setResults(null)
    rawDispatch({ type: '_INIT', _state: initGame(playerNames, { customCards }) })
    setScreen('game')
  }

  function handleNextGame() {
    handleStartGame(gameState.players.map(p => p.name), gameState.customCards)
  }

  function handleNewSeries() {
    resetSeries(); setResults(null); setScreen('home')
  }

  // Called by both MultiplayerSetupScreen (cloud) and LocalMultiplayerSetupScreen (local).
  // wsBase: undefined → cloud Cloudflare URL; 'ws://192.168.x.x:3001' → local relay.
  function handleRoomReady(roomCode, isHost, myName, wsBase) {
    mpModeRef.current = isHost ? 'host' : 'guest'
    mpMyNameRef.current = myName
    mpTransportRef.current = 'cloud'
    activeSendRef.current = mpSend
    setMpMode(isHost ? 'host' : 'guest')
    setMpRoom(roomCode)
    setMpMyName(myName)

    if (isHost) {
      setMpPlayers([{ name: myName, isHost: true }])
      setMpMyIndex(0)
    }

    mp.connect(roomCode, wsBase)

    if (!isHost) {
      mpSend({ type: 'HELLO', name: myName })
    }

    setScreen('lobby')
  }

  // Called by OfflineSetupScreen once role+name are chosen (before QR exchange).
  // Screen stays on 'offlineSetup' until handleOfflineConnectionMade fires.
  function handleOfflineModeSet(isHost, myName) {
    mpModeRef.current = isHost ? 'host' : 'guest'
    mpMyNameRef.current = myName
    mpTransportRef.current = 'offline'
    activeSendRef.current = webrtcMpSend
    setMpMode(isHost ? 'host' : 'guest')
    setMpMyName(myName)
    setMpRoom('OFFLINE')

    if (isHost) {
      setMpPlayers([{ name: myName, isHost: true }])
      setMpMyIndex(0)
    }
  }

  // Called by OfflineSetupScreen once WebRTC DataChannel is open.
  function handleOfflineConnectionMade() {
    setScreen('lobby')
  }

  function handleStartMultiplayerGame() {
    const playerNames = mpPlayers.map(p => p.name)
    const myIdx = mpPlayers.findIndex(p => p.name === mpMyName)
    setMpMyIndex(myIdx >= 0 ? myIdx : 0)
    rawDispatch({ type: '_INIT', _state: initGame(playerNames) })
    setScreen('game')
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div style={{ height: '100dvh', width: '100%', maxWidth: 500, margin: '0 auto', overflow: 'hidden', position: 'relative', backgroundColor: theme.palette.background.default }}>
        {screen === 'home' && (
          <HomeScreen
            onPlay={() => setScreen('setup')}
            onMultiplayer={() => setScreen('mpSetup')}
            onLocalMultiplayer={() => setScreen('localSetup')}
            onOfflineMultiplayer={() => setScreen('offlineSetup')}
          />
        )}
        {screen === 'setup' && <SetupScreen onStart={handleStartGame} onBack={() => setScreen('home')} />}
        {screen === 'mpSetup' && (
          <MultiplayerSetupScreen onBack={() => setScreen('home')} onRoomReady={handleRoomReady} />
        )}
        {screen === 'localSetup' && (
          <LocalMultiplayerSetupScreen onBack={() => setScreen('home')} onRoomReady={handleRoomReady} />
        )}
        {screen === 'offlineSetup' && (
          <OfflineSetupScreen
            webrtc={webrtcMp}
            onModeSet={handleOfflineModeSet}
            onConnectionMade={handleOfflineConnectionMade}
            onBack={handleGoHome}
          />
        )}
        {screen === 'lobby' && (
          <LobbyScreen
            roomCode={mpRoom}
            players={mpPlayers}
            isHost={mpMode === 'host'}
            myName={mpMyName}
            connected={mpTransportRef.current === 'offline' ? webrtcMp.connected : mp.connected}
            error={mpError || mp.error}
            onStartGame={handleStartMultiplayerGame}
            onLeave={handleGoHome}
          />
        )}
        {screen === 'game' && effectiveState && !isGameOver && (
          <GameScreen
            state={effectiveState}
            dispatch={dispatch}
            onHome={handleGoHome}
            myPlayerIndex={mpMode ? mpMyIndex : null}
          />
        )}
        {isGameOver && (results || mpMode === 'guest') && (
          <ResultsScreen
            ranked={results?.ranked ?? rankAndScore(effectiveState.players)}
            standings={results?.standings ?? getStandings(loadSeries())}
            gamesPlayed={results?.gamesPlayed ?? 0}
            isGuest={mpMode === 'guest'}
            onNextGame={handleNextGame}
            onNewSeries={handleNewSeries}
            onHome={handleGoHome}
          />
        )}
      </div>
    </ThemeProvider>
  )
}
