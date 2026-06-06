import { useReducer, useState, useRef, useEffect, useCallback } from 'react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import HomeScreen from './components/screens/HomeScreen'
import SetupScreen from './components/screens/SetupScreen'
import GameScreen from './components/screens/GameScreen'
import ResultsScreen from './components/screens/ResultsScreen'
import { initGame, PHASE } from './game/gameLogic'
import { patchedGameReducer } from './game/useGameState'
import { rankAndScore } from './game/scoring'
import { loadSeries, saveSeries, resetSeries, recordGame, getStandings, rosterKey } from './game/series'
import { sounds, ACTION_SOUND_MAP, ACTION_TYPE_SOUND } from './game/sounds'
import theme from './theme'

export default function App() {
  const [screen, setScreen] = useState('home')
  const [gameState, rawDispatch] = useReducer(patchedGameReducer, null)
  const [results, setResults] = useState(null) // { ranked, standings, gamesPlayed }
  const recordedGameIdRef = useRef(null)
  const gameStateRef = useRef(gameState)
  useEffect(() => { gameStateRef.current = gameState }, [gameState])

  // Sound-aware dispatch: plays the right effect before every reducer call.
  const dispatch = useCallback((action) => {
    try {
      const state = gameStateRef.current
      let soundKey = ACTION_SOUND_MAP[action.type]
      if (action.type === 'PLAY_ACTION' && state) {
        const player = state.players[state.currentPlayerIndex]
        const card = player?.hand.find(c => c.id === action.cardId)
        if (card?.actionType) soundKey = ACTION_TYPE_SOUND[card.actionType] ?? 'cardPlay'
        else soundKey = 'cardPlay'
      }
      if (soundKey) sounds[soundKey]()
    } catch (_) {}
    rawDispatch(action)
  }, [rawDispatch])

  const isGameOver = screen === 'game' && gameState?.phase === PHASE.GAME_OVER

  // Record the finished game into the series exactly once (guarded by gameId).
  useEffect(() => {
    if (!isGameOver) return
    if (recordedGameIdRef.current === gameState.gameId) return
    recordedGameIdRef.current = gameState.gameId

    const ranked = rankAndScore(gameState.players)
    const key = rosterKey(gameState.players)
    const series = recordGame(loadSeries(), ranked, key)
    saveSeries(series)
    setResults({ ranked, standings: getStandings(series), gamesPlayed: series.gamesPlayed })
  }, [isGameOver, gameState?.gameId])

  function handleStartSetup() { setScreen('setup') }
  function handleGoHome() { setScreen('home') }

  function handleStartGame(playerNames, customCards = false) {
    setResults(null)
    dispatch({ type: '_INIT', _state: initGame(playerNames, { customCards }) })
    setScreen('game')
  }

  function handleNextGame() {
    // Replay with the same players & settings — series continues (same roster key).
    handleStartGame(gameState.players.map(p => p.name), gameState.customCards)
  }

  function handleNewSeries() {
    resetSeries()
    setResults(null)
    setScreen('home')
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div style={{ height: '100dvh', width: '100%', maxWidth: 500, margin: '0 auto', overflow: 'hidden', position: 'relative', backgroundColor: theme.palette.background.default }}>
        {screen === 'home'  && <HomeScreen onPlay={handleStartSetup} />}
        {screen === 'setup' && <SetupScreen onStart={handleStartGame} onBack={handleGoHome} />}
        {screen === 'game' && gameState && !isGameOver && (
          <GameScreen state={gameState} dispatch={dispatch} onHome={handleGoHome} />
        )}
        {isGameOver && results && (
          <ResultsScreen
            ranked={results.ranked}
            standings={results.standings}
            gamesPlayed={results.gamesPlayed}
            onNextGame={handleNextGame}
            onNewSeries={handleNewSeries}
            onHome={handleGoHome}
          />
        )}
      </div>
    </ThemeProvider>
  )
}
