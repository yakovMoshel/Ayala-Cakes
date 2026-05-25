"use client";

import { useEffect } from "react";

export default function ProductViewTracker({ slug }) {
  useEffect(() => {
    if (!slug) return;

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
  }, [slug]);

  return null;
}
