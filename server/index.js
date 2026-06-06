// Local WiFi relay server — same WebSocket protocol as the Cloudflare Worker.
// Run: node server/index.js
// Then share the printed URL with everyone on the same WiFi/hotspot.

const express = require('express')
const { createServer } = require('http')
const WebSocket = require('ws')
const path = require('path')
const os = require('os')

const app = express()
const httpServer = createServer(app)

// Serve the built PWA so guests just open the host's IP in their browser.
const distPath = path.join(__dirname, '..', 'dist')
app.use(express.static(distPath))
app.get('*', (_, res) => res.sendFile(path.join(distPath, 'index.html')))

// WebSocket relay — rooms are keyed by the URL path (e.g. /ABCD)
const wss = new WebSocket.Server({ server: httpServer })
const rooms = new Map() // roomCode → Set<WebSocket>

wss.on('connection', (ws, req) => {
  const roomCode = decodeURIComponent(req.url.replace(/^\//, '')).toUpperCase()
  if (!rooms.has(roomCode)) rooms.set(roomCode, new Set())
  const room = rooms.get(roomCode)
  room.add(ws)

  ws.on('message', (data) => {
    const text = typeof data === 'string' ? data : data.toString()
    for (const client of room) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(text)
      }
    }
  })

  ws.on('close', () => {
    room.delete(ws)
    const payload = JSON.stringify({ type: 'PLAYER_LEFT' })
    for (const client of room) {
      if (client.readyState === WebSocket.OPEN) client.send(payload)
    }
    if (room.size === 0) rooms.delete(roomCode)
  })

  ws.on('error', () => ws.close())
})

function getLocalIPs() {
  return Object.values(os.networkInterfaces())
    .flat()
    .filter(i => i && i.family === 'IPv4' && !i.internal)
    .map(i => i.address)
}

const PORT = parseInt(process.env.PORT || '3001', 10)
httpServer.listen(PORT, '0.0.0.0', () => {
  const ips = getLocalIPs()
  console.log('\n🎮  Dhandha Local Server chalu hai!\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  if (ips.length === 0) {
    console.log(`  → http://localhost:${PORT}\n`)
  } else {
    ips.forEach(ip => console.log(`  → http://${ip}:${PORT}`))
    console.log()
  }
  console.log('Ye URL sab doston ke saath share karo (same WiFi/hotspot chahiye).')
  console.log('Guests isi URL ko browser mein kholenge — app aur game server dono yahan hain.\n')
})
