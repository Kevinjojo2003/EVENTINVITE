import type { Metadata } from "next";
import { Legal, H } from "@/components/landing/Legal";

export const metadata: Metadata = { title: "Privacy" };

// Plain-language and specific on purpose. It describes what the product actually does today.
// It is a working draft: have it reviewed by a lawyer for the countries you launch in
// (India's DPDP Act, the EU/UK GDPR) before the service opens to the public.
export default function Privacy() {
  const contact = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "the contact address, which will be published here before launch";
  return (
    <Legal title="Privacy" updated="20 September 2026">
      <p>
        This page explains what we collect, why, who else handles it, how long we keep it, and how you can have it removed. It is a working draft that will be reviewed by a legal adviser before the service opens to the public.
      </p>

      <section>
        <H>Who is who</H>
        <p>
          A <strong>host</strong> creates an invitation. A <strong>guest</strong> opens it and may reply. For the guest list and replies, the host decides what to collect and we store it for them. For the accounts and the service itself, we decide.
        </p>
      </section>

      <section>
        <H>What we collect</H>
        <ul className="grid list-disc gap-2 ps-6">
          <li>
            <strong>From hosts:</strong> an email address to sign in, and everything you put into an invitation (names, dates, venues, photos, music, wording).
          </li>
          <li>
            <strong>From the host about guests:</strong> the guest names and WhatsApp numbers the host enters or imports, and which ceremonies each guest is invited to.
          </li>
          <li>
            <strong>From guests:</strong> the name, answer, number of adults, children and infants, optional email, company and note they type when they reply.
          </li>
          <li>
            <strong>Automatically:</strong> a sign-in cookie for hosts. We do not use advertising cookies or trackers. To limit spam, the server briefly keeps a count of recent replies per network address, in memory, and does not store the address with your reply.
          </li>
        </ul>
      </section>

      <section>
        <H>Why we use it</H>
        <p>To show the invitation, to record and show replies to the host, to let the host manage the guest list, and to keep the service secure. We do not sell your data, use it for advertising, or send anything to your guests that the host has not written.</p>
      </section>

      <section>
        <H>Who can see it</H>
        <p>
          A guest list and replies are visible only to the host who owns the invitation. A published invitation is visible to anyone with its link, so share the link only with people you want to invite. Published invitations tell search engines not to list them.
        </p>
      </section>

      <section>
        <H>Other companies that handle data for us</H>
        <ul className="grid list-disc gap-2 ps-6">
          <li>Supabase (database, file storage and sign-in), and Vercel (hosting).</li>
          <li>Google Fonts, to load typefaces. Loading them tells Google your network address. We plan to serve fonts ourselves to avoid this.</li>
          <li>Google Maps and YouTube, only when a host adds a map or a music video to their invitation. Those companies then see that the page was opened.</li>
          <li>WhatsApp, when a guest or host taps a WhatsApp link. That leaves this site and is governed by WhatsApp&apos;s own terms.</li>
        </ul>
      </section>

      <section>
        <H>How long we keep it</H>
        <ul className="grid list-disc gap-2 ps-6">
          <li>
            <strong>Guest lists and replies:</strong> deleted automatically 90 days after the event date. The invitation page itself stays for the host.
          </li>
          <li>
            <strong>Invitations:</strong> until the host deletes them.
          </li>
          <li>
            <strong>Accounts:</strong> until you ask us to delete the account.
          </li>
        </ul>
      </section>

      <section>
        <H>Your choices</H>
        <ul className="grid list-disc gap-2 ps-6">
          <li>
            <strong>Guests:</strong> after you reply, a <em>Delete my reply</em> link appears. It removes your reply immediately. To have your name and number removed from a host&apos;s guest list, ask the host, or write to {contact}.
          </li>
          <li>
            <strong>Hosts:</strong> you can delete any guest, any reply, or the whole invitation from your dashboard. To delete your account and everything in it, write to {contact}.
          </li>
          <li>
            <strong>Everyone:</strong> you can ask to see, correct or delete the personal data we hold about you, or object to how it is used, by writing to {contact}.
          </li>
        </ul>
      </section>

      <section>
        <H>Children</H>
        <p>Hosts are adults. Guests may include children, but the reply form only asks how many children are coming, not their names or details.</p>
      </section>

      <section>
        <H>Where data is stored</H>
        <p>Our providers may process data in other countries. We choose providers that protect it in transit and at rest, and we will name the storage region here before launch.</p>
      </section>

      <section>
        <H>Changes</H>
        <p>If this page changes in a way that matters, we will say so here before it takes effect.</p>
      </section>
    </Legal>
  );
}
