# Remaining activation and account setup

The staff front end is published at https://fodman-lending-v1.netlify.app/desk/ and connected to the dedicated Supabase database. The website staff link points to it. The initial administrator account is provisioned. The application files have been tested; a successful password sign-in as Francis and a real two-device acceptance check have not yet been observed.

## Required before real lending

- Francis signs in with his privately set password.
- If that password has been forgotten, the authorised project owner can generate a one-use recovery link with Supabase Auth Admin `generateLink({ type: 'recovery', email })`. Deliver its `hashed_token` privately in the fragment of the Netlify `/desk/reset.html` page. Francis enters and submits his new password himself. This uses the supported Auth API and does not require SMTP; it does not enable automatic recovery emails.
- Francis confirms the company's real rate, limits and maximum term in Team & settings. These values cannot be invented by the developer; `terms_ready` remains false until he confirms them.
- Verify the same authorised account can see confirmed records on a second device. Use a separately identified disposable test environment for a full financial acceptance cycle; do not insert fictional production loans.

## Enable account emails and future staff invitations

The Supabase dashboard session expired during final packaging. The connected database tools do not expose Auth URL settings or Edge Function secrets, so these provider settings remain manual. Password sign-in for the existing verified account does not require email delivery.

In the FODMAN Lending V1 Supabase project (`pmytoakpwsbgphbyskal`):

1. Go to **Authentication → URL Configuration**.
2. Set **Site URL** to `https://fodman-lending-v1.netlify.app/desk/`.
3. Add that exact address to **Redirect URLs**, then save. Use the production address rather than a wildcard.
4. In **Edge Functions → Secrets**, set:

| Name | Value |
|---|---|
| `ALLOWED_ORIGINS` | `https://cartelug.github.io,https://fodman-lending-v1.netlify.app` |
| `STAFF_REDIRECT_URL` | `https://fodman-lending-v1.netlify.app/desk/` |

5. Configure an approved free email provider in Supabase Auth SMTP settings. Verify its sending address/domain. The default Supabase mail service restricts recipients and is insufficient for general staff invitations. No external email provider has been selected or purchased.
6. Test delivery, the exact return address, password recovery and a least-privilege staff invitation.
7. Only after those checks pass, set `emailFeaturesEnabled: true` in `lending-config.js` and publish. This flag controls the interface; server/database permission checks remain authoritative.

Public Auth signups are already disabled. Preserve that setting. Keep all server keys and SMTP credentials out of GitHub, website files and chat.

## Enable direct public applications

The existing WhatsApp enquiry flow works now. Applicants review and send the draft themselves; Francis enters confirmed requests in the staff desk.

Direct submission is implemented but awaits anti-spam verification setup:

1. Create a free Cloudflare Turnstile widget for `cartelug.github.io` and `fodman-lending-v1.netlify.app`.
2. Save its secret as Supabase `TURNSTILE_SECRET_KEY`. Keep the existing private `INTAKE_IP_SALT`.
3. Add only the public widget site key to `turnstileSiteKey` in `lending-config.js`.
4. Verify a phone submission receives a reference and appears in the staff desk. Retry the same submission and confirm it is not duplicated. Confirm other origins, missing consent and invalid verification are rejected.

Cloudflare's verification failed in the cloud browser, so automated attempts stopped. Do not remove server verification to activate intake. Direct applications stay closed until the required configuration is present.

## Hosting and free-plan check

Netlify production visibility is now Public; database access still requires an authorised staff account. Previews may stay private. The expected build is branch `main`, command `npm run build`, publish folder `dist`, Node 24. Netlify's home address redirects to `/desk/`.

Supabase was created on Free. The owner selected Netlify manually; confirm its team plan is Free in Usage & billing. Do not activate paid add-ons. The intended Netlify Free plan pauses projects at its usage limit rather than automatically charging for extra credits.

## Official provider instructions

- [Supabase redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)
- [Supabase email delivery](https://supabase.com/docs/guides/auth/auth-smtp)
- [Turnstile server validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)
- [Netlify project visibility](https://docs.netlify.com/manage/security/secure-access-to-sites/project-visibility/)
