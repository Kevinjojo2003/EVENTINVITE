# Product audit

Written from the code and from running the site locally. Where I have not been able to test something (a real sign-in, a real phone, a screen reader), the finding says so. Nothing here is guessed to sound thorough; if a finding is uncertain, it is marked **Unverified**.

Legend: 🔴 must fix before launch · 🟠 should fix soon · 🟢 nice to have · ⭐ high-value opportunity

---

## Status update (20 September 2026)

The five launch-blocking findings from Section B have been worked on:

| # | Finding | Status |
|---|---|---|
| 1 | RSVP spam | **Fixed in code.** Hidden bot field, minimum fill time, 8 replies per network address per invitation per hour (40 overall), and a cap of 1500 replies per invitation. Tested against the running server. Limits are kept in memory per server instance: move them to Redis (Upstash) before heavy traffic. |
| 2 | Sign-in | **Improved, not verified end to end.** Clear error messages, a 60-second resend pause, `node scripts/check-auth.mjs` and `docs/SETUP-LOGIN.md`. A real email sign-in still needs the Supabase URL settings and a Resend sender, which only the account owner can set. |
| 3 | Guest data | **Fixed in code, needs a lawyer.** "Delete my reply" for guests, a 90-day automatic purge (`0003_retention.sql`, needs running and scheduling), and rewritten Privacy and Terms pages. They are still drafts. |
| 4 | Landing speed | **Fixed.** The home page ships a still invitation; the live one loads on tap, or automatically on a fast connection. |
| 5 | Language coverage | **Fixed in code, needs native review.** The newer sections, the delete-reply text and the Wording tab now use labels in all 13 languages. The translations were written by me and must be reviewed by native speakers. |

Still open from this audit: findings 6 to 21, and the launch checklist in Section J.

---

## A. Overall audit

The product is real and unusually broad: a config-driven invitation renderer, 75 templates across 9 traditions and 13 languages, per-ceremony RSVPs with headcounts, personal guest links, animated scenes, and a large icon and ornament library. The engineering is sound where it has been tested (75 templates load with no console errors; server and browser render the same text).

The weak points are not the design engine. They are **the edges around it**: sign-in is only partly set up, the signed-in dashboard has never been exercised end to end, the invitation is not yet safe against spam, guest data has no deletion path, and much of the interface text is English-only in a product that promises every language.

What is genuinely good, and why it works:
- **The invitation opens straight from a link, with the guest's name on it.** That is the product's one big idea and it is done well: no install, no sign-in for guests.
- **Everything is a config.** A template is data, so 75 templates cost almost nothing to maintain and a host can change any of it.
- **Dates and times are computed in the event's timezone**, so a wedding in Dubai reads right for a guest in Toronto.
- **Publishing is gated** on the three things an invitation cannot go live without.

---

## B. Top 10 problems

| # | Sev | Where | Problem |
|---|---|---|---|
| 1 | 🔴 | `/api/rsvp` | No spam or abuse protection. Anyone with a published link can post unlimited replies. |
| 2 | 🔴 | Login | Google sign-in is switched off in Supabase, and the button (now hidden) used to fail. Email links depend on Supabase URL settings I could not verify. **Unverified end to end.** |
| 3 | 🔴 | Data / privacy | Guest names and phone numbers are stored with no export or delete path for a guest, and the Privacy and Terms pages are unreviewed drafts. |
| 4 | 🔴 | Landing hero | The above-the-fold phone is a live embedded invitation (an iframe with fonts and scripts). On a 3G phone this is the slowest possible first paint. |
| 5 | 🟠 | Interface text | Headings and buttons are English-only for Telugu, Kannada, Urdu, Hebrew, Punjabi, German and Portuguese, and the newer sections (Where to stay, Travel, Q & A, Wedding party) are English-only for every language. |
| 6 | 🟠 | Focus states | The invitation removes the browser focus outline on inputs; the replacement (a border colour change) is faint on several themes. |
| 7 | 🟠 | Cultural accuracy | A Parsi template uses a mandap (a Hindu structure). There is no interfaith template at all. |
| 8 | 🟠 | Editor | No undo, and the editor is one long panel of tabs with many options. A first-time host can be overwhelmed. |
| 9 | 🟠 | Fonts | Google Fonts are loaded from Google's servers on every page: slower, and a GDPR concern in the EU. |
| 10 | 🟠 | Guest import | The CSV import splits on commas, so a name like "Menon, Priya" breaks. |

---

## Findings in detail

### 🔴 Must fix before launch

**1. RSVP has no abuse protection**
- **Severity:** Critical · **Location:** `src/app/api/rsvp/route.ts`
- **Problem:** the endpoint accepts unlimited anonymous POSTs for any published invitation. A script can fill a host's reply list with thousands of fake rows.
- **Why it matters:** a host cannot trust their headcount, which is the one thing the caterer needs.
- **Fix:** rate-limit by IP and by invitation (for example 5 replies per IP per hour), add a honeypot field, and cap total replies per invitation (say 3× the guest list, or 500).
- **Example:** reply 6 returns "You have replied several times already. If this is a mistake, message the hosts on WhatsApp."

**2. Sign-in is not verified end to end**
- **Severity:** Critical · **Location:** `/login`, `/auth/callback`, Supabase settings
- **Verified:** signed-out `/dashboard` redirects to `/login`; the Email provider is on. **Not verified:** a real magic link, the Site URL and redirect URLs, sender deliverability. The default Supabase sender is rate-limited to a few emails an hour.
- **Fix:** add the Site URL and `/auth/callback` redirect in Supabase; set up SMTP (Resend) with a verified sending domain; test with a fresh email. Only then set `NEXT_PUBLIC_GOOGLE_AUTH=1` if Google is enabled.

**3. Guest data lifecycle**
- **Severity:** Critical (legal) · **Location:** `guests` and `rsvps` tables; Privacy page
- **Problem:** phone numbers and names are stored in plain form; a host can delete an invitation but a guest cannot ask to be removed; nothing says how long data is kept.
- **Fix:** add "delete my reply" on the confirmation screen, a retention rule (for example delete guest data 90 days after the event), and have the Privacy page reviewed by a lawyer for India (DPDP Act) and the EU (GDPR) before launch.
- **Note (done):** the Privacy page now reads a real contact address from `NEXT_PUBLIC_CONTACT_EMAIL`. Set it.

**4. Landing hero performance**
- **Severity:** High · **Location:** `src/app/page.tsx` (hero iframe)
- **Problem:** the phone shows `/templates/kerala-hindu?embed=1`, which loads a whole invitation (fonts, animation library, ornaments) before the page feels loaded.
- **Fix:** show a static image (or the existing lightweight card) first and load the live iframe only when it scrolls into view or on tap ("Tap to open a live one").

**5. Invitations were searchable (fixed)**
- **Severity:** High · **Location:** `src/app/s/[slug]/page.tsx`
- **Was:** published invitation pages could be indexed, exposing addresses and family names.
- **Now:** all invitation pages send `noindex, nofollow`. Template sample pages stay indexable on purpose.

**6. Photos were uploaded at full size (fixed)**
- **Severity:** High · **Location:** `src/components/editor/upload.ts`
- **Was:** a 10 MB phone photo went straight to storage and was downloaded in full by every guest on mobile data.
- **Now:** photos are shrunk in the browser to at most 2000px JPEG before upload (typically 200–400 KB). Music files are untouched.

### 🟠 Should fix soon

**7. Interface language gaps**
- **Location:** `src/lib/i18n.ts`, `Invitation.tsx` (section headings), `RsvpForm.tsx`
- **Problem:** seven languages have full wording; the rest fall back to English. "Where to stay", "Travel", "Q & A", "Wedding party", "Pay with UPI", "Watch live" and "Lost on the way? Call us" are English for everyone.
- **Fix:** move every fixed string into the `Labels` set, add them for the seven languages, and mark templates whose language has no wording set with a small "Wording in English until edited" note in the gallery so hosts are not surprised.

**8. Focus visibility inside the invitation**
- **Location:** `src/app/globals.css` (`.inv input, .inv textarea { outline: none }`)
- **Fix:** keep a visible focus ring: `.inv :focus-visible { outline: 2px solid var(--inv-accent); outline-offset: 3px; }`. Check that the accent has at least 3:1 contrast against each theme background.

**9. Parsi and interfaith**
- **Location:** `src/lib/templates.ts` (`parsi-garden` uses the `garden` ornament, which draws a mandap)
- **Fix:** give the Parsi template a non-mandap ornament (leaves or floral). Add an **Interfaith** template family with both partners' traditions (dual crest, no default religious symbol), and add "Interfaith" to the gallery filter.

**10. Editor overwhelm and no undo**
- **Location:** `src/components/editor/Editor.tsx`
- **Problem:** nine tabs, and the Design tab alone offers colours, fonts, ornaments, scenes, photos, watercolours, layouts, date styles and headlines.
- **Fix:** a "Simple / Advanced" switch; simple shows names, date, venue, one style picker and Publish. Add Ctrl+Z (keep the last 20 states).

**11. Google Fonts hotlinked**
- **Location:** every page that loads fonts
- **Fix:** self-host the ten fonts you use with `next/font`. It is faster (no third-party connection) and removes the EU GDPR issue of sending visitors' IPs to Google.

**12. CSV import**
- **Location:** `GuestsClient.tsx` (`split(/\t|,|;/)`)
- **Fix:** use a real CSV parser that handles quoted fields, and show a preview table with a "this row looks wrong" warning before adding.

**13. Phone numbers**
- **Location:** guests form, RSVP settings
- **Problem:** numbers must be typed with a country code and digits only; nothing validates or explains it.
- **Fix:** a country selector with the dial code, and format checking. Example hint: "Include the country code, like 91 for India, 971 for the UAE."

**14. Same reply from a public link**
- **Location:** `/api/rsvp`
- **Problem:** only personal links update an earlier reply; on the public link, a guest who replies twice creates two rows.
- **Fix:** ask for a phone number or email on the public link and de-duplicate on it.

**15. Gendered default credits**
- **Location:** `src/lib/traditions.ts` (credits "Daughter of" / "Son of")
- **Fix:** make the credit labels neutral by default ("Family of", "Child of") and offer the traditional wording as an option, so same-sex and non-binary couples are not forced to edit out assumptions.

**16. Currency and gifts are India-specific**
- **Location:** Extras tab, "Pay with UPI"
- **Fix:** a "How to send a gift" block with UPI, bank transfer, PayPal link or a registry link, chosen by region.

### 🟢 Nice to have

- **17.** Date format choice (DD/MM/YYYY, MM/DD/YYYY, written) beside the numeric layout, because "03 - 04 - 2027" means different days in India and the US. Prefer the written month by default for international guests.
- **18.** A "Save the date" mode (no venue, no RSVP) and a "Thank you" mode after the event.
- **19.** Template gallery search and sorting by popularity; thumbnails that render the real design rather than an approximation.
- **20.** A guided first-run checklist on the dashboard (add names, add a ceremony, add guests, publish, send).
- **21.** Text-size and high-contrast toggle on the invitation for older guests.

---

## C. Top 10 improvements (highest value first)

1. Abuse protection on RSVP (finding 1).
2. Finish and test sign-in with Resend email (finding 2).
3. Guest data deletion and a lawyer-reviewed Privacy page (finding 3).
4. Static first paint on the landing hero (finding 4).
5. Full label translations for every language you list (finding 7).
6. A Simple / Advanced editor (finding 10).
7. An Interfaith template family (finding 9).
8. Self-hosted fonts (finding 11).
9. WhatsApp share flow: one button that sends the personal link with a written message (a "Send to all unsent" queue).
10. Reminder nudges to guests who have not replied (a manual "copy reminder message" button costs nothing to build).

## D. Missing features

Save-the-date and thank-you modes; email and SMS sending; reminders; meal preferences; seating; a shared photo album after the event; guestbook; view analytics ("opened by 132 of 214"); custom domain per invitation; co-hosts with roles; a delete-account flow; registry links; invitation duplication ("copy this wedding for the reception"); a print-ready PDF or card.

## E. Internationalization gaps

- **Interface text:** see finding 7. Languages without wording sets: Telugu, Kannada, Urdu, Hebrew, Punjabi, German, Portuguese.
- **Dates:** correct and timezone-aware. Punjabi uses fixed month names because some devices lack them (fixed). The numeric layout is ambiguous between regions (finding 17).
- **Numbers:** digits are always Latin. Arabic-Indic and Devanagari digits are not offered, and some hosts will want them.
- **Currency:** none handled (finding 16).
- **Addresses:** free text, which is the right call; postcode and country-specific forms are not needed.
- **Phone numbers:** digits only, no validation (finding 13).
- **Names:** two name fields work for most couples. There is no field for a transliteration (a name shown in two scripts), which is common for mixed-language invitations.
- **Long text:** the layout wraps, but very long names in large script fonts have not been tested at 360px.
- **RTL:** Arabic, Urdu and Hebrew are laid out right-to-left and the sample cards mirror correctly. Ornaments are symmetric, so this is fine. Mixed-direction lines (a Latin hashtag in an Arabic invitation) are not handled specially.

## F. Cultural and localization risks

- **Sample text in Punjabi, Hebrew, Urdu, Arabic, Telugu, Kannada, Tamil and Malayalam was written by me and has not been reviewed by native speakers.** Do this before launch. A wrong blessing on a wedding invitation is worse than an English one.
- **Religious symbols are pre-filled in templates** (a cross, an Ik Onkar, a Star of David). This is right inside a template a host chose for that tradition, but the icon library must keep treating them as optional, never as defaults inferred from a host's answers. (The README says so.)
- **A mandap on a Parsi template** (finding 9).
- **"Dry event" and "Children" tiles** are useful but must be optional and worded neutrally in every language. They are, in English; other languages have translations for the seven supported sets only.
- **Names and titles:** the product never assumes surnames or a family order. Good. Keep it that way.
- **No template tied to a single country's stereotype** (no region-specific patterns in the default library). Keep adding regional assets as opt-in only.

## G. Mobile UX issues

Unverified on a real phone. The browser pane here has a fixed width and I could not test 360, 390 and 412 separately.
- **Fixed elements stack:** the music button (fixed), the frame (fixed), the wedding-website menu (fixed) and Scene layers can crowd a 360px screen. The music button was moved clear of the frame corner; check the others on a device.
- **Hero iframe** (finding 4).
- **Scroll-driven skies** (`sunrise-journey`) recalculate on every scroll event. Test on a low-end Android phone; if it stutters, lower the star count and skip the birds.
- **Touch targets:** steppers and chips are 40px (2.5rem). The guideline is 44px; raise them.
- **WhatsApp in-app browser:** music will not autoplay there; the invitation must work without sound. It does.

## H. Accessibility issues

- 🟠 **Focus** (finding 8).
- 🟠 **Contrast:** small tracked eyebrow text (0.6–0.7rem) in the accent colour on light themes has not been measured. Some accents (gold on cream) will fail 4.5:1. Measure every preset and darken the eyebrow colour where it fails.
- 🟠 **Screen readers:** decorative SVGs are hidden correctly. The envelope gate is a button with a label, which is good. **Not tested with a screen reader.**
- 🟢 **Alt text:** host photos use the caption as alt; when there is no caption the alt is empty. Prompt the host: "Describe this photo for guests who cannot see it."
- 🟢 **Reduced motion:** honoured by the fireflies, scenes and landing animations. Good.
- 🟢 **Forms:** labels are tied to inputs in the RSVP; add `aria-live` error text next to the field, not only at the bottom.
- 🟢 **Language attribute:** set from the invitation language; `other` sets none, which is correct.

## I. Monetization opportunities ⭐

The free tier is generous; the paid tier should charge for **scale and polish**, not for basics.
- **Per-event pass (one-time, per event):** more than 100 guests, remove the small "made with" credit, your own link name, premium templates (animated scenes, photo and watercolour styles).
- **Add-ons:** custom domain per invitation; printable PDF or card; QR code for print; bulk WhatsApp sending with tracking; SMS and email sending at cost plus margin; extra storage for photos and video.
- **For professionals:** a planner or photographer plan that manages many events under one account, with white-label pages.
- **Marketplace:** designers sell templates and take a share.

Price in local currency, per region. Do not show a rupee price to a guest in the UAE.

## J. Launch-readiness checklist

**Accounts and setup**
- [ ] Run `supabase/migrations/0002_multi_event.sql`.
- [ ] Rotate the Supabase service-role key and the Resend key (both were pasted in chat).
- [ ] Set Supabase Site URL and redirect URLs; set up SMTP (Resend) with a verified domain; test a real magic link.
- [ ] Decide on Google sign-in: enable it in Supabase, then set `NEXT_PUBLIC_GOOGLE_AUTH=1`; or leave it hidden.
- [ ] Choose the product name and domain; set `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_ROOT_DOMAIN`, `NEXT_PUBLIC_APP_URL`.
- [ ] Vercel: add the domain, the wildcard `*.yourdomain` and the environment variables.

**Safety and legal**
- [ ] RSVP rate limiting and a reply cap (finding 1).
- [ ] Guest deletion and a retention rule (finding 3).
- [ ] Lawyer-reviewed Privacy and Terms; set `NEXT_PUBLIC_CONTACT_EMAIL`.
- [ ] Native-speaker review of all non-English sample text and labels.

**Quality**
- [ ] Test on real phones at 360, 390 and 412px, including the WhatsApp in-app browser.
- [ ] Test with a screen reader (VoiceOver or TalkBack) and keyboard only.
- [ ] Measure contrast for every colour preset.
- [ ] One full end-to-end run: sign in → create from a template → edit → add guests → publish → open a personal link → reply → see the reply and headcount → export CSV.
- [ ] Static hero, self-hosted fonts, image sizes checked (Lighthouse mobile score of 80 or more).

**Already done in this pass:** invitations are no longer indexed; photos are compressed before upload; the Google button no longer appears when Google is off; friendly 404 and error pages; the privacy contact address is configurable.
