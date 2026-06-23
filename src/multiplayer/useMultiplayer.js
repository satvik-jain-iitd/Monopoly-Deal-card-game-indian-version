// WebSocket connection to either the Cloudflare Worker (cloud) or the local Node.js relay.
// All message routing (lobby HELLO/ROSTER, GAME_STATE, GAME_ACTION) happens in App.jsx.
// This hook is purely a transport layer.

import { useRef, useState, useCallback, useEffect } from 'react'

// VITE_WS_URL env var must be set for cloud multiplayer to work.
// Example: VITE_WS_URL=wss://dhandha-multiplayer.<your-account>.workers.dev
// Run: cd worker && wrangler deploy (then set VITE_WS_URL to the deployed URL)
const CLOUD_WS_BASE = import.meta.env.VITE_WS_URL || ''

export function useMultiplayer({ onMessage, onOpen } = {}) {
  const wsRef = useRef(null)
  const onMessageRef = useRef(onMessage)
  const onOpenRef = useRef(onOpen)
  const [connectionStatus, setConnectionStatus] = useState('disconnected') // disconnected | connecting | connected
  const [error, setError] = useState(null)
  const messageQueueRef = useRef([])
  const retryCountRef = useRef(0)
  const everConnectedRef = useRef(false)
  const roomParamsRef = useRef(null)
  const retryTimersRef = useRef([])
  const pendingReconnectRef = useRef(null)

  useEffect(() => { onMessageRef.current = onMessage }, [onMessage])
  useEffect(() => { onOpenRef.current = onOpen }, [onOpen])

  const connect = useCallback(function connectFn(roomCode, wsBaseOverride, reconnectName, password) {
    roomParamsRef.current = { roomCode, wsBaseOverride }
    pendingReconnectRef.current = reconnectName || null
    messageQueueRef.current = []
    wsRef.current?.close()
    const base = wsBaseOverride || CLOUD_WS_BASE
    if (!base) {
      setError('Online mode ke liye VITE_WS_URL env variable set karna hoga. Tab tak Hotspot ya Offline mode use karo.')
      setConnectionStatus('disconnected')
      return
    }
    setConnectionStatus('connecting')
    const params = password ? `?password=${encodeURIComponent(password)}` : ''
    const ws = new WebSocket(`${base}/${roomCode.toUpperCase()}${params}`)
    wsRef.current = ws

    ws.onopen = () => {
      setConnectionStatus('connected')
      setError(null)
      everConnectedRef.current = true
      retryCountRef.current = 0
      while (messageQueueRef.current.length > 0) {
        const msg = messageQueueRef.current.shift()
        ws.send(msg)
      }
      if (pendingReconnectRef.current) {
        ws.send(JSON.stringify({ type: 'RECONNECT', name: pendingReconnectRef.current }))
        pendingReconnectRef.current = null
      }
      onOpenRef.current?.()
    }
    ws.onmessage = (e) => {
      try { onMessageRef.current?.(JSON.parse(e.data)) } catch (_) {}
    }
    ws.onclose = () => {
      setConnectionStatus('disconnected')
      const maxRetries = everConnectedRef.current ? 5 : 3
      if (roomParamsRef.current && retryCountRef.current < maxRetries) {
        const backoff = Math.min(1000 * Math.pow(2, retryCountRef.current), 8000)
        retryCountRef.current++
        const timer = setTimeout(() => {
          retryTimersRef.current = retryTimersRef.current.filter(t => t !== timer)
          if (roomParamsRef.current) {
            const { roomCode, wsBaseOverride } = roomParamsRef.current
            connectFn(roomCode, wsBaseOverride)
          }
        }, backoff)
        retryTimersRef.current.push(timer)
      }
    }
    ws.onerror = () => {
      setError('Server se connect nahi ho paaya. Dobara try karo.')
      setConnectionStatus('disconnected')
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
    pendingReconnectRef.current = null
    everConnectedRef.current = false
    retryTimersRef.current.forEach(clearTimeout)
    retryTimersRef.current = []
    wsRef.current?.close()
    wsRef.current = null
    setConnectionStatus('disconnected')
    setError(null)
  }, [])

  useEffect(() => () => {
    retryTimersRef.current.forEach(clearTimeout)
    wsRef.current?.close()
  }, [])

  return { connect, disconnect, send, connectionStatus, error }
}
