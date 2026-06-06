import { useReducer, useState, useRef, useEffect, useCallback } from 'react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import HomeScreen from './components/screens/HomeScreen'
import SetupScreen from './components/screens/SetupScreen'
import MultiplayerSetupScreen from './components/screens/MultiplayerSetupScreen'
import LobbyScreen from './components/screens/LobbyScreen'
import GameScreen from './components/screens/GameScreen'
import ResultsScreen from './components/screens/ResultsScreen'
import { initGame, PHASE } from './game/gameLogic'
import { patchedGameReducer } from './game/useGameState'
import { rankAndScore } from './game/scoring'
import { loadSeries, saveSeries, resetSeries, recordGame, getStandings, rosterKey } from './game/series'
import { useMultiplayer } from './multiplayer/useMultiplayer'
import theme from './theme'

export default function App() {
  const [screen, setScreen] = useState('home')
  const [gameState, rawDispatch] = useReducer(patchedGameReducer, null)
  const [results, setResults] = useState(null)
  const recordedGameIdRef = useRef(null)

  // ── MULTIPLAYER STATE ─────────────────────────────────────────────────
  const [mpMode, setMpMode] = useState(null)      // null | 'host' | 'guest'
  const [mpRoom, setMpRoom] = useState('')
  const [mpMyName, setMpMyName] = useState('')
  const [mpMyIndex, setMpMyIndex] = useState(null) // which player slot am I
  const [mpPlayers, setMpPlayers] = useState([])   // lobby player list
  const [mpGuestState, setMpGuestState] = useState(null)
  // Refs so callbacks don't stale-close over rapidly-changing state
  const mpModeRef = useRef(null)
  const mpMyNameRef = useRef('')

  // ── MULTIPLAYER MESSAGE HANDLER ───────────────────────────────────────
  // All lobby + game messages funnel through here.
  const handleMessage = useCallback((msg) => {
    if (msg.type === 'HELLO') {
      // A guest announced themselves — host updates the roster and broadcasts it.
      setMpPlayers(prev => {
        if (prev.find(p => p.name === msg.name)) return prev
        const next = [...prev, { name: msg.name, isHost: false }]
        // Use setTimeout so `mp.send` ref is stable
        setTimeout(() => mp.send({ type: 'ROSTER', players: next }), 0)
        return next
      })
    } else if (msg.type === 'ROSTER') {
      setMpPlayers(msg.players)
    } else if (msg.type === 'GAME_STATE') {
      // Guest receives authoritative state from host
      setMpGuestState(msg.state)
      // Derive my player index from my name (first time)
      setMpMyIndex(prev => {
        if (prev !== null) return prev
        const idx = msg.state.players?.findIndex(p => p.name === mpMyNameRef.current)
        return idx >= 0 ? idx : 0
      })
      setScreen('game')
    } else if (msg.type === 'GAME_ACTION' && mpModeRef.current === 'host') {
      // Host receives an action from a guest — run it through the reducer
      rawDispatch(msg.action)
    }
    // PLAYER_LEFT is handled by the hook's own ws.onclose relay
  }, [rawDispatch]) // mp captured below via ref

  const mp = useMultiplayer({ onMessage: handleMessage })
  // Keep a stable ref so handleMessage can call mp.send inside setMpPlayers
  const mpRef = useRef(mp)
  useEffect(() => { mpRef.current = mp }, [mp])
  // Alias through ref so the callback above never goes stale
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const mpSendStable = useCallback((msg) => mpRef.current.send(msg), [])

  // Patch mp.send into the alias used by handleMessage
  const mpPatch = { ...mp, send: mpSendStable }
  // eslint-disable-next-line no-unused-vars
  const _patchRef = useRef(); _patchRef.current = mpPatch
  // Simplified: just keep mp directly accessible inside handleMessage via closure trick
  // (mp ref is already stable — see mpRef above)
  Object.assign(mp, { send: mpSendStable }) // mutate for handleMessage's setTimeout

  // ── HOST BROADCASTS EVERY STATE CHANGE ───────────────────────────────
  useEffect(() => {
    if (mpModeRef.current !== 'host' || !gameState || !mp.connected) return
    mp.send({ type: 'GAME_STATE', state: gameState })
  }, [gameState]) // intentionally not adding mp to deps to avoid broadcast loop

  // ── UNIFIED DISPATCH ──────────────────────────────────────────────────
  const dispatch = useCallback((action) => {
    if (!mpModeRef.current) {
      rawDispatch(action)
    } else if (mpModeRef.current === 'host') {
      rawDispatch(action) // useEffect above will broadcast
    } else {
      mp.send({ type: 'GAME_ACTION', action }) // guest → host
    }
  }, [rawDispatch, mp])

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

  // ── LOCAL GAME HANDLERS ───────────────────────────────────────────────
  function handleGoHome() {
    mp.disconnect()
    mpModeRef.current = null
    mpMyNameRef.current = ''
    setMpMode(null); setMpRoom(''); setMpMyName(''); setMpMyIndex(null)
    setMpPlayers([]); setMpGuestState(null)
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

  // ── MULTIPLAYER SETUP ─────────────────────────────────────────────────
  function handleRoomReady(roomCode, isHost, myName) {
    mpModeRef.current = isHost ? 'host' : 'guest'
    mpMyNameRef.current = myName
    setMpMode(isHost ? 'host' : 'guest')
    setMpRoom(roomCode)
    setMpMyName(myName)

    if (isHost) {
      setMpPlayers([{ name: myName, isHost: true }])
      setMpMyIndex(0)
    }

    mp.connect(roomCode)

    if (!isHost) {
      // Announce as guest after connection opens (brief delay)
      setTimeout(() => mp.send({ type: 'HELLO', name: myName }), 600)
    }

    setScreen('lobby')
  }

  function handleStartMultiplayerGame() {
    const playerNames = mpPlayers.map(p => p.name)
    const myIdx = mpPlayers.findIndex(p => p.name === mpMyName)
    setMpMyIndex(myIdx >= 0 ? myIdx : 0)
    // Initialise + host auto-broadcasts initial state via the gameState effect
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
          />
        )}
        {screen === 'setup' && <SetupScreen onStart={handleStartGame} onBack={() => setScreen('home')} />}
        {screen === 'mpSetup' && (
          <MultiplayerSetupScreen onBack={() => setScreen('home')} onRoomReady={handleRoomReady} />
        )}
        {screen === 'lobby' && (
          <LobbyScreen
            roomCode={mpRoom}
            players={mpPlayers}
            isHost={mpMode === 'host'}
            myName={mpMyName}
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
            onNextGame={handleNextGame}
            onNewSeries={handleNewSeries}
            onHome={handleGoHome}
          />
        )}
      </div>
    </ThemeProvider>
  )
}
