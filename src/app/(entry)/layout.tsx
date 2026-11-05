import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ThemeInit } from "@/components/layout/theme-init";
import "@/styles/globals.css";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function EntryLayout({ children }: { children: ReactNode }) {
  return <html lang="fa" dir="rtl" suppressHydrationWarning><head><ThemeInit /></head><body>{children}</body></html>;
}
