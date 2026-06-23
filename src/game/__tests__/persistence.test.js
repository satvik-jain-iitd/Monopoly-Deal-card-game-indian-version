import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  saveSession, loadSession, deleteSession,
  listSessions, migrateOldSave,
} from '../persistence'

const INDEX_KEY = 'dhandha.session.index'
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

describe('saveSession', () => {
  it('saves to id-keyed storage and updates index', () => {
    saveSession(VALID_STATE)
    const key = `dhandha.session.${VALID_STATE.gameId}`
    const raw = JSON.parse(localStorage.getItem(key))
    expect(raw).not.toBeNull()
    expect(raw.passGoDrawnIds).toBeNull()

    const index = JSON.parse(localStorage.getItem(INDEX_KEY))
    expect(index).toHaveLength(1)
    expect(index[0].id).toBe(1)
  })

  it('does NOT save when phase is gameOver', () => {
    saveSession({ ...VALID_STATE, phase: 'gameOver' })
    expect(localStorage.getItem(INDEX_KEY)).toBeNull()
  })

  it('does NOT save when gameState is null', () => {
    saveSession(null)
    expect(localStorage.getItem(INDEX_KEY)).toBeNull()
  })

  it('does NOT save when gameId is null', () => {
    saveSession({ ...VALID_STATE, gameId: null })
    expect(localStorage.getItem(INDEX_KEY)).toBeNull()
  })

  it('updates existing session entry on re-save', () => {
    saveSession(VALID_STATE)
    const updated = { ...VALID_STATE, phase: 'discard' }
    saveSession(updated)
    const index = JSON.parse(localStorage.getItem(INDEX_KEY))
    expect(index).toHaveLength(1)
    expect(index[0].phase).toBe('discard')
  })

  it('caps at MAX_SESSIONS = 5', () => {
    for (let i = 1; i <= 7; i++) {
      saveSession({ ...VALID_STATE, gameId: i })
    }
    const index = JSON.parse(localStorage.getItem(INDEX_KEY))
    expect(index).toHaveLength(5)
    // Only sessions 3..7 should remain (newest sorted by id)
    for (let i = 1; i <= 2; i++) {
      expect(localStorage.getItem(`dhandha.session.${i}`)).toBeNull()
    }
  })

  it('silently handles localStorage errors', () => {
    localStorage.setItem = vi.fn(() => { throw new Error('QuotaExceeded') })
    expect(() => saveSession(VALID_STATE)).not.toThrow()
  })
})

describe('loadSession', () => {
  it('loads a previously saved session', () => {
    saveSession(VALID_STATE)
    const loaded = loadSession(VALID_STATE.gameId)
    expect(loaded).not.toBeNull()
    expect(loaded.gameId).toBe(1)
    expect(loaded.players).toHaveLength(2)
  })

  it('returns null for non-existent session', () => {
    expect(loadSession(999)).toBeNull()
  })

  it('rejects invalid state (missing players)', () => {
    const key = `dhandha.session.1`
    localStorage.setItem(key, JSON.stringify({ gameId: 1, phase: 'action' }))
    expect(loadSession(1)).toBeNull()
  })

  it('handles corrupted JSON gracefully', () => {
    localStorage.setItem('dhandha.session.1', 'not-json')
    expect(loadSession(1)).toBeNull()
  })
})

describe('deleteSession', () => {
  it('removes session data and index entry', () => {
    saveSession(VALID_STATE)
    const key = `dhandha.session.${VALID_STATE.gameId}`
    expect(localStorage.getItem(key)).not.toBeNull()

    deleteSession(VALID_STATE.gameId)
    expect(localStorage.getItem(key)).toBeNull()
    const index = JSON.parse(localStorage.getItem(INDEX_KEY))
    expect(index).toHaveLength(0)
  })

  it('does not throw when session does not exist', () => {
    expect(() => deleteSession(999)).not.toThrow()
  })
})

describe('listSessions', () => {
  it('returns empty array when no sessions exist', () => {
    expect(listSessions()).toEqual([])
  })

  it('returns index entries for all saved sessions', () => {
    saveSession({ ...VALID_STATE, gameId: 1 })
    saveSession({ ...VALID_STATE, gameId: 2, players: [{ name: 'X', hand: [] }, { name: 'Y', hand: [] }] })

    const list = listSessions()
    expect(list).toHaveLength(2)
    expect(list.find(s => s.id === 1).playerNames).toEqual(['Aman', 'Sanika'])
    expect(list.find(s => s.id === 2).playerNames).toEqual(['X', 'Y'])
  })

  it('includes currentPlayer and savedAt in entries', () => {
    saveSession(VALID_STATE)
    const list = listSessions()
    expect(list[0].currentPlayer).toBe('Aman')
    expect(list[0].savedAt).toBeGreaterThan(0)
  })
})

describe('migrateOldSave', () => {
  it('migrates old dhandha.game.v1 save to session format', () => {
    const OLD_KEY = 'dhandha.game.v1'
    localStorage.setItem(OLD_KEY, JSON.stringify({
      version: 1,
      savedAt: Date.now(),
      state: { ...VALID_STATE, passGoDrawnIds: null },
    }))

    const result = migrateOldSave()
    expect(result).toBe(true)

    // Old key removed, session created
    expect(localStorage.getItem(OLD_KEY)).toBeNull()
    const loaded = loadSession(VALID_STATE.gameId)
    expect(loaded).not.toBeNull()
    expect(loaded.gameId).toBe(1)

    const list = listSessions()
    expect(list).toHaveLength(1)
  })

  it('returns false and cleans up stale old save', () => {
    const OLD_KEY = 'dhandha.game.v1'
    localStorage.setItem(OLD_KEY, JSON.stringify({
      version: 1,
      savedAt: Date.now() - 25 * 3600000,
      state: { ...VALID_STATE, passGoDrawnIds: null },
    }))

    const result = migrateOldSave()
    expect(result).toBe(false)
    expect(localStorage.getItem(OLD_KEY)).toBeNull()
  })

  it('returns false when no old save exists', () => {
    expect(migrateOldSave()).toBe(false)
  })
})
