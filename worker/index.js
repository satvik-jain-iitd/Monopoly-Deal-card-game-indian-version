// Cloudflare Worker -- WebSocket signalling relay for Dhandha multiplayer.
// One RoomDO instance per room code (Hibernatable WebSockets -- the
// runtime tracks attached sockets and survives DO eviction, no storage
// needed for a pure relay).

export class RoomDO {
  constructor(ctx, env) {
    this.ctx = ctx
  }

  async fetch(request) {
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Dhandha multiplayer relay', { status: 200 })
    }
    const pair = new WebSocketPair()
    this.ctx.acceptWebSocket(pair[1])
    return new Response(null, { status: 101, webSocket: pair[0] })
  }

  async webSocketMessage(ws, message) {
    const text = typeof message === 'string' ? message : ''
    for (const client of this.ctx.getWebSockets()) {
      if (client !== ws) client.send(text)
    }
  }

  async webSocketClose(ws) {
    const msg = JSON.stringify({ type: 'PLAYER_LEFT' })
    for (const client of this.ctx.getWebSockets()) {
      client.send(msg)
    }
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const roomCode = url.pathname.replace(/^\//, '').toUpperCase()
    if (!roomCode) return new Response('Dhandha multiplayer relay', { status: 200 })
    const stub = env.ROOM.getByName(roomCode)
    // fetch() not RPC -- WebSocket upgrade needs the raw Request/Response
    // pair, RPC methods can't carry the `webSocket` field
    return stub.fetch(request)
  },
}
