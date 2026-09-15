"use client";
import { useEffect, useState } from "react";
import QRCode from "qrcode";

type Props = {
  code: string;
  url: string; // what the QR encodes: the ticket page, which the check-in scanner reads
  name: string;
  eventTitle: string;
  dateLine: string;
  venue: string;
  checkedInAt?: string | null;
  labels: { admitOne: string; showAtDoor: string; checkedIn: string; when: string; where: string };
};

export function Ticket({ code, url, name, eventTitle, dateLine, venue, checkedInAt, labels }: Props) {
  const [qr, setQr] = useState("");
  useEffect(() => {
    QRCode.toDataURL(url, { margin: 1, width: 480, color: { dark: "#111111", light: "#ffffff" } })
      .then(setQr)
      .catch(() => setQr(""));
  }, [url]);

  return (
    <div className="hairline mx-auto w-full max-w-sm border" style={{ background: "color-mix(in srgb, var(--inv-bg) 85%, var(--inv-ink) 6%)" }}>
      <div className="hairline flex items-center justify-between border-b px-5 py-3">
        <span className="eyebrow">{labels.admitOne}</span>
        <span className="tnum text-xs tracking-[0.2em]">{code}</span>
      </div>
      <div className="grid gap-4 px-5 py-6">
        <div>
          <p className="display text-2xl leading-tight">{name}</p>
          <p className="dim mt-1 text-sm">{eventTitle}</p>
        </div>
        <div className="mx-auto w-52 rounded bg-white p-3">
          {qr ? <img src={qr} alt={`QR ${code}`} className="block h-auto w-full" /> : <div className="aspect-square w-full" />}
        </div>
        <dl className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-1 text-sm">
          <dt className="dim">{labels.when}</dt>
          <dd>{dateLine}</dd>
          <dt className="dim">{labels.where}</dt>
          <dd>{venue}</dd>
        </dl>
        {checkedInAt ? (
          <p className="accent text-sm">
            {labels.checkedIn} · {new Date(checkedInAt).toLocaleString()}
          </p>
        ) : (
          <p className="dim text-xs">{labels.showAtDoor}</p>
        )}
      </div>
    </div>
  );
}
