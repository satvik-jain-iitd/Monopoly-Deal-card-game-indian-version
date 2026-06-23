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
import { saveSession, loadSession, deleteSession, listSessions, migrateOldSave } from './game/persistence'
import { sounds, ACTION_SOUND_MAP, ACTION_TYPE_SOUND } from './game/sounds'
import { useMultiplayer } from './multiplayer/useMultiplayer'
import { useWebRTC } from './multiplayer/useWebRTC'
import theme from './theme'

export default function App() {
  const [screen, setScreen] = useState('home')
  const [gameState, rawDispatch] = useReducer(patchedGameReducer, null)
  const [savedSessions, setSavedSessions] = useState([])
  const [results, setResults] = useState(null)
  const recordedGameIdRef = useRef(null)
  const gameStateRef = useRef(gameState)
  useEffect(() => { gameStateRef.current = gameState }, [gameState])

  // ── MIGRATE OLD SAVES + REFRESH SESSION LIST ──────────────────────────
  useEffect(() => {
    migrateOldSave()
    setSavedSessions(listSessions())
  }, [])

  useEffect(() => {
    if (screen === 'home') {
      setSavedSessions(listSessions())
    }
  }, [screen])

  // ── MULTIPLAYER STATE ─────────────────────────────────────────────────
  const [mpMode, setMpMode] = useState(null)      // null | 'host' | 'guest'
  const [mpRoom, setMpRoom] = useState('')
  const [mpMyName, setMpMyName] = useState('')
  const [mpMyIndex, setMpMyIndex] = useState(null)
  const [mpPlayers, setMpPlayers] = useState([])
  const [mpReadyPlayers, setMpReadyPlayers] = useState([])
  const [mpGuestState, setMpGuestState] = useState(null)
  const [mpError, setMpError] = useState(null)
  const mpModeRef = useRef(null)
  const mpMyNameRef = useRef('')
  const mpTransportRef = useRef('cloud') // 'cloud' | 'offline'
  const mpWsBaseRef = useRef(null)
  const isReconnectingRef = useRef(false)
  // Points to whichever send fn is active for the current session
  const activeSendRef = useRef(null)

  const MP_SESSION_KEY = 'dhandha.mp.sessions'

  function loadMpSessions() {
    try { return JSON.parse(localStorage.getItem(MP_SESSION_KEY)) || [] } catch { return [] }
  }

  function saveMpSession(roomCode, playerName, password, players, wsBase) {
    const all = loadMpSessions()
    const existing = all.find(s => s.roomCode === roomCode)
    const sessions = all.filter(s => s.roomCode !== roomCode)
    sessions.push({
      roomCode, playerName,
      password: password || existing?.password || null,
      players, wsBase: wsBase || null, savedAt: Date.now(),
    })
    localStorage.setItem(MP_SESSION_KEY, JSON.stringify(sessions))
    setMpSavedSessions(sessions)
  }

  function removeMpSession(roomCode) {
    const sessions = loadMpSessions().filter(s => s.roomCode !== roomCode)
    localStorage.setItem(MP_SESSION_KEY, JSON.stringify(sessions))
    setMpSavedSessions(sessions)
  }

  const [mpSavedSessions, setMpSavedSessions] = useState(() => loadMpSessions())

  // ── MULTIPLAYER MESSAGE HANDLER ───────────────────────────────────────
  const handleMessage = useCallback((msg) => {
    if (msg.type === 'HELLO') {
      setMpPlayers(prev => {
        if (prev.find(p => p.name === msg.name)) return prev
        const next = [...prev, { name: msg.name, isHost: false }]
        setTimeout(() => activeSendRef.current?.({ type: 'ROSTER', players: next }), 0)
        saveMpSession(mpRoom, mpMyNameRef.current, null, next.map(p => p.name), mpWsBaseRef.current)
        return next
      })
    } else if (msg.type === 'ROSTER') {
      setMpPlayers(msg.players)
      const myName = mpMyNameRef.current
      if (myName && msg.players?.length > 0) {
        saveMpSession(mpRoom, myName, null, msg.players.map(p => p.name), mpWsBaseRef.current)
      }
    } else if (msg.type === 'PLAYER_LEFT') {
      setMpPlayers(prev => {
        const filtered = prev.filter(p => p.name !== msg.name)
        saveMpSession(mpRoom, mpMyNameRef.current, null, filtered.map(p => p.name), mpWsBaseRef.current)
        return filtered
      })
      setMpError(`${msg.name} disconnect ho gaya!`)
    } else if (msg.type === 'GAME_STATE_RESPONSE') {
      isReconnectingRef.current = false
      setMpMyIndex(() => {
        const idx = msg.state.players?.findIndex(p => p.name === mpMyNameRef.current)
        return idx >= 0 ? idx : 0
      })
      setMpPlayers(msg.players || [])
      setMpMode(mpModeRef.current)
      if (msg.isHost) {
        mpModeRef.current = 'host'
        setMpMode('host')
      } else {
        mpModeRef.current = 'guest'
        setMpMode('guest')
      }
      setMpGuestState(msg.state)
      setScreen('game')
    } else if (msg.type === 'LOBBY_STATE') {
      isReconnectingRef.current = false
      setMpPlayers(msg.players || [])
      if (msg.hostName) {
        setMpPlayers(prev => prev.map(p => ({ ...p, isHost: p.name === msg.hostName })))
      }
      setScreen('lobby')
    } else if (msg.type === 'HOST_CHANGED') {
      setMpPlayers(prev => prev.map(p => ({ ...p, isHost: p.name === msg.hostName })))
      if (mpMyNameRef.current && mpMyNameRef.current !== msg.hostName && mpModeRef.current === 'host') {
        mpModeRef.current = 'guest'
        setMpMode('guest')
      }
    } else if (msg.type === 'RECONNECT_ACCEPT') {
      isReconnectingRef.current = false
    } else if (msg.type === 'RECONNECT_REJECTED') {
      isReconnectingRef.current = false
      removeMpSession(mpRoom)
      setMpError(msg.message || 'Reconnect fail — naya game banao')
    } else if (msg.type === 'CONNECTION_STATUS') {
      // used by GameScreen connection indicator
    } else if (msg.type === 'READY') {
      if (mpModeRef.current === 'host') {
        setMpReadyPlayers(prev => {
          const name = msg.name
          const next = prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
          setTimeout(() => activeSendRef.current?.({ type: 'READY', readyPlayers: next }), 0)
          return next
        })
      } else if (Array.isArray(msg.readyPlayers)) {
        setMpReadyPlayers(msg.readyPlayers)
      }
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
  }, [rawDispatch, mpRoom, mpPlayers])

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
    if (mpRoom) removeMpSession(mpRoom)
    mp.disconnect()
    webrtcMp.disconnect()
    mpModeRef.current = null
    mpMyNameRef.current = ''
    mpTransportRef.current = 'cloud'
    activeSendRef.current = mpSend
    setMpMode(null); setMpRoom(''); setMpMyName(''); setMpMyIndex(null)
    setMpPlayers([]); setMpReadyPlayers([]); setMpGuestState(null); setMpError(null)
  }

  const handleToggleReady = useCallback(() => {
    mpSend({ type: 'READY', name: mpMyName })
  }, [mpSend, mpMyName])

  function handleGoHome() {
    if (gameStateRef.current && !mpModeRef.current) {
      saveSession(gameStateRef.current)
    }
    resetMpState()
    setScreen('home')
  }

  function handleStartGame(playerNames, customCards = false) {
    setResults(null)
    if (gameState) deleteSession(gameState.gameId)
    rawDispatch({ type: '_INIT', _state: initGame(playerNames, { customCards }) })
    setScreen('game')
  }

  function handleResumeSession(gameId) {
    const state = loadSession(gameId)
    if (!state) return
    setResults(null)
    rawDispatch({ type: '_INIT', _state: state })
    setScreen('game')
  }

  function handleDeleteSession(gameId) {
    deleteSession(gameId)
    setSavedSessions(listSessions())
  }

  function handleNextGame() {
    handleStartGame(gameState.players.map(p => p.name), gameState.customCards)
  }

  function handleNewSeries() {
    resetSeries(); setResults(null); setScreen('home')
  }

  // Called by both MultiplayerSetupScreen (cloud) and LocalMultiplayerSetupScreen (local).
  // wsBase: undefined → cloud Cloudflare URL; 'ws://192.168.x.x:3001' → local relay.
  function handleRoomReady(roomCode, isHost, myName, wsBase, password) {
    mpModeRef.current = isHost ? 'host' : 'guest'
    mpMyNameRef.current = myName
    mpTransportRef.current = 'cloud'
    mpWsBaseRef.current = wsBase || null
    activeSendRef.current = mpSend
    setMpMode(isHost ? 'host' : 'guest')
    setMpRoom(roomCode)
    setMpMyName(myName)

    if (isHost) {
      setMpPlayers([{ name: myName, isHost: true }])
      setMpMyIndex(0)
    }

    mp.connect(roomCode, wsBase, null, password)

    if (!isHost) {
      mpSend({ type: 'HELLO', name: myName })
    }

    saveMpSession(roomCode, myName, password, isHost ? [myName] : [], mpWsBaseRef.current)
    setScreen('lobby')
  }

  function handleRejoinMpSession(roomCode, playerName) {
    if (isReconnectingRef.current) return
    isReconnectingRef.current = true

    const sessions = loadMpSessions()
    const session = sessions.find(s => s.roomCode === roomCode)
    const wsBase = session?.wsBase || undefined
    const password = session?.password || undefined

    mpModeRef.current = 'guest'
    mpMyNameRef.current = playerName
    mpWsBaseRef.current = wsBase || null
    mpTransportRef.current = 'cloud'
    activeSendRef.current = mpSend
    setMpMode('guest')
    setMpRoom(roomCode)
    setMpMyName(playerName)
    setMpPlayers([])
    setMpError(null)

    mp.connect(roomCode, wsBase, playerName, password)
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
    if (gameState) deleteSession(gameState.gameId)
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
            savedSessions={savedSessions}
            onResume={handleResumeSession}
            onDeleteSession={handleDeleteSession}
          />
        )}
        {screen === 'setup' && <SetupScreen onStart={handleStartGame} onBack={() => setScreen('home')} />}
        {screen === 'mpSetup' && (
          <MultiplayerSetupScreen onBack={() => setScreen('home')} onRoomReady={handleRoomReady} onRejoinMpSession={handleRejoinMpSession} />
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
        {screen === 'game' && effectiveState && !isGameOver && (
          <GameScreen
            state={effectiveState}
            dispatch={dispatch}
            onHome={handleGoHome}
            myPlayerIndex={mpMode ? mpMyIndex : null}
            connectionStatus={mpMode ? mp.connectionStatus : null}
          />
        )}
        {screen === 'lobby' && (
          <LobbyScreen
            roomCode={mpRoom}
            players={mpPlayers}
            isHost={mpMode === 'host'}
            myName={mpMyName}
            connectionStatus={mpTransportRef.current === 'offline' ? (webrtcMp.connected ? 'connected' : 'disconnected') : mp.connectionStatus}
            error={mpError || mp.error}
            onStartGame={handleStartMultiplayerGame}
            onLeave={handleGoHome}
            readyPlayers={mpReadyPlayers}
            onToggleReady={mpMode === 'guest' ? handleToggleReady : undefined}
            showReadyGate={mpTransportRef.current === 'cloud'}
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
