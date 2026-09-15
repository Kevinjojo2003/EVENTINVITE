import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

type CookieToSet = { name: string; value: string; options: CookieOptions };

const ROOT = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000").toLowerCase();
const RESERVED = new Set(["www", "app", "api", "admin", "mail"]);

// Turns meera-arjun.ourdomain.com into a slug. Works for meera-arjun.localhost:3000 in dev too.
function slugFromHost(host: string): string | null {
  const h = host.toLowerCase();
  if (h === ROOT || h === `www.${ROOT}`) return null;
  if (!h.endsWith(`.${ROOT}`)) return null;
  const sub = h.slice(0, -(ROOT.length + 1));
  if (!sub || sub.includes(".") || RESERVED.has(sub)) return null;
  return sub;
}

export async function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const slug = slugFromHost(host);
  const { pathname, search } = req.nextUrl;

  // A couple's subdomain: serve their invite. Static assets pass through.
  if (slug && !pathname.startsWith("/_next") && !pathname.startsWith("/api")) {
    const url = req.nextUrl.clone();
    url.pathname = `/s/${slug}${pathname === "/" ? "" : pathname}`;
    url.search = search;
    return NextResponse.rewrite(url);
  }

  // Everything else: keep the Supabase session fresh and guard the dashboard.
  let res = NextResponse.next({ request: req });
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (list: CookieToSet[]) => {
        list.forEach(({ name, value }) => req.cookies.set(name, value));
        res = NextResponse.next({ request: req });
        list.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
      },
    },
  });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (pathname.startsWith("/dashboard") && !user) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  if (pathname === "/login" && user) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp3|ico)$).*)"],
};
