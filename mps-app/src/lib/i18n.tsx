import { getLocales } from 'expo-localization';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { readJSON, writeJSON } from './storage';
import { Lang, Localized, TKey, translations } from './translations';

type I18nValue = {
  lang: Lang;
  isRTL: boolean;
  setLang: (l: Lang) => void;
  t: (key: TKey, vars?: Record<string, string | number>) => string;
  /** Pick the current-language string from localized content. */
  l: (value: Localized) => string;
};

const I18nContext = createContext<I18nValue | null>(null);
const LANG_KEY = 'mps.lang';

function deviceLang(): Lang {
  const code = getLocales()[0]?.languageCode;
  return code === 'ar' ? 'ar' : 'en';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(deviceLang);

  useEffect(() => {
    readJSON<Lang | null>(LANG_KEY, null).then((saved) => saved && setLangState(saved));
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    writeJSON(LANG_KEY, l);
  }, []);

  const value = useMemo<I18nValue>(() => {
    const dict = translations[lang];
    return {
      lang,
      isRTL: lang === 'ar',
      setLang,
      t: (key, vars) => {
        let s = dict[key] ?? translations.en[key] ?? key;
        if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
        return s;
      },
      l: (v) => v[lang] ?? v.en,
    };
  }, [lang, setLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}
