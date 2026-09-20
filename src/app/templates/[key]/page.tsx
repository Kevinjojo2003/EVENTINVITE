import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TEMPLATES, sampleFromTemplate, templateByKey } from "@/lib/templates";
import { Invitation } from "@/components/invite/Invitation";

type Params = { params: Promise<{ key: string }>; searchParams: Promise<{ embed?: string }> };

export function generateStaticParams() {
  return TEMPLATES.map((t) => ({ key: t.key }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const t = templateByKey((await params).key);
  return { title: t ? `${t.name} · template` : "Template", description: t?.blurb };
}

// The live template: the same component guests see, filled with sample content. It is a
// preview, so replying does not send anything.
export default async function TemplatePage({ params, searchParams }: Params) {
  const t = templateByKey((await params).key);
  const embed = (await searchParams).embed === "1";
  if (!t) notFound();
  const config = sampleFromTemplate(t);
  const i = TEMPLATES.findIndex((x) => x.key === t.key);
  const next = TEMPLATES[(i + 1) % TEMPLATES.length];
  if (embed) return <Invitation config={config} slug={`template-${t.key}`} preview />;
  return (
    <>
      <div
        className="fixed inset-x-0 top-0 z-[60] flex items-center justify-between gap-3 px-3 py-2.5 text-sm backdrop-blur sm:px-5"
        style={{ background: "rgba(14,37,33,.9)", color: "#f6f1e6", fontFamily: "'Jost', system-ui, sans-serif" }}
      >
        <Link href="/templates" className="whitespace-nowrap py-1.5 opacity-80 hover:opacity-100">
          ← All templates
        </Link>
        <span className="hidden truncate opacity-70 sm:block">
          {t.name} · {t.caption}
        </span>
        <span className="flex items-center gap-2">
          <Link href={`/templates/${next.key}`} className="hidden whitespace-nowrap px-2 py-1.5 opacity-80 hover:opacity-100 sm:block">
            Next →
          </Link>
          <Link href={`/dashboard/new?template=${t.key}`} className="whitespace-nowrap rounded-full px-4 py-2 font-medium" style={{ background: "#d9be82", color: "#0e2521" }}>
            Use this template
          </Link>
        </span>
      </div>
      <div className="pt-12">
        <Invitation config={config} slug={`template-${t.key}`} preview />
      </div>
      <p className="fixed bottom-3 left-3 z-40 rounded-full px-3 py-1 text-[0.62rem] uppercase tracking-[0.2em]" style={{ background: "rgba(14,37,33,.75)", color: "#f6f1e6", fontFamily: "'Jost', sans-serif" }}>
        Sample · not a real invitation
      </p>
    </>
  );
}
