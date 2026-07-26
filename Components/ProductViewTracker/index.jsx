"use client";

import { useEffect } from "react";
import {
  COOKIE_CONSENT_EVENT,
  hasAnalyticsConsent,
} from "@/utils/cookieConsent";

function recordProductView(slug) {
  if (!slug || !hasAnalyticsConsent()) return;

  const storageKey = `product_viewed_${slug}`;
  if (sessionStorage.getItem(storageKey)) return;

  fetch("/api/analytics/view", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug, type: "product" }),
    credentials: "include",
    keepalive: true,
  })
    .then((res) => {
      if (res.ok) sessionStorage.setItem(storageKey, "1");
    })
    .catch(() => {});
}

export default function ProductViewTracker({ slug }) {
  useEffect(() => {
    recordProductView(slug);

    const onConsentChange = (event) => {
      if (event?.detail?.value === "accepted") {
        recordProductView(slug);
      }
    };

    window.addEventListener(COOKIE_CONSENT_EVENT, onConsentChange);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, onConsentChange);
  }, [slug]);

  return null;
}
