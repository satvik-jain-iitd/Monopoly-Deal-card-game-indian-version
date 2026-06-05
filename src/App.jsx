import { useReducer, useState } from 'react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import HomeScreen from './components/screens/HomeScreen'
import SetupScreen from './components/screens/SetupScreen'
import GameScreen from './components/screens/GameScreen'
import { initGame } from './game/gameLogic'
import { patchedGameReducer } from './game/useGameState'
import theme from './theme'

export default function App() {
  const [screen, setScreen] = useState('home')
  const [gameState, dispatch] = useReducer(patchedGameReducer, null)

  function handleStartSetup() { setScreen('setup') }
  function handleGoHome() { setScreen('home') }
  function handleStartGame(playerNames) {
    dispatch({ type: '_INIT', _state: initGame(playerNames) })
    setScreen('game')
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div style={{ height: '100dvh', width: '100%', maxWidth: 500, margin: '0 auto', overflow: 'hidden', position: 'relative', backgroundColor: theme.palette.background.default }}>
        {screen === 'home'  && <HomeScreen onPlay={handleStartSetup} />}
        {screen === 'setup' && <SetupScreen onStart={handleStartGame} onBack={handleGoHome} />}
        {screen === 'game' && gameState && <GameScreen state={gameState} dispatch={dispatch} onHome={handleGoHome} />}
      </div>
    </ThemeProvider>
  )
}
