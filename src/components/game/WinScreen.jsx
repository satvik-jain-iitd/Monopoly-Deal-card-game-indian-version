import { countCompleteSets, getPlayerBankTotal } from '../../game/gameLogic'
import '../../styles/WinScreen.css'

export default function WinScreen({ winner, players, onHome }) {
  return (
    <div className="win-screen">
      <div className="win-content">
        <div className="win-trophy">🏆</div>
        <h1 className="win-title">Badhai Ho!</h1>
        <h2 className="win-name">{winner.name}</h2>
        <p className="win-sub">ne Dhandha jeet liya!</p>
        <p className="win-detail">3 complete property sets! 🎉</p>

        <div className="final-scores">
          <h3>Final Scores</h3>
          {[...players]
            .sort((a, b) => countCompleteSets(b) - countCompleteSets(a))
            .map((p, i) => (
              <div key={p.id} className={`score-row ${p.id === winner.id ? 'winner-row' : ''}`}>
                <span className="score-rank">{i + 1}</span>
                <span className="score-name">{p.name} {p.id === winner.id ? '👑' : ''}</span>
                <span className="score-sets">{countCompleteSets(p)} sets</span>
                <span className="score-bank">${getPlayerBankTotal(p)}M</span>
              </div>
            ))}
        </div>

        <button className="btn-primary btn-large" onClick={onHome}>
          Phir Khelo! 🎮
        </button>
      </div>
    </div>
  )
}
