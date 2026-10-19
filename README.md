# Fodman International — Website

The company website for **Fodman International Ltd** (*Finance · Trust · Growth*), rebuilt in October 2026
from the 2026 company profile. Live address: <https://cartelug.github.io/fodman_website/>

It is a static site: plain HTML pages, one stylesheet (`site.css`) and two small scripts. There is no build step and nothing to install.

## Pages
| File | What it is |
|------|------------|
| `index.html` | Home |
| `services.html` | The six services at a glance |
| `logistics-and-supplies.html` | Logistics and Supplies |
| `management-consultancy.html` | Management Consultancy |
| `research-and-evaluation.html` | Research and Evaluation Consultancy |
| `financial-services.html` | Financial Services (money lending), with a link to the loan application form |
| `real-estate-agency.html` | Real Estate Agency |
| `tours-and-travel.html` | Tours and Travel |
| `about.html` | Who we are: vision, values, commitment and social responsibility |
| `team.html` | Board of directors and management team |
| `company-profile.html` | The 24-page company profile, read online. The PDF is `Fodman_International_Company_Profile_2026.pdf` |
| `contact.html` | Offices in Kampala and Juba, and an enquiry form |
| `404.html` | Page not found |
| `apply.html` | Loan application form (part of the lending software, see below) |
| `privacy.html`, `terms.html` | Legal pages |

Older addresses (`supply-chain.html`, `consultancy.html`, `advisory.html`, `real-estate.html`, `tours-travel.html`,
`lending.html`, `sitemap.html`) are now small redirect pages that send visitors to the matching new page, so old links keep working.

## Brand
- Deep violet (`#22074b`, `#4b2a8c`) with gold (`#b8892b`, `#d9b25e`) on white
- Fraunces for headings and Montserrat for text, both self-hosted in `fonts/`
- The Fodman logo: `img/logo.png` and `img/logo-light.png`
- Photographs are illustrative stock images, credited in the footer of every page. Three are CC BY 2.0, so those credits must stay.

## Features
- Enquiry forms on every service page. They write a message for the visitor to copy or send from their email app, and never claim it was sent.
- A Share dialog with copy-link, WhatsApp, email and a QR code, for sending the site to clients.
- The company profile can be read online or downloaded as a PDF.
- Page titles, descriptions, share cards (`og-share.jpg`), `sitemap.xml`, `robots.txt` and structured data for search engines.

## Settings: `config.js`
Every page reads this one small file.
- `whatsapp`: the business WhatsApp number with no plus sign or spaces, for example `"256775858924"`. It is empty for now, so no WhatsApp buttons show. Fill it in once the number is confirmed.
- `endpoint`: the address of a form service such as Formspree. When set, enquiries are also posted there. Empty for now.
- `email`: where "Open email app" sends enquiries.
- `canonical`: the website address used when someone shares the site from a file instead of the live address.

## Web address
Each page names `https://cartelug.github.io/fodman_website/` as its own address (canonical link, share card, `sitemap.xml`, `robots.txt`, `config.js`).
When a company domain such as www.fodmaninternational.com is connected to GitHub Pages, replace that address in those files and add the domain in the repository's Pages settings.

## Still to confirm with the client
Each person should approve their own portrait. Wilfred Opobo has no portrait yet, so a monogram shows. Which phone numbers accept WhatsApp.
Money-lending licence details, if they should be shown. Client logos are not shown because none are confirmed in the company profile.

## Deploying
The site is published by GitHub Pages straight from the `main` branch (root folder, `.nojekyll`). Push to `main` and it updates within a minute or two.
The lending deployment has its own build and setup instructions below; it does not require a paid host.

## Lending software V1

The lending software lives in `desk/`. Use `staff.html` for the staff gateway,
and [LENDING-V1.md](LENDING-V1.md) for implementation, validation and free deployment.
Francis starts as the only administrator, with additional user roles available later.
The website's Apply links feed the same application form. While live setup is pending,
it keeps the existing WhatsApp enquiry flow. Demonstration records are fictional.

The corporate website remains on GitHub Pages; the live staff desk is hosted on Netlify
with a dedicated Supabase project. No live credentials or records are in this repo.

## Maintaining shared regions
The header, footer and share dialog are repeated in every new-design page so that each page is a standalone file.
When you change one of them, make the same edit in each of the pages listed above except `apply.html`, `privacy.html` and `terms.html`
(those three use `style.css`). A find-and-replace across the folder keeps them in sync.

## Release handoff

Live desk: https://fodman-lending-v1.netlify.app/desk/

- [Francis quick start](docs/FRANCIS-QUICK-START.md)
- [Remaining account setup](docs/ACTIVATION-CHECKLIST.md)
- [Release validation](docs/RELEASE-STATUS.md)

The Netlify root address opens the lending desk. Automated email features remain disabled until delivery is verified; the website application form currently prepares a WhatsApp enquiry.
