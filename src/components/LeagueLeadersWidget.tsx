import React, { useState, useEffect } from "react";
import { Award, Compass, Star, Trophy } from "lucide-react";

interface PlayerLeader {
  id: number;
  name: string;
  teamId: number;
  teamName: string;
  value: number;
  teamColors?: {
    darkMode?: string;
    lightMode?: string;
    fontDarkMode?: string;
    fontLightMode?: string;
  };
}

interface LeagueLeadersWidgetProps {
  leagueId: number;
  language: string;
}

export function LeagueLeadersWidget({ leagueId, language }: LeagueLeadersWidgetProps) {
  const isPtStr = language.startsWith("pt");
  const [topGoals, setTopGoals] = useState<PlayerLeader[]>([]);
  const [topAssists, setTopAssists] = useState<PlayerLeader[]>([]);
  const [topRatings, setTopRatings] = useState<PlayerLeader[]>([]);
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  useEffect(() => {
    let isMounted = true;
    const fetchLeadersData = async () => {
      setIsLoading(true);
      try {
        const [resGoals, resAssists, resRatings] = await Promise.all([
          fetch(`/api/league-leaders/goals/${leagueId}`).then((r) => r.json().catch(() => null)),
          fetch(`/api/league-leaders/assists/${leagueId}`).then((r) => r.json().catch(() => null)),
          fetch(`/api/league-leaders/rating/${leagueId}`).then((r) => r.json().catch(() => null)),
        ]);

        if (!isMounted) return;

        // Goals
        const goalsList = resGoals?.response?.players || resGoals?.players || [];
        setTopGoals(goalsList.slice(0, 3));

        // Assists
        const assistsList = resAssists?.response?.players || resAssists?.players || [];
        setTopAssists(assistsList.slice(0, 3));

        // Ratings
        const ratingsList = resRatings?.response?.players || resRatings?.players || [];
        setTopRatings(ratingsList.slice(0, 3));

      } catch (err) {
        console.error("Erro ao buscar lideranças da liga:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchLeadersData();
    return () => {
      isMounted = false;
    };
  }, [leagueId]);

  const renderSection = (
    title: string,
    icon: React.ReactNode,
    players: PlayerLeader[],
    suffix: string
  ) => {
    return (
      <div className="space-y-3.5">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
          <div className="text-emerald-500 dark:text-emerald-400 shrink-0">
            {icon}
          </div>
          <h4 className="text-[11px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
            {title}
          </h4>
        </div>

        {players.length === 0 ? (
          <p className="text-xs italic text-slate-400 dark:text-slate-500 pl-1 py-1">
            {isPtStr ? "Tabela indisponível" : "Data not available"}
          </p>
        ) : (
          <div>
            <div className="space-y-3">
              {players.map((player) => {
                // Initials for image placeholder
                const initials = (player.name || "?")
                  .trim()
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase();

                return (
                  <div
                    key={player.id}
                    className="flex items-center justify-between gap-3 group hover:bg-slate-50/50 dark:hover:bg-slate-900/40 p-1.5 rounded-xl transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative shrink-0 w-9 h-9">
                        {imageErrors[player.id] ? (
                          <div className="w-full h-full rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-750 text-[10px] font-black text-slate-500 dark:text-slate-450 flex items-center justify-center select-none shadow-3xs uppercase">
                            {initials}
                          </div>
                        ) : (
                          <img
                            src={`https://images.fotmob.com/image_resources/playerimages/${player.id}.png`}
                            alt={player.name}
                            className="w-full h-full rounded-full object-cover bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-750 shadow-3xs"
                            onError={() => {
                              setImageErrors((prev) => ({ ...prev, [player.id]: true }));
                            }}
                            referrerPolicy="no-referrer"
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-[12px] font-extrabold text-slate-800 dark:text-slate-100 truncate leading-snug group-hover:text-[#009c3b] dark:group-hover:text-emerald-400 transition-colors">
                          {player.name}
                        </h5>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 leading-none block mt-0.5 truncate uppercase">
                          {player.teamName}
                        </span>
                      </div>
                    </div>

                    {/* Premium uniform numeric badge */}
                    <div className="shrink-0 bg-slate-800 dark:bg-slate-700 text-white font-bold px-3 py-1 rounded-md text-[10px] font-mono scale-95 select-none shadow-2xs tracking-tight">
                      {player.value} {suffix}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <button className="w-full mt-3 text-xs text-center text-[#009c3b] dark:text-emerald-400 hover:text-green-600 dark:hover:text-emerald-300 font-extrabold py-2 border border-slate-100 dark:border-slate-800/60 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-all cursor-pointer">
              {isPtStr ? "Ver todos" : "See all"}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-3xs h-fit space-y-6">
      {/* Widget Header */}
      <div className="flex items-center gap-2 pb-1">
        <Trophy className="w-5 h-5 text-amber-500" />
        <h3 className="text-sm font-black tracking-tight text-slate-800 dark:text-slate-100 uppercase">
          {isPtStr ? "Estatísticas do Campeonato" : "Championship Statistics"}
        </h3>
      </div>

      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-3">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-emerald-600 border-t-transparent"></div>
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            {isPtStr ? "Carregando Líderes..." : "Loading Leaders..."}
          </span>
        </div>
      ) : (
        <div className="space-y-6 divide-y divide-slate-100/50 dark:divide-slate-800/100">
          {renderSection(
            isPtStr ? "Artilheiros" : "Top Scorers",
            <Award className="w-4 h-4" />,
            topGoals,
            "G"
          )}
          <div className="pt-5">
            {renderSection(
              isPtStr ? "Assistências" : "Assists Leaders",
              <Compass className="w-4 h-4" />,
              topAssists,
              "A"
            )}
          </div>
          <div className="pt-5">
            {renderSection(
              isPtStr ? "Melhores Notas" : "Top Ratings",
              <Star className="w-4 h-4" />,
              topRatings,
              "★"
            )}
          </div>
        </div>
      )}
    </div>
  );
}
