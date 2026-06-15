import pako from 'pako'

export function encodeForQR(obj) {
  const json = JSON.stringify(obj)
  const compressed = pako.deflate(json)
  let binary = ''
  for (let i = 0; i < compressed.length; i++) {
    binary += String.fromCharCode(compressed[i])
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function decodeFromQR(str) {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/') + '=='.slice((str.length * 3) % 4)
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  const json = pako.inflate(bytes, { to: 'string' })
  return JSON.parse(json)
}

export function stripSDP(sdp) {
  const keep = new Set([
    'v=', 'o=', 's=', 't=', 'a=group:', 'a=msid-semantic:',
    'm=application', 'c=', 'a=mid:', 'a=sctp-port:', 'a=max-message-size:',
    'a=sctpmap:', 'a=setup:', 'a=ice-ufrag:', 'a=ice-pwd:',
    'a=ice-options:', 'a=fingerprint:', 'a=sendrecv', 'a=sendonly',
    'a=recvonly', 'a=inactive',
  ])

  const lines = sdp.split('\r\n').filter(Boolean)
  const result = []
  let inAppSection = false
  let inOtherMedia = false

  for (const line of lines) {
    if (line.startsWith('m=')) {
      inAppSection = line.startsWith('m=application')
      inOtherMedia = !inAppSection
    }

    if (inOtherMedia) continue

    if (line.startsWith('a=candidate:')) {
      // Keep host candidates and srflx (STUN) candidates.
      // Keeping both allows P2P within LAN and across different networks via STUN.
      if (line.includes(' host ') || line.includes(' srflx ')) result.push(line)
      continue
    }

    if (!inAppSection && !line.startsWith('m=')) {
      const isGlobal = keep.has(line.slice(0, line.indexOf('=') + 1)) ||
        [...keep].some(prefix => line.startsWith(prefix))
      if (isGlobal) result.push(line)
      continue
    }

    const isKept = [...keep].some(prefix => line.startsWith(prefix))
    if (isKept || line.startsWith('m=application') || line.startsWith('b=')) {
      result.push(line)
    }
  }

  return result.join('\r\n') + '\r\n'
}

export function waitForICE(pc, timeoutMs = 3000) {
  return new Promise((resolve) => {
    if (pc.iceGatheringState === 'complete') {
      resolve()
      return
    }

    const timer = setTimeout(resolve, timeoutMs)

    pc.addEventListener('icegatheringstatechange', function handler() {
      if (pc.iceGatheringState === 'complete') {
        clearTimeout(timer)
        pc.removeEventListener('icegatheringstatechange', handler)
        resolve()
      }
    })
  })
}
