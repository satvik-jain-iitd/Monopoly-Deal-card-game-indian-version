import { countCompleteSets, getPlayerBankTotal } from './gameLogic'

// ── Snapshot ────────────────────────────────────────────────────────
// Freeze a single player's standing at the moment the game ends.
export function buildSnapshot(player) {
  const propertyCardsOnTable = Object.values(player.properties || {})
    .reduce((sum, cards) => sum + cards.length, 0)
  return {
    name: player.name,
    completedSets: countCompleteSets(player),
    propertyCardsOnTable,
    bankCash: getPlayerBankTotal(player),
    handCards: (player.hand || []).length,
  }
}

// ── Points table ────────────────────────────────────────────────────
// n = player count. 1st place is worth n+1; every lower position p is
// worth n+1-p. Reproduces the spec tables exactly and generalises to 5–6:
//   2p [3,1]  3p [4,2,1]  4p [5,3,2,1]  5p [6,4,3,2,1]  6p [7,5,4,3,2,1]
export function pointsForPosition(pos, n) {
  return pos === 1 ? n + 1 : n + 1 - pos
}

// Strict tiebreaker comparator (all descending):
//   sets → property cards on table → bank cash → cards in hand
function compareSnapshots(a, b) {
  return (
    b.completedSets - a.completedSets ||
    b.propertyCardsOnTable - a.propertyCardsOnTable ||
    b.bankCash - a.bankCash ||
    b.handCards - a.handCards
  )
}

const round1 = (x) => Math.round(x * 10) / 10

// ── Rank + score ────────────────────────────────────────────────────
// Returns snapshots sorted best→worst, each with `rank` and `pointsThisGame`.
// Players identical on all four criteria share a rank and split the summed
// points of the positions they occupy (rounded to 1 decimal; never dropped).
export function rankAndScore(players) {
  const n = players.length
  const sorted = players.map(buildSnapshot).sort(compareSnapshots)

  const result = []
  let i = 0
  while (i < sorted.length) {
    // Gather a tie-group of completely-equal snapshots starting at i.
    let j = i + 1
    while (j < sorted.length && compareSnapshots(sorted[i], sorted[j]) === 0) j++

    const groupSize = j - i
    const rank = i + 1 // 1-based position of the top of the group
    // Positions occupied are (i+1 .. j); sum their base points and split.
    let pointsSum = 0
    for (let pos = i + 1; pos <= j; pos++) pointsSum += pointsForPosition(pos, n)
    const pointsEach = round1(pointsSum / groupSize)

    for (let k = i; k < j; k++) {
      result.push({ ...sorted[k], rank, pointsThisGame: pointsEach })
    }
    i = j
  }
  return result
}

// ── Tiebreaker label ────────────────────────────────────────────────
// Short human reason `higher` finished above `lower` — for UI clarity.
// Returns null if they were completely tied.
export function tiebreakerLabel(higher, lower) {
  const setD = higher.completedSets - lower.completedSets
  if (setD > 0) return `${setD} extra set${setD > 1 ? 's' : ''}`
  const propD = higher.propertyCardsOnTable - lower.propertyCardsOnTable
  if (propD > 0) return `${propD} more propert${propD > 1 ? 'ies' : 'y'} on table`
  const cashD = higher.bankCash - lower.bankCash
  if (cashD > 0) return `₹${cashD}Cr more in bank`
  const handD = higher.handCards - lower.handCards
  if (handD > 0) return `${handD} more card${handD > 1 ? 's' : ''} in hand`
  return null
}
