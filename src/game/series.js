// Browser-saved, open-ended multi-game series standings.
// A series is the cumulative record of games played by the *same group* of
// player names. Starting a game with a different name set auto-begins a fresh
// series. Standings persist in localStorage across page reloads.

const STORAGE_KEY = 'dhandha.series.v1'

export function rosterKey(players) {
  return players.map(p => p.name).slice().sort().join('|')
}

function emptySeries(key = '') {
  return { rosterKey: key, gamesPlayed: 0, players: {} }
}

export function loadSeries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptySeries()
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || !parsed.players) return emptySeries()
    return parsed
  } catch {
    return emptySeries()
  }
}

export function saveSeries(series) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(series))
  } catch {
    // localStorage unavailable (private mode / quota) — series stays in-memory only.
  }
}

export function resetSeries() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
  return emptySeries()
}

// Fold one finished game's ranked results into the series.
// `ranked` = output of rankAndScore (each item has name, rank, pointsThisGame).
export function recordGame(series, ranked, key) {
  // Different player group → start a fresh series.
  const base = series.rosterKey === key ? series : emptySeries(key)
  const next = {
    rosterKey: key,
    gamesPlayed: base.gamesPlayed + 1,
    players: { ...base.players },
  }

  for (const r of ranked) {
    const prev = next.players[r.name] || {
      totalPoints: 0, gamesPlayed: 0, finishes: {}, wins: 0,
    }
    const finishes = { ...prev.finishes }
    finishes[r.rank] = (finishes[r.rank] || 0) + 1
    next.players[r.name] = {
      totalPoints: Math.round((prev.totalPoints + r.pointsThisGame) * 10) / 10,
      gamesPlayed: prev.gamesPlayed + 1,
      finishes,
      wins: prev.wins + (r.rank === 1 ? 1 : 0),
    }
  }
  return next
}

// Sorted standings: total points desc, then most 1st-place finishes,
// then 2nd, 3rd, … (the series-level tiebreakers).
export function getStandings(series) {
  const rows = Object.entries(series.players).map(([name, s]) => ({ name, ...s }))
  rows.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints
    const maxRank = 6
    for (let rank = 1; rank <= maxRank; rank++) {
      const fa = a.finishes[rank] || 0
      const fb = b.finishes[rank] || 0
      if (fb !== fa) return fb - fa
    }
    return 0
  })
  return rows
}
