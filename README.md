# Fodman International — Website (Redesigned)

A complete 5-page corporate website for Fodman International Ltd, rebuilt around
the official brand identity: the silver globe with three purple arrows descending
into East Africa.

## Brand system
- **Purple** `#4A2178` (sampled from the logo arrows) — primary
- **Silver** `#A0A0A0` (sampled from the globe) — secondary
- **Display type:** Syne · **Body type:** Inter
- **Signature motif:** the three descending arrows — reused in the preloader
  animation, section dividers, and hover cues.

## Pages
| File | Purpose |
|------|---------|
| `index.html` | Home — hero, divisions, capabilities, sectors, regional presence |
| `supply-chain.html` | Supply Chain & Logistics division |
| `advisory.html` | Research, Advisory & Capacity division |
| `about.html` | Company history, mission, values, governance |
| `contact.html` | Request for Quotation (RFQ) form + contact details |

## Features
- Custom **preloader** that draws the brand arrows into the globe on load
- Floating logo with orbital ring in the hero
- Scroll-reveal animations (gracefully degrade if JS is disabled)
- Animated stat counters, partner ticker, interactive RFQ form
- Fully responsive (desktop / tablet / mobile) with reduced-motion support

## Assets
- `assets/fodman-logo.png` — transparent logo (for light backgrounds)
- `assets/fodman-logo-light.png` — lightened arrows (for dark backgrounds)
- `assets/fodman-logo-original.png` — untouched original (backup)

## Running
Open `index.html` in any browser, or drop the whole folder onto any static host
(Netlify, Vercel, GitHub Pages, cPanel). No build step required.

---
Built by Shay Investments.
