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

## Supabase deployed

The owner approved creation in `cartelug's Org`. The Supabase project-creation cost was confirmed as **USD 0/month**. The dedicated **FODMAN Lending V1** project (`pmytoakpwsbgphbyskal`, EU Central) is healthy. Both repository migrations were applied, and both Edge Functions are active: `lending-intake` with custom Turnstile protection and gateway JWT verification disabled, and `staff-invite` with gateway JWT verification enabled plus administrator checks in its body.

The index migration covers the six foreign keys flagged by the performance advisor and adds a primary key to internal rate-limit events. All 35 database checks passed again with both migrations applied. Remote privilege inspection confirms RLS on all eight tables, no anonymous or signed-in execution of the server-only website intake RPC, and no direct payment inserts by signed-in clients. Live HTTP checks also passed: anonymous borrower reads and staff snapshots return 401, unconfigured public intake returns 403, and unauthenticated invitations return 401.

Security advisor notices remain for the intentionally protected, role-checked `SECURITY DEFINER` staff RPCs ([advisor reference](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable)). The internal rate-limit table intentionally has no client policies and denies client access ([advisor reference](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy)). Performance notices are now limited to indexes unused in the empty project ([advisor reference](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index)); these necessary indexes are retained.

## Activation still required

Francis's login email was supplied privately and is not committed to this public repository. His Auth account and administrator bootstrap are still pending. The dashboard remains signed out after the secure sign-in prompt timed out. Its account/settings controls and Edge secret configuration require dashboard access. Cloudflare's dashboard previously stayed on security verification in this cloud browser; Pages hosting and Turnstile are not configured.

The company rate and limits remain unconfirmed. The demonstration's rate is fictional. Production browser configuration remains empty, so real staff sign-in and online database intake remain disabled; the existing website WhatsApp enquiry still works. Deployed functions reject requests while the required origins/secrets are absent.

Full remote workflow acceptance, real email delivery and phone/laptop shared-record verification must be completed after activation. No paid services were purchased or enabled.
