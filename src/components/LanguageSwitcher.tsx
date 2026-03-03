"use client";

import { useLanguage } from "@/i18n/LanguageContext";

export default function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();

    return (
        <div className="absolute top-4 right-4 z-50 flex items-center bg-white/50 backdrop-blur-md rounded-full shadow-sm border border-slate-200/50 p-1 animate-fade-in">
            <button
                onClick={() => setLanguage("es")}
                className={`px-3 py-1 text-sm font-medium rounded-full transition-all duration-200 ${language === "es"
                        ? "bg-slate-900 text-white shadow-md"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                    }`}
            >
                ES
            </button>
            <button
                onClick={() => setLanguage("en")}
                className={`px-3 py-1 text-sm font-medium rounded-full transition-all duration-200 ${language === "en"
                        ? "bg-slate-900 text-white shadow-md"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                    }`}
            >
                EN
            </button>
        </div>
    );
}
