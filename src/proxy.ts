import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale } from "@/i18n/config";

export function proxy(request: NextRequest) {
  const candidate = request.nextUrl.pathname.split("/")[1];
  const headers = new Headers(request.headers);
  // Always overwrite caller-supplied values; never trust a public locale header.
  headers.set("x-echo-locale", isLocale(candidate) ? candidate : defaultLocale);
  return NextResponse.next({ request: { headers } });
}

export const config = { matcher: ["/((?!_next/).*)"] };
