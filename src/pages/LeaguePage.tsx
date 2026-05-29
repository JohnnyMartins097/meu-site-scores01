import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Award, Calendar, ChevronLeft, Shield, Star, Table, Trophy, Users } from "lucide-react";
import { SafeImage } from "../components/SafeImage";
import { Match } from "../types";
import { LEAGUE_DICTIONARY } from "../App";

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

// Custom mock standings for major leagues if offline/simulation
const getCustomMockStandings = (leagueId: number, leagueName: string): StandingRow[] => {
  const nameLower = leagueName.toLowerCase();
  
  if (leagueId === 71 || nameLower.includes("brasileirão") || nameLower.includes("brazil")) {
    return [
      { pos: 1, teamId: 127, teamName: "Flamengo", teamLogo: "https://img.sofascore.com/api/v1/team/5981/image", played: 12, win: 8, draw: 3, lose: 1, gf: 24, ga: 10, gd: 14, points: 27 },
      { pos: 2, teamId: 121, teamName: "Palmeiras", teamLogo: "https://img.sofascore.com/api/v1/team/1963/image", played: 12, win: 7, draw: 4, lose: 1, gf: 20, ga: 9, gd: 11, points: 25 },
      { pos: 3, teamId: 126, teamName: "São Paulo", teamLogo: "https://img.sofascore.com/api/v1/team/1981/image", played: 12, win: 6, draw: 4, lose: 2, gf: 18, ga: 11, gd: 7, points: 22 },
      { pos: 4, teamId: 131, teamName: "Corinthians", teamLogo: "https://img.sofascore.com/api/v1/team/1957/image", played: 12, win: 5, draw: 4, lose: 3, gf: 14, ga: 13, gd: 1, points: 19 },
      { pos: 5, teamId: 125, teamName: "Grêmio", teamLogo: "https://img.sofascore.com/api/v1/team/1954/image", played: 12, win: 5, draw: 3, lose: 4, gf: 15, ga: 14, gd: 1, points: 18 },
      { pos: 6, teamId: 130, teamName: "Fluminense", teamLogo: "https://img.sofascore.com/api/v1/team/1961/image", played: 12, win: 4, draw: 4, lose: 4, gf: 13, ga: 14, gd: -1, points: 16 }
    ];
  }
  
  if (leagueId === 39 || nameLower.includes("premier") || nameLower.includes("england") || nameLower.includes("inglaterra")) {
    return [
      { pos: 1, teamId: 17, teamName: "Manchester City", teamLogo: "https://img.sofascore.com/api/v1/team/17/image", played: 12, win: 9, draw: 2, lose: 1, gf: 32, ga: 11, gd: 21, points: 29 },
      { pos: 2, teamId: 42, teamName: "Arsenal", teamLogo: "https://img.sofascore.com/api/v1/team/42/image", played: 12, win: 8, draw: 3, lose: 1, gf: 26, ga: 8, gd: 18, points: 27 },
      { pos: 3, teamId: 44, teamName: "Liverpool", teamLogo: "https://img.sofascore.com/api/v1/team/44/image", played: 12, win: 8, draw: 2, lose: 2, gf: 25, ga: 10, gd: 15, points: 26 },
      { pos: 4, teamId: 38, teamName: "Aston Villa", teamLogo: "https://img.sofascore.com/api/v1/team/38/image", played: 12, win: 7, draw: 3, lose: 2, gf: 21, ga: 15, gd: 6, points: 24 },
      { pos: 5, teamId: 33, teamName: "Chelsea", teamLogo: "https://img.sofascore.com/api/v1/team/33/image", played: 12, win: 6, draw: 3, lose: 3, gf: 22, ga: 16, gd: 6, points: 21 },
      { pos: 6, teamId: 35, teamName: "Manchester United", teamLogo: "https://img.sofascore.com/api/v1/team/35/image", played: 12, win: 5, draw: 4, lose: 3, gf: 16, ga: 14, gd: 2, points: 19 }
    ];
  }
  
  if (leagueId === 140 || nameLower.includes("liga") || nameLower.includes("spain") || nameLower.includes("espanha")) {
    return [
      { pos: 1, teamId: 2817, teamName: "Real Madrid", teamLogo: "https://img.sofascore.com/api/v1/team/2829/image", played: 12, win: 9, draw: 3, lose: 0, gf: 28, ga: 9, gd: 19, points: 30 },
      { pos: 2, teamId: 2816, teamName: "Barcelona", teamLogo: "https://img.sofascore.com/api/v1/team/2816/image", played: 12, win: 9, draw: 1, lose: 2, gf: 31, ga: 12, gd: 19, points: 28 },
      { pos: 3, teamId: 2825, teamName: "Atlético Madrid", teamLogo: "https://img.sofascore.com/api/v1/team/2836/image", played: 12, win: 7, draw: 3, lose: 2, gf: 20, ga: 10, gd: 10, points: 24 },
      { pos: 4, teamId: 2824, teamName: "Girona", teamLogo: "https://img.sofascore.com/api/v1/team/2893/image", played: 12, win: 7, draw: 2, lose: 3, gf: 23, ga: 15, gd: 8, points: 23 },
      { pos: 5, teamId: 2814, teamName: "Athletic Club", teamLogo: "https://img.sofascore.com/api/v1/team/2825/image", played: 12, win: 6, draw: 3, lose: 3, gf: 19, ga: 14, gd: 5, points: 21 }
    ];
  }

  if (nameLower.includes("champions") || nameLower.includes("europe") || nameLower.includes("uefa") || leagueId === 2) {
    return [
      { pos: 1, teamId: 2829, teamName: "Real Madrid", teamLogo: "https://img.sofascore.com/api/v1/team/2829/image", played: 6, win: 5, draw: 1, lose: 0, gf: 16, ga: 5, gd: 11, points: 16 },
      { pos: 2, teamId: 17, teamName: "Manchester City", teamLogo: "https://img.sofascore.com/api/v1/team/17/image", played: 6, win: 5, draw: 0, lose: 1, gf: 18, ga: 7, gd: 11, points: 15 },
      { pos: 3, teamId: 2816, teamName: "Barcelona", teamLogo: "https://img.sofascore.com/api/v1/team/2816/image", played: 6, win: 4, draw: 1, lose: 1, gf: 12, ga: 6, gd: 6, points: 13 },
      { pos: 4, teamId: 2673, teamName: "Bayern München", teamLogo: "https://img.sofascore.com/api/v1/team/2674/image", played: 6, win: 4, draw: 1, lose: 1, gf: 11, ga: 6, gd: 5, points: 13 },
      { pos: 5, teamId: 42, teamName: "Arsenal", teamLogo: "https://img.sofascore.com/api/v1/team/42/image", played: 6, win: 4, draw: 0, lose: 2, gf: 14, ga: 4, gd: 10, points: 12 },
      { pos: 6, teamId: 44, teamName: "Liverpool", teamLogo: "https://img.sofascore.com/api/v1/team/44/image", played: 6, win: 4, draw: 0, lose: 2, gf: 12, ga: 5, gd: 7, points: 12 }
    ];
  }

  // General fallback simulation
  return [
    { pos: 1, teamId: 5981, teamName: "Flamengo", teamLogo: "https://img.sofascore.com/api/v1/team/5981/image", played: 10, win: 7, draw: 2, lose: 1, gf: 18, ga: 8, gd: 10, points: 23 },
    { pos: 2, teamId: 1963, teamName: "Palmeiras", teamLogo: "https://img.sofascore.com/api/v1/team/1963/image", played: 10, win: 6, draw: 3, lose: 1, gf: 15, ga: 7, gd: 8, points: 21 },
    { pos: 3, teamId: 2829, teamName: "Real Madrid", teamLogo: "https://img.sofascore.com/api/v1/team/2829/image", played: 10, win: 5, draw: 4, lose: 1, gf: 17, ga: 9, gd: 8, points: 19 },
    { pos: 4, teamId: 2816, teamName: "Barcelona", teamLogo: "https://img.sofascore.com/api/v1/team/2816/image", played: 10, win: 5, draw: 3, lose: 2, gf: 14, ga: 11, gd: 3, points: 18 }
  ];
};

// Complete realistic standings dataset for major supported leagues
const STANDINGS_DATA: Record<number, StandingRow[]> = {
  71: [ // Brasileirão Série A
    { pos: 1, teamId: 121, teamName: "Palmeiras", teamLogo: "https://img.sofascore.com/api/v1/team/1963/image", played: 38, win: 22, draw: 9, lose: 7, gf: 61, ga: 29, gd: 32, points: 75 },
    { pos: 2, teamId: 127, teamName: "Flamengo", teamLogo: "https://img.sofascore.com/api/v1/team/5981/image", played: 38, win: 21, draw: 10, lose: 7, gf: 68, ga: 35, gd: 33, points: 73 },
    { pos: 3, teamId: 126, teamName: "São Paulo", teamLogo: "https://img.sofascore.com/api/v1/team/1981/image", played: 38, win: 18, draw: 12, lose: 8, gf: 50, ga: 33, gd: 17, points: 66 },
    { pos: 4, teamId: 131, teamName: "Corinthians", teamLogo: "https://img.sofascore.com/api/v1/team/1957/image", played: 38, win: 15, draw: 10, lose: 13, gf: 44, ga: 40, gd: 4, points: 55 }
  ],
  140: [ // La Liga España
    { pos: 1, teamId: 2829, teamName: "Real Madrid", teamLogo: "https://img.sofascore.com/api/v1/team/2829/image", played: 38, win: 29, draw: 8, lose: 1, gf: 87, ga: 26, gd: 61, points: 95 },
    { pos: 2, teamId: 2816, teamName: "Barcelona", teamLogo: "https://img.sofascore.com/api/v1/team/2816/image", played: 38, win: 27, draw: 4, lose: 7, gf: 94, ga: 40, gd: 54, points: 85 }
  ]
};

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
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<"table" | "scorers" | "calendar">("table");

  const leagueId = id ? parseInt(id, 10) : 71;
  const isPtStr = language.startsWith("pt");

  // Lookup in active fixtures / dictionary to identify details of league
  const fixtureMatch = matches.find(m => m.league.id === leagueId);
  const dictLeague = LEAGUE_DICTIONARY[leagueId];
  const leagueName = fixtureMatch?.league.name || dictLeague?.name || (leagueId === 71 ? "Brasileirão Série A" : (leagueId === 140 ? "La Liga" : (leagueId === 39 ? "Premier League" : `Liga ${leagueId}`)) || "Competição de Futebol");
  const leagueLogo = fixtureMatch?.league.logo || `https://images.fotmob.com/image_resources/logo/leaguelogo/${leagueId}.png`;
  const isFav = favorites.leagues.includes(leagueId);

  // Live standings state
  const [standings, setStandings] = useState<StandingRow[]>([]);
  const [loadingStandings, setLoadingStandings] = useState(true);

  const initialList = STANDINGS_DATA[leagueId] || getCustomMockStandings(leagueId, leagueName);

  useEffect(() => {
    // Populate immediately with visual fallback so layout is fully complete
    setStandings(initialList);
    setLoadingStandings(true);

    const fetchLiveStandings = async () => {
      try {
        const res = await fetch(`/api/standings/${leagueId}`);
        if (!res.ok) throw new Error("Could not find standing details on server");
        const data = await res.json();
        const rawStandings = data.standings;

        let rawRows: any[] = [];
        if (Array.isArray(rawStandings)) {
          // Check for first standing group
          const firstGroup = rawStandings[0];
          if (firstGroup && Array.isArray(firstGroup.rows)) {
            rawRows = firstGroup.rows;
          } else if (Array.isArray(firstGroup)) {
            rawRows = firstGroup;
          } else {
            rawRows = rawStandings;
          }
        } else if (rawStandings && Array.isArray(rawStandings.rows)) {
          rawRows = rawStandings.rows;
        } else if (rawStandings && typeof rawStandings === "object") {
          const keys = Object.keys(rawStandings);
          for (const k of keys) {
            if (Array.isArray(rawStandings[k])) {
              rawRows = rawStandings[k];
              break;
            }
          }
        }

        if (rawRows.length > 0) {
          const parsedRows = rawRows.map((row: any, idx: number) => {
            const teamId = row.team?.id || (50000 + idx);
            return {
              pos: row.position || row.pos || (idx + 1),
              teamId,
              teamName: row.team?.name || row.team?.shortName || (isPtStr ? "Clube" : "Team"),
              teamLogo: `https://img.sofascore.com/api/v1/team/${teamId}/image`,
              played: row.matches ?? row.played ?? ((row.win || 0) + (row.draw || 0) + (row.loss || 0)),
              win: row.win ?? row.wins ?? 0,
              draw: row.draw ?? row.draws ?? 0,
              lose: row.loss ?? row.losses ?? row.lose ?? 0,
              gf: row.scoresFor ?? row.gf ?? row.goalsFor ?? 0,
              ga: row.scoresAgainst ?? row.ga ?? row.goalsAgainst ?? 0,
              gd: row.goalDifference ?? row.gd ?? ((row.scoresFor ?? 0) - (row.scoresAgainst ?? 0)),
              points: row.points ?? row.pts ?? 0
            };
          });
          setStandings(parsedRows);
        }
      } catch (err) {
        console.log("[Client Standings] Error requesting live standing table, falling back to static lists:", err);
      } finally {
        setLoadingStandings(false);
      }
    };

    fetchLiveStandings();
  }, [leagueId, leagueName]);

  const scorers = SCORERS_DATA[leagueId] || [
    { name: "Jogador de Elite 1", teamLogo: "https://img.sofascore.com/api/v1/team/5981/image", teamName: "Time A", goals: 9, assists: 3, matches: 12 },
    { name: "Jogador de Elite 2", teamLogo: "https://img.sofascore.com/api/v1/team/1963/image", teamName: "Time B", goals: 7, assists: 4, matches: 11 },
    { name: "Jogador de Elite 3", teamLogo: "https://img.sofascore.com/api/v1/team/2829/image", teamName: "Time C", goals: 6, assists: 2, matches: 10 }
  ];

  const leagueMatches = matches.filter(m => m.league.id === leagueId);

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
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-150 dark:border-slate-800 text-xs text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-4 px-5 text-center w-12">#</th>
                    <th className="py-4 px-3">{isPtStr ? "Clube" : "Team"}</th>
                    <th className="py-4 px-3 text-center w-16">P</th>
                    <th className="py-4 px-3 text-center w-12">J</th>
                    <th className="py-4 px-3 text-center w-12">V</th>
                    <th className="py-4 px-3 text-center w-12">E</th>
                    <th className="py-4 px-3 text-center w-12">D</th>
                    <th className="py-4 px-3 text-center w-16">SG</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
                  {standings.map((row) => (
                    <tr key={row.pos} className="hover:bg-slate-50/55 dark:hover:bg-slate-800/30 transition-all font-medium">
                      <td className="py-4 px-5 font-mono font-black text-center text-slate-400">
                        {row.pos}
                      </td>
                      <td className="py-4 px-3">
                        <Link to={`/team/${row.teamId}`} className="flex items-center gap-2.5 hover:underline text-slate-800 dark:text-slate-100 font-bold group">
                          <SafeImage src={row.teamLogo} alt={row.teamName} className="w-6 h-6 object-contain group-hover:scale-105 transition-all p-0.5" fallbackType="team" />
                          <span>{row.teamName}</span>
                        </Link>
                      </td>
                      <td className="py-4 px-3 text-center font-black text-slate-905 dark:text-white font-mono bg-slate-50/30">
                        {row.points}
                      </td>
                      <td className="py-4 px-3 text-center font-mono font-semibold text-slate-500">{row.played}</td>
                      <td className="py-4 px-3 text-center font-mono text-emerald-600 font-semibold">{row.win}</td>
                      <td className="py-4 px-3 text-center font-mono text-slate-400">{row.draw}</td>
                      <td className="py-4 px-3 text-center font-mono text-rose-500">{row.lose}</td>
                      <td className={`py-4 px-3 text-center font-mono font-bold ${row.gd >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {row.gd > 0 ? `+${row.gd}` : row.gd}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
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
                <p className="text-sm font-semibold">{isPtStr ? "Sem partidas registradas nas últimas 2 hours" : "No registered matches in this window"}</p>
              </div>
            ) : (
              leagueMatches.map((match) => (
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
                      <span className="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm truncate">{match.teams.away.name}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
