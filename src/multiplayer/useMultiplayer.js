// WebSocket connection to the Cloudflare Worker room relay.
// All message routing (lobby HELLO/ROSTER, GAME_STATE, GAME_ACTION) happens in App.jsx.
// This hook is purely a transport layer.

import { useRef, useState, useCallback, useEffect } from 'react'

const WS_BASE = import.meta.env.VITE_WS_URL || 'wss://dhandha-multiplayer.workers.dev'

export function useMultiplayer({ onMessage } = {}) {
  const wsRef = useRef(null)
  const onMessageRef = useRef(onMessage)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState(null)

  // Keep ref in sync so callbacks don't stale-close over onMessage
  useEffect(() => { onMessageRef.current = onMessage }, [onMessage])

  const connect = useCallback((roomCode) => {
    wsRef.current?.close()
    const ws = new WebSocket(`${WS_BASE}/${roomCode.toUpperCase()}`)
    wsRef.current = ws

    ws.onopen = () => { setConnected(true); setError(null) }
    ws.onmessage = (e) => {
      try { onMessageRef.current?.(JSON.parse(e.data)) } catch (_) {}
    }
    ws.onclose = () => setConnected(false)
    ws.onerror = () => { setError('Connection fail hui. Dobara try karo.'); setConnected(false) }
  }, [])

  const send = useCallback((msg) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(typeof msg === 'string' ? msg : JSON.stringify(msg))
    }
  }, [])

  const disconnect = useCallback(() => {
    wsRef.current?.close()
    wsRef.current = null
    setConnected(false)
  }, [])

  useEffect(() => () => wsRef.current?.close(), [])

  return { connect, disconnect, send, connected, error }
}
