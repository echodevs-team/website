import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { localeCookie, localePath, resolveLocale } from "@/i18n/config";

// Dynamic request APIs keep negotiated redirects out of the shared route cache.
export default async function EntryPage() {
  const [cookieStore, requestHeaders] = await Promise.all([cookies(), headers()]);
  redirect(localePath(resolveLocale(cookieStore.get(localeCookie)?.value, requestHeaders.get("accept-language"))));
}
