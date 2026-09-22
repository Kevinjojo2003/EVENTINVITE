import Link from "next/link";
import { Faq } from "@/components/landing/Faq";
import { EXAMPLES, FAQ, FEATURES, STEPS } from "@/components/landing/data";
import { Reveal } from "@/components/landing/Reveal";
import { LivePhone } from "@/components/landing/LivePhone";

const FONTS =
  "https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,500;1,6..96,400&family=Jost:wght@300;400;500&family=Noto+Sans+Gurmukhi:wght@400;600&family=Noto+Serif+Malayalam:wght@400;500;600&family=Tiro+Devanagari+Hindi:ital@0;1&display=swap";

function Diamond() {
  return <span className="m-dia" aria-hidden="true" />;
}

export default function Landing() {
  const app = process.env.NEXT_PUBLIC_APP_NAME || "Mandapam";
  return (
    <>
      <link rel="stylesheet" href={FONTS} />

      <header
        className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b px-5 py-4 backdrop-blur md:px-12 lg:px-[120px]"
        style={{ background: "color-mix(in srgb, var(--paper) 90%, transparent)", borderColor: "var(--line)" }}
      >
        <Link href="#top" className="m-dis text-[26px] tracking-[-0.01em]">
          {app}
        </Link>
        <nav className="hidden gap-9 text-[15px] md:flex" style={{ color: "var(--ink-2)" }} aria-label="Sections">
          <Link href="/templates">Templates</Link>
          <a href="#how">How it works</a>
          <a href="#price">Pricing</a>
          <a href="#faq">Questions</a>
        </nav>
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/login" className="text-[15px]" style={{ color: "var(--ink-2)" }}>
            Sign in
          </Link>
          <Link href="/login" className="m-btn m-btn-pri m-btn-sm">
            <span className="sm:hidden">Create</span>
            <span className="hidden sm:inline">Create invitation</span>
          </Link>
        </div>
      </header>

      <Reveal>
        <main>
          {/* ---------- Hero ---------- */}
          <section id="top" className="grid items-center gap-16 px-5 pb-24 pt-16 md:px-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:px-[120px] lg:pb-32 lg:pt-24">
            <div>
              <p className="m-eyebrow m-fu">The invitation, and everything after it</p>
              <h1 className="m-dis m-fu m-fu-2 mt-6 text-[clamp(2.9rem,8.4vw,6rem)] leading-[0.98]" style={{ textWrap: "balance" }}>
                An invitation <em>worth opening.</em>
              </h1>
              <p className="m-fu m-fu-3 mt-8 max-w-[500px] text-[clamp(1.05rem,2.2vw,1.25rem)] leading-[1.65]" style={{ color: "var(--ink-2)" }}>
                For weddings, betrothals, housewarmings, birthdays and corporate events. Your names, your language, your traditions, on one page that opens straight from a WhatsApp link — then the checklist, budget, vendors and guest list that get you there.
              </p>
              <div className="m-fu m-fu-3 mt-10 flex flex-wrap gap-3">
                <Link href="/login" className="m-btn m-btn-pri">
                  Create your invitation, free
                </Link>
                <Link href="/templates" className="m-btn m-btn-sec">
                  Browse templates
                </Link>
              </div>
              <p className="mt-6 flex items-center gap-3 text-sm" style={{ color: "var(--ink-3)" }}>
                <Diamond /> No card needed. Ready in about three minutes.
              </p>
            </div>

            {/* the arch, with a phone inside it and two small product notes around it */}
            <div className="relative mx-auto w-full max-w-[460px]" data-parallax>
              <div className="m-arch relative flex justify-center px-6 pb-0 pt-14" style={{ background: "var(--paper-2)", height: 640, overflow: "hidden", boxShadow: "var(--shadow)" }}>
                <div className="relative h-[640px] w-[300px] shrink-0 rounded-[40px] p-[10px]" style={{ background: "#1c1512", boxShadow: "var(--shadow)" }}>
                  <LivePhone src="/templates/kerala-hindu?embed=1" title="A live invitation" />
                </div>
              </div>
              <div className="m-card m-float absolute -left-4 top-[42%] px-4 py-3 sm:-left-10" style={{ boxShadow: "var(--shadow)" }}>
                <p className="m-eyebrow" style={{ fontSize: 10 }}>
                  Personal link
                </p>
                <p className="m-dis mt-1 text-[17px] leading-tight">For Sreelakshmi &amp; family</p>
              </div>
              <div className="m-card m-float absolute -right-2 bottom-16 px-4 py-3 sm:-right-8" style={{ boxShadow: "var(--shadow)", animationDelay: "1.4s" }}>
                <p className="m-eyebrow" style={{ fontSize: 10 }}>
                  Replies
                </p>
                <p className="m-dis mt-1 text-[17px] leading-tight">
                  148 of 214 <span className="text-[13px]" style={{ color: "var(--ink-3)" }}>said yes</span>
                </p>
              </div>
            </div>
          </section>

          {/* ---------- Examples ---------- */}
          <section id="examples" className="py-24 lg:py-28" style={{ background: "var(--forest)", color: "#F3EFE8" }}>
            <div className="mx-auto mb-14 max-w-[640px] px-5 text-center">
              <p className="m-eyebrow" style={{ color: "#B8C2B3" }}>
                Made with {app}
              </p>
              <h2 className="m-dis mt-4 text-[clamp(2rem,4.6vw,3.1rem)] leading-[1.08]">
                Eight invitations, <em style={{ color: "var(--gold-soft)" }}>eight different worlds.</em>
              </h2>
              <p className="mt-5 text-[17px] leading-[1.65]" style={{ color: "#B8C2B3" }}>
                Nothing here is a template with your name dropped in. Each is set in its own script, with the wording that tradition actually uses.
              </p>
            </div>
            <ul className="flex snap-x gap-7 overflow-x-auto px-5 pb-4 pt-1 md:px-12 lg:px-[120px]" aria-label="Example invitations">
              {EXAMPLES.map((e) => (
                <li key={e.caption} className="w-[232px] shrink-0 snap-start">
                  <Link href={`/templates/${e.template}`} className="group block" aria-label={`Open the ${e.caption} template`}>
                    <figure className="m-0">
                      <div
                        dir={e.rtl ? "rtl" : undefined}
                        className="m-arch relative flex h-[340px] w-[232px] flex-col items-center justify-end overflow-hidden px-5 pb-10 text-center transition-transform duration-500 group-hover:-translate-y-2"
                        style={{ background: e.bg, color: e.fg, border: "1px solid rgba(31,26,23,.14)", boxShadow: "var(--shadow)" }}
                      >
                        <div className="m-arch pointer-events-none absolute inset-[9px]" style={{ border: `1px solid ${e.accent}66`, borderRadius: "999px 999px 4px 4px" }} />
                        {e.top && (
                          <p className="relative mb-3 text-[16px]" style={{ fontFamily: e.topFont ?? e.font, color: e.accent }}>
                            {e.top}
                          </p>
                        )}
                        <p className="relative whitespace-pre-line leading-[1.2]" style={{ fontFamily: e.font, fontSize: (e.size ?? 36) * 0.9 }}>
                          {e.names}
                        </p>
                        <span className="my-3 h-px w-12" style={{ background: e.accent }} />
                        <p dir="ltr" className="relative text-xs tracking-[0.12em]" style={{ color: e.muted, fontFamily: e.dateFont ?? "'Jost', sans-serif" }}>
                          {e.date}
                        </p>
                      </div>
                      <figcaption className="mt-5 text-center text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: "#B8C2B3" }}>
                        {e.caption}
                      </figcaption>
                    </figure>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-10 text-center">
              <Link href="/templates" className="m-btn m-btn-sec" style={{ borderColor: "rgba(243,239,232,.4)", color: "#F3EFE8" }}>
                Browse all templates
              </Link>
            </div>
          </section>

          {/* ---------- How it works ---------- */}
          <section id="how" className="px-5 py-24 md:px-12 lg:px-[120px] lg:py-32">
            <div className="mx-auto mb-16 max-w-[640px] text-center">
              <p className="m-eyebrow">How it works</p>
              <h2 className="m-dis mt-4 text-[clamp(2.1rem,4.8vw,3.2rem)] leading-[1.08]">
                Three steps. <em>About three minutes.</em>
              </h2>
              <p className="mt-5 text-lg leading-[1.65]" style={{ color: "var(--ink-2)" }}>
                No design decisions you do not want to make, and nothing to install.
              </p>
            </div>
            <ol className="grid gap-16 md:grid-cols-3 md:gap-10">
              {STEPS.map((s, i) => (
                <li key={s.title} data-reveal>
                  <div className="mb-8 flex h-[280px] items-center justify-center">
                    <div className="m-card w-full max-w-[380px] p-6" style={{ boxShadow: "var(--shadow)" }}>
                      {s.mock}
                    </div>
                  </div>
                  <p className="m-eyebrow">Step {i + 1}</p>
                  <h3 className="m-dis mt-2 text-[27px] leading-tight">{s.title}</h3>
                  <p className="mt-3 text-base leading-[1.7]" style={{ color: "var(--ink-2)" }}>
                    {s.text}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          {/* ---------- Features ---------- */}
          <section className="border-y px-5 py-24 md:px-12 lg:px-[120px] lg:py-32" style={{ background: "var(--paper-2)", borderColor: "var(--line)" }}>
            <div className="mx-auto mb-16 max-w-[680px] text-center">
              <p className="m-eyebrow">What you actually get</p>
              <h2 className="m-dis mt-4 text-[clamp(2rem,4.6vw,3.1rem)] leading-[1.08]">
                Everything from the first invite to the last guest checked in, <em>done properly.</em>
              </h2>
            </div>
            <div className="mx-auto grid max-w-[1100px] gap-x-14 gap-y-20 md:grid-cols-2">
              {FEATURES.map((f) => (
                <article key={f.title} data-reveal className={f.wide ? "md:col-span-2" : ""}>
                  <div className="mb-7">{f.mock}</div>
                  <h3 className="m-dis text-[27px] leading-tight">{f.title}</h3>
                  <p className="mt-3 max-w-[520px] text-base leading-[1.7]" style={{ color: "var(--ink-2)" }}>
                    {f.text}
                  </p>
                </article>
              ))}
            </div>
          </section>

          {/* ---------- Pricing ---------- */}
          <section id="price" className="px-5 py-24 md:px-12 lg:px-[120px] lg:py-32">
            <div className="mx-auto mb-14 max-w-[640px] text-center">
              <p className="m-eyebrow">Free to start</p>
              <h2 className="m-dis mt-4 text-[clamp(2rem,4.6vw,3.1rem)] leading-[1.08]">
                Everything you need to send an invitation, <em>free.</em>
              </h2>
              <p className="mt-5 text-[17px] leading-[1.65]" style={{ color: "var(--ink-2)" }}>
                Create it, publish it, send it, collect the replies.
              </p>
            </div>
            <div className="mx-auto grid max-w-[840px] gap-6 md:grid-cols-2">
              <div data-reveal className="m-card flex flex-col p-9" style={{ boxShadow: "var(--shadow)" }}>
                <p className="m-eyebrow">Free</p>
                <p className="m-dis mt-3 text-[56px] leading-none">₹0</p>
                <ul className="mt-7 grid gap-3.5 text-[15px]" style={{ color: "var(--ink-2)" }}>
                  {["Your own invitation page", "Personal links for every guest", "RSVPs and a guest list", "WhatsApp sharing", "Any language, any tradition", "Checklist, budget and vendor tracking", "QR passes and door check-in for corporate events"].map((t) => (
                    <li key={t} className="flex items-start gap-3">
                      <span className="mt-[9px]">
                        <Diamond />
                      </span>
                      {t}
                    </li>
                  ))}
                </ul>
                <Link href="/login" className="m-btn m-btn-pri mt-9">
                  Start free
                </Link>
              </div>
              <div className="flex flex-col rounded-[12px] border border-dashed p-9" style={{ borderColor: "var(--line-2)" }}>
                <p className="m-eyebrow">For the big day</p>
                <p className="m-dis mt-3 text-[34px] leading-none" style={{ color: "var(--ink-2)" }}>
                  Coming soon
                </p>
                <p className="mt-7 text-[15px] leading-[1.7]" style={{ color: "var(--ink-2)" }}>
                  Bigger guest lists, your own link name and extra invitation styles. We will announce it here before anything changes for you. Whatever you create for free stays free.
                </p>
              </div>
            </div>
          </section>

          {/* ---------- FAQ ---------- */}
          <section id="faq" className="border-t px-5 py-24 md:px-12 lg:px-[120px] lg:py-32" style={{ borderColor: "var(--line)", background: "var(--surface)" }}>
            <div className="mx-auto max-w-[760px]">
              <p className="m-eyebrow text-center">Questions</p>
              <h2 className="m-dis mb-12 mt-4 text-center text-[clamp(2rem,4.6vw,3.1rem)] leading-[1.08]">
                Questions <em>people ask.</em>
              </h2>
              <Faq items={FAQ} />
            </div>
          </section>

          {/* ---------- Closing ---------- */}
          <section className="px-5 py-28 text-center md:px-12 lg:py-36" style={{ background: "var(--forest)", color: "#F3EFE8" }}>
            <div className="m-ruled mx-auto mb-10 max-w-[200px]" style={{ color: "var(--gold)" }}>
              <Diamond />
            </div>
            <h2 className="m-dis mx-auto max-w-[800px] text-[clamp(2.1rem,5.4vw,3.8rem)] leading-[1.08]" style={{ textWrap: "balance" }}>
              Someone is going to keep this link on their phone <span style={{ color: "var(--gold-soft)", fontStyle: "italic" }}>for years.</span>
            </h2>
            <Link href="/login" className="m-btn mt-11" style={{ background: "var(--gold-soft)", color: "var(--forest)", borderColor: "var(--gold-soft)" }}>
              Create your invitation, free
            </Link>
          </section>
        </main>
      </Reveal>

      <footer className="border-t px-5 py-16 md:px-12 lg:px-[120px]" style={{ borderColor: "var(--line)", background: "var(--paper)" }}>
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <p className="m-dis text-[28px]">{app}</p>
            <p className="mt-3 max-w-[300px] text-[15px] leading-[1.65]" style={{ color: "var(--ink-2)" }}>
              Invitations, guest lists, checklists and budgets for weddings, nikahs, house blessings, birthdays and the occasional office dinner.
            </p>
          </div>
          {[
            ["Product", [["Templates", "/templates"], ["How it works", "#how"], ["Pricing", "#price"], ["Questions", "#faq"]]],
            ["Start", [["Create an invitation", "/login"], ["Sign in", "/login"], ["See a sample", "/templates/kerala-hindu"]]],
            ["Legal", [["Privacy", "/privacy"], ["Terms", "/terms"]]],
          ].map(([h, links]) => (
            <nav key={h as string} aria-label={h as string}>
              <p className="m-eyebrow mb-4">{h as string}</p>
              <ul className="grid gap-3 text-[15px]" style={{ color: "var(--ink-2)" }}>
                {(links as string[][]).map(([label, href]) => (
                  <li key={label}>
                    <Link href={href}>{label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <p className="mt-14 border-t pt-6 text-[13px]" style={{ borderColor: "var(--line)", color: "var(--ink-3)" }}>
          © {new Date().getFullYear()} {app}
        </p>
      </footer>
    </>
  );
}
