"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";

const STORAGE_KEY = "ersan-wishlist";

interface WishlistContextValue {
  ids: string[];
  has: (id: string) => boolean;
  toggle: (id: string) => void;
  add: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  count: number;
  mounted: boolean;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

function readStorage(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function writeStorage(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // quota exceeded or private browsing
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  // Hydration-safe: read from localStorage only after mount
  useEffect(() => {
    setIds(readStorage());
    setMounted(true);
  }, []);

  // Sync to localStorage whenever ids change (skip initial)
  useEffect(() => {
    if (mounted) {
      writeStorage(ids);
    }
  }, [ids, mounted]);

  // Listen to storage changes from other tabs
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setIds(readStorage());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const has = useCallback((id: string) => ids.includes(id), [ids]);

  const add = useCallback((id: string) => {
    setIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const remove = useCallback((id: string) => {
    setIds((prev) => prev.filter((x) => x !== id));
  }, []);

  const toggle = useCallback((id: string) => {
    setIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const clear = useCallback(() => {
    setIds([]);
  }, []);

  const value = useMemo<WishlistContextValue>(
    () => ({ ids, has, toggle, add, remove, clear, count: ids.length, mounted }),
    [ids, has, toggle, add, remove, clear, mounted]
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return ctx;
}
