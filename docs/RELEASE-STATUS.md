# V1 release check — 1 October 2026

The V1 source is merged to `main`. GitHub CI and GitHub Pages deployment passed.
The published [demonstration](https://cartelug.github.io/fodman_website/desk/)
was opened and its dashboard verified in the browser. Use **Open demonstration**.
The public demo uses fictional records; it is not activated for real lending.

## Completed and verified locally

- Five calculation tests: exact whole-UGX rounding, monthly flat interest, month-end/leap-year anchoring, partial/full settlement and due-date handling.
- Thirty-five database checks executed against the actual SQL in PostgreSQL/PGlite: staff roles and direct-write restrictions, duplicate requests, one loan per application, repayment reversal, settlement, unauthorised access, public intake limits and two-person approval.
- Five intake Edge Function tests: exact origins, required consent and bounded values, Turnstile hostname/action, reference-only response and missing-secret protection. External Turnstile and Supabase services were mocked for these tests.
- Browser checks: desktop and 390px mobile; new request → approved terms → disbursement → partial repayment → receipt → reconciled report. Public-form fallback and confirmed submission/retry handling also passed. No uncaught page errors. The local test used a packaged Chromium 143 binary after the default browser download was unavailable.
- Production output built with an allowlist: public assets/screens only. No server credentials, database scripts, tests or sample database records in the Cloudflare output.

## Activation still required

No live Supabase project was changed in this session. The connected Supabase app's project commands were not exposed to this session, and the separate CLI has no authenticated access token. Cloudflare's dashboard stayed on security verification in this cloud browser.

Francis's verified login email has not been supplied. The company rate and limits remain unconfirmed. The demonstration's rate is fictional. The production configuration is empty, so real staff sign-in and online database intake remain disabled; the existing website WhatsApp enquiry still works.

Remote acceptance, real email delivery, Supabase advisors and phone/laptop shared-record verification must be completed after activation. No paid services were purchased or enabled.
