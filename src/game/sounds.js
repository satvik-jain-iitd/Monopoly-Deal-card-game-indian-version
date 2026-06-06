// Synthesized sound effects + device haptics for Dhandha.
// All audio is generated via Web Audio API — no files, no network requests.
// Sounds are intentionally short (< 300ms) and low-volume.

let _ctx = null

function getCtx() {
  if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)()
  if (_ctx.state === 'suspended') _ctx.resume()
  return _ctx
}

function tone(freq, dur, type = 'sine', vol = 0.22, delay = 0) {
  const ac = getCtx()
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.connect(gain)
  gain.connect(ac.destination)
  osc.type = type
  osc.frequency.setValueAtTime(freq, ac.currentTime + delay)
  gain.gain.setValueAtTime(vol, ac.currentTime + delay)
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + delay + dur)
  osc.start(ac.currentTime + delay)
  osc.stop(ac.currentTime + delay + dur)
}

function sweep(freqStart, freqEnd, dur, type = 'sine', vol = 0.2) {
  const ac = getCtx()
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.connect(gain)
  gain.connect(ac.destination)
  osc.type = type
  osc.frequency.setValueAtTime(freqStart, ac.currentTime)
  osc.frequency.exponentialRampToValueAtTime(freqEnd, ac.currentTime + dur)
  gain.gain.setValueAtTime(vol, ac.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur)
  osc.start()
  osc.stop(ac.currentTime + dur)
}

function vibe(pattern) {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(pattern)
  }
}

function safe(fn) {
  try { fn() } catch (_) {}
}

export const sounds = {
  // Card moved to hand / property / discard
  cardPlay() {
    safe(() => {
      tone(280, 0.06, 'triangle', 0.18)
      tone(560, 0.04, 'square', 0.04)
      vibe(25)
    })
  },

  // Money card banked
  bankDrop() {
    safe(() => {
      sweep(920, 460, 0.16, 'sine', 0.22)
      vibe(20)
    })
  },

  // Draw cards at turn start
  draw() {
    safe(() => {
      tone(220, 0.07, 'triangle', 0.12)
      tone(260, 0.07, 'triangle', 0.10, 0.055)
      vibe(18)
    })
  },

  // Rent demanded
  rent() {
    safe(() => {
      tone(500, 0.11, 'sawtooth', 0.14)
      tone(680, 0.11, 'sawtooth', 0.12, 0.09)
      tone(860, 0.14, 'sawtooth', 0.14, 0.18)
      vibe([35, 25, 55])
    })
  },

  // Deal Breaker — dramatic
  dealBreaker() {
    safe(() => {
      tone(600, 0.17, 'sawtooth', 0.18)
      tone(460, 0.17, 'sawtooth', 0.18, 0.12)
      tone(300, 0.22, 'sawtooth', 0.20, 0.24)
      vibe([70, 35, 110])
    })
  },

  // Sly Deal / Forced Deal steal
  steal() {
    safe(() => {
      sweep(700, 260, 0.14, 'sine', 0.18)
      vibe([18, 18, 36])
    })
  },

  // Say No! blocked
  block() {
    safe(() => {
      tone(140, 0.18, 'square', 0.20)
      vibe([45, 25, 45])
    })
  },

  // Win
  win() {
    safe(() => {
      const notes = [523, 659, 784, 1047]
      notes.forEach((f, i) => tone(f, 0.28, 'sine', 0.28, i * 0.11))
      vibe([80, 40, 80, 40, 160])
    })
  },

  // Turn ended / pass device
  turnEnd() {
    safe(() => {
      tone(440, 0.09, 'sine', 0.14)
      vibe(14)
    })
  },

  // Payment sent (paying rent/birthday/debt)
  paymentSent() {
    safe(() => {
      tone(380, 0.07, 'triangle', 0.14)
      sweep(380, 220, 0.10, 'sine', 0.10)
      vibe(22)
    })
  },
}

// Map reducer action types → sound names.
// PLAY_ACTION is special: needs the card's actionType from state.
export const ACTION_SOUND_MAP = {
  START_TURN:        'draw',
  PLAY_AS_MONEY:     'bankDrop',
  PLAY_PROPERTY:     'cardPlay',
  PLAY_RENT:         'rent',
  END_TURN:          'turnEnd',
  DISCARD_CARD:      'cardPlay',
  SAY_NO:            'block',
  DEAL_BREAKER_STEAL:'dealBreaker',
  SLY_DEAL_STEAL:    'steal',
  FORCED_DEAL_SWAP:  'steal',
  TRADE_ROUTE_SWAP:  'cardPlay',
  PAY_DEBT:          'paymentSent',
}

// Action-card → sound for PLAY_ACTION dispatch.
// Keys match the string values of ACTION_TYPES (camelCase) from constants.js.
export const ACTION_TYPE_SOUND = {
  dealBreaker:    'dealBreaker',
  slyDeal:        'steal',
  forcedDeal:     'steal',
  debtCollector:  'rent',
  birthday:       'rent',
  doubleRent:     'cardPlay',
  passGo:         'draw',
  justSayNo:      'block',
  house:          'cardPlay',
  hotel:          'cardPlay',
  insurance:      'cardPlay',
  tradeRoute:     'cardPlay',
}
