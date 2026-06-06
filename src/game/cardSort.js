import { CARD_TYPES, COLORS } from './constants'

// Canonical property colour order — matches the COLORS definition order.
// Used everywhere property groups are displayed so the layout is consistent.
export const PROPERTY_COLOR_ORDER = [
  COLORS.BROWN, COLORS.LIGHT_BLUE, COLORS.PINK, COLORS.ORANGE,
  COLORS.RED, COLORS.YELLOW, COLORS.GREEN, COLORS.DARK_BLUE,
  COLORS.RAILROAD, COLORS.UTILITY,
]

function colorIndex(color) {
  const i = PROPERTY_COLOR_ORDER.indexOf(color)
  return i === -1 ? PROPERTY_COLOR_ORDER.length : i
}

// Present property colour keys, sorted into canonical order.
export function orderPropertyColors(propertiesObj = {}) {
  return Object.keys(propertiesObj)
    .filter(c => (propertiesObj[c]?.length || 0) > 0)
    .sort((a, b) => colorIndex(a) - colorIndex(b))
}

// Group bank cards by denomination, sorted by value descending.
export function groupedBank(bankCards = []) {
  const counts = {}
  for (const c of bankCards) counts[c.value] = (counts[c.value] || 0) + 1
  return Object.entries(counts)
    .map(([v, n]) => ({ value: Number(v), count: n }))
    .sort((a, b) => b.value - a.value)
}

// Canonical hand ordering:
//   cash (left, value desc) → actions (grouped by type) → rents → properties (right)
// Properties: full/unmatched wilds first, then each colour group in canonical
// order, with colour-matched wilds placed right after their colour group.
export function orderHandCards(cards = []) {
  const money = cards
    .filter(c => c.type === CARD_TYPES.MONEY)
    .sort((a, b) => b.value - a.value)

  const actions = cards
    .filter(c => c.type === CARD_TYPES.ACTION)
    .sort((a, b) => (a.actionType || '').localeCompare(b.actionType || ''))

  const rents = cards.filter(c => c.type === CARD_TYPES.RENT)

  const pureProps = cards.filter(c => c.type === CARD_TYPES.PROPERTY)
  const wilds = cards.filter(c => c.type === CARD_TYPES.WILD_PROPERTY)

  // Group pure properties by colour.
  const byColor = {}
  for (const c of pureProps) (byColor[c.color] ||= []).push(c)
  const heldColors = new Set(Object.keys(byColor))

  // Attach each wild to the first colour it shares with a held group;
  // otherwise it's "unmatched" (full wild or no matching colour held).
  const wildByColor = {}
  const unmatchedWilds = []
  for (const w of wilds) {
    const match = (w.colors || []).find(col => col !== COLORS.WILD && heldColors.has(col))
    if (match) (wildByColor[match] ||= []).push(w)
    else unmatchedWilds.push(w)
  }

  const propsSection = [...unmatchedWilds]
  for (const color of PROPERTY_COLOR_ORDER) {
    if (byColor[color]) propsSection.push(...byColor[color])
    if (wildByColor[color]) propsSection.push(...wildByColor[color])
  }

  return [...money, ...actions, ...rents, ...propsSection]
}
