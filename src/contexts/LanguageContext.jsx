import React, { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // 强制默认使用英文，忽略本地存储
    return "en";
  });
  const [translations, setTranslations] = useState({});

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  // 动态加载翻译文件
  useEffect(() => {
    fetch("/data/i18n/translations.json")
      .then((response) => response.json())
      .then((data) => setTranslations(data))
      .catch((error) => {
        console.error("Failed to load translations:", error);
        setTranslations({});
      });
  }, []);

  const t = (key) => {
    const keys = key.split(".");
    let value = translations[language];

    for (const k of keys) {
      value = value?.[k];
    }

    return value || key;
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "zh" ? "en" : "zh"));
  };

  const value = {
    language,
    setLanguage,
    toggleLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
