"use client";

import React, { useEffect, useState, useRef } from "react";
import { Globe, Check, ChevronDown, Search } from "lucide-react";

declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
  }
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", flag: "🇮🇳" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", flag: "🇮🇳" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം", flag: "🇮🇳" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", flag: "🇮🇳" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
  { code: "zh-CN", name: "Chinese", nativeName: "简体中文", flag: "🇨🇳" },
  { code: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺" },
  { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇧🇷" },
];

function applyGoogleTranslateCookie(langCode: string) {
  if (typeof document === "undefined" || typeof window === "undefined") return;
  const host = window.location.hostname;
  document.cookie = `googtrans=/auto/${langCode}; path=/;`;
  if (host !== "localhost") {
    document.cookie = `googtrans=/auto/${langCode}; path=/; domain=${host};`;
  }
}

export function LanguageTranslator() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentLang, setCurrentLang] = useState<string>("en");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Read stored language or existing googtrans cookie
    const match = document.cookie.match(/googtrans=\/auto\/([a-zA-Z-]+)/);
    if (match && match[1]) {
      setCurrentLang(match[1]);
    } else {
      const saved = localStorage.getItem("nammatech_lang");
      if (saved) {
        setCurrentLang(saved);
      }
    }

    // Initialize Google Translate script if not already present
    if (!document.getElementById("google-translate-script")) {
      window.googleTranslateElementInit = () => {
        if (window.google?.translate?.TranslateElement) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: "en",
              includedLanguages: SUPPORTED_LANGUAGES.map((l) => l.code).join(","),
              autoDisplay: false,
            },
            "google_translate_element"
          );
        }
      };

      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }

    // Click outside handler
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const changeLanguage = (langCode: string) => {
    setCurrentLang(langCode);
    setIsOpen(false);
    localStorage.setItem("nammatech_lang", langCode);

    applyGoogleTranslateCookie(langCode);

    // Try triggering change event on Google Translate combo element
    const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo");
    if (combo) {
      combo.value = langCode;
      combo.dispatchEvent(new Event("change"));
    } else {
      window.location.reload();
    }
  };

  const selectedLanguage =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

  const filteredLanguages = SUPPORTED_LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Hidden container for Google Translate widget */}
      <div id="google_translate_element" className="hidden" style={{ display: "none" }} />

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--secondary)] text-[var(--foreground)] text-xs font-medium transition-colors shadow-sm"
        aria-label="Select Language"
        title="Translate Website"
      >
        <Globe className="w-3.5 h-3.5 text-indigo-500" />
        <span className="hidden sm:inline-block text-xs">{selectedLanguage.flag}</span>
        <span className="hidden md:inline-block text-xs font-medium">
          {selectedLanguage.nativeName}
        </span>
        <ChevronDown
          className={`w-3 h-3 text-[var(--muted-foreground)] transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-2xl z-50 p-2 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="p-1.5 mb-1 border-b border-[var(--border)]">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 absolute left-2 text-[var(--muted-foreground)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search language..."
                className="w-full pl-7 pr-2 py-1 text-xs rounded-lg bg-[var(--secondary)] border-none text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none"
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-0.5 py-1">
            {filteredLanguages.map((lang) => {
              const isSelected = lang.code === currentLang;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => changeLanguage(lang.code)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors ${
                    isSelected
                      ? "bg-[var(--primary)] text-white font-semibold"
                      : "text-[var(--foreground)] hover:bg-[var(--secondary)]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{lang.flag}</span>
                    <div className="flex flex-col text-left">
                      <span>{lang.nativeName}</span>
                      <span
                        className={`text-[10px] ${
                          isSelected ? "text-white/80" : "text-[var(--muted-foreground)]"
                        }`}
                      >
                        {lang.name}
                      </span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                </button>
              );
            })}
            {filteredLanguages.length === 0 && (
              <p className="text-center text-xs text-[var(--muted-foreground)] py-4">
                No language found
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
