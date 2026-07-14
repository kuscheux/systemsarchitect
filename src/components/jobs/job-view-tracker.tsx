"use client";

import { useEffect } from "react";

export function JobViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `1cg:job-view:${slug}`;
    try {
      if (window.sessionStorage.getItem(key)) return;
      window.sessionStorage.setItem(key, "1");
    } catch {
      // Storage can be unavailable in hardened browser contexts.
    }

    void fetch(`/api/jobs/${encodeURIComponent(slug)}/view`, {
      method: "POST",
      keepalive: true,
    }).catch(() => {
      try {
        window.sessionStorage.removeItem(key);
      } catch {
        // View tracking is best effort and must not affect the job page.
      }
    });
  }, [slug]);

  return null;
}
