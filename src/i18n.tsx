import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import tr from "./language/tr.json";
import en from "./language/en.json";

i18n
  .use(LanguageDetector) // Tarayıcı dilini algılar
  .use(initReactI18next) // React ile bağlar
  .init({
    resources: {
      en: { translation: en },
      tr: { translation: tr },
    }, // Mevcut çeviri objeni kullan
    fallbackLng: "en", // Algılanamazsa İngilizce
    detection: {
      order: ["localStorage", "cookie", "navigator", "htmlTag"],
      caches: ["localStorage", "cookie"],
    },
    interpolation: {
      escapeValue: false, // React kullanıyorsan gerekli değil
    },
  });

export default i18n;
