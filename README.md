# Fodman International — Website

A complete corporate website for **Fodman International Ltd** — *Finance · Trust · Growth* —
built around the official globe-and-arrows brand identity and the company's six service lines.

## Brand system
- **Purple** `#4A2178` (logo arrows) · **Plum** `#240F45` · **Silver** `#A0A0A8` (globe)
- **Display type:** Syne · **Body type:** Knockout (self-hosted WOFF2)
- **Logo:** full lockup on dark, globe mark for nav/favicon (`assets/fodman-lockup.png`, `assets/fodman-mark.png`)
- **Signature motif:** the three descending arrows — reused in the preloader animation

## Pages
| File | Purpose |
|------|---------|
| `index.html` | Home — hero, six service lines, capabilities, sectors, region |
| `services.html` | Services hub — all six lines |
| `lending.html` | Financial Services / Fodman Lending Desk |
| `supply-chain.html` | Logistics & Supplies |
| `consultancy.html` | Management Consultancy |
| `advisory.html` | Research & Evaluation |
| `real-estate.html` | Real Estate Agency |
| `tours-travel.html` | Tours & Travel |
| `about.html` | History, mission/values, leadership, governance |
| `contact.html` | RFQ form (WhatsApp + email) + contact details |
| `privacy.html` / `terms.html` | Legal |
| `404.html` | Not-found page |

## Features
- Custom preloader drawing the brand arrows into the globe
- Sticky nav with a **Services dropdown**; responsive mobile menu
- Scroll-reveal animations, animated counters, partner ticker (all degrade without JS)
- **RFQ form wired to WhatsApp + email** — no backend required
- SEO: per-page meta, Open Graph, `sitemap.xml`, `robots.txt`, favicons
- Fully responsive with reduced-motion support

## Deploying
Static site — no build step. Push to `main` and the included GitHub Actions workflow
(`.github/workflows/deploy.yml`) publishes to GitHub Pages. Or drop the folder onto any
static host (Netlify, Vercel, cPanel).

## Maintaining shared regions
Nav, footer, and preloader are identical across pages. To change them, edit
`scratchpad/build.py`'s canonical blocks and re-run it — it injects the regions into every page.

---
Contact confirmed against Fodman's corporate profile. HQ address, the two-vs-six service
scope, and Real Estate / Tours copy are marked for final confirmation with the client.
