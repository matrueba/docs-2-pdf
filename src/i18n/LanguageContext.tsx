"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { dictionaries, Language, Dictionary } from "./dictionaries";

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: Dictionary;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>("es");
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const storedLang = localStorage.getItem("app_lang") as Language;
        if (storedLang && dictionaries[storedLang]) {
            setLanguage(storedLang);
        } else {
            const browserLang = navigator.language.startsWith("es") ? "es" : "en";
            setLanguage(browserLang);
        }
    }, []);

    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang);
        if (isClient) {
            localStorage.setItem("app_lang", lang);
        }
    };

    const currentDictionary = dictionaries[language] || dictionaries["en"];

    // Prevent hydration mismatch by rendering default "es" on server, then matching client
    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t: currentDictionary }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
