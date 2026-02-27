"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";

export type Locale = "tr" | "en";

interface I18nContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (tr: string, en: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  locale: "tr",
  setLocale: () => {},
  t: (tr) => tr,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("tr");

  useEffect(() => {
    const saved = localStorage.getItem("ersan-locale") as Locale;
    if (saved === "tr" || saved === "en") {
      setLocaleState(saved);
      document.documentElement.lang = saved;
    }
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("ersan-locale", l);
    document.documentElement.lang = l;
  }, []);

  const t = useCallback(
    (tr: string, en: string) => (locale === "tr" ? tr : en),
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
