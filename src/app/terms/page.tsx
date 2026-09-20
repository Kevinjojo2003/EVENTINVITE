import type { Metadata } from "next";
import { Legal, H } from "@/components/landing/Legal";

export const metadata: Metadata = { title: "Terms" };

// A working draft to be reviewed by a legal adviser before the service opens to the public.
export default function Terms() {
  const contact = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "the contact address, which will be published here before launch";
  return (
    <Legal title="Terms" updated="20 September 2026">
      <p>These are the ground rules for using the service. They are a working draft that will be reviewed by a legal adviser before the service opens to the public.</p>

      <section>
        <H>Using the service</H>
        <p>You must be an adult to create an invitation. You are responsible for your account, and for what you publish and send through it. Keep your sign-in email secure.</p>
      </section>

      <section>
        <H>Your content</H>
        <p>What you put into an invitation is yours. You give us permission to store and show it, only so we can run the service for you. You confirm that you have the right to use it, including every photo, and any music you upload or link. Do not upload music or images you do not have rights to. We may remove content that breaks the law or these terms.</p>
      </section>

      <section>
        <H>Your guests</H>
        <p>Only add people who would reasonably expect to hear from you. You are responsible for the personal data of your guests that you enter, for having their reasonable expectation to contact them, and for the messages you send. If a guest asks you to remove them, please do.</p>
      </section>

      <section>
        <H>What you must not do</H>
        <ul className="grid list-disc gap-2 ps-6">
          <li>Use the service to send spam, harass anyone, or share unlawful, hateful or deceptive content.</li>
          <li>Impersonate another person, or publish an invitation for an event that is not real.</li>
          <li>Try to break, overload, scrape or get around the limits of the service, including automated replies to invitations.</li>
        </ul>
      </section>

      <section>
        <H>The service and its limits</H>
        <p>We work to keep the service available but cannot promise it will never be interrupted or free of mistakes. Keep your own copy of anything important, such as your guest list, and export replies before the event. We are not responsible for an event going wrong because a link was not delivered or a message was not read.</p>
      </section>

      <section>
        <H>Free and paid features</H>
        <p>The core service is free today. If paid features are introduced, we will say so here first, and what you created for free will stay free.</p>
      </section>

      <section>
        <H>Ending your use</H>
        <p>You can delete your invitations at any time. We may suspend an account that breaks these terms. To delete your account, write to {contact}.</p>
      </section>

      <section>
        <H>Changes and contact</H>
        <p>If these terms change in a way that matters, we will say so here before it takes effect. Questions: {contact}.</p>
      </section>
    </Legal>
  );
}
