import { describe, it, expect, beforeEach, vi } from 'vitest'
import { saveGame, loadGame, deleteGame } from '../persistence'

const STORAGE_KEY = 'dhandha.game.v1'
const VALID_STATE = {
  gameId: 1,
  players: [
    { name: 'Aman', hand: [], money: [], property: [], fullSets: [] },
    { name: 'Sanika', hand: [], money: [], property: [], fullSets: [] },
  ],
  phase: 'action',
  deck: [],
  discardPile: [],
  currentPlayerIndex: 0,
  turnPhase: 'playCards',
  passGoDrawnIds: ['card-1', 'card-2'],
  logs: [],
}

const mem = {}

beforeEach(() => {
  Object.keys(mem).forEach(k => delete mem[k])
  vi.stubGlobal('localStorage', {
    getItem: vi.fn((k) => mem[k] ?? null),
    setItem: vi.fn((k, v) => { mem[k] = String(v) }),
    removeItem: vi.fn((k) => { delete mem[k] }),
    clear: vi.fn(() => { Object.keys(mem).forEach(k => delete mem[k]) }),
    get length() { return Object.keys(mem).length },
  })
})

function makeSavedPayload(overrides) {
  return {
    version: 1,
    savedAt: Date.now(),
    state: { ...VALID_STATE, passGoDrawnIds: null },
    ...overrides,
  }
}

function seedStorage(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

describe('saveGame', () => {
  it('saves to localStorage and allows roundtrip', () => {
    saveGame(VALID_STATE)
    const loaded = loadGame()
    expect(loaded).not.toBeNull()
    expect(loaded.gameId).toBe(1)
    expect(loaded.players).toHaveLength(2)
    expect(loaded.phase).toBe('action')
  })

  it('does NOT save when phase is gameOver', () => {
    saveGame({ ...VALID_STATE, phase: 'gameOver' })
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('strips passGoDrawnIds from saved state', () => {
    saveGame(VALID_STATE)
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY))
    expect(raw.state.passGoDrawnIds).toBeNull()
  })

  it('silently handles localStorage quota/private mode errors', () => {
    const orig = localStorage.setItem
    localStorage.setItem = vi.fn(() => { throw new Error('QuotaExceeded') })
    expect(() => saveGame(VALID_STATE)).not.toThrow()
    localStorage.setItem = orig
  })
})

describe('loadGame', () => {
  it('returns null when no saved game exists', () => {
    expect(loadGame()).toBeNull()
  })

  it('rejects stale game (savedAt 25h ago)', () => {
    const oldTime = Date.now() - 25 * 3600000
    seedStorage(makeSavedPayload({ savedAt: oldTime }))
    expect(loadGame()).toBeNull()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('rejects gameOver state', () => {
    seedStorage(makeSavedPayload({
      state: { ...VALID_STATE, phase: 'gameOver' },
    }))
    expect(loadGame()).toBeNull()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('rejects wrong version', () => {
    seedStorage(makeSavedPayload({ version: 999 }))
    expect(loadGame()).toBeNull()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('handles corrupted JSON gracefully', () => {
    localStorage.setItem(STORAGE_KEY, 'not-a-valid-json')
    expect(loadGame()).toBeNull()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('rejects invalid schema (missing players)', () => {
    seedStorage(makeSavedPayload({
      state: { ...VALID_STATE, players: undefined },
    }))
    expect(loadGame()).toBeNull()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })
})

describe('deleteGame', () => {
  it('removes saved game from localStorage', () => {
    seedStorage(makeSavedPayload())
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull()
    deleteGame()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('does not throw when nothing saved', () => {
    expect(() => deleteGame()).not.toThrow()
  })
})

describe('multiplayer roundtrip', () => {
  it('survives roundtrip with 6 players and full state', () => {
    const bigState = {
      gameId: 42,
      players: [
        { name: 'A', hand: [], money: [], property: [], fullSets: [] },
        { name: 'B', hand: [], money: [], property: [], fullSets: [] },
        { name: 'C', hand: [], money: [], property: [], fullSets: [] },
        { name: 'D', hand: [], money: [], property: [], fullSets: [] },
        { name: 'E', hand: [], money: [], property: [], fullSets: [] },
        { name: 'F', hand: [], money: [], property: [], fullSets: [] },
      ],
      phase: 'action',
      deck: Array.from({ length: 50 }, (_, i) => ({ id: `card-${i}`, type: 'property' })),
      discardPile: [],
      currentPlayerIndex: 3,
      turnPhase: 'playCards',
      passGoDrawnIds: ['card-1'],
      logs: [{ turn: 1, action: 'played rent' }],
    }
    saveGame(bigState)
    const loaded = loadGame()
    expect(loaded).not.toBeNull()
    expect(loaded.gameId).toBe(42)
    expect(loaded.players).toHaveLength(6)
    expect(loaded.currentPlayerIndex).toBe(3)
    expect(loaded.deck).toHaveLength(50)
    expect(loaded.passGoDrawnIds).toBeNull()
  })
})
