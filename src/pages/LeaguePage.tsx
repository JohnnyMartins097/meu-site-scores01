import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Award, Calendar, ChevronLeft, Shield, Star, Table, Trophy, Users } from "lucide-react";
import { SafeImage } from "../components/SafeImage";
import { Match } from "../types";

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

// Complete realistic standings dataset for major supported leagues
const STANDINGS_DATA: Record<number, StandingRow[]> = {
  71: [ // Brasileirão Série A
    { pos: 1, teamId: 121, teamName: "Palmeiras", teamLogo: "https://media.api-sports.io/football/teams/121.png", played: 38, win: 22, draw: 9, lose: 7, gf: 61, ga: 29, gd: 32, points: 75 },
    { pos: 2, teamId: 127, teamName: "Flamengo", teamLogo: "https://media.api-sports.io/football/teams/127.png", played: 38, win: 21, draw: 10, lose: 7, gf: 68, ga: 35, gd: 33, points: 73 },
    { pos: 3, teamId: 126, teamName: "São Paulo", teamLogo: "https://media.api-sports.io/football/teams/126.png", played: 38, win: 18, draw: 12, lose: 8, gf: 50, ga: 33, gd: 17, points: 66 },
    { pos: 4, teamId: 131, teamName: "Corinthians", teamLogo: "https://media.api-sports.io/football/teams/131.png", played: 38, win: 15, draw: 10, lose: 13, gf: 44, ga: 40, gd: 4, points: 55 }
  ],
  140: [ // La Liga España
    { pos: 1, teamId: 541, teamName: "Real Madrid", teamLogo: "https://media.api-sports.io/football/teams/541.png", played: 38, win: 29, draw: 8, lose: 1, gf: 87, ga: 26, gd: 61, points: 95 },
    { pos: 2, teamId: 529, teamName: "Barcelona", teamLogo: "https://media.api-sports.io/football/teams/529.png", played: 38, win: 27, draw: 4, lose: 7, gf: 94, ga: 40, gd: 54, points: 85 }
  ]
};

// Top scorers datasets
const SCORERS_DATA: Record<number, Array<{ name: string; teamLogo: string; teamName: string; goals: number; assists: number; matches: number }>> = {
  71: [
    { name: "Pedro", teamLogo: "https://media.api-sports.io/football/teams/127.png", teamName: "Flamengo", goals: 21, assists: 4, matches: 29 },
    { name: "Estêvão", teamLogo: "https://media.api-sports.io/football/teams/121.png", teamName: "Palmeiras", goals: 12, assists: 8, matches: 28 },
    { name: "Yuri Alberto", teamLogo: "https://media.api-sports.io/football/teams/131.png", teamName: "Corinthians", goals: 11, assists: 2, matches: 26 }
  ],
  140: [
    { name: "Robert Lewandowski", teamLogo: "https://media.api-sports.io/football/teams/529.png", teamName: "Barcelona", goals: 24, assists: 5, matches: 31 },
    { name: "Kylian Mbappé", teamLogo: "https://media.api-sports.io/football/teams/541.png", teamName: "Real Madrid", goals: 20, assists: 6, matches: 29 },
    { name: "Vinicius Júnior", teamLogo: "https://media.api-sports.io/football/teams/541.png", teamName: "Real Madrid", goals: 18, assists: 9, matches: 28 }
  ]
};

const DEFAULT_STANDINGS = (leagueName: string): StandingRow[] => [
  { pos: 1, teamId: 127, teamName: "Flamengo", teamLogo: "https://media.api-sports.io/football/teams/127.png", played: 12, win: 8, draw: 3, lose: 1, gf: 24, ga: 10, gd: 14, points: 27 },
  { pos: 2, teamId: 121, teamName: "Palmeiras", teamLogo: "https://media.api-sports.io/football/teams/121.png", played: 12, win: 7, draw: 4, lose: 1, gf: 20, ga: 9, gd: 11, points: 25 },
  { pos: 3, teamId: 541, teamName: "Real Madrid", teamLogo: "https://media.api-sports.io/football/teams/541.png", played: 12, win: 6, draw: 4, lose: 2, gf: 18, ga: 11, gd: 7, points: 22 },
  { pos: 4, teamId: 529, teamName: "Barcelona", teamLogo: "https://media.api-sports.io/football/teams/529.png", played: 12, win: 5, draw: 4, lose: 3, gf: 14, ga: 13, gd: 1, points: 19 }
];

export default function LeaguePage({ matches, favorites, onToggleFavoriteLeague, language }: LeaguePageProps) {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<"table" | "scorers" | "calendar">("table");

  const leagueId = id ? parseInt(id, 10) : 71;
  const isPtStr = language.startsWith("pt");

  // Lookup in active fixtures to identify details of league
  const fixtureMatch = matches.find(m => m.league.id === leagueId);
  const leagueName = fixtureMatch?.league.name || (leagueId === 71 ? "Brasileirão Série A" : (leagueId === 140 ? "La Liga" : "Competição de Futebol"));
  const leagueLogo = fixtureMatch?.league.logo || `https://media.api-sports.io/football/leagues/${leagueId}.png`;
  const isFav = favorites.leagues.includes(leagueId);

  const standings = STANDINGS_DATA[leagueId] || DEFAULT_STANDINGS(leagueName);
  const scorers = SCORERS_DATA[leagueId] || [
    { name: "Jogador de Elite 1", teamLogo: "https://media.api-sports.io/football/teams/127.png", teamName: "Time A", goals: 9, assists: 3, matches: 12 },
    { name: "Jogador de Elite 2", teamLogo: "https://media.api-sports.io/football/teams/121.png", teamName: "Time B", goals: 7, assists: 4, matches: 11 },
    { name: "Jogador de Elite 3", teamLogo: "https://media.api-sports.io/football/teams/541.png", teamName: "Time C", goals: 6, assists: 2, matches: 10 }
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
                      <img src={scorer.teamLogo} alt={scorer.teamName} className="w-3.5 h-3.5 object-contain" />
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
                    {match.fixture.status.short === "FT" ? (
                      <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg leading-none font-mono font-extrabold text-sm border border-slate-200/50">
                        <span className="text-[#009c3b]">{match.goals.home}</span>
                        <span className="text-slate-300 font-bold">-</span>
                        <span className="text-[#009c3b]">{match.goals.away}</span>
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
