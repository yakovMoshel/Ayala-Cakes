"use client";

import { useEffect } from "react";
import {
  COOKIE_CONSENT_EVENT,
  hasAnalyticsConsent,
} from "@/utils/cookieConsent";

function recordPostView(slug) {
  if (!slug || !hasAnalyticsConsent()) return;

  const storageKey = `post_viewed_${slug}`;
  if (sessionStorage.getItem(storageKey)) return;

  fetch("/api/analytics/view", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug }),
    credentials: "include",
    keepalive: true,
  })
    .then((res) => {
      if (res.ok) sessionStorage.setItem(storageKey, "1");
    })
    .catch(() => {});
}

export default function PostViewTracker({ slug }) {
  useEffect(() => {
    recordPostView(slug);

    const onConsentChange = (event) => {
      if (event?.detail?.value === "accepted") {
        recordPostView(slug);
      }
    };

    window.addEventListener(COOKIE_CONSENT_EVENT, onConsentChange);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, onConsentChange);
  }, [slug]);

  return null;
}
