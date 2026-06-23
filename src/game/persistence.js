const INDEX_KEY = 'dhandha.session.index'
const CURRENT_VERSION = 1
const STALE_MS = 86400000
const MAX_SESSIONS = 5

export function listSessions() {
  try {
    const raw = localStorage.getItem(INDEX_KEY)
    if (!raw) return []
    const index = JSON.parse(raw)
    if (!Array.isArray(index)) return []
    return index
  } catch {
    return []
  }
}

export function saveSession(gameState) {
  if (!gameState || gameState.phase === 'gameOver') return
  try {
    const id = gameState.gameId
    if (id == null) return

    const state = { ...gameState, passGoDrawnIds: null }
    localStorage.setItem(`dhandha.session.${id}`, JSON.stringify(state))

    const entry = {
      id,
      playerNames: gameState.players.map(p => p.name),
      currentPlayer: gameState.players[gameState.currentPlayerIndex]?.name || '',
      savedAt: Date.now(),
      phase: gameState.phase,
    }

    let index = listSessions()
    const existingIdx = index.findIndex(e => e.id === id)
    if (existingIdx >= 0) {
      index[existingIdx] = entry
    } else {
      index.push(entry)
    }
    index.sort((a, b) => b.savedAt - a.savedAt || b.id - a.id)

    while (index.length > MAX_SESSIONS) {
      const removed = index.pop()
      localStorage.removeItem(`dhandha.session.${removed.id}`)
    }

    localStorage.setItem(INDEX_KEY, JSON.stringify(index))
  } catch {}
}

export function loadSession(sessionId) {
  try {
    const raw = localStorage.getItem(`dhandha.session.${sessionId}`)
    if (!raw) return null
    const state = JSON.parse(raw)
    if (!isValidGame(state)) return null
    return state
  } catch {
    return null
  }
}

export function deleteSession(sessionId) {
  try {
    localStorage.removeItem(`dhandha.session.${sessionId}`)
    let index = listSessions()
    const filtered = index.filter(e => e.id !== sessionId)
    if (filtered.length < index.length) {
      localStorage.setItem(INDEX_KEY, JSON.stringify(filtered))
    }
  } catch {}
}

export function migrateOldSave() {
  try {
    const OLD_KEY = 'dhandha.game.v1'
    const raw = localStorage.getItem(OLD_KEY)
    if (!raw) return false

    const payload = JSON.parse(raw)
    if (payload?.version !== CURRENT_VERSION) { localStorage.removeItem(OLD_KEY); return false }
    if (Date.now() - (payload.savedAt || 0) > STALE_MS) { localStorage.removeItem(OLD_KEY); return false }
    if (payload.state?.phase === 'gameOver') { localStorage.removeItem(OLD_KEY); return false }
    if (!isValidGame(payload.state)) { localStorage.removeItem(OLD_KEY); return false }

    saveSession(payload.state)
    localStorage.removeItem(OLD_KEY)
    return true
  } catch {
    try { localStorage.removeItem('dhandha.game.v1') } catch {}
    return false
  }
}

function isValidGame(obj) {
  return !!(obj && typeof obj === 'object'
    && typeof obj.gameId === 'number'
    && Array.isArray(obj.players) && obj.players.length > 0
    && typeof obj.phase === 'string'
    && obj.players.every(p => typeof p.name === 'string' && Array.isArray(p.hand)))
}
