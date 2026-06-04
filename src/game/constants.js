export const COLORS = {
  BROWN: 'brown',
  LIGHT_BLUE: 'lightBlue',
  PINK: 'pink',
  ORANGE: 'orange',
  RED: 'red',
  YELLOW: 'yellow',
  GREEN: 'green',
  DARK_BLUE: 'darkBlue',
  RAILROAD: 'railroad',
  UTILITY: 'utility',
  WILD: 'wild',
}

export const COLOR_DISPLAY = {
  brown: { name: 'Brown', hex: '#8B4513', light: '#D2691E' },
  lightBlue: { name: 'Light Blue', hex: '#87CEEB', light: '#ADD8E6' },
  pink: { name: 'Pink', hex: '#FF69B4', light: '#FFB6C1' },
  orange: { name: 'Orange', hex: '#FF8C00', light: '#FFA500' },
  red: { name: 'Red', hex: '#DC143C', light: '#FF6B6B' },
  yellow: { name: 'Yellow', hex: '#FFD700', light: '#FFEC8B' },
  green: { name: 'Green', hex: '#228B22', light: '#90EE90' },
  darkBlue: { name: 'Dark Blue', hex: '#00008B', light: '#4169E1' },
  railroad: { name: 'Railroad', hex: '#2C2C2C', light: '#555555' },
  utility: { name: 'Utility', hex: '#708090', light: '#B0C4DE' },
  wild: { name: 'Wild', hex: '#9B59B6', light: '#C39BD3' },
}

// Cards needed per set + rent values
export const PROPERTY_SETS = {
  brown:     { cardsNeeded: 2, rentValues: [1, 2],          houseBonus: 3,  hotelBonus: 4  },
  lightBlue: { cardsNeeded: 3, rentValues: [1, 2, 3],       houseBonus: 4,  hotelBonus: 5  },
  pink:      { cardsNeeded: 3, rentValues: [1, 2, 4],       houseBonus: 4,  hotelBonus: 5  },
  orange:    { cardsNeeded: 3, rentValues: [1, 3, 5],       houseBonus: 4,  hotelBonus: 5  },
  red:       { cardsNeeded: 3, rentValues: [2, 3, 6],       houseBonus: 4,  hotelBonus: 5  },
  yellow:    { cardsNeeded: 3, rentValues: [2, 4, 6],       houseBonus: 4,  hotelBonus: 5  },
  green:     { cardsNeeded: 3, rentValues: [2, 4, 7],       houseBonus: 4,  hotelBonus: 5  },
  darkBlue:  { cardsNeeded: 2, rentValues: [3, 8],          houseBonus: 4,  hotelBonus: 5  },
  railroad:  { cardsNeeded: 4, rentValues: [1, 2, 3, 4],   houseBonus: 0,  hotelBonus: 0  },
  utility:   { cardsNeeded: 2, rentValues: [1, 2],          houseBonus: 0,  hotelBonus: 0  },
}

export const CARD_TYPES = {
  PROPERTY: 'property',
  MONEY: 'money',
  ACTION: 'action',
  RENT: 'rent',
  WILD_PROPERTY: 'wildProperty',
}

export const ACTION_TYPES = {
  DEAL_BREAKER: 'dealBreaker',
  DEBT_COLLECTOR: 'debtCollector',
  FORCED_DEAL: 'forcedDeal',
  SLY_DEAL: 'slyDeal',
  PASS_GO: 'passGo',
  BIRTHDAY: 'birthday',
  JUST_SAY_NO: 'justSayNo',
  DOUBLE_RENT: 'doubleRent',
  HOUSE: 'house',
  HOTEL: 'hotel',
}

let _cardId = 1
const id = () => `c${_cardId++}`

function makeProp(color, name, value) {
  return { id: id(), type: CARD_TYPES.PROPERTY, color, name, value }
}
function makeWild(colors, value) {
  return { id: id(), type: CARD_TYPES.WILD_PROPERTY, colors, color: colors[0], value, name: `Wild: ${colors.map(c => COLOR_DISPLAY[c]?.name).join('/')}` }
}
function makeMoney(amount) {
  return { id: id(), type: CARD_TYPES.MONEY, value: amount, name: `$${amount}M` }
}
function makeAction(actionType, value, name) {
  return { id: id(), type: CARD_TYPES.ACTION, actionType, value, name }
}
function makeRent(colors, value, wild = false) {
  const name = wild ? 'Wild Rent' : `Rent: ${colors.map(c => COLOR_DISPLAY[c]?.name).join('/')}`
  return { id: id(), type: CARD_TYPES.RENT, colors, value, wild, name }
}

export function createDeck() {
  const cards = [
    // --- PROPERTIES ---
    makeProp(COLORS.BROWN, 'Mediterranean Ave', 1),
    makeProp(COLORS.BROWN, 'Baltic Ave', 1),

    makeProp(COLORS.LIGHT_BLUE, 'Oriental Ave', 1),
    makeProp(COLORS.LIGHT_BLUE, 'Vermont Ave', 1),
    makeProp(COLORS.LIGHT_BLUE, 'Connecticut Ave', 1),

    makeProp(COLORS.PINK, 'St. Charles Place', 2),
    makeProp(COLORS.PINK, 'States Ave', 2),
    makeProp(COLORS.PINK, 'Virginia Ave', 2),

    makeProp(COLORS.ORANGE, 'St. James Place', 2),
    makeProp(COLORS.ORANGE, 'Tennessee Ave', 2),
    makeProp(COLORS.ORANGE, 'New York Ave', 2),

    makeProp(COLORS.RED, 'Kentucky Ave', 3),
    makeProp(COLORS.RED, 'Indiana Ave', 3),
    makeProp(COLORS.RED, 'Illinois Ave', 3),

    makeProp(COLORS.YELLOW, 'Atlantic Ave', 3),
    makeProp(COLORS.YELLOW, 'Ventnor Ave', 3),
    makeProp(COLORS.YELLOW, 'Marvin Gardens', 3),

    makeProp(COLORS.GREEN, 'Pacific Ave', 4),
    makeProp(COLORS.GREEN, 'North Carolina Ave', 4),
    makeProp(COLORS.GREEN, 'Pennsylvania Ave', 4),

    makeProp(COLORS.DARK_BLUE, 'Park Place', 4),
    makeProp(COLORS.DARK_BLUE, 'Boardwalk', 4),

    makeProp(COLORS.RAILROAD, 'Reading Railroad', 2),
    makeProp(COLORS.RAILROAD, 'Pennsylvania Railroad', 2),
    makeProp(COLORS.RAILROAD, 'B&O Railroad', 2),
    makeProp(COLORS.RAILROAD, 'Short Line Railroad', 2),

    makeProp(COLORS.UTILITY, 'Electric Company', 2),
    makeProp(COLORS.UTILITY, 'Water Works', 2),

    // --- WILD PROPERTIES ---
    makeWild([COLORS.WILD], 0),   // 2x multi-color wild (any color)
    makeWild([COLORS.WILD], 0),
    makeWild([COLORS.RAILROAD, COLORS.UTILITY], 2),
    makeWild([COLORS.RAILROAD, COLORS.GREEN], 4),
    makeWild([COLORS.RAILROAD, COLORS.LIGHT_BLUE], 4),
    makeWild([COLORS.DARK_BLUE, COLORS.GREEN], 4),
    makeWild([COLORS.PINK, COLORS.ORANGE], 2),
    makeWild([COLORS.RED, COLORS.YELLOW], 3),
    makeWild([COLORS.LIGHT_BLUE, COLORS.BROWN], 1),
    makeWild([COLORS.LIGHT_BLUE, COLORS.RAILROAD], 4),

    // --- MONEY ---
    makeMoney(10),
    makeMoney(5), makeMoney(5),
    makeMoney(4), makeMoney(4), makeMoney(4),
    makeMoney(3), makeMoney(3), makeMoney(3),
    makeMoney(2), makeMoney(2), makeMoney(2), makeMoney(2), makeMoney(2),
    makeMoney(1), makeMoney(1), makeMoney(1), makeMoney(1), makeMoney(1), makeMoney(1),

    // --- ACTION CARDS ---
    makeAction(ACTION_TYPES.DEAL_BREAKER, 5, 'Deal Breaker'),
    makeAction(ACTION_TYPES.DEAL_BREAKER, 5, 'Deal Breaker'),

    makeAction(ACTION_TYPES.DEBT_COLLECTOR, 3, 'Debt Collector'),
    makeAction(ACTION_TYPES.DEBT_COLLECTOR, 3, 'Debt Collector'),
    makeAction(ACTION_TYPES.DEBT_COLLECTOR, 3, 'Debt Collector'),

    makeAction(ACTION_TYPES.FORCED_DEAL, 3, 'Forced Deal'),
    makeAction(ACTION_TYPES.FORCED_DEAL, 3, 'Forced Deal'),
    makeAction(ACTION_TYPES.FORCED_DEAL, 3, 'Forced Deal'),

    makeAction(ACTION_TYPES.SLY_DEAL, 3, 'Sly Deal'),
    makeAction(ACTION_TYPES.SLY_DEAL, 3, 'Sly Deal'),
    makeAction(ACTION_TYPES.SLY_DEAL, 3, 'Sly Deal'),

    makeAction(ACTION_TYPES.PASS_GO, 1, 'Pass Go'),
    makeAction(ACTION_TYPES.PASS_GO, 1, 'Pass Go'),
    makeAction(ACTION_TYPES.PASS_GO, 1, 'Pass Go'),
    makeAction(ACTION_TYPES.PASS_GO, 1, 'Pass Go'),
    makeAction(ACTION_TYPES.PASS_GO, 1, 'Pass Go'),
    makeAction(ACTION_TYPES.PASS_GO, 1, 'Pass Go'),
    makeAction(ACTION_TYPES.PASS_GO, 1, 'Pass Go'),
    makeAction(ACTION_TYPES.PASS_GO, 1, 'Pass Go'),
    makeAction(ACTION_TYPES.PASS_GO, 1, 'Pass Go'),
    makeAction(ACTION_TYPES.PASS_GO, 1, 'Pass Go'),

    makeAction(ACTION_TYPES.BIRTHDAY, 2, "It's My Birthday"),
    makeAction(ACTION_TYPES.BIRTHDAY, 2, "It's My Birthday"),
    makeAction(ACTION_TYPES.BIRTHDAY, 2, "It's My Birthday"),

    makeAction(ACTION_TYPES.JUST_SAY_NO, 4, 'Just Say No'),
    makeAction(ACTION_TYPES.JUST_SAY_NO, 4, 'Just Say No'),
    makeAction(ACTION_TYPES.JUST_SAY_NO, 4, 'Just Say No'),

    makeAction(ACTION_TYPES.DOUBLE_RENT, 1, 'Double The Rent'),
    makeAction(ACTION_TYPES.DOUBLE_RENT, 1, 'Double The Rent'),

    makeAction(ACTION_TYPES.HOUSE, 3, 'House'),
    makeAction(ACTION_TYPES.HOUSE, 3, 'House'),
    makeAction(ACTION_TYPES.HOUSE, 3, 'House'),

    makeAction(ACTION_TYPES.HOTEL, 4, 'Hotel'),
    makeAction(ACTION_TYPES.HOTEL, 4, 'Hotel'),
    makeAction(ACTION_TYPES.HOTEL, 4, 'Hotel'),

    // --- RENT CARDS ---
    makeRent([COLORS.BROWN, COLORS.LIGHT_BLUE], 1),
    makeRent([COLORS.BROWN, COLORS.LIGHT_BLUE], 1),
    makeRent([COLORS.PINK, COLORS.ORANGE], 1),
    makeRent([COLORS.PINK, COLORS.ORANGE], 1),
    makeRent([COLORS.RED, COLORS.YELLOW], 1),
    makeRent([COLORS.RED, COLORS.YELLOW], 1),
    makeRent([COLORS.GREEN, COLORS.DARK_BLUE], 1),
    makeRent([COLORS.GREEN, COLORS.DARK_BLUE], 1),
    makeRent([COLORS.RAILROAD, COLORS.UTILITY], 1),
    makeRent([COLORS.RAILROAD, COLORS.UTILITY], 1),
    makeRent([], 3, true),
    makeRent([], 3, true),
    makeRent([], 3, true),
  ]

  return shuffle(cards)
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
