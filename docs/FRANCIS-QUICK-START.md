# Francis — FODMAN Lending V1

Open https://fodman-lending-v1.netlify.app/desk/ on your phone or computer. Use your registered staff email and the password created privately for you. Keep that password private.

## Before the first real loan

1. Sign in and open **Team & settings**.
2. Confirm the company name, minimum and maximum loan, agreed flat monthly interest rate and maximum term.
3. Check the confirmation box and select **Save confirmed terms**.
4. Keep the second-reviewer requirement off while you are the only staff member.

The starting rate is intentionally blank. Demonstration rates are examples. Existing approved loans retain their agreed terms if you later change the defaults.

## Daily work

1. **Applications → New application:** enter the request after the applicant agrees to being contacted and having the request recorded. Website enquiries currently arrive through WhatsApp and must be entered here.
2. Open the application, check documents and record your review. Decide whether to approve or reject it and record the reason yourself.
3. For approval, check the principal, rate, term and repayment total before confirming.
4. After the agreement is signed and funds have actually been sent, select **Record disbursement**. Enter the date, payment method and transfer reference.
5. After receiving a repayment, open the loan and select **Record repayment**. Confirm the amount and MoMo/bank reference against your payment records.
6. Print or save the confirmed receipt. The loan balance and schedule update together.
7. At the end of the day, check **Reports**, export records to a secure location and sign out of shared devices.

The app records transfers; it does not transfer money or automatically confirm MoMo receipts. All amounts are whole Ugandan shillings. Instalments are monthly and overdue dates use Kampala time.

## Corrections and reports

- An administrator can reverse an incorrect repayment with a reason. The original receipt remains in the audit record, marked reversed. Then enter the corrected payment after checking the funds.
- Reports show principal, contracted interest, receipts and outstanding balances. They are lending records, not full expense or profit accounts.
- CSV exports show the portfolio; JSON exports preserve the confirmed records. Keep both secure. A JSON export cannot be imported through the app.
- Use **Refresh** if another device has just saved a change. Records normally refresh every 20 seconds. If the connection fails, updates are paused until the connection is restored.

## Passwords and additional staff

Use **My account / Team & settings → Change password** while signed in. If locked out, contact the account administrator. Automated password-reset emails and staff invitations are disabled until email delivery and redirects are configured and tested.

Your administrator can also prepare a private recovery link using Supabase's supported Auth Admin recovery API. Open that link, enter a new password of at least 12 characters twice and press **Save new password**. Then choose **Open lending desk**. Recovery links expire and can be used only once. The public reset page alone cannot restore access; it needs a valid recovery link for your account. Never put recovery links in public files or messages.

Future staff roles are built in: administrator, loan officer, cashier and viewer. Once invitations are enabled, use **Team & settings → Add user**. Do not share Francis's account with other users.

## Practising

Select **Open demonstration** on the sign-in screen. Demonstration records are fictional, stay in the current tab and do not alter the live database. **Reset demo** starts again. The **Help** button explains the workflow inside the desk.
