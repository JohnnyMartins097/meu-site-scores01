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
  const isLive = match.status?.started && !match.status?.finished;
  const isFinished = match.status?.finished;
  const homeScore = match.home?.score ?? 0;
  const awayScore = match.away?.score ?? 0;
  const matchTime = match.status?.liveTime?.short || match.status?.reason?.short || match.time;

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
      <div className="flex flex-col gap-2 flex-1 mr-3">
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
          <span className="font-medium text-sm text-slate-800 dark:text-slate-100">{match.home?.name}</span>
          <span className="ml-auto font-bold text-sm text-slate-800 dark:text-slate-100">{homeScore}</span>
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
          <span className="font-medium text-sm text-slate-800 dark:text-slate-100">{match.away?.name}</span>
          <span className="ml-auto font-bold text-sm text-slate-800 dark:text-slate-100">{awayScore}</span>
        </div>
      </div>
      
      {/* Status / Tempo do Jogo */}
      <div className="flex flex-col items-end justify-center min-w-[60px]">
        {isLive ? (
          <span className="text-green-500 font-bold text-xs animate-pulse">{matchTime}'</span>
        ) : isFinished ? (
          <span className="text-gray-500 font-semibold text-xs">FIM</span>
        ) : (
          <span className="text-gray-400 font-medium text-xs dark:text-slate-400">{matchTime}</span>
        )}
      </div>
    </div>
  );
}
