import { themeInitScript } from "../../lib/theme-init";

/** Deliberately parser-blocking, before content. No remote script or unsafe data. */
export function ThemeInit() {
  return <script id="echo-theme-init" dangerouslySetInnerHTML={{ __html: themeInitScript }} />;
}
