import { allStyles } from "@/data/styles";
import { buildGoogleMerchantFeed } from "@/lib/googleMerchantFeed";

export const dynamic = "force-static";

export function GET() {
  return new Response(buildGoogleMerchantFeed(allStyles), {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      // Let Merchant Center refresh quickly while still using the CDN cache.
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
