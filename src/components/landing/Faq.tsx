// Native <details> keeps this a server component and works without JavaScript.
export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div style={{ borderTop: "1px solid var(--line)" }}>
      {items.map((it) => (
        <details key={it.q} className="group" style={{ borderBottom: "1px solid var(--line)" }}>
          <summary className="flex min-h-[64px] cursor-pointer list-none items-center justify-between gap-6 py-4 text-[18px] font-medium [&::-webkit-details-marker]:hidden">
            {it.q}
            <span className="m-dia transition-transform duration-200 group-open:rotate-[135deg]" aria-hidden="true" style={{ width: 9, height: 9 }} />
          </summary>
          <p className="max-w-[640px] pb-6 text-base leading-[1.7]" style={{ color: "var(--ink-2)" }}>
            {it.a}
          </p>
        </details>
      ))}
    </div>
  );
}
