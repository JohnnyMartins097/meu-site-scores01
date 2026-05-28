import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Shield, Users, Calendar, Trophy, ChevronLeft, Target, Star, Flame, Award, MapPin } from "lucide-react";
import { SafeImage } from "../components/SafeImage";
import { Match } from "../types";

interface TeamPageProps {
  matches: Match[];
  favorites: { teams: string[] };
  onToggleFavoriteTeam: (teamName: string) => void;
  language: string;
}

const TEAM_INFOS: Record<number, {
  name: string;
  logo: string;
  coach: string;
  stadium: string;
  city: string;
  founded: number;
  squad: Array<{ name: string; number: number; pos: "G" | "D" | "M" | "F"; goals: number; cards: number }>;
  stats: { matches: number; wins: number; draws: number; losses: number; gf: number; ga: number };
}> = {
  127: {
    name: "Flamengo",
    logo: "https://media.api-sports.io/football/teams/127.png",
    coach: "Filipe Luís",
    stadium: "Maracanã",
    city: "Rio de Janeiro",
    founded: 1895,
    squad: [
      { name: "Rossi", number: 1, pos: "G", goals: 0, cards: 1 },
      { name: "Léo Ortiz", number: 3, pos: "D", goals: 2, cards: 3 },
      { name: "Léo Pereira", number: 4, pos: "D", goals: 3, cards: 4 },
      { name: "Ayrton Lucas", number: 6, pos: "D", goals: 2, cards: 2 },
      { name: "Erick Pulgar", number: 5, pos: "M", goals: 1, cards: 8 },
      { name: "Gerson", number: 8, pos: "M", goals: 6, cards: 4 },
      { name: "Arrascaeta", number: 14, pos: "M", goals: 8, cards: 2 },
      { name: "De la Cruz", number: 18, pos: "M", goals: 4, cards: 5 },
      { name: "Pedro", number: 9, pos: "F", goals: 28, cards: 1 },
      { name: "Gabigol", number: 99, pos: "F", goals: 12, cards: 3 },
      { name: "Bruno Henrique", number: 27, pos: "F", goals: 9, cards: 6 }
    ],
    stats: { matches: 38, wins: 24, draws: 8, losses: 6, gf: 68, ga: 32 }
  },
  121: {
    name: "Palmeiras",
    logo: "https://media.api-sports.io/football/teams/121.png",
    coach: "Abel Ferreira",
    stadium: "Allianz Parque",
    city: "São Paulo",
    founded: 1914,
    squad: [
      { name: "Weverton", number: 21, pos: "G", goals: 0, cards: 2 },
      { name: "Gustavo Gómez", number: 15, pos: "D", goals: 4, cards: 7 },
      { name: "Murilo", number: 26, pos: "D", goals: 3, cards: 5 },
      { name: "Mayke", number: 12, pos: "D", goals: 1, cards: 3 },
      { name: "Aníbal Moreno", number: 5, pos: "M", goals: 2, cards: 10 },
      { name: "Richard Ríos", number: 27, pos: "M", goals: 3, cards: 6 },
      { name: "Raphael Veiga", number: 23, pos: "M", goals: 15, cards: 4 },
      { name: "Maurício", number: 8, pos: "M", goals: 5, cards: 1 },
      { name: "Felipe Anderson", number: 9, pos: "F", goals: 4, cards: 2 },
      { name: "Rony", number: 10, pos: "F", goals: 11, cards: 3 },
      { name: "Estêvão", number: 41, pos: "F", goals: 14, cards: 2 }
    ],
    stats: { matches: 38, wins: 22, draws: 9, losses: 7, gf: 61, ga: 29 }
  },
  126: {
    name: "São Paulo",
    logo: "https://media.api-sports.io/football/teams/126.png",
    coach: "Luis Zubeldía",
    stadium: "MorumBIS",
    city: "São Paulo",
    founded: 1930,
    squad: [
      { name: "Rafael", number: 23, pos: "G", goals: 0, cards: 1 },
      { name: "Arboleda", number: 5, pos: "D", goals: 3, cards: 4 },
      { name: "Alan Franco", number: 2, pos: "D", goals: 1, cards: 8 },
      { name: "Wellington", number: 6, pos: "D", goals: 0, cards: 5 },
      { name: "Alisson", number: 25, pos: "M", goals: 2, cards: 4 },
      { name: "Pablo Maia", number: 29, pos: "M", goals: 1, cards: 6 },
      { name: "Rodrigo Nestor", number: 11, pos: "M", goals: 3, cards: 3 },
      { name: "Lucas Moura", number: 7, pos: "M", goals: 10, cards: 2 },
      { name: "Luciano", number: 10, pos: "F", goals: 15, cards: 11 },
      { name: "Calleri", number: 9, pos: "F", goals: 17, cards: 5 },
      { name: "Ferreirinha", number: 47, pos: "F", goals: 8, cards: 2 }
    ],
    stats: { matches: 38, wins: 18, draws: 10, losses: 10, gf: 52, ga: 38 }
  },
  131: {
    name: "Corinthians",
    logo: "https://media.api-sports.io/football/teams/131.png",
    coach: "Ramón Díaz",
    stadium: "Neo Química Arena",
    city: "São Paulo",
    founded: 1910,
    squad: [
      { name: "Hugo Souza", number: 1, pos: "G", goals: 0, cards: 2 },
      { name: "André Ramalho", number: 5, pos: "D", goals: 1, cards: 4 },
      { name: "Fagner", number: 23, pos: "D", goals: 0, cards: 9 },
      { name: "Matheus Bidu", number: 21, pos: "D", goals: 1, cards: 3 },
      { name: "Raniele", number: 14, pos: "M", goals: 0, cards: 11 },
      { name: "Rodrigo Garro", number: 10, pos: "M", goals: 9, cards: 8 },
      { name: "Yuri Alberto", number: 9, pos: "F", goals: 22, cards: 4 },
      { name: "Memphis Depay", number: 94, pos: "F", goals: 8, cards: 2 },
      { name: "Romero", number: 11, pos: "F", goals: 14, cards: 5 }
    ],
    stats: { matches: 38, wins: 14, draws: 12, losses: 12, gf: 46, ga: 41 }
  },
  541: {
    name: "Real Madrid",
    logo: "https://media.api-sports.io/football/teams/541.png",
    coach: "Carlo Ancelotti",
    stadium: "Santiago Bernabéu",
    city: "Madrid",
    founded: 1902,
    squad: [
      { name: "Thibaut Courtois", number: 1, pos: "G", goals: 0, cards: 0 },
      { name: "Antonio Rüdiger", number: 22, pos: "D", goals: 3, cards: 4 },
      { name: "Éder Militão", number: 3, pos: "D", goals: 1, cards: 5 },
      { name: "Ferland Mendy", number: 23, pos: "D", goals: 0, cards: 3 },
      { name: "Dani Carvajal", number: 2, pos: "D", goals: 2, cards: 6 },
      { name: "Federico Valverde", number: 8, pos: "M", goals: 5, cards: 2 },
      { name: "Eduardo Camavinga", number: 6, pos: "M", goals: 1, cards: 7 },
      { name: "Jude Bellingham", number: 5, pos: "M", goals: 19, cards: 4 },
      { name: "Vinicius Júnior", number: 7, pos: "F", goals: 24, cards: 8 },
      { name: "Kylian Mbappé", number: 9, pos: "F", goals: 26, cards: 2 },
      { name: "Rodrygo Goes", number: 11, pos: "F", goals: 15, cards: 1 }
    ],
    stats: { matches: 38, wins: 29, draws: 8, losses: 1, gf: 87, ga: 26 }
  },
  529: {
    name: "Barcelona",
    logo: "https://media.api-sports.io/football/teams/529.png",
    coach: "Hansi Flick",
    stadium: "Camp Nou",
    city: "Barcelona",
    founded: 1899,
    squad: [
      { name: "Marc-André ter Stegen", number: 1, pos: "G", goals: 0, cards: 1 },
      { name: "Pau Cubarsí", number: 2, pos: "D", goals: 0, cards: 3 },
      { name: "Inigo Martínez", number: 5, pos: "D", goals: 2, cards: 6 },
      { name: "Alejandro Balde", number: 3, pos: "D", goals: 1, cards: 2 },
      { name: "Pedri González", number: 8, pos: "M", goals: 7, cards: 3 },
      { name: "Marc Casadó", number: 17, pos: "M", goals: 1, cards: 7 },
      { name: "Gavi", number: 6, pos: "M", goals: 2, cards: 9 },
      { name: "Raphinha Dias", number: 11, pos: "F", goals: 18, cards: 4 },
      { name: "Lamine Yamal", number: 19, pos: "F", goals: 12, cards: 1 },
      { name: "Robert Lewandowski", number: 9, pos: "F", goals: 32, cards: 2 }
    ],
    stats: { matches: 38, wins: 27, draws: 4, losses: 7, gf: 94, ga: 40 }
  }
};

export default function TeamPage({ matches, favorites, onToggleFavoriteTeam, language }: TeamPageProps) {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<"squad" | "games" | "results" | "stats">("squad");

  const teamId = id ? parseInt(id, 10) : 127;
  const isPtStr = language.startsWith("pt");

  // Fallback to basic details if ID not registered in static dataset
  const dynamicTeam = matches.find(m => m.teams.home.id === teamId || m.teams.away.id === teamId);
  const matchedInfo = TEAM_INFOS[teamId] || {
    name: dynamicTeam?.teams.home.id === teamId ? dynamicTeam?.teams.home.name : (dynamicTeam?.teams.away.name || "Time Desconhecido"),
    logo: dynamicTeam?.teams.home.id === teamId ? dynamicTeam?.teams.home.logo : (dynamicTeam?.teams.away.logo || `https://img.sofascore.com/api/v1/team/${teamId}/image`),
    coach: "Técnico Licenciado",
    stadium: "Estádio Municipal",
    city: "Cidade Sede",
    founded: 1900,
    squad: [
      { name: "Goleiro Titular", number: 1, pos: "G" as const, goals: 0, cards: 1 },
      { name: "Zagueiro Central", number: 3, pos: "D" as const, goals: 1, cards: 3 },
      { name: "Lateral Ofensivo", number: 6, pos: "D" as const, goals: 2, cards: 2 },
      { name: "Volante de Saída", number: 5, pos: "M" as const, goals: 2, cards: 4 },
      { name: "Meia Armador", number: 10, pos: "M" as const, goals: 7, cards: 3 },
      { name: "Ponta de Velocidade", number: 7, pos: "F" as const, goals: 9, cards: 2 },
      { name: "Centroavante Goleador", number: 9, pos: "F" as const, goals: 14, cards: 2 }
    ],
    stats: { matches: 30, wins: 15, draws: 8, losses: 7, gf: 45, ga: 30 }
  };

  const isFavorite = favorites.teams.includes(matchedInfo.name);

  // Extract from state matches involving this team
  const teamFixtures = matches.filter(m => m.teams.home.id === teamId || m.teams.away.id === teamId);
  const finishedMatches = teamFixtures.filter(m => m.fixture.status.short === "FT");
  const upcomingMatches = teamFixtures.filter(m => m.fixture.status.short !== "FT");

  const getPositionLabel = (pos: "G" | "D" | "M" | "F") => {
    if (pos === "G") return isPtStr ? "Goleiro" : "Goalkeeper";
    if (pos === "D") return isPtStr ? "Defensor" : "Defender";
    if (pos === "M") return isPtStr ? "Meio-Campo" : "Midfielder";
    return isPtStr ? "Atacante" : "Forward";
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen pb-12">
      {/* Banner / Header Component */}
      <div className="bg-gradient-to-r from-[#009c3b] to-emerald-800 text-white relative py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-6">
          <Link
            to="/"
            className="absolute top-4 left-4 flex items-center gap-1 text-xs font-bold text-white/80 hover:text-white bg-black/15 py-1.5 px-3 rounded-full transition-all focus:outline-none"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{isPtStr ? "Voltar ao Início" : "Back to Home"}</span>
          </Link>

          <SafeImage
            src={matchedInfo.logo}
            alt={matchedInfo.name}
            className="w-24 h-24 object-contain bg-white/10 dark:bg-black/20 p-3 rounded-2xl border border-white/20 shadow-lg"
            fallbackType="team"
          />

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-2 justify-center md:justify-start">
              <h1 className="text-3xl md:text-4xl font-display font-black tracking-tight flex items-center justify-center md:justify-start gap-3">
                {matchedInfo.name}
              </h1>
              <button
                onClick={() => onToggleFavoriteTeam(matchedInfo.name)}
                className="self-center p-1.5 bg-white/10 hover:bg-white/20 rounded-full cursor-pointer transition-all border border-white/15 active:scale-95"
                title={isPtStr ? "Favoritar Time" : "Add to Favorites"}
              >
                <Star className={`w-5 h-5 ${isFavorite ? "fill-amber-400 text-amber-400" : "text-white/60"}`} />
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3 text-sm text-emerald-100 font-medium">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 opacity-80" />
                {matchedInfo.city}
              </span>
              <span>•</span>
              <span>{isPtStr ? "Estádio: " : "Stadium: "}{matchedInfo.stadium}</span>
              <span>•</span>
              <span>Fundado em {matchedInfo.founded}</span>
            </div>
          </div>

          <div className="flex gap-4 select-none bg-black/15 rounded-xl p-4 border border-white/10 shrink-0 text-center">
            <div>
              <div className="text-2xl font-mono font-black">{matchedInfo.stats.wins}</div>
              <div className="text-[10px] uppercase font-bold text-emerald-200">{isPtStr ? "Vitórias" : "Wins"}</div>
            </div>
            <div className="border-l border-white/10" />
            <div>
              <div className="text-2xl font-mono font-black">{matchedInfo.stats.draws}</div>
              <div className="text-[10px] uppercase font-bold text-emerald-200">{isPtStr ? "Empates" : "Draws"}</div>
            </div>
            <div className="border-l border-white/10" />
            <div>
              <div className="text-2xl font-mono font-black">{matchedInfo.stats.losses}</div>
              <div className="text-[10px] uppercase font-bold text-emerald-200">{isPtStr ? "Derrotas" : "Losses"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-3xs">
        <div className="max-w-7xl mx-auto px-6 flex items-center overflow-x-auto select-none">
          <button
            onClick={() => setActiveTab("squad")}
            className={`py-4 px-5 text-sm font-semibold border-b-2 cursor-pointer transition-all ${
              activeTab === "squad"
                ? "border-[#009c3b] text-[#009c3b] font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-250"
            }`}
          >
            <span className="flex items-center gap-1.5 justify-center">
              <Users className="w-4 h-4" />
              {isPtStr ? "Plantel" : "Squad / Players"}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("games")}
            className={`py-4 px-5 text-sm font-semibold border-b-2 cursor-pointer transition-all ${
              activeTab === "games"
                ? "border-[#009c3b] text-[#009c3b] font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-250"
            }`}
          >
            <span className="flex items-center gap-1.5 justify-center">
              <Calendar className="w-4 h-4" />
              {isPtStr ? "Próximos Jogos" : "Upcoming Matches"}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("results")}
            className={`py-4 px-5 text-sm font-semibold border-b-2 cursor-pointer transition-all ${
              activeTab === "results"
                ? "border-[#009c3b] text-[#009c3b] font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-250"
            }`}
          >
            <span className="flex items-center gap-1.5 justify-center">
              <Trophy className="w-4 h-4" />
              {isPtStr ? "Resultados Recentes" : "Recent Results"}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`py-4 px-5 text-sm font-semibold border-b-2 cursor-pointer transition-all ${
              activeTab === "stats"
                ? "border-[#009c3b] text-[#009c3b] font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-250"
            }`}
          >
            <span className="flex items-center gap-1.5 justify-center">
              <Flame className="w-4 h-4" />
              {isPtStr ? "Estatísticas Gerais" : "Team Stats"}
            </span>
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      <div className="max-w-7xl mx-auto px-6 mt-8">
        {/* SQUAD / PLANTEL CARD LIST */}
        {activeTab === "squad" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {matchedInfo.squad.map((player, idx) => (
              <Link
                key={idx}
                to={`/player/${encodeURIComponent(player.name)}`}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-150 dark:border-slate-800 shadow-2xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 p-4 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-mono font-black text-emerald-600 dark:text-emerald-400 border border-slate-200/50">
                    {player.number}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-850 dark:text-slate-100 leading-tight">
                      {player.name}
                    </h3>
                    <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">
                      {getPositionLabel(player.pos)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 font-mono">
                  {player.goals > 0 && (
                    <div className="text-center bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-1 rounded-md" title="Gols marcados">
                      <div className="text-xs font-black text-emerald-600 dark:text-emerald-400">⚽ {player.goals}</div>
                    </div>
                  )}
                  {player.cards > 0 && (
                    <div className="text-center bg-amber-50 dark:bg-amber-950/20 px-2 py-1 rounded-md" title="Média de cartões">
                      <div className="text-[10px] font-black text-amber-500">🟨 {player.cards}</div>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* UPCOMING MATCHES / PROXIMOS JOGOS */}
        {activeTab === "games" && (
          <div className="max-w-3xl mx-auto space-y-4">
            {upcomingMatches.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 p-6">
                <Calendar className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                <h3 className="font-bold text-slate-800 dark:text-slate-100">{isPtStr ? "Nenhuma partida agendada" : "No scheduled matches"}</h3>
                <p className="text-xs text-slate-400 mt-1">Este time não possui novos confrontos imediatos no calendário ativo.</p>
              </div>
            ) : (
              upcomingMatches.map((match) => (
                <div key={match.fixture.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-800/80 p-5 shadow-2xs">
                  <div className="flex justify-between items-center text-xs text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                    <span className="uppercase tracking-wider text-emerald-600">{match.league.name}</span>
                    <span>{new Date(match.fixture.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 py-2">
                    <div className="flex items-center gap-3 flex-1 justify-end text-right">
                      <span className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate">{match.teams.home.name}</span>
                      <SafeImage src={match.teams.home.logo} alt={match.teams.home.name} className="w-8 h-8 object-contain" fallbackType="team" />
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-800 font-mono font-bold text-xs px-3.5 py-1.5 rounded-lg select-none uppercase tracking-wide">
                      {new Date(match.fixture.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex items-center gap-3 flex-1 text-left">
                      <SafeImage src={match.teams.away.logo} alt={match.teams.away.name} className="w-8 h-8 object-contain" fallbackType="team" />
                      <span className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate">{match.teams.away.name}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* RESULTS / RESULTADOS RECENTES */}
        {activeTab === "results" && (
          <div className="max-w-3xl mx-auto space-y-4">
            {finishedMatches.length === 0 ? (
              <div className="p-4 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-150/80 mt-2">
                <h3 className="font-bold text-slate-700 dark:text-slate-300">Nenhum resultado finalizado encontrado ainda nas últimas 24h.</h3>
                <p className="text-xs text-slate-400 mt-1.5">Consulte estatísticas detalhadas do time clicando em "Estatísticas Gerais".</p>
              </div>
            ) : (
              finishedMatches.map((match) => {
                const isHomeWinner = match.teams.home.winner;
                const isAwayWinner = match.teams.away.winner;
                return (
                  <div key={match.fixture.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-800/80 p-5 shadow-2xs">
                    <div className="flex justify-between items-center text-xs text-slate-400 font-semibold border-b border-slate-100 pb-3 mb-4">
                      <span>{match.league.name}</span>
                      <span>{new Date(match.fixture.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 py-2">
                      <div className="flex items-center gap-3 flex-1 justify-end text-right">
                        <span className={`text-sm truncate ${isHomeWinner ? "font-black text-slate-900 dark:text-white" : "font-semibold text-slate-500"}`}>{match.teams.home.name}</span>
                        <SafeImage src={match.teams.home.logo} alt={match.teams.home.name} className="w-8 h-8 object-contain" fallbackType="team" />
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl leading-none font-mono font-extrabold text-base border border-slate-150/50">
                        <span className="text-[#009c3b]">{match.goals.home}</span>
                        <span className="text-slate-300 text-xs font-bold">-</span>
                        <span className="text-[#009c3b]">{match.goals.away}</span>
                      </div>
                      <div className="flex items-center gap-3 flex-1 text-left">
                        <SafeImage src={match.teams.away.logo} alt={match.teams.away.name} className="w-8 h-8 object-contain" fallbackType="team" />
                        <span className={`text-sm truncate ${isAwayWinner ? "font-black text-slate-900 dark:text-white" : "font-semibold text-slate-500"}`}>{match.teams.away.name}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TEAM STATISTICS PANEL */}
        {activeTab === "stats" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 rounded-2xl p-6 shadow-2xs">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-6">
              <Award className="w-5 h-5 text-emerald-600" />
              {isPtStr ? "Desempenho Geral na Temporada" : "Overall Season Statistics"}
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-slate-50 dark:bg-slate-950 p-4 border border-slate-100 rounded-xl text-center">
                <div className="text-xs text-slate-400 font-bold uppercase">{isPtStr ? "Jogos" : "Matches"}</div>
                <div className="text-3xl font-mono font-black mt-2 text-slate-800 dark:text-white">{matchedInfo.stats.matches}</div>
              </div>
              <div className="bg-emerald-50/20 dark:bg-emerald-950/25 p-4 border border-emerald-100/10 rounded-xl text-center">
                <div className="text-xs text-emerald-600 font-bold uppercase">{isPtStr ? "Gols Pró" : "Goals For"}</div>
                <div className="text-3xl font-mono font-black mt-2 text-emerald-600">{matchedInfo.stats.gf}</div>
              </div>
              <div className="bg-rose-50/20 dark:bg-rose-950/25 p-4 border border-rose-100/10 rounded-xl text-center">
                <div className="text-xs text-rose-500 font-bold uppercase">{isPtStr ? "Gols Contra" : "Goals Against"}</div>
                <div className="text-3xl font-mono font-black mt-2 text-rose-500">{matchedInfo.stats.ga}</div>
              </div>
              <div className="bg-blue-50/20 dark:bg-blue-950/25 p-4 border border-blue-100/10 rounded-xl text-center">
                <div className="text-xs text-blue-500 font-bold uppercase">{isPtStr ? "Aproveitamento" : "Win Rate"}</div>
                <div className="text-3xl font-mono font-black mt-2 text-blue-500">
                  {Math.round((matchedInfo.stats.wins / matchedInfo.stats.matches) * 100)}%
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none select-none mb-4">
                {isPtStr ? "Comparativos Técnicos" : "Technical Metrics"}
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between text-xs font-bold text-slate-700 px-1">
                  <span>Média de Gols Marcados</span>
                  <span>{(matchedInfo.stats.gf / matchedInfo.stats.matches).toFixed(2)} / jogo</span>
                </div>
                <div className="w-full bg-slate-150 h-2.5 rounded-full overflow-hidden flex">
                  <div className="h-full bg-[#009c3b]" style={{ width: "78%" }} />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-xs font-bold text-slate-700 px-1">
                  <span>Média de Gols Sofridos</span>
                  <span>{(matchedInfo.stats.ga / matchedInfo.stats.matches).toFixed(2)} / jogo</span>
                </div>
                <div className="w-full bg-slate-150 h-2.5 rounded-full overflow-hidden flex">
                  <div className="h-full bg-amber-400" style={{ width: "35%" }} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
