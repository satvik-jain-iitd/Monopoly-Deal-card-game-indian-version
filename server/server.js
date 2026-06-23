import { WebSocketServer } from 'ws'
import { createServer } from 'http'
import { randomUUID } from 'crypto'

const PORT = parseInt(process.env.PORT, 10) || 3001

// ── IN-MEMORY STATE ──────────────────────────────────────
const rooms = new Map()       // roomCode → RoomState
const wsToPlayer = new Map()  // WebSocket → { roomCode, name, index }

class RoomState {
  constructor(roomCode, password = null) {
    this.roomCode = roomCode
    this.password = password || null
    this.players = []          // [{ name, isHost, index, ready }]
    this.gameState = null      // latest GAME_STATE blob
    this.gameActive = false    // false = lobby mode
    this.createdAt = Date.now()
    this.lastActivity = Date.now()
    this.cleanupTimer = null
    this.turnTimer = null
    this.wsMap = new Map()     // name → WebSocket
  }

  get connectedPlayers() {
    return this.players.filter(p => this.wsMap.has(p.name))
  }

  get connectedNames() {
    return [...this.wsMap.keys()]
  }

  get hostName() {
    const connected = this.connectedPlayers
    return connected.length > 0 ? connected[0].name : null
  }

  electNewHost() {
    const connected = this.connectedPlayers
    if (connected.length === 0) return null
    const next = connected[0]
    this.players.forEach(p => p.isHost = (p.name === next.name))
    return next.name
  }

  playerJoin(name, ws) {
    if (this.wsMap.has(name)) {
      const oldWs = this.wsMap.get(name)
      wsToPlayer.delete(oldWs)
      this.wsMap.delete(name)
      oldWs.close(4000, 'Replaced by new connection')
    }
    if (!this.players.find(p => p.name === name)) {
      const isHost = this.players.length === 0
      this.players.push({ name, isHost, index: this.players.length, ready: false })
    }
    this.wsMap.set(name, ws)
    wsToPlayer.set(ws, { roomCode: this.roomCode, name })
    this.lastActivity = Date.now()
    this.cancelCleanup()
  }

  playerLeave(name) {
    this.wsMap.delete(name)
    wsToPlayer.delete([...wsToPlayer.entries()].find(([, v]) => v.name === name)?.[0])
    const stillConnected = this.connectedPlayers
    if (stillConnected.length === 0) {
      this.scheduleCleanup(2 * 60 * 60 * 1000) // 2hr for active, 10min if completed
    }
  }

  broadcast(msg, excludeWs = null) {
    const data = JSON.stringify(msg)
    for (const [name, ws] of this.wsMap) {
      if (ws !== excludeWs && ws.readyState === 1) ws.send(data)
    }
  }

  sendTo(ws, msg) {
    if (ws && ws.readyState === 1) ws.send(JSON.stringify(msg))
  }

  scheduleCleanup(delay) {
    this.cancelCleanup()
    this.cleanupTimer = setTimeout(() => {
      rooms.delete(this.roomCode)
    }, delay)
  }

  cancelCleanup() {
    if (this.cleanupTimer) { clearTimeout(this.cleanupTimer); this.cleanupTimer = null }
  }

  startTurnTimer() {
    this.cancelTurnTimer()
    if (!this.gameState || this.gameState.phase === 'GAME_OVER') return
    this.turnTimer = setTimeout(() => {
      const currentIdx = this.gameState.currentPlayerIndex
      const currentName = this.gameState.players[currentIdx]?.name
      if (currentName && this.wsMap.has(currentName)) return
      const nextIdx = (currentIdx + 1) % this.gameState.players.length
      this.gameState.currentPlayerIndex = nextIdx
      this.broadcast({ type: 'GAME_STATE', state: this.gameState })
      this.startTurnTimer()
    }, this.turnTimeout || 60000)
  }

  cancelTurnTimer() {
    if (this.turnTimer) { clearTimeout(this.turnTimer); this.turnTimer = null }
  }
}

// ── WEBSOCKET SERVER ─────────────────────────────────────
const server = createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ status: 'ok', rooms: rooms.size, uptime: process.uptime() }))
    return
  }
  res.writeHead(404)
  res.end()
})

const wss = new WebSocketServer({ server })
server.listen(PORT, () => {
  console.log(`Dhandha game server running on port ${PORT}`)
})

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, 'http://localhost')
  const roomCode = url.pathname.replace(/^\//, '').toUpperCase() || url.searchParams.get('room')?.toUpperCase()
  if (!roomCode) { ws.close(4000, 'Room code required'); return }

  const password = url.searchParams.get('password') || ''
  let room = rooms.get(roomCode)

  if (!room) {
    room = new RoomState(roomCode, password)
    rooms.set(roomCode, room)
  } else if (room.password && room.password !== password) {
    ws.close(4001, 'Wrong password')
    return
  }

  ws.on('message', (raw) => {
    let msg
    try { msg = JSON.parse(raw.toString()) } catch { return }

    switch (msg.type) {
      case 'HELLO': {
        const name = msg.name?.trim()
        if (!name) { room.sendTo(ws, { type: 'ERROR', message: 'Name required' }); return }

        room.playerJoin(name, ws)
        room.broadcast({ type: 'HELLO', name })
        room.broadcast({ type: 'ROSTER', players: room.players })
        room.broadcast({ type: 'CONNECTION_STATUS', names: room.connectedNames })
        break
      }

      case 'RECONNECT': {
        const name = msg.name?.trim()
        if (!name || !room.players.find(p => p.name === name)) {
          room.sendTo(ws, { type: 'RECONNECT_REJECTED', message: 'Player not found' })
          return
        }
        room.playerJoin(name, ws)
        room.broadcast({ type: 'CONNECTION_STATUS', names: room.connectedNames })

        if (room.gameState) {
          const isHost = room.hostName === name
          room.sendTo(ws, { type: 'GAME_STATE_RESPONSE', state: room.gameState, players: room.players, hostName: room.hostName, isHost })
          room.broadcast({ type: 'ROSTER', players: room.players })
        } else {
          room.sendTo(ws, { type: 'LOBBY_STATE', players: room.players, hostName: room.hostName })
          room.broadcast({ type: 'ROSTER', players: room.players })
        }
        break
      }

      case 'ROSTER': {
        room.broadcast({ type: 'ROSTER', players: room.players }, ws)
        break
      }

      case 'READY': {
        const player = room.players.find(p => p.name === msg.name)
        if (player) player.ready = !player.ready
        room.broadcast({ type: 'READY', readyPlayers: room.players.filter(p => p.ready).map(p => p.name) })
        break
      }

      case 'GAME_STATE': {
        const gsSender = wsToPlayer.get(ws)
        if (!gsSender || gsSender.name !== room.hostName) {
          room.sendTo(ws, { type: 'ERROR', message: 'Sirf host game state bhej sakta hai' })
          break
        }
        const timeout = msg.state.phase === 'draw' ? 30000
          : msg.state.phase === 'play' ? 90000
          : msg.state.phase === 'discard' ? 90000
          : undefined
        if (timeout) {
          msg.state.turnTimeout = timeout
          msg.state.turnStartedAt = Date.now()
          room.turnTimeout = timeout
        }
        room.gameState = msg.state
        room.gameActive = true
        room.lastActivity = Date.now()
        room.broadcast({ type: 'GAME_STATE', state: msg.state }, ws)
        if (msg.state.phase === 'GAME_OVER') {
          room.cancelTurnTimer()
          room.scheduleCleanup(10 * 60 * 1000)
        } else {
          room.startTurnTimer()
        }
        break
      }

      case 'GAME_ACTION': {
        const gaSender = wsToPlayer.get(ws)
        if (!gaSender || gaSender.name !== room.hostName) {
          room.sendTo(ws, { type: 'ERROR', message: 'Sirf host game action bhej sakta hai' })
          break
        }
        room.broadcast({ type: 'GAME_ACTION', action: msg.action }, ws)
        break
      }

      case 'ROOM_INFO': {
        room.sendTo(ws, { type: 'ROOM_INFO', players: room.players, hostName: room.hostName, gameActive: room.gameActive })
        break
      }
    }
  })

  ws.on('close', () => {
    const info = wsToPlayer.get(ws)
    if (!info) return

    const { name } = info
    wsToPlayer.delete(ws)
    room.wsMap.delete(name)
    room.broadcast({ type: 'CONNECTION_STATUS', names: room.connectedNames })

    const wasHost = room.hostName === name
    if (room.gameActive && wasHost) {
      const newHost = room.electNewHost()
      if (newHost) {
        room.broadcast({ type: 'HOST_CHANGED', hostName: newHost })
        room.broadcast({ type: 'ROSTER', players: room.players })
      }
    }

    room.broadcast({ type: 'PLAYER_LEFT', name })

    if (room.connectedPlayers.length === 0) {
      room.scheduleCleanup(2 * 60 * 60 * 1000)
    }
  })

  // Send initial room info
  room.sendTo(ws, { type: 'ROOM_INFO', players: room.players, hostName: room.hostName, gameActive: room.gameActive })
})

process.on('SIGTERM', () => {
  console.log('Shutting down...')
  wss.close(() => process.exit(0))
})
