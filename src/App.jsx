import { useReducer, useState, useRef, useEffect } from 'react'
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
import theme from './theme'

export default function App() {
  const [screen, setScreen] = useState('home')
  const [gameState, dispatch] = useReducer(patchedGameReducer, null)
  const [results, setResults] = useState(null) // { ranked, standings, gamesPlayed }
  const recordedGameIdRef = useRef(null)

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

  function handleStartGame(playerNames) {
    setResults(null)
    dispatch({ type: '_INIT', _state: initGame(playerNames) })
    setScreen('game')
  }

  function handleNextGame() {
    // Replay with the same players — series continues (same roster key).
    handleStartGame(gameState.players.map(p => p.name))
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
