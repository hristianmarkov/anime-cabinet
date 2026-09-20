"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { GA_MEASUREMENT_ID, isAnalyticsAllowedPath } from "@/lib/analytics";

function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || !isAnalyticsAllowedPath(pathname)) return;
    window.gtag?.("event", "page_view", {
      page_path: pathname,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname]);

  return null;
}

export function GoogleAnalytics() {
  const pathname = usePathname();
  const enabled = Boolean(GA_MEASUREMENT_ID) && pathname && isAnalyticsAllowedPath(pathname);

  if (!GA_MEASUREMENT_ID || !enabled) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            send_page_view: false,
            allow_google_signals: true,
            allow_ad_personalization_signals: false
          });
        `}
      </Script>
      <PageViewTracker />
    </>
  );
}
