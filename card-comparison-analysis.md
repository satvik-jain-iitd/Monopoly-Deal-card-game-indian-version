# Detailed Card-by-Card Comparison & Design Polish Spec

This document provides a highly detailed, card-by-card comparative analysis of the official Monopoly Deal scans (in `public/images/cards/official/`) versus the first-pass generated cards (in `public/images/cards/generated/`), defining exactly what changes will be implemented for each design.

---

## 1. PROPERTY CARDS (28 Unique Designs)

### 1.1 Indore (`prop-brown-indore.png` vs `brown-property-card.png`)
* **Official Scans:** Mediterranean Avenue (₹1M). Brown header bar. Cash circle in top-left with ₹1 value. White background body with a RENT table of 1: ₹1M, 2: ₹2M. Underneath has a separator line and text: "House ₹3M", "Hotel ₹4M". Features a simple circular watermark icon in the center.
* **First-Pass Generated:** Generic sans-serif font. Thin, floating `indore` landmark. Simple text for building costs. No colored set highlight in the rent ladder.
* **Perfectionist Improvements:**
  - Embed **Outfit-ExtraBold** font for all text.
  - Draw a solid brown highlighted block (`#955436`) behind the `2: ₹2Cr` row with white text.
  - Add a vector green house icon (`fill="#4CAF50"`) and a red hotel icon (`fill="#F44336"`) next to the bottom costs text.
  - Set landmark opacity to 0.15 as a subtle background watermark, centered.

### 1.2 Lucknow (`prop-brown-lucknow.png` vs `brown-property-card.png`)
* **Official Scans:** Baltic Avenue (₹1M). Same layout as Mediterranean Avenue.
* **First-Pass Generated:** Generic font, thin Lucknow landmark, simple text layout.
* **Perfectionist Improvements:**
  - Same visual framing and set highlights as Indore, using the unique `lucknow` landmark vector.

### 1.3 Chandigarh (`prop-lightBlue-chandigarh.png` vs `light-blue-property-card.png`)
* **Official Scans:** Oriental Avenue (₹1M). Light blue header bar. Cash circle ₹1. RENT table of 1: ₹1M, 2: ₹2M, 3: ₹3M. Separator line and house/hotel costs text.
* **First-Pass Generated:** Light blue header text in white (hard to read against light blue background). No set highlight block.
* **Perfectionist Improvements:**
  - Change header text color to black (`#000000`) for readability on light blue.
  - Add a solid light blue highlighted block (`#55C3F0`) behind the `3: ₹3Cr` set row.
  - Add house/hotel vector icons at the bottom.

### 1.4 Bhopal (`prop-lightBlue-bhopal.png` vs `light-blue-property-card.png`)
* **Official Scans:** Vermont Avenue (₹1M). Same layout as Chandigarh.
* **First-Pass Generated:** White text on light blue, plain rent table, thin landmark icon.
* **Perfectionist Improvements:**
  - Same light blue property template as Chandigarh, with the `bhopal` landmark vector.

### 1.5 Kochi (`prop-lightBlue-kochi.png` vs `light-blue-property-card.png`)
* **Official Scans:** Connecticut Avenue (₹1M). Same layout as Chandigarh.
* **First-Pass Generated:** Plain text, thin Kochi landmark.
* **Perfectionist Improvements:**
  - Same light blue property template as Chandigarh, with the `kochi` landmark vector.

### 1.6 Jaipur (`prop-pink-jaipur.png` vs `pink-property-card.png`)
* **Official Scans:** St. Charles Place (₹2M). Pink header bar. Cash circle ₹2. RENT table of 1: ₹1M, 2: ₹2M, 3: ₹4M.
* **First-Pass Generated:** Plain rent ladder, thin Jaipur (Hawa Mahal) SVG path, generic fonts.
* **Perfectionist Improvements:**
  - Highlight the `3 (set): ₹4Cr` row in solid pink (`#D93A96`).
  - Add house/hotel vector icons at the bottom.
  - Bold the Jaipur landmark line thickness (`stroke-width="2.2"`) to stand out.

### 1.7 Ahmedabad (`prop-pink-ahmedabad.png` vs `pink-property-card.png`)
* **Official Scans:** States Avenue (₹2M). Same layout as Jaipur.
* **First-Pass Generated:** Simple layout, thin kite landmark.
* **Perfectionist Improvements:**
  - Same pink property template as Jaipur, with the `ahmedabad` landmark vector.

### 1.8 Kolkata (`prop-pink-kolkata.png` vs `pink-property-card.png`)
* **Official Scans:** Virginia Avenue (₹2M). Same layout as Jaipur.
* **First-Pass Generated:** Generic font, thin bridge landmark.
* **Perfectionist Improvements:**
  - Same pink property template as Jaipur, with the `kolkata` landmark vector.

### 1.9 Chennai (`prop-orange-chennai.png` vs `orange-property-card.png`)
* **Official Scans:** St. James Place (₹2M). Orange header bar. Cash circle ₹2. RENT table of 1: ₹1M, 2: ₹3M, 3: ₹5M.
* **First-Pass Generated:** Simple rent table, thin gopuram temple landmark.
* **Perfectionist Improvements:**
  - Highlight `3 (set): ₹5Cr` in orange (`#F7941D`).
  - Add house/hotel vector icons at the bottom.
  - Scale and center gopuram landmark vector behind the text.

### 1.10 Hyderabad (`prop-orange-hyderabad.png` vs `orange-property-card.png`)
* **Official Scans:** Tennessee Avenue (₹2M). Same layout as Chennai.
* **First-Pass Generated:** Generic layout, thin Charminar icon.
* **Perfectionist Improvements:**
  - Same orange property template as Chennai, with the `hyderabad` landmark vector.

### 1.11 Noida (`prop-orange-noida.png` vs `orange-property-card.png`)
* **Official Scans:** New York Avenue (₹2M). Same layout as Chennai.
* **First-Pass Generated:** Thin skyline icon, generic font.
* **Perfectionist Improvements:**
  - Same orange property template as Chennai, with the `noida` landmark vector.

### 1.12 Pune (`prop-red-pune.png` vs `red-property-card.png`)
* **Official Scans:** Kentucky Avenue (₹3M). Red header bar. Cash circle ₹3. RENT table of 1: ₹2M, 2: ₹3M, 3: ₹6M.
* **First-Pass Generated:** Plain text, thin fort battlements icon.
* **Perfectionist Improvements:**
  - Highlight `3 (set): ₹6Cr` in solid red (`#ED1C24`).
  - Add house/hotel vector icons at the bottom.
  - Scale up the `pune` landmark icon.

### 1.13 Bengaluru (`prop-red-bengaluru.png` vs `red-property-card.png`)
* **Official Scans:** Indiana Avenue (₹3M). Same layout as Pune.
* **First-Pass Generated:** Generic layout, thin silicon leaf icon.
* **Perfectionist Improvements:**
  - Same red property template as Pune, with the `bengaluru` landmark vector.

### 1.14 Gurugram (`prop-red-gurugram.png` vs `red-property-card.png`)
* **Official Scans:** Illinois Avenue (₹3M). Same layout as Pune.
* **First-Pass Generated:** Thin tower icon, generic font.
* **Perfectionist Improvements:**
  - Same red property template as Pune, with the `gurugram` landmark vector.

### 1.15 Goa (`prop-yellow-goa.png` vs `yellow-property-card.png`)
* **Official Scans:** Atlantic Avenue (₹3M). Yellow header bar. Cash circle ₹3. RENT table of 1: ₹2M, 2: ₹4M, 3: ₹6M.
* **First-Pass Generated:** White text on yellow header (completely unreadable). No set highlight.
* **Perfectionist Improvements:**
  - Change yellow header text color to dark black (`#000000`).
  - Highlight `3 (set): ₹6Cr` in yellow (`#FEF200`) with black text.
  - Add house/hotel vector icons at the bottom.
  - Make palm tree watermark thicker.

### 1.16 Coimbatore (`prop-yellow-coimbatore.png` vs `yellow-property-card.png`)
* **Official Scans:** Ventnor Avenue (₹3M). Same layout as Goa.
* **First-Pass Generated:** Unreadable white text on yellow, thin spinning wheel icon.
* **Perfectionist Improvements:**
  - Same yellow property template as Goa, with the `coimbatore` landmark vector.

### 1.17 Vizag (`prop-yellow-vizag.png` vs `yellow-property-card.png`)
* **Official Scans:** Marvin Gardens (₹3M). Same layout as Goa.
* **First-Pass Generated:** Unreadable header, thin submarine icon.
* **Perfectionist Improvements:**
  - Same yellow property template as Goa, with the `vizag` landmark vector.

### 1.18 New Delhi (`prop-green-newdelhi.png` vs `green-property-card.png`)
* **Official Scans:** Pacific Avenue (₹4M). Green header bar. Cash circle ₹4. RENT table of 1: ₹2M, 2: ₹4M, 3: ₹7M.
* **First-Pass Generated:** Plain text, thin India Gate icon.
* **Perfectionist Improvements:**
  - Highlight `3 (set): ₹7Cr` in solid green (`#1FB25A`).
  - Add house/hotel vector icons at the bottom.
  - Scale up India Gate landmark.

### 1.19 Navi Mumbai (`prop-green-navimumbai.png` vs `green-property-card.png`)
* **Official Scans:** North Carolina Avenue (₹4M). Same layout as New Delhi.
* **First-Pass Generated:** Generic layout, thin sea link icon.
* **Perfectionist Improvements:**
  - Same green property template as New Delhi, with the `navimumbai` landmark vector.

### 1.20 Thane (`prop-green-thane.png` vs `green-property-card.png`)
* **Official Scans:** Pennsylvania Avenue (₹4M). Same layout as New Delhi.
* **First-Pass Generated:** Thin lotus icon, generic font.
* **Perfectionist Improvements:**
  - Same green property template as New Delhi, with the `thane` landmark vector.

### 1.21 South Mumbai (`prop-darkBlue-southmumbai.png` vs `dark-blue-property-card.png`)
* **Official Scans:** Park Place (₹4M). Dark blue header bar. Cash circle ₹4. RENT table of 1: ₹3M, 2: ₹8M.
* **First-Pass Generated:** Generic font, thin Gateway of India icon.
* **Perfectionist Improvements:**
  - Highlight `2 (set): ₹8Cr` in solid dark blue (`#003F9E`).
  - Add house/hotel vector icons at the bottom.
  - Thicken Gateway of India icon path and position it.

### 1.22 Lutyens Delhi (`prop-darkBlue-lutyensdelhi.png` vs `dark-blue-property-card.png`)
* **Official Scans:** Boardwalk (₹4M). Same layout as South Mumbai.
* **First-Pass Generated:** Thin colonnade icon, generic font.
* **Perfectionist Improvements:**
  - Same dark blue property template as South Mumbai, with the `lutyensdelhi` landmark vector.

### 1.23 Mumbai Local (`prop-railroad-mumbailocal.png` vs `railroad-property-card.png`)
* **Official Scans:** Reading Railroad (₹2M). Black header bar with train icon. Cash circle ₹2. RENT table of 1: ₹1M, 2: ₹2M, 3: ₹3M, 4: ₹4M. No house/hotel cost details.
* **First-Pass Generated:** Generic font, thin train icon, plain text.
* **Perfectionist Improvements:**
  - Render a solid black highlighted block (`#2C2C2C`) behind `4: ₹4Cr`.
  - Remove house/hotel costs completely.
  - Scale up train icon.

### 1.24 Delhi Metro (`prop-railroad-delhimetro.png` vs `railroad-property-card.png`)
* **Official Scans:** Pennsylvania Railroad (₹2M). Same layout as Mumbai Local.
* **First-Pass Generated:** Simple layout, thin metro icon.
* **Perfectionist Improvements:**
  - Same railroad template as Mumbai Local, with the `delhimetro` landmark vector.

### 1.25 Namma Metro (`prop-railroad-nammametro.png` vs `railroad-property-card.png`)
* **Official Scans:** B&O Railroad (₹2M). Same layout as Mumbai Local.
* **First-Pass Generated:** Thin elevated metro icon.
* **Perfectionist Improvements:**
  - Same railroad template as Mumbai Local, with the `nammametro` landmark vector.

### 1.26 Howrah Express (`prop-railroad-howrahexpress.png` vs `railroad-property-card.png`)
* **Official Scans:** Short Line (₹2M). Same layout as Mumbai Local.
* **First-Pass Generated:** Thin steam train icon.
* **Perfectionist Improvements:**
  - Same railroad template as Mumbai Local, with the `howrahexpress` landmark vector.

### 1.27 Power Grid (`prop-utility-powergrid.png` vs `utility-property-card.png`)
* **Official Scans:** Electric Company (₹2M). Teal/Green header bar. Cash circle ₹2. RENT table of 1: ₹1M, 2: ₹2M. No house/hotel costs.
* **First-Pass Generated:** Generic font, thin pylon icon, plain text.
* **Perfectionist Improvements:**
  - Highlight `2: ₹2Cr` in utility green (`#00796B`).
  - Scale and center pylon landmark vector.

### 1.28 Water Works (`prop-utility-waterworks.png` vs `utility-property-card.png`)
* **Official Scans:** Water Works (₹2M). Same layout as Power Grid.
* **First-Pass Generated:** Thin tap icon, generic font.
* **Perfectionist Improvements:**
  - Same utility template as Power Grid, with the `waterworks` landmark vector.

---

## 2. WILD PROPERTY CARDS (9 Unique Designs)

### 2.1 Wild Multicolor (`wild-rainbow.png` vs `multicolor-wildcard-card.png`)
* **Official Scans:** Multi-color rainbow card. Text "Property Wild Card". Displays a vertical rainbow gradient with card descriptions in white.
* **First-Pass Generated:** Simple, flat linear rainbow gradient, generic font.
* **Perfectionist Improvements:**
  - Use a multi-color radial or rich gradient.
  - Add the double white border frame.
  - Draw a detailed border line and stylized text "WILD" using Outfit-ExtraBold.

### 2.2 Station/Utility Wild (`wild-railroad-utility.png` vs `railraod-and-utility-wildcard-card.png`)
* **Official Scans:** 50/50 vertical/diagonal split of Black (Station) and Teal (Utility). Displays rent tables of both sets on their respective halves.
* **First-Pass Generated:** Flat split background, simple text.
* **Perfectionist Improvements:**
  - Draw a sharp white divider line separating the two colors.
  - Render the Station rent ladder on the black side, and the Utility rent ladder on the teal side in micro-fonts.

### 2.3 Station/Green Wild (`wild-railroad-green.png` vs `railraod-and-green-wildcard-card.png`)
* **Official Scans:** Split of Black (Station) and Green. Shows rent tables for both.
* **First-Pass Generated:** Flat split background, generic fonts.
* **Perfectionist Improvements:**
  - Same split rent table layout using Black and Green (`#1FB25A`).

### 2.4 Station/Light Blue Wild (`wild-railroad-lightBlue.png` vs `railraod-and-light-blue-wildcard-card.png`)
* **Official Scans:** Split of Black and Light Blue. Shows rent tables.
* **First-Pass Generated:** Simple split.
* **Perfectionist Improvements:**
  - Same split rent table layout using Black and Light Blue (`#55C3F0`).

### 2.5 Dark Blue/Green Wild (`wild-darkBlue-green.png` vs `dark-blue-and-green-wildcard-card.png`)
* **Official Scans:** Split of Dark Blue and Green. Shows rent tables.
* **First-Pass Generated:** Simple split.
* **Perfectionist Improvements:**
  - Same split rent table layout using Dark Blue (`#003F9E`) and Green (`#1FB25A`).

### 2.6 Pink/Orange Wild (`wild-pink-orange.png` vs `orange-and-pink-wildcard-card.png`)
* **Official Scans:** Split of Pink and Orange. Shows rent tables.
* **First-Pass Generated:** Simple split.
* **Perfectionist Improvements:**
  - Same split rent table layout using Pink (`#D93A96`) and Orange (`#F7941D`).

### 2.7 Red/Yellow Wild (`wild-red-yellow.png` vs `red-and-yellow-wildcard-card.png`)
* **Official Scans:** Split of Red and Yellow. Shows rent tables.
* **First-Pass Generated:** Simple split.
* **Perfectionist Improvements:**
  - Same split rent table layout using Red (`#ED1C24`) and Yellow (`#FEF200`).

### 2.8 Light Blue/Brown Wild (`wild-lightBlue-brown.png` vs `light-blue-and-brown-wildcard-card.png`)
* **Official Scans:** Split of Light Blue and Brown. Shows rent tables.
* **First-Pass Generated:** Simple split.
* **Perfectionist Improvements:**
  - Same split rent table layout using Light Blue (`#55C3F0`) and Brown (`#955436`).

### 2.9 Light Blue/Station Wild (`wild-lightBlue-railroad.png` vs `railraod-and-light-blue-wildcard-card.png`)
* **Official Scans:** Split of Light Blue and Black. Shows rent tables.
* **First-Pass Generated:** Simple split.
* **Perfectionist Improvements:**
  - Same split rent table layout using Light Blue (`#55C3F0`) and Black (`#2C2C2C`).

---

## 3. MONEY CARDS (6 Unique Designs)

### 3.1 ₹1Cr Money (`money-1cr.png` vs `1M-money-card.png`)
* **Official Scans:** Pale green background. Large circular radiating watermark in the center. Large denomination "1M". Corner badges.
* **First-Pass Generated:** Plain green gradient, simple text, no watermark.
* **Perfectionist Improvements:**
  - Use a circular `<radialGradient>` for a glowing center.
  - Implement a repeating diagonal watermark background pattern (`#FFFFFF` with 4% opacity).
  - Add a large background Rupee sign (`₹`) watermark with a soft drop shadow.

### 3.2 ₹2Cr Money (`money-2cr.png` vs `2M-money-card.png`)
* **Official Scans:** Same layout, different denomination ("2M").
* **First-Pass Generated:** Plain gradient.
* **Perfectionist Improvements:**
  - Apply the polished money template for ₹2Cr.

### 3.3 ₹3Cr Money (`money-3cr.png` vs `3M-money-card.png`)
* **Official Scans:** Same layout, different denomination ("3M").
* **First-Pass Generated:** Plain gradient.
* **Perfectionist Improvements:**
  - Apply the polished money template for ₹3Cr.

### 3.4 ₹4Cr Money (`money-4cr.png` vs `4M-money-card.png`)
* **Official Scans:** Same layout, different denomination ("4M").
* **First-Pass Generated:** Plain gradient.
* **Perfectionist Improvements:**
  - Apply the polished money template for ₹4Cr.

### 3.5 ₹5Cr Money (`money-5cr.png` vs `5M-money-card.png`)
* **Official Scans:** Same layout, different denomination ("5M").
* **First-Pass Generated:** Plain gradient.
* **Perfectionist Improvements:**
  - Apply the polished money template for ₹5Cr.

### 3.6 ₹10Cr Money (`money-10cr.png` vs `10M-money-card.png`)
* **Official Scans:** Goldish-green premium layout. "10M" denomination.
* **First-Pass Generated:** Plain green gradient.
* **Perfectionist Improvements:**
  - Make the gradient for ₹10Cr slightly more golden-green to emphasize its high value.
  - Apply the polished money template.

---

## 4. ACTION CARDS (12 Unique Designs)

### 4.1 Deal Breaker (`action-dealBreaker.png` vs `deal-breaker-action-card.png`)
* **Official Scans:** Dark blue/purple gradient. "ACTION" gold tab at top. Gavel icon inside a bordered circle in the center. Large title "DEAL BREAKER".
* **First-Pass Generated:** Flat blue background, thin icon, plain text layout.
* **Perfectionist Improvements:**
  - Add the yellow/gold "ACTION" banner tab at the top.
  - Enclose the gavel icon in a double-ring circle with border and shadow.
  - Place description text inside a semi-transparent black pill box at the bottom.

### 4.2 Debt Collector (`action-debtCollector.png` vs `debt-collector-action-card.png`)
* **Official Scans:** Same template, bank facade icon.
* **First-Pass Generated:** Simple blue layout, generic font.
* **Perfectionist Improvements:**
  - Apply the action card template with the bank facade icon.

### 4.3 Forced Deal (`action-forcedDeal.png` vs `force-deal-action-card.png`)
* **Official Scans:** Same template, horizontal swap arrows icon.
* **First-Pass Generated:** Generic layout.
* **Perfectionist Improvements:**
  - Apply the action card template with swap arrows.

### 4.4 Sly Deal (`action-slyDeal.png` vs `sly-deal-action-card.png`)
* **Official Scans:** Same template, stealthy eye icon.
* **First-Pass Generated:** Generic layout.
* **Perfectionist Improvements:**
  - Apply the action card template with the stealthy eye icon.

### 4.5 Pass Go (`action-passGo.png` vs `pass-go-action-card.png`)
* **Official Scans:** Same template, running man icon.
* **First-Pass Generated:** Generic layout.
* **Perfectionist Improvements:**
  - Apply the action card template with the running man icon.

### 4.6 Mera Birthday! (`action-birthday.png` vs `it's-my-birthday-action-card.png`)
* **Official Scans:** Same template, cake icon.
* **First-Pass Generated:** Generic layout.
* **Perfectionist Improvements:**
  - Apply the action card template with a layered birthday cake icon.

### 4.7 Nahi! (`action-justSayNo.png` vs `just-say-no-action-card.png`)
* **Official Scans:** Unique red accent border/background for Just Say No. Large block warning icon.
* **First-Pass Generated:** Plain blue layout with standard circle badge.
* **Perfectionist Improvements:**
  - Make the corner cash value circle have a bright red solid background with white text.
  - Add a bold red warning block accent behind the main title.
  - Apply the action card template with the JSN block icon.

### 4.8 Double Rent! (`action-doubleRent.png` vs `double-the-rent-action-card.png`)
* **Official Scans:** Same template, upward chart trend icon.
* **First-Pass Generated:** Generic layout.
* **Perfectionist Improvements:**
  - Apply the action card template with the trend line icon.

### 4.9 Ghar (`action-house.png` vs `house-action-card.png`)
* **Official Scans:** Greenish-blue template. Large green house icon.
* **First-Pass Generated:** Plain action card template.
* **Perfectionist Improvements:**
  - Make the background gradient shift towards green-teal (`#004D40` to `#00796B`) to match the house color.
  - Render a large green house outline in the center circle.

### 4.10 Hotel (`action-hotel.png` vs `hotel-action-card.png`)
* **Official Scans:** Reddish-blue template. Large red hotel icon.
* **First-Pass Generated:** Plain action card template.
* **Perfectionist Improvements:**
  - Make the background gradient shift towards red-purple (`#4A0033` to `#7B1FA2`) to match the hotel color.
  - Render a large red hotel outline in the center circle.

### 4.11 Insurance (`action-insurance.png` vs —)
* **Official Scans:** Custom card. No official scan.
* **First-Pass Generated:** Simple teal background.
* **Perfectionist Improvements:**
  - Render a premium dark teal gradient (`#004D40` to `#00796B`) with a prominent gold/yellow "CUSTOM ACTION" banner tab at the top.
  - Centered gold shield outline icon.

### 4.12 Sabotage (`action-sabotage.png` vs —)
* **Official Scans:** Custom card. No official scan.
* **First-Pass Generated:** Simple purple background.
* **Perfectionist Improvements:**
  - Render a premium dark purple gradient (`#4A148C` to `#7B1FA2`) with a gold/yellow "CUSTOM ACTION" banner tab.
  - Centered gold split-hands trade icon.

---

## 5. RENT CARDS (6 Unique Designs)

### 5.1 Rent: Brown/Light Blue (`rent-brown-lightBlue.png` vs `brown-and-light-blue-rent-card.png`)
* **Official Scans:** Diagonal split of Brown and Light Blue. Circle in the center with a large dark Rupee symbol. Below is the Rent title.
* **First-Pass Generated:** Simple split background, plain center Rupee sign.
* **Perfectionist Improvements:**
  - Add a crisp 4px white line divider along the diagonal split.
  - Render the central white badge with double borders and a drop shadow.
  - Style the Rupee icon in Outfit-ExtraBold with shadow.

### 5.2 Rent: Pink/Orange (`rent-pink-orange.png` vs `orange-and-pink-rent-card.png`)
* **Official Scans:** Split of Pink and Orange. Same layout.
* **First-Pass Generated:** Simple split.
* **Perfectionist Improvements:**
  - Apply the rent card template using Pink (`#D93A96`) and Orange (`#F7941D`).

### 5.3 Rent: Red/Yellow (`rent-red-yellow.png` vs `red-and-yellow-rent-card.png`)
* **Official Scans:** Split of Red and Yellow. Same layout.
* **First-Pass Generated:** Simple split.
* **Perfectionist Improvements:**
  - Apply the rent card template using Red (`#ED1C24`) and Yellow (`#FEF200`).

### 5.4 Rent: Green/Dark Blue (`rent-green-darkBlue.png` vs `blue-and-green-rent-card.png`)
* **Official Scans:** Split of Green and Dark Blue. Same layout.
* **First-Pass Generated:** Simple split.
* **Perfectionist Improvements:**
  - Apply the rent card template using Green (`#1FB25A`) and Dark Blue (`#003F9E`).

### 5.5 Rent: Station/Utility (`rent-railroad-utility.png` vs `railroad-and-utility-rent-card.png`)
* **Official Scans:** Split of Black (Station) and Teal (Utility). Same layout.
* **First-Pass Generated:** Simple split.
* **Perfectionist Improvements:**
  - Apply the rent card template using Black (`#2C2C2C`) and Utility Teal (`#00796B`).

### 5.6 Wild Rent (`rent-wild.png` vs `all-color-wild-rent-card.png`)
* **Official Scans:** Green gradient background. Center Rupee badge. Tells player "Rent from any player".
* **First-Pass Generated:** Simple green gradient.
* **Perfectionist Improvements:**
  - Apply the money card radial gradient, background watermark pattern, and double-borders.
  - Render the center Rupee badge.
