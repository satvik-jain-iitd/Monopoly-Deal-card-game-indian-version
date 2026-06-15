// WebSocket connection to either the Cloudflare Worker (cloud) or the local Node.js relay.
// All message routing (lobby HELLO/ROSTER, GAME_STATE, GAME_ACTION) happens in App.jsx.
// This hook is purely a transport layer.

import { useRef, useState, useCallback, useEffect } from 'react'

const CLOUD_WS_BASE = import.meta.env.VITE_WS_URL || 'wss://dhandha-multiplayer.workers.dev'

export function useMultiplayer({ onMessage } = {}) {
  const wsRef = useRef(null)
  const onMessageRef = useRef(onMessage)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState(null)
  const messageQueueRef = useRef([])
  const retryCountRef = useRef(0)
  const roomParamsRef = useRef(null)

  useEffect(() => { onMessageRef.current = onMessage }, [onMessage])

  const connect = useCallback(function connectFn(roomCode, wsBaseOverride) {
    roomParamsRef.current = { roomCode, wsBaseOverride }
    wsRef.current?.close()
    const base = wsBaseOverride || CLOUD_WS_BASE
    const ws = new WebSocket(`${base}/${roomCode.toUpperCase()}`)
    wsRef.current = ws

    ws.onopen = () => {
      setConnected(true)
      setError(null)
      retryCountRef.current = 0
      // Flush queued messages
      while (messageQueueRef.current.length > 0) {
        const msg = messageQueueRef.current.shift()
        ws.send(msg)
      }
    }
    ws.onmessage = (e) => {
      try { onMessageRef.current?.(JSON.parse(e.data)) } catch (_) {}
    }
    ws.onclose = () => {
      setConnected(false)
      // Auto-reconnect with exponential backoff
      if (roomParamsRef.current && retryCountRef.current < 5) {
        const backoff = Math.min(1000 * Math.pow(2, retryCountRef.current), 8000)
        retryCountRef.current++
        setTimeout(() => {
          if (roomParamsRef.current) {
            const { roomCode, wsBaseOverride } = roomParamsRef.current
            connectFn(roomCode, wsBaseOverride)
          }
        }, backoff)
      }
    }
    ws.onerror = () => {
      setError('Connection fail hui. Dobara try karo.')
      setConnected(false)
    }
  }, [])

  const send = useCallback((msg) => {
    const data = typeof msg === 'string' ? msg : JSON.stringify(msg)
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(data)
    } else {
      messageQueueRef.current.push(data)
    }
  }, [])

  const disconnect = useCallback(() => {
    roomParamsRef.current = null
    wsRef.current?.close()
    wsRef.current = null
    setConnected(false)
  }, [])

  useEffect(() => () => wsRef.current?.close(), [])

  return { connect, disconnect, send, connected, error }
}
