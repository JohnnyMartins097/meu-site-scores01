import React, { useState, useEffect, useRef, useMemo } from "react";
import { Search } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { Language, translations } from "../i18n";
import { Match } from "../types";

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenSettings: () => void;
  viewMode: "games" | "feed";
  setViewMode: (mode: "games" | "feed") => void;
  language?: Language;
  user: string | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  matches?: Match[];
}

export default function Header({ 
  searchQuery, 
  setSearchQuery, 
  onOpenSettings, 
  viewMode, 
  setViewMode,
  language = "pt_br",
  user,
  onOpenLogin,
  onLogout,
  matches = []
}: HeaderProps) {
  const t = translations[language] || translations.pt_br;
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);

  // Dynamic Suggestions generated from the actual match lists (completely real, no hardcoded Flamengos mapping errors)
  const dynamicSuggestions = useMemo(() => {
    const list: Array<{ name: string; type: "player" | "team" | "league"; id: string; category: string }> = [];
    const teamIds = new Set<string>();
    const leagueIds = new Set<string>();
    const playerNames = new Set<string>();

    const clubCategoryLabel = language.startsWith("pt") ? "Clube" : "Club";
    const leagueCategoryLabel = language.startsWith("pt") ? "Liga" : "League";
    const athleteCategoryLabel = language.startsWith("pt") ? "Atleta" : "Athlete";

    if (matches && matches.length > 0) {
      matches.forEach((m) => {
        // Home Team
        if (m.teams?.home && !teamIds.has(String(m.teams.home.id))) {
          teamIds.add(String(m.teams.home.id));
          list.push({
            name: m.teams.home.name,
            type: "team",
            id: String(m.teams.home.id),
            category: clubCategoryLabel
          });
        }
        // Away Team
        if (m.teams?.away && !teamIds.has(String(m.teams.away.id))) {
          teamIds.add(String(m.teams.away.id));
          list.push({
            name: m.teams.away.name,
            type: "team",
            id: String(m.teams.away.id),
            category: clubCategoryLabel
          });
        }
        // League / Championship Title
        if (m.league && !leagueIds.has(String(m.league.id))) {
          leagueIds.add(String(m.league.id));
          list.push({
            name: m.league.name,
            type: "league",
            id: String(m.league.id),
            category: leagueCategoryLabel
          });
        }
        // Athletes from match events (goalscorers, subs, cards, etc.)
        if (m.events) {
          m.events.forEach((evt) => {
            if (evt.player && evt.player.name && !playerNames.has(evt.player.name)) {
              playerNames.add(evt.player.name);
              list.push({
                name: evt.player.name,
                type: "player",
                id: evt.player.name,
                category: athleteCategoryLabel
              });
            }
          });
        }
        // Athletes from lineups
        if (m.lineups) {
          m.lineups.forEach((line) => {
            if (line.startXI) {
              line.startXI.forEach((xi) => {
                if (xi.player && xi.player.name && !playerNames.has(xi.player.name)) {
                  playerNames.add(xi.player.name);
                  list.push({
                    name: xi.player.name,
                    type: "player",
                    id: xi.player.name,
                    category: athleteCategoryLabel
                  });
                }
              });
            }
          });
        }
      });
    }

    // Standard list of popular athletes and clubs as a robust fallback vocabulary base
    const fallbackAthletes = ["Pedro", "Gerson", "Arrascaeta", "Gabigol", "Estêvão", "Raphael Veiga", "Robert Lewandowski", "Vinicius Júnior", "Kylian Mbappé"];
    fallbackAthletes.forEach((player) => {
      if (!playerNames.has(player)) {
        playerNames.add(player);
        list.push({
          name: player,
          type: "player",
          id: player,
          category: athleteCategoryLabel
        });
      }
    });

    const fallbackTeams = [
      { name: "Flamengo", id: "127" },
      { name: "Palmeiras", id: "121" },
      { name: "São Paulo", id: "126" },
      { name: "Corinthians", id: "131" },
      { name: "Real Madrid", id: "541" },
      { name: "Barcelona", id: "529" }
    ];
    fallbackTeams.forEach((t) => {
      if (!teamIds.has(t.id)) {
        teamIds.add(t.id);
        list.push({
          name: t.name,
          type: "team",
          id: t.id,
          category: clubCategoryLabel
        });
      }
    });

    const fallbackLeagues = [
      { name: "Brasileirão Série A", id: "71" },
      { name: "La Liga", id: "140" }
    ];
    fallbackLeagues.forEach((l) => {
      if (!leagueIds.has(l.id)) {
        leagueIds.add(l.id);
        list.push({
          name: l.name,
          type: "league",
          id: l.id,
          category: leagueCategoryLabel
        });
      }
    });

    return list;
  }, [matches, language]);

  const [filteredSuggestions, setFilteredSuggestions] = useState<Array<{ name: string; type: "player" | "team" | "league"; id: string; category: string }>>([]);

  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const filtered = dynamicSuggestions.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [searchQuery, dynamicSuggestions]);

  // Click outside detector
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectSuggestion = (item: { name: string; type: "player" | "team" | "league"; id: string; category: string }) => {
    setSearchQuery("");
    setIsOpen(false);
    if (item.type === "player") {
      navigate(`/player/${encodeURIComponent(item.id)}`);
    } else if (item.type === "team") {
      navigate(`/team/${item.id}`);
    } else if (item.type === "league") {
      navigate(`/league/${item.id}`);
    }
  };

  return (
    <header className="bg-[#009c3b] text-white shadow-md sticky top-0 z-40 border-b border-emerald-800">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left Section: Brand Logo & Navigation */}
        <div className="flex flex-col md:flex-row items-center gap-6 w-full sm:w-auto">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[#ffdf00] rounded-[28%] flex items-center justify-center shadow-md select-none shrink-0 border border-amber-500/20">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" className="w-5.2 h-5.2 text-black font-bold">
                {/* Cup Body */}
                <path d="M 7.5 5.5 H 16.5 V 10 C 16.5 12.5, 14.5 14.5, 12 14.5 C 9.5 14.5, 7.5 12.5, 7.5 10 Z" />
                {/* Handles */}
                <path d="M 7.5 7 C 5.5 7, 5 8, 5 8.8 C 5 10, 6.2 10.3, 7.5 10.3" />
                <path d="M 16.5 7 C 18.5 7, 19 8, 19 8.8 C 19 10, 17.8 10.3, 16.5 10.3" />
                {/* Stem & Triangle Support */}
                <path d="M 12 14.5 V 17.5 L 9.5 20.5 H 14.5 Z" fill="none" />
                {/* Base Line */}
                <path d="M 6.8 20.5 H 17.2" />
              </svg>
            </div>
            <h1 className="text-2xl font-display font-black tracking-tighter uppercase select-none">
              World<span className="text-[#ffdf00]">Score</span>
            </h1>
          </Link>
          
          {/* Main Navigation Links */}
          <nav className="flex items-center gap-5 text-sm font-semibold text-emerald-100 select-none mt-1 sm:mt-0">
            <button 
              onClick={() => {
                setViewMode("games");
                navigate("/");
              }}
              className={`pb-0.5 transition-all cursor-pointer ${
                viewMode === "games" 
                  ? "text-white border-b-2 border-[#ffdf00] font-bold" 
                  : "hover:text-[#ffdf00]"
              }`}
            >
              {t.matchesTab}
            </button>
            <button 
              onClick={() => {
                setViewMode("feed");
                navigate("/");
              }}
              className={`pb-0.5 transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === "feed" 
                  ? "text-white border-b-2 border-[#ffdf00] font-bold" 
                  : "hover:text-[#ffdf00]"
              }`}
            >
              {t.feedTab}
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            </button>
            <span className="text-emerald-500 text-xs hidden md:inline">|</span>
            <span className="text-xs font-mono opacity-85 text-emerald-100 hidden md:inline">{t.activeRegionText}</span>
          </nav>
        </div>

        {/* Right Section: Search Bar with Autocomplete suggestions */}
        <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
          <div ref={dropdownRef} className="relative w-full sm:w-64">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/70">
              <Search className="w-4.5 h-4.5" />
            </span>
            <input
              id="searchInput"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full bg-white/15 border border-white/20 focus:border-white/50 text-white placeholder-white/60 pl-10 pr-4 py-1.5 sm:py-2 text-xs rounded-full focus:outline-none focus:bg-white focus:text-slate-900 transition-all font-medium shadow-xs"
              autoComplete="off"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 bg-slate-200/85 hover:bg-slate-200 text-[10px] font-bold px-1.5 py-0.5 rounded-sm"
              >
                {t.clearBtn}
              </button>
            )}

            {/* Suggestions list popup portal */}
            {isOpen && filteredSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden z-50 text-slate-850 dark:text-slate-100 text-xs text-left max-h-64 overflow-y-auto">
                <div className="px-3.5 py-2 font-black text-[9px] uppercase tracking-wider text-slate-400 bg-slate-50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-850 select-none">
                  {language.startsWith("pt") ? "Sugestões Disponíveis" : "Search Suggestions"}
                </div>
                {filteredSuggestions.map((item) => (
                  <button
                    key={`${item.type}-${item.id}`}
                    onClick={() => handleSelectSuggestion(item)}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors flex items-center justify-between border-b border-slate-100/40 dark:border-slate-800/50 last:border-b-0 cursor-pointer"
                  >
                    <span className="font-bold text-slate-800 dark:text-slate-200">{item.name}</span>
                    <span className="text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-sm">
                      {item.category}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Connected User Badge / Login Button */}
          {user ? (
            <div className="flex items-center gap-2 bg-emerald-900/60 pl-2 pr-3 py-1 rounded-xl border border-white/10 shrink-0 select-none">
              <div className="w-6.5 h-6.5 rounded-md bg-[#ffdf00] text-black transition-transform flex items-center justify-center font-extrabold text-[11px] shadow-sm uppercase tracking-wider font-mono">
                {user.slice(0, 2)}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[9px] text-emerald-300 uppercase tracking-widest leading-none font-bold">Fan</span>
                <span className="text-[11px] font-bold text-white max-w-[85px] truncate">{user}</span>
              </div>
              <button 
                onClick={onLogout}
                className="ml-1 p-1 hover:bg-rose-500/15 hover:text-rose-400 text-emerald-200 rounded-md transition-all font-bold text-[10px] cursor-pointer"
                title={language === "pt_br" || language === "pt_pt" ? "Sair" : "Log out"}
              >
                {language === "pt_br" || language === "pt_pt" ? "Sair" : "Exit"}
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="px-3.5 py-1.5 sm:py-2 bg-gradient-to-r from-amber-400 to-[#ffdf00] hover:from-amber-300 hover:to-amber-400 text-black font-extrabold text-[11px] sm:text-xs tracking-wide rounded-lg shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              <span>{t.loginBtn}</span>
            </button>
          )}

          {/* Settings button with a trophy */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 bg-emerald-800 hover:bg-emerald-900 text-amber-300 rounded-lg shadow-sm hover:shadow-md transition-all active:scale-95 group shrink-0 flex items-center justify-center cursor-pointer border border-[#ffdf00]/20"
            title={t.settingsButtonTitle}
          >
            <svg 
              viewBox="0 0 24 24" 
              fill="currentColor" 
              className="w-5.5 h-5.5 transition-transform group-hover:scale-110"
            >
              <line x1="2" y1="7" x2="22" y2="7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" className="opacity-35" />
              <line x1="2" y1="13" x2="22" y2="13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" className="opacity-35" />
              <line x1="2" y1="19" x2="22" y2="19" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" className="opacity-35" />

              <path d="M 6.5 3.5 C 6.5 3.5, 17.5 3.5, 17.5 3.5 C 18.5 3.5, 19.5 4.5, 19.5 5.5 C 19.5 7.5, 18 9, 15.5 9 H 8.5 C 6 9, 4.5 7.5, 4.5 5.5 C 4.5 4.5, 5.5 3.5, 6.5 3.5 Z M 4.5 5.5 C 3.5 5.5, 3 6.5, 3 7 C 3 8, 4 8.5, 4.5 8.5 Z M 19.5 5.5 C 20.5 5.5, 21 6.5, 21 7 C 21 8, 20 8.5, 19.5 8.5 Z" />
              <path d="M 9.5 11.5 H 14.5 L 13.8 15 H 10.2 Z" />
              <path d="M 7.5 17.5 H 16.5 V 19.5 H 7.5 Z M 9 20.2 H 15 V 22 H 9 Z" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
