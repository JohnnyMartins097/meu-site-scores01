import React, { useState } from "react";

interface TimelineEvent {
  id: number;
  minute: number;
  type: string;
  player?: string;
  playerIn?: string;
  playerOut?: string;
  team: string; // "home" | "away"
}

export const MatchTimeline: React.FC = () => {
  const [events] = useState<TimelineEvent[]>([
    { id: 1, minute: 12, type: "goal", player: "J. Boga", team: "home" },
    { id: 2, minute: 28, type: "yellowCard", player: "Dante", team: "home" },
    { id: 3, minute: 41, type: "goal", player: "H. Moukoudi", team: "away" },
    { id: 4, minute: 65, type: "substitution", playerIn: "M. Cho", playerOut: "T. Moffi", team: "home" },
    { id: 5, minute: 88, type: "redCard", player: "M. Camara", team: "away" }
  ]);

  const renderIcon = (evt: TimelineEvent) => {
    switch (evt.type) {
      case "goal":
        return <span className="text-base leading-none">⚽</span>;
      case "yellowCard":
        return <div className="bg-yellow-400 w-3 h-4 rounded-xs shadow-xs" title="Cartão Amarelo" />;
      case "redCard":
        return <div className="bg-red-500 w-3 h-4 rounded-xs shadow-xs" title="Cartão Vermelho" />;
      case "substitution":
        return <span className="text-emerald-500 text-sm leading-none">🔄</span>;
      default:
        return null;
    }
  };

  return (
    <div className="relative py-6 px-2 w-full max-w-xl mx-auto overflow-hidden">
      {/* Central vertical line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-800 -translate-x-1/2" />

      <div className="relative space-y-8">
        {events.map((evt) => {
          const isHome = evt.team === "home";

          return (
            <div key={evt.id} className="grid grid-cols-9 items-center justify-center relative min-h-[44px]">
              {/* Home side: column index 0,1,2,3 */}
              <div className="col-span-4 text-right pr-4">
                {isHome && (
                  <div className="flex flex-row-reverse items-center justify-start gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm shrink-0">
                      {renderIcon(evt)}
                    </span>
                    <div className="text-right">
                      {evt.type === "substitution" ? (
                        <div className="text-xs">
                          <p className="font-bold text-slate-800 dark:text-slate-200">
                            Entra: {evt.playerIn}
                          </p>
                          <p className="text-slate-400 dark:text-slate-500">
                            Sai: {evt.playerOut}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                          {evt.player}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Time bubble in the exact center: column index 4 */}
              <div className="col-span-1 flex justify-center z-10">
                <span className="font-mono font-black text-xs bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1 rounded-full shadow-xs whitespace-nowrap min-w-[2.5rem] text-center select-none">
                  {evt.minute}'
                </span>
              </div>

              {/* Away side: column index 5,6,7,8 */}
              <div className="col-span-4 text-left pl-4">
                {!isHome && (
                  <div className="flex flex-row items-center justify-start gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm shrink-0">
                      {renderIcon(evt)}
                    </span>
                    <div className="text-left">
                      {evt.type === "substitution" ? (
                        <div className="text-xs">
                          <p className="font-bold text-slate-800 dark:text-slate-200">
                            Entra: {evt.playerIn}
                          </p>
                          <p className="text-slate-400 dark:text-slate-500">
                            Sai: {evt.playerOut}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                          {evt.player}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
