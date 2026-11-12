import { getInquiryPool } from "../../../lib/db/client";
import { handleInquiry } from "../../../lib/inquiries/handler";

export const runtime = "nodejs";
export async function POST(request: Request) {
  return handleInquiry(request, { enabled: process.env.INQUIRIES_ENABLED === "true", origin: process.env.INQUIRY_ORIGIN,
    secret: process.env.INQUIRY_DIGEST_SECRET, pool: getInquiryPool,
    network: { mode: process.env.INQUIRY_NETWORK_MODE, proxySecret: process.env.INQUIRY_PROXY_SECRET } });
}
