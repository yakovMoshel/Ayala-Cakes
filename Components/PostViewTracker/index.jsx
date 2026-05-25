"use client";

import { useEffect } from "react";

export default function PostViewTracker({ slug }) {
  useEffect(() => {
    if (!slug) return;

    const storageKey = `post_viewed_${slug}`;
    if (sessionStorage.getItem(storageKey)) return;

    const recordView = () => {
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
    };

    recordView();
  }, [slug]);

  return null;
}
