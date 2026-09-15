import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const app = process.env.NEXT_PUBLIC_APP_NAME || "Mandapam";
  return (
    <div className="min-h-screen">
      <header className="border-b bg-white" style={{ borderColor: "var(--line)" }}>
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-3 sm:px-8">
          <Link href="/dashboard" className="text-sm font-medium uppercase tracking-[0.3em]">
            {app}
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <span style={{ color: "var(--ink-2)" }}>{user?.email}</span>
            <form action={signOut}>
              <button type="submit" className="btn-secondary">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
