import Card from './Card'
import { COLOR_DISPLAY, PROPERTY_SETS } from '../../game/constants'
import { isSetComplete, countCompleteSets, getPlayerBankTotal } from '../../game/gameLogic'
import '../../styles/PlayerBoard.css'

export default function PlayerBoard({ player, compact = false, full = false }) {
  const sets = countCompleteSets(player)
  const bankTotal = getPlayerBankTotal(player)
  const propertyColors = Object.keys(player.properties).filter(c => player.properties[c].length > 0)

  if (compact) {
    return (
      <div className="player-board compact">
        <div className="player-header compact">
          <span className="player-name-small">{player.name}</span>
          <span className="player-stats">
            🏠 {sets}/3 · 💵 ${bankTotal}M · 🃏 {player.hand?.length || 0}
          </span>
        </div>
        <div className="compact-properties">
          {propertyColors.map(color => {
            const cards = player.properties[color]
            const complete = isSetComplete(color, cards)
            const display = COLOR_DISPLAY[color] || {}
            return (
              <div key={color} className={`prop-dot-group ${complete ? 'complete' : ''}`}
                style={{ '--prop-color': display.hex }}>
                {cards.map(c => <div key={c.id} className="prop-dot" />)}
                {complete && <span className="complete-badge">✓</span>}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="player-board full">
      <div className="player-header full">
        <div className="player-info">
          <span className="player-name">{player.name}</span>
          <span className="player-sets">{sets}/3 sets complete</span>
        </div>
        <div className="player-bank">
          <span className="bank-label">Bank</span>
          <span className="bank-amount">${bankTotal}M</span>
        </div>
      </div>

      {propertyColors.length > 0 && (
        <div className="property-grid">
          {propertyColors.map(color => {
            const cards = player.properties[color]
            const complete = isSetComplete(color, cards)
            const needed = PROPERTY_SETS[color]?.cardsNeeded || 0
            const display = COLOR_DISPLAY[color] || {}
            const buildings = player.buildings?.[color] || { houses: 0, hotels: 0 }

            return (
              <div key={color}
                className={`property-set-col ${complete ? 'complete' : ''}`}
                style={{ '--prop-color': display.hex, '--prop-light': display.light }}>
                <div className="set-header">
                  <span className="set-name">{display.name}</span>
                  <span className="set-count">{cards.length}/{needed}</span>
                  {complete && <span className="set-complete-badge">✓</span>}
                </div>
                <div className="set-cards">
                  {cards.map(c => <Card key={c.id} card={c} mini />)}
                </div>
                {(buildings.houses > 0 || buildings.hotels > 0) && (
                  <div className="buildings">
                    {buildings.houses > 0 && <span className="building-icon">🏠×{buildings.houses}</span>}
                    {buildings.hotels > 0 && <span className="building-icon">🏨×{buildings.hotels}</span>}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
      {propertyColors.length === 0 && (
        <p className="no-props">Abhi koi property nahi</p>
      )}
    </div>
  )
}
