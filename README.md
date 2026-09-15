# Mandapam — invitation builder

Hosts sign in, pick an event type (wedding, engagement, housewarming, birthday, corporate), choose a tradition and language, and get a live-preview editor. Each event is published at its own subdomain (`meera-arjun.yourdomain.com`). Guests get personal links, reply on the page or on WhatsApp, and corporate guests get QR tickets that are scanned at the door.

Stack: Next.js 15 (App Router) · Supabase (auth, Postgres, storage) · Tailwind v4 · Vercel.

## 1. Supabase

1. Create a project at supabase.com.
2. SQL editor → paste and run `supabase/migrations/0001_init.sql`. It creates the tables, row-level security, and the `photos` and `music` storage buckets.
3. Authentication → Providers: enable **Email** (magic link is on by default). Optionally enable **Google** (add the OAuth client from Google Cloud).
4. Authentication → URL configuration: set Site URL to your app URL and add `https://app.yourdomain.com/auth/callback` and `http://localhost:3000/auth/callback` to Redirect URLs.
5. Project settings → API: copy the URL, the anon key, and the service-role key.
6. Optional: Storage → `music` bucket → create a folder `library` and upload royalty-free tracks. They appear in every host's Music tab.

## 2. Local run

```bash
cp .env.example .env.local   # fill in the Supabase values
npm install
npm run dev
```

Open http://localhost:3000. A published event named `meera-arjun` is served at http://meera-arjun.localhost:3000 (Chrome and Edge resolve `*.localhost` on their own).

## 3. Vercel + domain

1. Push this folder to a Git repo and import it in Vercel. Add the same environment variables, with:
   - `NEXT_PUBLIC_ROOT_DOMAIN=yourdomain.com`
   - `NEXT_PUBLIC_APP_URL=https://app.yourdomain.com`
2. Vercel → Project → Domains: add `yourdomain.com`, `app.yourdomain.com`, and `*.yourdomain.com` (the wildcard is what gives every event its own subdomain).
3. At your registrar, point the domain's nameservers at Vercel (simplest, and required for the wildcard), or add the records Vercel shows you.
4. Deploy. The middleware maps `<slug>.yourdomain.com` to that event; `app.` and the bare domain serve the dashboard and landing page.

## Where things live

- `src/lib/types.ts` — the `InviteConfig` shape. The invitation is a pure function of it.
- `src/lib/themes.ts` — colour presets, font pairs, per-event-type defaults.
- `src/lib/traditions.ts` — ceremony templates by religion/region. Add your own here.
- `src/lib/i18n.ts` — built-in wording sets (English, Malayalam, Hindi, Tamil, Arabic, Spanish, French). Any language works: pick "Another language" and edit the Wording tab.
- `src/components/invite/` — the public invitation: envelope gate, music engine (built-in score, uploaded track, or YouTube), countdown, RSVP form, QR ticket.
- `src/components/editor/` — the dashboard editor, guest list, door scanner.
- `src/middleware.ts` — subdomain routing and auth guard.
- `src/app/api/rsvp` and `src/app/api/checkin` — the two endpoints that write on behalf of guests and door staff.

## Music and copyright

Hosts can upload a track they have the rights to, paste a YouTube link (YouTube handles licensing and the video plays hidden inside the page), or use the built-in generated score. Bundling commercial film songs as a library would need licences from the labels; the `library` folder is meant for royalty-free music.
