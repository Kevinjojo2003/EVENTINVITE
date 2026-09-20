# Setting up sign-in

Sign-in uses Supabase Auth: an email link, and optionally Google. Run the checker any time:

```bash
node scripts/check-auth.mjs
```

It reports what is configured and never prints a secret.

## 1. Tell Supabase where your site lives

Supabase > **Authentication > URL Configuration**

- **Site URL:** your live address, for example `https://yourdomain.com`.
- **Redirect URLs:** add both of these (add a line per address you use):
  - `http://localhost:3000/auth/callback`
  - `https://yourdomain.com/auth/callback`

Without this the email link opens the wrong address, or Supabase refuses it, and the login page shows "That sign-in link has expired".

## 2. Send the emails from your own address (Resend)

Supabase's built-in sender is limited to a few emails an hour and uses a generic sender, so people will not receive links reliably. Use Resend instead.

1. In Resend, add and **verify your sending domain**. Until you do, Resend only delivers to your own email.
2. In Resend, create an API key. **Never paste it into chat or commit it.** If a key was ever shared, delete it and make a new one.
3. Supabase > **Authentication > Emails > SMTP Settings** > enable custom SMTP:
   - Host `smtp.resend.com`
   - Port `465`
   - Username `resend`
   - Password: the Resend API key
   - Sender email: an address on your verified domain, for example `login@yourdomain.com`
   - Sender name: your product name
4. Send yourself a sign-in link and confirm it arrives within a minute.

## 3. Google sign-in (optional)

Skip this and the Google button stays hidden. To turn it on:

1. Google Cloud Console > create an OAuth client (type: Web application). Add Supabase's callback URL, shown on the Google provider page in Supabase, as an authorized redirect URI.
2. Supabase > **Authentication > Providers > Google**: paste the client ID and secret, and switch it on.
3. In `.env.local` (and Vercel), set `NEXT_PUBLIC_GOOGLE_AUTH=1`.

## 4. Database

Run these once, in order, in the Supabase SQL editor:

1. `supabase/migrations/0001_init.sql`
2. `supabase/migrations/0002_multi_event.sql`
3. `supabase/migrations/0003_retention.sql`, then schedule the nightly clean-up with the `cron.schedule` line written at the bottom of that file.

## 5. Test the whole path

1. Open `/login`, enter an email, and press the button. The button should pause for 60 seconds.
2. Open the email link. You should land on `/dashboard`.
3. Create an invitation from a template, publish it, open its link in a private window, and reply. Then check the reply appears in the dashboard.

If step 2 fails, re-check section 1. If no email arrives, re-check section 2.
