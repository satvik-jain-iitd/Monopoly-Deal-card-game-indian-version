# Ultra-Detailed Card-by-Card Comparison: Official vs Generated

> **Methodology:** Each official card was visually inspected using the Opus 4.6 vision model.
> Every generated card was compared against its official counterpart.
> Differences are catalogued with pixel-level specificity.
> The goal is to produce generated cards that are indistinguishable from the official deck
> (except for Indian city names replacing US cities, ₹Cr replacing ₹M, and Indian icons replacing US icons).

---

## DESIGN SYSTEM: Official Monopoly Deal Card Anatomy

### What the official cards actually look like (observed from real images):

#### PROPERTY CARDS — Standard Layout:
1. **Card background:** White/off-white card stock with rounded corners (~12px radius)
2. **Thin colored border:** ~2px line runs around the entire card, inset ~8px from the edge, matching the set color
3. **Header band:** A solid colored rectangle near the top, inset from the card edges (~15px each side). Takes up about 18-22% of card height. Color = set color (brown, red, yellow, etc.)
4. **Value badge:** A white circle (~40px diameter) with a thin dark outline, positioned at the top-left, overlapping the top edge of the header band. Contains "₹XM" in bold text.
5. **Title text:** Property name in **WHITE, BOLD, UPPERCASE sans-serif** centered inside the header band. Multi-line if needed (e.g., "NORTH CAROLINA AVENUE" splits to 3 lines).
6. **Rent section:** Below the header, occupying the middle portion:
   - Left side: "(No. of properties owned in set)" in small grey text
   - Right side: "RENT" in large bold black text
   - Below that: Multiple rent rows
7. **Rent rows:** Each row has:
   - A small "card stack" icon on the left — looks like 1-4 mini property cards fanned/stacked, colored in the set color. These have the count number (1, 2, 3, 4) printed on them.
   - A dotted line extending to the right
   - The rent value (₹XM) at the right end
   - The LAST row (full set) has the text "FULL SET." before the value
8. **No house/hotel section:** The official property cards do NOT show house/hotel costs ON the card face. These are on separate House and Hotel action cards.
9. **No landmark/watermark icon:** The official property cards do NOT have any background watermark, landmark icon, or city illustration. They are clean and minimal.
10. **Copyright text:** "© 1935, 2008 HASBRO" at the bottom left in tiny text.

#### RAILROAD PROPERTY CARDS — Special features:
- Same layout as above but with BLACK header band
- **Train icon:** A small black steam locomotive icon appears centered below the title, inside the header band area
- 4 rent rows (set of 4 completes)
- Card stack icons in the rent rows use BLACK mini-cards

#### UTILITY PROPERTY CARDS — Special features:
- Same layout but with PALE GREEN/SAGE header band
- **Utility icon:** Water Works has a faucet/tap icon; Electric Company has a lightbulb icon — positioned to the RIGHT of the title text inside the header
- 2 rent rows (set of 2 completes)

#### ACTION CARDS — Official Layout:
1. **Background color:** Varies by action type (light blue for Just Say No, beige/cream for most others, lavender for Deal Breaker)
2. **Ornate border:** A decorative border made of repeated geometric patterns (Greek key / meander pattern), running around the entire card with ~10px margin. TWO nested borders — an outer thin one and an inner thick one.
3. **"ACTION CARD" label:** Bold black text centered near the top, ABOVE the central circle
4. **Central circle:** A large (~55% card width) circle with a thick black outline (3-4px stroke). Inside:
   - Action name in LARGE, BOLD, BLACK, UPPERCASE text (e.g., "DEAL BREAKER", "PASS GO")
   - For PASS GO: has a red left-pointing arrow below "GO"
   - For HOUSE: has a 3D green house illustration
   - For HOTEL: has a 3D red hotel illustration  
   - For IT'S MY BIRTHDAY: has a birthday cake illustration
5. **Description text:** Below the circle, centered, in small black text. Describes what the card does.
6. **Value badges:** TWO circles — top-left AND bottom-right — each containing "₹XM". Red circle outline.
7. **No gradient backgrounds:** The action cards do NOT use gradients. They use flat, muted solid colors.

#### RENT CARDS — Official Layout:
1. **Same ACTION CARD frame** — identical ornate border, "ACTION CARD" text at top
2. **Central circle:** Contains "RENT" in large bold text. The circle is divided into segments colored with the two relevant set colors (like a target/bullseye):
   - For dual-color rent: Two concentric rings — outer ring = one color, inner ring = other color, center = white with "RENT" text
   - For wild rent: Multi-colored wheel segments (all 10 property colors) around the circle
3. **Description text:** Below circle. "All players pay you rent for properties you own in one of these colors. Play into center to use."
4. **Value badges:** Same as action cards, two badges with red outlines

#### WILDCARD PROPERTY CARDS (dual-color) — Official Layout:
1. **FLIPPABLE DESIGN:** The card is designed to be read from EITHER end — it can be rotated 180°
2. **Title area:** At each end (top and bottom, flipped), there is a colored band with "PROPERTY" above "WILD CARD" in white text, and "(Use card either way up.)" in small text
3. **Center area:** Shows RENT tables for BOTH colors, one right-side up, one upside down
4. **Rent rows:** Same mini-card-stack icons, dotted lines, and values as standard property cards
5. **Value badge:** One in each corner, matching the color it's associated with
6. **The split is NOT diagonal** — it's a straight horizontal division at the center, with each half dedicated to one color

#### WILDCARD (RAINBOW/MULTICOLOR) — Official Layout:
1. **White background** with colored stripes across the top (all 10 property colors as thin horizontal bars)
2. **"PROPERTY WILD CARD"** in large bold text at the top
3. **Rich Uncle Pennybags illustration:** The Monopoly mascot (man in top hat with monocle, pointing) is centered and takes up most of the card
4. **Description text:** "This card can be used as part of any property set. This card has no monetary value."
5. **No value badge** (₹0M)

#### MONEY CARDS — Official Layout:
1. **Colored background:** Light blue outer border area, inner area colored based on denomination (gold/yellow for 10M, pale green/sage for 1M, etc.)
2. **Ornate border:** Same geometric/meander pattern as action cards, but the inner area is a solid color
3. **Central circle:** Large circle in the center with thick outline, containing the value in large stylized text (₹XM)
4. **Value badges:** Two small circles — top-left and bottom-right — each containing the value
5. **Colors by denomination:**
   - 1M = pale green/sage background
   - 2M = pale green/sage background
   - 3M = pale green/sage background
   - 4M = pale green/sage background
   - 5M = pale gold/tan background
   - 10M = gold/yellow background

---

## CARD-BY-CARD COMPARISON

---

### 1. BROWN PROPERTY CARDS (Baltic Avenue / Mediterranean Avenue → Lucknow / Indore)

#### Official Card Details:
- White card, thin brown border line inset from edges
- Brown header band (hex ~#8B4513 or similar warm brown) occupying top ~20%
- White circle value badge (₹1M) at top-left overlapping header
- Property name in white bold uppercase centered in header
- Below header: "(No. of properties owned in set)" label and "RENT" in large text
- 2 rent rows:
  - Row 1: Brown mini-card icon with "1", dotted line, "₹1M"
  - Row 2: Brown mini-card icon with "2", dotted line, "FULL SET. ₹2M"
- Bottom: copyright text
- NO house/hotel costs on card face
- NO landmark/watermark illustration
- NO "Collect X of this color" subtext

#### Generated Card (Lucknow) Details:
- White card with rounded corners
- Brown header band — ✅ Correct color
- Green circle value badge (₹1) at top-left — ❌ Circle is GREEN, should be WHITE with dark outline
- "LUCKNOW" in white bold text — ✅ Correct placement
- "RENT" label — ✅ Present
- Rent rows show "1" and "2 (set)" with "₹1Cr" and "₹2Cr" — ⚠️ Close but format differs:
  - ❌ Missing the small card-stack icons (mini brown property cards fanned together)
  - ❌ Missing the dotted lines between number and value
  - ❌ "2 (set)" format vs official "FULL SET. ₹2M" format
- ❌ Has a LARGE brown landmark/archway watermark icon on the right side — NOT present in official
- ❌ Has "Ghar: +₹3Cr" and "Hotel: +₹4Cr" at the bottom — NOT present on official property cards
- ❌ Missing "(No. of properties owned in set)" label text
- ❌ Missing copyright text

#### Critical Differences:
| Element | Official | Generated | Fix Required |
|---------|----------|-----------|-------------|
| Value badge | White circle, dark outline | Green circle | Change to white circle with dark outline |
| Card-stack icons | Brown mini-card fans (1, 2) | Plain numbers | Add card-stack SVG icons |
| Dotted line | Present between count and value | Missing | Add dotted line |
| "FULL SET." label | Present on last row | Shows "(set)" | Change to "FULL SET." |
| Landmark watermark | NOT present | Large archway icon | REMOVE entirely |
| House/Hotel costs | NOT on card face | Shows at bottom | REMOVE from property card |
| "(No. of properties owned in set)" | Present | Missing | Add label text |
| Border line | Thin colored line inset from edge | No visible border line | Add thin brown border |

---

### 2. LIGHT BLUE PROPERTY CARDS (Oriental/Vermont/Connecticut → Chandigarh/Bhopal/Kochi)

#### Official Card Details:
- White card with thin light blue border line
- Light blue header band (hex ~#87CEEB or similar)
- White circle value badge (₹1M) at top-left
- 3 rent rows with light blue mini-card-stack icons
- Row 3: "FULL SET. ₹3M"

#### Generated Card (vs Official): Same issues as brown property cards:
- ❌ Green value badge instead of white
- ❌ No card-stack icons
- ❌ No dotted lines
- ❌ Large landmark watermark present (shouldn't be)
- ❌ House/Hotel costs at bottom (shouldn't be on card)
- ❌ Missing "(No. of properties owned in set)" text

---

### 3. PINK PROPERTY CARDS (St. Charles/States/Virginia → Jaipur/Ahmedabad/Kolkata)

#### Official Card Details:
- Hot pink/magenta header band (hex ~#FF1493 or similar bright magenta)
- White circle value badge: ₹2M
- 3 rent rows with pink mini-card icons
- Rent values: 1→₹1M, 2→₹2M, 3(full set)→₹4M

#### Generated Card Differences:
- Same systemic issues as above (green badge, no card icons, no dots, landmark, house/hotel)
- ⚠️ The pink/magenta tone needs to match the official vibrant hot pink exactly

---

### 4. ORANGE PROPERTY CARDS (St. James/Tennessee/New York → Chennai/Hyderabad/Noida)

#### Official Card Details:
- Orange header band (hex ~#F5A623 or similar warm orange)
- White circle value badge: ₹2M
- 3 rent rows with orange mini-card icons
- Rent values: 1→₹1M, 2→₹3M, 3(full set)→₹5M

#### Generated Card Differences:
- Same systemic issues
- Orange color appears correct in tone

---

### 5. RED PROPERTY CARDS (Kentucky/Indiana/Illinois → Pune/Bengaluru/Gurugram)

#### Official Card Details:
- Bright red header band (hex ~#E41B17 or similar)
- White circle value badge: ₹3M
- 3 rent rows with red mini-card icons
- Rent values: 1→₹2M, 2→₹3M, 3(full set)→₹6M

#### Generated Card (Bengaluru) Specific Issues:
- ❌ Value badge is GREEN circle, should be white
- ❌ Has a large red location-pin/map-marker watermark — NOT in official
- ❌ House/Hotel costs at bottom — remove
- ❌ No card-stack icons in rent rows
- Red header color appears correct

---

### 6. YELLOW PROPERTY CARDS (Atlantic/Ventnor/Marvin Gardens → Goa/Coimbatore/Vizag)

#### Official Card Details:
- Bright yellow header band (hex ~#FFD700 or similar)
- White circle value badge: ₹3M
- 3 rent rows with yellow mini-card icons
- Rent values: 1→₹2M, 2→₹4M, 3(full set)→₹6M

#### Generated Card Differences:
- Same systemic issues as all property cards

---

### 7. GREEN PROPERTY CARDS (Pacific/North Carolina/Pennsylvania → New Delhi/Navi Mumbai/Thane)

#### Official Card Details:
- Rich green header band (hex ~#00A651 or similar)
- White circle value badge: ₹4M
- 3 rent rows with green mini-card icons
- Rent values: 1→₹2M, 2→₹4M, 3(full set)→₹7M

#### Generated Card Differences:
- Same systemic issues

---

### 8. DARK BLUE PROPERTY CARDS (Boardwalk/Park Place → Lutyens Delhi/South Mumbai)

#### Official Card Details:
- Dark blue header band (hex ~#0058A0 or similar medium-dark blue)
- White circle value badge: ₹4M
- 2 rent rows with dark blue mini-card icons
- Rent values: 1→₹3M, 2(full set)→₹8M

#### Generated Card (South Mumbai) Specific Issues:
- ❌ Green value badge → should be white
- ❌ Large blue arch/gateway watermark → remove
- ❌ House/Hotel costs at bottom → remove
- ❌ No card-stack icons, no dotted lines
- Blue header tone: appears correct

---

### 9. RAILROAD PROPERTY CARDS (Reading/Pennsylvania/B&O/Short Line → Mumbai Local/Delhi Metro/Namma Metro/Howrah Express)

#### Official Card Details:
- **BLACK header band** — distinctive from other property types
- **Train icon:** A small black steam train/locomotive icon is centered INSIDE the header band, below the title text
- White circle value badge: ₹2M
- 4 rent rows with BLACK mini-card-stack icons
- Rent values: 1→₹1M, 2→₹2M, 3→₹3M, 4(full set)→₹4M
- NO house/hotel costs (railroads can't have houses/hotels in official rules)

#### Generated Card (Delhi Metro) Specific Issues:
- ✅ Black header band — correct
- ❌ Green value badge → should be white
- ❌ Has a large metro/train icon to the right of rent rows as a watermark → should be INSIDE the header only, as a small icon, not a watermark
- ❌ No card-stack icons in rent rows
- ❌ No dotted lines
- ✅ No house/hotel costs at bottom — correct for railroad
- ❌ Missing small train icon IN the header

---

### 10. UTILITY PROPERTY CARDS (Electric Company/Water Works → Power Grid/Water Works)

#### Official Card Details:
- **Pale sage/green-grey header band** (NOT bright green — it's a muted, desaturated sage green)
- **Utility icons IN the header:** 
  - Water Works: faucet/tap icon to the right of the title
  - Electric Company: lightbulb icon to the right of the title
- White circle value badge: ₹2M
- 2 rent rows with utility-colored mini-card icons
- Rent values: 1→₹1M, 2(full set)→₹2M

#### Generated Card (Water Works) Specific Issues:
- ❌ Header is bright teal/dark green → should be pale sage/grey-green
- ❌ Green value badge → should be white
- ❌ Has an abstract water icon as a large watermark → should be a small icon in the header
- ❌ No card-stack icons
- ❌ No dotted lines

---

### 11. ACTION CARD: DEAL BREAKER

#### Official Card Details:
- **Lavender/purple** background (NOT bright blue)
- **Greek key / meander ornate double border** around the card
- "ACTION CARD" in bold black text at top, above the circle
- Large central circle with thick black outline
- "DEAL BREAKER" in large bold black text inside circle
- Description below: "Steal a complete set of properties from any player. (Includes any buildings.) Play into center to use."
- Two value badges (₹5M): top-left AND bottom-right, with RED circle outlines
- Copyright text at bottom

#### Generated Card Details:
- ❌ BRIGHT BLUE gradient background → should be flat LAVENDER/PURPLE
- ❌ No ornate meander border → needs Greek key pattern
- ✅ "ACTION CARD" label present (in gold banner) → ❌ should be plain black text, no banner
- ❌ "DEAL BREAKER" is displayed as large white text on blue background → should be inside a central circle in black text
- ❌ Has abstract hammer/gavel icon → official has NO icon, just text in circle
- ❌ Dark blue rectangle at bottom → should be description text
- ❌ Only one value badge (top-left) → needs two (top-left AND bottom-right)
- ❌ Value badge is gold circle → should be white circle with red outline

---

### 12. ACTION CARD: JUST SAY NO

#### Official Card Details:
- **Light blue** flat background
- Same ornate double border pattern
- "JUST SAY NO!" in bold black inside central circle
- Value: ₹4M in two badges (red outline)
- Description: "Use any time when an action card is played against you. Play into center to use."

#### Generated Card Differences:
- ❌ Bright blue gradient → should be flat light blue
- ❌ No ornate border
- ❌ Missing central circle with text
- ❌ Has abstract person/stickman icon → should have NO icon
- ❌ Missing dual value badges with red outlines

---

### 13. ACTION CARD: PASS GO

#### Official Card Details:
- **Beige/cream/tan** flat background
- Same ornate double border
- Inside central circle: "PASS" above "GO" with a RED LEFT-POINTING ARROW below "GO"
- Value: ₹1M in two badges
- Description: "Draw 2 extra cards. Play into center to use."

#### Generated Card Differences:
- ❌ Bright blue gradient → should be BEIGE/CREAM
- ❌ No ornate border
- ❌ Has stickman icon → should have "PASS GO" text with red arrow in circle
- ❌ Missing the iconic red arrow

---

### 14. ACTION CARD: SLY DEAL

#### Official Card Details:
- **Silver/grey** flat background
- "SLY DEAL" inside central circle
- Value: ₹3M
- Description: "Steal a property from the player of your choice. (Cannot be part of a full set.) Play into center to use."

#### Generated Card Differences:
- ❌ Bright blue gradient → should be SILVER/GREY
- ❌ Same systemic issues (no border, no circle, icon instead of text)

---

### 15. ACTION CARD: FORCED DEAL

#### Official Card Details:
- **Silver/grey** flat background  
- "FORCED DEAL" inside central circle
- Value: ₹3M
- Description: "Swap any property with another player. (Cannot be part of a full set.) Play into center to use."

#### Generated Card Differences:
- Same issues as Sly Deal

---

### 16. ACTION CARD: DEBT COLLECTOR

#### Official Card Details:
- **Pale sage/green-grey** flat background
- "DEBT COLLECTOR" inside central circle
- Value: ₹3M
- Description: "Force any player to pay you ₹5M. Play into center to use."

#### Generated Card Differences:
- ❌ Bright blue gradient → should be pale sage/green-grey
- Same systemic issues

---

### 17. ACTION CARD: IT'S MY BIRTHDAY (→ MERA BIRTHDAY!)

#### Official Card Details:
- **Light blue** flat background
- "IT'S MY BIRTHDAY" inside central circle
- **Birthday cake illustration** inside the circle, above the text
- Value: ₹2M
- Description: 'All players give you ₹2M as a "gift". Play into center to use.'

#### Generated Card Differences:
- Same systemic issues
- ❌ Missing birthday cake illustration

---

### 18. ACTION CARD: DOUBLE THE RENT (→ DOUBLE RENT!)

#### Official Card Details:
- **Beige/cream** flat background
- "DOUBLE THE RENT!" inside central circle (with exclamation mark)
- Value: ₹1M
- Description: "Needs to be played with a rent card. Play into center to use."

#### Generated Card Differences:
- Same systemic issues

---

### 19. ACTION CARD: HOUSE (→ GHAR)

#### Official Card Details:
- **White/light grey** flat background
- Inside central circle: A **3D green house illustration** (like the classic Monopoly house piece)
- "HOUSE" text below the house illustration inside the circle
- Value: ₹3M
- Description: "Add onto any full set you own to add ₹3M to the rent value. (Except railroads and utilities.)"

#### Generated Card Details:
- ❌ Bright blue gradient → should be WHITE/LIGHT GREY
- ❌ Has a flat line-art house icon → should be 3D Monopoly house
- ❌ Same systemic issues (no ornate border, wrong badge style)

---

### 20. ACTION CARD: HOTEL

#### Official Card Details:
- **Light blue** flat background
- Inside central circle: A **3D red hotel illustration** (like the classic Monopoly hotel piece)
- "HOTEL" text below the hotel illustration inside the circle
- Value: ₹4M
- Description: "Add onto any full set you own to add ₹4M to the rent value. (Except railroads and utilities.)"

#### Generated Card Differences:
- Same issues as House card

---

### 21. RENT CARDS (Dual Color)

#### Official Card Details (e.g., Brown/Light Blue Rent):
- **Same ACTION CARD frame** — ornate Greek key border, "ACTION CARD" text
- Central circle contains:
  - "RENT" in large bold white text
  - Circle is divided into concentric rings of the two relevant colors:
    - Outer ring = first color (brown)
    - Inner ring = second color (light blue)
    - Center = white area with "RENT" text
- Two value badges (₹1M) with red outlines
- Description: "All players pay you rent for properties you own in one of these colors. Play into center to use."

#### Generated Rent Card (Brown/Light Blue) Details:
- ❌ Uses a DIAGONAL SPLIT design (brown triangle top-left, light blue triangle bottom-right) → official uses CONCENTRIC CIRCLES
- ❌ Has a ₹ symbol in a white circle at center → should say "RENT" in the circle
- ❌ "RENT CARD" label at bottom → should say "ACTION CARD" at top
- ❌ "BROWN/LIGHT BLUE" label at bottom → description text should be the action description
- ❌ No ornate border
- ❌ Only one value badge → needs two

---

### 22. WILD RENT CARD (All Colors)

#### Official Card Details:
- Same ACTION CARD frame
- Central circle: "RENT" text in center, surrounded by a COLOR WHEEL of all 10 property colors as pie-chart-like segments
- Value: ₹3M
- Description: "Force one player to pay you rent for properties you own in one of these colors. Play into center to use."

#### Generated Wild Rent Card Details:
- ❌ Solid dark green gradient background → should be light grey/silver with ornate border
- ❌ ₹ symbol in white circle → should say "RENT" with color wheel
- ❌ "WILD RENT" / "KISI SE BHI RENT LO" labels → should be action description
- ❌ No color wheel segments
- ❌ Missing ornate border

---

### 23. WILDCARD PROPERTY CARDS (Dual-Color, e.g., Red/Yellow)

#### Official Card Details:
- **FLIPPABLE CARD** — rotatable 180°
- **Top half (one color):** Colored header band with "PROPERTY" and "WILD CARD" in white, "(Use card either way up.)" in small text
- **Top half rent table:** Shows rent values for that color (right-side up)
- **Bottom half (other color):** Same as top but UPSIDE DOWN (designed to be read when card is flipped)
- **Bottom half rent table:** Shows rent values for the other color (upside down)
- **Center:** "RENT" text divides the two halves
- **Value badges:** One per corner
- **Key detail:** The rent rows use the SAME card-stack icon system as regular property cards

#### Generated Wildcard (Red/Yellow) Details:
- ❌ Uses a HORIZONTAL SPLIT with bright solid red (top) and bright yellow (bottom) → official uses the same white card stock with colored header BANDS at each end
- ❌ "WILD" text in a circle at center → official has "RENT" text at the dividing line
- ❌ Lists rent values as "1: ₹2Cr" etc. → should use card-stack icons and dotted lines
- ❌ "RED" and "YELLOW" labels on colored banners → should say "PROPERTY WILD CARD"
- ❌ No "(Use card either way up.)" text
- ❌ Overwhelming color — the entire halves are solid color fills → official is mostly white with small colored bands

---

### 24. WILDCARD (RAINBOW/MULTICOLOR → PROPERTY WILD CARD)

#### Official Card Details:
- **White background** card
- **Color stripe bar:** Horizontal bar at the top showing all 10 property colors as thin adjacent stripes
- **"PROPERTY WILD CARD"** in large bold text
- **Rich Uncle Pennybags (Monopoly Man):** Full illustration centered — man in black tuxedo, top hat, white mustache, pointing at viewer
- **Description:** "This card can be used as part of any property set. This card has no monetary value."
- **No value badge** (card is worth ₹0)

#### Generated Rainbow Wild Card Details:
- ❌ RAINBOW GRADIENT background covering entire card → should be white with small color stripe bar at top
- ❌ "WILD" in large white text → should be "PROPERTY WILD CARD"
- ❌ "KISI BHI COLOR MEIN" subtitle → should be the English description text
- ❌ No Monopoly Man illustration → this is a KEY visual element (though for the Indian version we could use an Indian equivalent mascot, or simply omit and keep text-only)
- ❌ "PROPERTY WILD CARD" at bottom in small text → should be the title at top

---

### 25. MONEY CARDS (₹1M → ₹1Cr, ₹2M → ₹2Cr, etc.)

#### Official Card Details (e.g., ₹1M):
- **Light blue outer border area** (same as card stock)
- **Inner area:** Pale sage/green background with ornate Greek key border pattern
- **Central circle:** Large circle (50-60% card width) with double outline (thin + thick), containing the value "₹1M" in large stylized text
- **Corner badges:** Two small circles (top-left, bottom-right) each with the value
- **Color coding by denomination:**
  - ₹1M–₹5M: Pale sage/green inner area
  - ₹10M: GOLD/YELLOW inner area

#### Generated Money Card (₹1Cr) Details:
- ❌ SOLID GREEN background with subtle gradient → should be pale sage/green with visible ornate border
- ❌ "₹1Cr" in large white text on green → should be inside a central circle with outline
- ❌ "MONEY" label below value → NOT present in official
- ❌ Corner text ("₹1Cr") in plain text → should be inside small circles
- ❌ No ornate Greek key border pattern
- ❌ Overall design feels like a flat modern card → should look like classic currency-style with ornate patterns

---

## MASTER DIFFERENCE SUMMARY

### SYSTEMIC ISSUES (affects ALL cards):

| # | Issue | Severity | Description |
|---|-------|----------|-------------|
| S1 | **Value badge style** | HIGH | All generated cards use colored (green/gold) circle badges. Official uses WHITE circles with thin dark outlines and RED outlines on action cards. |
| S2 | **Missing card-stack icons** | HIGH | Property cards need mini fanned-card icons colored in the set color, showing count (1, 2, 3, 4). Generated cards use plain numbers. |
| S3 | **Missing dotted lines** | MEDIUM | Official rent rows connect the count to the value with a dotted line. |
| S4 | **"FULL SET." label** | MEDIUM | Official uses "FULL SET." prefix on the last rent row. Generated uses "(set)" suffix. |
| S5 | **Remove landmark watermarks** | HIGH | Generated property cards have large landmark/icon watermarks. Official cards are CLEAN — no watermarks. |
| S6 | **Remove house/hotel from property cards** | HIGH | Generated cards show "Ghar: +₹3Cr / Hotel: +₹4Cr" at bottom. Official property cards do NOT show this. |
| S7 | **Missing "(No. of properties owned in set)"** | MEDIUM | Official has this text label. Generated cards omit it. |
| S8 | **Action card frame wrong** | CRITICAL | ALL action cards use bright blue gradient. Official uses FLAT solid muted colors (lavender, cream, silver, sage) with ORNATE GREEK KEY BORDERS. |
| S9 | **Missing central circle on action cards** | CRITICAL | Official action cards have a large circle with thick outline containing the card name. Generated cards display text/icon on background. |
| S10 | **Missing ornate border** | CRITICAL | Official action and money cards use a distinctive Greek key / meander pattern double border. Generated cards have no such border. |
| S11 | **Dual value badges on action cards** | HIGH | Official action cards have value badges at top-left AND bottom-right. Generated only have top-left. |
| S12 | **Rent card design wrong** | HIGH | Generated uses diagonal color splits. Official uses concentric colored rings inside a circle. |
| S13 | **Wildcard design wrong** | HIGH | Generated uses solid color fills. Official uses white card stock with colored header bands at each end (flippable). |
| S14 | **Money card design wrong** | HIGH | Generated uses flat gradient. Official uses ornate bordered currency-style design with central circle. |
| S15 | **Rainbow wildcard design wrong** | HIGH | Generated uses rainbow gradient fill. Official has white card with color stripe bar and Monopoly Man illustration. |
| S16 | **Missing copyright text** | LOW | "© 1935, 2008 HASBRO" or equivalent needed. Can use "Indian Edition © 2024" |

---

## PRIORITY ORDER FOR FIXING

### Phase 1: Property Cards (fix systemic issues)
1. Remove all landmark watermarks (S5)
2. Remove house/hotel costs from card face (S6)
3. Change value badge to white circle with dark outline (S1)
4. Add card-stack icons for rent rows (S2)
5. Add dotted lines in rent rows (S3)
6. Change "(set)" to "FULL SET." (S4)
7. Add "(No. of properties owned in set)" label (S7)
8. Add thin colored border line around card (matching set color)

### Phase 2: Action Cards (complete redesign)
1. Replace blue gradient with flat muted background colors (S8)
2. Add ornate Greek key double border (S10)
3. Add central circle with thick outline containing card name (S9)
4. Add "ACTION CARD" plain text above circle
5. Add dual value badges (top-left + bottom-right) with red outlines (S11)
6. Add description text below circle
7. Add specific icons where needed (cake for Birthday, green house for House, red hotel for Hotel, red arrow for Pass Go)

### Phase 3: Rent Cards
1. Redesign to use ACTION CARD frame (S10)
2. Replace diagonal split with concentric colored rings in circle (S12)
3. Add "RENT" text inside central circle
4. For wild rent: Add color wheel segments
5. Add "ACTION CARD" label and dual badges

### Phase 4: Wildcard Property Cards
1. Redesign to flippable layout with white card stock (S13)
2. Add colored header bands at each end
3. Add rent tables for both colors (one right-side up, one inverted)
4. Add "PROPERTY WILD CARD" and "(Use card either way up.)" text

### Phase 5: Rainbow Wildcard
1. Replace rainbow gradient with white card + color stripe bar (S15)
2. Add "PROPERTY WILD CARD" title
3. Add mascot illustration or text-only version
4. Add description text

### Phase 6: Money Cards
1. Replace flat gradient with ornate bordered design (S14)
2. Add central circle with value
3. Add corner value badges in circles
4. Add Greek key border pattern
5. Use correct color coding (sage for low, gold for 10Cr)
