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


## Photo credits

The background photos in `public/backgrounds/` come from [Unsplash](https://unsplash.com) and are used under the [Unsplash License](https://unsplash.com/license). Attribution is not required by the licence; it is given here as thanks.

| File | Photographer | Source |
| --- | --- | --- |
| `blue-gold.jpg` | Maksym Tymchyk | https://unsplash.com/photos/DbCggUHnSXs |
| `green-leaves.jpg` | Valkyrie Pierce | https://unsplash.com/photos/5H5xjUsgpLY |
| `pink-roses.jpg` | Georgia de Lotz | https://unsplash.com/photos/1n_HNfGVBxE |
| `white-paper.jpg` | Annie Spratt | https://unsplash.com/photos/qJQcpKHtkJI |
| `botanical-paper.jpg` | Annie Spratt | https://unsplash.com/photos/Yu-PUYHMVlg |

Files were downloaded at 1400px wide from `images.unsplash.com`. When adding more, use only photos marked "Free" (not Unsplash+, which has a different licence), and add them to `src/lib/photos.ts` and this table.

## Animated scenes and ornaments

The animated skies (`src/components/invite/Scene.tsx`, `src/lib/scenes.ts`) and the SVG ornaments (`src/components/invite/Ornaments.tsx`) are original work, drawn for this project.

## Icon library

`src/components/icons/` holds the icon vocabulary (about 100 icons) and a set of decorative SVGs. Browse them, in any colour, at `/icons`.

- **Names are `category-name`**, for example `wedding-rings`, `ceremony-lamp`, `rsvp-check-circle`, `nav-whatsapp`. Categories: event, wedding, ceremony, party, baby, corporate, rsvp, nav.
- **Use one:** `<Icon name="wedding-rings" size={24} />`. Decorative ones: `<Decor name="decor-mandala-02" />`.
- **Colour comes from CSS**, never from the file. Icons use `currentColor` (or `--icon-color` when set), so one asset fits every template: `.my-template { --icon-color: #b8893a; }`.
- **Icons are decorative by default** (`aria-hidden`). Pass `label` when an icon stands alone and carries meaning.
- **General icons** come from [Lucide](https://lucide.dev) (ISC licence). **Everything marked custom** (rings, lamp, temple, mosque, star and crescent, cross, lotus, bride, groom, couple, dance, balloon, fireworks, baby items, WhatsApp, and all `decor-*` extras) is drawn for this project.
- **Cultural and religious icons are optional assets.** Offer them in the editor; never insert one automatically because of a host's religion. There is deliberately no region-specific pattern in the default set.
- To add an icon: draw it on a 24x24 grid with a 1.6 stroke in `custom.tsx`, register it in `registry.ts`, and check it at `/icons`.
