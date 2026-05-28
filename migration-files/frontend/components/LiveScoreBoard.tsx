"use client";

import React, { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { 
  Trophy, 
  MapPin, 
  Radio, 
  Calendar, 
  Tv, 
  AlertCircle,
  Clock
} from "lucide-react";

// Definição de interface de dados para consistência tipada (TypeScript Sênior)
interface Match {
  fixture: {
    id: number;
    referee: string;
    date: string;
    venue: {
      name: string;
      city: string;
    };
    status: {
      long: string;
      short: string;
      elapsed: number;
    };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
  };
  teams: {
    home: { id: number; name: string; logo: string; winner: boolean | null };
    away: { id: number; name: string; logo: string; winner: boolean | null };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  broadcast?: string;
}

export default function LiveScoreBoard() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"all" | "live" | "finished">("all");

  // Endpoint do servidor backend Node.js (Ajuste para produção conforme necessário)
  const BACKEND_URL = "http://localhost:3001";

  // Buscar calendário e partidas no primeiro ciclo de montagem
  useEffect(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    setSelectedDate(todayStr);
    fetchInitialFixtures(todayStr);
  }, []);

  // Handler de fecthing para buscar os dados de partidas via REST
  const fetchInitialFixtures = async (dateStr: string) => {
    setLoading(true);
    setError(null);
    try {
      // Chamando os endpoints REST dedicados do backend
      const res = await fetch(`${BACKEND_URL}/api/fixtures?date=${dateStr}&bypass=true`);
      if (!res.ok) {
        throw new Error("Falha ao consultar a API HTTP de resultados principais");
      }
      const data = await res.json();
      setMatches(data.response || []);
    } catch (err: any) {
      console.error(err);
      setError("Não foi possível estabelecer contato com o servidor backend.");
    } finally {
      setLoading(false);
    }
  };

  // WS Integrator - Integração reativa via WebSocket (Socket.io-client)
  useEffect(() => {
    // Inicializar o canal de sockets reativos de alta velocidade
    const socket: Socket = io(BACKEND_URL);

    socket.on("connect", () => {
      console.log("🔌 Canal WebSocket síncrono registrado com sucesso!");
    });

    // Escutar eventos de atualização de placar de futebol em tempo real
    socket.on("matchUpdate", (updatedMatch: Match) => {
      console.log("⚽ Recebido novo evento matchUpdate para ID:", updatedMatch.fixture.id);
      
      setMatches((prevMatches) => {
        // Encontrar e substituir o jogo que recebeu a alteração via live WS
        return prevMatches.map((m) => {
          if (m.fixture.id === updatedMatch.fixture.id) {
            return {
              ...m,
              fixture: { ...m.fixture, status: updatedMatch.fixture.status },
              goals: updatedMatch.goals,
              teams: {
                ...m.teams,
                home: { ...m.teams.home, winner: updatedMatch.teams.home.winner },
                away: { ...m.teams.away, winner: updatedMatch.teams.away.winner }
              }
            };
          }
          return m;
        });
      });
    });

    socket.on("disconnect", () => {
      console.warn("🔌 Link com o WebSocket backend foi perdido de forma momentânea.");
    });

    // Encerrar a escuta do socket ao desmontar o componente para evitar vazamento de threads
    return () => {
      socket.disconnect();
    };
  }, [BACKEND_URL]);

  // Filtragem de tabs no nível do cliente para fins de performance
  const filteredMatches = matches.filter((match) => {
    const status = match.fixture.status.short;
    if (activeTab === "live") {
      return ["1H", "2H", "HT", "ET", "BT", "INT"].includes(status);
    }
    if (activeTab === "finished") {
      return status === "FT";
    }
    return true; // "all"
  });

  // Agrupamento de partidas por liga/campeonato
  const groupMatchesByLeague = () => {
    const groups: Record<string, { league: Match["league"]; matches: Match[] }> = {};
    filteredMatches.forEach((match) => {
      const leagueId = match.league.id;
      if (!groups[leagueId]) {
        groups[leagueId] = {
          league: match.league,
          matches: []
        };
      }
      groups[leagueId].matches.push(match);
    });
    return Object.values(groups);
  };

  const groupedLeagues = groupMatchesByLeague();

  return (
    <div className="space-y-6">
      {/* Controles do Menu de Status */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-900/40 p-3 rounded-2xl border border-slate-900">
        <div className="flex bg-slate-950 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition-all duration-250 ${
              activeTab === "all" ? "bg-blue-600 text-white shadow-md shadow-blue-900/30" : "text-slate-400 hover:text-white"
            }`}
          >
            Todos ({matches.length})
          </button>
          <button
            onClick={() => setActiveTab("live")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition-all duration-250 flex items-center gap-1.5 ${
              activeTab === "live" ? "bg-red-650 text-white shadow-md bg-red-600 shadow-red-950/20" : "text-slate-400 hover:text-white"
            }`}
          >
            <span className={`inline-block h-1.5 w-1.5 rounded-full bg-red-500 ${activeTab !== "live" && "animate-pulse"}`} />
            Ao Vivo (
            {
              matches.filter((m) =>
                ["1H", "2H", "HT", "ET", "BT", "INT"].includes(m.fixture.status.short)
              ).length
            }
            )
          </button>
          <button
            onClick={() => setActiveTab("finished")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition-all duration-250 ${
              activeTab === "finished" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Finalizados ({matches.filter((m) => m.fixture.status.short === "FT").length})
          </button>
        </div>

        {/* Campo seletor de dados calendários */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              fetchInitialFixtures(e.target.value);
            }}
            className="bg-slate-950 border border-slate-900 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500/50"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-800 border-t-blue-500 mx-auto" />
          <p className="text-slate-400 text-xs">Sincronizando feed de eventos com o backend...</p>
        </div>
      ) : error ? (
        <div className="bg-red-500/5 border border-red-500/10 p-6 rounded-2xl flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <p className="text-xs text-red-300">{error}</p>
        </div>
      ) : groupedLeagues.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/10 rounded-3xl border border-slate-950 px-4">
          <p className="text-slate-500 text-xs">Nenhum placar de futebol correspondente na aba ativa.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedLeagues.map((group) => (
            <div key={group.league.id} className="bg-slate-900/20 border border-slate-900 rounded-3xl overflow-hidden shadow-sm">
              
              {/* Seção Cabeçalho da Liga */}
              <div className="bg-slate-950/40 border-b border-slate-900 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={group.league.logo} alt={group.league.name} className="h-6 w-6 object-contain" referrerPolicy="no-referrer" />
                  <div>
                    <h3 className="font-semibold text-xs text-white tracking-tight">{group.league.name}</h3>
                    <p className="text-[10px] text-slate-500 capitalize">{group.league.country}</p>
                  </div>
                </div>
                <img src={group.league.flag} alt={group.league.country} className="h-3.5 object-cover w-5 rounded-sm border border-slate-900" referrerPolicy="no-referrer" />
              </div>

              {/* Grid das Partidas Ativas da Liga */}
              <div className="divide-y divide-slate-900">
                {group.matches.map((match) => {
                  const isLive = ["1H", "2H", "HT", "ET", "BT", "INT"].includes(match.fixture.status.short);
                  
                  return (
                    <div 
                      key={match.fixture.id} 
                      className={`p-6 transition-colors duration-200 hover:bg-slate-900/10`}
                    >
                      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        
                        {/* Time Mandante */}
                        <div className="flex-1 flex items-center justify-end gap-3 w-full order-1">
                          <span className={`font-medium text-xs text-slate-200 text-right ${match.teams.home.winner && "text-blue-400 font-bold"}`}>
                            {match.teams.home.name}
                          </span>
                          <div className="h-9 w-9 bg-slate-950 rounded-xl p-1.5 border border-slate-900 shrink-0 flex items-center justify-center">
                            <img src={match.teams.home.logo} alt={match.teams.home.name} className="h-full w-full object-contain" referrerPolicy="no-referrer" />
                          </div>
                        </div>

                        {/* Placar Real-Time síncrono via WebSocket */}
                        <div className="flex flex-col items-center justify-center min-w-[120px] order-2 gap-1 bg-slate-950/50 p-3 rounded-2xl border border-slate-900">
                          <div className="flex items-center gap-1">
                            <span className="text-xl font-bold font-mono tracking-tight text-white select-all">
                              {match.goals.home !== null ? match.goals.home : "-"}
                            </span>
                            <span className="text-slate-600 text-[10px] font-mono mx-1">:</span>
                            <span className="text-xl font-bold font-mono tracking-tight text-white select-all">
                              {match.goals.away !== null ? match.goals.away : "-"}
                            </span>
                          </div>

                          {/* Badge de Status Relativo */}
                          <div className="flex items-center gap-1.5 mt-1">
                            {isLive ? (
                              <div className="flex items-center gap-1 text-[10px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/10">
                                <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
                                <span className="font-semibold uppercase">{match.fixture.status.short === "HT" ? "Intervalo" : `${match.fixture.status.elapsed}'`}</span>
                              </div>
                            ) : match.fixture.status.short === "FT" ? (
                              <span className="text-[10px] text-slate-500 bg-slate-900/50 px-2 py-0.5 rounded-full">Encerrado</span>
                            ) : (
                              <span className="text-[10px] text-slate-400 bg-slate-900/20 border border-slate-900 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Clock className="h-3 w-3 text-slate-500" />
                                {new Date(match.fixture.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Time Visitante */}
                        <div className="flex-1 flex items-center justify-start gap-3 w-full order-3">
                          <div className="h-9 w-9 bg-slate-950 rounded-xl p-1.5 border border-slate-900 shrink-0 flex items-center justify-center">
                            <img src={match.teams.away.logo} alt={match.teams.away.name} className="h-full w-full object-contain" referrerPolicy="no-referrer" />
                          </div>
                          <span className={`font-medium text-xs text-slate-200 text-left ${match.teams.away.winner && "text-blue-400 font-bold"}`}>
                            {match.teams.away.name}
                          </span>
                        </div>

                      </div>

                      {/* Informações Auxiliares do Palco */}
                      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[10px] text-slate-500 border-t border-slate-900/50 pt-3">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{match.fixture.venue.name}, {match.fixture.venue.city}</span>
                        </div>
                        {match.broadcast && (
                          <div className="flex items-center gap-1">
                            <Tv className="h-3 w-3" />
                            <span>Transmissão: {match.broadcast}</span>
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
