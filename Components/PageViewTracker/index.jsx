"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  COOKIE_CONSENT_EVENT,
  hasAnalyticsConsent,
} from "@/utils/cookieConsent";

function recordPageView(path) {
  if (!path || !hasAnalyticsConsent()) return;

  const storageKey = `page_viewed_${path}`;
  if (sessionStorage.getItem(storageKey)) return;

  fetch("/api/analytics/view", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "page", path }),
    credentials: "include",
    keepalive: true,
  })
    .then((res) => {
      if (res.ok) sessionStorage.setItem(storageKey, "1");
    })
    .catch(() => {});
}

export default function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    recordPageView(pathname);

    const onConsentChange = (event) => {
      if (event?.detail?.value === "accepted") {
        recordPageView(pathname);
      }
    };

    window.addEventListener(COOKIE_CONSENT_EVENT, onConsentChange);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, onConsentChange);
  }, [pathname]);

  return null;
}
