# Design System Analysis — Monopoly Deal (Indian Edition)

This document outlines the visual specifications, layouts, colors, and typography rules extracted for the card redesign of Dhandha (Monopoly Deal Indian Edition).

---

## 1. Card Specifications & Canvas Dimensions
* **Width:** 420 px
* **Height:** 610 px (Matches 5:7 standard playing card aspect ratio)
* **Border Radius:** 24 px
* **Fonts:** `DM Sans` (bold, semi-bold, extra-bold) / Sans-serif fallback.

---

## 2. Card Layouts

### 2.1 Property Cards
Property cards feature a colored header bar, bank value circle in the top-left, rent list in the body, a landmark illustration/icon, and building costs at the bottom.

* **Background:** Solid white (`#FFFFFF`).
* **Header Bar:**
  * **Dimensions:** Width 390 px, Height 110 px (indented 15px from left/right/top).
  * **Border Radius:** 10 px (top-left/top-right only).
  * **Text:** Bold, uppercase property name. Font size `24px`. Text color is white (except Yellow/Light Blue which use black `#000000`).
* **Corner Circle (Bank Value):**
  * **Position:** Center at `(45, 45)`.
  * **Radius:** 22 px.
  * **Background:** White (`#FFFFFF`).
  * **Border:** 3px solid property set color.
  * **Text:** The property value (e.g., `₹1`, `₹2`, `₹3`, `₹4`) in extra-bold property color, size `14px`.
* **Body Rent Ladder:**
  * **Label:** "RENT" in small grey text (`#888888`), font size `11px`, bold, letter-spacing `0.06em`.
  * **Rows:** Indented left, aligned vertically.
    * Left side shows card count (e.g., `1`, `2`, `3 (set)`).
    * Right side shows rent value (e.g., `₹1M`, `₹2M`, `₹3M`).
    * Highlighting: The row representing a completed set is bolded and highlighted in the property's color.
* **Landmark Icon:**
  * **Position:** Rendered next to the rent ladder, size `80px`, rendered with the property set color.
* **Bottom Bar:**
  * **Text:** Building costs "House: ₹3Cr  Hotel: ₹4Cr" in small text (`#555555`), size `12px`.
  * *Note:* Railroad and Utility cards do not have this bottom bar or building costs.

---

### 2.2 Money Cards
Money cards feature a full green gradient background with a large center denomination.

* **Background:** Linear gradient at 145 degrees from `#2E7D32` (dark green) to `#43A047` (medium green).
* **Card Border:** Subtle white inset border (thickness 2px, inset 15px).
* **Value Text (Center):**
  * Large centered text showing value (e.g., `₹1Cr`, `₹5Cr`, `₹10Cr`) in extra-bold white (`#FFFFFF`), size `64px`, with a subtle drop shadow.
* **"MONEY" Label:**
  * Centered below value text in semi-bold white (`#FFFFFF`) with 70% opacity, size `18px`, letter-spacing `0.1em`.
* **Corner Badges:**
  * Small value badges (e.g., `₹1Cr`) in top-left and bottom-right corners.

---

### 2.3 Action Cards
Action cards feature a deep blue/purple gradient background, a center illustration icon, action description in Hindi, and a corner bank value circle.

* **Background:** Linear gradient at 145 degrees from `#1A237E` (dark blue) to `#283593` (medium blue).
  * *Custom actions (Insurance, Sabotage):* Use dark teal gradient (`#004D40` to `#00796B`) and purple gradient (`#4A148C` to `#7B1FA2`) respectively.
* **Card Border:** Inset white border (thickness 2px, inset 15px).
* **Header Label:**
  * Small "ACTION" label in white with 75% opacity, size `12px`, letter-spacing `0.15em`, top-centered.
* **Action Title:**
  * Center-top, below header label. White extra-bold text, size `28px` (e.g., "Deal Breaker", "Mera Birthday!", "Nahi!").
* **Center Illustration / Icon:**
  * Size `90px` to `120px` in the center of the card. Color is white with 90% opacity.
* **Description Text (Bottom):**
  * Centered below the icon. Hindi text from constants/logic in semi-bold white, size `14px`, line-height `1.4`.
* **Value Badge (Corner Circle):**
  * Top-left corner white circle (diameter 44px) showing the action card's bank value (e.g., `₹5Cr`, `₹3Cr`, `₹4Cr`) in extra-bold blue/green, size `12px`.
  * *Just Say No* ("Nahi!") card features a red accent border/background for its corner badge.

---

### 2.4 Rent Cards
Rent cards feature a split background representing the two property sets they apply to, with a rupee icon in the center.

* **Background:** Diagonal split (135 degrees) or 50/50 horizontal/vertical split of the two colors.
* **Center Badge:**
  * A white circle (diameter 80px) centered on the split, with a drop shadow.
  * Inside: A bold Rupee icon (`₹`) in grey (`#333333`) or dark color, size `44px`.
* **Text (Bottom):**
  * Centered below the badge, white bold text with text-shadow showing card name: e.g., "Rent: Brown / Light Blue", size `16px`.
* **Wild Rent:**
  * Green-to-dark-green gradient background with all-color wild rent descriptions.

---

### 2.5 Wild Property Cards
Wild property cards represent multiple colors.

* **Two-Color Wilds:**
  * Split background: Diagonal split (135 degrees) of the two property colors.
  * Text: "WILD" centered in bold white, size `36px`, with text-shadow. Shows which colors are supported.
  * Cash Value Badge in the top-left corner circle.
* **Multicolor Wilds (Ten-Color):**
  * Rainbow gradient background using colors: `#FF6B6B` (pink-red), `#FFE66D` (yellow), `#4ECDC4` (teal), `#45B7D1` (light blue), and `#A855F7` (purple).
  * Center text: "WILD" in extra-bold white, size `40px` with a dark shadow.
  * Below it: "Kisi bhi color mein" in white, size `16px`.
  * Cash Value: ₹0 (No bank value badge).

---

## 3. Color Palettes (Exact HEX values)
* **Brown:** `#955436`
* **Light Blue:** `#55C3F0`
* **Pink:** `#D93A96`
* **Orange:** `#F7941D`
* **Red:** `#ED1C24`
* **Yellow:** `#FEF200`
* **Green:** `#1FB25A`
* **Dark Blue:** `#003F9E`
* **Railroad (Station):** `#2C2C2C`
* **Utility:** `#00796B`
