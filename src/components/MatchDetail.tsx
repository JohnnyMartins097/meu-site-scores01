import { useState, useEffect, useMemo } from "react";
import { X, MapPin, Shield, Calendar, Users, Award, Table, Sparkles, Tv, Star, RefreshCw, ChevronRight, Clock } from "lucide-react";
import { Match, MatchEvent } from "../types";
import { Language, translations } from "../i18n";
import { SafeImage } from "./SafeImage";
import { MatchTimeline } from "./MatchTimeline";
import { Link } from "react-router-dom";
import { getLeagueStandings } from "../api";

const ClockIcon = Clock;

const translateStat = (key: string): string => {
  const dict: Record<string, string> = {
    "Ball possession": "Posse de Bola",
    "Expected goals (xG)": "Gols Esperados (xG)",
    "Total shots": "Finalizações",
    "Shots on target": "Chutes no Gol",
    "Touches in opposition box": "Toques na Área Rival",
    "Big chances": "Grandes Chances",
    "Big chances missed": "Chances Desperdiçadas",
    "Accurate passes": "Passes Certos",
    "Yellow cards": "Cartões Amarelos",
    "Red cards": "Cartões Vermelhos",
    "Corners": "Escanteios",
    "Fouls committed": "Faltas Cometidas",
    "Offsides": "Impedimentos",
    "Top stats": "Principais Estatísticas",
    "Passes": "Passes",
    "Defence": "Defesa",
    "Duels": "Duelos"
  };
  return dict[key] || key;
};

interface MatchDetailProps {
  match: Match | null;
  onClose: () => void;
  isEmbedded?: boolean;
  language?: Language;
  favorites?: {
    leagues: number[];
    teams: string[];
    players: string[];
  };
  onToggleFavoriteTeam?: (teamName: string) => void;
  onToggleFavoritePlayer?: (playerName: string) => void;
  matches?: Match[];
}

export default function MatchDetail({ 
  match, 
  onClose, 
  isEmbedded = false, 
  language = "pt_br",
  favorites = { leagues: [], teams: [], players: [] },
  onToggleFavoriteTeam = () => {},
  onToggleFavoritePlayer = () => {},
  matches = []
}: MatchDetailProps) {
  const [activeTab, setActiveTab] = useState<"events" | "stats" | "lineups" | "h2h" | "standings">("stats");
  const [standings, setStandings] = useState<any[]>([]);
  const [loadingStandings, setLoadingStandings] = useState(false);
  const [errorStandings, setErrorStandings] = useState<string | null>(null);

  if (!match) return null;

  const t = translations[language] || translations.pt_br;
  const isPtStr = language.startsWith("pt");

  const targetLeagueId = match.league.id || match.league.parentLeagueId || 71;

  const [matchDetails, setMatchDetails] = useState<any>(null);
  const [matchScore, setMatchScore] = useState<any>(null);
  const [matchStatus, setMatchStatus] = useState<any>(null);
  const [matchLocation, setMatchLocation] = useState<any>(null);
  const [matchStats, setMatchStats] = useState<any>(null);
  const [matchReferee, setMatchReferee] = useState<any>(null);
  const [loadingPremium, setLoadingPremium] = useState(false);

  useEffect(() => {
    if (!match?.fixture?.id) return;

    let isMounted = true;
    setLoadingPremium(true);

    const matchId = match.fixture.id;

    const fetchAllData = async () => {
      try {
        const [
          detailsRes,
          scoreRes,
          statusRes,
          locationRes,
          statsRes,
          refereeRes
        ] = await Promise.all([
          fetch(`/api/football-get-match-detail?eventid=${matchId}`).then(r => r.ok ? r.json() : null).catch(() => null),
          fetch(`/api/football-get-match-score?eventid=${matchId}`).then(r => r.ok ? r.json() : null).catch(() => null),
          fetch(`/api/football-get-match-status?eventid=${matchId}`).then(r => r.ok ? r.json() : null).catch(() => null),
          fetch(`/api/football-get-match-location?eventid=${matchId}`).then(r => r.ok ? r.json() : null).catch(() => null),
          fetch(`/api/football-get-match-all-stats?eventid=${matchId}`).then(r => r.ok ? r.json() : null).catch(() => null),
          fetch(`/api/football-get-match-referee?eventid=${matchId}`).then(r => r.ok ? r.json() : null).catch(() => null)
        ]);

        if (!isMounted) return;

        const extractData = (res: any) => {
          if (!res) return null;
          return res.response || res.data?.response || res.data || res;
        };

        setMatchDetails(extractData(detailsRes));
        setMatchScore(extractData(scoreRes));
        setMatchStatus(extractData(statusRes));
        setMatchLocation(extractData(locationRes));
        setMatchStats(extractData(statsRes));
        setMatchReferee(extractData(refereeRes));
      } catch (err) {
        console.error("Error in premium multi-fetch:", err);
      } finally {
        if (isMounted) {
          setLoadingPremium(false);
        }
      }
    };

    fetchAllData();

    return () => {
      isMounted = false;
    };
  }, [match?.fixture?.id]);

  useEffect(() => {
    if (activeTab !== "standings") return;

    let isMounted = true;
    setLoadingStandings(true);
    setErrorStandings(null);

    const loadStandingsData = async () => {
      try {
        const rawList = await getLeagueStandings(targetLeagueId);
        if (!isMounted) return;

        if (!rawList || !Array.isArray(rawList) || rawList.length === 0) {
          setErrorStandings(isPtStr ? "Classificação indisponível de momento." : "Standings currently unavailable.");
          return;
        }

        // Flatten groups or custom nested list structures
        let rawRows: any[] = [];
        if (Array.isArray(rawList)) {
          if (rawList[0] && Array.isArray(rawList[0].rows)) {
            rawRows = rawList[0].rows;
          } else if (rawList[0] && Array.isArray(rawList[0].list)) {
            rawRows = rawList[0].list;
          } else {
            rawRows = rawList;
          }
        } else if (rawList && Array.isArray((rawList as any).rows)) {
          rawRows = (rawList as any).rows;
        } else if (rawList && Array.isArray((rawList as any).list)) {
          rawRows = (rawList as any).list;
        }

        if (rawRows.length === 0) {
          setErrorStandings(isPtStr ? "Classificação indisponível de momento." : "Standings currently unavailable.");
          return;
        }

        const parsed = rawRows.map((item: any, idx: number) => {
          const teamId = item.team?.id || item.teamId || item.id || (50000 + idx);
          const pos = item.position || item.pos || item.idx || (idx + 1);
          const teamName = item.team?.name || item.team?.shortName || item.teamName || item.name || "";
          const teamLogo = teamId ? `https://images.fotmob.com/image_resources/logo/teamlogo/${teamId}.png` : '/fallback-shield.png';
          const played = item.matches ?? item.played ?? ((item.win || 0) + (item.draw || 0) + (item.loss || 0));
          const wins = item.win ?? item.wins ?? 0;
          const draws = item.draw ?? item.draws ?? 0;
          const losses = item.loss ?? item.losses ?? item.lose ?? 0;
          const gf = item.scoresFor ?? item.gf ?? item.goalsFor ?? 0;
          const ga = item.scoresAgainst ?? item.ga ?? item.goalsAgainst ?? 0;
          const gd = item.goalDifference ?? item.gd ?? (gf - ga);
          const pts = item.points ?? item.pts ?? 0;

          return {
            id: teamId,
            idx: pos,
            name: teamName,
            logo: teamLogo,
            played,
            wins,
            draws,
            losses,
            goalConDiff: gd,
            pts
          };
        });

        if (isMounted) {
          setStandings(parsed);
        }
      } catch (err) {
        console.error("Error loading standings inside MatchDetail:", err);
        if (isMounted) {
          setErrorStandings(isPtStr ? "Classificação indisponível de momento." : "Standings currently unavailable.");
        }
      } finally {
        if (isMounted) {
          setLoadingStandings(false);
        }
      }
    };

    loadStandingsData();

    return () => {
      isMounted = false;
    };
  }, [activeTab, targetLeagueId, isPtStr]);

  const statusObj = matchStatus?.status || matchStatus;
  const isFinished = statusObj?.finished || statusObj?.cancelled || match.fixture.status.short === "FT";
  const liveTime = statusObj?.liveTime?.short || statusObj?.reason?.short || match.fixture.status.elapsed;
  // Se a API diz que começou, OU se já existe um placar (scoreStr) diferente de vazio/nulo, assumimos que está a rolar!
  const hasScore = !!statusObj?.scoreStr; 
  const isLive = (statusObj?.started || hasScore || ["1H", "2H", "HT", "ET", "BT", "P", "SUSP", "INT"].includes(match.fixture.status.short)) && !isFinished;

  let badgeText = "AGENDADO";
  let badgeClass = "bg-gray-800 text-white"; // Estilo Agendado

  if (isFinished) {
    badgeText = "ENCERRADO";
    badgeClass = "bg-[#ffdf00] text-slate-900 font-bold";
  } else if (isLive) {
    badgeText = liveTime ? `AO VIVO • ${liveTime}'` : "AO VIVO";
    badgeClass = "bg-red-600 text-white font-bold animate-pulse";
  }

  const apiStatsList = matchStats?.stats?.[0]?.stats || matchStats?.stats || matchStats?.statistics || null;
  const hasApiStats = Array.isArray(apiStatsList) && apiStatsList.length > 0;

  const homeTeam = match.teams.home;
  const awayTeam = match.teams.away;

  // Format date correctly based on selected language
  let localeStr = "pt-BR";
  if (language === "pt_pt") localeStr = "pt-PT";
  else if (language === "en") localeStr = "en-US";
  else if (language === "es") localeStr = "es-ES";
  else if (language === "fr") localeStr = "fr-FR";
  else if (language === "it") localeStr = "it-IT";
  else if (language === "de") localeStr = "de-DE";

  const dateFormatted = new Date(match.fixture.date).toLocaleDateString(localeStr, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const events: MatchEvent[] = match.events || [];
  const statistics = match.statistics || [];
  const lineups = match.lineups || [];

  const getLocalizedEventType = (type: string) => {
    if (type === "Goal") return isPtStr ? "⚽ GOL" : "⚽ GOAL";
    if (type === "Card") return isPtStr ? "🟨 CARTÃO" : "🟨 CARD";
    return isPtStr ? "🔄 SUBSTITUIÇÃO" : "🔄 SUB";
  };

  const getLocalizedEventDetail = (detail: string) => {
    if (!detail) return "";
    const lower = detail.toLowerCase().trim();
    if (lower === "normal goal") return isPtStr ? "Gol Normal" : "Normal Goal";
    if (lower === "penalty" || lower === "penalty goal" || lower === "penalty kick") return isPtStr ? "Golo de Pênalti" : "Penalty Goal";
    if (lower === "own goal") return isPtStr ? "Gol Contra" : "Own Goal";
    if (lower === "yellow card") return isPtStr ? "Cartão Amarelo" : "Yellow Card";
    if (lower === "red card") return isPtStr ? "Cartão Vermelho" : "Red Card";
    if (lower === "substitution") return isPtStr ? "Substituição" : "Substitution";
    return detail;
  };

  const getLocalizedPosition = (pos: string) => {
    if (!pos) return "";
    const p = pos.toUpperCase().trim();
    const isPt = language === "pt_br" || language === "pt_pt";
    if (p === "G" || p === "GK" || p === "GOALKEEPER") return isPt ? "GOL" : "GK";
    if (p === "D" || p === "DF" || p === "DEFENDER") return isPt ? "DEF" : "DF";
    if (p === "M" || p === "MF" || p === "MIDFIELDER") return isPt ? "MEI" : "MF";
    if (p === "F" || p === "FW" || p === "A" || p === "ATTACKER") return isPt ? "ATA" : "FW";
    return pos;
  };

  const getLocalizedStatType = (type: string) => {
    const dict: Record<string, Record<Language, string>> = {
      "shots on goal": { pt_br: "Chutes no Gol", pt_pt: "Remates à Baliza", en: "Shots on Goal", es: "Tiros al Arco", fr: "Tirs Cadrés", it: "Tiri in Porta", de: "Torschüsse" },
      "shots off goal": { pt_br: "Chutes para Fora", pt_pt: "Remates para Fora", en: "Shots off Goal", es: "Tiros desviados", fr: "Tirs non Cadrés", it: "Tiri Fuori", de: "Schüsse daneben" },
      "total shots": { pt_br: "Total de Chutes", pt_pt: "Total de Remates", en: "Total Shots", es: "Total de Tiros", fr: "Total des Tirs", it: "Tiri Totali", de: "Schüsse insgesamt" },
      "blocked shots": { pt_br: "Chutes Bloqueados", pt_pt: "Remates Bloqueados", en: "Blocked Shots", es: "Remates Bloqueados", fr: "Tirs Contrés", it: "Tiri Bloccati", de: "Geblockte Schüsse" },
      "shots insidebox": { pt_br: "Chutes de Dentro da Área", pt_pt: "Remates de Dentro da Área", en: "Shots Inside Box", es: "Tiros dentro del área", fr: "Tirs dans la Surface", it: "Tiri in Area", de: "Schuss aus dem Strafraum" },
      "shots inside box": { pt_br: "Chutes de Dentro da Área", pt_pt: "Remates de Dentro da Área", en: "Shots Inside Box", es: "Tiros dentro del área", fr: "Tirs dans la Surface", it: "Tiri in Area", de: "Schuss aus dem Strafraum" },
      "shots outsidebox": { pt_br: "Chutes de Fora da Área", pt_pt: "Remates de Fora da Área", en: "Shots Outside Box", es: "Tiros fuera del área", fr: "Tirs hors de la Surface", it: "Tiri da Fuori Area", de: "Schuss von außerhalb" },
      "shots outside box": { pt_br: "Chutes de Fora da Área", pt_pt: "Remates de Fora da Área", en: "Shots Outside Box", es: "Tiros fuera del área", fr: "Tirs hors de la Surface", it: "Tiri da Fuori Area", de: "Schuss von außerhalb" },
      "fouls": { pt_br: "Faltas", pt_pt: "Faltas", en: "Fouls", es: "Faltas", fr: "Fautes", it: "Falli", de: "Fouls" },
      "corner kicks": { pt_br: "Escanteios", pt_pt: "Pontos de Canto", en: "Corner Kicks", es: "Tiros de Esquina", fr: "Corners", it: "Calci d'Angolo", de: "Eckbälle" },
      "corners": { pt_br: "Escanteios", pt_pt: "Pontos de Canto", en: "Corner Kicks", es: "Tiros de Esquina", fr: "Corners", it: "Calci d'Angolo", de: "Eckbälle" },
      "offsides": { pt_br: "Impedimentos", pt_pt: "Foras de Jogo", en: "Offsides", es: "Fueras de Juego", fr: "Hors-jeux", it: "Fuorigioco", de: "Abseits" },
      "offside": { pt_br: "Impedimento", pt_pt: "Fora de Jogo", en: "Offside", es: "Fuera de Juego", fr: "Hors-jeu", it: "Fuorigioco", de: "Abseits" },
      "ball possession": { pt_br: "Posse de Bola", pt_pt: "Posse de Bola", en: "Ball Possession", es: "Posesión de Balón", fr: "Possession de Balle", it: "Possesso Palla", de: "Ballbesitz" },
      "possession": { pt_br: "Posse de Bola", pt_pt: "Posse de Bola", en: "Ball Possession", es: "Posesión de Balón", fr: "Possession de Balle", it: "Possesso Palla", de: "Ballbesitz" },
      "yellow cards": { pt_br: "Cartões Amarelos", pt_pt: "Cartões Amarelos", en: "Yellow Cards", es: "Tarjetas Amarillas", fr: "Cartons Jaunes", it: "Cartellini Gialli", de: "Gelbe Karten" },
      "yellow card": { pt_br: "Cartão Amarelo", pt_pt: "Cartão Amarelo", en: "Yellow Card", es: "Tarjeta Amarilla", fr: "Carton Jaune", it: "Cartellino Giallo", de: "Gelbe Karte" },
      "red cards": { pt_br: "Cartões Vermelhos", pt_pt: "Cartões Vermelhos", en: "Red Cards", es: "Tarjetas Rojas", fr: "Cartons Rouges", it: "Cartellini Rossi", de: "Rote Karten" },
      "red card": { pt_br: "Cartão Vermelho", pt_pt: "Cartão Vermelho", en: "Red Card", es: "Tarjeta Roja", fr: "Carton Rouge", it: "Cartellino Rosso", de: "Rote Karte" },
      "goalkeeper saves": { pt_br: "Defesas do Goleiro", pt_pt: "Defesas do Guarda-redes", en: "Goalkeeper Saves", es: "Atajadas del Portero", fr: "Arrêts du Gardien", it: "Parate del Portiere", de: "Torwartparaden" },
      "saves": { pt_br: "Defesas", pt_pt: "Defesas", en: "Saves", es: "Atajadas", fr: "Arrêts", it: "Parate", de: "Torwartparaden" },
      "total passes": { pt_br: "Total de Passes", pt_pt: "Total de Passes", en: "Total Passes", es: "Pases Totales", fr: "Total de Passes", it: "Passaggi Totali", de: "Pässe insgesamt" },
      "passes": { pt_br: "Passes", pt_pt: "Passes", en: "Passes", es: "Pases", fr: "Passes", it: "Passaggi", de: "Pässe" },
      "passes accurate": { pt_br: "Passes Certos", pt_pt: "Passes Certos", en: "Passes Accurate", es: "Pases Precisos", fr: "Passes Réussies", it: "Passaggi Azzeccati", de: "Erfolgreiche Pässe" },
      "accurate passes": { pt_br: "Passes Certos", pt_pt: "Passes Certos", en: "Passes Accurate", es: "Pases Precisos", fr: "Passes Réussies", it: "Passaggi Azzeccati", de: "Erfolgreiche Pässe" },
      "pass accuracy": { pt_br: "Precisão de Passes", pt_pt: "Precisão de Passes", en: "Pass Accuracy %", es: "Precisión de Pases", fr: "Précision des Passes", it: "Precisione Passaggi", de: "Passgenauigkeit" },
      "pass accuracy %": { pt_br: "Precisão de Passes", pt_pt: "Precisão de Passes", en: "Pass Accuracy %", es: "Precisión de Pases", fr: "Précision des Passes", it: "Precisione Passaggi", de: "Passgenauigkeit" },
      "passes %": { pt_br: "Precisão de Passes", pt_pt: "Precisão de Passes", en: "Pass Accuracy %", es: "Precisión de Pases", fr: "Précision des Passes", it: "Precisione Passaggi", de: "Passgenauigkeit" },
      "tackles": { pt_br: "Desarmes", pt_pt: "Desarmes", en: "Tackles", es: "Desarmes", fr: "Tacles", it: "Contrasti", de: "Tackles" },
      "duels won": { pt_br: "Duelos Ganhos", pt_pt: "Duelos Ganhos", en: "Duels Won", es: "Duels Ganados", fr: "Duels Gagnés", it: "Duelli Vinti", de: "Zweikämpfe gewonnen" },
      "aerials won": { pt_br: "Duelos Aéreos Ganhos", pt_pt: "Duelos Aéreos Ganhos", en: "Aerials Won", es: "Duelos Aéreos Ganados", fr: "Duels Aériens Gagnés", it: "Duelli Aerei Vinti", de: "Luftzweikämpfe gewonnen" }
    };
    const lookupKey = type ? type.toLowerCase().trim() : "";
    return dict[lookupKey]?.[language] || type;
  };

  const getOutcomeDetails = (m: Match, teamId: number) => {
    if (!m.goals || m.goals.home === null || m.goals.away === null) {
      return { char: "?", className: "bg-slate-350 dark:bg-slate-800 text-slate-500", scoreText: "-:-", oppTeam: "" };
    }
    const isHome = m.teams?.home?.id === teamId;
    const teamGoals = isHome ? m.goals.home : m.goals.away;
    const oppGoals = isHome ? m.goals.away : m.goals.home;
    const oppTeam = isHome ? m.teams?.away?.name || "" : m.teams?.home?.name || "";
    const scoreText = `${m.goals.home}-${m.goals.away}`;
    
    if (teamGoals > oppGoals) {
      return { char: isPtStr ? "V" : "W", className: "bg-emerald-500 text-white font-black", scoreText, oppTeam };
    }
    if (teamGoals < oppGoals) {
      return { char: isPtStr ? "D" : "L", className: "bg-rose-500 text-white font-black", scoreText, oppTeam };
    }
    return { char: isPtStr ? "E" : "D", className: "bg-slate-400 text-white font-black", scoreText, oppTeam };
  };

  // Premium central definitions and resolving
  const resolvedScoresList = matchScore?.scores || matchScore?.list || matchScore?.allScores || null;
  const resolvedHomeName = resolvedScoresList?.[0]?.name || resolvedScoresList?.[0]?.team?.name || homeTeam.name;
  const resolvedAwayName = resolvedScoresList?.[1]?.name || resolvedScoresList?.[1]?.team?.name || awayTeam.name;
  const resolvedHomeLogo = resolvedScoresList?.[0]?.logo || resolvedScoresList?.[0]?.team?.logo || homeTeam.logo;
  const resolvedAwayLogo = resolvedScoresList?.[1]?.logo || resolvedScoresList?.[1]?.team?.logo || awayTeam.logo;
  const resolvedHomeScore = typeof resolvedScoresList?.[0]?.score !== "undefined" ? resolvedScoresList[0].score : match.goals.home ?? 0;
  const resolvedAwayScore = typeof resolvedScoresList?.[1]?.score !== "undefined" ? resolvedScoresList[1].score : match.goals.away ?? 0;

  const resolvedScoreStr = matchStatus?.scoreStr || matchStatus?.score_str || `${resolvedHomeScore} - ${resolvedAwayScore}`;
  const resolvedPenaltyLong = matchStatus?.reason?.long || matchStatus?.penaltyReason || (match.fixture.status.short === "PEN" ? (isPtStr ? "Decidido através de grandes penalidades" : "Decided after penalty shootout") : null);

  const resolvedLocationName = matchLocation?.name || matchLocation?.stadiumName || match.fixture.venue?.name || (isPtStr ? "Estádio Principal" : "First Stadium");
  const resolvedLocationCity = matchLocation?.city || matchLocation?.stadiumCity || match.fixture.venue?.city || (isPtStr ? "Cidade Sede" : "Host City");

  const resolvedRefereeText = matchReferee?.text || matchReferee?.name || match.fixture.referee || (isPtStr ? "Equipa de Arbitragem Oficial" : "Official Match Officials");
  const resolvedRefereeCountry = matchReferee?.countryCode || matchReferee?.ccode || "BR";

  const resolvedStatistics = useMemo(() => {
    // Check if we received API stats
    const apiStatsGroup = matchStats?.stats?.[0]?.stats || matchStats?.stats || matchStats?.statistics || null;
    if (apiStatsGroup && Array.isArray(apiStatsGroup)) {
      return apiStatsGroup.map((item: any) => {
        const title = item.title || item.name || getLocalizedStatType(item.type) || "";
        const homeValRaw = typeof item.homeValue !== "undefined" ? item.homeValue : (item.home || item.valueHome || 0);
        const awayValRaw = typeof item.awayValue !== "undefined" ? item.awayValue : (item.away || item.valueAway || 0);
        let highlighted = item.highlighted || "";
        if (!highlighted) {
          const homeN = parseFloat(String(homeValRaw).replace(/%/g, "")) || 0;
          const awayN = parseFloat(String(awayValRaw).replace(/%/g, "")) || 0;
          highlighted = homeN > awayN ? "home" : awayN > homeN ? "away" : "equal";
        }

        return {
          title,
          homeValue: homeValRaw,
          awayValue: awayValRaw,
          highlighted
        };
      });
    }

    // fallback mapping if API did not load yet or failed
    if (statistics && statistics.length >= 2 && Array.isArray(statistics[0]?.statistics)) {
      return statistics[0].statistics.map((stat: any, idx: number) => {
        const type = stat.type;
        const homeValRaw = stat.value ?? 0;
        const awayValRaw = statistics[1]?.statistics?.[idx]?.value ?? 0;

        const parseVal = (v: any) => {
          if (!v) return 0;
          if (typeof v === "string") {
            return parseFloat(v.replace("%", "")) || 0;
          }
          return parseFloat(v) || 0;
        };

        const homeN = parseVal(homeValRaw);
        const awayN = parseVal(awayValRaw);

        const highlighted = homeN > awayN ? "home" : awayN > homeN ? "away" : "equal";

        return {
          title: getLocalizedStatType(type),
          homeValue: homeValRaw,
          awayValue: awayValRaw,
          highlighted
        };
      });
    }

    // Default beautiful mock stats
    return [
      { title: isPtStr ? "Posse de Bola" : "Ball Possession", homeValue: "52%", awayValue: "48%", highlighted: "home" },
      { title: isPtStr ? "Total de Chutes" : "Total Shots", homeValue: 14, awayValue: 11, highlighted: "home" },
      { title: isPtStr ? "Chutes no Gol" : "Shots on Goal", homeValue: 6, awayValue: 5, highlighted: "home" },
      { title: isPtStr ? "Faltas" : "Fouls", homeValue: 12, awayValue: 14, highlighted: "away" },
      { title: isPtStr ? "Escanteios" : "Corner Kicks", homeValue: 5, awayValue: 4, highlighted: "home" },
      { title: isPtStr ? "Cartões Amarelos" : "Yellow Cards", homeValue: 2, awayValue: 3, highlighted: "away" }
    ];
  }, [matchStats, statistics, isPtStr]);

  const innerContent = (
    <div className={`relative w-full bg-white dark:bg-slate-950 h-full flex flex-col ${isEmbedded ? 'rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs' : 'shadow-2xl z-10'}`}>
      {/* Header section with match overall score */}
      <div className="bg-[#009c3b] border-b border-emerald-800 text-white p-5 relative shadow-md">
        {!isEmbedded && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/35 hover:bg-black/55 p-2 rounded-full transition-all cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* League Link */}
        <div className="flex items-center gap-2 mb-4 select-none flex-wrap">
          {match.league.flag && (
            <SafeImage
              src={match.league.flag}
              alt={match.league.country}
              className="w-5 h-3.5 object-cover rounded-xs shrink-0"
              fallbackType="flag"
            />
          )}
          <SafeImage
            src={match.league.logo}
            alt={match.league.name}
            className="w-5 h-5 object-contain bg-white/20 p-0.5 rounded-md shrink-0 border border-white/10"
            fallbackType="league"
          />
          <Link 
            to={`/league/${match.league.id}`}
            className="text-xs font-semibold uppercase tracking-wider text-[#ffdf00] hover:underline flex items-center gap-1"
          >
            <span>{match.league.country} • {match.league.name}</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Visual scoreboard inside detail */}
        <div className="grid grid-cols-7 items-center justify-center gap-2 my-2 py-2">
          {/* Home team */}
          <div className="col-span-3 flex flex-col items-center text-center">
            <Link to={`/team/${homeTeam.id}`} className="hover:scale-105 transition-all">
              <SafeImage
                src={resolvedHomeLogo}
                alt={resolvedHomeName}
                className="w-14 h-14 object-contain bg-white/10 dark:bg-black/20 p-1.5 rounded-lg mb-2"
                fallbackType="team"
              />
            </Link>
            <div className="flex items-center gap-1.5 justify-center max-w-full">
              <Link to={`/team/${homeTeam.id}`} className="font-bold text-sm line-clamp-2 leading-tight hover:underline">
                {resolvedHomeName}
              </Link>
              <button 
                onClick={() => onToggleFavoriteTeam?.(resolvedHomeName)}
                className="p-1 hover:bg-white/10 rounded-full transition-all focus:outline-none cursor-pointer scale-90 hover:scale-105 shrink-0"
                title="Favoritar Time"
              >
                <Star 
                  className={`w-4 h-4 ${
                    favorites?.teams?.includes(resolvedHomeName) 
                      ? "fill-amber-400 text-amber-400 stroke-[2.5]" 
                      : "text-white/60 hover:text-white"
                  }`} 
                />
              </button>
            </div>
          </div>

          {/* Score in between */}
          <div className="col-span-1 flex flex-col items-center justify-center text-center relative">
            <div className="text-3xl font-mono font-black tracking-tight select-none bg-black/45 px-4 py-2 rounded-lg border border-white/10 shadow-inner flex flex-row items-center justify-center gap-3 whitespace-nowrap">
              {resolvedScoreStr}
            </div>
            {resolvedPenaltyLong && (
              <span className="absolute top-12 bg-red-650 text-[10px] font-bold px-2 py-0.5 rounded-full select-none shadow-xs border border-red-500/30 whitespace-nowrap z-20">
                {resolvedPenaltyLong}
              </span>
            )}
          </div>

          {/* Away team */}
          <div className="col-span-3 flex flex-col items-center text-center">
            <Link to={`/team/${awayTeam.id}`} className="hover:scale-105 transition-all">
              <SafeImage
                src={resolvedAwayLogo}
                alt={resolvedAwayName}
                className="w-14 h-14 object-contain bg-white/10 dark:bg-black/20 p-1.5 rounded-lg mb-2"
                fallbackType="team"
              />
            </Link>
            <div className="flex items-center gap-1.5 justify-center max-w-full">
              <Link to={`/team/${awayTeam.id}`} className="font-bold text-sm line-clamp-2 leading-tight hover:underline">
                {resolvedAwayName}
              </Link>
              <button 
                onClick={() => onToggleFavoriteTeam?.(resolvedAwayName)}
                className="p-1 hover:bg-white/10 rounded-full transition-all focus:outline-none cursor-pointer scale-90 hover:scale-105 shrink-0"
                title="Favoritar Time"
              >
                <Star 
                  className={`w-4 h-4 ${
                    favorites?.teams?.includes(resolvedAwayName) 
                      ? "fill-amber-400 text-amber-400 stroke-[2.5]" 
                      : "text-white/60 hover:text-white"
                  }`} 
                />
              </button>
            </div>
          </div>
        </div>

        {/* Status badge */}
        <div className="text-center mt-4">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 font-mono text-xs rounded-full uppercase tracking-wider shadow-sm select-none ${badgeClass}`}>
            {isLive && badgeText.includes("AO VIVO") && <span className="w-2 h-2 rounded-full bg-white live-pulse-icon" />}
            {badgeText}
          </span>
        </div>

        {/* Header Footer (Estádio e Árbitro) */}
        {(matchLocation?.name || matchReferee?.text) && (
          <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-white/75 select-none font-medium">
            {matchLocation?.name && (
              <div className="flex items-center gap-1 bg-white/5 hover:bg-white/10 transition-all rounded-xs px-2 py-0.5">
                <span className="opacity-90">🏟️</span>
                <span>{matchLocation.name}{matchLocation.city ? `, ${matchLocation.city}` : ''}</span>
              </div>
            )}
            {matchLocation?.name && matchReferee?.text && (
              <div className="w-1.5 h-1.5 rounded-full bg-white/20 hidden sm:block" />
            )}
            {matchReferee?.text && (
              <div className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 transition-all rounded-xs px-2 py-0.5">
                <span className="opacity-90">👤</span>
                <span>{matchReferee.text}</span>
                {resolvedRefereeCountry && (
                  <img 
                    src={`https://media.api-sports.io/flags/${resolvedRefereeCountry.toLowerCase()}.svg`} 
                    alt={resolvedRefereeCountry} 
                    className="w-3.5 h-2.5 object-cover rounded-xs border border-white/10"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tab Selector */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 select-none overflow-x-auto text-xs sm:text-sm">
        <button
          onClick={() => setActiveTab("stats")}
          className={`flex-1 py-3 text-center font-semibold transition-all border-b-2 cursor-pointer shrink-0 px-3 ${
            activeTab === "stats"
              ? "border-[#009c3b] text-[#009c3b] bg-white dark:bg-slate-905 font-extrabold"
              : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          }`}
        >
          {t.statsTab}
        </button>
        <button
          onClick={() => setActiveTab("lineups")}
          className={`flex-1 py-3 text-center font-semibold transition-all border-b-2 cursor-pointer shrink-0 px-3 ${
            activeTab === "lineups"
              ? "border-[#009c3b] text-[#009c3b] bg-white dark:bg-slate-905 font-extrabold"
              : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          }`}
        >
          {t.lineupsTab}
        </button>
        <button
          onClick={() => setActiveTab("standings")}
          className={`flex-1 py-3 text-center font-semibold transition-all border-b-2 cursor-pointer shrink-0 px-3 ${
            activeTab === "standings"
              ? "border-[#009c3b] text-[#009c3b] bg-white dark:bg-slate-905 font-extrabold"
              : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          }`}
        >
          {isPtStr ? "Classificação" : "Standings"}
        </button>
        <button
          onClick={() => setActiveTab("h2h")}
          className={`flex-1 py-3 text-center font-semibold transition-all border-b-2 cursor-pointer shrink-0 px-3 ${
            activeTab === "h2h"
              ? "border-[#009c3b] text-[#009c3b] bg-white dark:bg-slate-905 font-extrabold"
              : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          }`}
        >
          H2H
        </button>
      </div>

      {/* Scrollable body content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 select-text">

        {/* TAB 1: EVENTS / TIMELINE + PRE-MATCH INFO */}
        {activeTab === "events" && (
          <div className="space-y-6">
            {/* Events Timeline First */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">{isPtStr ? "Cronologia do Jogo" : "Timeline"}</h4>
              {events.length === 0 ? (
                <MatchTimeline />
              ) : (
                <div className="relative border-l border-slate-200/80 dark:border-slate-800/80 ml-4 pl-6 space-y-4">
                  {[...events]
                    .sort((a, b) => {
                      const aTime = a.time?.elapsed || 0;
                      const bTime = b.time?.elapsed || 0;
                      return bTime - aTime;
                    })
                    .map((evt, idx) => {
                      const recordTeamId = evt.team?.id || 0;
                      const isHome = recordTeamId === homeTeam.id;
                      const isGoal = evt.type === "Goal";
                      const isCard = evt.type === "Card";
                      const isSub = evt.type === "Subst" || evt.type === "Substitution";
                      const playerDisplayName = evt.player?.name || (isPtStr ? "Jogador" : "Player");

                      return (
                        <div key={idx} className="relative group">
                          {/* Circle on timeline border */}
                          <span className={`absolute -left-[30px] top-1.5 rounded-full w-3 h-3 flex items-center justify-center border-2 bg-white dark:bg-slate-950 transition-colors ${
                            isGoal ? "border-emerald-500 shadow-xs" : isCard ? "border-amber-400" : "border-slate-300"
                          }`} />

                          {/* Professional timeline card */}
                          <div className={`p-3 rounded-xl border transition-all ${
                            isGoal 
                              ? "bg-emerald-50/20 dark:bg-emerald-950/15 border-emerald-100/30 dark:border-emerald-900/40" 
                              : isCard 
                                ? "bg-amber-50/10 dark:bg-amber-950/10 border-amber-100/20" 
                                : "bg-white dark:bg-slate-905 border-slate-100 dark:border-slate-800/80"
                          }`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-black text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md shrink-0">
                                  {evt.time?.elapsed || 0}'
                                </span>
                                <span className="text-[9px] font-black uppercase text-slate-400 select-none tracking-widest leading-none">
                                  {getLocalizedEventType(evt.type || "")}
                                </span>
                              </div>

                              <div className="flex items-center gap-1">
                                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-tight">{evt.team?.name || ""}</span>
                              </div>
                            </div>

                            {/* Athlete name with link support */}
                            <div className="mt-2.5 flex items-center justify-between gap-2">
                              <div>
                                <Link 
                                  to={`/player/${encodeURIComponent(playerDisplayName)}`}
                                  className="text-xs sm:text-sm font-black text-slate-850 dark:text-slate-150 hover:underline inline-flex items-center gap-1"
                                >
                                  <span>{playerDisplayName}</span>
                                </Link>
                                <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                                  {getLocalizedEventDetail(evt.detail || "")}{" "}
                                  {evt.assist?.name ? `(${t.assistLabel}: ${evt.assist.name})` : ""}
                                </p>
                              </div>

                              {/* Graphic indicator icons representing event */}
                              <div className="text-sm shrink-0 select-none">
                                {isGoal ? (
                                  <span className="text-lg drop-shadow-sm">⚽</span>
                                ) : isCard ? (
                                  <div className={`w-3 h-4 rounded-xs shadow-3xs ${
                                    (evt.detail || "").toLowerCase().includes("red") ? "bg-rose-650" : "bg-amber-400"
                                  }`} />
                                ) : (
                                  <span className="text-xs font-semibold bg-emerald-105 dark:bg-emerald-950 text-emerald-600 p-1 rounded-full px-2">🔄</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Informações Pré-Jogo Context at the BOTTOM of tab */}
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl p-4 space-y-4 shadow-2xs">
              <h3 className="text-xs font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider flex items-center gap-1.5 select-none leading-none">
                <Sparkles className="w-3.5 h-3.5 text-[#ffdf00]" />
                {isPtStr ? "Informações Extras" : "Extra Briefing"}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                {match.fixture?.referee && (
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-350">
                    <Award className="w-4 h-4 text-emerald-605 shrink-0" />
                    <span>
                      {isPtStr ? "Árbitro" : "Referee"}: <span className="font-bold text-slate-805 dark:text-slate-100">{match.fixture.referee}</span>
                    </span>
                  </div>
                )}
                {match.fixture?.venue?.name && (
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-350">
                    <MapPin className="w-4 h-4 text-emerald-605 shrink-0" />
                    <span>
                      {isPtStr ? "Estádio" : "Venue"}: <span className="font-bold text-slate-805 dark:text-slate-100">{match.fixture.venue.name} {match.fixture.venue.city ? `(${match.fixture.venue.city})` : ""}</span>
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-350">
                  <Calendar className="w-4 h-4 text-emerald-605 shrink-0" />
                  <span>
                    {isPtStr ? "Data/Hora" : "Schedule"}: <span className="font-bold text-slate-805 dark:text-slate-100">{dateFormatted}</span>
                  </span>
                </div>
                {match.broadcast && (
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-350">
                    <Tv className="w-4 h-4 text-emerald-605 shrink-0" />
                    <span>
                      {isPtStr ? "Transmissão" : "Broadcast"}: <span className="font-bold text-slate-805 dark:text-slate-100">{match.broadcast}</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Real historical Form / "Últimos jogos" section */}
              <div className="border-t border-slate-200/50 dark:border-slate-800 pt-4 mt-3">
                <p className="text-[10px] uppercase font-black tracking-wider text-slate-400 select-none mb-3">
                  {isPtStr ? "Últimos Jogos Form" : "Recent Matches Form"}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Home Team Form */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1">
                      <SafeImage src={homeTeam.logo} alt={homeTeam.name} className="w-4 h-4 object-contain" fallbackType="team" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-305">{homeTeam.name}</span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      {(() => {
                        const history = (matches || []).filter(m => {
                          const hasTeam = m.teams?.home?.id === homeTeam.id || m.teams?.away?.id === homeTeam.id;
                          const hasGoals = m.goals?.home !== null && m.goals?.away !== null;
                          return hasTeam && hasGoals && m.fixture?.id !== match.fixture?.id;
                        }).slice(0, 5);

                        if (history.length === 0) {
                          return <span className="text-[10px] text-slate-400 italic pl-1">{isPtStr ? "Sem jogos anteriores gravados" : "No record of previous games"}</span>;
                        }

                        return history.map((m) => {
                          const outcome = getOutcomeDetails(m, homeTeam.id);
                          return (
                            <div key={m.fixture?.id} className="flex items-center justify-between text-[11px] bg-white dark:bg-slate-950 p-1.5 rounded-lg border border-slate-100 dark:border-slate-850">
                              <span className="text-slate-500 font-mono text-[9px]">vs {outcome.oppTeam}</span>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">{outcome.scoreText}</span>
                                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[8.5px] font-black shrink-0 ${outcome.className}`}>
                                  {outcome.char}
                                </span>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>

                  {/* Away Team Form */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1">
                      <SafeImage src={awayTeam.logo} alt={awayTeam.name} className="w-4 h-4 object-contain" fallbackType="team" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-305">{awayTeam.name}</span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      {(() => {
                        const history = (matches || []).filter(m => {
                          const hasTeam = m.teams?.home?.id === awayTeam.id || m.teams?.away?.id === awayTeam.id;
                          const hasGoals = m.goals?.home !== null && m.goals?.away !== null;
                          return hasTeam && hasGoals && m.fixture?.id !== match.fixture?.id;
                        }).slice(0, 5);

                        if (history.length === 0) {
                          return <span className="text-[10px] text-slate-400 italic pl-1">{isPtStr ? "Sem jogos anteriores gravados" : "No record of previous games"}</span>;
                        }

                        return history.map((m) => {
                          const outcome = getOutcomeDetails(m, awayTeam.id);
                          return (
                            <div key={m.fixture?.id} className="flex items-center justify-between text-[11px] bg-white dark:bg-slate-950 p-1.5 rounded-lg border border-slate-100 dark:border-slate-850">
                              <span className="text-slate-500 font-mono text-[9px]">vs {outcome.oppTeam}</span>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">{outcome.scoreText}</span>
                                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[8.5px] font-black shrink-0 ${outcome.className}`}>
                                  {outcome.char}
                                </span>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: STATISTICS */}
        {activeTab === "stats" && (
          <div className="space-y-4 pb-6">
            {!hasApiStats ? (
              <div className="py-16 text-center text-gray-400 font-medium flex flex-col items-center gap-2">
                <ClockIcon className="w-8 h-8 opacity-50"/>
                As estatísticas da partida estarão disponíveis após o apito inicial.
              </div>
            ) : (
              <div className="space-y-1">
                {matchStats?.stats?.map((category: any, catIdx: number) => (
                  <div key={catIdx} className="mb-8 font-sans">
                    {/* Título da Categoria */}
                    <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 mb-4 uppercase border-b border-slate-200 dark:border-slate-800 pb-2 tracking-wider">
                      {translateStat(category.title)}
                    </h3>
                    
                    {category.stats?.map((stat: any, statIdx: number) => {
                      if (stat.type === 'title' || stat.stats?.[0] === null) return null; // Ignora apenas o título interno ou nulo
                      
                      const homeVal = stat.stats[0] !== null ? stat.stats[0] : 0;
                      const awayVal = stat.stats[1] !== null ? stat.stats[1] : 0;
                      
                      // Extração matemática segura
                      const homeNum = parseFloat(String(homeVal).replace(/[^0-9.]/g, '')) || 0;
                      const awayNum = parseFloat(String(awayVal).replace(/[^0-9.]/g, '')) || 0;
                      const total = homeNum + awayNum || 1; 
                      
                      const homeWidth = `${(homeNum / total) * 100}%`;
                      const awayWidth = `${(awayNum / total) * 100}%`;

                      return (
                        <div key={statIdx} className="flex flex-col mb-4 px-2">
                          <div className="flex justify-between items-center text-sm font-bold mb-1 text-gray-800 dark:text-slate-200">
                            <span className="w-12 text-left font-mono">{homeVal}</span>
                            <span className="text-gray-500 dark:text-slate-400 text-xs uppercase font-semibold text-center flex-1">{translateStat(stat.title || stat.key)}</span>
                            <span className="w-12 text-right font-mono">{awayVal}</span>
                          </div>
                          {/* Barras Unidas (Brigando) */}
                          <div className="flex w-full h-2 rounded-full overflow-hidden bg-gray-250 dark:bg-slate-800">
                            <div className="h-full bg-green-600" style={{ width: homeWidth }}></div>
                            <div className="h-full bg-yellow-400" style={{ width: awayWidth }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: LINEUPS */}
        {activeTab === "lineups" && (
          <div className="space-y-6">
            {lineups.length === 0 ? (
              <div className="text-center py-10 text-slate-500 select-none">
                <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-medium">{t.noLineupsYet}</p>
                <p className="text-xs text-slate-400 mt-1">{t.lineupsReleaseTime}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {lineups.map((lineup, tIdx) => (
                  <div key={tIdx} className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-3">
                      <SafeImage
                        src={lineup.team.logo}
                        alt={lineup.team.name}
                        className="w-7 h-7 object-contain bg-white rounded-md p-0.5"
                        fallbackType="team"
                      />
                      <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                        {lineup.team.name} ({lineup.formation})
                      </h3>
                    </div>

                    {lineup.coach?.name && (
                      <p className="text-xs text-slate-500 mb-2 italic">
                        {t.coachLabel}: <span className="font-semibold text-slate-705 dark:text-slate-300">{lineup.coach.name}</span>
                      </p>
                    )}

                    {/* Starting line starters */}
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 select-none">{t.startersLabel}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {lineup.startXI.map((playerItem, pIdx) => {
                          const pName = playerItem.player.name;
                          const isFav = favorites?.players?.includes(pName);
                          return (
                            <div
                              key={pIdx}
                              className="flex items-center gap-2 bg-white dark:bg-slate-950 px-2.5 py-1.5 rounded-sm border border-slate-100 dark:border-slate-800/60 text-xs shadow-3xs"
                            >
                              <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-[#009c3b] font-mono font-bold flex items-center justify-center shrink-0 text-[10px]">
                                {playerItem.player.number}
                              </span>
                              <Link to={`/player/${encodeURIComponent(pName)}`} className="font-semibold text-slate-700 dark:text-slate-300 truncate hover:underline">
                                {pName}
                              </Link>
                              <span className="ml-auto text-slate-400 font-mono text-[9px] uppercase">
                                {getLocalizedPosition(playerItem.player.pos)}
                              </span>
                              <button
                                type="button"
                                onClick={() => onToggleFavoritePlayer?.(pName)}
                                className="p-1 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-350 hover:text-amber-500 rounded-sm cursor-pointer transition-all shrink-0"
                                title="Favoritar Jogador"
                              >
                                <Star 
                                  className={`w-3 h-3 ${
                                    isFav ? "fill-amber-400 text-amber-400 stroke-[2]" : "text-slate-300"
                                  }`} 
                                />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Substitutes panel */}
                    {lineup.substitutes?.length > 0 && (
                      <div className="mt-4 space-y-1.5">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 select-none">{t.substitutesLabel}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {lineup.substitutes.map((sub, sIdx) => {
                            const pName = sub.player.name;
                            const isFav = favorites?.players?.includes(pName);
                            return (
                              <span
                                key={sIdx}
                                className="bg-white/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-sm text-[11px] font-medium shadow-3xs flex items-center gap-2"
                              >
                                <Link to={`/player/${encodeURIComponent(pName)}`} className="hover:underline">
                                  {sub.player.number}. {pName}
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => onToggleFavoritePlayer?.(pName)}
                                  className="p-0.5 text-slate-350 hover:text-amber-500 rounded-xs cursor-pointer transition-all hover:bg-slate-50"
                                  title="Favoritar Jogador"
                                >
                                  <Star 
                                    className={`w-2.5 h-2.5 ${
                                      isFav ? "fill-amber-400 text-amber-400 stroke-[2]" : "text-slate-300"
                                    }`} 
                                  />
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: STANDINGS (Classificação) */}
        {activeTab === "standings" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {isPtStr ? "Tabela Geral da Competição" : "League Standings"}
              </h3>
              
              <Link 
                to={`/league/${targetLeagueId}`}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                onClick={onClose}
              >
                {isPtStr ? "Ver Liga Completa" : "See Full League"} <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loadingStandings ? (
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-xl p-8 flex flex-col items-center justify-center text-center shadow-3xs">
                <RefreshCw className="w-7 h-7 text-emerald-600 animate-spin mb-3" />
                <p className="text-sm font-semibold text-slate-750 dark:text-slate-300">
                  {isPtStr ? "Carregando classificação oficial..." : "Loading official league standings..."}
                </p>
              </div>
            ) : errorStandings ? (
              <div className="bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-900/30 rounded-xl p-6 text-center">
                <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">{errorStandings}</p>
                <Link 
                  to={`/league/${targetLeagueId}`}
                  className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline active:scale-95"
                  onClick={onClose}
                >
                  {isPtStr ? "Ir para a Página da Competição" : "Go to League Page"} <ChevronRight className="w-3" />
                </Link>
              </div>
            ) : (
              <div className="overflow-hidden border border-slate-100 dark:border-slate-800 rounded-xl shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse bg-white dark:bg-slate-900 text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800">
                        <th className="py-2.5 px-3 text-center w-8">#</th>
                        <th className="py-2.5 px-2">{isPtStr ? "Clube" : "Club"}</th>
                        <th className="py-2.5 px-2 text-center w-8">J</th>
                        <th className="py-2.5 px-1 text-center w-6">{isPtStr ? "V" : "W"}</th>
                        <th className="py-2.5 px-1 text-center w-6">{isPtStr ? "E" : "D"}</th>
                        <th className="py-2.5 px-1 text-center w-6">{isPtStr ? "D" : "L"}</th>
                        <th className="py-2.5 px-2 text-center w-10">DG</th>
                        <th className="py-2.5 px-3 text-center w-10 font-bold">Pts</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {standings.slice(0, 10).map((row: any) => {
                        const isTargetTeam = row.name === homeTeam.name || row.name === awayTeam.name;
                        return (
                          <tr 
                            key={row.id} 
                            className={`hover:bg-slate-50/50 dark:hover:bg-slate-850/40 transition-colors ${
                              isTargetTeam ? "bg-emerald-50/20 dark:bg-emerald-950/20 font-medium" : ""
                            }`}
                          >
                            <td className="py-2 px-3 text-center font-semibold text-slate-505">{row.idx}</td>
                            <td className="py-2 px-2 flex items-center gap-2">
                              <SafeImage 
                                src={row.logo} 
                                alt={row.name} 
                                className="w-5 h-5 object-contain"
                                fallbackType="team"
                              />
                              <span className="truncate max-w-[125px] inline-block">{row.name}</span>
                            </td>
                            <td className="py-2 px-1 text-center text-slate-500">{row.played}</td>
                            <td className="py-1.5 px-1 text-center text-slate-600 dark:text-slate-400">{row.wins}</td>
                            <td className="py-1.5 px-1 text-center text-slate-600 dark:text-slate-400">{row.draws}</td>
                            <td className="py-1.5 px-1 text-center text-slate-600 dark:text-slate-400">{row.losses}</td>
                            <td className={`py-1.5 px-2 text-center text-xs ${row.goalConDiff > 0 ? "text-emerald-600" : row.goalConDiff < 0 ? "text-rose-500" : "text-slate-400"}`}>
                              {row.goalConDiff > 0 ? `+${row.goalConDiff}` : row.goalConDiff}
                            </td>
                            <td className="py-2 px-3 text-center font-bold text-slate-800 dark:text-slate-100">{row.pts}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {standings.length > 10 && (
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-950 text-center border-t border-slate-100 dark:border-slate-800">
                    <Link 
                      to={`/league/${targetLeagueId}`}
                      className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 active:scale-95"
                      onClick={onClose}
                    >
                      {isPtStr ? "Mostrar classificação completa" : "Show complete standings"} <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: H2H (Confrontos Diretos) */}
        {activeTab === "h2h" && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
              {isPtStr ? "Histórico de Confrontos Diretos" : "Head-to-Head History"}
            </h3>

            {(() => {
              const h2hMatches = (matches || []).filter(m => {
                const isHomeVaway = m.teams?.home?.id === homeTeam.id && m.teams?.away?.id === awayTeam.id;
                const isAwayVhome = m.teams?.home?.id === awayTeam.id && m.teams?.away?.id === homeTeam.id;
                const finished = m.goals?.home !== null && m.goals?.away !== null;
                return (isHomeVaway || isAwayVhome) && finished && m.fixture?.id !== match.fixture?.id;
              });

              if (h2hMatches.length === 0) {
                return (
                  <div className="bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl p-6 text-center text-slate-500 text-xs">
                    {isPtStr 
                      ? "Nenhum confronto direto anterior encontrado no banco de dados atual." 
                      : "No previous head-to-head matches found in current match registries."}
                  </div>
                );
              }

              // Calculate overall stats
              let homeWins = 0;
              let awayWins = 0;
              let draws = 0;

              h2hMatches.forEach(m => {
                const goalsHome = m.goals?.home ?? 0;
                const goalsAway = m.goals?.away ?? 0;
                if (goalsHome > goalsAway) {
                  if (m.teams.home.id === homeTeam.id) homeWins++; else awayWins++;
                } else if (goalsHome < goalsAway) {
                  if (m.teams.away.id === homeTeam.id) homeWins++; else awayWins++;
                } else {
                  draws++;
                }
              });

              return (
                <div className="space-y-4">
                  {/* Summary Bar */}
                  <div className="grid grid-cols-3 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl p-3 text-center">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{isPtStr ? "Vitórias" : "Wins"} {homeTeam.name}</p>
                      <p className="text-lg font-black text-emerald-605 font-mono">{homeWins}</p>
                    </div>
                    <div className="border-x border-slate-200 dark:border-slate-800">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{isPtStr ? "Empates" : "Draws"}</p>
                      <p className="text-lg font-black text-slate-600 dark:text-slate-300 font-mono">{draws}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{isPtStr ? "Vitórias" : "Wins"} {awayTeam.name}</p>
                      <p className="text-lg font-black text-amber-500 font-mono">{awayWins}</p>
                    </div>
                  </div>

                  {/* Games List */}
                  <div className="space-y-2">
                    {h2hMatches.map((m) => {
                      const formattedH2HDate = new Date(m.fixture.date).toLocaleDateString(localeStr, {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric"
                      });

                      return (
                        <div key={m.fixture.id} className="bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl p-3.5 flex flex-col gap-2 shadow-3xs">
                          <div className="flex justify-between items-center text-[10px] text-slate-450 font-bold select-none border-b border-slate-200/50 dark:border-slate-800 pb-1.5 mb-1 bg-clip-text">
                            <span className="truncate">{m.league.name}</span>
                            <span className="font-mono">{formattedH2HDate}</span>
                          </div>

                          <div className="grid grid-cols-7 items-center text-center text-xs">
                            <div className="col-span-3 flex items-center gap-1.5 justify-end text-right">
                              <span className="font-bold text-slate-705 dark:text-slate-200 truncate">{m.teams.home.name}</span>
                              <SafeImage src={m.teams.home.logo} alt={m.teams.home.name} className="w-4.5 h-4.5 object-contain" fallbackType="team" />
                            </div>

                            <div className="col-span-1 bg-slate-100 dark:bg-slate-950 px-2 py-0.5 rounded-md font-mono font-black text-slate-800 dark:text-white border border-slate-150 dark:border-slate-800 inline-block mx-auto">
                              {m.goals.home} - {m.goals.away}
                            </div>

                            <div className="col-span-3 flex items-center gap-1.5 justify-start text-left">
                              <SafeImage src={m.teams.away.logo} alt={m.teams.away.name} className="w-4.5 h-4.5 object-contain" fallbackType="team" />
                              <span className="font-bold text-slate-705 dark:text-slate-200 truncate">{m.teams.away.name}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Footer info banner */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 select-none text-xs">
        <div className="max-w-7xl mx-auto flex flex-col gap-1.5 text-slate-400 font-medium text-center sm:text-left">
          <span>{t.matchDateLabel}: {dateFormatted} ({t.localTimeLabel})</span>
        </div>
      </div>
    </div>
  );

  if (isEmbedded) {
    return innerContent;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop overlay */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg h-full">
        {innerContent}
      </div>
    </div>
  );
}
