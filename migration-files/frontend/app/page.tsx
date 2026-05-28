import React from "react";
import LiveScoreBoard from "../components/LiveScoreBoard";
import { Trophy, Activity, Calendar } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-[#3b82f6]/30">
      {/* Header Corporativo do Placar */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur sticky top-0 z-50 px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-900/40">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-semibold text-lg tracking-tight text-white flex items-center gap-2">
                WorldScore <span className="text-xs bg-blue-500/10 text-blue-400 font-medium px-2 py-0.5 rounded-full border border-blue-500/20">PRO v2</span>
              </h1>
              <p className="text-xs text-slate-400">Hub de Resultados de Alta Performance em Tempo Real</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-full border border-emerald-500/15">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Conexão WebSocket Ativa</span>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <section className="flex-1 py-8 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-400" />
            <span className="font-semibold text-white tracking-tight text-xl">Eventos do Dia</span>
          </div>
        </div>

        {/* Componente Altamente Escalável de Placar em Tempo Real */}
        <LiveScoreBoard />
      </section>

      {/* Rodapé institucional */}
      <footer className="border-t border-slate-900 py-6 px-4 text-center text-slate-500 text-xs">
        <p>© 2026 WorldScore. Arquitetura distribuída com Node.js + Next.js App Router.</p>
      </footer>
    </main>
  );
}
