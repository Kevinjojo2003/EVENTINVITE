import type { ReactNode } from "react";

// The eight finished invitations shown in the gallery. Each is styled in its own script.
export type Example = {
  template: string; // key of the live template this card opens
  caption: string;
  bg: string;
  fg: string;
  accent: string;
  muted: string;
  font: string;
  size?: number;
  names: string;
  date: string;
  top?: string;
  topFont?: string;
  dateFont?: string;
  rtl?: boolean;
};

const DIS = "'Bodoni Moda', Didot, serif";

export const EXAMPLES: Example[] = [
  { template: "kerala-hindu", caption: "Kerala Hindu · Malayalam", bg: "#f8f0dc", fg: "#3b2a14", accent: "#a9822f", muted: "#8a745a", font: "'Noto Serif Malayalam', serif", size: 30, names: "ലക്ഷ്മി\n&\nഅരുൺ", date: "14·01·2027" },
  { template: "nikah", caption: "Nikah · Arabic", bg: "#0b201a", fg: "#f4ecd8", accent: "#d9be82", muted: "rgba(244,236,216,.6)", font: "'Amiri', serif", names: "آمنة\nو\nيوسف", date: "٠٦·٠٣·٢٠٢٧", dateFont: "'Amiri', serif", top: "بسم الله", rtl: true },
  { template: "birthday", caption: "First birthday · English", bg: "#f7efe2", fg: "#20304f", accent: "#c96a6a", muted: "#6b7a99", font: DIS, names: "Kiaan\nturns one", date: "08·11·2026" },
  { template: "church", caption: "Church wedding · English", bg: "#fffdf8", fg: "#16223d", accent: "#2f3d6e", muted: "#5a6580", font: DIS, names: "Anna\n&\nJoseph", date: "20·02·2027", top: "✝" },
  { template: "anand-karaj", caption: "Anand Karaj · Punjabi", bg: "#1a2340", fg: "#f4ecd8", accent: "#d9be82", muted: "rgba(244,236,216,.6)", font: "'Noto Sans Gurmukhi', sans-serif", size: 28, names: "ਸਿਮਰਨ\nਤੇ\nਹਰਜੀਤ", date: "12·12·2026", top: "ੴ" },
  { template: "gruhapravesh", caption: "Gruhapravesh · Hindi", bg: "#f6ece0", fg: "#5a2318", accent: "#b5462f", muted: "#8a6152", font: "'Tiro Devanagari Hindi', serif", size: 30, names: "प्रिया\nऔर\nरोहन", date: "03·01·2027", top: "गृह प्रवेश" },
  { template: "civil", caption: "Civil ceremony · English", bg: "#eceae4", fg: "#22261f", accent: "#6b7d58", muted: "#5e635a", font: DIS, names: "Maya\n&\nTom", date: "09·05·2027" },
  { template: "partners-dinner", caption: "Partners' dinner · English", bg: "#101418", fg: "#e9e4d8", accent: "#b8963e", muted: "rgba(233,228,216,.6)", font: DIS, size: 24, names: "Kerala\nPartners\nDinner", date: "28·11·2026" },
];

const label = "text-[10px] font-semibold uppercase tracking-[0.1em]";

function Pill({ on, children }: { on?: boolean; children: ReactNode }) {
  return (
    <span
      className="rounded-full px-[15px] py-[9px] text-sm"
      style={{ border: `1px solid ${on ? "var(--ink)" : "var(--line-2)"}`, background: on ? "var(--ink)" : "transparent", color: on ? "var(--paper)" : "var(--ink-2)" }}
    >
      {children}
    </span>
  );
}

export const STEPS: { title: string; text: string; mock: ReactNode }[] = [
  {
    title: "Answer three questions",
    text: "What are you celebrating, in which tradition and language, and the names and date. That is the whole setup.",
    mock: (
      <>
        <div className="mb-[18px] flex items-center gap-2" aria-hidden="true">
          <span className="flex h-[23px] w-[23px] items-center justify-center rounded-full text-[13px]" style={{ background: "var(--ink)", color: "var(--paper)" }}>2</span>
          <span className="h-px flex-1" style={{ background: "var(--line)" }} />
          <span className="flex h-[23px] w-[23px] items-center justify-center rounded-full text-[13px]" style={{ border: "1px solid var(--line-2)", color: "var(--ink-3)" }}>3</span>
        </div>
        <p className="m-dis mb-[15px] text-2xl">Which tradition?</p>
        <div className="flex flex-wrap gap-2">
          <Pill on>Hindu</Pill>
          {["Muslim", "Christian", "Sikh", "Jain", "Jewish", "None"].map((t) => (
            <Pill key={t}>{t}</Pill>
          ))}
        </div>
        <p className="mt-[15px] text-sm leading-[1.5]" style={{ color: "var(--ink-3)" }}>
          Changes the wording and the details we suggest. You can change it later.
        </p>
      </>
    ),
  },
  {
    title: "Make it yours",
    text: "Add the schedule, the venue, your photos, a song. The phone preview beside you is exactly what your guests will see.",
    mock: (
      <div className="-m-6 flex overflow-hidden" style={{ borderRadius: "var(--r-md)" }}>
        <div className="w-1/2 p-[18px]" style={{ borderRight: "1px solid var(--line)" }}>
          <div className="mb-[15px] flex flex-wrap gap-[5px]">
            {["Basics", "Schedule", "Venue", "Design"].map((t, i) => (
              <span key={t} className="rounded-full px-[9px] py-[5px] text-[11px]" style={{ background: i === 0 ? "var(--ink)" : "transparent", color: i === 0 ? "var(--paper)" : "var(--ink-3)", border: `1px solid ${i === 0 ? "var(--ink)" : "var(--line)"}` }}>
                {t}
              </span>
            ))}
          </div>
          {["Names", "Date", "Venue"].map((f) => (
            <div key={f} className="mb-[11px]">
              <p className={`${label} mb-1`} style={{ color: "var(--ink-3)" }}>{f}</p>
              <div className="h-[25px] rounded-[5px]" style={{ border: "1px solid var(--line-2)", background: "var(--paper)" }} />
            </div>
          ))}
        </div>
        <div className="flex w-1/2 items-center justify-center p-4" style={{ background: "var(--paper-2)" }}>
          <div className="flex h-[210px] w-[120px] flex-col items-center justify-center rounded-[14px] p-2 text-center" style={{ background: "#f8f0dc", color: "#3b2a14", border: "1px solid rgba(169,130,47,.4)" }}>
            <p className="text-[6px] uppercase tracking-[0.2em]" style={{ color: "#a9822f" }}>ഞങ്ങൾ വിവാഹിതരാകുന്നു</p>
            <p className="mt-2 text-[17px] leading-[1.15]" style={{ fontFamily: "'Noto Serif Malayalam', serif" }}>ലക്ഷ്മി<br />&amp;<br />അരുൺ</p>
            <p className="mt-2 text-[8px]" style={{ color: "#6b563a" }}>2027 ജനുവരി 14</p>
            <span className="mt-2 rounded-full px-2 py-1 text-[7px]" style={{ border: "1px solid rgba(59,42,20,.3)", color: "#6b563a" }}>വരുമോ?</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Send it, and watch the replies",
    text: "Each guest gets a link with their own name on it. Send on WhatsApp in one tap; replies land back here.",
    mock: (
      <>
        <div className="mb-3 flex items-baseline justify-between">
          <p className="m-dis text-xl">Guests</p>
          <p className="text-xs" style={{ color: "var(--ink-3)" }}>214 invited</p>
        </div>
        {[
          ["Sreelakshmi Menon", "Replied", "m-chip-live"],
          ["Thomas Varghese", "Sent", "m-chip-sent"],
          ["Fathima Rashid", "Not sent", "m-chip-draft"],
        ].map(([n, s, c]) => (
          <div key={n} className="flex items-center justify-between gap-3 py-2.5" style={{ borderTop: "1px solid var(--line)" }}>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{n}</p>
              <p className="truncate text-xs" style={{ color: "var(--ink-3)" }}>mandapam.in/lakshmi-arun/…</p>
            </div>
            <span className={`m-chip ${c}`}>{s}</span>
          </div>
        ))}
        <span className="m-btn m-btn-pri mt-3 !min-h-[40px] w-full !text-sm">Send on WhatsApp</span>
      </>
    ),
  },
];

function Mock({ children }: { children: ReactNode }) {
  return (
    <div className="m-card p-6" style={{ borderRadius: "var(--r-md)", background: "var(--paper)" }}>
      {children}
    </div>
  );
}

export const FEATURES: { title: string; text: string; mock: ReactNode; wide?: boolean }[] = [
  {
    title: "Every guest gets their own envelope",
    text: "The link opens with their name on it, like “For Sreelakshmi & family”. Nobody types anything and nobody signs in.",
    wide: true,
    mock: (
      <div className="grid items-center gap-6 md:grid-cols-2">
        <Mock>
          <p className={label} style={{ color: "var(--ink-3)" }}>The link you send</p>
          <p className="mt-2 break-all text-[15px]">
            mandapam.in/lakshmi-arun/<span style={{ color: "var(--gold-ink)", fontWeight: 600 }}>sreelakshmi</span>
          </p>
        </Mock>
        <div className="flex items-center justify-center rounded-[10px] p-8 text-center" style={{ background: "#0b201a", color: "#f4ecd8" }}>
          <div>
            <span className="m-seal mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full text-lg" style={{ background: "#d9be82", color: "#0b201a", fontFamily: DIS }}>L&amp;A</span>
            <p className="text-xs uppercase tracking-[0.2em]" style={{ color: "#d9be82" }}>For Sreelakshmi &amp; family</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "One tap to WhatsApp",
    text: "Mandapam writes the message for you and opens WhatsApp with it ready. Send twenty or two hundred, and the list keeps track of who has been sent and who has replied.",
    mock: (
      <Mock>
        <div className="ms-auto max-w-[300px] rounded-[12px] rounded-te-[2px] p-3.5 text-[14px] leading-[1.5]" style={{ background: "rgba(47,107,79,.14)" }}>
          Sreelakshmi, we would love to have you at our wedding on 14 January. Everything is here 🤍
          <span className="mt-1 block break-all text-[13px]" style={{ color: "var(--indigo)" }}>mandapam.in/lakshmi-arun/sreelakshmi</span>
        </div>
        <p className="mt-3 text-right text-xs" style={{ color: "var(--ink-3)" }}>Written for you, edit before sending</p>
      </Mock>
    ),
  },
  {
    title: "QR passes for corporate events",
    text: "For conferences, launches and partner dinners. Every guest who says yes gets a pass, and at the door you scan it: green once, red if it has already been used. Weddings and birthdays skip it and just collect replies.",
    mock: (
      <Mock>
        <div className="flex items-center gap-4">
          <div className="grid h-[84px] w-[84px] shrink-0 grid-cols-6 gap-[2px] p-1.5" style={{ background: "#fff", border: "1px solid var(--line)" }} aria-hidden="true">
            {Array.from({ length: 36 }, (_, i) => (
              <span key={i} style={{ background: [0, 1, 5, 6, 7, 11, 13, 14, 17, 20, 22, 24, 28, 29, 30, 34, 35].includes(i) ? "#0e2521" : "transparent" }} />
            ))}
          </div>
          <div>
            <p className="text-[15px] font-medium">Priya Nair</p>
            <p className="text-[13px]" style={{ color: "var(--ink-3)" }}>Kerala Partners Dinner · Admit one</p>
            <span className="m-chip m-chip-live mt-2">Welcome</span>
          </div>
        </div>
      </Mock>
    ),
  },
  {
    title: "Change the plan, not the link",
    text: "Venue moved, time shifted, rain plan. Edit the page and everyone who already has the link sees the change, with no second message and no confusion.",
    mock: (
      <Mock>
        <p className={label} style={{ color: "var(--gold-ink)" }}>Updated 2 minutes ago</p>
        <p className="m-dis mt-2 text-xl">Town Hall, Ernakulam</p>
        <p className="mt-1 text-sm line-through" style={{ color: "var(--ink-3)" }}>Sree Poornathrayeesa Hall</p>
      </Mock>
    ),
  },
  {
    title: "Gifts, handled quietly",
    text: "Add UPI details behind a discreet line at the bottom, or leave it out entirely. It never shouts, and it is never the first thing a guest sees.",
    mock: (
      <Mock>
        <p className={label} style={{ color: "var(--gold-ink)" }}>Blessings &amp; gifts</p>
        <p className="mt-2 text-[15px] leading-[1.6]" style={{ color: "var(--ink-2)" }}>Your presence is the greatest gift. If you would like to send something:</p>
        <p className="mt-2 text-sm">UPI · lakshmiarun@upi</p>
        <p className="mt-2 text-xs" style={{ color: "var(--ink-3)" }}>Or leave the whole section off. Many hosts do.</p>
      </Mock>
    ),
  },
];

export const FAQ = [
  { q: "Do my guests need to install anything?", a: "No. The invitation opens in any browser, on any phone, and it is built to load on a weak connection." },
  { q: "Can I write it in my own language?", a: "Yes. Malayalam, Hindi, Tamil, Telugu, Kannada, Arabic, Urdu, Hebrew and more are built in, including right-to-left scripts, which are laid out properly rather than just flipped. Any other language works too: you write the wording yourself." },
  { q: "I am not good with computers.", a: "If you can send a WhatsApp message, you can do this. Three questions, then everything else is optional, and you can hand the editing to someone in the family." },
  { q: "Can I change things after I have sent it?", a: "Yes. The link never changes. Edit the page and everyone sees the update the next time they open it." },
  { q: "Who can see my guest list?", a: "Only you. We do not sell it, share it, or send anything to your guests that you have not written." },
];
