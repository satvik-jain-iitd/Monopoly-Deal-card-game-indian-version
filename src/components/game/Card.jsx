import { CARD_TYPES, ACTION_TYPES, COLOR_DISPLAY, COLORS } from '../../game/constants'
import '../../styles/Card.css'

const ACTION_ICONS = {
  [ACTION_TYPES.DEAL_BREAKER]: '💥',
  [ACTION_TYPES.DEBT_COLLECTOR]: '💸',
  [ACTION_TYPES.FORCED_DEAL]: '🔄',
  [ACTION_TYPES.SLY_DEAL]: '🦊',
  [ACTION_TYPES.PASS_GO]: '🚀',
  [ACTION_TYPES.BIRTHDAY]: '🎂',
  [ACTION_TYPES.JUST_SAY_NO]: '🚫',
  [ACTION_TYPES.DOUBLE_RENT]: '✖️2',
  [ACTION_TYPES.HOUSE]: '🏠',
  [ACTION_TYPES.HOTEL]: '🏨',
}

const ACTION_DESC = {
  [ACTION_TYPES.DEAL_BREAKER]: 'Poora set chura lo',
  [ACTION_TYPES.DEBT_COLLECTOR]: 'Kisi se $5M lo',
  [ACTION_TYPES.FORCED_DEAL]: 'Property swap karo',
  [ACTION_TYPES.SLY_DEAL]: 'Ek property chura lo',
  [ACTION_TYPES.PASS_GO]: '2 extra cards lo',
  [ACTION_TYPES.BIRTHDAY]: 'Sabse $2M lo',
  [ACTION_TYPES.JUST_SAY_NO]: 'Action cancel karo',
  [ACTION_TYPES.DOUBLE_RENT]: 'Rent double karo',
  [ACTION_TYPES.HOUSE]: 'Complete set pe ghar',
  [ACTION_TYPES.HOTEL]: 'Ghar ke upar hotel',
}

export default function Card({ card, mini = false }) {
  if (!card) return null

  const cls = mini ? 'game-card mini' : 'game-card'

  if (card.type === CARD_TYPES.MONEY) {
    return (
      <div className={`${cls} card-money`}>
        <div className="card-value">${card.value}M</div>
        {!mini && <div className="card-label">Money</div>}
      </div>
    )
  }

  if (card.type === CARD_TYPES.PROPERTY) {
    const display = COLOR_DISPLAY[card.color] || {}
    return (
      <div className={`${cls} card-property`} style={{ '--prop-color': display.hex, '--prop-light': display.light }}>
        <div className="card-color-stripe"></div>
        <div className="card-prop-name">{card.name}</div>
        {!mini && <div className="card-value">${card.value}M</div>}
      </div>
    )
  }

  if (card.type === CARD_TYPES.WILD_PROPERTY) {
    const isFullWild = card.colors?.[0] === COLORS.WILD
    if (isFullWild) {
      return (
        <div className={`${cls} card-wild-all`}>
          <div className="wild-rainbow"></div>
          {!mini && <div className="card-prop-name">Wild Property</div>}
          {!mini && <div className="card-desc">Kisi bhi color mein lagao</div>}
        </div>
      )
    }
    const colors = (card.colors || []).map(c => COLOR_DISPLAY[c]?.hex || '#aaa')
    return (
      <div className={`${cls} card-wild-two`}
        style={{ background: `linear-gradient(135deg, ${colors[0]} 50%, ${colors[1] || colors[0]} 50%)` }}>
        {!mini && <div className="card-prop-name" style={{ color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>{card.name}</div>}
        {!mini && <div className="card-value" style={{ color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>${card.value}M</div>}
      </div>
    )
  }

  if (card.type === CARD_TYPES.ACTION) {
    return (
      <div className={`${cls} card-action`}>
        <div className="action-icon">{ACTION_ICONS[card.actionType] || '⚡'}</div>
        {!mini && <div className="card-prop-name">{card.name}</div>}
        {!mini && <div className="card-desc">{ACTION_DESC[card.actionType]}</div>}
        {!mini && <div className="card-value">${card.value}M</div>}
      </div>
    )
  }

  if (card.type === CARD_TYPES.RENT) {
    if (card.wild) {
      return (
        <div className={`${cls} card-rent card-rent-wild`}>
          <div className="rent-icon">💰</div>
          {!mini && <div className="card-prop-name">Wild Rent</div>}
          {!mini && <div className="card-desc">Kisi se bhi rent lo</div>}
          {!mini && <div className="card-value">${card.value}M</div>}
        </div>
      )
    }
    const colors = (card.colors || []).map(c => COLOR_DISPLAY[c]?.hex || '#888')
    return (
      <div className={`${cls} card-rent`}
        style={{ background: colors.length >= 2 ? `linear-gradient(135deg, ${colors[0]} 50%, ${colors[1]} 50%)` : colors[0] }}>
        <div className="rent-icon">💰</div>
        {!mini && <div className="card-prop-name" style={{ color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>{card.name}</div>}
      </div>
    )
  }

  return <div className={cls}>{card.name}</div>
}
