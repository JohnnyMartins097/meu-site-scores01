import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ChevronLeft, Star, Award, Shield, Calendar, Activity, Coins, AlignLeft, Globe } from "lucide-react";

interface PlayerPageProps {
  favorites: { players: string[] };
  onToggleFavoritePlayer: (playerName: string) => void;
  language: string;
}

export default function PlayerPage({ favorites, onToggleFavoritePlayer, language }: PlayerPageProps) {
  const { playerName: routePlayerName } = useParams<{ playerName?: string }>();
  // Use routePlayerName as the dynamic ID
  const playerId = routePlayerName;
  const isPtStr = language.startsWith("pt");

  const [playerData, setPlayerData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [cachedPlayer, setCachedPlayer] = useState<any>(null);

  useEffect(() => {
    if (playerId) {
      const stored = localStorage.getItem(`player_${playerId}`);
      if (stored) {
        try {
          setCachedPlayer(JSON.parse(stored));
        } catch (e) {
          console.error("Error reading cached player:", e);
        }
      }
    }
  }, [playerId]);

  useEffect(() => {
    const fetchPlayer = async () => {
      if (!playerId) return;
      setIsLoading(true);
      setPlayerData(null);
      try {
        // Tenta primeiro através do proxy do nosso servidor Node (Seguro contra vazamento de chaves e CORS)
        let response = await fetch(`/api/player/${playerId}`);
        let data;
        if (response.ok) {
          const resJson = await response.json();
          data = resJson.data || resJson;
        } else {
          // Fallback de contingência direta
          const url = `https://free-api-live-football-data.p.rapidapi.com/football-get-player-detail?playerid=${playerId}`;
          const options = {
            method: "GET",
            headers: {
              "x-rapidapi-key": "9b9bc4cde1mshac85de8628281aap1fe278jsna8a022da00be",
              "x-rapidapi-host": "free-api-live-football-data.p.rapidapi.com"
            }
          };
          const rawRes = await fetch(url, options);
          data = await rawRes.json();
        }

        if (data?.response) {
          const detailsMap: Record<string, string> = {};
          if (data.response.detail) {
            data.response.detail.forEach((item: any) => {
              if (item && item.title) {
                detailsMap[item.title] = item.value?.fallback || item.value || "";
              }
            });
          }

          setPlayerData({
            name: data.response.name || 'Nome não disponível',
            details: detailsMap
          });
        }
      } catch (error) {
        console.error("Erro ao buscar jogador:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (playerId) {
      fetchPlayer();
    }
  }, [playerId]);

  const athleteName = playerData?.name || cachedPlayer?.name || (playerId ? `Jogador #${playerId}` : (isPtStr ? "Jogador" : "Player"));
  const isFav = favorites.players.includes(athleteName);

  const details = playerData?.details || {};
  const ageVal = details['Age'] || details['Idade'] || cachedPlayer?.age || '-';
  const heightVal = details['Height'] || details['Altura'] || '-';
  const footVal = details['Preferred foot'] || details['Pé preferido'] || '-';
  const shirtVal = details['Shirt'] || details['Camisa'] || (cachedPlayer?.shirtNumber ? `${cachedPlayer.shirtNumber}` : '-');
  const countryVal = details['Country'] || details['País'] || cachedPlayer?.cname || '-';
  const marketVal = details['Market value'] || details['Valor de mercado'] || '-';
  const posVal = cachedPlayer?.role?.fallback || cachedPlayer?.role?.name || details['Position'] || details['Posição'] || '-';

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen pb-12 select-none">
      {/* Visual Header */}
      <div className="bg-slate-900 text-white relative py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <button
            onClick={() => window.history.back()}
            className="absolute top-4 left-4 flex items-center gap-1 text-xs font-bold text-white/80 hover:text-white bg-black/30 py-1.5 px-3 rounded-full transition-all focus:outline-none cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{isPtStr ? "Voltar" : "Back"}</span>
          </button>

          {/* Foto Premium */}
          <div className="relative shrink-0">
            <img
              src={`https://images.fotmob.com/image_resources/playerimages/${playerId}.png`}
              alt={athleteName}
              className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover bg-slate-800 border-4 border-emerald-500 shadow-lg animate-fade-in animate-duration-150"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/fallback-avatar.png";
              }}
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-3 justify-center md:justify-start">
              <h1 className="text-3xl md:text-4.5xl font-display font-black tracking-tight flex items-center justify-center md:justify-start gap-4">
                {athleteName}
              </h1>
              <button
                onClick={() => onToggleFavoritePlayer(athleteName)}
                className="self-center p-1.5 bg-white/10 hover:bg-white/20 rounded-full cursor-pointer transition-all border border-white/10 active:scale-95"
                title={isPtStr ? "Favoritar Jogador" : "Favorite Player"}
              >
                <Star className={`w-4.5 h-4.5 ${isFav ? "fill-amber-400 text-amber-400" : "text-white/60"}`} />
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3 text-sm text-slate-300 font-medium">
              <span className="bg-[#ffdf00] text-slate-900 text-[10px] font-black px-2.5 py-0.5 rounded-sm tracking-wider uppercase">
                {posVal}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 font-bold">
                {cachedPlayer?.teamLogo && (
                  <img src={cachedPlayer.teamLogo} alt={cachedPlayer.teamName || ""} className="w-5 h-5 object-contain" />
                )}
                <span>{cachedPlayer?.teamName || (isPtStr ? "Clube" : "Club")}</span>
              </span>
              <span>•</span>
              <span>{countryVal}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-6 mt-8">
        {isLoading ? (
          <div className="p-16 text-center bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-3xs select-none">
            <div className="w-8 h-8 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-relaxed animate-pulse">
              {isPtStr ? "Carregando Ficha do Jogador..." : "Loading Player Details..."}
            </p>
          </div>
        ) : !playerData ? (
          <div className="p-16 text-center bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-3xs select-none">
            <p className="text-sm font-bold text-slate-400/80 uppercase tracking-widest leading-relaxed">
              {isPtStr ? "Nenhum dado de elenco encontrado" : "No squad data found"}
            </p>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in animate-duration-150">
            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xs">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-6">
                <Activity className="w-4.5 h-4.5 text-emerald-600" />
                {isPtStr ? "Ficha Técnica Completa" : "Full Biographical Details"}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* IDADE */}
                <div className="bg-slate-50 dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-800/60 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider">
                        {isPtStr ? "Idade" : "Age"}
                      </div>
                      <div className="text-sm font-extrabold text-slate-850 dark:text-white mt-0.5">
                        {ageVal} {isPtStr && ageVal !== "-" && !ageVal.includes("anos") ? "anos" : ""}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ALTURA */}
                <div className="bg-slate-50 dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-800/60 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600">
                      <AlignLeft className="w-5 h-5 rotate-90" />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider">
                        {isPtStr ? "Altura" : "Height"}
                      </div>
                      <div className="text-sm font-extrabold text-slate-850 dark:text-white mt-0.5">
                        {heightVal}
                      </div>
                    </div>
                  </div>
                </div>

                {/* PÉ PREFERIDO */}
                <div className="bg-slate-50 dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-800/60 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-500">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider">
                        {isPtStr ? "Pé Preferido" : "Preferred Foot"}
                      </div>
                      <div className="text-sm font-extrabold text-slate-850 dark:text-white mt-0.5">
                        {footVal === "Left" || footVal === "Esquerdo" ? (isPtStr ? "Esquerdo" : "Left") :
                         footVal === "Right" || footVal === "Canhoto" || footVal === "Destro" ? (isPtStr ? "Direito" : "Right") : footVal}
                      </div>
                    </div>
                  </div>
                </div>

                {/* CAMISA */}
                <div className="bg-slate-50 dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-800/60 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center text-purple-600">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider">
                        {isPtStr ? "Número da Camisa" : "Shirt Number"}
                      </div>
                      <div className="text-sm font-extrabold text-slate-850 dark:text-white mt-0.5">
                        {shirtVal !== "-" ? `# ${shirtVal}` : "-"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* PAÍS / NACIONALIDADE */}
                <div className="bg-slate-50 dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-800/60 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-500">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider">
                        {isPtStr ? "Nacionalidade" : "Nationality"}
                      </div>
                      <div className="text-sm font-extrabold text-slate-850 dark:text-white mt-0.5">
                        {countryVal}
                      </div>
                    </div>
                  </div>
                </div>

                {/* VALOR DE MERCADO */}
                <div className="bg-slate-50 dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-800/60 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
                      <Coins className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider">
                        {isPtStr ? "Valor de Mercado" : "Market Value"}
                      </div>
                      <div className="text-sm font-extrabold text-slate-850 dark:text-white mt-0.5">
                        {marketVal}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
