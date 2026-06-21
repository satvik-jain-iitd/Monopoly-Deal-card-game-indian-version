// Draft SVG generator functions for Monopoly Deal cards

export function getDefs(base64Font) {
  return `
    <defs>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.25"/>
      </filter>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
      <linearGradient id="moneyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1B5E20" />
        <stop offset="50%" stop-color="#2E7D32" />
        <stop offset="100%" stop-color="#43A047" />
      </linearGradient>
      <linearGradient id="moneyGradGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#2E7D32" />
        <stop offset="50%" stop-color="#F57C00" />
        <stop offset="100%" stop-color="#FFD54F" />
      </linearGradient>
      <linearGradient id="rainbowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FF6B6B" />
        <stop offset="25%" stop-color="#FFE66D" />
        <stop offset="50%" stop-color="#4ECDC4" />
        <stop offset="75%" stop-color="#45B7D1" />
        <stop offset="100%" stop-color="#A855F7" />
      </linearGradient>
      <pattern id="banknotePattern" width="40" height="40" patternUnits="userSpaceOnUse">
        <line x1="0" y1="40" x2="40" y2="0" stroke="#FFFFFF" stroke-opacity="0.03" stroke-width="1.5" />
        <text x="20" y="25" font-family="Outfit, sans-serif" font-size="8px" fill="#FFFFFF" fill-opacity="0.02" text-anchor="middle">₹</text>
      </pattern>
      <pattern id="borderPattern" width="20" height="20" patternUnits="userSpaceOnUse">
        <circle cx="10" cy="10" r="2" fill="#000000" fill-opacity="0.15" />
        <path d="M 0 0 L 20 20 M 20 0 L 0 20" stroke="#000000" stroke-opacity="0.05" stroke-width="1" />
      </pattern>
      <!-- Color wheel for wildcard -->
      <g id="colorWheel">
        <path d="M 0,0 L 50,-86.6 A 100,100 0 0,1 100,0 Z" fill="#955436" /> <!-- Brown -->
        <path d="M 0,0 L 100,0 A 100,100 0 0,1 86.6,50 Z" fill="#55C3F0" /> <!-- Light Blue -->
        <path d="M 0,0 L 86.6,50 A 100,100 0 0,1 50,86.6 Z" fill="#D93A96" /> <!-- Pink -->
        <path d="M 0,0 L 50,86.6 A 100,100 0 0,1 0,100 Z" fill="#F7941D" /> <!-- Orange -->
        <path d="M 0,0 L 0,100 A 100,100 0 0,1 -50,86.6 Z" fill="#ED1C24" /> <!-- Red -->
        <path d="M 0,0 L -50,86.6 A 100,100 0 0,1 -86.6,50 Z" fill="#FEF200" /> <!-- Yellow -->
        <path d="M 0,0 L -86.6,50 A 100,100 0 0,1 -100,0 Z" fill="#1FB25A" /> <!-- Green -->
        <path d="M 0,0 L -100,0 A 100,100 0 0,1 -86.6,-50 Z" fill="#003F9E" /> <!-- Dark Blue -->
        <path d="M 0,0 L -86.6,-50 A 100,100 0 0,1 -50,-86.6 Z" fill="#2C2C2C" /> <!-- Railroad -->
        <path d="M 0,0 L -50,-86.6 A 100,100 0 0,1 0,-100 Z" fill="#00796B" /> <!-- Utility -->
      </g>
      <style>
        @font-face {
          font-family: 'Outfit';
          src: url('data:font/ttf;base64,\${base64Font}') format('truetype');
          font-weight: 800;
          font-style: normal;
        }
      </style>
    </defs>
  `;
}
