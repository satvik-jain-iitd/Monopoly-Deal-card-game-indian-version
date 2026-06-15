// Cloudflare Worker — WebSocket signalling relay for Dhandha multiplayer.
// PWA connects to wss://dhandha-multiplayer.<your-subdomain>.workers.dev/<ROOM_CODE>
//
// Deploy:
//   cd worker
//   npm install -g wrangler
//   wrangler deploy
//
// Then update the WS URL in:
//   src/multiplayer/useMultiplayer.js → CLOUD_WS_BASE
//   Or set env: VITE_WS_URL=wss://dhandha-multiplayer.<your-subdomain>.workers.dev

export default {
  async fetch(req) {
    const url = new URL(req.url)

    if (req.headers.get('Upgrade') === 'websocket') {
      const pair = new WebSocketPair()
      const [client, server] = Object.values(pair)

      server.accept()
      handleSession(server, url.pathname)

      return new Response(null, { status: 101, webSocket: client })
    }

    return new Response('Dhandha multiplayer relay', { status: 200 })
  },
}

const rooms = new Map()

function handleSession(ws, path) {
  const roomCode = path.replace(/^\//, '').toUpperCase()
  if (!rooms.has(roomCode)) rooms.set(roomCode, new Set())
  const room = rooms.get(roomCode)
  room.add(ws)

  ws.addEventListener('message', (e) => {
    const text = typeof e.data === 'string' ? e.data : ''
    for (const client of room) {
      if (client !== ws && client.readyState === 1) {
        client.send(text)
      }
    }
  })

  ws.addEventListener('close', () => {
    room.delete(ws)
    const msg = JSON.stringify({ type: 'PLAYER_LEFT' })
    for (const client of room) {
      if (client.readyState === 1) {
        client.send(msg)
      }
    }
    if (room.size === 0) rooms.delete(roomCode)
  })

  ws.addEventListener('error', () => ws.close())
}
