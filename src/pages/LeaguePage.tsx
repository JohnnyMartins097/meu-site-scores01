import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Award, Calendar, ChevronLeft, Shield, Star, Table, Trophy, Users } from "lucide-react";
import { SafeImage } from "../components/SafeImage";
import { Match, StandingItem } from "../types";
import { LEAGUE_DICTIONARY, getLeagueDictEntry } from "../App";
import { StandingsTable } from "../components/StandingsTable";
import { getLeagueStandings } from "../api";


interface LeaguePageProps {
  matches: Match[];
  favorites: { leagues: number[] };
  onToggleFavoriteLeague: (leagueId: number) => void;
  language: string;
}

interface StandingRow {
  pos: number;
  teamId: number;
  teamName: string;
  teamLogo: string;
  played: number;
  win: number;
  draw: number;
  lose: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
}

// Top scorers datasets
const SCORERS_DATA: Record<number, Array<{ name: string; teamLogo: string; teamName: string; goals: number; assists: number; matches: number }>> = {
  71: [
    { name: "Pedro", teamLogo: "https://img.sofascore.com/api/v1/team/5981/image", teamName: "Flamengo", goals: 21, assists: 4, matches: 29 },
    { name: "Estêvão", teamLogo: "https://img.sofascore.com/api/v1/team/1963/image", teamName: "Palmeiras", goals: 12, assists: 8, matches: 28 },
    { name: "Yuri Alberto", teamLogo: "https://img.sofascore.com/api/v1/team/1957/image", teamName: "Corinthians", goals: 11, assists: 2, matches: 26 }
  ],
  140: [
    { name: "Robert Lewandowski", teamLogo: "https://img.sofascore.com/api/v1/team/2816/image", teamName: "Barcelona", goals: 24, assists: 5, matches: 31 },
    { name: "Kylian Mbappé", teamLogo: "https://img.sofascore.com/api/v1/team/2829/image", teamName: "Real Madrid", goals: 20, assists: 6, matches: 29 },
    { name: "Vinicius Júnior", teamLogo: "https://img.sofascore.com/api/v1/team/2829/image", teamName: "Real Madrid", goals: 18, assists: 9, matches: 28 }
  ]
};

export default function LeaguePage({ matches, favorites, onToggleFavoriteLeague, language }: LeaguePageProps) {
  const { id, leagueId: routeLeagueId } = useParams<{ id?: string; leagueId?: string }>();
  const [activeTab, setActiveTab] = useState<"table" | "scorers" | "calendar">("table");

  const leagueId = routeLeagueId ? parseInt(routeLeagueId, 10) : (id ? parseInt(id, 10) : 71);
  const isPtStr = language.startsWith("pt");

  // Lookup in active fixtures / dictionary to identify details of league
  const fixtureMatch = matches.find(m => m.league.id === leagueId);
  const dictLeague = getLeagueDictEntry(leagueId, fixtureMatch?.league.name);
  const leagueName = fixtureMatch?.league.name || dictLeague?.name || (leagueId === 71 ? "Brasileirão Série A" : (leagueId === 140 ? "La Liga" : (leagueId === 39 ? "Premier League" : `Liga ${leagueId}`)) || "Competição de Futebol");
  const leagueLogo = fixtureMatch?.league.logo || `https://images.fotmob.com/image_resources/logo/leaguelogo/${leagueId}.png`;
  const isFav = favorites.leagues.includes(leagueId);

  // Live standings state
  const [standings, setStandings] = useState<StandingRow[]>([]);
  const [leagueStandings, setLeagueStandings] = useState<StandingItem[]>([]);
  const [loadingStandings, setLoadingStandings] = useState(true);
  const [errorStandings, setErrorStandings] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab !== "table") return;

    setLoadingStandings(true);
    setErrorStandings(null);

    const fetchLiveStandings = async () => {
      try {
        const rawList = await getLeagueStandings(leagueId);

        if (!rawList || !Array.isArray(rawList) || rawList.length === 0) {
          setErrorStandings(isPtStr ? "Classificação não disponível para esta competição." : "Standings not available for this competition.");
          return;
        }

        // Flatten the raw standings list if it contains nested groups or structures
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
        } else if (rawList && typeof rawList === "object") {
          const keys = Object.keys(rawList);
          for (const k of keys) {
            if (Array.isArray((rawList as any)[k])) {
              rawRows = (rawList as any)[k];
              break;
            }
          }
        }

        if (rawRows.length === 0) {
          setErrorStandings(isPtStr ? "Classificação não disponível para esta competição." : "Standings not available for this competition.");
          return;
        }

        const parsed: StandingItem[] = rawRows.map((item: any, idx: number) => {
          // If already matches StandingItem structure
          if (typeof item.idx === "number" && typeof item.pts === "number") {
            return {
              id: item.id ?? item.teamId ?? (50000 + idx),
              idx: item.idx,
              name: item.name ?? item.teamName ?? "",
              shortName: item.shortName ?? item.teamName ?? "",
              logo: item.logo ?? item.teamLogo ?? `https://img.sofascore.com/api/v1/team/${item.id || item.teamId}/image`,
              played: item.played ?? 0,
              wins: item.wins ?? 0,
              draws: item.draws ?? 0,
              losses: item.losses ?? 0,
              scoresStr: item.scoresStr ?? `${item.wins * 2}-${item.losses * 2}`,
              goalConDiff: item.goalConDiff ?? 0,
              pts: item.pts,
              qualColor: item.qualColor ?? null
            };
          }

          // Convert from raw API fields
          const teamId = item.team?.id || item.teamId || (50000 + idx);
          const pos = item.position || item.pos || item.idx || (idx + 1);
          const teamName = item.team?.name || item.team?.shortName || item.teamName || (isPtStr ? "Clube" : "Team");
          const teamLogo = item.team?.logo || item.teamLogo || `https://img.sofascore.com/api/v1/team/${teamId}/image`;
          const played = item.matches ?? item.played ?? ((item.win || 0) + (item.draw || 0) + (item.loss || 0));
          const wins = item.win ?? item.wins ?? 0;
          const draws = item.draw ?? item.draws ?? 0;
          const losses = item.loss ?? item.losses ?? item.lose ?? 0;
          const gf = item.scoresFor ?? item.gf ?? item.goalsFor ?? 0;
          const ga = item.scoresAgainst ?? item.ga ?? item.goalsAgainst ?? 0;
          const gd = item.goalDifference ?? item.gd ?? (gf - ga);
          const pts = item.points ?? item.pts ?? 0;

          let qualColor: string | null = null;
          if (pos <= 4) {
            qualColor = "#0046c7"; // Champions League / top zone
          } else if (pos <= 6) {
            qualColor = "#fa6400"; // Europa League zone
          } else if (pos > 16) {
            qualColor = "#ef4444"; // Relegation zone
          }

          return {
            id: teamId,
            idx: pos,
            name: teamName,
            shortName: item.team?.shortName || teamName,
            logo: teamLogo,
            played,
            wins,
            draws,
            losses,
            scoresStr: `${gf}-${ga}`,
            goalConDiff: gd,
            pts,
            qualColor
          };
        });

        if (parsed.length > 0) {
          setLeagueStandings(parsed);
        } else {
          setErrorStandings(isPtStr ? "Classificação não disponível para esta competição." : "Standings not available for this competition.");
        }
      } catch (err) {
        console.error("[Client Standings] Error requesting live standing table:", err);
        setErrorStandings(isPtStr ? "Classificação não disponível para esta competição." : "Standings not available for this competition.");
      } finally {
        setLoadingStandings(false);
      }
    };

    fetchLiveStandings();
  }, [leagueId, leagueName, activeTab]);

  const scorers = SCORERS_DATA[leagueId] || [
    { name: "Jogador de Elite 1", teamLogo: "https://img.sofascore.com/api/v1/team/5981/image", teamName: "Time A", goals: 9, assists: 3, matches: 12 },
    { name: "Jogador de Elite 2", teamLogo: "https://img.sofascore.com/api/v1/team/1963/image", teamName: "Time B", goals: 7, assists: 4, matches: 11 },
    { name: "Jogador de Elite 3", teamLogo: "https://img.sofascore.com/api/v1/team/2829/image", teamName: "Time C", goals: 6, assists: 2, matches: 10 }
  ];

  const leagueMatches = matches.filter(m => m.league.id === leagueId || m.league.parentLeagueId === leagueId);

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen pb-12">
      {/* Visual Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-slate-900 text-white relative py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-6">
          <Link
            to="/"
            className="absolute top-4 left-4 flex items-center gap-1 text-xs font-bold text-white/80 hover:text-white bg-black/15 py-1.5 px-3 rounded-full transition-all focus:outline-none"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{isPtStr ? "Voltar ao Início" : "Back to Home"}</span>
          </Link>

          <SafeImage
            src={leagueLogo}
            alt={leagueName}
            className="w-20 h-20 object-contain bg-white/10 dark:bg-black/20 p-2.5 rounded-2xl border border-white/15"
            fallbackType="league"
          />

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-2.5 justify-center md:justify-start">
              <h1 className="text-2xl md:text-3.5xl font-display font-black tracking-tight">
                {leagueName}
              </h1>
              <button
                onClick={() => onToggleFavoriteLeague(leagueId)}
                className="self-center p-1.5 bg-white/10 hover:bg-white/20 rounded-full cursor-pointer transition-all border border-white/15 active:scale-95"
                title={isPtStr ? "Favoritar Competição" : "Favorite League"}
              >
                <Star className={`w-4.5 h-4.5 ${isFav ? "fill-amber-400 text-amber-400" : "text-white/60"}`} />
              </button>
            </div>
            <p className="text-xs font-bold text-emerald-300 mt-2 uppercase tracking-widest leading-none">
              Competição Oficial • ID {leagueId}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-3xs">
        <div className="max-w-7xl mx-auto px-6 flex items-center overflow-x-auto select-none">
          <button
            onClick={() => setActiveTab("table")}
            className={`py-4 px-5 text-sm font-semibold border-b-2 cursor-pointer transition-all ${
              activeTab === "table"
                ? "border-[#009c3b] text-[#009c3b] font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-250"
            }`}
          >
            <span className="flex items-center gap-1.5 justify-center">
              <Table className="w-4 h-4" />
              {isPtStr ? "Tabela de Classificação" : "Championship Standings"}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("scorers")}
            className={`py-4 px-5 text-sm font-semibold border-b-2 cursor-pointer transition-all ${
              activeTab === "scorers"
                ? "border-[#009c3b] text-[#009c3b] font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-250"
            }`}
          >
            <span className="flex items-center gap-1.5 justify-center">
              <Trophy className="w-4 h-4" />
              {isPtStr ? "Artilheiros" : "Top Scorers"}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("calendar")}
            className={`py-4 px-5 text-sm font-semibold border-b-2 cursor-pointer transition-all ${
              activeTab === "calendar"
                ? "border-[#009c3b] text-[#009c3b] font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-250"
            }`}
          >
            <span className="flex items-center gap-1.5 justify-center">
              <Calendar className="w-4 h-4" />
              {isPtStr ? "Jogos da Rodada" : "Matches Calendar"}
            </span>
          </button>
        </div>
      </div>

      {/* Panels Context */}
      <div className="max-w-7xl mx-auto px-6 mt-8">
        {/* STANDINGS TABLE */}
        {activeTab === "table" && (
          loadingStandings ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 p-6">
              <div className="animate-spin rounded-full h-8 w-8 border-3 border-emerald-600 border-t-transparent mb-4"></div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                {isPtStr ? "Carregando classificação..." : "Loading standings..."}
              </p>
            </div>
          ) : errorStandings ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 p-6">
              <Table className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">{errorStandings}</p>
            </div>
          ) : (
            <StandingsTable items={leagueStandings} />
          )
        )}

        {/* TOP SCORERS / ARTILHEIROS */}
        {activeTab === "scorers" && (
          <div className="max-w-2xl mx-auto space-y-4">
            {scorers.map((scorer, index) => (
              <div
                key={scorer.name}
                className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-4 shadow-3xs flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono font-black text-slate-350 text-xl pl-2">{index + 1}</span>
                  <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center font-bold text-base border border-emerald-100/10">
                    ⚽
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-850 dark:text-slate-50 leading-tight">
                      {scorer.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <SafeImage src={scorer.teamLogo} alt={scorer.teamName} className="w-3.5 h-3.5 object-contain" fallbackType="team" />
                      <span className="text-[11px] font-semibold text-slate-400">{scorer.teamName}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-center font-mono select-none">
                  <div>
                    <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">{scorer.goals}</div>
                    <div className="text-[9px] uppercase font-bold text-slate-400">{isPtStr ? "Gols" : "Goals"}</div>
                  </div>
                  <div className="border-l border-slate-100 h-8" />
                  <div>
                    <div className="text-base font-bold text-slate-600 dark:text-slate-300">{scorer.assists}</div>
                    <div className="text-[9px] uppercase font-bold text-slate-400">{isPtStr ? "Assists." : "Assists"}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* COMP Matches list */}
        {activeTab === "calendar" && (
          <div className="max-w-3xl mx-auto space-y-4">
            {leagueMatches.length === 0 ? (
              <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 p-6">
                <Calendar className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-semibold">{isPtStr ? "Sem partidas registradas" : "No registered matches in this window"}</p>
              </div>
            ) : (
              (() => {
                const grouped: Record<string, Match[]> = {};
                leagueMatches.forEach(m => {
                  const g = m.league.groupName || "";
                  if (!grouped[g]) grouped[g] = [];
                  grouped[g].push(m);
                });

                return Object.entries(grouped).map(([gName, groupMatches]) => (
                  <div key={gName || "all"} className="flex flex-col gap-4">
                    {gName && (
                      <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase py-2 tracking-wider font-sans select-none px-1 border-b border-slate-100 dark:border-slate-800/40">
                        {gName}
                      </div>
                    )}
                    {groupMatches.map((match) => (
                      <div key={match.fixture.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-800 p-5 shadow-2xs">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2 flex-1 justify-end text-right">
                            <span className="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm truncate">{match.teams.home.name}</span>
                            <SafeImage src={match.teams.home.logo} alt={match.teams.home.name} className="w-7 h-7 object-contain" fallbackType="team" />
                          </div>
                          {match.goals.home !== null && match.goals.away !== null ? (
                            <div className="flex flex-col items-center gap-1">
                              <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg leading-none font-mono font-extrabold text-sm border border-slate-200/50">
                                <span className={match.fixture.status.short === "FT" && match.teams.home.winner === false ? "text-slate-400" : "text-[#009c3b]"}>
                                  {match.goals.home ?? 0}
                                </span>
                                <span className="text-slate-300 font-bold">-</span>
                                <span className={match.fixture.status.short === "FT" && match.teams.away.winner === false ? "text-slate-400" : "text-[#009c3b]"}>
                                  {match.goals.away ?? 0}
                                </span>
                              </div>
                              {match.fixture.status.short !== "FT" && (
                                <span className="text-[10px] text-red-500 font-extrabold font-mono animate-pulse">
                                  {match.fixture.status.short === "HT" ? "INT" : `${match.fixture.status.elapsed}'`}
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="bg-slate-100 dark:bg-slate-800 font-mono font-bold text-xs px-2.5 py-1.5 rounded-lg">
                              {new Date(match.fixture.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          )}
                          <div className="flex items-center gap-2 flex-1 text-left">
                            <SafeImage src={match.teams.away.logo} alt={match.teams.away.name} className="w-7 h-7 object-contain" fallbackType="team" />
                            <span className="font-bold text-slate-850 dark:text-slate-105 text-xs sm:text-sm truncate">{match.teams.away.name}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ));
              })()
            )}
          </div>
        )}
      </div>
    </div>
  );
}
