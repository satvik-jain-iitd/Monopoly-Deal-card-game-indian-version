import { useState } from 'react'
import '../../styles/SetupScreen.css'

const DEFAULT_NAMES = ['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5', 'Player 6']

export default function SetupScreen({ onStart, onBack }) {
  const [playerCount, setPlayerCount] = useState(2)
  const [names, setNames] = useState(DEFAULT_NAMES.slice())

  function updateName(i, val) {
    const n = [...names]
    n[i] = val
    setNames(n)
  }

  function handleStart() {
    const finalNames = names.slice(0, playerCount).map((n, i) => n.trim() || `Player ${i + 1}`)
    onStart(finalNames)
  }

  return (
    <div className="setup-screen">
      <div className="setup-header">
        <button className="btn-back" onClick={onBack}>← Back</button>
        <h2>Game Setup</h2>
      </div>

      <div className="setup-content">
        <div className="player-count-section">
          <label className="section-label">Kitne players? ({playerCount})</label>
          <div className="count-buttons">
            {[2, 3, 4, 5, 6].map(n => (
              <button
                key={n}
                className={`count-btn ${playerCount === n ? 'active' : ''}`}
                onClick={() => setPlayerCount(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="player-names-section">
          <label className="section-label">Player Names</label>
          {Array.from({ length: playerCount }).map((_, i) => (
            <div key={i} className="player-name-row">
              <div className="player-avatar" style={{ background: PLAYER_COLORS[i] }}>
                {names[i]?.[0]?.toUpperCase() || (i + 1)}
              </div>
              <input
                className="name-input"
                value={names[i]}
                onChange={e => updateName(i, e.target.value)}
                placeholder={`Player ${i + 1} ka naam`}
                maxLength={15}
              />
            </div>
          ))}
        </div>

        <button className="btn-primary btn-large" onClick={handleStart}>
          Game Shuru Karo!
        </button>
      </div>
    </div>
  )
}

export const PLAYER_COLORS = [
  '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'
]
