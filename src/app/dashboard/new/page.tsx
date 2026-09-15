"use client";
import { useMemo, useState, useTransition } from "react";
import { createInvite } from "../actions";
import { EVENT_TYPES, type EventType } from "@/lib/types";
import { LANGUAGES } from "@/lib/i18n";
import { TIMEZONES, traditionsFor } from "@/lib/traditions";
import { slugify } from "@/lib/format";

export default function NewInvite() {
  const [type, setType] = useState<EventType>("wedding");
  const [tradition, setTradition] = useState("");
  const [languageCode, setLanguageCode] = useState("en");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [name1, setName1] = useState("");
  const [name2, setName2] = useState("");
  const [slug, setSlug] = useState("");
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
  const two = EVENT_TYPES[type].twoNames;
  const traditions = useMemo(() => traditionsFor(type), [type]);
  const auto = slugify([name1, two ? name2 : ""].filter(Boolean).join("-"));
  const finalSlug = touched ? slug : auto;

  function pickType(k: EventType) {
    setType(k);
    setTradition("");
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    start(async () => {
      const r = await createInvite({ type, name1, name2: two ? name2 : "", slug: finalSlug, tradition: tradition || traditions[0]?.key, language: languageCode, timezone });
      if (r?.error) setError(r.error);
    });
  }

  const name1Label = two ? "First name (partner one)" : type === "corporate" ? "Company or host" : type === "housewarming" ? "Family or hosts" : "Who is it for";
  const name1Placeholder = two ? "Meera" : type === "corporate" ? "Acme Ventures" : type === "housewarming" ? "The Menons" : "Aarav";

  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-10 sm:px-8">
      <h1 className="text-2xl font-medium">New event</h1>
      <form onSubmit={submit} className="mt-8 grid gap-8">
        <fieldset className="grid gap-3">
          <legend className="text-xs font-medium uppercase tracking-[0.08em]" style={{ color: "var(--ink-2)" }}>
            What is it?
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {(Object.keys(EVENT_TYPES) as EventType[]).map((k) => (
              <label key={k} className="card flex cursor-pointer items-start gap-3 p-4" style={{ borderColor: type === k ? "var(--brand)" : "var(--line)" }}>
                <input type="radio" name="type" value={k} checked={type === k} onChange={() => pickType(k)} className="mt-1" />
                <span>
                  <span className="block font-medium">{EVENT_TYPES[k].label}</span>
                  <span className="block text-sm" style={{ color: "var(--ink-2)" }}>
                    {EVENT_TYPES[k].blurb}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {traditions.length > 1 && (
          <div className="field">
            <label htmlFor="tradition">Tradition</label>
            <select id="tradition" value={tradition || traditions[0].key} onChange={(e) => setTradition(e.target.value)}>
              {traditions.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.label}
                </option>
              ))}
            </select>
            <p className="text-xs" style={{ color: "var(--ink-2)" }}>
              Sets up the ceremonies for you. Rename, add or remove any of them later.
            </p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="field">
            <label htmlFor="language">Language of the invitation</label>
            <select id="language" value={languageCode} onChange={(e) => setLanguageCode(e.target.value)}>
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="timezone">Event timezone</label>
            <input id="timezone" list="tz-list" value={timezone} onChange={(e) => setTimezone(e.target.value)} />
            <datalist id="tz-list">
              {TIMEZONES.map((z) => (
                <option key={z} value={z} />
              ))}
            </datalist>
          </div>
        </div>

        <div className={`grid gap-4 ${two ? "sm:grid-cols-2" : ""}`}>
          <div className="field">
            <label htmlFor="name1">{name1Label}</label>
            <input id="name1" value={name1} onChange={(e) => setName1(e.target.value)} required placeholder={name1Placeholder} />
          </div>
          {two && (
            <div className="field">
              <label htmlFor="name2">First name (partner two)</label>
              <input id="name2" value={name2} onChange={(e) => setName2(e.target.value)} required placeholder="Arjun" />
            </div>
          )}
        </div>

        <div className="field">
          <label htmlFor="slug">Web address</label>
          <div className="flex items-center gap-2">
            <input
              id="slug"
              value={finalSlug}
              onChange={(e) => {
                setTouched(true);
                setSlug(slugify(e.target.value));
              }}
              placeholder="meera-arjun"
            />
            <span className="whitespace-nowrap text-sm" style={{ color: "var(--ink-2)" }}>
              .{root}
            </span>
          </div>
          <p className="text-xs" style={{ color: "var(--ink-2)" }}>
            Guests will open {finalSlug || "your-name"}.{root}. You can change it later.
          </p>
        </div>

        {error && <p className="text-sm text-red-700">{error}</p>}
        <button type="submit" className="btn-primary w-fit" disabled={pending || !name1 || (two && !name2)}>
          {pending ? "Creating" : "Create and start editing"}
        </button>
      </form>
    </main>
  );
}
