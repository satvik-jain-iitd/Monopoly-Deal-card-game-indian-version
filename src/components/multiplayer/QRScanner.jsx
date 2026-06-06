import { useEffect, useRef, useState } from 'react'
import { Box, Typography } from '@mui/material'
import jsQR from 'jsqr'

const MAX_WIDTH = 320

export default function QRScanner({ onScan, active = false }) {
  const videoRef = useRef(null)
  const scanCanvasRef = useRef(null)
  const displayCanvasRef = useRef(null)
  const streamRef = useRef(null)
  const rafRef = useRef(null)
  const doneRef = useRef(false)

  const [status, setStatus] = useState('loading')

  useEffect(() => {
    if (!active) return

    doneRef.current = false

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        })
        streamRef.current = stream
        const video = videoRef.current
        if (!video) return
        video.srcObject = stream
        await video.play()
        setStatus('scanning')
        rafRef.current = requestAnimationFrame(tick)
      } catch {
        setStatus('error')
      }
    }

    function stopTracks() {
      streamRef.current?.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }

    function tick() {
      if (doneRef.current) return
      const video = videoRef.current
      const scanCanvas = scanCanvasRef.current
      const displayCanvas = displayCanvasRef.current
      if (!video || !scanCanvas || !displayCanvas || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(tick)
        return
      }

      const vw = video.videoWidth
      const vh = video.videoHeight
      if (!vw || !vh) {
        rafRef.current = requestAnimationFrame(tick)
        return
      }

      scanCanvas.width = vw
      scanCanvas.height = vh

      const displayW = Math.min(vw, MAX_WIDTH)
      const displayH = Math.round((vh / vw) * displayW)
      displayCanvas.width = displayW
      displayCanvas.height = displayH

      const scanCtx = scanCanvas.getContext('2d', { willReadFrequently: true })
      scanCtx.drawImage(video, 0, 0, vw, vh)

      const displayCtx = displayCanvas.getContext('2d')
      displayCtx.drawImage(video, 0, 0, displayW, displayH)

      const viewfinderSize = Math.round(displayW * 0.6)
      const vfX = Math.round((displayW - viewfinderSize) / 2)
      const vfY = Math.round((displayH - viewfinderSize) / 2)

      displayCtx.fillStyle = 'rgba(0,0,0,0.45)'
      displayCtx.fillRect(0, 0, displayW, vfY)
      displayCtx.fillRect(0, vfY + viewfinderSize, displayW, displayH - vfY - viewfinderSize)
      displayCtx.fillRect(0, vfY, vfX, viewfinderSize)
      displayCtx.fillRect(vfX + viewfinderSize, vfY, displayW - vfX - viewfinderSize, viewfinderSize)

      const cornerLen = Math.round(viewfinderSize * 0.12)
      const cornerThick = 3
      displayCtx.strokeStyle = '#FF6D00'
      displayCtx.lineWidth = cornerThick
      displayCtx.lineCap = 'square'
      const corners = [
        [vfX, vfY, 1, 1],
        [vfX + viewfinderSize, vfY, -1, 1],
        [vfX, vfY + viewfinderSize, 1, -1],
        [vfX + viewfinderSize, vfY + viewfinderSize, -1, -1],
      ]
      for (const [cx, cy, dx, dy] of corners) {
        displayCtx.beginPath()
        displayCtx.moveTo(cx, cy)
        displayCtx.lineTo(cx + dx * cornerLen, cy)
        displayCtx.moveTo(cx, cy)
        displayCtx.lineTo(cx, cy + dy * cornerLen)
        displayCtx.stroke()
      }

      const imageData = scanCtx.getImageData(0, 0, vw, vh)
      const code = jsQR(imageData.data, vw, vh, { inversionAttempts: 'dontInvert' })

      if (code) {
        doneRef.current = true
        stopTracks()
        onScan(code.data)
        return
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    start()

    return () => {
      doneRef.current = true
      cancelAnimationFrame(rafRef.current)
      streamRef.current?.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
  }, [active, onScan])

  const statusLabel = {
    loading: 'Camera khul raha hai...',
    scanning: 'QR code frame ke beech mein rakhो',
    error: 'Camera ki permission nahi mili.',
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          maxWidth: MAX_WIDTH,
          borderRadius: 3,
          overflow: 'hidden',
          backgroundColor: '#000',
          aspectRatio: '1 / 1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <canvas
          ref={displayCanvasRef}
          style={{ width: '100%', display: status === 'scanning' ? 'block' : 'none' }}
        />
        {status !== 'scanning' && (
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', px: 2 }}>
            {statusLabel[status]}
          </Typography>
        )}
      </Box>

      {status === 'scanning' && (
        <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center', fontWeight: 600 }}>
          {statusLabel.scanning}
        </Typography>
      )}

      <video
        ref={videoRef}
        playsInline
        muted
        style={{ display: 'none' }}
      />
      <canvas ref={scanCanvasRef} style={{ display: 'none' }} />
    </Box>
  )
}
