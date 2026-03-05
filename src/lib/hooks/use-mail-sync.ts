"use client";

import { useEffect, useRef } from "react";

const SYNC_INTERVAL = 2 * 60 * 1000; // 2 minutes

/**
 * Background mail sync hook — runs IMAP sync every 2 minutes.
 * Safe to mount in panel layout; the server-side endpoint is rate-limited.
 */
export function useMailSync() {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const doSync = () => {
      fetch("/api/mail/sync", { method: "POST" }).catch(() => {
        // silent — background sync should never disrupt UI
      });
    };

    // Sync immediately on mount
    doSync();

    // Then every 2 minutes
    timerRef.current = setInterval(doSync, SYNC_INTERVAL);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);
}
