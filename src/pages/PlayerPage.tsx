import React from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, Star, Award, Shield, Calendar, Flame, Activity } from "lucide-react";

interface PlayerPageProps {
  favorites: { players: string[] };
  onToggleFavoritePlayer: (playerName: string) => void;
  language: string;
}

interface PlayerDetails {
  name: string;
  teamName: string;
  teamLogo: string;
  number: number;
  pos: "GK" | "DF" | "MF" | "FW";
  age: number;
  nationality: string;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  matchesPlayed: number;
}

const ATHLETE_REGISTRY: Record<string, PlayerDetails> = {
  "Pedro": {
    name: "Pedro",
    teamName: "Flamengo",
    teamLogo: "https://media.api-sports.io/football/teams/127.png",
    number: 9,
    pos: "FW",
    age: 28,
    nationality: "Brasil",
    goals: 28,
    assists: 4,
    yellowCards: 1,
    redCards: 0,
    matchesPlayed: 34
  },
  "Gerson": {
    name: "Gerson",
    teamName: "Flamengo",
    teamLogo: "https://media.api-sports.io/football/teams/127.png",
    number: 8,
    pos: "MF",
    age: 29,
    nationality: "Brasil",
    goals: 6,
    assists: 9,
    yellowCards: 4,
    redCards: 1,
    matchesPlayed: 36
  },
  "Arrascaeta": {
    name: "Arrascaeta",
    teamName: "Flamengo",
    teamLogo: "https://media.api-sports.io/football/teams/127.png",
    number: 14,
    pos: "MF",
    age: 31,
    nationality: "Uruguai",
    goals: 8,
    assists: 10,
    yellowCards: 2,
    redCards: 0,
    matchesPlayed: 28
  },
  "Gabigol": {
    name: "Gabigol",
    teamName: "Flamengo",
    teamLogo: "https://media.api-sports.io/football/teams/127.png",
    number: 99,
    pos: "FW",
    age: 29,
    nationality: "Brasil",
    goals: 12,
    assists: 2,
    yellowCards: 3,
    redCards: 0,
    matchesPlayed: 25
  },
  "Estêvão": {
    name: "Estêvão",
    teamName: "Palmeiras",
    teamLogo: "https://media.api-sports.io/football/teams/121.png",
    number: 41,
    pos: "FW",
    age: 19,
    nationality: "Brasil",
    goals: 14,
    assists: 8,
    yellowCards: 2,
    redCards: 0,
    matchesPlayed: 28
  },
  "Raphael Veiga": {
    name: "Raphael Veiga",
    teamName: "Palmeiras",
    teamLogo: "https://media.api-sports.io/football/teams/121.png",
    number: 23,
    pos: "MF",
    age: 30,
    nationality: "Brasil",
    goals: 15,
    assists: 6,
    yellowCards: 4,
    redCards: 0,
    matchesPlayed: 33
  },
  "Robert Lewandowski": {
    name: "Robert Lewandowski",
    teamName: "Barcelona",
    teamLogo: "https://media.api-sports.io/football/teams/529.png",
    number: 9,
    pos: "FW",
    age: 37,
    nationality: "Polônia",
    goals: 32,
    assists: 5,
    yellowCards: 2,
    redCards: 0,
    matchesPlayed: 35
  },
  "Vinicius Júnior": {
    name: "Vinicius Júnior",
    teamName: "Real Madrid",
    teamLogo: "https://media.api-sports.io/football/teams/541.png",
    number: 7,
    pos: "FW",
    age: 25,
    nationality: "Brasil",
    goals: 24,
    assists: 9,
    yellowCards: 8,
    redCards: 0,
    matchesPlayed: 31
  },
  "Kylian Mbappé": {
    name: "Kylian Mbappé",
    teamName: "Real Madrid",
    teamLogo: "https://media.api-sports.io/football/teams/541.png",
    number: 9,
    pos: "FW",
    age: 27,
    nationality: "França",
    goals: 26,
    assists: 6,
    yellowCards: 2,
    redCards: 0,
    matchesPlayed: 30
  }
};

export default function PlayerPage({ favorites, onToggleFavoritePlayer, language }: PlayerPageProps) {
  const { id } = useParams<{ id: string }>();
  const isPtStr = language.startsWith("pt");

  // Lookup in athlete registry using URL decoded params
  const playerName = id ? decodeURIComponent(id) : "Pedro";
  const athlete = ATHLETE_REGISTRY[playerName] || {
    name: playerName,
    teamName: "Clube de Futebol",
    teamLogo: "https://media.api-sports.io/football/teams/127.png",
    number: 10,
    pos: "MF" as const,
    age: 26,
    nationality: "Internacional",
    goals: 8,
    assists: 4,
    yellowCards: 3,
    redCards: 1,
    matchesPlayed: 15
  };

  const isFav = favorites.players.includes(athlete.name);

  const getPositionText = (pos: "GK" | "DF" | "MF" | "FW") => {
    if (pos === "GK") return isPtStr ? "Goleiro" : "Goalkeeper";
    if (pos === "DF") return isPtStr ? "Defensor" : "Defender";
    if (pos === "MF") return isPtStr ? "Meio-Campista" : "Midfielder";
    return isPtStr ? "Atacante" : "Forward";
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen pb-12 select-none">
      {/* Visual Header */}
      <div className="bg-slate-900 text-white relative py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <Link
            to="/"
            className="absolute top-4 left-4 flex items-center gap-1 text-xs font-bold text-white/80 hover:text-white bg-black/30 py-1.5 px-3 rounded-full transition-all focus:outline-none"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{isPtStr ? "Voltar ao Início" : "Back to Home"}</span>
          </Link>

          {/* Jersey visual placeholder */}
          <div className="relative w-28 h-28 bg-[#009c3b] rounded-full flex items-center justify-center shadow-lg shrink-0 border-4 border-emerald-500 overflow-hidden">
            <div className="absolute inset-x-0 bottom-0 bg-emerald-850 h-10 flex items-center justify-center font-black text-2xl font-mono text-white select-none">
              {athlete.number}
            </div>
            <span className="text-4xl text-white/30 font-display font-black leading-none mb-4">👕</span>
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-3 justify-center md:justify-start">
              <h1 className="text-3xl md:text-4.5xl font-display font-black tracking-tight flex items-center justify-center md:justify-start gap-4">
                {athlete.name}
              </h1>
              <button
                onClick={() => onToggleFavoritePlayer(athlete.name)}
                className="self-center p-1.5 bg-white/10 hover:bg-white/20 rounded-full cursor-pointer transition-all border border-white/10 active:scale-95"
                title={isPtStr ? "Favoritar Jogador" : "Favorite Player"}
              >
                <Star className={`w-4.5 h-4.5 ${isFav ? "fill-amber-400 text-amber-400" : "text-white/60"}`} />
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3 text-sm text-slate-300 font-medium">
              <span className="bg-[#ffdf00] text-slate-900 text-[10px] font-black px-2.5 py-0.5 rounded-sm tracking-wider uppercase">
                {getPositionText(athlete.pos)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 font-bold">
                <img src={athlete.teamLogo} alt={athlete.teamName} className="w-5 h-5 object-contain" />
                {athlete.teamName}
              </span>
              <span>•</span>
              <span>{athlete.nationality}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Panel */}
      <div className="max-w-4xl mx-auto px-6 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bio Data Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              {isPtStr ? "Ficha Técnica" : "Biographical Data"}
            </h2>

            <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2.5">
              <span className="text-slate-400 font-medium">{isPtStr ? "Idade / Nascimento" : "Age"}</span>
              <span className="font-bold text-slate-700 dark:text-slate-200">{athlete.age} {isPtStr ? "anos" : "years"}</span>
            </div>
            <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2.5">
              <span className="text-slate-400 font-medium">{isPtStr ? "Nacionalidade" : "Nationality"}</span>
              <span className="font-bold text-slate-705 dark:text-slate-200">{athlete.nationality}</span>
            </div>
            <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2.5">
              <span className="text-slate-400 font-medium">{isPtStr ? "Time Atual" : "Current Team"}</span>
              <span className="font-bold text-slate-705 dark:text-slate-200">{athlete.teamName}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400 font-medium">{isPtStr ? "Camisa" : "Jersey number"}</span>
              <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">Nº {athlete.number}</span>
            </div>
          </div>

          {/* Performance Dashboard */}
          <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-6 shadow-2xs">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-6">
              <Flame className="w-4 h-4 text-emerald-600" />
              {isPtStr ? "Estatísticas da Temporada" : "Season Metrics"}
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-50 dark:bg-slate-950 p-4 border border-slate-100 rounded-xl text-center">
                <div className="text-[10px] text-slate-400 font-black uppercase tracking-wider">{isPtStr ? "Jogos" : "Matches"}</div>
                <div className="text-2.5xl font-mono font-black mt-2 text-slate-850 dark:text-white">{athlete.matchesPlayed}</div>
              </div>

              <div className="bg-emerald-50/20 dark:bg-emerald-950/25 p-4 border border-emerald-100/10 rounded-xl text-center">
                <div className="text-[10px] text-emerald-600 font-black uppercase tracking-wider">{isPtStr ? "Gols" : "Goals"}</div>
                <div className="text-2.5xl font-mono font-black mt-2 text-[#009c3b]">{athlete.goals}</div>
              </div>

              <div className="bg-emerald-50/10 dark:bg-emerald-950/15 p-4 border border-emerald-100/10 rounded-xl text-center">
                <div className="text-[10px] text-emerald-500 font-black uppercase tracking-wider">{isPtStr ? "Assist." : "Assists"}</div>
                <div className="text-2.5xl font-mono font-black mt-2 text-emerald-600">{athlete.assists}</div>
              </div>

              <div className="bg-amber-50/20 dark:bg-amber-950/25 p-4 border border-amber-100/10 rounded-xl text-center font-mono">
                <div className="text-[10px] text-amber-500 font-black uppercase tracking-wider">{isPtStr ? "Cartões" : "Cards"}</div>
                <div className="text-[14px] font-black mt-3 flex justify-center gap-1.5 leading-none">
                  <span className="text-amber-503">🟨 {athlete.yellowCards}</span>
                  <span className="text-rose-500">🟥 {athlete.redCards}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 mt-6 pt-5 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Aproveitamento Médio</h3>
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>Média de Gols por Partida</span>
                <span className="font-mono font-bold text-emerald-600">{(athlete.goals / athlete.matchesPlayed).toFixed(2)} / jogo</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-[#009c3b]" style={{ width: `${Math.min(95, (athlete.goals / athlete.matchesPlayed) * 100)}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
