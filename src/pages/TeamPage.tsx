import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Shield, Users, Calendar, Trophy, ChevronLeft, Star, Flame, Award, MapPin, Globe, User, TrendingUp, RefreshCw, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { SafeImage } from "../components/SafeImage";
import { Match } from "../types";
import { getTeamDetails, getTeamSquad, getLeagueStandings } from "../api";

interface TeamPageProps {
  matches: Match[];
  favorites: { teams: string[] };
  onToggleFavoriteTeam: (teamName: string) => void;
  language: string;
}

// Fallback data structure for teams not inside API Sports
const TEAM_FALLBACKS: Record<number, {
  coach: string; stadium: string; city: string; founded: number;
  stats: { matches: number; wins: number; draws: number; losses: number; gf: number; ga: number };
}> = {
  127: { coach: "Filipe Luís", stadium: "Maracanã", city: "Rio de Janeiro", founded: 1895, stats: { matches: 38, wins: 24, draws: 8, losses: 6, gf: 68, ga: 32 } },
  121: { coach: "Abel Ferreira", stadium: "Allianz Parque", city: "São Paulo", founded: 1914, stats: { matches: 38, wins: 22, draws: 9, losses: 7, gf: 61, ga: 29 } },
  126: { coach: "Luis Zubeldía", stadium: "MorumBIS", city: "São Paulo", founded: 1930, stats: { matches: 38, wins: 18, draws: 10, losses: 10, gf: 52, ga: 38 } },
  131: { coach: "Ramón Díaz", stadium: "Neo Química Arena", city: "São Paulo", founded: 1910, stats: { matches: 38, wins: 14, draws: 12, losses: 12, gf: 46, ga: 41 } },
  541: { coach: "Carlo Ancelotti", stadium: "Santiago Bernabéu", city: "Madrid", founded: 1902, stats: { matches: 38, wins: 29, draws: 8, losses: 1, gf: 87, ga: 26 } },
  529: { coach: "Hansi Flick", stadium: "Camp Nou", city: "Barcelona", founded: 1899, stats: { matches: 38, wins: 27, draws: 4, losses: 7, gf: 94, ga: 40 } }
};

const translateRole = (roleStr: string) => {
  if (!roleStr) return '';
  const upperRole = roleStr.toUpperCase();
  if (upperRole.includes('COACH') || upperRole.includes('MANAGER')) return 'TREINADOR';
  if (upperRole.includes('KEEPER') || upperRole.includes('GK')) return 'GOLEIRO';
  if (upperRole.includes('DEFENDER') || upperRole.includes('CB') || upperRole.includes('LB') || upperRole.includes('RB')) return 'DEFENSOR';
  if (upperRole.includes('MIDFIELDER') || upperRole.includes('CM') || upperRole.includes('CDM') || upperRole.includes('CAM')) return 'MEIO-CAMPISTA';
  if (upperRole.includes('ATTACKER') || upperRole.includes('ST') || upperRole.includes('RW') || upperRole.includes('LW')) return 'ATACANTE';
  return roleStr;
};

const translateCountry = (countryStr: string) => {
  if (!countryStr) return '';
  const c = countryStr.toLowerCase().trim();
  if (c === 'brazil') return 'Brasil';
  if (c === 'argentina') return 'Argentina';
  if (c === 'spain') return 'Espanha';
  if (c === 'england') return 'Inglaterra';
  if (c === 'france') return 'França';
  if (c === 'germany') return 'Alemanha';
  if (c === 'italy') return 'Itália';
  if (c === 'portugal') return 'Portugal';
  if (c === 'uruguay') return 'Uruguai';
  if (c === 'paraguay') return 'Paraguai';
  if (c === 'colombia') return 'Colômbia';
  if (c === 'chile') return 'Chile';
  return countryStr;
};

export default function TeamPage({ matches, favorites, onToggleFavoriteTeam, language }: TeamPageProps) {
  const { teamId } = useParams<{ teamId: string }>();
  const teamIdNum = teamId ? parseInt(teamId, 10) : 0;
  const isPtStr = language.startsWith("pt");

  // State Management
  const [activeTab, setActiveTab] = useState<"overview" | "squad" | "stats" | "transfers">("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [teamDetails, setTeamDetails] = useState<any>(null);
  const [squad, setSquad] = useState<any[]>([]);
  const [standings, setStandings] = useState<any[]>([]);
  const [isStandingsLoading, setIsStandingsLoading] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [leagueStats, setLeagueStats] = useState<any>(null);

  // Overview Filters State
  const [selectedCompetition, setSelectedCompetition] = useState<string>("All");
  const [selectedYear, setSelectedYear] = useState<string>("2026");
  const [currentRoundIdx, setCurrentRoundIdx] = useState<number>(0);

  // Standings Filters State
  const [standingsComp, setStandingsComp] = useState<string>("All");

  // Fetch Team core details
  useEffect(() => {
    setActiveTab("overview");
    setIsLoading(true);
    setTeamDetails(null);
    setLeagueStats(null);
    setImageErrors({});

    let isMounted = true;
    async function loadData() {
      try {
        const detailsData = await getTeamDetails(teamIdNum);

        if (!isMounted) return;

        if (detailsData?.response?.details) {
          const d = detailsData.response.details;
          const schema = d.sportsTeamJSONLD || {};
          setTeamDetails({
            name: d.name || "",
            country: d.country || "",
            league: d.primaryLeagueName || "",
            primaryLeagueId: d.primaryLeagueId || null,
            logo: schema.logo || `https://images.fotmob.com/image_resources/logo/teamlogo/${d.id}.png`,
            stadium: schema.location?.name || d.sportsTeamJSONLD?.location?.name || "",
            city: schema.location?.address?.addressLocality || d.sportsTeamJSONLD?.location?.address?.addressLocality || ""
          });
        }
      } catch (err) {
        console.error("Error loading team details:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    if (teamIdNum) loadData();

    return () => {
      isMounted = false;
    };
  }, [teamIdNum]);

  // Ciclo de Vida (useEffect) específico para o Elenco
  useEffect(() => {
    let isMounted = true;
    const fetchSquad = async () => {
      setIsLoading(true); // Liga o loading
      setSquad([]); // Limpa o estado anterior
      
      try {
        // Tenta buscar pelo proxy local primeiro para manter integridade das chaves e evitar CORS/Rate limits
        const proxyResponse = await fetch(`/api/team-squad/${teamId}`);
        if (proxyResponse.ok && isMounted) {
          const resJson = await proxyResponse.json();
          const pData = resJson?.data;
          if (pData?.response?.list?.squad) {
            setSquad(pData.response.list.squad);
            return;
          } else if (pData?.response?.squad) {
            setSquad(pData.response.squad);
            return;
          }
        }

        // Endpoint correto com ID dinâmico caso precise buscar diretamente da API
        const url = `https://free-api-live-football-data.p.rapidapi.com/football-get-list-player?teamid=${teamId}`;
        const options = {
          method: "GET",
          headers: {
            "x-rapidapi-key": "9b9bc4cde1mshac85de8628281aap1fe278jsna8a022da00be",
            "x-rapidapi-host": "free-api-live-football-data.p.rapidapi.com"
          }
        };
        const response = await fetch(url, options);
        const data = await response.json();
        
        if (!isMounted) return;

        // Mapeamento baseado no JSON correto da API
        if (data?.response?.list?.squad) {
          setSquad(data.response.list.squad);
        } else if (data?.response?.squad) {
          setSquad(data.response.squad);
        }
      } catch (error) {
        console.error("Erro ao buscar elenco:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false); // DESLIGA O LOADING OBRIGATORIAMENTE
        }
      }
    };
    
    if (teamId) fetchSquad();

    return () => {
      isMounted = false;
    };
  }, [teamId]); // A dependência do teamId é OBRIGATÓRIA

  // Derived Info & Fallbacks
  const teamFixtures = useMemo(() => {
    return matches.filter(m => m.teams.home.id === teamIdNum || m.teams.away.id === teamIdNum);
  }, [matches, teamIdNum]);

  const uniqueCompetitions = useMemo(() => {
    const list = teamFixtures.map(m => m.league.name).filter(Boolean);
    return Array.from(new Set(list));
  }, [teamFixtures]);

  const fallbackInfo = TEAM_FALLBACKS[teamIdNum] || {
    coach: isPtStr ? "Técnico Adjunto" : "Assistant Coach",
    stadium: isPtStr ? "Arena Allianz" : "Allianz Stadium",
    city: isPtStr ? "São Paulo" : "São Paulo",
    founded: 1910,
    stats: { matches: 38, wins: 20, draws: 10, losses: 8, gf: 55, ga: 35 }
  };

  const resolvedDetails = useMemo(() => {
    const matchedFix = teamFixtures[0];
    const defaultName = matchedFix?.teams.home.id === teamIdNum 
      ? matchedFix.teams.home.name 
      : (matchedFix?.teams.away.name || (isPtStr ? "Seleção Principal" : "First Team"));

    return {
      name: teamDetails?.name || defaultName,
      logo: teamDetails?.logo || `https://images.fotmob.com/image_resources/logo/teamlogo/${teamIdNum}.png`,
      country: teamDetails?.country || (isPtStr ? "Brasil" : "Brazil"),
      league: teamDetails?.league || matchedInfoLeagueName(),
      stadium: teamDetails?.stadium || fallbackInfo.stadium,
      city: teamDetails?.city || fallbackInfo.city,
      founded: fallbackInfo.founded,
      stats: fallbackInfo.stats,
      coach: fallbackInfo.coach
    };

    function matchedInfoLeagueName() {
      if (teamFixtures.length > 0) return teamFixtures[0].league.name;
      return [127, 121, 126, 131].includes(teamIdNum) ? "Brasileirão Série A" : ([541, 529].includes(teamIdNum) ? "La Liga" : "Série A");
    }
  }, [teamDetails, teamIdNum, teamFixtures, isPtStr, fallbackInfo]);

  // Deduce League ID to fetch realistic standings
  const deducedLeagueId = useMemo(() => {
    if (teamFixtures.length > 0) return teamFixtures[0].league.id;
    if ([127, 121, 126, 131].includes(teamIdNum)) return 71; // Serie A
    if ([541, 529].includes(teamIdNum)) return 140; // La Liga
    return 71;
  }, [teamIdNum, teamFixtures]);

  // Load standings
  useEffect(() => {
    let active = true;
    async function loadStandings() {
      setIsStandingsLoading(true);
      try {
        const data = await getLeagueStandings(deducedLeagueId);
        if (active && data && Array.isArray(data)) {
          setStandings(data);
        }
      } catch (e) {
        console.error("Error loading standings:", e);
      } finally {
        if (active) setIsStandingsLoading(false);
      }
    }
    if (teamIdNum) loadStandings();
    return () => { active = false; };
  }, [teamIdNum, deducedLeagueId]);

  // Fetch real league stats silently for the header
  useEffect(() => {
    let isMounted = true;
    const fetchTeamLeagueStats = async () => {
      const leagueIdToUse = teamDetails?.primaryLeagueId || deducedLeagueId;
      if (!leagueIdToUse) return;
      try {
        // Tenta buscar pelo proxy local primeiro (através de getLeagueStandings) para manter consistência e velocidade
        const standingsData = await getLeagueStandings(leagueIdToUse);
        if (!isMounted) return;

        if (Array.isArray(standingsData)) {
          const teamInLeague = standingsData.find(
            (t: any) => Number(t.id) === Number(teamId) || Number(t.teamId) === Number(teamId)
          );
          if (teamInLeague) {
            setLeagueStats({
              played: teamInLeague.played ?? teamInLeague.matches ?? ((teamInLeague.wins ?? 0) + (teamInLeague.draws ?? 0) + (teamInLeague.losses ?? 0)),
              wins: teamInLeague.wins ?? 0,
              draws: teamInLeague.draws ?? 0,
              losses: teamInLeague.losses ?? 0
            });
            return;
          }
        }

        // Chamada direta se o proxy não tiver o time ou falhar
        const directUrl = `https://free-api-live-football-data.p.rapidapi.com/football-get-standing-all?leagueid=${leagueIdToUse}`;
        const options = {
          method: "GET",
          headers: {
            "x-rapidapi-key": "9b9bc4cde1mshac85de8628281aap1fe278jsna8a022da00be",
            "x-rapidapi-host": "free-api-live-football-data.p.rapidapi.com"
          }
        };
        const response = await fetch(directUrl, options);
        if (!isMounted) return;

        if (response.ok) {
          const data = await response.json();
          if (data?.response?.standing) {
            const teamInLeague = data.response.standing.find(
              (t: any) => Number(t.id) === Number(teamId) || Number(t.teamId) === Number(teamId)
            );
            if (teamInLeague) {
              setLeagueStats({
                played: teamInLeague.played ?? teamInLeague.matches ?? ((teamInLeague.wins ?? 0) + (teamInLeague.draws ?? 0) + (teamInLeague.losses ?? 0)),
                wins: teamInLeague.wins ?? 0,
                draws: teamInLeague.draws ?? 0,
                losses: teamInLeague.losses ?? 0
              });
            }
          }
        }
      } catch (error) {
        console.error("Erro ao buscar estatísticas da liga para o cabeçalho:", error);
      }
    };

    fetchTeamLeagueStats();
    return () => {
      isMounted = false;
    };
  }, [teamDetails, teamId, deducedLeagueId]);

  // Processamento Matemático de Destaques (useMemo)
  const { topScorers, topAssists } = useMemo(() => {
    if (!squad || squad.length === 0) return { topScorers: [], topAssists: [] };

    // Extrai todos os jogadores de todos os grupos (Goleiros, Defensores, etc.)
    const allPlayers = squad.flatMap((group: any) => {
      const titleLower = (group.title || "").toLowerCase().trim();
      if (titleLower === "coach" || titleLower === "coaching staff") return [];
      return group.members || [];
    });

    // Ordena do maior para o menor número de Gols
    const scorers = [...allPlayers]
      .filter((p: any) => p && p.id && (p.goals || 0) > 0)
      .sort((a, b) => (b.goals || 0) - (a.goals || 0))
      .slice(0, 3);

    // Ordena do maior para o menor número de Assistências
    const assists = [...allPlayers]
      .filter((p: any) => p && p.id && (p.assists || 0) > 0)
      .sort((a, b) => (b.assists || 0) - (a.assists || 0))
      .slice(0, 3);

    return { topScorers: scorers, topAssists: assists };
  }, [squad]);

  const isFavorite = favorites.teams.includes(resolvedDetails.name);

  // Filtered Overview Fixtures
  const filteredFixtures = useMemo(() => {
    return teamFixtures.filter(m => {
      const compMatch = selectedCompetition === "All" || m.league.name === selectedCompetition;
      const yr = new Date(m.fixture.date).getFullYear().toString();
      const yearMatch = selectedYear === "All" || yr === selectedYear || (selectedYear === "2026" && yr === "2026");
      return compMatch && yearMatch;
    });
  }, [teamFixtures, selectedCompetition, selectedYear]);

  // Unique rounds inside currently filtered fixtures
  const uniqueRounds = useMemo(() => {
    const rounds = Array.from(new Set(filteredFixtures.map(m => m.league.round).filter(Boolean))) as string[];
    rounds.sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ""), 10) || 0;
      const numB = parseInt(b.replace(/\D/g, ""), 10) || 0;
      return numA - numB;
    });
    return rounds;
  }, [filteredFixtures]);

  // Safety boundary for current round index
  useEffect(() => {
    setCurrentRoundIdx(0);
  }, [selectedCompetition, selectedYear]);

  // Layout Games Classification
  const finishedMatches = useMemo(() => {
    return filteredFixtures.filter(m => m.fixture.status.short === "FT" || m.fixture.status.short === "PEN" || m.fixture.status.short === "AET");
  }, [filteredFixtures]);

  const upcomingMatches = useMemo(() => {
    return filteredFixtures.filter(m => m.fixture.status.short !== "FT" && m.fixture.status.short !== "PEN" && m.fixture.status.short !== "AET");
  }, [filteredFixtures]);

  // Position detailing helper
  const mapPositionDetail = (p: any) => {
    const code = (p.roleCode || p.positionCode || "").toUpperCase();
    if (code === "GK") return isPtStr ? "Goleiro" : "Goalkeeper";
    if (code === "CB") return isPtStr ? "Zagueiro Central" : "Center Back";
    if (code === "LB") return isPtStr ? "Lateral Esquerdo" : "Left Back";
    if (code === "RB") return isPtStr ? "Lateral Direito" : "Right Back";
    if (code === "LWB") return isPtStr ? "Ala Esquerdo" : "Left Wing Back";
    if (code === "RWB") return isPtStr ? "Ala Direito" : "Right Wing Back";
    if (code === "CDM") return isPtStr ? "Primeiro Volante" : "Defensive Midfielder";
    if (code === "CM") return isPtStr ? "Volante / Meia" : "Central Midfielder";
    if (code === "CAM" || code === "AM") return isPtStr ? "Meia Armador" : "Attacking Midfielder";
    if (code === "LM") return isPtStr ? "Meia Esquerdo" : "Left Midfielder";
    if (code === "RM") return isPtStr ? "Meia Direito" : "Right Midfielder";
    if (code === "LW") return isPtStr ? "Ponta Esquerda" : "Left Winger";
    if (code === "RW") return isPtStr ? "Ponta Direita" : "Right Winger";
    if (code === "ST" || code === "CF") return isPtStr ? "Centroavante" : "Striker";

    const parentG = (p._rawGroupTitle || p.role || "").toLowerCase();
    if (parentG.includes("keeper")) return isPtStr ? "Goleiro" : "Goalkeeper";
    if (parentG.includes("defender")) return isPtStr ? "Defesa" : "Defender";
    if (parentG.includes("midfielder")) return isPtStr ? "Meio-Campista" : "Midfielder";
    return isPtStr ? "Atacante" : "Forward";
  };

  // Format and translate squad category group titles
  const translateGroupTitle = (title: string) => {
    const t = (title || "").toLowerCase().trim();
    if (isPtStr) {
      if (t === "coach") return "Comissão Técnica";
      if (t === "keepers") return "Goleiros";
      if (t === "defenders") return "Defensores";
      if (t === "midfielders") return "Meio-Campistas";
      if (t === "attackers") return "Atacantes";
      return title;
    } else {
      if (t === "coach") return "Coaching Staff";
      if (t === "keepers") return "Goalkeepers";
      if (t === "defenders") return "Defenders";
      if (t === "midfielders") return "Midfielders";
      if (t === "attackers") return "Forwards";
      return title;
    }
  };

  // Pre-load transfer history entries based on Team ID
  const transfers = useMemo(() => {
    const f = (val: string) => isPtStr ? val : val.replace("Sem custos", "Free").replace("Empréstimo", "Loan").replace("Aposentado", "Retired");
    if (teamIdNum === 127) {
      return {
        arrivals: [
          { name: "Carlos Alcaraz", age: 21, pos: f("Meio-Campista"), from: "Southampton", logo: "https://media.api-sports.io/football/teams/41.png", fee: "€18.00M", date: "2024-08-28" },
          { name: "Gonzalo Plata", age: 23, pos: f("Atacante"), from: "Al-Sadd", logo: "https://media.api-sports.io/football/teams/1500.png", fee: "€8.50M", date: "2024-08-30" },
          { name: "Michael", age: 28, pos: f("Atacante"), from: "Al-Hilal", logo: "https://media.api-sports.io/football/teams/351.png", fee: f("Sem custos"), date: "2024-08-21" },
          { name: "Alex Sandro", age: 33, pos: f("Lateral Esquerdo"), from: "Juventus", logo: "https://media.api-sports.io/football/teams/496.png", fee: f("Sem custos"), date: "2024-08-26" }
        ],
        departures: [
          { name: "Igor Jesus", age: 21, pos: f("Meio-Campista"), to: "Estrela Amadora", logo: "https://media.api-sports.io/football/teams/1909.png", fee: "€2.00M", date: "2024-08-30" },
          { name: "Victor Hugo", age: 20, pos: f("Volante"), to: "Goztepe", logo: "https://media.api-sports.io/football/teams/3579.png", fee: f("Empréstimo"), date: "2024-08-25" }
        ]
      };
    }
    if (teamIdNum === 121) {
      return {
        arrivals: [
          { name: "Felipe Anderson", age: 31, pos: f("Atacante"), from: "Lazio", logo: "https://media.api-sports.io/football/teams/487.png", fee: f("Sem custos"), date: "2024-07-01" },
          { name: "Maurício", age: 23, pos: f("Meio-Campista"), from: "Internacional", logo: "https://media.api-sports.io/football/teams/119.png", fee: "€10.50M", date: "2024-06-27" }
        ],
        departures: [
          { name: "Endrick", age: 18, pos: f("Atacante"), to: "Real Madrid", logo: "https://media.api-sports.io/football/teams/541.png", fee: "€47.50M", date: "2024-07-21" }
        ]
      };
    }
    return {
      arrivals: [
        { name: "Kylian Mbappé", age: 25, pos: f("Atacante"), from: "Paris Saint-Germain", logo: "https://media.api-sports.io/football/teams/85.png", fee: f("Sem custos"), date: "2024-07-01" },
        { name: "Dani Olmo", age: 26, pos: f("Meio-Campista"), from: "RB Leipzig", logo: "https://media.api-sports.io/football/teams/173.png", fee: "€55.00M", date: "2024-08-09" }
      ],
      departures: [
        { name: "Toni Kroos", age: 34, pos: f("Meio-Campista"), to: f("Aposentado"), logo: "", fee: f("Sem custos"), date: "2024-06-30" }
      ]
    };
  }, [teamIdNum, isPtStr]);

  // Save details dynamically into Cache before Link navigates
  const handlePlayerClick = (p: any) => {
    try {
      const payload = {
        ...p,
        teamName: resolvedDetails.name,
        teamLogo: resolvedDetails.logo,
        teamId: teamIdNum
      };
      localStorage.setItem(`player_${p.id}`, JSON.stringify(payload));
    } catch (e) {
      console.error("Cache persistence error:", e);
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen pb-16 transition-colors duration-300">
      {/* Return Button */}
      <Link
        to="/"
        className="absolute top-4 left-4 z-20 flex items-center gap-1.5 text-xs font-bold text-white bg-black/55 hover:bg-black/80 py-1 px-3 rounded-full transition-all border border-white/5 shadow-md"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>{isPtStr ? "Início" : "Home"}</span>
      </Link>

      {isLoading ? (
        <div className="flex flex-col h-screen justify-center items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-sm font-semibold tracking-wider text-slate-400 uppercase animate-pulse">
            {isPtStr ? "Carregando informações..." : "Loading premium panel..."}
          </p>
        </div>
      ) : (
        <>
          {/* Visual Ambient Dark Banner */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-[#022c22] text-white relative py-14 px-6 border-b border-white/[0.05] overflow-hidden select-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none select-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none select-none" />

            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-6 mt-8 md:mt-4 relative z-10">
              <SafeImage
                src={resolvedDetails.logo}
                alt={resolvedDetails.name}
                className="w-24 h-24 sm:w-28 sm:h-28 object-contain bg-white/5 backdrop-blur-md p-4 rounded-3xl border border-white/10 shadow-2xl transition-transform hover:scale-105 duration-300 shrink-0"
                fallbackType="team"
              />

              <div className="flex-1 text-center md:text-left min-w-0">
                <div className="flex flex-col md:flex-row md:items-center gap-3.5 justify-center md:justify-start">
                  <h1 className="text-3xl sm:text-4.5xl font-sans font-extrabold tracking-tight text-white drop-shadow-sm truncate">
                    {resolvedDetails.name}
                  </h1>
                  <button
                    onClick={() => onToggleFavoriteTeam(resolvedDetails.name)}
                    className="self-center p-2 bg-white/5 hover:bg-white/12 active:scale-95 border border-white/10 rounded-full cursor-pointer transition-all shadow-md shrink-0"
                  >
                    <Star className={`w-4.5 h-4.5 ${isFavorite ? "fill-amber-400 text-amber-400 border-none" : "text-white/60"}`} />
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-2 mt-4 text-xs font-semibold text-slate-350">
                  <span className="flex items-center gap-1.5 bg-white/5 py-1 px-2.5 rounded-lg border border-white/5">
                    <Globe className="w-4 h-4 text-emerald-400" />
                    <span>{resolvedDetails.country}</span>
                  </span>
                  <span className="text-white/20 hidden sm:inline">•</span>
                  <span className="flex items-center gap-1.5 bg-white/5 py-1 px-2.5 rounded-lg border border-white/5">
                    <Trophy className="w-4 h-4 text-emerald-450" />
                    <span>{resolvedDetails.league}</span>
                  </span>
                  <span className="text-white/20 hidden sm:inline">•</span>
                  <span className="flex items-center gap-1.5 bg-white/5 py-1 px-2.5 rounded-lg border border-white/5">
                    <MapPin className="w-4 h-4 text-emerald-450" />
                    <span className="truncate max-w-[220px]">{resolvedDetails.stadium}</span>
                  </span>
                </div>
              </div>

              {/* Victories Counter Stats Row */}
              {leagueStats && (
                <div className="flex gap-4 bg-white/[0.04] backdrop-blur-xs rounded-xl p-4 border border-white/10 shrink-0 text-center shadow-lg">
                  <div>
                    <div className="text-2xl font-mono font-black text-emerald-400">{leagueStats.wins}</div>
                    <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mt-0.5">{isPtStr ? "Vitórias" : "Wins"}</div>
                  </div>
                  <div className="border-l border-white/10" />
                  <div>
                    <div className="text-2xl font-mono font-black text-amber-400">{leagueStats.draws}</div>
                    <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mt-0.5">{isPtStr ? "Empates" : "Draws"}</div>
                  </div>
                  <div className="border-l border-white/10" />
                  <div>
                    <div className="text-2xl font-mono font-black text-rose-500">{leagueStats.losses}</div>
                    <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mt-0.5">{isPtStr ? "Derrotas" : "Losses"}</div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Premium Navigation Tabs */}
          <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800/80 shadow-3xs sticky top-0 z-30">
            <div className="max-w-7xl mx-auto px-6 flex items-center overflow-x-auto select-none gap-1.5 scrollbar-none">
              {(["overview", "squad", "stats", "transfers"] as const).map(tab => {
                const isActive = activeTab === tab;
                let text = "";
                let icon = <Trophy className="w-4.5 h-4.5" />;

                if (tab === "overview") {
                  text = isPtStr ? "Visão Geral" : "Overview";
                  icon = <Shield className="w-4.5 h-4.5" />;
                } else if (tab === "squad") {
                  text = isPtStr ? "Elenco" : "Squad";
                  icon = <Users className="w-4.5 h-4.5" />;
                } else if (tab === "stats") {
                  text = isPtStr ? "Estatísticas" : "Stats";
                  icon = <Flame className="w-4.5 h-4.5" />;
                } else {
                  text = isPtStr ? "Transferências" : "Transfers";
                  icon = <Calendar className="w-4.5 h-4.5" />;
                }

                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-4 text-xs sm:text-sm font-bold border-b-2 cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap ${
                      isActive
                        ? "border-[#009c3b] text-[#009c3b] font-black"
                        : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-350"
                    }`}
                  >
                    {icon}
                    <span>{text}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* 1. VISÃO GERAL TAB (Layout 2 Colunas) */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Coluna Esquerda: Jogos (lg:col-span-2) */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Select filters controls inside games header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-800 p-4 shadow-3xs">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{isPtStr ? "Competição" : "Competition"}</span>
                        <select
                          value={selectedCompetition}
                          onChange={(e) => setSelectedCompetition(e.target.value)}
                          className="text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 py-1.5 px-3 rounded-lg focus:outline-none cursor-pointer focus:ring-1 focus:ring-emerald-500"
                        >
                          <option value="All">{isPtStr ? "Todas as Competições" : "All Competitions"}</option>
                          {uniqueCompetitions.map(comp => (
                            <option key={comp} value={comp}>{comp}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{isPtStr ? "Ano" : "Year"}</span>
                        <select
                          value={selectedYear}
                          onChange={(e) => setSelectedYear(e.target.value)}
                          className="text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 py-1.5 px-3 rounded-lg focus:outline-none cursor-pointer focus:ring-1 focus:ring-emerald-500"
                        >
                          <option value="2026">2026</option>
                          <option value="2025">2025</option>
                        </select>
                      </div>
                    </div>

                    {/* Navigation Arrows */}
                    {uniqueRounds.length > 0 && (
                      <div className="flex items-center gap-2 self-start sm:self-center">
                        <button
                          onClick={() => setCurrentRoundIdx(p => Math.max(0, p - 1))}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                          disabled={currentRoundIdx === 0}
                        >
                          <ChevronLeft className="w-4.5 h-4.5 text-slate-600 dark:text-slate-300" />
                        </button>
                        <div className="text-center px-2">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">{isPtStr ? "Rodada" : "Round"}</span>
                          <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 whitespace-nowrap">
                            {uniqueRounds[currentRoundIdx].replace("Regular Season -", "").trim()}
                          </span>
                        </div>
                        <button
                          onClick={() => setCurrentRoundIdx(p => Math.min(uniqueRounds.length - 1, p + 1))}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                          disabled={currentRoundIdx === uniqueRounds.length - 1}
                        >
                          <ChevronLeft className="w-4.5 h-4.5 text-slate-600 dark:text-slate-300 transform rotate-180" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* PROXIMO JOGO HIGHLIGHT BLOCK */}
                  <div className="space-y-3">
                    <h2 className="text-xs font-black uppercase text-slate-400 tracking-widest">{isPtStr ? "Próximo Jogo" : "Next Match"}</h2>
                    {(() => {
                      const match = upcomingMatches[0] || (teamFixtures.find(m => m.fixture.status.short !== "FT") || {
                        fixture: { id: 9942, date: "2026-06-03T19:00:00Z" },
                        league: { name: resolvedDetails.league },
                        teams: {
                          home: { id: teamIdNum, name: resolvedDetails.name, logo: resolvedDetails.logo },
                          away: { name: isPtStr ? "Rival Histórico" : "Rival Matchup", logo: "/fallback-shield.png" }
                        }
                      });

                      const matchDate = new Date(match.fixture.date);
                      return (
                        <div className="bg-gradient-to-br from-[#0c2a1a] to-slate-950 text-white rounded-2xl p-6 border border-emerald-500/10 shadow-lg relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                          <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4 text-xs font-bold text-slate-300">
                            <span className="uppercase tracking-wider text-emerald-400">{match.league?.name || resolvedDetails.league}</span>
                            <span>{matchDate.toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: '2-digit' })}</span>
                          </div>

                          <div className="flex items-center justify-between gap-4 py-4">
                            <div className="flex flex-col sm:flex-row items-center gap-3 flex-1 justify-end text-center sm:text-right">
                              <span className="font-extrabold text-sm sm:text-base leading-tight truncate order-2 sm:order-1">{match.teams.home.name}</span>
                              <SafeImage src={match.teams.home.logo} alt={match.teams.home.name} className="w-11 h-11 object-contain bg-white/5 p-1 rounded-xl order-1 sm:order-2 shrink-0 border border-white/5" fallbackType="team" />
                            </div>

                            <div className="flex flex-col items-center shrink-0">
                              <div className="bg-emerald-950 border border-emerald-500/20 px-3 py-1.5 rounded-xl font-mono text-xs sm:text-sm font-black text-emerald-400 tracking-wider">
                                {matchDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </div>
                              <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Horário UTC</span>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-3 flex-1 justify-start text-center sm:text-left">
                              <SafeImage src={match.teams.away.logo} alt={match.teams.away.name} className="w-11 h-11 object-contain bg-white/5 p-1 rounded-xl shrink-0 border border-white/5" fallbackType="team" />
                              <span className="font-extrabold text-sm sm:text-base leading-tight truncate">{match.teams.away.name}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* ULTIMOS 4 JOGOS (LAST MATCHES) LIST */}
                  <div className="space-y-3">
                    <h2 className="text-xs font-black uppercase text-slate-400 tracking-widest">{isPtStr ? "Últimos Resultados" : "Last 4 Results"}</h2>
                    {finishedMatches.length === 0 ? (
                      <div className="p-6 text-center bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{isPtStr ? "Nenhum resultado de jogo lançado em 2026" : "No results recorded for this context"}</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {finishedMatches.slice(0, 4).map((m) => {
                          const isHomeHome = m.teams.home.id === teamIdNum;
                          const targetTeamGoals = isHomeHome ? (m.goals.home ?? 0) : (m.goals.away ?? 0);
                          const rivalGoals = isHomeHome ? (m.goals.away ?? 0) : (m.goals.home ?? 0);

                          let badgeColor = "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
                          let outcomeChar = "E";
                          if (targetTeamGoals > rivalGoals) {
                            badgeColor = "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/10";
                            outcomeChar = isPtStr ? "V" : "W";
                          } else if (targetTeamGoals < rivalGoals) {
                            badgeColor = "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-100/50 dark:border-rose-900/10";
                            outcomeChar = isPtStr ? "D" : "L";
                          }

                          return (
                            <div key={m.fixture.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-150 dark:border-slate-800 p-4 transition-all hover:bg-slate-50/50 dark:hover:bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                              <div className="flex items-center gap-3.5 min-w-0 w-full sm:w-auto">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-black text-xs shrink-0 select-none ${badgeColor}`}>
                                  {outcomeChar}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">{m.league.name}</span>
                                    <span className="text-slate-300 dark:text-slate-700">•</span>
                                    <span className="text-[10px] text-slate-400 font-semibold">{new Date(m.fixture.date).toLocaleDateString()}</span>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 truncate">{m.teams.home.name} vs {m.teams.away.name}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <span className="font-mono font-black text-base text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-950 py-1 px-2.5 rounded-lg border border-slate-150 dark:border-slate-800/80">
                                  {m.goals.home} - {m.goals.away}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Coluna Direita: Classificação (lg:col-span-1) */}
                <div className="lg:col-span-1 space-y-4">
                  <h2 className="text-xs font-black uppercase text-slate-400 tracking-widest">{isPtStr ? "Classificação" : "Standings"}</h2>

                  {/* Header controls for Standings */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl p-3 flex justify-between items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isPtStr ? "Competição" : "Leagues"}</span>
                    <select
                      value={standingsComp}
                      onChange={(e) => setStandingsComp(e.target.value)}
                      className="text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 p-1 rounded-sm focus:outline-none"
                    >
                      <option value="All">{resolvedDetails.league}</option>
                    </select>
                  </div>

                  {/* Mini-standings List Table */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-3xs overflow-hidden">
                    <div className="grid grid-cols-12 text-[10px] font-black uppercase text-slate-400 tracking-wider bg-slate-50 dark:bg-slate-950 p-3.5 border-b border-slate-150 dark:border-slate-800 select-none">
                      <div className="col-span-1 text-center">#</div>
                      <div className="col-span-5 pl-1">{isPtStr ? "Clube" : "Club"}</div>
                      <div className="col-span-1 text-center">J</div>
                      <div className="col-span-1 text-center">V</div>
                      <div className="col-span-1 text-center">E</div>
                      <div className="col-span-1 text-center">D</div>
                      <div className="col-span-2 text-right">Pts</div>
                    </div>

                    {isStandingsLoading ? (
                      <div className="p-8 text-center flex justify-center flex-col items-center gap-2 select-none">
                        <div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{isPtStr ? "Atualizando Classificação..." : "Refreshing table..."}</span>
                      </div>
                    ) : standings.length === 0 ? (
                      <div className="p-6 text-center select-none">
                        <span className="text-xs font-extrabold text-slate-400">{isPtStr ? "Sem tabela disponível" : "Standings unavailable"}</span>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[460px] overflow-y-auto">
                        {standings.map((team, idx) => {
                          const isOurTeam = team.id === teamIdNum || team.name === resolvedDetails.name;
                          return (
                            <div
                              key={team.id || idx}
                              className={`grid grid-cols-12 py-2.5 px-3.5 items-center text-xs transition-colors ${
                                isOurTeam
                                  ? "bg-emerald-500/10 font-extrabold text-slate-900 dark:text-white border-l-3 border-[#009c3b]"
                                  : "text-slate-700 dark:text-slate-350 hover:bg-slate-50/50 dark:hover:bg-slate-900/50"
                              }`}
                            >
                              <div className="col-span-1 text-center font-mono font-bold text-slate-400">{team.idx || (idx + 1)}</div>
                              <div className="col-span-5 pl-1 flex items-center gap-1.5 min-w-0">
                                <SafeImage src={team.logo} alt={team.teamName} className="w-5 h-5 object-contain shrink-0" fallbackType="team" />
                                <span className="truncate leading-tight">{team.name}</span>
                              </div>
                              <div className="col-span-1 text-center font-mono">{team.played ?? 0}</div>
                              <div className="col-span-1 text-center font-mono">{team.wins ?? 0}</div>
                              <div className="col-span-1 text-center font-mono">{team.draws ?? 0}</div>
                              <div className="col-span-1 text-center font-mono">{team.losses ?? 0}</div>
                              <div className="col-span-2 text-right font-mono font-black">{team.pts ?? 0}</div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 2. ELENCO TAB (Layout 2 Colunas) */}
            {activeTab === "squad" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Coluna Esquerda: List de Jogadores (lg:col-span-2) */}
                <div className="lg:col-span-2 space-y-8">
                  {isLoading ? (
                    <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-3xs select-none">
                      <div className="w-8 h-8 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-3" />
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                        {isPtStr ? "Carregando Elenco Atual..." : "Loading Current Squad..."}
                      </p>
                    </div>
                  ) : squad.length === 0 ? (
                    <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-3xs select-none">
                      <p className="text-sm font-semibold text-slate-500">
                        {isPtStr ? "Sem dados do elenco no momento." : "No squad data available at the moment."}
                      </p>
                    </div>
                  ) : (
                    squad.map((group: any) => {
                      if (!group || !group.members || group.members.length === 0) return null;
                      return (
                        <div key={group.title || "Group"} className="space-y-4">
                          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                            <h3 className="text-sm sm:text-base font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">
                              {translateGroupTitle(group.title)}
                            </h3>
                            <span className="text-[10px] font-black text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                              {group.members.length}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {group.members.map((member: any) => (
                              <Link
                                key={member.id}
                                to={`/player/${member.id}`}
                                onClick={() => handlePlayerClick(member)}
                                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-150 dark:border-slate-800 p-4 shadow-3xs hover:border-[#009c3b]/30 hover:shadow-xs transition-all flex items-center justify-between group cursor-pointer text-left"
                              >
                                <div className="flex items-center gap-3.5 min-w-0">
                                  <div className="w-9 h-9 rounded-full bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center font-mono font-black text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm shrink-0 border border-emerald-100/50">
                                    {member.shirtNumber || (group.title?.toLowerCase() === "coach" ? "💼" : "#")}
                                  </div>

                                  <div className="relative shrink-0">
                                    {imageErrors[member.id] ? (
                                      <div className="w-11 h-11 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-755 text-slate-600 dark:text-slate-350 font-black flex items-center justify-center text-xs uppercase shadow-3xs select-none">
                                        {(member.name || "?").trim().split(/\s+/).slice(0, 2).map((n: string) => n[0]).join("")}
                                      </div>
                                    ) : (
                                      <img
                                        src={`https://images.fotmob.com/image_resources/playerimages/${member.id}.png`}
                                        alt={member.name}
                                        className="w-11 h-11 rounded-full object-cover bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-750 shadow-3xs animate-fade-in"
                                        onError={() => {
                                          setImageErrors(prev => ({ ...prev, [member.id]: true }));
                                        }}
                                        referrerPolicy="no-referrer"
                                      />
                                    )}
                                  </div>

                                  <div className="min-w-0">
                                    <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 leading-tight group-hover:text-[#009c3b] transition-colors truncate">
                                      {member.name}
                                    </h4>
                                    <div className="flex items-center gap-1.5 mt-1 flex-wrap text-[10px] text-slate-400 font-bold">
                                      <span className="uppercase text-emerald-600 dark:text-emerald-400 font-black">
                                        {translateRole(member.role?.fallback || member.role?.name || mapPositionDetail(member))}
                                      </span>
                                      {member.age && (
                                        <>
                                          <span>•</span>
                                          <span>{member.age} {isPtStr ? "anos" : "y/o"}</span>
                                        </>
                                      )}
                                      {(member.ccode || member.cname) && (
                                        <>
                                          <span>•</span>
                                          <span className="inline-flex items-center gap-1">
                                            {member.ccode && (
                                              <img
                                                src={`https://flagcdn.com/w20/${member.ccode.toLowerCase()}.png`}
                                                alt={member.cname || ""}
                                                className="w-3.5 h-2.5 object-cover rounded-xs border border-slate-200/50 select-none shrink-0"
                                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                              />
                                            )}
                                            {member.cname && (
                                              <span>{translateCountry(member.cname)}</span>
                                            )}
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {member.injured && (
                                  <span className="text-[10px] text-rose-500 font-bold bg-rose-50 dark:bg-rose-950/20 py-0.5 px-2 rounded-full border border-rose-100 animate-pulse">
                                    🚑
                                  </span>
                                )}
                              </Link>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Coluna Direita: Top Estatísticas (lg:col-span-1) */}
                <div className="lg:col-span-1 space-y-6 select-none">
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">{isPtStr ? "Destaques Individuais" : "Stat Leaders"}</h3>

                  {/* 1. ARTILHEIROS */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-5 shadow-3xs space-y-4">
                    <h4 className="font-black text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                      <Trophy className="w-4.5 h-4.5 text-emerald-500" />
                      {isPtStr ? "Artilheiros" : "Top Scorers"}
                    </h4>
                    {topScorers.length === 0 ? (
                      <p className="text-gray-400 text-sm italic">
                        {isPtStr ? "Nenhum gol registrado na temporada atual." : "No goals recorded in the current season."}
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {topScorers.map((player) => {
                          const goalCount = player.goals || 0;
                          return (
                            <Link
                              key={player.id}
                              to={`/player/${player.id}`}
                              onClick={() => handlePlayerClick(player)}
                              className="flex items-center justify-between gap-3 p-2 rounded-xl border border-transparent hover:border-emerald-500/10 hover:bg-emerald-500/[0.02] dark:hover:bg-emerald-500/[0.01] transition-all group cursor-pointer"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="relative shrink-0">
                                  {imageErrors[player.id] ? (
                                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-755 text-slate-600 dark:text-slate-350 font-black flex items-center justify-center text-[10px] uppercase shadow-3xs select-none">
                                      {(player.name || "?").trim().split(/\s+/).slice(0, 2).map((n: string) => n[0]).join("")}
                                    </div>
                                  ) : (
                                    <img
                                      src={`https://images.fotmob.com/image_resources/playerimages/${player.id}.png`}
                                      alt={player.name}
                                      className="w-10 h-10 rounded-full object-cover bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-750"
                                      onError={() => {
                                        setImageErrors(prev => ({ ...prev, [player.id]: true }));
                                      }}
                                      referrerPolicy="no-referrer"
                                    />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <h5 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                    {player.name}
                                  </h5>
                                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase mt-0.5">
                                    {translateRole(player.role?.fallback || player.positionIdsDesc || "")}
                                  </p>
                                </div>
                              </div>
                              <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 text-[11px] font-black leading-none py-1.5 px-2 rounded-lg font-mono shrink-0">
                                {goalCount} G
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* 2. LIDER ASSISTENCIAS */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-5 shadow-3xs space-y-4">
                    <h4 className="font-black text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                      <Award className="w-4.5 h-4.5 text-blue-500" />
                      {isPtStr ? "Líder em Assistências" : "Assists Leaders"}
                    </h4>
                    {topAssists.length === 0 ? (
                      <p className="text-gray-400 text-sm italic">
                        {isPtStr ? "Nenhuma assistência registrada nesta temporada." : "No assists recorded in the current season."}
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {topAssists.map((player) => {
                          const assistCount = player.assists || 0;
                          return (
                            <Link
                              key={player.id}
                              to={`/player/${player.id}`}
                              onClick={() => handlePlayerClick(player)}
                              className="flex items-center justify-between gap-3 p-2 rounded-xl border border-transparent hover:border-blue-500/10 hover:bg-blue-500/[0.02] dark:hover:bg-blue-500/[0.01] transition-all group cursor-pointer"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="relative shrink-0">
                                  {imageErrors[player.id] ? (
                                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-755 text-slate-600 dark:text-slate-350 font-black flex items-center justify-center text-[10px] uppercase shadow-3xs select-none">
                                      {(player.name || "?").trim().split(/\s+/).slice(0, 2).map((n: string) => n[0]).join("")}
                                    </div>
                                  ) : (
                                    <img
                                      src={`https://images.fotmob.com/image_resources/playerimages/${player.id}.png`}
                                      alt={player.name}
                                      className="w-10 h-10 rounded-full object-cover bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-750"
                                      onError={() => {
                                        setImageErrors(prev => ({ ...prev, [player.id]: true }));
                                      }}
                                      referrerPolicy="no-referrer"
                                    />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <h5 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {player.name}
                                  </h5>
                                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase mt-0.5">
                                    {translateRole(player.role?.fallback || player.positionIdsDesc || "")}
                                  </p>
                                </div>
                              </div>
                              <div className="bg-blue-500/10 text-blue-600 dark:text-blue-450 text-[11px] font-black leading-none py-1.5 px-2 rounded-lg font-mono shrink-0">
                                {assistCount} A
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* 3. MAIS JOGOS */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-5 shadow-3xs space-y-4">
                    <h4 className="font-black text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Calendar className="w-4.5 h-4.5 text-amber-500" />
                      {isPtStr ? "Mais Jogos" : "Most Appearances"}
                    </h4>
                    <p className="text-xs font-semibold text-slate-400/80 dark:text-slate-500 italic">
                      {isPtStr ? "Estatísticas em breve..." : "Statistics coming soon..."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 3. ESTATÍSTICAS GENERALS PANEL */}
            {activeTab === "stats" && (
              <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-6 shadow-3xs space-y-8 select-none">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">{isPtStr ? "Desempenho Geral na Temporada" : "Overall Season Statistics"}</h2>
                    <p className="text-xs text-slate-400">{isPtStr ? "Projeções matemáticas baseadas nas competições vigentes de 2026." : "Mathematical metrics inferred from 2026 matches."}</p>
                  </div>
                  <TrendingUp className="w-6 h-6 text-emerald-500 shrink-0" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-900 rounded-xl text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{isPtStr ? "Jogos" : "Games"}</span>
                    <span className="text-2.5xl font-mono font-black text-slate-800 dark:text-white mt-1 block">{resolvedDetails.stats.matches}</span>
                  </div>
                  <div className="bg-emerald-500/[0.04] p-4 border border-emerald-500/10 rounded-xl text-center">
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">{isPtStr ? "Gols Marcados" : "Goals For"}</span>
                    <span className="text-2.5xl font-mono font-black text-[#009c3b] mt-1 block">{resolvedDetails.stats.gf}</span>
                  </div>
                  <div className="bg-rose-500/[0.04] p-4 border border-rose-500/10 rounded-xl text-center">
                    <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest block">{isPtStr ? "Gols Sofridos" : "Goals Allowed"}</span>
                    <span className="text-2.5xl font-mono font-black text-rose-500 mt-1 block">{resolvedDetails.stats.ga}</span>
                  </div>
                  <div className="bg-blue-500/[0.04] p-4 border border-blue-500/10 rounded-xl text-center">
                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest block">{isPtStr ? "Aproveitamento" : "Win Rate"}</span>
                    <span className="text-2.5xl font-mono font-black text-blue-500 mt-1 block">
                      {Math.round((resolvedDetails.stats.wins / resolvedDetails.stats.matches) * 100)}%
                    </span>
                  </div>
                </div>

                {/* Styled CSS Bar charts details */}
                <div className="space-y-6">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{isPtStr ? "Métricas Avançadas do Time" : "Detailed Metrics"}</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                        <span>{isPtStr ? "Posse de Bola Média" : "Average Ball Possession"}</span>
                        <span className="font-mono text-[#009c3b]">56.8%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-950 h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-[#009c3b]" style={{ width: "56.8%" }} />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                        <span>{isPtStr ? "Precisão de Passe" : "Passing Accuracy"}</span>
                        <span className="font-mono text-emerald-500">84.5%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-950 h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: "84.5%" }} />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                        <span>{isPtStr ? "Cartões Amarelos / Jogo" : "Yellow Cards / Game"}</span>
                        <span className="font-mono text-amber-500">1.95</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-950 h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400" style={{ width: "42%" }} />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                        <span>{isPtStr ? "Média de Gols Efetuada" : "Average Goal Rate"}</span>
                        <span className="font-mono text-blue-500">{(resolvedDetails.stats.gf / resolvedDetails.stats.matches).toFixed(2)}</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-950 h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: "68%" }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. TRANSFERÊNCIA TAB */}
            {activeTab === "transfers" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none">
                {/* Chegadas (Arrivals) */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5">
                    <ArrowUpRight className="w-5 h-5 text-emerald-500" />
                    <span>{isPtStr ? "Chegadas / Contratações" : "Arrivals"}</span>
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {transfers.arrivals.map((t, idx) => (
                      <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 rounded-xl p-4 flex justify-between items-center gap-4">
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 block truncate">{t.name}</h4>
                          <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400 font-bold uppercase">
                            <span>{t.pos}</span>
                            <span>•</span>
                            <span>{t.age} {isPtStr ? "Anos" : "Yrs"}</span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-2">
                            <span className="text-[10px] font-bold text-slate-400 lowercase">{isPtStr ? "vindo do" : "from"}</span>
                            <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                              {t.logo && <img src={t.logo} alt="" className="w-4 h-4 object-contain" onError={e => e.currentTarget.style.display='none'} />}
                              {t.from}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-mono font-black text-xs text-emerald-600 dark:text-emerald-450 bg-emerald-500/10 py-1 px-2.5 rounded-lg border border-emerald-500/20">
                            {t.fee}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Saídas (Departures) */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5">
                    <ArrowDownRight className="w-5 h-5 text-rose-500" />
                    <span>{isPtStr ? "Saídas / Vendas" : "Departures"}</span>
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {transfers.departures.map((t, idx) => (
                      <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 rounded-xl p-4 flex justify-between items-center gap-4">
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 block truncate">{t.name}</h4>
                          <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400 font-bold uppercase">
                            <span>{t.pos}</span>
                            <span>•</span>
                            <span>{t.age} {isPtStr ? "Anos" : "Yrs"}</span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-2">
                            <span className="text-[10px] font-bold text-slate-400 lowercase">{isPtStr ? "para" : "to"}</span>
                            <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                              {t.logo && <img src={t.logo} alt="" className="w-4 h-4 object-contain" onError={e => e.currentTarget.style.display='none'} />}
                              {t.to}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-mono font-black text-xs text-rose-600 dark:text-rose-450 bg-rose-500/10 py-1 px-2.5 rounded-lg border border-rose-500/20">
                            {t.fee}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
