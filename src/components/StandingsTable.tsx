import React from "react";
import { Link } from "react-router-dom";
import { StandingItem } from "../types";
import { SafeImage } from "./SafeImage";

interface StandingsTableProps {
  items: StandingItem[];
}

export const StandingsTable: React.FC<StandingsTableProps> = ({ items }) => {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
        Nenhuma classificação disponível.
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-150 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-2xs">
      <table className="w-full text-sm text-left border-collapse min-w-[480px]">
        <thead>
          <tr className="border-b border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-sans text-xs uppercase font-semibold">
            {/* Margem extra à esquerda para a borda do indicador qualitativo */}
            <th className="py-3 px-3 w-10 text-center">#</th>
            <th className="py-3 px-4 text-left">Clube</th>
            <th className="py-3 px-3 w-12 text-center font-bold text-slate-700 dark:text-slate-350">P</th>
            <th className="py-3 px-3 w-10 text-center">J</th>
            <th className="py-3 px-10 w-10 text-center sm:table-cell hidden">V</th>
            <th className="py-3 px-10 w-10 text-center sm:table-cell hidden">E</th>
            <th className="py-3 px-10 w-10 text-center sm:table-cell hidden">D</th>
            <th className="py-3 px-3 w-14 text-center">SG</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 font-sans">
          {items.map((item) => {
            return (
              <tr 
                key={item.id}
                className="hover:bg-slate-50/80 dark:hover:bg-slate-850/50 transition-colors group text-slate-800 dark:text-slate-200"
              >
                {/* Indicador de Qualificação */}
                <td 
                  className="py-3 text-center relative font-mono text-xs font-semibold"
                  style={{
                    borderLeft: item.qualColor ? `3.5px solid ${item.qualColor}` : "3.5px solid transparent"
                  }}
                >
                  <span className="pl-[2px]">{item.idx}</span>
                </td>
                
                {/* Clube */}
                <td className="py-3 px-4 text-left max-w-[180px] sm:max-w-xs">
                  <Link to={`/team/${item.id}`} className="flex items-center gap-2.5 group/team hover:text-[#009c3b] dark:hover:text-emerald-400">
                    <SafeImage 
                      src={item.logo} 
                      alt={item.name} 
                      className="w-5.5 h-5.5 object-contain shrink-0 p-0.5 bg-slate-100/40 dark:bg-slate-800/60 rounded-md group-hover/team:scale-105 transition-transform"
                      fallbackType="team"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-xs sm:text-sm truncate text-slate-850 dark:text-slate-100 group-hover/team:underline">
                        {item.shortName || item.name}
                      </span>
                    </div>
                  </Link>
                </td>

                {/* Pontos */}
                <td className="py-3 px-3 text-center font-sans font-extrabold text-sm text-slate-900 dark:text-slate-50 bg-slate-50/20 dark:bg-slate-900/10">
                  {item.pts}
                </td>

                {/* Jogos */}
                <td className="py-3 px-3 text-center font-mono text-xs text-slate-600 dark:text-slate-400">
                  {item.played}
                </td>

                {/* Vitórias */}
                <td className="py-3 px-10 text-center font-mono text-xs text-slate-500 dark:text-slate-400 sm:table-cell hidden">
                  {item.wins}
                </td>

                {/* Empates */}
                <td className="py-3 px-10 text-center font-mono text-xs text-slate-500 dark:text-slate-400 sm:table-cell hidden">
                  {item.draws}
                </td>

                {/* Derrotas */}
                <td className="py-3 px-10 text-center font-mono text-xs text-slate-500 dark:text-slate-400 sm:table-cell hidden">
                  {item.losses}
                </td>

                {/* Saldo de Gols */}
                <td className={`py-3 px-3 text-center font-mono text-xs font-semibold ${
                  item.goalConDiff > 0 
                    ? "text-emerald-600 dark:text-emerald-400" 
                    : item.goalConDiff < 0 
                    ? "text-rose-600 dark:text-rose-400" 
                    : "text-slate-500 dark:text-slate-400"
                }`}>
                  {item.goalConDiff > 0 ? `+${item.goalConDiff}` : item.goalConDiff}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
