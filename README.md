# Fodman International — Website

A complete corporate website for **Fodman International Ltd** — *Finance · Trust · Growth* —
built around the official globe-and-arrows brand identity and the company's six service lines.

## Brand system
- **Purple** `#4A2178` (logo arrows) · **Plum** `#240F45` · **Silver** `#A0A0A8` (globe)
- **Display type:** Plus Jakarta Sans · **Body type:** Inter (Google Fonts) — chosen for readability and a trustworthy finance feel
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
The corporate site is static. Its GitHub Pages publishing source is configured
in the repository settings. The lending deployment has its own build and setup
instructions below; it does not require a paid host.

## Lending software V1

The lending software lives in `desk/`. Use `staff.html` for the staff gateway,
and [LENDING-V1.md](LENDING-V1.md) for implementation, validation and free deployment.
Francis starts as the only administrator, with additional user roles available later.
The website's Apply links feed the same application form. While live setup is pending,
it keeps the existing WhatsApp enquiry flow. Demonstration records are fictional.

The corporate website remains on GitHub Pages; the live staff desk is hosted on Netlify
with a dedicated Supabase project. No live credentials or records are in this repo.

## Maintaining shared regions
Nav, footer, and preloader are duplicated across pages so each is a standalone
static file. When changing a shared region, apply the same edit to every
`*.html` file (a simple find-and-replace across the folder keeps them in sync).

---
Contact confirmed against Fodman's corporate profile. HQ address, the two-vs-six service
scope, and Real Estate / Tours copy are marked for final confirmation with the client.

## Release handoff

Live desk: https://fodman-lending-v1.netlify.app/desk/

- [Francis quick start](docs/FRANCIS-QUICK-START.md)
- [Remaining account setup](docs/ACTIVATION-CHECKLIST.md)
- [Release validation](docs/RELEASE-STATUS.md)

The Netlify root address opens the lending desk. Automated email features remain disabled until delivery is verified; the website application form currently prepares a WhatsApp enquiry.
