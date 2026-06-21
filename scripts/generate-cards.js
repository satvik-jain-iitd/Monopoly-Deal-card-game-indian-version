import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { createDeck, COLORS, COLOR_DISPLAY, CARD_TYPES, ACTION_TYPES, PROPERTY_SETS } from '../src/game/constants.js';

// Ensure the directory exists
const CARDS_DIR = path.resolve('public/images/cards');
fs.mkdirSync(CARDS_DIR, { recursive: true });

// Raw SVG inner markup for all 28 property landmarks
const LANDMARK_PATHS = {
  // Brown
  indore: `
    <ellipse cx="16" cy="20" rx="11" ry="6" stroke="currentColor" stroke-width="2"/>
    <path d="M8 20 Q10 14 16 13 Q22 14 24 20" stroke="currentColor" stroke-width="2"/>
    <circle cx="16" cy="12" r="2.5" stroke="currentColor" stroke-width="2"/>
    <path d="M13 9 Q16 6 19 9" stroke="currentColor" stroke-width="1.5"/>
  `,
  lucknow: `
    <path d="M5 26 L5 14 Q5 8 16 8 Q27 8 27 14 L27 26" stroke="currentColor" stroke-width="2"/>
    <path d="M11 26 L11 18 Q11 15 16 15 Q21 15 21 18 L21 26" stroke="currentColor" stroke-width="2"/>
    <path d="M16 8 L16 4" stroke="currentColor" stroke-width="2"/>
    <circle cx="16" cy="3.5" r="1.5" fill="currentColor"/>
    <path d="M5 26 L27 26" stroke="currentColor" stroke-width="2"/>
  `,
  // Light Blue
  chandigarh: `
    <path d="M16 4 L20 10 L26 10 L21 14 L23 21 L16 17 L9 21 L11 14 L6 10 L12 10 Z" stroke="currentColor" stroke-width="1.8" fill="none"/>
    <line x1="16" y1="21" x2="16" y2="28" stroke="currentColor" stroke-width="2"/>
    <line x1="10" y1="28" x2="22" y2="28" stroke="currentColor" stroke-width="2"/>
  `,
  bhopal: `
    <path d="M4 22 Q8 14 16 14 Q24 14 28 22" stroke="currentColor" stroke-width="2.2" fill="none"/>
    <path d="M4 26 Q8 18 16 18 Q24 18 28 26" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <path d="M4 22 Q8 30 16 30 Q24 30 28 22" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <circle cx="16" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
  `,
  kochi: `
    <path d="M4 8 L28 8" stroke="currentColor" stroke-width="2"/>
    <path d="M4 8 L16 24 L28 8" stroke="currentColor" stroke-width="2"/>
    <path d="M10 8 L16 18 L22 8" stroke="currentColor" stroke-width="1.5"/>
    <path d="M16 24 L16 28" stroke="currentColor" stroke-width="2"/>
    <line x1="8" y1="28" x2="24" y2="28" stroke="currentColor" stroke-width="2"/>
  `,
  // Pink
  jaipur: `
    <rect x="4" y="16" width="24" height="12" stroke="currentColor" stroke-width="1.8" rx="1"/>
    <path d="M5 16 Q7 10 9 16" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <path d="M9 16 Q11 10 13 16" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <path d="M13 16 Q15 10 17 16" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <path d="M17 16 Q19 10 21 16" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <path d="M21 16 Q23 10 25 16" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <path d="M9 12 Q11 7 13 12" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <path d="M19 12 Q21 7 23 12" stroke="currentColor" stroke-width="1.5" fill="none"/>
  `,
  ahmedabad: `
    <path d="M16 4 L26 16 L16 28 L6 16 Z" stroke="currentColor" stroke-width="2"/>
    <line x1="16" y1="4" x2="16" y2="28" stroke="currentColor" stroke-width="1.2"/>
    <line x1="6" y1="16" x2="26" y2="16" stroke="currentColor" stroke-width="1.2"/>
    <path d="M16 28 Q18 31 20 33" stroke="currentColor" stroke-width="1.5"/>
  `,
  kolkata: `
    <path d="M4 22 Q16 6 28 22" stroke="currentColor" stroke-width="2.5" fill="none"/>
    <line x1="4" y1="22" x2="28" y2="22" stroke="currentColor" stroke-width="2"/>
    <line x1="9" y1="22" x2="12" y2="14" stroke="currentColor" stroke-width="1.3"/>
    <line x1="16" y1="22" x2="16" y2="10" stroke="currentColor" stroke-width="1.3"/>
    <line x1="23" y1="22" x2="20" y2="14" stroke="currentColor" stroke-width="1.3"/>
    <line x1="4" y1="22" x2="4" y2="27" stroke="currentColor" stroke-width="2"/>
    <line x1="28" y1="22" x2="28" y2="27" stroke="currentColor" stroke-width="2"/>
    <line x1="2" y1="27" x2="30" y2="27" stroke="currentColor" stroke-width="2"/>
  `,
  // Orange
  chennai: `
    <rect x="13" y="22" width="6" height="6" stroke="currentColor" stroke-width="1.8"/>
    <path d="M11 22 L13 16 L19 16 L21 22 Z" stroke="currentColor" stroke-width="1.8" fill="none"/>
    <path d="M13 16 L14 11 L18 11 L19 16 Z" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <path d="M14 11 L15 7 L17 7 L18 11 Z" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <line x1="16" y1="7" x2="16" y2="4" stroke="currentColor" stroke-width="1.8"/>
  `,
  hyderabad: `
    <rect x="10" y="14" width="12" height="14" stroke="currentColor" stroke-width="1.8" fill="none"/>
    <path d="M13 28 L13 14 L13 10 Q13 7 11 7 Q9 7 9 10 L9 14" stroke="currentColor" stroke-width="1.5"/><path d="M19 28 L19 14 L19 10 Q19 7 21 7 Q23 7 23 10 L23 14" stroke="currentColor" stroke-width="1.5"/>
    <line x1="9" y1="14" x2="23" y2="14" stroke="currentColor" stroke-width="1.8"/>
    <path d="M12 28 Q16 22 20 28" stroke="currentColor" stroke-width="1.5" fill="none"/>
  `,
  noida: `
    <rect x="4"  y="16" width="5" height="12" stroke="currentColor" stroke-width="1.8" rx="1"/>
    <rect x="10" y="10" width="5" height="18" stroke="currentColor" stroke-width="1.8" rx="1"/>
    <rect x="17" y="13" width="5" height="15" stroke="currentColor" stroke-width="1.8" rx="1"/>
    <rect x="23" y="18" width="5" height="10" stroke="currentColor" stroke-width="1.8" rx="1"/>
    <line x1="2" y1="28" x2="30" y2="28" stroke="currentColor" stroke-width="2"/>
  `,
  // Red
  pune: `
    <path d="M4 28 L4 14 L8 14 L8 10 L12 10 L12 14 L16 14 L16 10 L20 10 L20 14 L24 14 L24 10 L28 10 L28 14 L28 28 Z" stroke="currentColor" stroke-width="1.8" fill="none"/>
    <line x1="4" y1="28" x2="28" y2="28" stroke="currentColor" stroke-width="2"/>
    <rect x="13" y="20" width="6" height="8" stroke="currentColor" stroke-width="1.5"/>
  `,
  bengaluru: `
    <path d="M16 28 Q6 20 6 12 Q6 4 16 4 Q26 4 26 12 Q26 20 16 28 Z" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="M16 4 L16 28" stroke="currentColor" stroke-width="1.5"/>
    <path d="M6 12 Q11 16 16 14 Q21 12 26 16" stroke="currentColor" stroke-width="1.3"/>
    <circle cx="16" cy="16" r="2" fill="currentColor"/>
  `,
  gurugram: `
    <rect x="8" y="10" width="6" height="18" stroke="currentColor" stroke-width="1.8" rx="1"/>
    <rect x="16" y="14" width="8" height="14" stroke="currentColor" stroke-width="1.8" rx="1"/>
    <line x1="8" y1="16" x2="14" y2="16" stroke="currentColor" stroke-width="1"/>
    <line x1="8" y1="20" x2="14" y2="20" stroke="currentColor" stroke-width="1"/>
    <line x1="16" y1="18" x2="24" y2="18" stroke="currentColor" stroke-width="1"/>
    <line x1="16" y1="22" x2="24" y2="22" stroke="currentColor" stroke-width="1"/>
    <line x1="6" y1="28" x2="26" y2="28" stroke="currentColor" stroke-width="2"/>
  `,
  // Yellow
  goa: `
    <line x1="16" y1="28" x2="16" y2="12" stroke="currentColor" stroke-width="2"/>
    <path d="M16 12 Q10 10 8 6 Q14 6 16 12" stroke="currentColor" stroke-width="1.8" fill="none"/>
    <path d="M16 14 Q22 10 24 6 Q18 7 16 14" stroke="currentColor" stroke-width="1.8" fill="none"/>
    <path d="M4 24 Q8 21 12 24 Q16 27 20 24 Q24 21 28 24" stroke="currentColor" stroke-width="1.8" fill="none"/>
  `,
  coimbatore: `
    <circle cx="16" cy="16" r="12" stroke="currentColor" stroke-width="2"/>
    <circle cx="16" cy="16" r="3" stroke="currentColor" stroke-width="2"/>
    <line x1="19" y1="16" x2="28" y2="16" stroke="currentColor" stroke-width="1.5"/>
    <line x1="13" y1="16" x2="4" y2="16" stroke="currentColor" stroke-width="1.5"/>
    <line x1="16" y1="19" x2="16" y2="28" stroke="currentColor" stroke-width="1.5"/>
    <line x1="16" y1="13" x2="16" y2="4" stroke="currentColor" stroke-width="1.5"/>
    <line x1="18.12" y1="18.12" x2="24.48" y2="24.48" stroke="currentColor" stroke-width="1.5"/>
    <line x1="13.88" y1="13.88" x2="7.52" y2="7.52" stroke="currentColor" stroke-width="1.5"/>
    <line x1="13.88" y1="18.12" x2="7.52" y2="24.48" stroke="currentColor" stroke-width="1.5"/>
    <line x1="18.12" y1="13.88" x2="24.48" y2="7.52" stroke="currentColor" stroke-width="1.5"/>
  `,
  vizag: `
    <path d="M6 16 Q6 12 16 12 Q26 12 26 16 Q26 20 16 20 Q6 20 6 16 Z" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="M22 12 L22 8 L26 8" stroke="currentColor" stroke-width="1.8"/><circle cx="9" cy="16" r="1.5" fill="currentColor"/>
    <path d="M26 16 L30 16" stroke="currentColor" stroke-width="2"/>
    <path d="M26 14 L29 12 L29 20 L26 18" stroke="currentColor" stroke-width="1.5" fill="none"/>
  `,
  // Green
  newdelhi: `
    <path d="M10 28 L10 16 Q10 10 16 10 Q22 10 22 16 L22 28" stroke="currentColor" stroke-width="2.2" fill="none"/>
    <path d="M10 28 L22 28" stroke="currentColor" stroke-width="2.2"/>
    <path d="M8 28 L24 28" stroke="currentColor" stroke-width="2.2"/>
    <path d="M13 16 L19 16" stroke="currentColor" stroke-width="1.5"/>
    <line x1="16" y1="10" x2="16" y2="7" stroke="currentColor" stroke-width="2"/>
    <line x1="14" y1="7" x2="18" y2="7" stroke="currentColor" stroke-width="2"/>
    <line x1="6" y1="28" x2="26" y2="28" stroke="currentColor" stroke-width="1.5"/>
  `,
  navimumbai: `
    <path d="M4 24 Q16 8 28 24" stroke="currentColor" stroke-width="2.5" fill="none"/>
    <line x1="4" y1="24" x2="28" y2="24" stroke="currentColor" stroke-width="2"/>
    <line x1="12" y1="24" x2="14" y2="14" stroke="currentColor" stroke-width="1.2"/>
    <line x1="14" y1="24" x2="15" y2="13" stroke="currentColor" stroke-width="1.2"/>
    <line x1="18" y1="24" x2="17" y2="13" stroke="currentColor" stroke-width="1.2"/>
    <line x1="20" y1="24" x2="18" y2="14" stroke="currentColor" stroke-width="1.2"/>
    <line x1="4" y1="18" x2="4" y2="28" stroke="currentColor" stroke-width="2"/>
    <line x1="28" y1="18" x2="28" y2="28" stroke="currentColor" stroke-width="2"/>
  `,
  thane: `
    <path d="M16 26 Q10 20 10 14 Q10 10 16 10 Q22 10 22 14 Q22 20 16 26 Z" stroke="currentColor" stroke-width="1.8" fill="none"/>
    <path d="M16 10 Q8 6 6 12 Q10 16 16 14" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <path d="M16 10 Q24 6 26 12 Q22 16 16 14" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <line x1="16" y1="26" x2="16" y2="30" stroke="currentColor" stroke-width="2"/>
    <path d="M12 30 Q16 28 20 30" stroke="currentColor" stroke-width="1.5"/>
  `,
  // Dark Blue
  southmumbai: `
    <path d="M8 28 L8 14 Q8 6 16 6 Q24 6 24 14 L24 28" stroke="currentColor" stroke-width="2.2" fill="none"/>
    <path d="M12 28 L12 18 Q12 14 16 14 Q20 14 20 18 L20 28" stroke="currentColor" stroke-width="1.8" fill="none"/>
    <path d="M8 14 L12 14" stroke="currentColor" stroke-width="1.8"/>
    <path d="M20 14 L24 14" stroke="currentColor" stroke-width="1.8"/>
    <line x1="16" y1="6" x2="16" y2="3" stroke="currentColor" stroke-width="2"/>
    <path d="M14 3 L18 3" stroke="currentColor" stroke-width="2"/>
    <line x1="6" y1="28" x2="26" y2="28" stroke="currentColor" stroke-width="2.2"/>
  `,
  lutyensdelhi: `
    <line x1="6" y1="28" x2="6" y2="14" stroke="currentColor" stroke-width="2"/>
    <line x1="10" y1="28" x2="10" y2="14" stroke="currentColor" stroke-width="2"/>
    <line x1="14" y1="28" x2="14" y2="14" stroke="currentColor" stroke-width="2"/>
    <line x1="18" y1="28" x2="18" y2="14" stroke="currentColor" stroke-width="2"/>
    <line x1="22" y1="28" x2="22" y2="14" stroke="currentColor" stroke-width="2"/>
    <line x1="26" y1="28" x2="26" y2="14" stroke="currentColor" stroke-width="2"/>
    <line x1="4" y1="14" x2="28" y2="14" stroke="currentColor" stroke-width="2"/>
    <path d="M4 14 Q16 6 28 14" stroke="currentColor" stroke-width="2" fill="none"/>
    <line x1="4" y1="28" x2="28" y2="28" stroke="currentColor" stroke-width="2"/>
  `,
  // Railroads
  mumbailocal: `
    <rect x="3" y="10" width="26" height="14" stroke="currentColor" stroke-width="2" rx="3"/>
    <path d="M3 16 L29 16" stroke="currentColor" stroke-width="1.5"/><rect x="6" y="12" width="6" height="4" stroke="currentColor" stroke-width="1.3" rx="1"/>
    <rect x="14" y="12" width="6" height="4" stroke="currentColor" stroke-width="1.3" rx="1"/>
    <circle cx="9" cy="26" r="2.5" stroke="currentColor" stroke-width="1.8"/>
    <circle cx="23" cy="26" r="2.5" stroke="currentColor" stroke-width="1.8"/>
    <line x1="2" y1="29" x2="30" y2="29" stroke="currentColor" stroke-width="1.5"/>
  `,
  delhimetro: `
    <rect x="4" y="8" width="24" height="14" stroke="currentColor" stroke-width="2" rx="4"/>
    <path d="M4 14 L28 14" stroke="currentColor" stroke-width="1.5"/>
    <rect x="7" y="10" width="5" height="4" stroke="currentColor" stroke-width="1.3" rx="1"/>
    <rect x="20" y="10" width="5" height="4" stroke="currentColor" stroke-width="1.3" rx="1"/>
    <line x1="10" y1="22" x2="10" y2="28" stroke="currentColor" stroke-width="1.8"/>
    <line x1="22" y1="22" x2="22" y2="28" stroke="currentColor" stroke-width="1.8"/>
    <line x1="4" y1="28" x2="28" y2="28" stroke="currentColor" stroke-width="2"/>
  `,
  nammametro: `
    <rect x="5" y="6" width="22" height="12" stroke="currentColor" stroke-width="2" rx="3"/>
    <path d="M5 12 L27 12" stroke="currentColor" stroke-width="1.5"/>
    <rect x="8" y="8" width="5" height="4" stroke="currentColor" stroke-width="1.3" rx="1"/>
    <rect x="19" y="8" width="5" height="4" stroke="currentColor" stroke-width="1.3" rx="1"/>
    <path d="M8 18 L8 24 L4 28" stroke="currentColor" stroke-width="2"/>
    <path d="M24 18 L24 24 L28 28" stroke="currentColor" stroke-width="2"/>
    <line x1="2" y1="28" x2="30" y2="28" stroke="currentColor" stroke-width="2"/>
  `,
  howrahexpress: `
    <rect x="2" y="16" width="22" height="10" stroke="currentColor" stroke-width="2" rx="2"/>
    <circle cx="28" cy="20" r="4" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="M6 16 L6 10 Q6 8 12 8 L18 8 L18 16" stroke="currentColor" stroke-width="1.8" fill="none"/>
    <path d="M10 8 L10 4 Q12 2 14 4" stroke="currentColor" stroke-width="1.8"/>
    <circle cx="8"  cy="28" r="2.5" stroke="currentColor" stroke-width="1.8"/>
    <circle cx="18" cy="28" r="2.5" stroke="currentColor" stroke-width="1.8"/>
  `,
  // Utilities
  powergrid: `
    <line x1="16" y1="2" x2="16" y2="30" stroke="currentColor" stroke-width="1.5"/>
    <path d="M7 10 L16 14 L25 10" stroke="currentColor" stroke-width="1.8"/>
    <path d="M9 18 L16 22 L23 18" stroke="currentColor" stroke-width="1.8"/>
    <path d="M7 10 L9 18" stroke="currentColor" stroke-width="1.5"/>
    <path d="M25 10 L23 18" stroke="currentColor" stroke-width="1.5"/>
    <path d="M4 10 L8 10" stroke="currentColor" stroke-width="2"/>
    <path d="M24 10 L28 10" stroke="currentColor" stroke-width="2"/>
    <path d="M6 18 L10 18" stroke="currentColor" stroke-width="2"/>
    <path d="M22 18 L26 18" stroke="currentColor" stroke-width="2"/>
  `,
  waterworks: `
    <path d="M16 6 Q16 6 14 12 Q12 18 16 22 Q20 18 18 12 Q16 6 16 6 Z" stroke="currentColor" stroke-width="1.8" fill="none"/>
    <path d="M8 12 L24 12" stroke="currentColor" stroke-width="2"/>
    <rect x="13" y="12" width="6" height="5" stroke="currentColor" stroke-width="1.8" rx="1"/>
    <path d="M16 17 L16 22" stroke="currentColor" stroke-width="2"/>
    <path d="M13 22 Q16 28 19 22" stroke="currentColor" stroke-width="1.8" fill="none"/>
  `
};

// SVG templates for Action card icons (scaled/centered inside viewBox 0 0 24 24)
const ACTION_ICONS = {
  [ACTION_TYPES.DEAL_BREAKER]: `
    <g stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 15 L15 6 L18 9 L9 18 Z" />
      <path d="M15 15 L22 22" stroke-width="3" />
      <path d="M3 18 L9 24" />
      <path d="M12 3 L18 9" />
    </g>
  `,
  [ACTION_TYPES.DEBT_COLLECTOR]: `
    <g stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 22 L28 22" stroke-width="3" />
      <path d="M6 10 L6 22 M12 10 L12 22 M18 10 L18 22 M24 10 L24 22" />
      <path d="M4 10 L28 10 M16 3 L4 10 L28 10 Z" fill="currentColor" fill-opacity="0.1" />
    </g>
  `,
  [ACTION_TYPES.FORCED_DEAL]: `
    <g stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M7 8 L25 8 M25 8 L20 3 M25 8 L20 13" />
      <path d="M25 16 L7 16 M7 16 L12 11 M7 16 L12 21" />
    </g>
  `,
  [ACTION_TYPES.SLY_DEAL]: `
    <g stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M2 12 S6 4 16 4 S30 12 30 12 S26 20 16 20 S2 12 2 12 Z" />
      <circle cx="16" cy="12" r="5" fill="currentColor" fill-opacity="0.2" />
      <circle cx="16" cy="12" r="2" fill="currentColor" />
      <path d="M4 4 L28 20" stroke-width="2.5" stroke="#ED1C24" />
    </g>
  `,
  [ACTION_TYPES.PASS_GO]: `
    <g stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="16" cy="6" r="3" fill="currentColor" />
      <path d="M12 11 L16 13 L19 11 M16 13 L16 19 L13 25 M16 19 L19 25" />
      <path d="M9 13 Q12 17 16 17 M16 17 Q20 17 23 13" />
      <path d="M5 28 C10 25 22 25 27 28" />
    </g>
  `,
  [ACTION_TYPES.BIRTHDAY]: `
    <g stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <rect x="6" y="14" width="20" height="12" rx="2" fill="currentColor" fill-opacity="0.1" />
      <line x1="6" y1="19" x2="26" y2="19" />
      <line x1="11" y1="14" x2="11" y2="8" />
      <line x1="16" y1="14" x2="16" y2="8" />
      <line x1="21" y1="14" x2="21" y2="8" />
      <circle cx="11" cy="7" r="1" fill="#FEF200" stroke="none" />
      <circle cx="16" cy="7" r="1" fill="#FEF200" stroke="none" />
      <circle cx="21" cy="7" r="1" fill="#FEF200" stroke="none" />
    </g>
  `,
  [ACTION_TYPES.JUST_SAY_NO]: `
    <g stroke="#ED1C24" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="16" cy="12" r="9" />
      <line x1="9.64" y1="5.64" x2="22.36" y2="18.36" />
    </g>
  `,
  [ACTION_TYPES.DOUBLE_RENT]: `
    <g stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 20 L11 13 L17 17 L28 6 M28 6 L21 6 M28 6 L28 13" />
      <path d="M4 25 L28 25" stroke-width="1.5" />
    </g>
  `,
  [ACTION_TYPES.HOUSE]: `
    <g stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 12 L16 2 L29 12 Z" fill="currentColor" fill-opacity="0.1" />
      <rect x="6" y="12" width="20" height="13" />
      <rect x="13" y="16" width="6" height="9" />
    </g>
  `,
  [ACTION_TYPES.HOTEL]: `
    <g stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <rect x="8" y="3" width="16" height="24" rx="1" fill="currentColor" fill-opacity="0.1" />
      <rect x="11" y="6" width="3" height="4" />
      <rect x="18" y="6" width="3" height="4" />
      <rect x="11" y="13" width="3" height="4" />
      <rect x="18" y="13" width="3" height="4" />
      <rect x="13" y="21" width="6" height="6" />
    </g>
  `,
  [ACTION_TYPES.INSURANCE]: `
    <g stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 2 L3 6 V12 C3 17.5 7.5 21.5 12 22.5 C16.5 21.5 21 17.5 21 12 V6 Z" fill="currentColor" fill-opacity="0.1" />
    </g>
  `,
  [ACTION_TYPES.SABOTAGE]: `
    <g stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="8" cy="8" r="4" />
      <path d="M3 18 C3 15 5 13 8 13 C11 13 13 15 13 18" />
      <circle cx="24" cy="8" r="4" />
      <path d="M19 18 C19 15 21 13 24 13 C27 13 29 15 29 18" />
      <path d="M12 15 L20 15 M12 15 L14 13 M12 15 L14 17 M20 15 L18 13 M20 15 L18 17" stroke-width="1.5" />
    </g>
  `,
};

// Descriptive texts for actions in Hindi
const ACTION_DESCRIPTIONS = {
  [ACTION_TYPES.DEAL_BREAKER]: 'Kisi player ka complete set chura lo (Ghar/Hotel ke saath)',
  [ACTION_TYPES.DEBT_COLLECTOR]: 'Kisi bhi ek player se ₹5Cr collect karo',
  [ACTION_TYPES.FORCED_DEAL]: 'Apni ek property dekar kisi ki property swap karo',
  [ACTION_TYPES.SLY_DEAL]: 'Kisi player ki ek property chura lo (set se nahi)',
  [ACTION_TYPES.PASS_GO]: 'Deck se 2 extra cards draw karo',
  [ACTION_TYPES.BIRTHDAY]: 'Sabhi players se ₹2Cr birthday gift collect karo',
  [ACTION_TYPES.JUST_SAY_NO]: 'Kisi bhi player ke action card ko cancel karo',
  [ACTION_TYPES.DOUBLE_RENT]: 'Apne isi turn mein khele rent card ka value double karo',
  [ACTION_TYPES.HOUSE]: 'Apne kisi bhi complete property set par rent badhane ke liye lagao',
  [ACTION_TYPES.HOTEL]: 'Ghar lage hue complete set par lagakar rent maximum karo',
  [ACTION_TYPES.INSURANCE]: 'Deal Breaker action se apne set ko secure karo',
  [ACTION_TYPES.SABOTAGE]: 'Do players ke beech force trade karwao',
};

// Generate SVG string for Property Card
function generatePropertySvg(card) {
  const display = COLOR_DISPLAY[card.color] || { hex: '#955436' };
  const set = PROPERTY_SETS[card.color] || { rentValues: [1, 2], cardsNeeded: 2 };
  const rentValues = set.rentValues;
  const cardsNeeded = set.cardsNeeded;
  const textOnBand = getTextColor(display.hex);
  const landmarkPath = LANDMARK_PATHS[card.landmark] || '';

  // Rent rows rendering
  let rentRowsY = 240;
  let rentRowsSvg = '';
  rentValues.forEach((rent, idx) => {
    const isSet = idx + 1 === cardsNeeded;
    const isBold = isSet;
    const label = `${idx + 1}${isSet ? ' (set)' : ''}`;
    const fill = isSet ? display.hex : '#333333';
    const weight = isBold ? '800' : '500';

    rentRowsSvg += `
      <text x="40" y="${rentRowsY}" font-family="system-ui, sans-serif" font-size="18px" font-weight="${weight}" fill="${fill}">${label}</text>
      <text x="210" y="${rentRowsY}" font-family="system-ui, sans-serif" font-size="20px" font-weight="900" text-anchor="end" fill="${display.hex}">₹${rent}Cr</text>
    `;
    rentRowsY += 30;
  });

  const houseHotelInfo = set.houseBonus > 0
    ? `<text x="210" y="555" font-family="system-ui, sans-serif" font-size="14px" font-weight="800" fill="#666666" text-anchor="middle">Ghar: +₹${set.houseBonus}Cr  |  Hotel: +₹${set.hotelBonus}Cr</text>`
    : '';

  return `
    <svg width="420" height="610" viewBox="0 0 420 610" xmlns="http://www.w3.org/2000/svg">
      <!-- Card background & border -->
      <rect x="0" y="0" width="420" height="610" rx="24" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2" />
      <rect x="10" y="10" width="400" height="590" rx="16" fill="none" stroke="${display.hex}" stroke-opacity="0.1" stroke-width="3" />

      <!-- Color Header Bar -->
      <rect x="15" y="15" width="390" height="110" rx="10" fill="${display.hex}" />
      <text x="210" y="78" font-family="system-ui, sans-serif" font-size="26px" font-weight="900" fill="${textOnBand}" text-anchor="middle" letter-spacing="1px">${card.name.toUpperCase()}</text>

      <!-- Bank Value Corner Circle -->
      <circle cx="48" cy="48" r="22" fill="#FFFFFF" stroke="${display.hex}" stroke-width="3" />
      <text x="48" y="53" font-family="system-ui, sans-serif" font-size="15px" font-weight="900" fill="${display.hex}" text-anchor="middle">₹${card.value}</text>

      <!-- Rent Label -->
      <text x="40" y="200" font-family="system-ui, sans-serif" font-size="14px" font-weight="800" fill="#888888" letter-spacing="2px">RENT</text>
      <line x1="40" y1="210" x2="380" y2="210" stroke="#E0E0E0" stroke-width="1.5" />

      <!-- Rent Values Ladder -->
      ${rentRowsSvg}

      <!-- Landmark Illustration -->
      <g transform="translate(250, 240) scale(4)" stroke="${display.hex}" stroke-width="1.8" fill="none" color="${display.hex}">
        ${landmarkPath}
      </g>

      <!-- Bottom cost details -->
      <line x1="40" y1="520" x2="380" y2="520" stroke="#E0E0E0" stroke-width="1.5" />
      ${houseHotelInfo}
    </svg>
  `;
}

// Generate SVG string for Money Card
function generateMoneySvg(card) {
  return `
    <svg width="420" height="610" viewBox="0 0 420 610" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="moneyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1B5E20" />
          <stop offset="50%" stop-color="#2E7D32" />
          <stop offset="100%" stop-color="#43A047" />
        </linearGradient>
      </defs>

      <!-- Card Background -->
      <rect x="0" y="0" width="420" height="610" rx="24" fill="url(#moneyGrad)" stroke="#1B5E20" stroke-width="2" />

      <!-- White Inner Border -->
      <rect x="15" y="15" width="390" height="580" rx="14" fill="none" stroke="#FFFFFF" stroke-opacity="0.3" stroke-width="2" />

      <!-- Decorative Rupee Watermarks in corners -->
      <text x="45" y="65" font-family="system-ui, sans-serif" font-size="20px" font-weight="900" fill="#FFFFFF" fill-opacity="0.6" text-anchor="middle">₹${card.value}Cr</text>
      <text x="375" y="575" font-family="system-ui, sans-serif" font-size="20px" font-weight="900" fill="#FFFFFF" fill-opacity="0.6" text-anchor="middle">₹${card.value}Cr</text>

      <!-- Big Centered Value -->
      <text x="210" y="310" font-family="system-ui, sans-serif" font-size="76px" font-weight="900" fill="#FFFFFF" text-anchor="middle" filter="drop-shadow(0px 4px 8px rgba(0,0,0,0.3))">₹${card.value}Cr</text>
      
      <!-- Label below value -->
      <text x="210" y="360" font-family="system-ui, sans-serif" font-size="18px" font-weight="700" fill="#FFFFFF" fill-opacity="0.8" text-anchor="middle" letter-spacing="4px">MONEY</text>

      <!-- Giant elegant watermark circle in center -->
      <circle cx="210" cy="310" r="130" fill="none" stroke="#FFFFFF" stroke-opacity="0.1" stroke-width="4" />
    </svg>
  `;
}

// Generate SVG string for Action Card
function generateActionSvg(card) {
  const IconSvg = ACTION_ICONS[card.actionType] || '';
  const descText = ACTION_DESCRIPTIONS[card.actionType] || '';

  // Determine background gradient colors
  let bgGradStart = '#1A237E';
  let bgGradEnd = '#283593';
  let topLabel = 'ACTION CARD';

  if (card.actionType === ACTION_TYPES.INSURANCE) {
    bgGradStart = '#004D40';
    bgGradEnd = '#00796B';
    topLabel = 'CUSTOM ACTION CARD';
  } else if (card.actionType === ACTION_TYPES.SABOTAGE) {
    bgGradStart = '#4A148C';
    bgGradEnd = '#7B1FA2';
    topLabel = 'CUSTOM ACTION CARD';
  }

  // Red accent border for Just Say No
  const borderStroke = card.actionType === ACTION_TYPES.JUST_SAY_NO ? '#ED1C24' : 'none';
  const borderStrokeWidth = card.actionType === ACTION_TYPES.JUST_SAY_NO ? '4' : '0';

  return `
    <svg width="420" height="610" viewBox="0 0 420 610" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="actionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${bgGradStart}" />
          <stop offset="100%" stop-color="${bgGradEnd}" />
        </linearGradient>
      </defs>

      <!-- Card Background -->
      <rect x="0" y="0" width="420" height="610" rx="24" fill="url(#actionGrad)" stroke="#1A237E" stroke-width="2" />
      
      <!-- Inset Border -->
      <rect x="15" y="15" width="390" height="580" rx="14" fill="none" stroke="#FFFFFF" stroke-opacity="0.3" stroke-width="2" />
      
      <!-- Top Action Label -->
      <text x="210" y="55" font-family="system-ui, sans-serif" font-size="12px" font-weight="800" fill="#FFFFFF" fill-opacity="0.7" text-anchor="middle" letter-spacing="3px">${topLabel}</text>

      <!-- Action Title -->
      <text x="210" y="110" font-family="system-ui, sans-serif" font-size="34px" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="0.5px">${card.name.toUpperCase()}</text>

      <!-- Corner Cash Value Circle -->
      <circle cx="52" cy="52" r="22" fill="#FFFFFF" stroke="${card.actionType === ACTION_TYPES.JUST_SAY_NO ? '#ED1C24' : '#1A237E'}" stroke-width="3" />
      <text x="52" y="57" font-family="system-ui, sans-serif" font-size="14px" font-weight="900" fill="${card.actionType === ACTION_TYPES.JUST_SAY_NO ? '#ED1C24' : '#1A237E'}" text-anchor="middle">₹${card.value}Cr</text>

      <!-- Large Center Icon / Illustration -->
      <g transform="translate(135, 170) scale(6)" stroke="#FFFFFF" fill="none" color="#FFFFFF" stroke-width="1">
        ${IconSvg}
      </g>

      <!-- Action Description text in Hindi -->
      <rect x="40" y="450" width="340" height="90" rx="8" fill="#FFFFFF" fill-opacity="0.08" stroke="#FFFFFF" stroke-opacity="0.1" stroke-width="1" />
      <foreignObject x="50" y="465" width="320" height="70">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: system-ui, sans-serif; font-size: 14px; font-weight: 600; color: #FFFFFF; text-align: center; line-height: 1.45;">
          ${descText}
        </div>
      </foreignObject>
    </svg>
  `;
}

// Generate SVG string for Rent Card
function generateRentSvg(card) {
  if (card.wild) {
    return `
      <svg width="420" height="610" viewBox="0 0 420 610" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="rentWildGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#1B5E20" />
            <stop offset="100%" stop-color="#2E7D32" />
          </linearGradient>
        </defs>
        <!-- Background -->
        <rect x="0" y="0" width="420" height="610" rx="24" fill="url(#rentWildGrad)" stroke="#1B5E20" stroke-width="2" />
        <rect x="15" y="15" width="390" height="580" rx="14" fill="none" stroke="#FFFFFF" stroke-opacity="0.3" stroke-width="2" />
        
        <!-- Corner Cash Value Circle -->
        <circle cx="52" cy="52" r="22" fill="#FFFFFF" stroke="#1B5E20" stroke-width="3" />
        <text x="52" y="57" font-family="system-ui, sans-serif" font-size="14px" font-weight="900" fill="#1B5E20" text-anchor="middle">₹${card.value}Cr</text>

        <!-- Big Rupee Circle -->
        <circle cx="210" cy="260" r="55" fill="#FFFFFF" stroke="#1B5E20" stroke-width="4" filter="drop-shadow(0 4px 8px rgba(0,0,0,0.3))" />
        <text x="210" y="278" font-family="system-ui, sans-serif" font-size="56px" font-weight="900" fill="#1B5E20" text-anchor="middle">₹</text>

        <!-- Titles -->
        <text x="210" y="420" font-family="system-ui, sans-serif" font-size="36px" font-weight="900" fill="#FFFFFF" text-anchor="middle">WILD RENT</text>
        <text x="210" y="460" font-family="system-ui, sans-serif" font-size="18px" font-weight="700" fill="#FFFFFF" fill-opacity="0.8" text-anchor="middle">KISI SE BHI RENT LO</text>
      </svg>
    `;
  }

  const colors = (card.colors || []).map(c => COLOR_DISPLAY[c]?.hex || '#888888');
  
  // Render diagonal split background
  return `
    <svg width="420" height="610" viewBox="0 0 420 610" xmlns="http://www.w3.org/2000/svg">
      <!-- Background splits -->
      <rect x="0" y="0" width="420" height="610" rx="24" fill="${colors[0]}" stroke="#E0E0E0" stroke-width="2" />
      <polygon points="0,610 420,610 420,0" fill="${colors[1]}" />

      <!-- Inset Border -->
      <rect x="15" y="15" width="390" height="580" rx="14" fill="none" stroke="#FFFFFF" stroke-opacity="0.4" stroke-width="2" />

      <!-- Corner Cash Value Circle -->
      <circle cx="52" cy="52" r="22" fill="#FFFFFF" stroke="#333333" stroke-width="2" />
      <text x="52" y="57" font-family="system-ui, sans-serif" font-size="14px" font-weight="900" fill="#333333" text-anchor="middle">₹${card.value}Cr</text>

      <!-- Rupee Badge in center -->
      <circle cx="210" cy="260" r="50" fill="#FFFFFF" stroke="#333333" stroke-width="3" filter="drop-shadow(0 4px 8px rgba(0,0,0,0.35))" />
      <text x="210" y="278" font-family="system-ui, sans-serif" font-size="52px" font-weight="900" fill="#333333" text-anchor="middle">₹</text>

      <!-- Card Title -->
      <rect x="40" y="410" width="340" height="90" rx="10" fill="#000000" fill-opacity="0.6" />
      <text x="210" y="448" font-family="system-ui, sans-serif" font-size="15px" font-weight="800" fill="#FFFFFF" text-anchor="middle" letter-spacing="1px">RENT CARD</text>
      <text x="210" y="478" font-family="system-ui, sans-serif" font-size="18px" font-weight="900" fill="#FFFFFF" text-anchor="middle">${card.name.replace('Rent: ', '').toUpperCase()}</text>
    </svg>
  `;
}

// Generate SVG string for Wild Card
function generateWildPropertySvg(card) {
  const isFullWild = card.colors?.[0] === 'wild';
  
  if (isFullWild) {
    return `
      <svg width="420" height="610" viewBox="0 0 420 610" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="rainbowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FF6B6B" />
            <stop offset="25%" stop-color="#FFE66D" />
            <stop offset="50%" stop-color="#4ECDC4" />
            <stop offset="75%" stop-color="#45B7D1" />
            <stop offset="100%" stop-color="#A855F7" />
          </linearGradient>
        </defs>
        
        <!-- Rainbow background -->
        <rect x="0" y="0" width="420" height="610" rx="24" fill="url(#rainbowGrad)" stroke="#A855F7" stroke-width="2" />
        <rect x="15" y="15" width="390" height="580" rx="14" fill="none" stroke="#FFFFFF" stroke-opacity="0.4" stroke-width="2" />
        
        <!-- Big text centered -->
        <text x="210" y="290" font-family="system-ui, sans-serif" font-size="64px" font-weight="900" fill="#FFFFFF" text-anchor="middle" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.5))">WILD</text>
        <text x="210" y="340" font-family="system-ui, sans-serif" font-size="20px" font-weight="800" fill="#FFFFFF" text-anchor="middle" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.5))">KISI BHI COLOR MEIN</text>
        
        <!-- Bottom explanation -->
        <text x="210" y="550" font-family="system-ui, sans-serif" font-size="14px" font-weight="800" fill="#FFFFFF" text-anchor="middle" fill-opacity="0.8">PROPERTY WILD CARD</text>
      </svg>
    `;
  }

  const colors = (card.colors || []).map(c => COLOR_DISPLAY[c]?.hex || '#888888');

  return `
    <svg width="420" height="610" viewBox="0 0 420 610" xmlns="http://www.w3.org/2000/svg">
      <!-- Background splits -->
      <rect x="0" y="0" width="420" height="610" rx="24" fill="${colors[0]}" stroke="#E0E0E0" stroke-width="2" />
      <polygon points="0,610 420,610 420,0" fill="${colors[1]}" />

      <!-- Inset Border -->
      <rect x="15" y="15" width="390" height="580" rx="14" fill="none" stroke="#FFFFFF" stroke-opacity="0.4" stroke-width="2" />

      <!-- Corner Cash Value Circle -->
      <circle cx="52" cy="52" r="22" fill="#FFFFFF" stroke="#333333" stroke-width="2" />
      <text x="52" y="57" font-family="system-ui, sans-serif" font-size="14px" font-weight="900" fill="#333333" text-anchor="middle">₹${card.value}Cr</text>

      <!-- Center text box -->
      <rect x="40" y="250" width="340" height="120" rx="10" fill="#000000" fill-opacity="0.6" />
      <text x="210" y="295" font-family="system-ui, sans-serif" font-size="32px" font-weight="900" fill="#FFFFFF" text-anchor="middle">WILD</text>
      <text x="210" y="335" font-family="system-ui, sans-serif" font-size="15px" font-weight="700" fill="#FFFFFF" text-anchor="middle" fill-opacity="0.9">${card.name.replace('Wild: ', '').toUpperCase()}</text>
    </svg>
  `;
}

// Helper to determine text readability color on background color
function getTextColor(hexBg) {
  if (!hexBg) return '#ffffff';
  const hex = hexBg.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? '#000000' : '#ffffff';
}

// Generate the specific card file
async function generateCardFile(card) {
  let svgString = '';
  let filename = '';

  if (card.type === CARD_TYPES.PROPERTY) {
    svgString = generatePropertySvg(card);
    filename = `prop-${card.color}-${card.landmark}.png`;
  } else if (card.type === CARD_TYPES.MONEY) {
    svgString = generateMoneySvg(card);
    filename = `money-${card.value}cr.png`;
  } else if (card.type === CARD_TYPES.ACTION) {
    svgString = generateActionSvg(card);
    filename = `action-${card.actionType}.png`;
  } else if (card.type === CARD_TYPES.RENT) {
    svgString = generateRentSvg(card);
    filename = card.wild ? 'rent-wild.png' : `rent-${card.colors[0]}-${card.colors[1]}.png`;
  } else if (card.type === CARD_TYPES.WILD_PROPERTY) {
    svgString = generateWildPropertySvg(card);
    filename = card.colors[0] === 'wild' ? 'wild-rainbow.png' : `wild-${card.colors.join('-')}.png`;
  }

  if (!svgString || !filename) return;

  const buffer = Buffer.from(svgString);
  const outputPath = path.join(CARDS_DIR, filename);

  try {
    await sharp(buffer)
      .png()
      .toFile(outputPath);
    console.log(`Generated: ${filename}`);
  } catch (err) {
    console.error(`Failed to generate ${filename}:`, err);
  }
}

// Main execution block to build unique cards
async function run() {
  console.log('Generating unique cards...');
  
  // Create a deck containing all card definitions (enable custom cards to generate Insurance & Sabotage)
  const deck = createDeck(true, 4);
  const uniqueCardKeys = new Set();
  const uniqueCards = [];

  // Filter out identical duplicate cards (e.g. 10 Pass Go action cards only need 1 image file generated)
  for (const card of deck) {
    let uniqueKey = '';
    if (card.type === CARD_TYPES.PROPERTY) {
      uniqueKey = `prop-${card.color}-${card.landmark}`;
    } else if (card.type === CARD_TYPES.MONEY) {
      uniqueKey = `money-${card.value}cr`;
    } else if (card.type === CARD_TYPES.ACTION) {
      uniqueKey = `action-${card.actionType}`;
    } else if (card.type === CARD_TYPES.RENT) {
      uniqueKey = card.wild ? 'rent-wild' : `rent-${card.colors[0]}-${card.colors[1]}`;
    } else if (card.type === CARD_TYPES.WILD_PROPERTY) {
      uniqueKey = card.colors[0] === 'wild' ? 'wild-rainbow' : `wild-${card.colors.join('-')}`;
    }

    if (uniqueKey && !uniqueCardKeys.has(uniqueKey)) {
      uniqueCardKeys.add(uniqueKey);
      uniqueCards.push(card);
    }
  }

  // Generate all unique images
  for (const card of uniqueCards) {
    await generateCardFile(card);
  }

  console.log(`Successfully generated ${uniqueCards.length} unique cards in public/images/cards/`);
}

run();
