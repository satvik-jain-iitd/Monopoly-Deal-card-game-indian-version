import { useRef, useState, useCallback, useEffect } from 'react'
import { encodeForQR, decodeFromQR, stripSDP, waitForICE } from './rtcUtils.js'

const RTC_CONFIG = { iceServers: [] }
const DC_LABEL = 'game'
const DC_OPTIONS = { ordered: true }

let peerIdCounter = 0
function nextPeerId() {
  return `peer-${++peerIdCounter}`
}

export function useWebRTC({ onMessage, onPeerConnected } = {}) {
  const peersRef = useRef(new Map())
  const pendingRef = useRef(new Map())
  const onMessageRef = useRef(onMessage)
  const onPeerConnectedRef = useRef(onPeerConnected)
  const [connected, setConnected] = useState(false)
  const [peerCount, setPeerCount] = useState(0)
  const [error, setError] = useState(null)

  useEffect(() => { onMessageRef.current = onMessage }, [onMessage])
  useEffect(() => { onPeerConnectedRef.current = onPeerConnected }, [onPeerConnected])

  const refreshState = useCallback(() => {
    const count = peersRef.current.size
    setPeerCount(count)
    setConnected(count > 0)
  }, [])

  const wireDataChannel = useCallback((peerId, dc) => {
    dc.onopen = () => {
      const pending = pendingRef.current.get(peerId)
      if (pending) {
        peersRef.current.set(peerId, pending)
        pendingRef.current.delete(peerId)
      }
      refreshState()
      onPeerConnectedRef.current?.()
    }

    dc.onmessage = (e) => {
      try {
        onMessageRef.current?.(JSON.parse(e.data))
      } catch (_) {}
    }

    dc.onclose = () => {
      peersRef.current.delete(peerId)
      pendingRef.current.delete(peerId)
      refreshState()
      onMessageRef.current?.({ type: 'PLAYER_LEFT' })
    }

    dc.onerror = (e) => {
      setError(`DataChannel error: ${e.error?.message ?? 'unknown'}`)
    }
  }, [refreshState])

  const createOffer = useCallback(async () => {
    const peerId = nextPeerId()
    const pc = new RTCPeerConnection(RTC_CONFIG)
    const dc = pc.createDataChannel(DC_LABEL, DC_OPTIONS)

    wireDataChannel(peerId, dc)
    pendingRef.current.set(peerId, { pc, dc })

    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    await waitForICE(pc)

    const stripped = stripSDP(pc.localDescription.sdp)
    return encodeForQR({ peerId, sdp: stripped, type: 'offer' })
  }, [wireDataChannel])

  const acceptAnswer = useCallback(async (encodedAnswer) => {
    const { peerId, sdp } = decodeFromQR(encodedAnswer)
    const entry = pendingRef.current.get(peerId)
    if (!entry) {
      setError(`No pending connection found for peer ${peerId}`)
      return
    }
    const { pc } = entry
    await pc.setRemoteDescription({ type: 'answer', sdp })
  }, [])

  const createAnswer = useCallback(async (encodedOffer) => {
    const { peerId, sdp: offerSdp } = decodeFromQR(encodedOffer)
    const pc = new RTCPeerConnection(RTC_CONFIG)

    // ondatachannel fires for channels created by the remote (host) side.
    pc.ondatachannel = (e) => {
      const dc = e.channel
      pendingRef.current.set(peerId, { pc, dc })
      wireDataChannel(peerId, dc)
    }

    await pc.setRemoteDescription({ type: 'offer', sdp: offerSdp })
    const answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)
    await waitForICE(pc)

    const stripped = stripSDP(pc.localDescription.sdp)
    return encodeForQR({ peerId, sdp: stripped, type: 'answer' })
  }, [wireDataChannel])

  const send = useCallback((msg) => {
    const data = JSON.stringify(msg)
    for (const { dc } of peersRef.current.values()) {
      if (dc.readyState === 'open') {
        dc.send(data)
      }
    }
  }, [])

  const disconnect = useCallback(() => {
    for (const { pc } of peersRef.current.values()) pc.close()
    for (const { pc } of pendingRef.current.values()) pc.close()
    peersRef.current.clear()
    pendingRef.current.clear()
    setConnected(false)
    setPeerCount(0)
  }, [])

  useEffect(() => {
    return () => {
      for (const { pc } of peersRef.current.values()) pc.close()
      for (const { pc } of pendingRef.current.values()) pc.close()
    }
  }, [])

  return {
    createOffer,
    acceptAnswer,
    createAnswer,
    send,
    disconnect,
    connected,
    peerCount,
    error,
  }
}
