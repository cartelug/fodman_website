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
- Production output built with an allowlist: public assets/screens only. No server credentials, database scripts, tests or sample database records in the hosting output.

## Supabase deployed

The owner approved creation in `cartelug's Org`. The Supabase project-creation cost was confirmed as **USD 0/month**. The dedicated **FODMAN Lending V1** project (`pmytoakpwsbgphbyskal`, EU Central) is healthy. Both repository migrations were applied, and both Edge Functions are active: `lending-intake` with custom Turnstile protection and gateway JWT verification disabled, and `staff-invite` with gateway JWT verification enabled plus administrator checks in its body.

The index migration covers the six foreign keys flagged by the performance advisor and adds a primary key to internal rate-limit events. All 35 database checks passed again with both migrations applied. Remote privilege inspection confirms RLS on all eight tables, no anonymous or signed-in execution of the server-only website intake RPC, and no direct payment inserts by signed-in clients. Live HTTP checks also passed: anonymous borrower reads and staff snapshots return 401, unconfigured public intake returns 403, and unauthenticated invitations return 401.

Security advisor notices remain for the intentionally protected, role-checked `SECURITY DEFINER` staff RPCs ([advisor reference](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable)). The internal rate-limit table intentionally has no client policies and denies client access ([advisor reference](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy)). Performance notices are now limited to indexes unused in the empty project ([advisor reference](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index)); these necessary indexes are retained.

## Activation still required

The owner is signed into the FODMAN Supabase dashboard. Public staff signups are disabled (verified through the live Auth settings API). `INTAKE_IP_SALT` and the existing GitHub website's `ALLOWED_ORIGINS` are saved in the server secret vault. Francis's Auth account was created privately by the owner; the bootstrap was applied and a live database query confirmed exactly one active staff administrator named Francis. His email and credentials are not committed to this public repository. The live database contains zero applications and zero loans.

Cloudflare's browser verification still fails after the owner's manual attempt, so no further automated retries are being made. Pages hosting and Turnstile are not configured. A Netlify Free deployment is prepared in `netlify.toml`, with the existing build, security headers and Node 24. Netlify has not been opened or deployed; its account access remains the next step. The build and desktop/mobile browser checks passed again with the real Supabase public configuration.

The company rate and limits remain unconfirmed. The demonstration's rate is fictional. The real Supabase URL and publishable key are in the public browser configuration; live sign-in remains disabled on GitHub Pages and the staff-hosting URL remains blank until deployment. Public CAPTCHA configuration is still blank, so the existing website WhatsApp enquiry still works. The protected public intake returns 503 while the required Turnstile secret is absent (verified against the live function after origin configuration).

Full remote workflow acceptance, real email delivery and phone/laptop shared-record verification must be completed after activation. No paid services were purchased or enabled.
