import {
  Accordion, AccordionDetails, AccordionSummary, Box, Button,
  Typography,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import GroupsIcon from '@mui/icons-material/Groups'
import LanguageIcon from '@mui/icons-material/Language'
import WifiIcon from '@mui/icons-material/Wifi'
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import CardsIcon from '@mui/icons-material/Style'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import PeopleIcon from '@mui/icons-material/People'
import CasinoIcon from '@mui/icons-material/Casino'

import brownImg from '/images/cards/generated/prop-brown-indore.png'
import lightBlueImg from '/images/cards/generated/prop-lightBlue-chandigarh.png'
import redImg from '/images/cards/generated/prop-red-bengaluru.png'
import greenImg from '/images/cards/generated/prop-green-newdelhi.png'
import darkBlueImg from '/images/cards/generated/prop-darkBlue-southmumbai.png'
import logoImg from '/images/monopoly-deal-indian-logo.png'

const CARD_IMAGES = [
  { img: brownImg, rot: -16, y: 4, z: 1 },
  { img: lightBlueImg, rot: -8, y: 0, z: 2 },
  { img: redImg, rot: 0, y: -6, z: 3 },
  { img: greenImg, rot: 8, y: 0, z: 2 },
  { img: darkBlueImg, rot: 16, y: 4, z: 1 },
]

const FEATURES = [
  { icon: <AccountBalanceIcon />, title: 'Indian Cities', desc: 'Properties from Indore to South Mumbai' },
  { icon: <PeopleIcon />, title: '2–6 Players', desc: 'Family aur friends ke saath khelo' },
  { icon: <GroupsIcon />, title: 'Pass & Play', desc: 'Ek hi phone pe sab saath' },
  { icon: <LanguageIcon />, title: 'Online Khelo', desc: 'Internet ke saath remote players' },
  { icon: <CasinoIcon />, title: 'Custom Cards', desc: 'Sabotage, Insurance, extended JSN' },
  { icon: <CardsIcon />, title: '110 Cards', desc: 'Full deck with Indian flavour' },
]

const GAME_MODES = [
  { icon: <GroupsIcon />, key: 'passplay', title: 'Pass & Play', desc: 'Ek hi phone pe, ek saath', color: '#E65100' },
  { icon: <LanguageIcon />, key: 'online', title: 'Online Khelo', desc: 'Internet pe remote khelo', color: '#1565C0' },
  { icon: <WifiIcon />, key: 'hotspot', title: 'Hotspot Khelo', desc: 'Local network, no internet', color: '#2E7D32' },
  { icon: <PhoneIphoneIcon />, key: 'offline', title: 'Offline Khelo', desc: 'WebRTC direct connection', color: '#6A1B9A' },
]

const HOW_TO_PLAY = [
  { step: 1, title: 'Draw 2 Cards', desc: 'Har turn mein 2 cards draw karo apne haath mein' },
  { step: 2, title: 'Play Up to 3 Cards', desc: 'Property banao, money bank karo, ya action khelo' },
  { step: 3, title: 'Build Property Sets', desc: 'Ek hi colour ki 2-4 properties ikatthi karo' },
  { step: 4, title: 'Win!', desc: 'Sabse pehle 3 complete sets — tu jeet gaya!' },
]

const RULE_SECTIONS = [
  {
    title: 'Gameplay Basics',
    icon: <EmojiEventsIcon />,
    rules: [
      'Har player ko 5 cards milte hain shuru mein. Har turn mein 2 cards draw karo.',
      '3 cards tak play kar sakte ho per turn (property, money, ya action).',
      'Apni turn ke end mein 7 se zyada cards nahi rakh sakte — extra discard karo.',
      'Sabse pehle 3 complete property sets — winner!',
      'Agar draw pile khatam ho jaye, to discard pile ko shuffle karke naya draw pile banao.',
    ],
  },
  {
    title: 'Cards & Deck (110 Cards)',
    icon: <CardsIcon />,
    rules: [
      '28 Property Cards — 10 colour sets (Brown se Dark Blue, Railroads, Utilities)',
      '11 Property Wildcards — do rang ya multi-color wild property cards',
      '34 Action Cards — Deal Breaker, Sly Deal, Forced Deal, Pass Go, Debt Collector, Birthday, House, Hotel, Double Rent, Just Say No',
      '13 Rent Cards — do-rang aur wild rent cards',
      '20 Money Cards — ₹1Cr se ₹10Cr tak',
      'Custom cards (optional): Sabotage (force trade) + Insurance (block Deal Breaker)',
    ],
  },
  {
    title: 'Payment & Rent Rules',
    icon: <SwapHorizIcon />,
    rules: [
      'Rent charge karte waqt sirf ek colour choose karo. Wild rent = ek player ko charge. Dual rent = sabko charge.',
      'Payment tum khud decide karo — bank, property, action cards, ya houses/hotels se pay kar sakte ho.',
      'Exact amount nahi hai to jo hai do — change nahi milta!',
      'Haath se pay nahi kar sakte — sirf table par rakhi cards se pay karo.',
      'Property se pay kiya to woh opponent ke property section mein jayegi.',
    ],
  },
  {
    title: 'Action Cards',
    icon: <CasinoIcon />,
    rules: [
      'Deal Breaker (2) — kisi ka bhi complete set le lo (house/hotel ke saath)',
      'Sly Deal (3) — kisi biki hui property le lo (complete set se nahi)',
      'Forced Deal (3) — apni koi property dekar unki koi property le lo',
      'Debt Collector (3) — kisi ek se ₹3M collect karo',
      "It's My Birthday (3) — sabse ₹2M collect karo",
      'Pass Go (10) — 2 extra cards draw karo',
      'House (3) / Hotel (3) — complete set par lagao, rent badhao',
      'Double Rent (2) — agle rent card ka double karo',
      'Just Say No (3) — kisi bhi action ko cancel karo (counter bhi kar sakte ho)',
    ],
  },
  {
    title: 'Houses & Hotels',
    icon: <AccountBalanceIcon />,
    rules: [
      'House sirf complete set par lagao. Hotel sirf wahan jahan pehle se house ho.',
      'House rent mein +₹3-4M aur hotel +₹4-5M extra deta hai (set ke hisaab se).',
      'Railroad aur Utility par house/hotel nahi lag sakta.',
      'Deal Breaker se set lekar house/hotel bhi le jaao.',
    ],
  },
]

const STRATEGIES = [
  {
    title: 'Money & Bank Strategies',
    tips: [
      'Pehle bank banao, phir property — bina bank ke property karna matlab birthday/rent se sab chala jayega.',
      'Ek saath 3 punch maaro — teen Debt Collector ya teen Birthday ek turn mein khelo, bada dhamaka!',
      'Chhote notes rakho — "No Change" rule hai, 1M ke bill se 5M nahi milte.',
      'Apna bank chhupa kar rakho — ek hi pile mein rakho taki opponents ko pata na chale kitna hai.',
    ],
  },
  {
    title: 'Property Protection',
    tips: [
      'Complete set tabhi banao jab Just Say No ho haath mein — warna Deal Breaker ka risk!',
      'Voltron strategy — properties alag rakho, last moment par jod ke jeeto.',
      'Double wildcards chhupao — dual-color wildcard ko niche rakh do taki valuable side dikhe nahi.',
      'Railroad ko aage rakho — kam valuable cheezein dikhao, valuable chhupao.',
    ],
  },
  {
    title: 'Deal Breaker Tactics',
    tips: [
      'Tabhi Deal Breaker khelo jab opponent ke haath mein koi card na ho — tab JSN nahi khel payega.',
      'Pehle kisi aur ko set complete karne do, phir Deal Breaker se le lo.',
      'JSN ke saath pair karo — Deal Breaker + JSN = guaranteed steal.',
      'Agar Deal Breaker kaam ka nahi hai to bank mein daal do — 5M hai value.',
    ],
  },
  {
    title: 'Mental Game',
    tips: [
      'Dikhava karo ki JSN hai haath mein — ek card alag rakh do, opponents hesitate karenge.',
      'Dhancha banana — pehle Sly Deal khelo taaki JSN nikle, phir Deal Breaker se asli maal le lo.',
      'Yaad rakho — 2 Deal Breaker hain aur 3 JSN. Track karo kaun kahan hai.',
    ],
  },
]

function HeroSection({ onPlay }) {
  return (
    <Box sx={{
      background: 'linear-gradient(170deg, #E65100 0%, #F57C00 35%, #FFF3E0 85%, #FFF8F0 100%)',
      pt: 5, pb: 3, px: 2.5,
      borderBottomLeftRadius: '20px', borderBottomRightRadius: '20px',
      position: 'relative', overflow: 'hidden',
    }}>
      <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.75 }}>
        <Box sx={{
          width: 130, height: 130, borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 10px 35px rgba(230,81,0,0.4), 0 0 0 3px rgba(255,255,255,0.7)',
          transition: 'transform 0.2s ease',
          '&:hover': { transform: 'scale(1.04)' },
        }}>
          <img src={logoImg} alt="Dhandha Logo"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </Box>
        <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.5px', color: '#3E2723', textAlign: 'center' }}>
          Dhandha
        </Typography>
        <Typography variant="body1" sx={{ color: '#5D4037', fontWeight: 600, textAlign: 'center', maxWidth: 260 }}>
          The Indian Property Card Game
        </Typography>

        <Box sx={{ position: 'relative', width: '100%', height: 150, my: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ position: 'relative', width: 300, height: 148 }}>
            {CARD_IMAGES.map((card, i) => (
              <Box key={i} sx={{
                position: 'absolute', left: '50%', top: '50%',
                transform: `translate(-50%, -50%) translateX(${(i - 2) * 44}px) translateY(${card.y}px) rotate(${card.rot}deg)`,
                zIndex: card.z,
                width: 82, height: 114,
                borderRadius: '6px', overflow: 'hidden',
                boxShadow: card.z === 3
                  ? '0 12px 28px rgba(0,0,0,0.3), 0 0 0 2px rgba(255,255,255,0.6)'
                  : '0 4px 12px rgba(0,0,0,0.18)',
                transition: 'transform 0.2s ease',
                flexShrink: 0,
              }}>
                <img src={card.img} alt={`Property card ${i}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </Box>
            ))}
          </Box>
        </Box>

        <Box sx={{ textAlign: 'center', mb: 0.5 }}>
          <Typography variant="body2" sx={{ color: '#5D4037', fontWeight: 600 }}>
            2–6 Players · Pass &amp; Play ya Online
          </Typography>
          <Typography variant="caption" sx={{ color: '#795548', fontWeight: 500 }}>
            3 complete property sets jitao!
          </Typography>
        </Box>

        <Button
          variant="contained"
          size="large"
          onClick={onPlay}
          fullWidth
          sx={{
            borderRadius: '10px', py: 1.5, fontSize: '1.05rem', fontWeight: 800,
            boxShadow: '0 6px 18px rgba(230,81,0,0.4)',
            maxWidth: 320,
            backgroundColor: '#E65100',
            '&:hover': { backgroundColor: '#BF360C', boxShadow: '0 8px 24px rgba(230,81,0,0.5)' },
          }}
        >
          Khelo Shuru Karo!
        </Button>
      </Box>
    </Box>
  )
}

function GameModesSection({ onPlay, onMultiplayer, onLocalMultiplayer, onOfflineMultiplayer }) {
  const modeHandlers = {
    passplay: onPlay,
    online: onMultiplayer,
    hotspot: onLocalMultiplayer,
    offline: onOfflineMultiplayer,
  }

  return (
    <Box sx={{ px: 2.5, mt: -1 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', mb: 1.5, px: 0.5, letterSpacing: '0.02em' }}>
        Choose Your Mode
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
        {GAME_MODES.map((mode) => (
          <Box
            key={mode.key}
            onClick={modeHandlers[mode.key]}
            sx={{
              backgroundColor: '#fff', borderRadius: '12px', p: 1.5,
              display: 'flex', flexDirection: 'column', gap: 0.5,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: '1.5px solid',
              borderColor: 'rgba(0,0,0,0.06)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              '&:hover': {
                borderColor: mode.color,
                boxShadow: `0 4px 12px ${mode.color}20`,
                transform: 'translateY(-1px)',
              },
            }}
          >
            <Box sx={{
              width: 36, height: 36, borderRadius: '8px',
              backgroundColor: `${mode.color}12`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: mode.color,
              '& .MuiSvgIcon-root': { fontSize: 20 },
            }}>
              {mode.icon}
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary' }}>
              {mode.title}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.3 }}>
              {mode.desc}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

function AboutSection() {
  return (
    <Box sx={{ px: 2.5 }}>
      <Box sx={{
        backgroundColor: '#fff', borderRadius: '14px', p: 2.5,
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
      }}>
        <Typography variant="h6" sx={{ fontWeight: 900, mb: 1, color: 'text.primary' }}>
          What is Dhandha?
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6, mb: 2 }}>
          Dhandha is a fast-paced digital adaptation of the classic Monopoly Deal card game,
          reimagined with <b>Indian cities</b> (Indore, Bengaluru, South Mumbai, and more) and <b>desi flair</b>.
          Build property sets, charge rent, steal from opponents, and be the first to complete 3 full sets.
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6, mb: 2.5 }}>
          2 se 6 players ke saath khelo — ek hi phone par pass-and-play, ya Internet ke through remote players ke saath.
          Custom cards include <b>Sabotage</b> (force trade) and <b>Insurance</b> (block Deal Breaker).
        </Typography>

        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', mb: 1.5, letterSpacing: '0.02em' }}>
          Why You'll Love It
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
          {FEATURES.map((f, i) => (
            <Box key={i} sx={{
              display: 'flex', gap: 1.25, alignItems: 'flex-start',
              p: 1.25, borderRadius: '10px',
              backgroundColor: 'rgba(230,81,0,0.04)',
              border: '1px solid rgba(230,81,0,0.1)',
            }}>
              <Box sx={{
                color: '#E65100', mt: 0.25, flexShrink: 0,
                '& .MuiSvgIcon-root': { fontSize: 18 },
              }}>
                {f.icon}
              </Box>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.primary', display: 'block' }}>
                  {f.title}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.62rem' }}>
                  {f.desc}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  )
}

function HowToPlaySection() {
  return (
    <Box sx={{ px: 2.5 }}>
      <Box sx={{
        borderRadius: '14px', overflow: 'hidden',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
      }}>
        <Box sx={{
          background: 'linear-gradient(135deg, #3E2723, #5D4037)',
          px: 2.5, py: 2,
        }}>
          <Typography variant="h6" sx={{ fontWeight: 900, color: '#fff', mb: 0.25 }}>
            How to Play
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Sirf 4 steps mein seekho
          </Typography>
        </Box>
        <Box sx={{ px: 2.5, py: 2, backgroundColor: '#fff' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {HOW_TO_PLAY.map((item) => (
              <Box key={item.step} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                <Box sx={{
                  width: 32, height: 32, borderRadius: '50%',
                  backgroundColor: '#E65100', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 900, fontSize: '0.85rem', flexShrink: 0,
                }}>
                  {item.step}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary' }}>
                    {item.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {item.desc}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>

          <Box sx={{
            mt: 2.5, p: 1.5, borderRadius: '10px',
            backgroundColor: 'rgba(230,81,0,0.05)',
            border: '1px solid rgba(230,81,0,0.12)',
            textAlign: 'center',
          }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              🏆 <b>Win Condition:</b> Sabse pehle 3 complete property sets — you win!
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

function AccordionSection({ title, sections, defaultExpanded }) {
  return (
    <Box sx={{ px: 2.5 }}>
      <Box sx={{ backgroundColor: '#fff', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <Box sx={{
          px: 2.5, py: 2, borderBottom: '1px solid',
          borderColor: 'divider',
        }}>
          <Typography variant="h6" sx={{ fontWeight: 900 }}>
            {title}
          </Typography>
        </Box>
        {sections.map((section, i) => (
          <Accordion
            key={i}
            defaultExpanded={defaultExpanded && i === 0}
            disableGutters
            elevation={0}
            sx={{
              '&:before': { display: 'none' },
              borderBottom: i < sections.length - 1 ? '1px solid' : 'none',
              borderColor: 'divider',
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ px: 2.5, py: 0.5, '& .MuiAccordionSummary-content': { gap: 1 }, minHeight: 44 }}
            >
              <Box sx={{ color: '#E65100', display: 'flex', alignItems: 'center' }}>
                {section.icon}
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>{section.title}</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 2.5, pb: 2, pt: 0 }}>
              {section.rules && (
                <Box component="ul" sx={{ m: 0, pl: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {section.rules.map((rule, j) => (
                    <Box component="li" key={j} sx={{
                      typography: 'caption', color: 'text.secondary', lineHeight: 1.4,
                      '&::marker': { color: '#E65100' },
                    }}>
                      {rule}
                    </Box>
                  ))}
                </Box>
              )}
              {section.tips && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                  {section.tips.map((tip, j) => (
                    <Box key={j} sx={{
                      p: 1.25, borderRadius: '8px', backgroundColor: 'rgba(230,81,0,0.04)',
                      borderLeft: '3px solid #E65100',
                    }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.4 }}>
                        {tip}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Box>
  )
}

function CTASection({ onPlay, onMultiplayer, onLocalMultiplayer, onOfflineMultiplayer }) {
  return (
    <Box sx={{ px: 2.5, pb: 'max(24px, env(safe-area-inset-bottom))' }}>
      <Box sx={{
        background: 'linear-gradient(135deg, #E65100 0%, #BF360C 100%)',
        borderRadius: '14px', p: 2.5,
        textAlign: 'center',
      }}>
        <Typography variant="h6" sx={{ fontWeight: 900, color: '#fff', mb: 0.5 }}>
          Ready to Play?
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 2 }}>
          Koi time nahi — abhi khelo!
        </Typography>
        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={onPlay}
          sx={{
            borderRadius: '10px', py: 1.5, fontSize: '1.05rem', fontWeight: 800,
            backgroundColor: '#fff', color: '#E65100',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.95)', boxShadow: '0 6px 20px rgba(0,0,0,0.2)' },
            mb: 1.5,
          }}
        >
          Khelo! (Pass & Play)
        </Button>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {onMultiplayer && (
            <Button
              variant="outlined"
              size="medium"
              fullWidth
              onClick={onMultiplayer}
              startIcon={<LanguageIcon />}
              sx={{ borderRadius: '10px', py: 1, borderColor: 'rgba(255,255,255,0.5)', color: '#fff', fontWeight: 700, '&:hover': { borderColor: '#fff', backgroundColor: 'rgba(255,255,255,0.1)' } }}
            >
              Online Khelo (Internet)
            </Button>
          )}
          {onLocalMultiplayer && (
            <Button
              variant="outlined"
              size="medium"
              fullWidth
              onClick={onLocalMultiplayer}
              startIcon={<WifiIcon />}
              sx={{ borderRadius: '10px', py: 1, borderColor: 'rgba(255,255,255,0.5)', color: '#fff', fontWeight: 700, '&:hover': { borderColor: '#fff', backgroundColor: 'rgba(255,255,255,0.1)' } }}
            >
              Hotspot Khelo (No Internet)
            </Button>
          )}
          {onOfflineMultiplayer && (
            <Button
              variant="outlined"
              size="medium"
              fullWidth
              onClick={onOfflineMultiplayer}
              startIcon={<PhoneIphoneIcon />}
              sx={{ borderRadius: '10px', py: 1, borderColor: 'rgba(255,255,255,0.5)', color: '#fff', fontWeight: 700, '&:hover': { borderColor: '#fff', backgroundColor: 'rgba(255,255,255,0.1)' } }}
            >
              Offline Khelo (Bus / No Internet)
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default function HomeScreen({ onPlay, onMultiplayer, onLocalMultiplayer, onOfflineMultiplayer }) {
  return (
    <Box sx={{
      height: '100dvh', width: '100%',
      backgroundColor: 'background.default',
      overflow: 'auto',
      WebkitOverflowScrolling: 'touch',
    }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pb: 3 }}>
        <HeroSection onPlay={onPlay} />
        <GameModesSection {...{ onPlay, onMultiplayer, onLocalMultiplayer, onOfflineMultiplayer }} />
        <AboutSection />
        <HowToPlaySection />
        <AccordionSection
          title="Official Rules"
          sections={RULE_SECTIONS}
          defaultExpanded={false}
        />
        <AccordionSection
          title="Strategy Tips"
          sections={STRATEGIES}
          defaultExpanded={false}
        />
        <CTASection {...{ onPlay, onMultiplayer, onLocalMultiplayer, onOfflineMultiplayer }} />
      </Box>
    </Box>
  )
}
