// City landmark icons — thin-line SVG at 32×32 viewBox
// Each icon is recognizable, clean, minimal — designed for 28px render size

const LANDMARKS = {
  // 🟤 BROWN
  indore: (
    <svg viewBox="0 0 32 32" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="16" cy="20" rx="11" ry="6" stroke="currentColor" strokeWidth="2"/>
      <path d="M8 20 Q10 14 16 13 Q22 14 24 20" stroke="currentColor" strokeWidth="2"/>
      <circle cx="16" cy="12" r="2.5" stroke="currentColor" strokeWidth="2"/>
      <path d="M13 9 Q16 6 19 9" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  lucknow: (
    <svg viewBox="0 0 32 32" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 26 L5 14 Q5 8 16 8 Q27 8 27 14 L27 26" stroke="currentColor" strokeWidth="2"/>
      <path d="M11 26 L11 18 Q11 15 16 15 Q21 15 21 18 L21 26" stroke="currentColor" strokeWidth="2"/>
      <path d="M16 8 L16 4" stroke="currentColor" strokeWidth="2"/>
      <circle cx="16" cy="3.5" r="1.5" fill="currentColor"/>
      <path d="M5 26 L27 26" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),

  // 🔵 LIGHT BLUE
  chandigarh: (
    <svg viewBox="0 0 32 32" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4 L20 10 L26 10 L21 14 L23 21 L16 17 L9 21 L11 14 L6 10 L12 10 Z" stroke="currentColor" strokeWidth="1.8" fill="none"/>
      <line x1="16" y1="21" x2="16" y2="28" stroke="currentColor" strokeWidth="2"/>
      <line x1="10" y1="28" x2="22" y2="28" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
  bhopal: (
    <svg viewBox="0 0 32 32" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 22 Q8 14 16 14 Q24 14 28 22" stroke="currentColor" strokeWidth="2.2" fill="none"/>
      <path d="M4 26 Q8 18 16 18 Q24 18 28 26" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M4 22 Q8 30 16 30 Q24 30 28 22" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <circle cx="16" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
  kochi: (
    <svg viewBox="0 0 32 32" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 8 L28 8" stroke="currentColor" strokeWidth="2"/>
      <path d="M4 8 L16 24 L28 8" stroke="currentColor" strokeWidth="2"/>
      <path d="M10 8 L16 18 L22 8" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M16 24 L16 28" stroke="currentColor" strokeWidth="2"/>
      <line x1="8" y1="28" x2="24" y2="28" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),

  // 🟣 PINK
  jaipur: (
    <svg viewBox="0 0 32 32" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* Hawa Mahal — honeycomb arches */}
      <rect x="4" y="16" width="24" height="12" stroke="currentColor" strokeWidth="1.8" rx="1"/>
      {[5,9,13,17,21].map(x => (
        <path key={x} d={`M${x} 16 Q${x+2} 10 ${x+4} 16`} stroke="currentColor" strokeWidth="1.5" fill="none"/>
      ))}
      <path d="M9 12 Q11 7 13 12" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M19 12 Q21 7 23 12" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    </svg>
  ),
  ahmedabad: (
    <svg viewBox="0 0 32 32" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* Diamond kite */}
      <path d="M16 4 L26 16 L16 28 L6 16 Z" stroke="currentColor" strokeWidth="2"/>
      <line x1="16" y1="4" x2="16" y2="28" stroke="currentColor" strokeWidth="1.2"/>
      <line x1="6" y1="16" x2="26" y2="16" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M16 28 Q18 31 20 33" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  kolkata: (
    <svg viewBox="0 0 32 32" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* Howrah Bridge — arched truss */}
      <path d="M4 22 Q16 6 28 22" stroke="currentColor" strokeWidth="2.5" fill="none"/>
      <line x1="4" y1="22" x2="28" y2="22" stroke="currentColor" strokeWidth="2"/>
      <line x1="9" y1="22" x2="12" y2="14" stroke="currentColor" strokeWidth="1.3"/>
      <line x1="16" y1="22" x2="16" y2="10" stroke="currentColor" strokeWidth="1.3"/>
      <line x1="23" y1="22" x2="20" y2="14" stroke="currentColor" strokeWidth="1.3"/>
      <line x1="4" y1="22" x2="4" y2="27" stroke="currentColor" strokeWidth="2"/>
      <line x1="28" y1="22" x2="28" y2="27" stroke="currentColor" strokeWidth="2"/>
      <line x1="2" y1="27" x2="30" y2="27" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),

  // 🟠 ORANGE
  chennai: (
    <svg viewBox="0 0 32 32" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* Gopuram — stepped pyramid */}
      <rect x="13" y="22" width="6" height="6" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M11 22 L13 16 L19 16 L21 22 Z" stroke="currentColor" strokeWidth="1.8" fill="none"/>
      <path d="M13 16 L14 11 L18 11 L19 16 Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M14 11 L15 7 L17 7 L18 11 Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <line x1="16" y1="7" x2="16" y2="4" stroke="currentColor" strokeWidth="1.8"/>
    </svg>
  ),
  hyderabad: (
    <svg viewBox="0 0 32 32" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* Charminar — 4 minarets + central arch */}
      <rect x="10" y="14" width="12" height="14" stroke="currentColor" strokeWidth="1.8" fill="none"/>
      <path d="M13 28 L13 14 L13 10 Q13 7 11 7 Q9 7 9 10 L9 14" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M19 28 L19 14 L19 10 Q19 7 21 7 Q23 7 23 10 L23 14" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="9" y1="14" x2="23" y2="14" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M12 28 Q16 22 20 28" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    </svg>
  ),
  noida: (
    <svg viewBox="0 0 32 32" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* Modern skyline */}
      <rect x="4"  y="16" width="5" height="12" stroke="currentColor" strokeWidth="1.8" rx="1"/>
      <rect x="10" y="10" width="5" height="18" stroke="currentColor" strokeWidth="1.8" rx="1"/>
      <rect x="17" y="13" width="5" height="15" stroke="currentColor" strokeWidth="1.8" rx="1"/>
      <rect x="23" y="18" width="5" height="10" stroke="currentColor" strokeWidth="1.8" rx="1"/>
      <line x1="2" y1="28" x2="30" y2="28" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),

  // 🔴 RED
  pune: (
    <svg viewBox="0 0 32 32" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* Fort battlements */}
      <path d="M4 28 L4 14 L8 14 L8 10 L12 10 L12 14 L16 14 L16 10 L20 10 L20 14 L24 14 L24 10 L28 10 L28 14 L28 28 Z" stroke="currentColor" strokeWidth="1.8" fill="none"/>
      <line x1="4" y1="28" x2="28" y2="28" stroke="currentColor" strokeWidth="2"/>
      <rect x="13" y="20" width="6" height="8" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  bengaluru: (
    <svg viewBox="0 0 32 32" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* Leaf + tech dot (Silicon Valley of India) */}
      <path d="M16 28 Q6 20 6 12 Q6 4 16 4 Q26 4 26 12 Q26 20 16 28 Z" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M16 4 L16 28" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M6 12 Q11 16 16 14 Q21 12 26 16" stroke="currentColor" strokeWidth="1.3"/>
      <circle cx="16" cy="16" r="2" fill="currentColor"/>
    </svg>
  ),
  gurugram: (
    <svg viewBox="0 0 32 32" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* Glass tower + smaller building */}
      <path d="M8 28 L8 10 L14 10 L14 28" stroke="currentColor" strokeWidth="1.8" fill="none"/>
      <rect x="8" y="10" width="6" height="18" stroke="currentColor" strokeWidth="1.8" rx="1"/>
      <rect x="16" y="14" width="8" height="14" stroke="currentColor" strokeWidth="1.8" rx="1"/>
      <line x1="8" y1="16" x2="14" y2="16" stroke="currentColor" strokeWidth="1"/>
      <line x1="8" y1="20" x2="14" y2="20" stroke="currentColor" strokeWidth="1"/>
      <line x1="16" y1="18" x2="24" y2="18" stroke="currentColor" strokeWidth="1"/>
      <line x1="16" y1="22" x2="24" y2="22" stroke="currentColor" strokeWidth="1"/>
      <line x1="6" y1="28" x2="26" y2="28" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),

  // 🟡 YELLOW
  goa: (
    <svg viewBox="0 0 32 32" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* Palm tree + waves */}
      <line x1="16" y1="28" x2="16" y2="12" stroke="currentColor" strokeWidth="2"/>
      <path d="M16 12 Q10 10 8 6 Q14 6 16 12" stroke="currentColor" strokeWidth="1.8" fill="none"/>
      <path d="M16 14 Q22 10 24 6 Q18 7 16 14" stroke="currentColor" strokeWidth="1.8" fill="none"/>
      <path d="M4 24 Q8 21 12 24 Q16 27 20 24 Q24 21 28 24" stroke="currentColor" strokeWidth="1.8" fill="none"/>
    </svg>
  ),
  coimbatore: (
    <svg viewBox="0 0 32 32" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* Spinning wheel (textile city) */}
      <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="2"/>
      <circle cx="16" cy="16" r="3" stroke="currentColor" strokeWidth="2"/>
      {[0,45,90,135].map(a => {
        const r = Math.PI * a / 180
        return <line key={a} x1={16 + 3*Math.cos(r)} y1={16 + 3*Math.sin(r)} x2={16 + 12*Math.cos(r)} y2={16 + 12*Math.sin(r)} stroke="currentColor" strokeWidth="1.5"/>
      })}
    </svg>
  ),
  vizag: (
    <svg viewBox="0 0 32 32" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* Submarine silhouette */}
      <path d="M6 16 Q6 12 16 12 Q26 12 26 16 Q26 20 16 20 Q6 20 6 16 Z" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M22 12 L22 8 L26 8" stroke="currentColor" strokeWidth="1.8"/>
      <circle cx="9" cy="16" r="1.5" fill="currentColor"/>
      <path d="M26 16 L30 16" stroke="currentColor" strokeWidth="2"/>
      <path d="M26 14 L29 12 L29 20 L26 18" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    </svg>
  ),

  // 🟢 GREEN
  newdelhi: (
    <svg viewBox="0 0 32 32" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* India Gate */}
      <path d="M10 28 L10 16 Q10 10 16 10 Q22 10 22 16 L22 28" stroke="currentColor" strokeWidth="2.2" fill="none"/>
      <path d="M10 28 L22 28" stroke="currentColor" strokeWidth="2.2"/>
      <path d="M8 28 L24 28" stroke="currentColor" strokeWidth="2.2"/>
      <path d="M13 16 L19 16" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="16" y1="10" x2="16" y2="7" stroke="currentColor" strokeWidth="2"/>
      <line x1="14" y1="7" x2="18" y2="7" stroke="currentColor" strokeWidth="2"/>
      <line x1="6" y1="28" x2="26" y2="28" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  navimumbai: (
    <svg viewBox="0 0 32 32" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* Bandra-Worli Sea Link — cable bridge */}
      <path d="M4 24 Q16 8 28 24" stroke="currentColor" strokeWidth="2.5" fill="none"/>
      <line x1="4" y1="24" x2="28" y2="24" stroke="currentColor" strokeWidth="2"/>
      <line x1="12" y1="24" x2="14" y2="14" stroke="currentColor" strokeWidth="1.2"/>
      <line x1="14" y1="24" x2="15" y2="13" stroke="currentColor" strokeWidth="1.2"/>
      <line x1="18" y1="24" x2="17" y2="13" stroke="currentColor" strokeWidth="1.2"/>
      <line x1="20" y1="24" x2="18" y2="14" stroke="currentColor" strokeWidth="1.2"/>
      <line x1="4" y1="18" x2="4" y2="28" stroke="currentColor" strokeWidth="2"/>
      <line x1="28" y1="18" x2="28" y2="28" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
  thane: (
    <svg viewBox="0 0 32 32" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* Lotus flower */}
      <path d="M16 26 Q10 20 10 14 Q10 10 16 10 Q22 10 22 14 Q22 20 16 26 Z" stroke="currentColor" strokeWidth="1.8" fill="none"/>
      <path d="M16 10 Q8 6 6 12 Q10 16 16 14" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M16 10 Q24 6 26 12 Q22 16 16 14" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <line x1="16" y1="26" x2="16" y2="30" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 30 Q16 28 20 30" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),

  // 🔵 DARK BLUE
  southmumbai: (
    <svg viewBox="0 0 32 32" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* Gateway of India */}
      <path d="M8 28 L8 14 Q8 6 16 6 Q24 6 24 14 L24 28" stroke="currentColor" strokeWidth="2.2" fill="none"/>
      <path d="M12 28 L12 18 Q12 14 16 14 Q20 14 20 18 L20 28" stroke="currentColor" strokeWidth="1.8" fill="none"/>
      <path d="M8 14 L12 14" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M20 14 L24 14" stroke="currentColor" strokeWidth="1.8"/>
      <line x1="16" y1="6" x2="16" y2="3" stroke="currentColor" strokeWidth="2"/>
      <path d="M14 3 L18 3" stroke="currentColor" strokeWidth="2"/>
      <line x1="6" y1="28" x2="26" y2="28" stroke="currentColor" strokeWidth="2.2"/>
    </svg>
  ),
  lutyensdelhi: (
    <svg viewBox="0 0 32 32" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* Colonnade — Rashtrapati Bhavan pillars */}
      {[6,10,14,18,22,26].map(x => (
        <line key={x} x1={x} y1="28" x2={x} y2="14" stroke="currentColor" strokeWidth="2"/>
      ))}
      <line x1="4" y1="14" x2="28" y2="14" stroke="currentColor" strokeWidth="2"/>
      <path d="M4 14 Q16 6 28 14" stroke="currentColor" strokeWidth="2" fill="none"/>
      <line x1="4" y1="28" x2="28" y2="28" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),

  // 🚂 RAILROADS
  mumbailocal: (
    <svg viewBox="0 0 32 32" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="10" width="26" height="14" stroke="currentColor" strokeWidth="2" rx="3"/>
      <path d="M3 16 L29 16" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="6" y="12" width="6" height="4" stroke="currentColor" strokeWidth="1.3" rx="1"/>
      <rect x="14" y="12" width="6" height="4" stroke="currentColor" strokeWidth="1.3" rx="1"/>
      <circle cx="9" cy="26" r="2.5" stroke="currentColor" strokeWidth="1.8"/>
      <circle cx="23" cy="26" r="2.5" stroke="currentColor" strokeWidth="1.8"/>
      <line x1="2" y1="29" x2="30" y2="29" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  delhimetro: (
    <svg viewBox="0 0 32 32" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="8" width="24" height="14" stroke="currentColor" strokeWidth="2" rx="4"/>
      <path d="M4 14 L28 14" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="7" y="10" width="5" height="4" stroke="currentColor" strokeWidth="1.3" rx="1"/>
      <rect x="20" y="10" width="5" height="4" stroke="currentColor" strokeWidth="1.3" rx="1"/>
      <line x1="10" y1="22" x2="10" y2="28" stroke="currentColor" strokeWidth="1.8"/>
      <line x1="22" y1="22" x2="22" y2="28" stroke="currentColor" strokeWidth="1.8"/>
      <line x1="4" y1="28" x2="28" y2="28" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
  nammametro: (
    <svg viewBox="0 0 32 32" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* Elevated metro */}
      <rect x="5" y="6" width="22" height="12" stroke="currentColor" strokeWidth="2" rx="3"/>
      <path d="M5 12 L27 12" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="8" y="8" width="5" height="4" stroke="currentColor" strokeWidth="1.3" rx="1"/>
      <rect x="19" y="8" width="5" height="4" stroke="currentColor" strokeWidth="1.3" rx="1"/>
      <path d="M8 18 L8 24 L4 28" stroke="currentColor" strokeWidth="2"/>
      <path d="M24 18 L24 24 L28 28" stroke="currentColor" strokeWidth="2"/>
      <line x1="2" y1="28" x2="30" y2="28" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
  howrahexpress: (
    <svg viewBox="0 0 32 32" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* Steam train */}
      <rect x="2" y="16" width="22" height="10" stroke="currentColor" strokeWidth="2" rx="2"/>
      <circle cx="28" cy="20" r="4" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M6 16 L6 10 Q6 8 12 8 L18 8 L18 16" stroke="currentColor" strokeWidth="1.8" fill="none"/>
      <path d="M10 8 L10 4 Q12 2 14 4" stroke="currentColor" strokeWidth="1.8"/>
      <circle cx="8"  cy="28" r="2.5" stroke="currentColor" strokeWidth="1.8"/>
      <circle cx="18" cy="28" r="2.5" stroke="currentColor" strokeWidth="1.8"/>
    </svg>
  ),

  // 💡 UTILITIES
  powergrid: (
    <svg viewBox="0 0 32 32" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* Electric tower/pylon */}
      <line x1="16" y1="2" x2="16" y2="30" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M7 10 L16 14 L25 10" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M9 18 L16 22 L23 18" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M7 10 L9 18" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M25 10 L23 18" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M4 10 L8 10" stroke="currentColor" strokeWidth="2"/>
      <path d="M24 10 L28 10" stroke="currentColor" strokeWidth="2"/>
      <path d="M6 18 L10 18" stroke="currentColor" strokeWidth="2"/>
      <path d="M22 18 L26 18" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
  waterworks: (
    <svg viewBox="0 0 32 32" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* Water tap + drop */}
      <path d="M16 6 Q16 6 14 12 Q12 18 16 22 Q20 18 18 12 Q16 6 16 6 Z" stroke="currentColor" strokeWidth="1.8" fill="none"/>
      <path d="M8 12 L24 12" stroke="currentColor" strokeWidth="2"/>
      <rect x="13" y="12" width="6" height="5" stroke="currentColor" strokeWidth="1.8" rx="1"/>
      <path d="M16 17 L16 22" stroke="currentColor" strokeWidth="2"/>
      <path d="M13 22 Q16 28 19 22" stroke="currentColor" strokeWidth="1.8" fill="none"/>
    </svg>
  ),
}

export function CityLandmark({ cityKey, size = 28, color = 'currentColor' }) {
  if (!cityKey || !LANDMARKS[cityKey]) return null
  const icon = LANDMARKS[cityKey]
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size, height: size, color, flexShrink: 0 }}>
      {icon}
    </span>
  )
}
