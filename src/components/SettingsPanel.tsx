import React, { useState } from "react";
import { X, Sun, Moon, Flag, Sparkles, Check, Globe, ChevronDown } from "lucide-react";
import { Language, languages, translations, getLocalizedLanguageName } from "../i18n";

export interface SettingsConfig {
  theme: "light" | "dark";
  country: string;
  autoCountryDetected: string;
  alertsEnabled: boolean;
  language: Language;
}

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  config: SettingsConfig;
  onChangeConfig: (newConfig: SettingsConfig) => void;
}

export default function SettingsPanel({
  isOpen,
  onClose,
  config,
  onChangeConfig
}: SettingsPanelProps) {
  if (!isOpen) return null;

  const [isLangExpanded, setIsLangExpanded] = useState(false);

  const currentLang = config.language || "pt_br";
  const t = translations[currentLang] || translations.pt_br;

  const handleThemeChange = (theme: "light" | "dark") => {
    onChangeConfig({ ...config, theme });
  };

  const handleCountryChange = (country: string) => {
    onChangeConfig({ ...config, country });
  };

  const handleLanguageChange = (language: Language) => {
    onChangeConfig({ ...config, language });
    setIsLangExpanded(false);
  };

  const countriesList = [
    { 
      value: "Brazil", 
      label: (currentLang === "pt_br" || currentLang === "pt_pt") ? "Brasil (Brasileirão Série A)" 
           : currentLang === "en" ? "Brazil (Brasileirao Serie A)" 
           : currentLang === "es" ? "Brasil (Brasileirao Serie A)" 
           : currentLang === "fr" ? "Brésil (Brasileirao Série A)" 
           : currentLang === "it" ? "Brasile (Brasileirao Serie A)" 
           : "Brasilien (Brasileirao Serie A)", 
      flag: "🇧🇷" 
    },
    { 
      value: "England", 
      label: (currentLang === "pt_br" || currentLang === "pt_pt") ? "Inglaterra (Premier League)" 
           : currentLang === "en" ? "England (Premier League)" 
           : currentLang === "es" ? "Inglaterra (Premier League)" 
           : currentLang === "fr" ? "Angleterre (Premier League)" 
           : currentLang === "it" ? "Inghilterra (Premier League)" 
           : "England (Premier League)", 
      flag: "🇬🇧" 
    },
    { 
      value: "Spain", 
      label: (currentLang === "pt_br" || currentLang === "pt_pt") ? "Espanha (La Liga)" 
           : currentLang === "en" ? "Spain (La Liga)" 
           : currentLang === "es" ? "España (La Liga)" 
           : currentLang === "fr" ? "Espagne (La Liga)" 
           : currentLang === "it" ? "Spagna (La Liga)" 
           : "Spanien (La Liga)", 
      flag: "🇪🇸" 
    },
    { 
      value: "all", 
      label: (currentLang === "pt_br" || currentLang === "pt_pt") ? "Todas / Geral (Global)" 
           : currentLang === "en" ? "All / General (Global)" 
           : currentLang === "es" ? "Todas / General (Global)" 
           : currentLang === "fr" ? "Toutes / Général (Global)" 
           : currentLang === "it" ? "Tutte / Generale (Globale)" 
           : "Alle (Weltweit)", 
      flag: "🌍" 
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-fade-in">
      <div 
        className={`w-full max-w-md rounded-2xl border shadow-xl overflow-hidden transform transition-all duration-300 scale-100 ${
          config.theme === "dark" 
            ? "bg-slate-900 border-slate-800 text-slate-100" 
            : "bg-white border-slate-200 text-slate-800"
        }`}
      >
        {/* Header containing World cup divided icon */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200/30 bg-emerald-700 text-white">
          <div className="flex items-center gap-2.5">
            {/* World cup trophy 3 elements style */}
            <div className="p-1 px-1.5 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5.5 h-5.5 text-amber-305">
                {/* Sliced Trophy Pieces (horizontally cut in 3 layers like configuration switches) */}
                {/* Layer 1: Cup bowl & handles (y: 3.5 to 9.5) */}
                <path d="M 6.5 3.5 C 6.5 3.5, 17.5 3.5, 17.5 3.5 C 18.5 3.5, 19.5 4.5, 19.5 5.5 C 19.5 7.5, 18 9, 15.5 9 H 8.5 C 6 9, 4.5 7.5, 4.5 5.5 C 4.5 4.5, 5.5 3.5, 6.5 3.5 Z M 4.5 5.5 C 3.5 5.5, 3 6.5, 3 7 C 3 8, 4 8.5, 4.5 8.5 Z M 19.5 5.5 C 20.5 5.5, 21 6.5, 21 7 C 21 8, 20 8.5, 19.5 8.5 Z" />
                {/* Layer 2: Stem (y: 11.5 to 15) */}
                <path d="M 9.5 11.5 H 14.5 L 13.8 15 H 10.2 Z" />
                {/* Layer 3: Base (y: 17 to 22) */}
                <path d="M 7.5 17.5 H 16.5 V 19.5 H 7.5 Z M 9 20.2 H 15 V 22 H 9 Z" />
              </svg>
            </div>
            <h2 className="text-sm font-bold uppercase tracking-wider">{t.settingsTitle}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto no-scrollbar">
          
          {/* Language Selector Section - Collapsible Drawer Style */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              {t.languageTitle}
            </h3>
            <p className="text-[11px] text-slate-400">{t.selectLanguage}</p>
            
            <div className="relative mt-1">
              {/* Trigger Button to Open/Close Language Drawer */}
              <button
                type="button"
                onClick={() => setIsLangExpanded(!isLangExpanded)}
                className={`w-full flex items-center gap-3 p-3 flex-row rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  isLangExpanded
                    ? "border-emerald-600 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-extrabold"
                    : "border-slate-200/50 hover:border-slate-350 dark:border-slate-800 dark:bg-slate-950 text-slate-700 dark:text-slate-300"
                }`}
              >
                <span className="text-base leading-none select-none">
                  {languages.find((l) => l.code === currentLang)?.flag || "🌍"}
                </span>
                <span className="font-extrabold">
                  {getLocalizedLanguageName(currentLang, currentLang)}
                </span>
                <ChevronDown 
                  className={`w-4 h-4 ml-auto text-slate-400 transition-transform duration-200 ${
                    isLangExpanded ? "rotate-180 text-emerald-600 dark:text-emerald-400" : ""
                  }`} 
                />
              </button>

              {/* Language Selector Drawer Options Panel */}
              {isLangExpanded && (
                <div 
                  className={`absolute left-0 right-0 z-50 mt-1.5 rounded-xl border shadow-xl overflow-hidden max-h-60 overflow-y-auto scrollbar-thin transition-all flex flex-col ${
                    config.theme === "dark" 
                      ? "bg-slate-950 border-slate-800 text-slate-100 divide-slate-900" 
                      : "bg-white border-slate-250 text-slate-800 divide-slate-100"
                  } divide-y`}
                >
                  {languages.map((lang) => {
                    const isSelected = currentLang === lang.code;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`w-full flex items-center gap-3 p-3 text-left text-xs transition-colors cursor-pointer ${
                          isSelected 
                            ? "bg-emerald-50/10 text-emerald-700 dark:text-emerald-400 font-extrabold" 
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50"
                        }`}
                      >
                        <span className="text-base leading-none select-none">{lang.flag}</span>
                        <span className="flex-1 font-semibold">{getLocalizedLanguageName(lang.code, currentLang)}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Theme Section */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              {t.themeTitle}
            </h3>
            <div className="grid grid-cols-2 gap-3.5">
              <button
                type="button"
                onClick={() => handleThemeChange("light")}
                className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border transition-all cursor-pointer ${
                  config.theme === "light"
                    ? "border-emerald-600 bg-emerald-50/20 ring-2 ring-emerald-600/10 font-bold text-emerald-700"
                    : "border-slate-200/50 hover:border-slate-350 dark:border-slate-800 dark:bg-slate-950 text-slate-400"
                }`}
              >
                <Sun className="w-4.5 h-4.5" />
                <span className="text-xs">{t.themeLight}</span>
              </button>

              <button
                type="button"
                onClick={() => handleThemeChange("dark")}
                className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border transition-all cursor-pointer ${
                  config.theme === "dark"
                    ? "border-emerald-500 bg-emerald-950/10 ring-2 ring-emerald-500/20 font-bold text-emerald-400"
                    : "border-slate-200/50 hover:border-slate-350 dark:border-slate-800 dark:bg-slate-950 text-slate-400"
                }`}
              >
                <Moon className="w-4.5 h-4.5" />
                <span className="text-xs">{t.themeDark}</span>
              </button>
            </div>
          </div>

          {/* Auto Country / Direct Region Preference */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Flag className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              {t.regionTitle}
            </h3>
            
            {/* Detected region banner */}
            <div className={`p-3 rounded-lg border text-xs leading-relaxed ${
              config.theme === "dark" ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200/50"
            }`}>
              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wide text-[10px] mb-0.5">
                <Globe className="w-3.5 h-3.5 shrink-0" />
                {t.geoActive}
              </div>
              {t.geoText}
            </div>

            <div className="space-y-2 mt-2">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t.forceRegion}:</p>
              <div className="flex flex-col gap-1.5">
                {countriesList.map((c) => {
                  const isSelected = config.country === c.value;
                  return (
                    <button
                      key={c.value}
                      onClick={() => handleCountryChange(c.value)}
                      className={`flex items-center justify-between p-2.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                        isSelected
                          ? "border-emerald-600 bg-emerald-50/10 text-emerald-700 dark:text-emerald-400"
                          : "border-slate-250/20 dark:border-slate-850 dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-850"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base leading-none select-none">{c.flag}</span>
                        <span>{c.label}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer info message */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200/30 text-center text-[10px] text-slate-400">
          {t.footerVersion}
        </div>
      </div>
    </div>
  );
}
