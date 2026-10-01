# FODMAN Lending V1

V1 is a lending-only desk connected to the existing FODMAN website. Francis starts as the only administrator. Additional staff can later be invited with administrator, loan officer, cashier or viewer access.

## Delivered

- Public application intake and the existing WhatsApp fallback.
- Shared applications, review, approval, disbursement, borrowers and loans.
- Monthly flat-interest schedules in whole UGX, with exact final-instalment rounding and anchored month-end dates.
- Cash, MoMo and bank repayments recorded after receipt of funds; printable receipts and statements.
- Administrator reversals that retain original receipts and audit history.
- Portfolio, overdue and collection totals, CSV export and dated JSON record exports.
- Database-enforced staff permissions; public applicants cannot read records.
- Idempotent application/payment retries and one loan per application.
- Optional review by a second staff member, disabled initially.
- Responsive desktop/mobile screens and an isolated demonstration using fictional records.

## Current release state

The source and demonstration are ready. The dedicated Supabase database and Francis's administrator account are installed. The owner deployed the staff portal at https://fodman-lending-v1.netlify.app/desk/ and the corporate staff link now targets it. Netlify production visibility is Public and the FODMAN sign-in screen is reachable. Application records remain protected by Supabase staff permissions. Auth redirect URLs, the server staff origin/redirect settings, and remote acceptance still require verification. The website continues its existing WhatsApp enquiry flow while public verification is unconfigured. No sample data is inserted into the live database. See `docs/RELEASE-STATUS.md` for deployment evidence and outstanding setup.

Configured loan terms start as **draft**. Francis must enter the agreed rate and limits and confirm them before an application can be approved. The demo's 2.5% monthly flat rate is fictional, not a company rate.

## Free deployment

Use the dedicated **Supabase Free** project and the owner's **Netlify Free** deployment. Retain the corporate site and fictional demonstration on GitHub Pages. The production branch is `main`, build command `npm run build`, and publish directory `dist`; `netlify.toml` pins Node 24 and preserves the security headers. The build excludes database source, tests, credentials and documentation from the hosting output. No paid add-ons are required by this code.

**Netlify staff hosting:** the owner manually deployed `fodman-lending-v1.netlify.app`. The owner made production Public. The sign-in screen and fictional demonstration were verified in a browser, and the staff page returns HTTP 200 with the configured security headers. Previews can remain private. This exposes the application files and sign-in screen, while database permissions continue to protect lending records. The intended Free plan is USD 0/month with a 300-credit hard limit; projects pause at the limit and there is no automatic recharge. The owner's actual Netlify plan has not been inspected. Only the account owner needs hosting access; Francis and later lending staff sign in through Supabase. Netlify was chosen after Cloudflare browser verification failed. Hosting on Netlify does not complete Turnstile setup. Keep public applications on their WhatsApp fallback until a real verification widget and server secret are configured.

1. Create the dedicated Supabase project on the Free plan. Apply the migrations in `supabase/migrations/` in filename order. Do not apply them to another business's existing schema.
2. Create Francis's verified Auth user privately, then run `supabase/bootstrap_francis.sql` with his verified login email substituted locally. Disable public Auth sign-ups. Nobody can claim administrator access from a signup form.
3. Deploy `lending-intake` with JWT verification off, and `staff-invite` with JWT verification on, using `supabase/config.toml`. The intake validates Turnstile and is the only public write path. Its SQL function is executable by the server role only.
4. Set Edge Function secrets in Supabase: `ALLOWED_ORIGINS` (`https://cartelug.github.io,https://fodman-lending-v1.netlify.app`), `TURNSTILE_SECRET_KEY`, a random `INTAKE_IP_SALT`, and `STAFF_REDIRECT_URL` (`https://fodman-lending-v1.netlify.app/desk/`). Supabase supplies its own URL and server credentials. Never copy secret credentials into browser code or GitHub.
5. Create a free Cloudflare Turnstile widget for the approved public hostnames. Put only its **site key**, the Supabase **publishable key**, Supabase project URL and Netlify staff URL into `lending-config.js`. Publishable keys start `sb_publishable_`; server keys are rejected by the frontend configuration check.
6. Set the Supabase Auth site URL and redirect allowlist to the exact staff desk URL. Built-in Supabase email delivery is restricted; before inviting staff outside the project organisation, configure a free SMTP provider in Auth. Francis can initially use a privately created verified password account.
7. Run the acceptance checks below against the actual deployment with disposable test records, then verify the terms and open the intake. Keep credentials out of chat.

## Validation

`npm ci`, `npm test`, `npm run test:database`, `npm run test:edge`, `npx playwright install chromium`, `npm run test:browser`, `npm run build`.

The database suite executes the actual migrations in PGlite (PostgreSQL), including roles and RLS. It checks duplicate retries, exact schedule totals, cashiers/viewers/loan officers, reversals, full settlement, public intake limits and two-person approval. Browser checks exercise desktop/mobile, application → approval → disbursement → partial payment → receipt/report, fallback enquiries and public submission retries. Edge tests mock external services and verify input validation, origin restrictions and Turnstile hostname/action binding.

Local checks do not establish that a remote project has been configured. Before go-live, submit from a phone and confirm the application appears on Francis's laptop; record a partial and full repayment; confirm another authorised device sees the result; verify a non-staff login cannot see data and exported totals reconcile. Check actual email delivery and run Supabase security advisors.

## Practical limits of V1

Only UGX, monthly instalments and flat monthly interest are implemented. There is no payment collection API, automatic MoMo verification, SMS sending, automatic WhatsApp sending, document-upload portal, reducing-balance interest, fees, penalties, write-offs or expense accounting. JSON exports are records backups; automated restoration/import is deliberately not exposed. Existing V700 offline/demo records are not migrated automatically. A reviewed import is a separate step if real historical records exist.

The staff desk refreshes confirmed server records every 20 seconds while active and offers manual refresh. Financial changes require a connection; offline changes are not queued. Sessions use this tab's session storage and clear on sign-out. A shared device should be signed out after use. Authorisation is looked up in the database on every protected operation, so disabling staff blocks their access immediately.

Supabase Free has project/size limits and can pause after inactivity; automatic hosted backups are not included. Export records regularly. Do not enable paid capacity without the owner's instruction.

Official references: [Supabase pricing](https://supabase.com/pricing), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [API keys](https://supabase.com/docs/guides/api/api-keys), [Edge authentication](https://supabase.com/docs/guides/functions/auth), [Auth email delivery](https://supabase.com/docs/guides/auth/auth-smtp), [Cloudflare Pages limits](https://developers.cloudflare.com/pages/platform/limits/), [Turnstile validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/).

## Final V1 handoff

The Netlify root redirects to `/desk/`. The desk includes a Help guide, resets navigation after sign-out, and avoids attributing another employee's receipt to its viewer. `emailFeaturesEnabled` is false until SMTP and exact Auth redirects are tested; password help and invitation screens explain the current availability. Public applications continue through the existing WhatsApp flow until Turnstile is configured. See `docs/FRANCIS-QUICK-START.md` and `docs/ACTIVATION-CHECKLIST.md`.
