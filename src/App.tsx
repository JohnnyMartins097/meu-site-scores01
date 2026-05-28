import { useState, useEffect, useRef } from "react";
import { 
  Shield, 
  Calendar, 
  Users, 
  MapPin, 
  Award, 
  Trophy, 
  Tv, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw,
  Clock,
  ThumbsUp,
  SlidersHorizontal,
  Flame,
  Target,
  Globe,
  ChevronDown,
  ChevronUp,
  Star
} from "lucide-react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import MatchDetail from "./components/MatchDetail";
import { Match, MatchEvent, League } from "./types";
import SettingsPanel, { SettingsConfig } from "./components/SettingsPanel";
import SportsFeed from "./components/SportsFeed";
import LoginModal from "./components/LoginModal";
import { SafeImage } from "./components/SafeImage";
import { Language, translations } from "./i18n";

import TeamPage from "./pages/TeamPage";
import LeaguePage from "./pages/LeaguePage";
import PlayerPage from "./pages/PlayerPage";

function getMockSportMatches(sport: string, date: string): Match[] {
  const timestamp = new Date(date + "T20:00:00").getTime() / 1000;
  
  if (sport === "basquete") {
    return [
      {
        fixture: {
          id: 90001,
          referee: "Tony Brothers",
          timezone: "UTC",
          date: `${date}T21:00:00Z`,
          timestamp,
          periods: { first: 24, second: 24 },
          venue: { id: 1, name: "Crypto.com Arena", city: "Los Angeles" },
          status: { long: "Finished", short: "FT", elapsed: 48 }
        },
        league: {
          id: 501,
          name: "NBA Basketball",
          country: "USA",
          logo: "https://media.api-sports.io/football/leagues/2.png",
          flag: "🇺🇸"
        },
        teams: {
          home: { id: 5011, name: "Los Angeles Lakers", logo: "https://media.api-sports.io/football/teams/47.png" },
          away: { id: 5012, name: "Boston Celtics", logo: "https://media.api-sports.io/football/teams/40.png" }
        },
        goals: { home: 112, away: 105 },
        score: {
          halftime: { home: 56, away: 50 },
          fulltime: { home: 112, away: 105 },
          extratime: { home: null, away: null },
          penalty: { home: null, away: null }
        },
        events: [
          { time: { elapsed: 12 }, team: { id: 5011, name: "Lakers" }, player: { name: "LeBron James" }, type: "Goal", detail: "3 Pointer" },
          { time: { elapsed: 24 }, team: { id: 5012, name: "Celtics" }, player: { name: "Jayson Tatum" }, type: "Goal", detail: "Slam Dunk" }
        ],
        lineups: [
          {
            team: { id: 5011, name: "Lakers", logo: "https://media.api-sports.io/football/teams/47.png" },
            coach: { name: "JJ Redick" },
            formation: "Starting Five",
            startXI: [
              { player: { name: "LeBron James", number: 23, pos: "F" } },
              { player: { name: "Anthony Davis", number: 3, pos: "C" } }
            ],
            substitutes: [
              { player: { name: "D'Angelo Russell", number: 1, pos: "G" } }
            ]
          }
        ]
      },
      {
        fixture: {
          id: 90002,
          referee: "Scott Foster",
          timezone: "UTC",
          date: `${date}T18:30:00Z`,
          timestamp,
          periods: { first: 12, second: 12 },
          venue: { id: 2, name: "Kaseya Center", city: "Miami" },
          status: { long: "Live", short: "2H", elapsed: 32 }
        },
        league: {
          id: 501,
          name: "NBA Basketball",
          country: "USA",
          logo: "https://media.api-sports.io/football/leagues/2.png",
          flag: "🇺🇸"
        },
        teams: {
          home: { id: 5013, name: "Miami Heat", logo: "https://media.api-sports.io/football/teams/49.png" },
          away: { id: 5014, name: "Chicago Bulls", logo: "https://media.api-sports.io/football/teams/50.png" }
        },
        goals: { home: 84, away: 78 },
        score: {
          halftime: { home: 48, away: 50 },
          fulltime: { home: 84, away: 78 },
          extratime: { home: null, away: null },
          penalty: { home: null, away: null }
        },
        events: []
      }
    ];
  }
  
  if (sport === "vôlei") {
    return [
      {
        fixture: {
          id: 90101,
          referee: "Marcos Barbosa",
          timezone: "UTC",
          date: `${date}T19:00:00Z`,
          timestamp,
          periods: { first: 25, second: 25 },
          venue: { id: 3, name: "Arena CFO", city: "Fortaleza" },
          status: { long: "Finished", short: "FT", elapsed: 90 }
        },
        league: {
          id: 502,
          name: "Superliga Volleyball",
          country: "Brazil",
          logo: "https://media.api-sports.io/football/leagues/13.png",
          flag: "🇧🇷"
        },
        teams: {
          home: { id: 5021, name: "Sada Cruzeiro", logo: "https://media.api-sports.io/football/teams/1005.png" },
          away: { id: 5022, name: "Itambé Minas", logo: "https://media.api-sports.io/football/teams/1006.png" }
        },
        goals: { home: 3, away: 1 },
        score: {
          halftime: { home: 2, away: 0 },
          fulltime: { home: 3, away: 1 },
          extratime: { home: null, away: null },
          penalty: { home: null, away: null }
        },
        events: []
      }
    ];
  }

  if (sport === "tênis") {
    return [
      {
        fixture: {
          id: 90201,
          referee: "Eva Asderaki",
          timezone: "UTC",
          date: `${date}T14:00:00Z`,
          timestamp,
          periods: { first: 6, second: 6 },
          venue: { id: 4, name: "Philippe Chatrier", city: "Paris" },
          status: { long: "Finished", short: "FT", elapsed: 180 }
        },
        league: {
          id: 503,
          name: "Roland Garros Grand Slam",
          country: "Spain",
          logo: "https://media.api-sports.io/football/leagues/10.png",
          flag: "🇪🇸"
        },
        teams: {
          home: { id: 5031, name: "Carlos Alcaraz", logo: "https://media.api-sports.io/football/teams/112.png" },
          away: { id: 5032, name: "Jannik Sinner", logo: "https://media.api-sports.io/football/teams/109.png" }
        },
        goals: { home: 3, away: 2 },
        score: {
          halftime: { home: 1, away: 1 },
          fulltime: { home: 3, away: 2 },
          extratime: { home: null, away: null },
          penalty: { home: null, away: null }
        },
        events: []
      }
    ];
  }

  if (sport === "beisebol") {
    return [
      {
        fixture: {
          id: 90301,
          referee: "Laz Diaz",
          timezone: "UTC",
          date: `${date}T19:30:00Z`,
          timestamp,
          periods: { first: null, second: null },
          venue: { id: 5, name: "Yankee Stadium", city: "New York" },
          status: { long: "Finished", short: "FT", elapsed: 160 }
        },
        league: {
          id: 504,
          name: "MLB Baseball",
          country: "USA",
          logo: "https://media.api-sports.io/football/leagues/2.png",
          flag: "🇺🇸"
        },
        teams: {
          home: { id: 5041, name: "New York Yankees", logo: "https://media.api-sports.io/football/teams/145.png" },
          away: { id: 5042, name: "Boston Red Sox", logo: "https://media.api-sports.io/football/teams/146.png" }
        },
        goals: { home: 6, away: 4 },
        score: {
          halftime: { home: null, away: null },
          fulltime: { home: 6, away: 4 },
          extratime: { home: null, away: null },
          penalty: { home: null, away: null }
        },
        events: []
      }
    ];
  }

  if (sport === "futebol americano") {
    return [
      {
        fixture: {
          id: 90401,
          referee: "Carl Cheffers",
          timezone: "UTC",
          date: `${date}T20:00:00Z`,
          timestamp,
          periods: { first: 14, second: 13 },
          venue: { id: 6, name: "Arrowhead Stadium", city: "Kansas City" },
          status: { long: "Finished", short: "FT", elapsed: 180 }
        },
        league: {
          id: 505,
          name: "NFL Football",
          country: "USA",
          logo: "https://media.api-sports.io/football/leagues/2.png",
          flag: "🇺🇸"
        },
        teams: {
          home: { id: 5051, name: "Kansas City Chiefs", logo: "https://media.api-sports.io/football/teams/155.png" },
          away: { id: 5052, name: "San Francisco 49ers", logo: "https://media.api-sports.io/football/teams/156.png" }
        },
        goals: { home: 27, away: 24 },
        score: {
          halftime: { home: 14, away: 10 },
          fulltime: { home: 27, away: 24 },
          extratime: { home: null, away: null },
          penalty: { home: null, away: null }
        },
        events: []
      }
    ];
  }

  if (sport === "handebol") {
    return [
      {
        fixture: {
          id: 90501,
          referee: "Gjording Hansen",
          timezone: "UTC",
          date: `${date}T18:00:00Z`,
          timestamp,
          periods: { first: 15, second: 16 },
          venue: { id: 7, name: "Palau Blaugrana", city: "Barcelona" },
          status: { long: "Finished", short: "FT", elapsed: 60 }
        },
        league: {
          id: 506,
          name: "EHF Champions League",
          country: "World",
          logo: "https://media.api-sports.io/football/leagues/3.png",
          flag: "🌍"
        },
        teams: {
          home: { id: 5051, name: "Barcelona Handbol", logo: "https://media.api-sports.io/football/teams/529.png" },
          away: { id: 5052, name: "PSG Handball", logo: "https://media.api-sports.io/football/teams/85.png" }
        },
        goals: { home: 31, away: 29 },
        score: {
          halftime: { home: 15, away: 14 },
          fulltime: { home: 31, away: 29 },
          extratime: { home: null, away: null },
          penalty: { home: null, away: null }
        },
        events: []
      }
    ];
  }

  return [];
}

const getLocalDateString = (d: Date = new Date()) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export default function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [realTodayDate, setRealTodayDate] = useState(() => getLocalDateString());
  const [selectedDate, setSelectedDate] = useState(() => getLocalDateString());
  const [liveOnly, setLiveOnly] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState("all");
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  // Layout View mode Toggle ("games" list vs social fan "feed")
  const [viewMode, setViewMode] = useState<"games" | "feed">("games");
  
  // Sports category state
  const [selectedSport, setSelectedSport] = useState("futebol");
  
  // Favorites toggle state
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  // Favorites state storing leagues (IDs), teams (names), players (names)
  const [favorites, setFavorites] = useState<{
    leagues: number[];
    teams: string[];
    players: string[];
  }>(() => {
    try {
      const saved = localStorage.getItem("worldscore_favorites");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    return { leagues: [], teams: [], players: [] };
  });

  // Automatically save favorites to local storage on changes
  useEffect(() => {
    localStorage.setItem("worldscore_favorites", JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavoriteLeague = (leagueId: number) => {
    setFavorites(prev => {
      const exists = prev.leagues.includes(leagueId);
      const nextLeagues = exists 
        ? prev.leagues.filter(id => id !== leagueId)
        : [...prev.leagues, leagueId];
      return { ...prev, leagues: nextLeagues };
    });
  };

  const toggleFavoriteTeam = (teamName: string) => {
    setFavorites(prev => {
      const exists = prev.teams.includes(teamName);
      const nextTeams = exists
        ? prev.teams.filter(t => t !== teamName)
        : [...prev.teams, teamName];
      return { ...prev, teams: nextTeams };
    });
  };

  const toggleFavoritePlayer = (playerName: string) => {
    setFavorites(prev => {
      const exists = prev.players.includes(playerName);
      const nextPlayers = exists
        ? prev.players.filter(p => p !== playerName)
        : [...prev.players, playerName];
      return { ...prev, players: nextPlayers };
    });
  };
  
  // Settings configurations (with Language support)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [config, setConfig] = useState<SettingsConfig>({
    theme: "light",
    country: "Brazil",
    autoCountryDetected: "Brasil (BR)",
    alertsEnabled: true,
    language: "pt_br"
  });

  // User authentication flow states
  const [user, setUser] = useState<string | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Load saved user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("ws_logged_user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.name) {
          setUser(parsed.name);
        }
      } catch (e) {}
    }
  }, []);

  // Collapsible drawers/accordions state corresponding to each country
  const [expandedCountries, setExpandedCountries] = useState<Record<string, boolean>>({});

  // Keep track of score changes to trigger goals toasts
  const [goalToast, setGoalToast] = useState<{
    match: Match;
    teamName: string;
    scorer: string;
    minute: number;
    homeScore: number;
    awayScore: number;
  } | null>(null);

  // Store previously loaded matches to observe score shifts
  const prevMatchesRef = useRef<Match[]>([]);

  // Load and auto-detect country and language config on mount
  useEffect(() => {
    const saved = localStorage.getItem("worldscore_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Default language if not present in older config saved formats, or migrate pt to pt_br
        if (!parsed.language || parsed.language === "pt") parsed.language = "pt_br";
        setConfig(parsed);
      } catch (e) {}
    } else {
      let detectedCountry = "Brazil";
      let detectedLang: Language = "pt_br";

      if (typeof navigator !== "undefined") {
        const blang = (navigator.language || "").toLowerCase();
        const tz = (Intl?.DateTimeFormat()?.resolvedOptions()?.timeZone || "").toLowerCase();
        
        if (blang.includes("es") || tz.includes("madrid") || tz.includes("spain")) {
          detectedCountry = "Spain";
          detectedLang = "es";
        } else if (blang.includes("en") || tz.includes("london") || tz.includes("europe") || tz.includes("america/new_york")) {
          detectedCountry = "England";
          detectedLang = "en";
        } else if (blang.includes("fr")) {
          detectedLang = "fr";
        } else if (blang.includes("it")) {
          detectedLang = "it";
        } else if (blang.includes("de")) {
          detectedLang = "de";
        } else if (blang.includes("pt-pt") || blang.includes("pt-pg") || tz.includes("lisbon") || tz.includes("europe/lisbon")) {
          detectedCountry = "Spain";
          detectedLang = "pt_pt";
        } else {
          detectedCountry = "Brazil";
          detectedLang = "pt_br";
        }
      }
      
      const newCfg: SettingsConfig = {
        theme: "light",
        country: detectedCountry,
        autoCountryDetected: detectedCountry === "Brazil" ? "Brasil" : detectedCountry === "Spain" ? "Espanha" : "Inglaterra",
        alertsEnabled: true,
        language: detectedLang
      };
      setConfig(newCfg);
      localStorage.setItem("worldscore_settings", JSON.stringify(newCfg));
    }

    // Resolve real today date of physical calendar (prioritizing user browser local clock to respect user timezone)
    const resolveRealToday = async () => {
      try {
        const localTodayStr = getLocalDateString();
        setRealTodayDate(localTodayStr);
        setSelectedDate(localTodayStr);
      } catch (err) {
        console.error("Failed to resolve real today date:", err);
      }
    };
    resolveRealToday();
  }, []);

  const language = config.language || "pt_br";
  const isPt = language.startsWith("pt");
  const t = translations[language] || translations.pt_br;

  // Save config on changes
  const handleSaveConfig = (newCfg: SettingsConfig) => {
    setConfig(newCfg);
    localStorage.setItem("worldscore_settings", JSON.stringify(newCfg));
  };

  // Initialize and auto-expand country drawers when matches are loaded
  useEffect(() => {
    if (matches.length > 0) {
      setExpandedCountries((prev) => {
        const next = { ...prev };
        matches.forEach((m) => {
          const country = m.league.country || "Internacional";
          // Auto-expand loaded drawers by default on new loads so matches are immediately visible
          next[country] = true;
        });
        return next;
      });
    }
  }, [matches]);

  // Monitor Window size to switch master-detail layout mode dynamically
  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Set initial selected match once fixtures load
  useEffect(() => {
    if (isLargeScreen && matches.length > 0 && !selectedMatch) {
      // Prioritize selecting a Live game, else the first match
      const liveGame = matches.find(m => ["1H", "2H", "HT", "ET"].includes(m.fixture.status.short));
      setSelectedMatch(liveGame || matches[0]);
    }
  }, [matches, isLargeScreen]);

// Main fetch function
  const fetchMatches = async (date: string, isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Sao_Paulo";
      let nextMatches: Match[] = [];
      let success = false;

      // 1. PRIMEIRA TENTATIVA: Query standard server /api/fixtures proxy (fast, cached, secure)
      try {
        const localRes = await fetch(`/api/fixtures?date=${date}&timezone=${encodeURIComponent(timezone)}&today=${date}`);
        if (localRes.ok) {
          const localData = await localRes.json();
          if (localData && Array.isArray(localData.response)) {
            nextMatches = localData.response;
            success = true;
          }
        }
      } catch (localErr) {
        console.warn("[Client] Local /api/fixtures endpoint failed, falling back to direct RapidAPI browser call:", localErr);
      }

      // 2. SEGUNDA TENTATIVA: Direct RapidAPI (Vercel static)
      if (!success) {
        const formattedDate = date.replace(/-/g, "");
        const res = await fetch(`https://free-api-live-football-data.p.rapidapi.com/football-get-matches-by-date?date=${formattedDate}`, {
          method: "GET",
          headers: {
            "x-rapidapi-host": "free-api-live-football-data.p.rapidapi.com",
            "x-rapidapi-key": "9b9bc4cde1mshac85de8628281aap1fe278jsna8a022da00be"
          }
        });

        if (!res.ok) throw new Error("Erro de servidor ao buscar jogos");
        const data = await res.json();
        
        let rawEvents: any[] = [];
        if (data.response && Array.isArray(data.response)) {
          rawEvents = data.response;
        } else if (data.response && data.response.matches && Array.isArray(data.response.matches)) {
          rawEvents = data.response.matches;
        } else if (Array.isArray(data)) {
          rawEvents = data;
        } else if (data.matches && Array.isArray(data.matches)) {
          rawEvents = data.matches;
        }

        const mappedList = rawEvents.map((evt: any) => {
          try {
            const isFinished = evt.status?.finished === true;
            const isLive = evt.status?.ongoing === true;

            let statusShort = "NS";
            let statusLong = "Not Started";
            let elapsed = 0;

            if (isFinished) {
              statusShort = "FT";
              statusLong = "Match Finished";
              elapsed = 90;
            } else if (isLive) {
              const shortTime = evt.status?.liveTime?.short || "";
              if (shortTime.includes("HT") || shortTime.includes("intervalo") || shortTime.includes("Intervalo") || shortTime.includes("half") || shortTime.includes("Half")) {
                statusShort = "HT";
                statusLong = "Halftime";
                elapsed = 45;
              } else {
                const numericPart = parseInt(shortTime.replace(/[^0-9]/g, ""), 10) || 45;
                elapsed = numericPart;
                statusShort = elapsed <= 45 ? "1H" : "2H";
                statusLong = elapsed <= 45 ? "First Half" : "Second Half";
              }
            } else if (evt.status?.cancelled) {
              statusShort = "CANCL";
              statusLong = "Cancelled";
            }

            const startTimestamp = evt.timeTS ? Math.floor(evt.timeTS / 1000) : Math.floor(Date.now() / 1000);
            const matchDate = evt.status?.utcTime || (evt.timeTS ? new Date(evt.timeTS).toISOString() : new Date().toISOString());

            const homeGoals = evt.home?.score !== undefined ? evt.home.score : null;
            const awayGoals = evt.away?.score !== undefined ? evt.away.score : null;

            const homeWinner = (homeGoals !== null && awayGoals !== null && isFinished) ? (homeGoals > awayGoals) : null;
            const awayWinner = (homeGoals !== null && awayGoals !== null && isFinished) ? (awayGoals > homeGoals) : null;

            const homeId = evt.home?.id || 100001;
            const awayId = evt.away?.id || 100002;

            const leagueId = evt.leagueId || 999;
            const LEAGUE_LIST = [
              { id: 71, name: "Brasileirão Série A", country: "Brazil", logo: "https://media.api-sports.io/football/leagues/71.png", flag: "https://media.api-sports.io/flags/br.svg" },
              { id: 13, name: "Copa Libertadores", country: "World", logo: "https://media.api-sports.io/football/leagues/13.png", flag: "https://media.api-sports.io/flags/world.svg" },
              { id: 2, name: "UEFA Champions League", country: "World", logo: "https://media.api-sports.io/football/leagues/2.png", flag: "https://media.api-sports.io/flags/world.svg" },
              { id: 39, name: "Premier League", country: "England", logo: "https://media.api-sports.io/football/leagues/39.png", flag: "https://media.api-sports.io/flags/gb.svg" },
              { id: 140, name: "La Liga", country: "Spain", logo: "https://media.api-sports.io/football/leagues/140.png", flag: "https://media.api-sports.io/flags/es.svg" }
            ];
            const matchedLeague = LEAGUE_LIST.find(l => l.id === leagueId);
            
            const leagueName = evt.league?.name || (matchedLeague ? matchedLeague.name : "Competição");
            const leagueCountry = evt.league?.country || (matchedLeague ? matchedLeague.country : "Mundo");
            const leagueLogo = matchedLeague ? matchedLeague.logo : `https://www.sofascore.com/api/v1/unique-tournament/${leagueId}/image`;
            const leagueFlag = matchedLeague ? matchedLeague.flag : "https://media.api-sports.io/flags/world.svg";

            return {
              fixture: {
                id: evt.id || Math.floor(Math.random() * 100000),
                referee: "Árbitro",
                timezone: "UTC",
                date: matchDate,
                timestamp: startTimestamp,
                periods: { first: null, second: null },
                venue: { 
                  id: 1, 
                  name: "Estádio Esportivo", 
                  city: "Cidade" 
                },
                status: { 
                  long: statusLong, 
                  short: statusShort, 
                  elapsed: elapsed
                }
              },
              league: {
                id: leagueId,
                name: leagueName,
                country: leagueCountry,
                logo: leagueLogo,
                flag: leagueFlag,
                season: 2026,
                round: "Rodada"
              },
              teams: {
                home: { 
                  id: homeId, 
                  name: evt.home?.name || evt.home?.longName || "Casa", 
                  logo: `https://img.sofascore.com/api/v1/team/${homeId}/image`, 
                  winner: homeWinner 
                },
                away: { 
                  id: awayId, 
                  name: evt.away?.name || evt.away?.longName || "Visitante", 
                  logo: `https://img.sofascore.com/api/v1/team/${awayId}/image`, 
                  winner: awayWinner 
                }
              },
              goals: { home: homeGoals, away: awayGoals },
              score: {
                halftime: { 
                  home: (isFinished || isLive) && homeGoals !== null ? Math.max(0, homeGoals - 1) : null, 
                  away: (isFinished || isLive) && awayGoals !== null ? Math.max(0, awayGoals - 1) : null 
                },
                fulltime: { home: homeGoals, away: awayGoals },
                extratime: { home: null, away: null },
                penalty: { home: null, away: null }
              },
              events: [],
              statistics: [],
              lineups: [],
              detailsLoaded: false
            } as Match;
          } catch (mErr) {
            console.error("Erro ao mapear jogo individual no client:", mErr);
            return null;
          }
        }).filter((m): m is Match => m !== null);

        nextMatches = mappedList.filter((m: Match) => {
          try {
            const timestampMs = m.fixture.timestamp * 1000;
            const targetDate = new Date(timestampMs);
            const userLocaleDateStr = targetDate.toLocaleDateString("en-CA", { timeZone: timezone });
            return userLocaleDateStr === date;
          } catch (tzErr) {
            return true;
          }
        });
      }

      // Detect Goal Score Updates for toasts
      if (prevMatchesRef.current.length > 0 && nextMatches.length > 0) {
        nextMatches.forEach((newM: Match) => {
          const oldM = prevMatchesRef.current.find(o => o.fixture.id === newM.fixture.id);
          if (oldM) {
            const homeDiff = (newM.goals.home ?? 0) - (oldM.goals.home ?? 0);
            const awayDiff = (newM.goals.away ?? 0) - (oldM.goals.away ?? 0);

            if (homeDiff > 0 || awayDiff > 0) {
              let scorerName = "Jogador";
              const matchEvents = newM.events || [];
              const latestGoal = [...matchEvents]
                .sort((a, b) => b.time.elapsed - a.time.elapsed)
                .find(e => e.type === "Goal");
              
              if (latestGoal) {
                scorerName = latestGoal.player.name;
              }

              setGoalToast({
                match: newM,
                teamName: homeDiff > 0 ? newM.teams.home.name : newM.teams.away.name,
                scorer: scorerName,
                minute: newM.fixture.status.elapsed,
                homeScore: newM.goals.home ?? 0,
                awayScore: newM.goals.away ?? 0
              });

              setTimeout(() => {
                setGoalToast(null);
              }, 6000);
            }
          }
        });
      }

      // Merge details
      setMatches(prevList => {
        return nextMatches.map((newM: Match) => {
          const existing = prevList.find(oldM => oldM.fixture.id === newM.fixture.id);
          if (existing) {
            return {
              ...newM,
              events: existing.events || [],
              statistics: existing.statistics || [],
              lineups: existing.lineups || [],
              detailsLoaded: existing.detailsLoaded || false
            };
          }
          return newM;
        });
      });
      prevMatchesRef.current = nextMatches;

      if (selectedMatch) {
        const updatedSelected = nextMatches.find(m => m.fixture.id === selectedMatch.fixture.id);
        if (updatedSelected) {
          setSelectedMatch(prev => {
            if (prev && prev.fixture.id === updatedSelected.fixture.id) {
              return { ...updatedSelected, events: prev.events || [], statistics: prev.statistics || [], lineups: prev.lineups || [], detailsLoaded: prev.detailsLoaded || false };
            }
            return updatedSelected;
          });
        }
      }

      setError(null);
    } catch (err: any) {
      console.error(err);
      if (!isSilent) {
        setError(err.message || "Erro de conexão ao buscar jogos.");
      }
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  // Fetch on date changes
  useEffect(() => {
    setSelectedMatch(null);
    setSelectedLeague("all");
    fetchMatches(selectedDate);
  }, [selectedDate]);

  // Load match details dynamically if missing
  useEffect(() => {
    if (!selectedMatch) return;
    
    const isFutebol = selectedSport === "futebol";
    const needsDetails = isFutebol && !selectedMatch.detailsLoaded;

    if (needsDetails) {
      const matchId = selectedMatch.fixture.id;
      const fetchDetails = async () => {
        try {
          let detailData: any = null;
          let success = false;

          // 1. PRIMEIRA TENTATIVA: Query server-side api fixture-detail (cached, secure)
          try {
            const localRes = await fetch(`/api/fixture-detail?id=${matchId}`);
            if (localRes.ok) {
              detailData = await localRes.json();
              if (detailData && (detailData.events || detailData.statistics || detailData.lineups)) {
                success = true;
              }
            }
          } catch (localErr) {
            console.warn("[Client] Local proxy /api/fixture-detail failed, falling back to direct RapidAPI:", localErr);
          }

          // 2. SEGUNDA TENTATIVA: Direct RapidAPI (Vercel)
          if (!success) {
            const rapidHeaders = {
              "x-rapidapi-host": "free-api-live-football-data.p.rapidapi.com",
              "x-rapidapi-key": "9b9bc4cde1mshac85de8628281aap1fe278jsna8a022da00be"
            };

            // Fetch incidents, stats, hometeam lineup, awayteam lineup in parallel
            const [detailRes, statsRes, homeLineupRes, awayLineupRes] = await Promise.all([
              fetch(`https://free-api-live-football-data.p.rapidapi.com/football-get-match-detail?eventid=${matchId}`, { headers: rapidHeaders }).catch(() => null),
              fetch(`https://free-api-live-football-data.p.rapidapi.com/football-get-match-all-stats?eventid=${matchId}`, { headers: rapidHeaders }).catch(() => null),
              fetch(`https://free-api-live-football-data.p.rapidapi.com/football-get-hometeam-lineup?eventid=${matchId}`, { headers: rapidHeaders }).catch(() => null),
              fetch(`https://free-api-live-football-data.p.rapidapi.com/football-get-awayteam-lineup?eventid=${matchId}`, { headers: rapidHeaders }).catch(() => null)
            ].map(p => p?.then(r => r && r.ok ? r.json() : null).catch(() => null)));

            const infoData = detailRes || {};
            const homeTeamId = selectedMatch.teams.home.id;
            const homeTeamName = selectedMatch.teams.home.name;
            const awayTeamId = selectedMatch.teams.away.id;
            const awayTeamName = selectedMatch.teams.away.name;

            const homeTeamRef = { id: homeTeamId, name: homeTeamName };
            const awayTeamRef = { id: awayTeamId, name: awayTeamName };

            // Parse Incidents (Events/Incidents)
            let parsedEvents: any[] = [];
            const incidentsList = infoData.response?.incidents || infoData.incidents || [];
            if (Array.isArray(incidentsList)) {
              parsedEvents = incidentsList.map((inc: any) => {
                const isHome = inc.isHome ?? (inc.home === true);
                const team = isHome ? homeTeamRef : awayTeamRef;
                
                let type = "Subst";
                let detail = inc.incidentClass || "";
                if (inc.incidentType === "goal") {
                  type = "Goal";
                  detail = inc.incidentClass === "regular" ? "Normal Goal" : (inc.incidentClass === "penalty" ? "Penalty" : "Own Goal");
                } else if (inc.incidentType === "card") {
                  type = "Card";
                  detail = inc.incidentClass === "yellow" ? "Yellow Card" : "Red Card";
                } else if (inc.incidentType === "substitution") {
                  type = "Subst";
                  detail = `Sai: ${inc.playerOut?.name || "Jogador"} / Entra: ${inc.playerIn?.name || "Jogador"}`;
                }

                return {
                  time: { elapsed: inc.time },
                  team: { id: team.id, name: team.name },
                  player: { name: inc.player?.name || inc.playerIn?.name || "Jogador" },
                  assist: inc.assist ? { name: inc.assist.name } : null,
                  type,
                  detail
                };
              });
            }

            // Parse Lineups
            let parsedLineups: any[] = [];
            const homeLineupBlock = homeLineupRes?.response?.lineup || homeLineupRes?.lineup;
            const awayLineupBlock = awayLineupRes?.response?.lineup || awayLineupRes?.lineup;

            const mapLineupClient = (teamBlock: any, teamRef: any) => {
              if (!teamBlock || !teamBlock.starters) return null;
              const starList = teamBlock.starters || [];
              const subList = teamBlock.subs || [];

              const startXI = starList.map((p: any) => {
                let pos = "M";
                if (p.usualPlayingPositionId === 0) pos = "G";
                else if (p.usualPlayingPositionId === 1) pos = "D";
                else if (p.usualPlayingPositionId === 2) pos = "M";
                else if (p.usualPlayingPositionId === 3) pos = "F";
                return {
                  player: {
                    id: p.id,
                    name: p.name,
                    number: parseInt(p.shirtNumber) || 0,
                    pos,
                    rating: p.performance?.rating || null,
                    gridX: p.verticalLayout?.x ?? p.horizontalLayout?.x ?? 0.5,
                    gridY: p.verticalLayout?.y ?? p.horizontalLayout?.y ?? 0.5
                  }
                };
              });

              const substitutes = subList.map((p: any) => {
                let pos = "M";
                if (p.usualPlayingPositionId === 0) pos = "G";
                else if (p.usualPlayingPositionId === 1) pos = "D";
                else if (p.usualPlayingPositionId === 2) pos = "M";
                else if (p.usualPlayingPositionId === 3) pos = "F";
                return {
                  player: {
                    id: p.id,
                    name: p.name,
                    number: parseInt(p.shirtNumber) || 0,
                    pos,
                    rating: p.performance?.rating || null
                  }
                };
              });

              return {
                team: { ...teamRef, logo: `https://img.sofascore.com/api/v1/team/${teamRef.id}/image` },
                formation: teamBlock.formation || "4-3-3",
                startXI,
                substitutes,
                coach: { name: teamBlock.coach?.name || "Técnico" }
              };
            };

            const mappedH = mapLineupClient(homeLineupBlock, homeTeamRef);
            const mappedA = mapLineupClient(awayLineupBlock, awayTeamRef);
            if (mappedH) parsedLineups.push(mappedH);
            if (mappedA) parsedLineups.push(mappedA);

            // Parse Stats
            let parsedStats: any[] = [];
            const rawStatsList = statsRes?.response?.stats || statsRes?.stats;
            if (rawStatsList) {
              const statTypeMapping: Record<string, string> = {
                "Ball possession": "Ball Possession",
                "Total shots": "Total Shots",
                "Shots on target": "Shots on Goal",
                "Shots off target": "Shots off Goal",
                "Corner kicks": "Corner Kicks",
                "Fouls": "Fouls",
                "Yellow cards": "Yellow Cards",
                "Red cards": "Red Cards",
                "Goalkeeper saves": "Goalkeeper Saves",
                "Passes": "Total passes",
                "Accurate passes": "Passes accurate"
              };

              const homeStatsList: any[] = [];
              const awayStatsList: any[] = [];

              if (Array.isArray(rawStatsList)) {
                rawStatsList.forEach((group: any) => {
                  if (group && Array.isArray(group.stats)) {
                    group.stats.forEach((item: any) => {
                      if (item && item.stats && item.stats.length === 2) {
                        const parentType = item.title;
                        const mappedType = statTypeMapping[parentType] || parentType;
                        homeStatsList.push({ type: mappedType, value: item.stats[0] });
                        awayStatsList.push({ type: mappedType, value: item.stats[1] });
                      }
                    });
                  }
                });
              }

              if (homeStatsList.length > 0) {
                parsedStats = [
                  { team: { ...homeTeamRef, logo: `https://img.sofascore.com/api/v1/team/${homeTeamId}/image` }, statistics: homeStatsList },
                  { team: { ...awayTeamRef, logo: `https://img.sofascore.com/api/v1/team/${awayTeamId}/image` }, statistics: awayStatsList }
                ];
              }
            }

            detailData = {
              events: parsedEvents,
              statistics: parsedStats,
              lineups: parsedLineups
            };
          }

          setSelectedMatch(prev => {
            if (prev && prev.fixture.id === matchId) {
              return {
                ...prev,
                events: detailData.events || [],
                statistics: detailData.statistics || [],
                lineups: detailData.lineups || [],
                detailsLoaded: true
              };
            }
            return prev;
          });

          setMatches(prevList => prevList.map(m => {
            if (m.fixture.id === matchId) {
              return {
                ...m,
                events: detailData.events || [],
                statistics: detailData.statistics || [],
                lineups: detailData.lineups || [],
                detailsLoaded: true
              };
            }
            return m;
          }));
        } catch (err) {
          console.error("Erro ao buscar detalhes estendidos:", err);
          setSelectedMatch(prev => {
            if (prev && prev.fixture.id === matchId) {
              return { ...prev, detailsLoaded: true };
            }
            return prev;
          });
        }
      };

      fetchDetails();
    }
  }, [selectedMatch?.fixture.id, selectedSport]);

  // Periodic polling every 5 seconds to load simulated live match ticks and scores
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMatches(selectedDate, true);
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedDate, selectedMatch]);

  // Stepping calendar date helper
  const handleStepDay = (step: number) => {
    const baseDate = new Date(selectedDate + "T12:00:00");
    baseDate.setDate(baseDate.getDate() + step);
    setSelectedDate(baseDate.toISOString().slice(0, 10));
  };

  // Locale detection for date string and days formatting
  let localeStr = "pt-BR";
  if (language === "en") localeStr = "en-US";
  else if (language === "es") localeStr = "es-ES";
  else if (language === "fr") localeStr = "fr-FR";
  else if (language === "it") localeStr = "it-IT";
  else if (language === "de") localeStr = "de-DE";

  // Helper to resolve descriptive schedule names in active calendar (Ontem, Amanhã, Hoje, or custom formats)
  const getCalendarLabel = (dateStr: string) => {
    const isPt = language.startsWith("pt");
    const isEs = language === "es";
    const isFr = language === "fr";
    const isIt = language === "it";
    const isDe = language === "de";

    if (dateStr === realTodayDate) {
      if (isPt) return "Hoje";
      if (isEs) return "Hoy";
      if (isFr) return "Aujourd'hui";
      if (isIt) return "Oggi";
      if (isDe) return "Heute";
      return "Today";
    }

    // Yesterday
    const yesterdayDate = new Date(realTodayDate + "T12:00:00");
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = getLocalDateString(yesterdayDate);
    if (dateStr === yesterdayStr) {
      if (isPt) return "Ontem";
      if (isEs) return "Ayer";
      if (isFr) return "Hier";
      if (isIt) return "Ieri";
      if (isDe) return "Gestern";
      return "Yesterday";
    }

    // Tomorrow
    const tomorrowDate = new Date(realTodayDate + "T12:00:00");
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrowStr = getLocalDateString(tomorrowDate);
    if (dateStr === tomorrowStr) {
      if (isPt) return "Amanhã";
      if (isEs) return "Mañana";
      if (isFr) return "Demain";
      if (isIt) return "Domani";
      if (isDe) return "Morgen";
      return "Tomorrow";
    }

    // Others: date + day of the week
    const d = new Date(dateStr + "T12:00:00");
    const formattedDate = d.toLocaleDateString(localeStr, { day: "2-digit", month: "2-digit" });
    const weekdayName = d.toLocaleDateString(localeStr, { weekday: "long" })
      .replace("-feira", "")
      .replace("-Feira", "")
      .replace(".", "");
    const capitalizedWeekday = weekdayName.charAt(0).toUpperCase() + weekdayName.slice(1);
    return `${formattedDate} - ${capitalizedWeekday}`;
  };

  // Format date to local readable headers
  const formattedHeaderDate = new Date(selectedDate + "T12:00:00")
    .toLocaleDateString(localeStr, {
      weekday: "long",
      day: "2-digit",
      month: "short"
    })
    .toUpperCase();

  // Resolve correct matches list for the selected sport
  const activeSportMatches = selectedSport === "futebol" ? matches : getMockSportMatches(selectedSport, selectedDate);

  // Extract all distinct leagues list representing currently loaded games to fill dynamic filters
  const distinctLeagues = (Array.from(
    new Map(activeSportMatches.map((m) => [m.league.id, m.league])).values()
  ) as League[]).sort((a, b) => a.name.localeCompare(b.name));

  // Filter logic
  const filteredMatches = activeSportMatches.filter((match) => {
    const isLive = ["1H", "2H", "HT", "ET", "BT", "P", "SUSP", "INT"].includes(
      match.fixture.status.short
    );
    if (liveOnly && !isLive) return false;

    // Filter by favorites if showOnlyFavorites is true
    if (showOnlyFavorites) {
      const isLeagueFav = favorites.leagues.includes(match.league.id);
      const isHomeTeamFav = favorites.teams.includes(match.teams.home.name);
      const isAwayTeamFav = favorites.teams.includes(match.teams.away.name);
      
      const matchLineups = match.lineups || [];
      const hasFavPlayer = matchLineups.some(lineup => {
        const starters = lineup.startXI?.some(xi => favorites.players.includes(xi.player.name)) ?? false;
        const subs = lineup.substitutes?.some(sub => favorites.players.includes(sub.player.name)) ?? false;
        return starters || subs;
      });

      if (!isLeagueFav && !isHomeTeamFav && !isAwayTeamFav && !hasFavPlayer) {
        return false;
      }
    }

    return true;
  });

  // Identify prestigiadas competições (Major International tournaments) to separate them on top
  const isMajorLeague = (leagueName: string, leagueCountry: string): boolean => {
    const ln = leagueName.toLowerCase();
    const lc = leagueCountry.toLowerCase();
    return (
      ln.includes("libertadores") ||
      ln.includes("sudamericana") ||
      ln.includes("sulamericana") ||
      ln.includes("champions league") ||
      ln.includes("europa league") ||
      ln.includes("conference league") ||
      ln.includes("recopa") ||
      lc.includes("south-america") ||
      lc.includes("américa do sul")
    );
  };

  const getStandardTitle = (leagueName: string): string => {
    const ln = leagueName.toLowerCase();
    if (ln.includes("libertadores")) return "CONMEBOL Libertadores";
    if (ln.includes("sudamericana") || ln.includes("sulamericana")) return "CONMEBOL Sudamericana";
    if (ln.includes("champions league")) return "UEFA Champions League";
    if (ln.includes("europa league")) return "UEFA Europa League";
    if (ln.includes("conference league")) return "UEFA Conference League";
    return leagueName;
  };

  const parseGroupName = (leagueName: string, roundName?: string): string => {
    const textToSearch = `${leagueName} ${roundName || ""}`.toLowerCase();
    
    // Check for Group / Grupo patterns
    const matchGroup = 
      textToSearch.match(/grupo\s*([a-h0-9]+)/i) || 
      textToSearch.match(/group\s*([a-h0-9]+)/i) || 
      textToSearch.match(/grp\.?\s*([a-h0-9]+)/i);
      
    if (matchGroup) {
      return `Grupo ${matchGroup[1].toUpperCase()}`;
    }
    
    // Check for Round / Rodada patterns
    const matchRound = 
      textToSearch.match(/rodada\s*([0-9]+)/i) || 
      textToSearch.match(/round\s*([0-9]+)/i);
      
    if (matchRound) {
      return `Rodada ${matchRound[1]}`;
    }

    if (textToSearch.includes("semifinal") || textToSearch.includes("semi-final")) {
      return "Semifinais";
    }
    if (textToSearch.includes("final") && !textToSearch.includes("semifinal") && !textToSearch.includes("oitavas") && !textToSearch.includes("quartas")) {
      return "Final";
    }
    if (textToSearch.includes("quarter") || textToSearch.includes("quartas") || textToSearch.includes("quarte-final")) {
      return "Quartas de Final";
    }
    if (textToSearch.includes("octave") || textToSearch.includes("oitavas") || textToSearch.includes("round of 16")) {
      return "Oitavas de Final";
    }

    if (roundName) {
      return roundName;
    }
    
    return "Fase Geral";
  };

  const getLocalizedCountryDetails = (countryName: string) => {
    const norm = countryName.trim().toLowerCase();
    
    const codeMap: Record<string, { pt: string; code: string }> = {
      "br": { pt: "Brasil", code: "br" },
      "bra": { pt: "Brasil", code: "br" },
      "ar": { pt: "Argentina", code: "ar" },
      "arg": { pt: "Argentina", code: "ar" },
      "cl": { pt: "Chile", code: "cl" },
      "co": { pt: "Colômbia", code: "co" },
      "col": { pt: "Colômbia", code: "co" },
      "ec": { pt: "Equador", code: "ec" },
      "ecu": { pt: "Equador", code: "ec" },
      "py": { pt: "Paraguai", code: "py" },
      "pry": { pt: "Paraguai", code: "py" },
      "uy": { pt: "Uruguai", code: "uy" },
      "ury": { pt: "Uruguai", code: "uy" },
      "pe": { pt: "Peru", code: "pe" },
      "ve": { pt: "Venezuela", code: "ve" },
      "bol": { pt: "Bolívia", code: "bo" },
      "mx": { pt: "México", code: "mx" },
      "mex": { pt: "México", code: "mx" },
      "us": { pt: "Estados Unidos", code: "us" },
      "usa": { pt: "Estados Unidos", code: "us" },
      "ca": { pt: "Canadá", code: "ca" },
      "es": { pt: "Espanha", code: "es" },
      "esp": { pt: "Espanha", code: "es" },
      "pt": { pt: "Portugal", code: "pt" },
      "por": { pt: "Portugal", code: "pt" },
      "it": { pt: "Itália", code: "it" },
      "ita": { pt: "Itália", code: "it" },
      "fr": { pt: "França", code: "fr" },
      "fra": { pt: "França", code: "fr" },
      "de": { pt: "Alemanha", code: "de" },
      "ger": { pt: "Alemanha", code: "de" },
      "gb": { pt: "Inglaterra", code: "gb-eng" },
      "uk": { pt: "Inglaterra", code: "gb-eng" },
      "eng": { pt: "Inglaterra", code: "gb-eng" },
      "nl": { pt: "Holanda", code: "nl" },
      "ned": { pt: "Holanda", code: "nl" },
      "be": { pt: "Bélgica", code: "be" },
      "bel": { pt: "Bélgica", code: "be" },
      "gr": { pt: "Grécia", code: "gr" },
      "grc": { pt: "Grécia", code: "gr" },
      "tr": { pt: "Turquia", code: "tr" },
      "tur": { pt: "Turquia", code: "tr" },
      "sa": { pt: "Arábia Saudita", code: "sa" },
      "ksa": { pt: "Arábia Saudita", code: "sa" },
      "jp": { pt: "Japão", code: "jp" },
      "jpn": { pt: "Japão", code: "jp" },
      "cn": { pt: "China", code: "cn" },
      "chn": { pt: "China", code: "cn" }
    };

    const nameToDetails: Record<string, { pt: string; code: string }> = {
      "brazil": { pt: "Brasil", code: "br" },
      "brasil": { pt: "Brasil", code: "br" },
      "argentina": { pt: "Argentina", code: "ar" },
      "colombia": { pt: "Colômbia", code: "co" },
      "colômbia": { pt: "Colômbia", code: "co" },
      "chile": { pt: "Chile", code: "cl" },
      "uruguay": { pt: "Uruguai", code: "uy" },
      "uruguai": { pt: "Uruguai", code: "uy" },
      "paraguay": { pt: "Paraguai", code: "py" },
      "paraguai": { pt: "Paraguai", code: "py" },
      "ecuador": { pt: "Equador", code: "ec" },
      "equador": { pt: "Equador", code: "ec" },
      "peru": { pt: "Peru", code: "pe" },
      "venezuela": { pt: "Venezuela", code: "ve" },
      "bolivia": { pt: "Bolívia", code: "bo" },
      "bolívia": { pt: "Bolívia", code: "bo" },
      "mexico": { pt: "México", code: "mx" },
      "méxico": { pt: "México", code: "mx" },
      "usa": { pt: "Estados Unidos", code: "us" },
      "united states": { pt: "Estados Unidos", code: "us" },
      "estados unidos": { pt: "Estados Unidos", code: "us" },
      "canada": { pt: "Canadá", code: "ca" },
      "canadá": { pt: "Canadá", code: "ca" },
      "england": { pt: "Inglaterra", code: "gb-eng" },
      "inglaterra": { pt: "Inglaterra", code: "gb-eng" },
      "spain": { pt: "Espanha", code: "es" },
      "espanha": { pt: "Espanha", code: "es" },
      "portugal": { pt: "Portugal", code: "pt" },
      "italy": { pt: "Itália", code: "it" },
      "itália": { pt: "Itália", code: "it" },
      "france": { pt: "França", code: "fr" },
      "frança": { pt: "França", code: "fr" },
      "germany": { pt: "Alemanha", code: "de" },
      "alemanha": { pt: "Alemanha", code: "de" },
      "netherlands": { pt: "Holanda", code: "nl" },
      "holanda": { pt: "Holanda", code: "nl" },
      "belgium": { pt: "Bélgica", code: "be" },
      "bélgica": { pt: "Bélgica", code: "be" },
      "greece": { pt: "Grécia", code: "gr" },
      "grécia": { pt: "Grécia", code: "gr" },
      "turkey": { pt: "Turquia", code: "tr" },
      "turquia": { pt: "Turquia", code: "tr" },
      "saudi arabia": { pt: "Arábia Saudita", code: "sa" },
      "arábia saudita": { pt: "Arábia Saudita", code: "sa" },
      "japan": { pt: "Japão", code: "jp" },
      "japão": { pt: "Japão", code: "jp" },
      "china": { pt: "China", code: "cn" },
      "russia": { pt: "Rússia", code: "ru" },
      "rússia": { pt: "Rússia", code: "ru" },
      "ukraine": { pt: "Ucrânia", code: "ua" },
      "ucrânia": { pt: "Ucrânia", code: "ua" },
      "croatia": { pt: "Croácia", code: "hr" },
      "croácia": { pt: "Croácia", code: "hr" },
      "sweden": { pt: "Suécia", code: "se" },
      "suécia": { pt: "Suécia", code: "se" },
      "norway": { pt: "Noruega", code: "no" },
      "noruega": { pt: "Noruega", code: "no" },
      "denmark": { pt: "Dinamarca", code: "dk" },
      "dinamarca": { pt: "Dinamarca", code: "dk" },
      "switzerland": { pt: "Suíça", code: "ch" },
      "suíça": { pt: "Suíça", code: "ch" },
      "scotland": { pt: "Escócia", code: "gb-sct" },
      "escócia": { pt: "Escócia", code: "gb-sct" },
      "wales": { pt: "País de Gales", code: "gb-wls" },
      "país de gales": { pt: "País de Gales", code: "gb-wls" },
      "ireland": { pt: "Irlanda", code: "ie" },
      "irlanda": { pt: "Irlanda", code: "ie" },
      "poland": { pt: "Polônia", code: "pl" },
      "polônia": { pt: "Polônia", code: "pl" },
      "austria": { pt: "Áustria", code: "at" },
      "áustria": { pt: "Áustria", code: "at" },
      "morocco": { pt: "Marrocos", code: "ma" },
      "marrocos": { pt: "Marrocos", code: "ma" },
      "egypt": { pt: "Egito", code: "eg" },
      "egito": { pt: "Egito", code: "eg" },
      "south africa": { pt: "África do Sul", code: "za" },
      "áfrica do sul": { pt: "África do Sul", code: "za" },
      "australia": { pt: "Austrália", code: "au" },
      "austrália": { pt: "Austrália", code: "au" },
      "korea": { pt: "Coreia do Sul", code: "kr" },
      "south korea": { pt: "Coreia do Sul", code: "kr" },
      "coreia": { pt: "Coreia do Sul", code: "kr" },
      "qatar": { pt: "Catar", code: "qa" },
      "catar": { pt: "Catar", code: "qa" },
      "world": { pt: "Mundo", code: "un" },
      "mundo": { pt: "Mundo", code: "un" },
      "international": { pt: "Mundo", code: "un" },
      "internacional": { pt: "Mundo", code: "un" },
      "senegal": { pt: "Senegal", code: "sn" },
      "algeria": { pt: "Argélia", code: "dz" },
      "argélia": { pt: "Argélia", code: "dz" },
      "tunisia": { pt: "Tunísia", code: "tn" },
      "tunísia": { pt: "Tunísia", code: "tn" },
      "cameroon": { pt: "Camarões", code: "cm" },
      "camarões": { pt: "Camarões", code: "cm" },
      "ghana": { pt: "Gana", code: "gh" },
      "nigeria": { pt: "Nigéria", code: "ng" },
      "nigéria": { pt: "Nigéria", code: "ng" },
      "costa rica": { pt: "Costa Rica", code: "cr" },
      "cote d'ivoire": { pt: "Costa do Marfim", code: "ci" },
      "ivory coast": { pt: "Costa do Marfim", code: "ci" },
      "costa do marfim": { pt: "Costa do Marfim", code: "ci" },
      "nz": { pt: "Nova Zelândia", code: "nz" },
      "new zealand": { pt: "Nova Zelândia", code: "nz" },
      "nova zelândia": { pt: "Nova Zelândia", code: "nz" }
    };

    if (codeMap[norm]) {
      const match = codeMap[norm];
      return {
        pt: match.pt,
        flag: `https://flagcdn.com/w40/${match.code}.png`
      };
    }

    if (nameToDetails[norm]) {
      const match = nameToDetails[norm];
      return {
        pt: match.pt,
        flag: `https://flagcdn.com/w40/${match.code}.png`
      };
    }

    const capitalized = countryName.charAt(0).toUpperCase() + countryName.slice(1);
    
    // Fallback: If countryName is a 2-letter ISO code, use it directly!
    if (countryName.length === 2) {
      return {
        pt: countryName.toUpperCase(),
        flag: `https://flagcdn.com/w40/${countryName.toLowerCase()}.png`
      };
    }
    
    return {
      pt: capitalized,
      flag: "https://flagcdn.com/w40/un.png"
    };
  };

  // Generic Drawer data interface
  interface GroupedDrawer {
    key: string;
    type: "major_league" | "country";
    title: string;
    logo: string;
    leagues: Record<string, { league: any; matches: Match[] }>;
  }

  const drawersMap: Record<string, GroupedDrawer> = {};

  filteredMatches.forEach((match) => {
    const isMajor = isMajorLeague(match.league.name, match.league.country || "");
    
    if (isMajor) {
      const standardTitle = getStandardTitle(match.league.name);
      const drawerKey = `major-${standardTitle}`;
      
      if (!drawersMap[drawerKey]) {
        drawersMap[drawerKey] = {
          key: drawerKey,
          type: "major_league",
          title: standardTitle,
          logo: match.league.logo || "https://media.api-sports.io/flags/world.svg",
          leagues: {}
        };
      }
      
      const leagueKey = `${match.league.name}-${match.league.id}`;
      if (!drawersMap[drawerKey].leagues[leagueKey]) {
        drawersMap[drawerKey].leagues[leagueKey] = {
          league: match.league,
          matches: []
        };
      }
      drawersMap[drawerKey].leagues[leagueKey].matches.push(match);
    } else {
      const countryDetails = getLocalizedCountryDetails(match.league.country || "Mundo");
      const drawerKey = `country-${countryDetails.pt}`;
      
      if (!drawersMap[drawerKey]) {
        drawersMap[drawerKey] = {
          key: drawerKey,
          type: "country",
          title: countryDetails.pt,
          logo: countryDetails.flag,
          leagues: {}
        };
      }
      
      const leagueKey = `${match.league.name}-${match.league.id}`;
      if (!drawersMap[drawerKey].leagues[leagueKey]) {
        drawersMap[drawerKey].leagues[leagueKey] = {
          league: match.league,
          matches: []
        };
      }
      drawersMap[drawerKey].leagues[leagueKey].matches.push(match);
    }
  });

  // Sort Drawers: Majors priority (always open), follow by sorted countries
  const sortedDrawers = Object.values(drawersMap).sort((a, b) => {
    if (a.type === "major_league" && b.type !== "major_league") return -1;
    if (a.type !== "major_league" && b.type === "major_league") return 1;
    
    // Sort Brasil/Brazil first under country list as requested / standard priority
    const isABrasil = a.title === "Brasil";
    const isBBrasil = b.title === "Brasil";
    if (isABrasil && !isBBrasil) return -1;
    if (!isABrasil && isBBrasil) return 1;
    
    return a.title.localeCompare(b.title);
  });

  const toggleCountryDrawer = (drawerKey: string) => {
    setExpandedCountries(prev => ({
      ...prev,
      [drawerKey]: !prev[drawerKey]
    }));
  };

  const getCalendarDays = (centerDateStr: string) => {
    const list = [];
    const centerDate = new Date(centerDateStr + "T12:00:00");
    for (let i = -2; i <= 2; i++) {
      const d = new Date(centerDate);
      d.setDate(d.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const dateStr = `${yyyy}-${mm}-${dd}`;
      
      const weekdayName = d.toLocaleDateString(localeStr, { weekday: "short" }).toUpperCase().replace(".", "");
      
      list.push({
        dateStr,
        dayNum: d.getDate(),
        dayName: weekdayName
      });
    }
    return list;
  };

  // Sync general HTML tag element dark class for daisy chaining tailwind styles
  useEffect(() => {
    if (config.theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [config.theme]);

  return (
    <div className={`min-h-screen transition-colors duration-200 flex flex-col font-sans relative overflow-x-hidden antialiased ${
      config.theme === "dark" 
        ? "bg-slate-950 text-slate-100" 
        : "bg-[#f4f7f6] text-slate-800"
    }`}>
      {/* BRAND & SEARCH HEADER */}
      <Header 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        onOpenSettings={() => setIsSettingsOpen(true)}
        viewMode={viewMode}
        setViewMode={setViewMode}
        language={language}
        user={user}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={() => {
          localStorage.removeItem("ws_logged_user");
          setUser(null);
        }}
        matches={matches}
      />

      {/* REAL-TIME CELEBRATORY GOAL TOAST ALERTS */}
      {goalToast && config.alertsEnabled && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 pointer-events-none animate-bounce">
          <div className="bg-[#009c3b] border-4 border-[#ffdf00] shadow-2xl rounded-2xl p-4 flex items-center gap-4 text-white relative overflow-hidden">
            <div className="absolute -right-2 -bottom-2 opacity-15 text-8xl shrink-0 font-display font-black select-none">
              GOAL
            </div>
            
            <div className="p-3 bg-white/10 rounded-full shrink-0 animate-spin">
              <span className="text-2xl">⚽</span>
            </div>

            <div className="flex-1 pointer-events-auto">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#ffdf00] bg-black/20 px-2 py-0.5 rounded-sm">
                {t.goalAnnouncement} • {goalToast.minute}'
              </span>
              <h4 className="font-extrabold text-lg leading-snug mt-1">
                {goalToast.teamName} !!
              </h4>
              <p className="text-xs text-emerald-100 font-medium">
                {isPt ? "Autor" : language === "en" ? "Scorer" : language === "es" ? "Autor" : language === "fr" ? "Buteur" : language === "it" ? "Autore" : "Torschütze"}: <span className="text-white font-bold">{goalToast.scorer}</span>
                <span className="mx-2">•</span>
                <span>{isPt ? "Placar" : language === "en" ? "Score" : language === "es" ? "Marcador" : language === "fr" ? "Score" : language === "it" ? "Risultato" : "Spielstand"}: <b className="font-mono text-[#ffdf00]">{goalToast.homeScore} - {goalToast.awayScore}</b></span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUB-HEADER CONTROL BAR */}
      <div className={`border-b shadow-xs transition-colors py-2 px-4 md:px-6 z-20 ${
        config.theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-800"
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 select-none">
          
          {/* HORIZONTALLY SCROLLS SPORTS DIRECTLY WITHOUT LABELS */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 flex-1 pr-4">
            {[
              { code: "futebol", name: "Futebol", icon: (
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="m12 12-4-3m4 3 4-3m-4 3v5m-4-8 1.5-2.5m6.5 2.5-1.5-2.5m-5 7.5L5 13m10 2 2-2" />
                </svg>
              )},
              { code: "basquete", name: "Basquete", icon: (
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M6.2 6.2c2.4 2.4 2.4 6.4 0 8.8M17.8 6.2c-2.4 2.4-2.4 6.4 0 8.8" />
                </svg>
              )},
              { code: "vôlei", name: "Vôlei", icon: (
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="m12 2 3 10-3 10M2 12h20" />
                </svg>
              )},
              { code: "tênis", name: "Tênis", icon: (
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10" />
                  <path d="M12 2a15.3 15.3 0 0 0-4 10 15.3 15.3 0 0 0 4 10" />
                </svg>
              )},
              { code: "beisebol", name: "Beisebol", icon: (
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2c0 5.5-4.5 10-10 10" />
                  <path d="M22 12c-5.5 0-10 4.5-10 10" />
                </svg>
              )},
              { code: "futebol americano", name: "Fut. Americano", icon: (
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M12 3a18.3 18.3 0 0 0-9 9 18.3 18.3 0 0 0 9 9 18.3 18.3 0 0 0 9-9 18.3 18.3 0 0 0-9-9Z" />
                  <path d="M7.5 16.5 16.5 7.5m-6 6 3-3" />
                </svg>
              )},
              { code: "handebol", name: "Handebol", icon: (
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 12c2.5 0 4-1.5 4-4s-1.5-4-4-4M16 12c-2.5 0-4 1.5-4 4s1.5 4 4 4" />
                </svg>
              )}
            ].map((sp) => {
              const isSpSelected = selectedSport === sp.code;
              return (
                <button
                  key={sp.code}
                  type="button"
                  onClick={() => {
                    setSelectedSport(sp.code);
                    if (isLargeScreen) {
                      const newMatches = sp.code === "futebol" ? matches : getMockSportMatches(sp.code, selectedDate);
                      if (newMatches.length > 0) {
                        setSelectedMatch(newMatches[0]);
                      } else {
                        setSelectedMatch(null);
                      }
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-center transition-all cursor-pointer shrink-0 ${
                    isSpSelected
                      ? "bg-slate-900 border-[#009c3b] font-black text-white dark:bg-emerald-950 dark:border-emerald-400"
                      : "bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
                  }`}
                >
                  <span className="text-[#009c3b] dark:text-emerald-400">{sp.icon}</span>
                  <span className="text-[10px] font-black tracking-tight uppercase whitespace-nowrap">{sp.name}</span>
                </button>
              );
            })}
          </div>

          {/* FIXED RIGHT: FAVORITES STAR TRIGGER (STAR-ONLY VIEW) */}
          <button
            type="button"
            onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
            className={`p-2 px-2.5 rounded-xl border cursor-pointer select-none transition-all flex items-center justify-center shrink-0 h-[38px] ${
              showOnlyFavorites
                ? "bg-amber-500/10 text-amber-500 border-amber-500/40"
                : "bg-slate-50 dark:bg-slate-950 text-slate-400 border-slate-200/50 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900"
            }`}
            title={language === "pt_br" || language === "pt_pt" ? "Ver Favoritos" : "View Favorites"}
          >
            <Star 
              className={`w-4 h-4 ${
                showOnlyFavorites ? "fill-amber-400 text-amber-500 stroke-[2]" : "text-slate-400"
              }`} 
            />
          </button>
        </div>
      </div>

      {/* MAIN CONTENT VIEWER */}
      <Routes>
        <Route path="/team/:teamId" element={
          <div className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-6">
            <TeamPage 
              matches={matches} 
              favorites={favorites} 
              onToggleFavoriteTeam={toggleFavoriteTeam} 
              language={language}
            />
          </div>
        } />
        <Route path="/league/:leagueId" element={
          <div className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-6">
            <LeaguePage 
              matches={matches} 
              favorites={favorites} 
              onToggleFavoriteLeague={toggleFavoriteLeague} 
              language={language}
            />
          </div>
        } />
        <Route path="/player/:playerName" element={
          <div className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-6">
            <PlayerPage 
              favorites={favorites} 
              onToggleFavoritePlayer={toggleFavoritePlayer} 
              language={language}
            />
          </div>
        } />
        <Route path="/*" element={
          viewMode === "feed" ? (
            <main className="flex-1 max-w-4xl mx-auto w-full p-4 lg:p-6">
              <SportsFeed theme={config.theme} language={language} currentUser={user} />
            </main>
          ) : (
            /* MAIN SCREEN WORKSPACE CONTAINER */
            <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-6 flex flex-col lg:flex-row gap-6 overflow-hidden">
          
          {/* LEFT COLUMN: COLLAPSIBLE DRAWERS BY COUNTRY */}
          <div className="w-full lg:w-[420px] xl:w-[450px] flex flex-col gap-4 overflow-y-auto pr-0 lg:pr-1 min-h-[350px]">
            
            {/* EMBEDDED CONTROL CENTER: COMPACT CALENDAR AND AO VIVO */}
            <div className={`p-3 rounded-2xl border flex items-center justify-between gap-3 select-none shrink-0 ${
              config.theme === "dark" 
                ? "bg-slate-900 border-slate-800 text-slate-100 shadow-md" 
                : "bg-white border-slate-200/70 text-slate-800 shadow-2xs"
            }`}>
              
              {/* COMPACT CALENDAR MODULE */}
              <div className={`flex items-center gap-1.5 p-1 rounded-xl border transition-all flex-1 ${
                config.theme === "dark" 
                  ? "bg-slate-950 border-slate-850" 
                  : "bg-slate-50 border-slate-202"
              }`}>
                {/* Prev day stepper */}
                <button 
                  type="button"
                  onClick={() => handleStepDay(-1)}
                  className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer"
                  title={t.dayPrev}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Day display and label formatting according to timezone/browser setting */}
                <div className="px-1 flex items-center justify-center flex-1 text-center min-h-[30px] flex-wrap gap-1.5">
                  <span className="text-[11px] font-black tracking-tight uppercase font-mono text-[#009c3b] dark:text-emerald-400">
                    {getCalendarLabel(selectedDate)}
                  </span>
                  
                  {/* Small link/indicator to reset back to today if not on today */}
                  {selectedDate !== realTodayDate && (
                    <button
                      type="button"
                      onClick={() => setSelectedDate(realTodayDate)}
                      className="text-[8.5px] bg-[#009c3b]/10 text-[#009c3b] dark:text-emerald-400 border border-[#009c3b]/20 px-1 py-0.5 rounded-sm font-black uppercase tracking-wider leading-none hover:bg-[#009c3b] hover:text-white transition-all cursor-pointer shrink-0"
                      title={language.startsWith("pt") ? "Voltar para Hoje" : "Back to Today"}
                    >
                      {language.startsWith("pt") ? "Hoje" : "Today"}
                    </button>
                  )}
                </div>

                {/* Next day stepper */}
                <button 
                  type="button"
                  onClick={() => handleStepDay(1)}
                  className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer"
                  title={t.dayNext}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-0.5" />

                {/* Datepicker icon button */}
                <div className="relative shrink-0 flex items-center justify-center">
                  <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => {
                      if (e.target.value) setSelectedDate(e.target.value);
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <button 
                    type="button"
                    className="p-1 hover:bg-slate-250 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title={t.advancedDate}
                  >
                    <Calendar className="w-4 h-4 text-[#009c3b]" />
                  </button>
                </div>
              </div>

              {/* AO VIVO (LIVE TOGGLE PILL) */}
              <label className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border cursor-pointer select-none transition-all text-xs h-[38px] ${
                liveOnly 
                  ? "bg-red-500/10 text-red-650 dark:text-red-400 border-red-500/25 font-bold animate-fade-in" 
                  : "bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-slate-200/50 dark:border-slate-800 hover:bg-slate-100"
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${liveOnly ? "bg-red-600 animate-pulse" : "bg-slate-400 dark:bg-slate-650"}`} />
                <span className="text-[10px] uppercase font-black tracking-wider">{t.liveCheckbox}</span>
                <input 
                  type="checkbox" 
                  checked={liveOnly}
                  onChange={(e) => setLiveOnly(e.target.checked)}
                  className="sr-only"
                />
              </label>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 p-6 shadow-2xs select-none">
                <RefreshCw className="w-8 h-8 text-[#009c3b] animate-spin mb-3" />
                <p className="text-sm font-semibold text-slate-500">{t.loadingMatches}</p>
              </div>
            ) : error ? (
              <div className="bg-red-50/70 dark:bg-red-950/20 border border-red-200/70 dark:border-red-900 text-red-700 dark:text-red-400 p-5 rounded-xl text-center select-none">
                <p className="font-bold text-sm">⚠️ {isPt ? "Erro de Conexão" : "Connection Issue"}</p>
                <p className="text-xs mt-1 text-red-600/90">{error}</p>
                <button 
                  onClick={() => fetchMatches(selectedDate)}
                  className="mt-3.5 px-3 py-1 bg-red-650 text-white rounded text-xs font-bold hover:bg-red-700 font-mono cursor-pointer"
                >
                  {isPt ? "Tentar Novamente" : language === "en" ? "Retry" : language === "es" ? "Reintentar" : language === "fr" ? "Réessayer" : language === "it" ? "Riprova" : "Erneut versuchen"}
                </button>
              </div>
            ) : filteredMatches.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 p-8 text-center shadow-2xs select-none">
                <span className="text-4xl mb-3">📡</span>
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                  {isPt ? "Sem partidas registradas"
                   : language === "en" ? "No matches registered"
                   : language === "es" ? "No hay partidos registrados"
                   : language === "fr" ? "Aucun match enregistré"
                   : language === "it" ? "Nessuna partita registrata"
                   : "Keine Spiele registriert"}
                </p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  {t.noMatches}
                </p>
              </div>
            ) : (
              sortedDrawers.map((drawer) => {
                const isMajor = drawer.type === "major_league";
                const isOpen = expandedCountries[drawer.key] !== undefined 
                  ? expandedCountries[drawer.key] 
                  : (isMajor ? true : false);
                
                // Count active/live matches in this drawer for nice badge display
                const liveCount = Object.values(drawer.leagues).reduce((sum, current) => {
                  return sum + current.matches.filter(m => ["1H", "2H", "HT", "ET", "BT", "INT"].includes(m.fixture.status.short)).length;
                }, 0);

                const totalGamesCountStr = isPt ? "jogos" : language === "en" ? "matches" : language === "es" ? "partidos" : language === "fr" ? "matchs" : language === "it" ? "partite" : "Spiele";
                const firstLeagueEntry = Object.values(drawer.leagues)[0];
                const drawerLeagueId = firstLeagueEntry?.league?.id;

                return (
                  <div 
                    key={drawer.key} 
                    className={`flex flex-col gap-2 rounded-2xl border transition-all ${
                      isOpen 
                        ? "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 p-4 shadow-2xs" 
                        : "bg-white/80 dark:bg-slate-900/60 border-slate-200/40 dark:border-slate-850 p-3 h-auto"
                    }`}
                  >
                    {/* Collapsible Gaveta Header */}
                    <button 
                      onClick={() => toggleCountryDrawer(drawer.key)}
                      className="flex items-center justify-between w-full text-left select-none group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <SafeImage 
                           src={drawer.logo} 
                           alt={drawer.title} 
                           className="w-5 h-5 object-contain rounded-md bg-slate-50 dark:bg-slate-800 p-0.5 shrink-0 shadow-2xs"
                           fallbackType={drawer.type === "country" ? "flag" : "league"}
                        />
                        <h2 className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest leading-none flex items-center gap-1.5">
                          {drawer.title}
                          
                          {/* Favorite Star directly at Major Drawer Header Level */}
                          {isMajor && drawerLeagueId && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavoriteLeague(drawerLeagueId);
                              }}
                              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full cursor-pointer transition-all"
                              title="Favoritar Liga"
                            >
                              <Star 
                                className={`w-3.5 h-3.5 ${
                                  favorites.leagues.includes(drawerLeagueId) 
                                    ? "fill-amber-400 text-amber-500 stroke-[2.2]" 
                                    : "text-slate-300 hover:text-amber-400"
                                }`} 
                              />
                            </button>
                          )}

                          {liveCount > 0 && (
                            <span className="text-[9px] font-black bg-red-650 text-white px-1.5 py-0.5 rounded-full animate-pulse font-mono ml-1">
                              {liveCount} LIVE
                            </span>
                          )}
                        </h2>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 shrink-0">
                        <span className="text-[10px] font-mono opacity-65 group-hover:opacity-100">
                          {Object.values(drawer.leagues).reduce((sum, l) => sum + l.matches.length, 0)} {totalGamesCountStr}
                        </span>
                        {isOpen ? (
                          <ChevronUp className="w-4.5 h-4.5 text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-350 transition-colors" />
                        ) : (
                          <ChevronDown className="w-4.5 h-4.5 text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-350 transition-colors" />
                        )}
                      </div>
                    </button>

                    {/* Collapsible Content */}
                    {isOpen && (
                      <div className="flex flex-col gap-3.5 pt-3 mt-2 border-t border-slate-100 dark:border-slate-850/60 transition-all duration-300">
                        {isMajor ? (
                          // For major leagues: group all of its games together by dynamic groups/rounds
                          (() => {
                            const allDrawerMatches: Match[] = [];
                            Object.values(drawer.leagues).forEach((lEntry) => {
                              allDrawerMatches.push(...lEntry.matches);
                            });

                            const liveMatches = allDrawerMatches.filter((match) => {
                              return ["1H", "2H", "HT", "ET", "BT", "P", "SUSP", "INT"].includes(
                                match.fixture.status.short
                              );
                            });

                            const finishedMatches = allDrawerMatches.filter((match) => {
                              return ["FT", "AET", "PEN"].includes(match.fixture.status.short);
                            });

                            const upcomingMatches = allDrawerMatches.filter((match) => {
                              return !["1H", "2H", "HT", "ET", "BT", "P", "SUSP", "INT", "FT", "AET", "PEN"].includes(
                                match.fixture.status.short
                              );
                            });

                            const groupMatches = (matches: Match[]) => {
                              const map: Record<string, Match[]> = {};
                              matches.forEach((match) => {
                                const groupName = parseGroupName(match.league.name, match.league.round) || "Geral";
                                if (!map[groupName]) {
                                  map[groupName] = [];
                                }
                                map[groupName].push(match);
                              });
                              return map;
                            };

                            const liveGroups = groupMatches(liveMatches);
                            const finishedGroups = groupMatches(finishedMatches);
                            const upcomingGroups = groupMatches(upcomingMatches);

                            const sortedLiveKeys = Object.keys(liveGroups).sort();
                            const sortedFinishedKeys = Object.keys(finishedGroups).sort();
                            const sortedUpcomingKeys = Object.keys(upcomingGroups).sort();

                            const isGroupType = (name: string): boolean => {
                              const lower = name.toLowerCase();
                              return lower.startsWith("grupo") || lower.startsWith("group") || lower.includes("grp.");
                            };

                            return (
                              <div className="flex flex-col gap-5">
                                {/* LIVE SECTION */}
                                {liveMatches.length > 0 && (
                                  <div className="flex flex-col gap-2.5">
                                    <div className="flex items-center gap-1.5 px-1 py-0.5 border-b border-rose-100 dark:border-rose-950/20 pb-1.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-red-650 animate-pulse shrink-0" />
                                      <span className="text-[10px] font-black text-red-650 dark:text-red-400 uppercase tracking-widest leading-none">
                                        {isPt ? "Em andamento" : language === "en" ? "In progress" : language === "es" ? "En progreso" : language === "fr" ? "En cours" : language === "it" ? "In corso" : "Em andamento"}
                                      </span>
                                    </div>
                                    {sortedLiveKeys.map((groupName) => {
                                      const showGroupHeader = isGroupType(groupName);
                                      return (
                                        <div key={`live-${groupName}`} className="flex flex-col gap-1.5">
                                          {showGroupHeader && (
                                            <span className="text-xs font-black text-[#009c3b] dark:text-emerald-400 uppercase tracking-wide pl-1 mb-1 mt-1.5 flex items-center gap-1.5 font-sans select-none">
                                              <span className="w-1.5 h-1.5 rounded-xs bg-[#009c3b] dark:bg-emerald-400" />
                                              {groupName}
                                            </span>
                                          )}
                                          <div className="flex flex-col gap-2">
                                            {liveGroups[groupName].map((match) => {
                                              const isLive = ["1H", "2H", "HT", "ET", "BT", "P", "SUSP", "INT"].includes(
                                                match.fixture.status.short
                                              );
                                              const isSelected = selectedMatch?.fixture.id === match.fixture.id;
                                              return (
                                                <div
                                                  key={match.fixture.id}
                                                  onClick={() => setSelectedMatch(match)}
                                                  className={`rounded-xl shadow-2xs p-3.5 flex items-center justify-between cursor-pointer border transition-all ${
                                                    isSelected 
                                                      ? "ring-2 ring-emerald-500/40 border-emerald-500 bg-emerald-50/10 dark:bg-emerald-950/25" 
                                                      : "bg-white dark:bg-slate-900 border-l-4 border-l-[#ffdf00] border-y border-r border-slate-150/80 dark:border-slate-800/80 hover:border-slate-300"
                                                  }`}
                                                >
                                                  <div className="mr-3 shrink-0 select-none bg-slate-100/50 dark:bg-slate-800 p-1 rounded-lg flex items-center justify-center">
                                                    <SafeImage 
                                                      src={match.league.logo} 
                                                      alt={match.league.name} 
                                                      className="w-5 h-5 object-contain"
                                                      fallbackType="league"
                                                    />
                                                  </div>

                                                  <div className="flex-1 overflow-hidden pr-3 font-sans">
                                                    <div className="flex flex-col gap-1.5 py-0.5">
                                                      {/* Home Team Row */}
                                                      <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-1.5 min-w-0">
                                                          <SafeImage 
                                                            src={match.teams.home.logo} 
                                                            alt={match.teams.home.name} 
                                                            className="w-4.5 h-4.5 object-contain bg-slate-100/40 dark:bg-slate-800/60 rounded-md p-0.5 shrink-0"
                                                            fallbackType="team"
                                                          />
                                                          <span className="font-bold text-slate-800 dark:text-slate-105 text-xs truncate">
                                                            {match.teams.home.name}
                                                          </span>
                                                        </div>
                                                        <span className="font-mono text-xs font-black text-slate-705 dark:text-slate-250 pr-1">
                                                          {match.goals.home !== null ? match.goals.home : "-"}
                                                        </span>
                                                      </div>

                                                      {/* Away Team Row */}
                                                      <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-1.5 min-w-0">
                                                          <SafeImage 
                                                            src={match.teams.away.logo} 
                                                            alt={match.teams.away.name} 
                                                            className="w-4.5 h-4.5 object-contain bg-slate-100/40 dark:bg-slate-800/60 rounded-md p-0.5 shrink-0"
                                                            fallbackType="team"
                                                          />
                                                          <span className="font-bold text-slate-800 dark:text-slate-105 text-xs truncate">
                                                            {match.teams.away.name}
                                                          </span>
                                                        </div>
                                                        <span className="font-mono text-xs font-black text-slate-705 dark:text-slate-250 pr-1">
                                                          {match.goals.away !== null ? match.goals.away : "-"}
                                                        </span>
                                                      </div>
                                                    </div>
                                                  </div>
                                                  <div className="ml-2 pl-3 border-l border-slate-100/60 dark:border-slate-800/60 flex flex-col items-center justify-center shrink-0 min-w-[#48px] select-none">
                                                    <span className="text-red-650 dark:text-red-400 text-xs font-black tracking-tighter flex items-center gap-0.5 font-mono">
                                                      {match.fixture.status.short === "HT" ? (isPt ? "INT" : language === "en" ? "HT" : language === "es" ? "DESC" : language === "fr" ? "MT" : language === "it" ? "INT" : "HZ") : `${match.fixture.status.elapsed}'`}
                                                    </span>
                                                    <span className="text-[8px] font-black text-[#009c3b] dark:text-emerald-400 uppercase tracking-wider mt-0.5">
                                                      {isPt ? "VIVO" : language === "en" ? "LIVE" : language === "es" ? "VIVO" : language === "fr" ? "DIRECT" : language === "it" ? "LIVE" : "LIVE"}
                                                    </span>
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}

                                {/* FINISHED SECTION */}
                                {finishedMatches.length > 0 && (
                                  <div className="flex flex-col gap-2.5">
                                    <div className="flex items-center gap-1.5 px-1 py-0.5 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                                      <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none font-sans">
                                        {isPt ? "Finalizados" : language === "en" ? "Finished" : language === "es" ? "Finalizados" : language === "fr" ? "Terminés" : language === "it" ? "Finalizzati" : "Finalizados"}
                                      </span>
                                    </div>
                                    {sortedFinishedKeys.map((groupName) => {
                                      const showGroupHeader = isGroupType(groupName);
                                      return (
                                        <div key={`finished-${groupName}`} className="flex flex-col gap-1.5">
                                          {showGroupHeader && (
                                            <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wide pl-1 mb-1 mt-1.5 flex items-center gap-1.5 font-sans select-none">
                                              <span className="w-1.5 h-1.5 rounded-xs bg-slate-400 dark:bg-slate-500" />
                                              {groupName}
                                            </span>
                                          )}
                                          <div className="flex flex-col gap-2">
                                            {finishedGroups[groupName].map((match) => {
                                              const isFinished = match.fixture.status.short === "FT";
                                              const isSelected = selectedMatch?.fixture.id === match.fixture.id;
                                              return (
                                                <div
                                                  key={match.fixture.id}
                                                  onClick={() => setSelectedMatch(match)}
                                                  className={`rounded-xl shadow-2xs p-3.5 flex items-center justify-between cursor-pointer border transition-all ${
                                                    isSelected 
                                                      ? "ring-2 ring-emerald-500/40 border-emerald-500 bg-emerald-50/10 dark:bg-emerald-950/25" 
                                                      : "bg-slate-50/30 dark:bg-slate-950/40 border-slate-200/50 dark:border-slate-850/80 hover:border-slate-300 hover:bg-white dark:hover:bg-slate-900"
                                                  }`}
                                                >
                                                  <div className="mr-3 shrink-0 select-none bg-slate-100/50 dark:bg-slate-800 p-1 rounded-lg flex items-center justify-center">
                                                    <SafeImage 
                                                      src={match.league.logo} 
                                                      alt={match.league.name} 
                                                      className="w-5 h-5 object-contain"
                                                      fallbackType="league"
                                                    />
                                                  </div>

                                                  <div className="flex-1 overflow-hidden pr-3 font-sans">
                                                    <div className="flex flex-col gap-1.5 py-0.5">
                                                      {/* Home Team Row */}
                                                      <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-1.5 min-w-0">
                                                          <SafeImage 
                                                            src={match.teams.home.logo} 
                                                            alt={match.teams.home.name} 
                                                            className="w-4.5 h-4.5 object-contain bg-slate-100/40 dark:bg-slate-800/60 rounded-md p-0.5 shrink-0"
                                                            fallbackType="team"
                                                          />
                                                          <span className={`text-xs truncate ${
                                                            isFinished && match.teams.home.winner === false ? "text-slate-400 dark:text-slate-505 font-medium" : "font-bold text-slate-800 dark:text-slate-105"
                                                          }`}>
                                                            {match.teams.home.name}
                                                          </span>
                                                        </div>
                                                        <span className={`font-mono text-xs font-black pr-1 ${
                                                          isFinished && match.teams.home.winner === false ? "text-slate-400 dark:text-slate-505" : "text-slate-705 dark:text-slate-250"
                                                        }`}>
                                                          {match.goals.home !== null ? match.goals.home : "-"}
                                                        </span>
                                                      </div>

                                                      {/* Away Team Row */}
                                                      <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-1.5 min-w-0">
                                                          <SafeImage 
                                                            src={match.teams.away.logo} 
                                                            alt={match.teams.away.name} 
                                                            className="w-4.5 h-4.5 object-contain bg-slate-100/40 dark:bg-slate-800/60 rounded-md p-0.5 shrink-0"
                                                            fallbackType="team"
                                                          />
                                                          <span className={`text-xs truncate ${
                                                            isFinished && match.teams.away.winner === false ? "text-slate-400 dark:text-slate-505 font-medium" : "font-bold text-slate-800 dark:text-slate-105"
                                                          }`}>
                                                            {match.teams.away.name}
                                                          </span>
                                                        </div>
                                                        <span className={`font-mono text-xs font-black pr-1 ${
                                                          isFinished && match.teams.away.winner === false ? "text-slate-400 dark:text-slate-505" : "text-slate-705 dark:text-slate-250"
                                                        }`}>
                                                          {match.goals.away !== null ? match.goals.away : "-"}
                                                        </span>
                                                      </div>
                                                    </div>
                                                  </div>
                                                  <div className="ml-2 pl-3 border-l border-slate-100/60 dark:border-slate-800/60 flex flex-col items-center justify-center shrink-0 min-w-[#48px] select-none">
                                                    <span className="text-slate-404 dark:text-slate-500 text-[10px] font-bold uppercase font-mono">
                                                      FT
                                                    </span>
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}

                                {/* UPCOMING SECTION */}
                                {upcomingMatches.length > 0 && (
                                  <div className="flex flex-col gap-2.5">
                                    <div className="flex items-center gap-1.5 px-1 py-0.5 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                                      <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none font-sans">
                                        {isPt ? "Agendados" : language === "en" ? "Scheduled" : language === "es" ? "Programados" : language === "fr" ? "Programmés" : language === "it" ? "Programmati" : "Agendados"}
                                      </span>
                                    </div>
                                    {sortedUpcomingKeys.map((groupName) => {
                                      const showGroupHeader = isGroupType(groupName);
                                      return (
                                        <div key={`upcoming-${groupName}`} className="flex flex-col gap-1.5">
                                          {showGroupHeader && (
                                            <span className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wide pl-1 mb-1 mt-1.5 flex items-center gap-1.5 font-sans select-none">
                                              <span className="w-1.5 h-1.5 rounded-xs bg-slate-400 dark:bg-slate-500" />
                                              {groupName}
                                            </span>
                                          )}
                                          <div className="flex flex-col gap-2">
                                            {upcomingGroups[groupName].map((match) => {
                                              const isSelected = selectedMatch?.fixture.id === match.fixture.id;
                                              return (
                                                <div
                                                  key={match.fixture.id}
                                                  onClick={() => setSelectedMatch(match)}
                                                  className={`rounded-xl shadow-2xs p-3.5 flex items-center justify-between cursor-pointer border transition-all ${
                                                    isSelected 
                                                      ? "ring-2 ring-emerald-500/40 border-emerald-500 bg-emerald-50/10 dark:bg-emerald-950/25" 
                                                      : "bg-slate-50/30 dark:bg-slate-950/40 border-slate-200/50 dark:border-slate-850/80 hover:border-slate-300 hover:bg-white dark:hover:bg-slate-900"
                                                  }`}
                                                >
                                                  <div className="mr-3 shrink-0 select-none bg-slate-100/50 dark:bg-slate-800 p-1 rounded-lg flex items-center justify-center">
                                                    <SafeImage 
                                                      src={match.league.logo} 
                                                      alt={match.league.name} 
                                                      className="w-5 h-5 object-contain"
                                                      fallbackType="league"
                                                    />
                                                  </div>

                                                  <div className="flex-1 overflow-hidden pr-3 font-sans">
                                                    <div className="flex items-center justify-between w-full h-fit gap-2">
                                                      <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end text-right">
                                                        <span className="font-bold text-slate-800 dark:text-slate-105 text-xs tracking-tight truncate">
                                                          {match.teams.home.name}
                                                        </span>
                                                        <SafeImage 
                                                          src={match.teams.home.logo} 
                                                          alt={match.teams.home.name} 
                                                          className="w-5 h-5 object-contain bg-slate-100/40 dark:bg-slate-800 rounded-md p-0.5 shrink-0"
                                                          fallbackType="team"
                                                        />
                                                      </div>
                                                      <div className="flex items-center gap-1 shrink-0 px-2 py-0.5 bg-slate-100/50 dark:bg-slate-800/40 rounded-lg min-w-[50px] justify-center text-center select-none font-mono border border-slate-100/40 dark:border-slate-800/20">
                                                        <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500">
                                                          -
                                                        </span>
                                                        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold">-</span>
                                                        <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500">
                                                          -
                                                        </span>
                                                      </div>
                                                      <div className="flex items-center gap-1.5 flex-1 min-w-0 text-left">
                                                        <SafeImage 
                                                          src={match.teams.away.logo} 
                                                          alt={match.teams.away.name} 
                                                          className="w-5 h-5 object-contain bg-slate-100/40 dark:bg-slate-800 rounded-md p-0.5 shrink-0"
                                                          fallbackType="team"
                                                        />
                                                        <span className="font-bold text-slate-800 dark:text-slate-105 text-xs tracking-tight truncate">
                                                          {match.teams.away.name}
                                                        </span>
                                                      </div>
                                                    </div>
                                                  </div>
                                                  <div className="ml-2 pl-3 border-l border-slate-100/60 dark:border-slate-800/60 flex flex-col items-center justify-center shrink-0 min-w-[#48px] select-none">
                                                    <span className="text-slate-500 dark:text-slate-400 font-mono text-[10.5px] font-bold bg-slate-100/80 dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200/10 shadow-3xs">
                                                      {new Date(match.fixture.date).toLocaleTimeString(localeStr, {
                                                        hour: "2-digit",
                                                        minute: "2-digit"
                                                      })}
                                                    </span>
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })()
                        ) : (
                          // For standard countries
                          Object.entries(drawer.leagues).map(([leagueKey, { league, matches: leagueMatches }]) => {
                            const isLeagueFav = favorites.leagues.includes(league.id);
                            return (
                              <div key={leagueKey} className="flex flex-col gap-2">
                                <div className="flex items-center justify-between pl-1 select-none">
                                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">
                                    <SafeImage 
                                      src={league.logo} 
                                      alt={league.name} 
                                      className="w-4 h-4 object-contain rounded bg-slate-50 dark:bg-slate-800 p-0.5 shrink-0"
                                      fallbackType="league"
                                    />
                                    <span>{league.name}</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleFavoriteLeague(league.id);
                                    }}
                                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full cursor-pointer transition-all focus:outline-none"
                                    title="Favoritar Liga"
                                  >
                                    <Star 
                                      className={`w-3.5 h-3.5 ${
                                        isLeagueFav ? "fill-amber-400 text-amber-500 stroke-[2.2]" : "text-slate-300 hover:text-amber-500"
                                      }`} 
                                    />
                                  </button>
                                </div>

                                {/* Actual Games Cards */}
                                <div className="flex flex-col gap-2">
                                  {leagueMatches.map((match) => {
                                    const isLive = ["1H", "2H", "HT", "ET", "BT", "P", "SUSP", "INT"].includes(
                                      match.fixture.status.short
                                    );
                                    const isFinished = match.fixture.status.short === "FT";
                                    const isSelected = selectedMatch?.fixture.id === match.fixture.id;
                                    return (
                                      <div
                                        key={match.fixture.id}
                                        onClick={() => setSelectedMatch(match)}
                                        className={`rounded-xl shadow-2xs p-3.5 flex items-center justify-between cursor-pointer border transition-all ${
                                          isSelected 
                                            ? "ring-2 ring-emerald-500/40 border-emerald-500 bg-emerald-50/10 dark:bg-emerald-950/25" 
                                            : isLive
                                            ? "bg-white dark:bg-slate-900 border-l-4 border-l-[#ffdf00] border-y border-r border-slate-150/80 dark:border-slate-800/80 hover:border-slate-300"
                                            : "bg-slate-50/30 dark:bg-slate-950/40 border-slate-200/50 dark:border-slate-850/80 hover:border-slate-300 hover:bg-white dark:hover:bg-slate-900"
                                        }`}
                                      >
                                        <div className="mr-3 shrink-0 select-none bg-slate-100/50 dark:bg-slate-800 p-1 rounded-lg flex items-center justify-center">
                                          <SafeImage 
                                            src={match.league.logo} 
                                            alt={match.league.name} 
                                            className="w-5 h-5 object-contain"
                                            fallbackType="league"
                                          />
                                        </div>

                                                  <div className="flex-1 overflow-hidden pr-3 font-sans">
                                                    <div className="flex flex-col gap-1.5 py-0.5">
                                                      {/* Home Team Row */}
                                                      <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-1.5 min-w-0">
                                                          <SafeImage 
                                                            src={match.teams.home.logo} 
                                                            alt={match.teams.home.name} 
                                                            className="w-4.5 h-4.5 object-contain bg-slate-100/40 dark:bg-slate-800/60 rounded-md p-0.5 shrink-0"
                                                            fallbackType="team"
                                                          />
                                                          <span className="font-bold text-slate-800 dark:text-slate-105 text-xs truncate">
                                                            {match.teams.home.name}
                                                          </span>
                                                        </div>
                                                        <span className="font-mono text-xs font-black text-slate-400 dark:text-slate-500 pr-1">
                                                          -
                                                        </span>
                                                      </div>

                                                      {/* Away Team Row */}
                                                      <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-1.5 min-w-0">
                                                          <SafeImage 
                                                            src={match.teams.away.logo} 
                                                            alt={match.teams.away.name} 
                                                            className="w-4.5 h-4.5 object-contain bg-slate-100/40 dark:bg-slate-800/60 rounded-md p-0.5 shrink-0"
                                                            fallbackType="team"
                                                          />
                                                          <span className="font-bold text-slate-800 dark:text-slate-105 text-xs truncate">
                                                            {match.teams.away.name}
                                                          </span>
                                                        </div>
                                                        <span className="font-mono text-xs font-black text-slate-400 dark:text-slate-500 pr-1">
                                                          -
                                                        </span>
                                                      </div>
                                                    </div>
                                                  </div>
                                        <div className="ml-2 pl-3 border-l border-slate-100/60 dark:border-slate-850/60 flex flex-col items-center justify-center shrink-0 min-w-[#48px] select-none">
                                          {isLive ? (
                                            <>
                                              <span className="text-red-650 dark:text-red-400 text-xs font-black tracking-tighter flex items-center gap-0.5 font-mono">
                                                {match.fixture.status.short === "HT" ? (isPt ? "INT" : language === "en" ? "HT" : language === "es" ? "DESC" : language === "fr" ? "MT" : language === "it" ? "INT" : "HZ") : `${match.fixture.status.elapsed}'`}
                                              </span>
                                              <span className="text-[8px] font-black text-[#009c3b] dark:text-emerald-400 uppercase tracking-wider mt-0.5">
                                                {isPt ? "VIVO" : language === "en" ? "LIVE" : language === "es" ? "VIVO" : language === "fr" ? "DIRECT" : language === "it" ? "LIVE" : "LIVE"}
                                              </span>
                                            </>
                                          ) : isFinished ? (
                                            <span className="text-slate-404 dark:text-slate-500 text-[10px] font-bold uppercase font-mono">
                                              FT
                                            </span>
                                          ) : (
                                            <span className="text-slate-500 dark:text-slate-400 font-mono text-[10.5px] font-bold bg-slate-100/80 dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200/10 shadow-3xs">
                                              {new Date(match.fixture.date).toLocaleTimeString(localeStr, {
                                                hour: "2-digit",
                                                minute: "2-digit"
                                              })}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}

          </div>

          {/* RIGHT COLUMN: DETAILED MATCH CENTER (DESKTOP INTEGRATED CARD) */}
          <div className="flex-1 flex flex-col">
            {isLargeScreen ? (
              selectedMatch ? (
                <div className="h-full min-h-[580px]">
                  <MatchDetail 
                    match={selectedMatch} 
                    onClose={() => setSelectedMatch(null)} 
                    isEmbedded={true} 
                    language={language}
                    favorites={favorites}
                    onToggleFavoriteTeam={toggleFavoriteTeam}
                    onToggleFavoritePlayer={toggleFavoritePlayer}
                    matches={matches}
                  />
                </div>
              ) : (
                <div className={`rounded-2xl border p-10 flex flex-col items-center justify-center text-center h-full min-h-[580px] transition-colors select-none ${
                  config.theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                }`}>
                  <div className="w-16 h-16 bg-slate-50 dark:bg-slate-950 rounded-full flex items-center justify-center text-slate-300 mb-4 border border-slate-100 dark:border-slate-850">
                    <Trophy className="w-8 h-8 text-[#009c3b] dark:text-emerald-400" />
                  </div>
                  <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">
                    {isPt ? "Central de Partidas WorldScore" : language === "en" ? "WorldScore Match Center" : language === "es" ? "Centro de Partidos WorldScore" : language === "fr" ? "Centre de Match WorldScore" : language === "it" ? "Centro Partite WorldScore" : "WorldScore Spielcenter"}
                  </h3>
                  <p className="text-xs text-slate-450 dark:text-slate-400 max-w-sm mt-1 mb-6 leading-relaxed">
                    {t.selectMatchPrompt}
                  </p>
                  
                  {/* Quick stats teasers */}
                  <div className="grid grid-cols-2 gap-4 max-w-xs w-full">
                    <div className="bg-slate-50/50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-105 dark:border-slate-850 text-left">
                      <Clock className="w-4 h-4 text-[#009c3b] dark:text-emerald-450 mb-1" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{isPt ? "Simulações" : language === "en" ? "Simulations" : language === "es" ? "Simulaciones" : language === "fr" ? "Simulations" : language === "it" ? "Simulazioni" : "Simulationen"}</span>
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-350 mt-0.5 font-mono">
                        {isPt ? "Minuto a Minuto" : language === "en" ? "Minute by Minute" : language === "es" ? "Minuto a Minuto" : language === "fr" ? "Minute par Minute" : language === "it" ? "Minuto per Minuto" : "Minute für Minute"}
                      </p>
                    </div>
                    <div className="bg-slate-50/50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-105 dark:border-slate-850 text-left">
                      <Target className="w-4 h-4 text-amber-500 mb-1" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.statsTab}</span>
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-350 mt-0.5 font-mono">
                        {isPt ? "Precisão Real" : language === "en" ? "Real Precision" : language === "es" ? "Precisión Real" : language === "fr" ? "Précision Réelle" : language === "it" ? "Precisione Reale" : "Echte Präzision"}
                      </p>
                    </div>
                  </div>
                </div>
              )
            ) : (
              // Mobile sliding drawer (rendered dynamically on click)
              selectedMatch && (
                <MatchDetail 
                  match={selectedMatch} 
                  onClose={() => setSelectedMatch(null)} 
                  isEmbedded={false} 
                  language={language}
                  favorites={favorites}
                  onToggleFavoriteTeam={toggleFavoriteTeam}
                  onToggleFavoritePlayer={toggleFavoritePlayer}
                  matches={matches}
                />
              )
            )}
          </div>

        </main>
          )
        } />
      </Routes>

      {/* QUICK FLOATING SYSTEM INFORMATION FOOTER */}
      <footer className={`border-t mt-auto py-4 text-center select-none text-[11px] font-medium font-mono transition-colors ${
        config.theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-400" : "bg-white border-slate-200 text-slate-450"
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <span>
            {isPt ? "WorldScore © 2026 • Resultados Globais em Tempo Real" 
             : language === "en" ? "WorldScore © 2026 • Global Real-Time Results" 
             : language === "es" ? "WorldScore © 2026 • Resultados Globales en Tiempo Real" 
             : language === "fr" ? "WorldScore © 2026 • Résultats Globaux en Temps Réel" 
             : language === "it" ? "WorldScore © 2026 • Risultati Globali in Tempo Reale" 
             : "WorldScore © 2026 • Globale Live-Ergebnisse in Echtzeit"}
          </span>
          <div className="flex items-center gap-1.5 opacity-75">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 alive-pulse-icon" />
            <span>
              {isPt ? "Servidor Central Ativo" 
               : language === "en" ? "Central Server Active" 
               : language === "es" ? "Servidor Central Activo" 
               : language === "fr" ? "Serveur Central Actif" 
               : language === "it" ? "Server Centrale Attivo" 
               : "Zentralserver Aktiv"}
            </span>
          </div>
        </div>
      </footer>

      {/* Persistent Settings drawer overlay */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onChangeConfig={handleSaveConfig}
      />

      {/* Login modal dialog */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        language={language}
        onLoginSuccess={(userName) => setUser(userName)}
        theme={config.theme}
      />
    </div>
  );
}
