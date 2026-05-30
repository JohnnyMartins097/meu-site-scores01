import React from "react";
import { Match } from "../types";

export function MatchRow({ 
  match, 
  onSelect, 
  isSelected 
}: { 
  match: Match; 
  onSelect: (m: Match) => void; 
  isSelected: boolean;
  key?: React.Key;
}) {
  const status = (match as any).status || {};
  const reasonShort = status.reason?.short;

  // 1. Análise Agressiva de Fim de Jogo (Lida com o bug do Brasileirão)
  const isFinished = status.finished || status.cancelled || reasonShort === 'FT' || reasonShort === 'Pen';

  // 2. Análise Agressiva de Ao Vivo
  const isLive = (status.started || status.liveTime?.short || status.scoreStr) && !isFinished;

  // 3. Extração de Placar (Prioridade MÁXIMA para scoreStr, ignora os 0s fantasmas)
  let homeScore = "";
  let awayScore = "";

  if (status.scoreStr) {
    const parts = status.scoreStr.split('-');
    homeScore = parts[0]?.trim() || "";
    awayScore = parts[1]?.trim() || "";
  } else {
    homeScore = match.home?.score !== undefined ? String(match.home.score) : "";
    awayScore = match.away?.score !== undefined ? String(match.away.score) : "";
  }

  // 4. Limpeza Anti-Zero para jogos Futuros
  if (!isLive && !isFinished && !status.scoreStr && (homeScore === "0" || Number(homeScore) === 0) && (awayScore === "0" || Number(awayScore) === 0)) {
    homeScore = "";
    awayScore = "";
  }

  // 5. Controle de Tempo/Status
  let timeDisplay = match.time;
  if (isFinished) {
    timeDisplay = "FIM";
  } else if (isLive) {
    timeDisplay = status.liveTime?.short ? `${status.liveTime.short}'` : "VIVO";
  }

  return (
    <div 
      id={`match-row-${match.fixture.id}`}
      onClick={() => onSelect(match)}
      className={`flex items-center justify-between p-3 border-b hover:bg-gray-50 dark:hover:bg-slate-800/40 cursor-pointer transition-all ${
        isSelected 
          ? "bg-slate-100 dark:bg-slate-800/80 border-l-4 border-l-green-500" 
          : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800"
      }`}
    >
      <div className="flex flex-col gap-2 flex-1 mr-3 font-sans">
        {/* Time da Casa */}
        <div className="flex items-center gap-2">
          <img 
            src={`https://images.fotmob.com/image_resources/logo/teamlogo/${match.home?.id}.png`} 
            alt="Home" 
            className="w-5 h-5 object-contain rounded-xs" 
            onError={(e) => { 
              e.currentTarget.src = `https://images.fotmob.com/image_resources/logo/teamlogo/${match.home?.id}_large.png`; 
            }}
          />
          <span className="font-medium text-sm text-slate-800 dark:text-slate-100 truncate">{match.home?.name}</span>
          <span className="ml-auto font-bold text-sm text-slate-900 dark:text-slate-100">{homeScore}</span>
        </div>
        {/* Time de Fora */}
        <div className="flex items-center gap-2">
          <img 
            src={`https://images.fotmob.com/image_resources/logo/teamlogo/${match.away?.id}.png`} 
            alt="Away" 
            className="w-5 h-5 object-contain rounded-xs"
            onError={(e) => { 
              e.currentTarget.src = `https://images.fotmob.com/image_resources/logo/teamlogo/${match.away?.id}_large.png`; 
            }}
          />
          <span className="font-medium text-sm text-slate-800 dark:text-slate-100 truncate">{match.away?.name}</span>
          <span className="ml-auto font-bold text-sm text-slate-900 dark:text-slate-100">{awayScore}</span>
        </div>
      </div>
      
      {/* Status / Tempo do Jogo */}
      <div className="flex flex-col items-end justify-center min-w-[50px] pl-3 border-l border-slate-100 dark:border-slate-800 ml-3">
        <span className={`text-xs font-bold ${isLive ? 'text-green-600 dark:text-green-400 animate-pulse' : (isFinished ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-slate-400')}`}>
          {timeDisplay}
        </span>
      </div>
    </div>
  );
}
