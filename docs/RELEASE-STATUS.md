# V1 release check — 2 October 2026

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

Cloudflare's browser verification still fails after the owner's manual attempt, so no further automated retries are being made. Turnstile is not configured. The owner manually connected GitHub and deployed `fodman-lending-v1.netlify.app`, then made production Public. The `/desk/` page returns HTTP 200 with Content-Security-Policy, no-store, frame denial, nosniff, referrer and permissions headers. The live sign-in screen and fictional dashboard were verified in the browser. The actual Netlify account plan has not been inspected.

The company rate and limits remain unconfirmed. A fresh live database query confirmed one active administrator, zero applications, zero loans, and `terms_ready=false`. The demonstration's rate is fictional. The real Supabase URL and publishable key are in the public browser configuration; live sign-in remains disabled on GitHub Pages. The configured staff URL is now `https://fodman-lending-v1.netlify.app/desk/`. Supabase Auth site/redirect URLs and the server's Netlify origin plus `STAFF_REDIRECT_URL` remain pending. Public CAPTCHA configuration is still blank, so the existing website WhatsApp enquiry still works. The protected public intake returns 503 while the required Turnstile secret is absent (verified against the live function after origin configuration).

Full remote workflow acceptance, real email delivery and phone/laptop shared-record verification must be completed after activation. No paid services were purchased or enabled.


## Final polish and validation

- The Netlify root opens the lending desk directly.
- Added an in-app first-use guide and a separate Francis quick-start document.
- Sign-out clears the previous navigation/filter state; receipt labels no longer misattribute an unknown recorder to the current viewer.
- Demo approval notes and recorder identities now match the demonstrated workflow.
- Account emails and invitations have clear availability messages while provider configuration is pending.
- Five calculation tests, 35 database checks and five Edge tests passed. Expanded desktop/mobile browser checks passed, including mocked staff login, help, password-email readiness, invitation readiness and cross-staff receipt attribution. Mock tests do not establish a successful real login.
- All 95 baseline repository files were downloaded and verified against their GitHub blob hashes before packaging, including the complete corporate assets. Local HTML links and assets resolve.
- The production build passed and contains public website/desk files only.

The Supabase dashboard session is signed out. Auth URL configuration, Netlify origin/redirect secrets, SMTP delivery and Turnstile remain manual setup; the exact steps are in `ACTIVATION-CHECKLIST.md`. Existing verified password login is available, but Francis must verify his credentials and confirm real lending terms before first use. No fictional financial records were added to production.
