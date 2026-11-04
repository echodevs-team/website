import en from "./messages/en.json";
import fa from "./messages/fa.json";
import ar from "./messages/ar.json";
import type { Locale } from "./config";

export type Messages = typeof en;
const messages: Record<Locale, Messages> = { fa, en, ar };

export function getMessages(locale: Locale): Messages {
  return messages[locale];
}
