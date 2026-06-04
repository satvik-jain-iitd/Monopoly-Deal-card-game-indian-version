import '../../styles/GameLog.css'

export default function GameLog({ logs, onClose }) {
  return (
    <div className="log-overlay" onClick={onClose}>
      <div className="log-box" onClick={e => e.stopPropagation()}>
        <div className="log-header">
          <h3>Game Log</h3>
          <button className="log-close" onClick={onClose}>✕</button>
        </div>
        <div className="log-entries">
          {[...logs].reverse().map((entry, i) => (
            <div key={i} className="log-entry">{entry}</div>
          ))}
        </div>
      </div>
    </div>
  )
}
