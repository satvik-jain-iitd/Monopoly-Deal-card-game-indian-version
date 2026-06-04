import { useReducer, useState } from 'react'
import HomeScreen from './components/screens/HomeScreen'
import SetupScreen from './components/screens/SetupScreen'
import GameScreen from './components/screens/GameScreen'
import { initGame } from './game/gameLogic'
import { patchedGameReducer } from './game/useGameState'
import './styles/global.css'

export default function App() {
  const [screen, setScreen] = useState('home') // 'home' | 'setup' | 'game'
  const [gameState, dispatch] = useReducer(patchedGameReducer, null)

  function handleStartSetup() {
    setScreen('setup')
  }

  function handleStartGame(playerNames) {
    dispatch({ type: '_INIT', _state: initGame(playerNames) })
    setScreen('game')
  }

  function handleGoHome() {
    setScreen('home')
  }

  return (
    <div className="app">
      {screen === 'home' && <HomeScreen onPlay={handleStartSetup} />}
      {screen === 'setup' && <SetupScreen onStart={handleStartGame} onBack={handleGoHome} />}
      {screen === 'game' && gameState && (
        <GameScreen state={gameState} dispatch={dispatch} onHome={handleGoHome} />
      )}
    </div>
  )
}
