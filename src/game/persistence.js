const STORAGE_KEY = 'dhandha.game.v1'
const CURRENT_VERSION = 1
const STALE_MS = 86400000

export function saveGame(gameState) {
  if (gameState.phase === 'gameOver') return
  try {
    const payload = {
      version: CURRENT_VERSION,
      savedAt: Date.now(),
      state: { ...gameState, passGoDrawnIds: null },
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {}
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const payload = JSON.parse(raw)
    if (payload?.version !== CURRENT_VERSION) { deleteGame(); return null }
    if (Date.now() - (payload.savedAt || 0) > STALE_MS) { deleteGame(); return null }
    if (!isValidGame(payload.state)) { deleteGame(); return null }
    if (payload.state.phase === 'gameOver') { deleteGame(); return null }
    return payload.state
  } catch { deleteGame(); return null }
}

export function deleteGame() {
  try { localStorage.removeItem(STORAGE_KEY) } catch {}
}

function isValidGame(obj) {
  return !!(obj && typeof obj === 'object'
    && typeof obj.gameId === 'number'
    && Array.isArray(obj.players) && obj.players.length > 0
    && typeof obj.phase === 'string'
    && obj.players.every(p => typeof p.name === 'string' && Array.isArray(p.hand)))
}
