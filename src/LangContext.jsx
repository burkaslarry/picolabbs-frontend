import { createContext, useContext, useState, useEffect } from 'react';
import { getLang, setLang as persistLang } from './i18n.js';

const LangContext = createContext({ lang: 'en', setLang: () => {} });

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(getLang);
  const setLang = (l) => {
    persistLang(l);
    setLangState(l);
  };
  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
