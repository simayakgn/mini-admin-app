import React, { createContext, useContext, useState } from "react";

type Language = "en" | "tr";
type Theme = "light" | "dark";

type SettingsContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");
  const [theme, setTheme] = useState<Theme>("light");

  return (
    <SettingsContext.Provider value={{ language, setLanguage, theme, setTheme }}>
      {/* dark theme desteği */}
      <div className={theme === "dark" ? "dark" : ""}>{children}</div>
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
