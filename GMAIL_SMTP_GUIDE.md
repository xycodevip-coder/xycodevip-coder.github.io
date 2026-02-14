# Setting up Gmail SMTP for Supabase Edge Functions

To send emails using your Gmail account, you need to configure an "App Password" because Google blocks less secure apps by default.

## 1. Create a Google App Password
1.  Go to your [Google Account Security page](https://myaccount.google.com/security).
2.  Enable **2-Step Verification** if it's not already on.
3.  Search for **"App passwords"** in the search bar at the top (or look under the "2-Step Verification" section).
4.  Create a new app password:
    *   **App name**: `Supabase Internship`
5.  Copy the 16-character password generated (e.g., `abcd efgh ijkl mnop`).

## 2. Set Secrets in Supabase

Run the following commands in your terminal to store your credentials securely.

Replace `your-email@gmail.com` with your actual Gmail address.
Replace `abcd efgh ijkl mnop` with the 16-character App Password you just generated (remove spaces if you want, but it usually handles them).

```powershell
npx supabase secrets set SMTP_USERNAME=xycode.vip@gmail.com
npx supabase secrets set SMTP_PASSWORD="gfwy idgb xbdw vvrh"
```

## 3. Deploy the Updated Function

Run the deploy command again to push the new code:

```powershell
npx supabase functions deploy send-acceptance-email --no-verify-jwt
```

## 4. Test
Go to your Admin Dashboard and click "Accept" or "Resend Email". The email should now arrive from your Gmail address.
