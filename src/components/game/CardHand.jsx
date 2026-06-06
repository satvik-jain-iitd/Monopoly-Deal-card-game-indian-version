import { Box, Typography } from '@mui/material'
import Card from './Card'
import { orderHandCards } from '../../game/cardSort'

export default function CardHand({ cards, selectable, selectedId, onCardClick, label, highlightIds }) {
  const ordered = orderHandCards(cards)
  const highlighted = highlightIds ? new Set(highlightIds) : null
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      {label && (
        <Typography variant="caption" sx={{ px: 1.5, color: 'text.secondary', fontWeight: 600 }}>
          {label}
        </Typography>
      )}
      <Box sx={{
        display: 'flex', flexDirection: 'row', gap: 0.75,
        overflowX: 'auto', px: 1.5, pb: 1,
        scrollSnapType: 'x mandatory',
        '&::-webkit-scrollbar': { display: 'none' },
        msOverflowStyle: 'none', scrollbarWidth: 'none',
      }}>
        {ordered.map((card) => {
          const isSelected = selectedId === card.id
          const isNew = highlighted?.has(card.id)
          return (
            <Box
              key={card.id}
              onClick={() => selectable && onCardClick?.(card)}
              sx={{
                scrollSnapAlign: 'start',
                flexShrink: 0,
                cursor: selectable ? 'pointer' : 'default',
                transform: isSelected ? 'translateY(-10px)' : isNew ? 'translateY(-5px)' : 'translateY(0)',
                transition: 'transform 150ms ease, box-shadow 150ms ease',
                borderRadius: '10px',
                boxShadow: isSelected
                  ? '0 6px 20px rgba(230,81,0,0.35)'
                  : isNew ? '0 4px 14px rgba(46,125,50,0.40)' : 'none',
                outline: isSelected
                  ? '2px solid #E65100'
                  : isNew ? '2px solid #2E7D32' : '2px solid transparent',
                outlineOffset: '2px',
              }}
            >
              <Card card={card} />
            </Box>
          )
        })}
        {cards.length === 0 && (
          <Typography variant="caption" sx={{ color: 'text.disabled', py: 1 }}>
            Haath khaali hai
          </Typography>
        )}
      </Box>
    </Box>
  )
}
