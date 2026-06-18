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

// Official Monopoly Deal colour palette — retained exactly
export const COLOR_DISPLAY = {
  brown:     { name: 'Brown',      hex: '#955436', light: '#C4845A' },
  lightBlue: { name: 'Light Blue', hex: '#55C3F0', light: '#9ADDF7' },
  pink:      { name: 'Pink',       hex: '#D93A96', light: '#F07DC3' },
  orange:    { name: 'Orange',     hex: '#F7941D', light: '#FAB96A' },
  red:       { name: 'Red',        hex: '#ED1C24', light: '#F56D72' },
  yellow:    { name: 'Yellow',     hex: '#FEF200', light: '#FEF880' },
  green:     { name: 'Green',      hex: '#1FB25A', light: '#6FCE96' },
  darkBlue:  { name: 'Dark Blue',  hex: '#003F9E', light: '#4A7ECC' },
  railroad:  { name: 'Station',    hex: '#2C2C2C', light: '#555555' },
  utility:   { name: 'Utility',    hex: '#00796B', light: '#4DB6AC' },
  wild:      { name: 'Wild',       hex: '#9B59B6', light: '#C39BD3' },
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
  // Custom cards (opt-in via "Enable Custom Cards") — fill the 2 blank slots
  INSURANCE: 'insurance',
  SABOTAGE: 'sabotage',
}

let _cardId = 1
const id = () => `c${_cardId++}`

function makeProp(color, name, value, landmark) {
  return { id: id(), type: CARD_TYPES.PROPERTY, color, name, value, landmark }
}
function makeWild(colors, value) {
  return { id: id(), type: CARD_TYPES.WILD_PROPERTY, colors, color: colors[0], value, name: `Wild: ${colors.map(c => COLOR_DISPLAY[c]?.name).join('/')}` }
}
function makeMoney(amount) {
  return { id: id(), type: CARD_TYPES.MONEY, value: amount, name: `₹${amount} Cr` }
}
function makeAction(actionType, value, name) {
  return { id: id(), type: CARD_TYPES.ACTION, actionType, value, name }
}
function makeRent(colors, value, wild = false) {
  const name = wild ? 'Wild Rent' : `Rent: ${colors.map(c => COLOR_DISPLAY[c]?.name).join('/')}`
  return { id: id(), type: CARD_TYPES.RENT, colors, value, wild, name }
}

export function createDeck(customCards = false, playerCount = 2) {
  const cards = [
    // --- PROPERTIES (Indian Cities — cheap → premium) ---

    // 🟤 BROWN — Tier-3 on-the-rise (₹1Cr)
    makeProp(COLORS.BROWN,      'Indore',          1, 'indore'),
    makeProp(COLORS.BROWN,      'Lucknow',         1, 'lucknow'),

    // 🔵 LIGHT BLUE — Tier-2 livable (₹1Cr)
    makeProp(COLORS.LIGHT_BLUE, 'Chandigarh',      1, 'chandigarh'),
    makeProp(COLORS.LIGHT_BLUE, 'Bhopal',          1, 'bhopal'),
    makeProp(COLORS.LIGHT_BLUE, 'Kochi',           1, 'kochi'),

    // 🟣 PINK — Cultural metros (₹2Cr)
    makeProp(COLORS.PINK,       'Jaipur',          2, 'jaipur'),
    makeProp(COLORS.PINK,       'Ahmedabad',       2, 'ahmedabad'),
    makeProp(COLORS.PINK,       'Kolkata',         2, 'kolkata'),

    // 🟠 ORANGE — Established metros (₹2Cr)
    makeProp(COLORS.ORANGE,     'Chennai',         2, 'chennai'),
    makeProp(COLORS.ORANGE,     'Hyderabad',       2, 'hyderabad'),
    makeProp(COLORS.ORANGE,     'Noida',           2, 'noida'),

    // 🔴 RED — Major IT hubs (₹3Cr)
    makeProp(COLORS.RED,        'Pune',            3, 'pune'),
    makeProp(COLORS.RED,        'Bengaluru',       3, 'bengaluru'),
    makeProp(COLORS.RED,        'Gurugram',        3, 'gurugram'),

    // 🟡 YELLOW — Aspirational lifestyle (₹3Cr)
    makeProp(COLORS.YELLOW,     'Goa',             3, 'goa'),
    makeProp(COLORS.YELLOW,     'Coimbatore',      3, 'coimbatore'),
    makeProp(COLORS.YELLOW,     'Vizag',           3, 'vizag'),

    // 🟢 GREEN — Top-tier metros (₹4Cr)
    makeProp(COLORS.GREEN,      'New Delhi',       4, 'newdelhi'),
    makeProp(COLORS.GREEN,      'Navi Mumbai',     4, 'navimumbai'),
    makeProp(COLORS.GREEN,      'Thane',           4, 'thane'),

    // 🔵 DARK BLUE — Ultra-premium (₹4Cr)
    makeProp(COLORS.DARK_BLUE,  'South Mumbai',    4, 'southmumbai'),
    makeProp(COLORS.DARK_BLUE,  'Lutyens Delhi',   4, 'lutyensdelhi'),

    // 🚂 RAILROAD / STATIONS (₹2Cr)
    makeProp(COLORS.RAILROAD,   'Mumbai Local',    2, 'mumbailocal'),
    makeProp(COLORS.RAILROAD,   'Delhi Metro',     2, 'delhimetro'),
    makeProp(COLORS.RAILROAD,   'Namma Metro',     2, 'nammametro'),
    makeProp(COLORS.RAILROAD,   'Howrah Express',  2, 'howrahexpress'),

    // 💡 UTILITIES (₹2Cr)
    makeProp(COLORS.UTILITY,    'Power Grid',      2, 'powergrid'),
    makeProp(COLORS.UTILITY,    'Water Works',     2, 'waterworks'),

    // --- WILD PROPERTIES ---
    makeWild([COLORS.WILD], 0),
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

    makeAction(ACTION_TYPES.BIRTHDAY, 2, "Mera Birthday!"),
    makeAction(ACTION_TYPES.BIRTHDAY, 2, "Mera Birthday!"),
    makeAction(ACTION_TYPES.BIRTHDAY, 2, "Mera Birthday!"),

    makeAction(ACTION_TYPES.JUST_SAY_NO, 4, 'Nahi!'),
    makeAction(ACTION_TYPES.JUST_SAY_NO, 4, 'Nahi!'),
    makeAction(ACTION_TYPES.JUST_SAY_NO, 4, 'Nahi!'),

    makeAction(ACTION_TYPES.DOUBLE_RENT, 1, 'Double Rent!'),
    makeAction(ACTION_TYPES.DOUBLE_RENT, 1, 'Double Rent!'),

    makeAction(ACTION_TYPES.HOUSE, 3, 'Ghar'),
    makeAction(ACTION_TYPES.HOUSE, 3, 'Ghar'),
    makeAction(ACTION_TYPES.HOUSE, 3, 'Ghar'),

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

  // Custom cards — only in 3+ player games.
  if (customCards && playerCount > 2) {
    cards.push(
      makeAction(ACTION_TYPES.INSURANCE, 2, 'Insurance'),
      makeAction(ACTION_TYPES.INSURANCE, 2, 'Insurance'),
      makeAction(ACTION_TYPES.SABOTAGE, 1, 'Sabotage'),
      makeAction(ACTION_TYPES.SABOTAGE, 1, 'Sabotage'),
    )
  }

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
