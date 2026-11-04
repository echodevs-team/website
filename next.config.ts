import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const config: NextConfig = {
  poweredByHeader: false,
  experimental: { globalNotFound: true },
};

export default withNextIntl(config);
