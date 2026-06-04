import Card from './Card'
import '../../styles/CardHand.css'

export default function CardHand({ cards, selectable, selectedId, onCardClick, label }) {
  return (
    <div className="card-hand-wrapper">
      {label && <div className="hand-label">{label}</div>}
      <div className="card-hand">
        {cards.map((card, i) => (
          <div
            key={card.id}
            className={`hand-card-slot ${selectedId === card.id ? 'selected' : ''}`}
            style={{ '--i': i }}
            onClick={() => selectable && onCardClick?.(card)}
          >
            <Card card={card} />
          </div>
        ))}
        {cards.length === 0 && <p className="empty-hand">Haath khaali hai</p>}
      </div>
    </div>
  )
}
