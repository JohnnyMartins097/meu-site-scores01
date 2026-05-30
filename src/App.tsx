import { useState, useEffect, useRef } from "react";
import { 
  Shield, 
  Calendar, 
  Users, 
  MapPin, 
  Award, 
  Trophy, 
  Tv, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw,
  Clock,
  ThumbsUp,
  SlidersHorizontal,
  Flame,
  Target,
  Globe,
  ChevronDown,
  ChevronUp,
  Star
} from "lucide-react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import MatchDetail from "./components/MatchDetail";
import { Match, MatchEvent, League } from "./types";
import SettingsPanel, { SettingsConfig } from "./components/SettingsPanel";
import SportsFeed from "./components/SportsFeed";
import LoginModal from "./components/LoginModal";
import { SafeImage } from "./components/SafeImage";
import { Language, translations } from "./i18n";

import TeamPage from "./pages/TeamPage";
import LeaguePage from "./pages/LeaguePage";
import PlayerPage from "./pages/PlayerPage";

function getMockSportMatches(sport: string, date: string): Match[] {
  const timestamp = new Date(date + "T20:00:00").getTime() / 1000;
  
  if (sport === "basquete") {
    return [
      {
        fixture: {
          id: 90001,
          referee: "Tony Brothers",
          timezone: "UTC",
          date: `${date}T21:00:00Z`,
          timestamp,
          periods: { first: 24, second: 24 },
          venue: { id: 1, name: "Crypto.com Arena", city: "Los Angeles" },
          status: { long: "Finished", short: "FT", elapsed: 48 }
        },
        league: {
          id: 501,
          name: "NBA Basketball",
          country: "USA",
          logo: "https://media.api-sports.io/football/leagues/2.png",
          flag: "🇺🇸"
        },
        teams: {
          home: { id: 5011, name: "Los Angeles Lakers", logo: "https://media.api-sports.io/football/teams/47.png" },
          away: { id: 5012, name: "Boston Celtics", logo: "https://media.api-sports.io/football/teams/40.png" }
        },
        goals: { home: 112, away: 105 },
        score: {
          halftime: { home: 56, away: 50 },
          fulltime: { home: 112, away: 105 },
          extratime: { home: null, away: null },
          penalty: { home: null, away: null }
        },
        events: [
          { time: { elapsed: 12 }, team: { id: 5011, name: "Lakers" }, player: { name: "LeBron James" }, type: "Goal", detail: "3 Pointer" },
          { time: { elapsed: 24 }, team: { id: 5012, name: "Celtics" }, player: { name: "Jayson Tatum" }, type: "Goal", detail: "Slam Dunk" }
        ],
        lineups: [
          {
            team: { id: 5011, name: "Lakers", logo: "https://media.api-sports.io/football/teams/47.png" },
            coach: { name: "JJ Redick" },
            formation: "Starting Five",
            startXI: [
              { player: { name: "LeBron James", number: 23, pos: "F" } },
              { player: { name: "Anthony Davis", number: 3, pos: "C" } }
            ],
            substitutes: [
              { player: { name: "D'Angelo Russell", number: 1, pos: "G" } }
            ]
          }
        ]
      },
      {
        fixture: {
          id: 90002,
          referee: "Scott Foster",
          timezone: "UTC",
          date: `${date}T18:30:00Z`,
          timestamp,
          periods: { first: 12, second: 12 },
          venue: { id: 2, name: "Kaseya Center", city: "Miami" },
          status: { long: "Live", short: "2H", elapsed: 32 }
        },
        league: {
          id: 501,
          name: "NBA Basketball",
          country: "USA",
          logo: "https://media.api-sports.io/football/leagues/2.png",
          flag: "🇺🇸"
        },
        teams: {
          home: { id: 5013, name: "Miami Heat", logo: "https://media.api-sports.io/football/teams/49.png" },
          away: { id: 5014, name: "Chicago Bulls", logo: "https://media.api-sports.io/football/teams/50.png" }
        },
        goals: { home: 84, away: 78 },
        score: {
          halftime: { home: 48, away: 50 },
          fulltime: { home: 84, away: 78 },
          extratime: { home: null, away: null },
          penalty: { home: null, away: null }
        },
        events: []
      }
    ];
  }
  
  if (sport === "vôlei") {
    return [
      {
        fixture: {
          id: 90101,
          referee: "Marcos Barbosa",
          timezone: "UTC",
          date: `${date}T19:00:00Z`,
          timestamp,
          periods: { first: 25, second: 25 },
          venue: { id: 3, name: "Arena CFO", city: "Fortaleza" },
          status: { long: "Finished", short: "FT", elapsed: 90 }
        },
        league: {
          id: 502,
          name: "Superliga Volleyball",
          country: "Brazil",
          logo: "https://media.api-sports.io/football/leagues/13.png",
          flag: "🇧🇷"
        },
        teams: {
          home: { id: 5021, name: "Sada Cruzeiro", logo: "https://media.api-sports.io/football/teams/1005.png" },
          away: { id: 5022, name: "Itambé Minas", logo: "https://media.api-sports.io/football/teams/1006.png" }
        },
        goals: { home: 3, away: 1 },
        score: {
          halftime: { home: 2, away: 0 },
          fulltime: { home: 3, away: 1 },
          extratime: { home: null, away: null },
          penalty: { home: null, away: null }
        },
        events: []
      }
    ];
  }

  if (sport === "tênis") {
    return [
      {
        fixture: {
          id: 90201,
          referee: "Eva Asderaki",
          timezone: "UTC",
          date: `${date}T14:00:00Z`,
          timestamp,
          periods: { first: 6, second: 6 },
          venue: { id: 4, name: "Philippe Chatrier", city: "Paris" },
          status: { long: "Finished", short: "FT", elapsed: 180 }
        },
        league: {
          id: 503,
          name: "Roland Garros Grand Slam",
          country: "Spain",
          logo: "https://media.api-sports.io/football/leagues/10.png",
          flag: "🇪🇸"
        },
        teams: {
          home: { id: 5031, name: "Carlos Alcaraz", logo: "https://media.api-sports.io/football/teams/112.png" },
          away: { id: 5032, name: "Jannik Sinner", logo: "https://media.api-sports.io/football/teams/109.png" }
        },
        goals: { home: 3, away: 2 },
        score: {
          halftime: { home: 1, away: 1 },
          fulltime: { home: 3, away: 2 },
          extratime: { home: null, away: null },
          penalty: { home: null, away: null }
        },
        events: []
      }
    ];
  }

  if (sport === "beisebol") {
    return [
      {
        fixture: {
          id: 90301,
          referee: "Laz Diaz",
          timezone: "UTC",
          date: `${date}T19:30:00Z`,
          timestamp,
          periods: { first: null, second: null },
          venue: { id: 5, name: "Yankee Stadium", city: "New York" },
          status: { long: "Finished", short: "FT", elapsed: 160 }
        },
        league: {
          id: 504,
          name: "MLB Baseball",
          country: "USA",
          logo: "https://media.api-sports.io/football/leagues/2.png",
          flag: "🇺🇸"
        },
        teams: {
          home: { id: 5041, name: "New York Yankees", logo: "https://media.api-sports.io/football/teams/145.png" },
          away: { id: 5042, name: "Boston Red Sox", logo: "https://media.api-sports.io/football/teams/146.png" }
        },
        goals: { home: 6, away: 4 },
        score: {
          halftime: { home: null, away: null },
          fulltime: { home: 6, away: 4 },
          extratime: { home: null, away: null },
          penalty: { home: null, away: null }
        },
        events: []
      }
    ];
  }

  if (sport === "futebol americano") {
    return [
      {
        fixture: {
          id: 90401,
          referee: "Carl Cheffers",
          timezone: "UTC",
          date: `${date}T20:00:00Z`,
          timestamp,
          periods: { first: 14, second: 13 },
          venue: { id: 6, name: "Arrowhead Stadium", city: "Kansas City" },
          status: { long: "Finished", short: "FT", elapsed: 180 }
        },
        league: {
          id: 505,
          name: "NFL Football",
          country: "USA",
          logo: "https://media.api-sports.io/football/leagues/2.png",
          flag: "🇺🇸"
        },
        teams: {
          home: { id: 5051, name: "Kansas City Chiefs", logo: "https://media.api-sports.io/football/teams/155.png" },
          away: { id: 5052, name: "San Francisco 49ers", logo: "https://media.api-sports.io/football/teams/156.png" }
        },
        goals: { home: 27, away: 24 },
        score: {
          halftime: { home: 14, away: 10 },
          fulltime: { home: 27, away: 24 },
          extratime: { home: null, away: null },
          penalty: { home: null, away: null }
        },
        events: []
      }
    ];
  }

  if (sport === "handebol") {
    return [
      {
        fixture: {
          id: 90501,
          referee: "Gjording Hansen",
          timezone: "UTC",
          date: `${date}T18:00:00Z`,
          timestamp,
          periods: { first: 15, second: 16 },
          venue: { id: 7, name: "Palau Blaugrana", city: "Barcelona" },
          status: { long: "Finished", short: "FT", elapsed: 60 }
        },
        league: {
          id: 506,
          name: "EHF Champions League",
          country: "World",
          logo: "https://media.api-sports.io/football/leagues/3.png",
          flag: "🌍"
        },
        teams: {
          home: { id: 5051, name: "Barcelona Handbol", logo: "https://media.api-sports.io/football/teams/529.png" },
          away: { id: 5052, name: "PSG Handball", logo: "https://media.api-sports.io/football/teams/85.png" }
        },
        goals: { home: 31, away: 29 },
        score: {
          halftime: { home: 15, away: 14 },
          fulltime: { home: 31, away: 29 },
          extratime: { home: null, away: null },
          penalty: { home: null, away: null }
        },
        events: []
      }
    ];
  }

  return [];
}

const getLocalDateString = (d: Date = new Date()) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export interface LeagueInfo {
  name: string;
  country: string;
  isMajor?: boolean;
  tier?: number;
  flag?: string;
}

export const LEAGUE_DICTIONARY: Record<number, LeagueInfo> = {
  // BRASIL
  268: { name: "Brasileirão Série A", country: "Brasil", tier: 1, isMajor: true, flag: "https://media.api-sports.io/flags/br.svg" },
  390: { name: "Brasileirão Série B", country: "Brasil", tier: 2, isMajor: false, flag: "https://media.api-sports.io/flags/br.svg" },
  8814: { name: "Brasileirão Série B", country: "Brasil", tier: 2, isMajor: false, flag: "https://media.api-sports.io/flags/br.svg" },
  325: { name: "Brasileirão Série C", country: "Brasil", tier: 3, isMajor: false, flag: "https://media.api-sports.io/flags/br.svg" },
  8971: { name: "Brasileirão Série C", country: "Brasil", tier: 3, isMajor: false, flag: "https://media.api-sports.io/flags/br.svg" },
  326: { name: "Brasileirão Série D", country: "Brasil", tier: 4, isMajor: false, flag: "https://media.api-sports.io/flags/br.svg" },
  9464: { name: "Brasileirão Série D", country: "Brasil", tier: 4, isMajor: false, flag: "https://media.api-sports.io/flags/br.svg" },
  225: { name: "Copa do Brasil", country: "Brasil", tier: 2, isMajor: false, flag: "https://media.api-sports.io/flags/br.svg" },

  // AMÉRICA DO SUL E CONCACAF
  112: { name: "Liga Profesional", country: "Argentina", tier: 2, isMajor: false, flag: "https://media.api-sports.io/flags/ar.svg" },
  163: { name: "Primera Nacional", country: "Argentina", tier: 3, isMajor: false, flag: "https://media.api-sports.io/flags/ar.svg" },
  916553: { name: "Primera Nacional", country: "Argentina", tier: 3, isMajor: false, flag: "https://media.api-sports.io/flags/ar.svg" },
  135: { name: "Primera División", country: "Paraguai", tier: 2, isMajor: false, flag: "https://media.api-sports.io/flags/py.svg" },
  133: { name: "Primera A", country: "Colômbia", tier: 2, isMajor: false, flag: "https://media.api-sports.io/flags/co.svg" },
  134: { name: "Primera División", country: "Chile", tier: 2, isMajor: false, flag: "https://media.api-sports.io/flags/cl.svg" },
  136: { name: "Primera División", country: "Uruguai", tier: 2, isMajor: false, flag: "https://media.api-sports.io/flags/uy.svg" },
  131: { name: "Liga 1", country: "Peru", tier: 2, isMajor: false, flag: "https://media.api-sports.io/flags/pe.svg" },
  132: { name: "Primera División", country: "Bolívia", tier: 2, isMajor: false, flag: "https://media.api-sports.io/flags/bo.svg" },
  140: { name: "Serie A", country: "Equador", tier: 2, isMajor: false, flag: "https://media.api-sports.io/flags/ec.svg" },
  139: { name: "Liga FUTVE", country: "Venezuela", tier: 2, isMajor: false, flag: "https://media.api-sports.io/flags/ve.svg" },
  230: { name: "Liga MX", country: "México", tier: 2, isMajor: false, flag: "https://media.api-sports.io/flags/mx.svg" },
  130: { name: "MLS", country: "EUA", tier: 3, isMajor: false, flag: "https://media.api-sports.io/flags/us.svg" },

  // NOVOS IDs DAS AMÉRICAS
  144: { name: "Primera División", country: "Bolívia", tier: 2, isMajor: false, flag: "https://media.api-sports.io/flags/bo.svg" },
  246: { name: "Liga Pro", country: "Equador", tier: 2, isMajor: false, flag: "https://media.api-sports.io/flags/ec.svg" },
  9986: { name: "Canadian Premier League", country: "Canadá", tier: 3, isMajor: false, flag: "https://media.api-sports.io/flags/ca.svg" },
  8972: { name: "USL Championship", country: "EUA", tier: 2, isMajor: false, flag: "https://media.api-sports.io/flags/us.svg" },
  916345: { name: "USL League One", country: "EUA", tier: 3, isMajor: false, flag: "https://media.api-sports.io/flags/us.svg" },
  10282: { name: "MLS Next Pro", country: "EUA", tier: 4, isMajor: false, flag: "https://media.api-sports.io/flags/us.svg" },
  931420: { name: "USL Super League (F)", country: "EUA", tier: 3, isMajor: false, flag: "https://media.api-sports.io/flags/us.svg" },
  929416: { name: "Copa Colombia", country: "Colômbia", tier: 3, isMajor: false, flag: "https://media.api-sports.io/flags/co.svg" },
  929417: { name: "Copa Colombia", country: "Colômbia", tier: 3, isMajor: false, flag: "https://media.api-sports.io/flags/co.svg" },
  919426: { name: "Primera División", country: "Chile", tier: 3, isMajor: false, flag: "https://media.api-sports.io/flags/cl.svg" },
  919710: { name: "Liga 1", country: "Peru", tier: 3, isMajor: false, flag: "https://media.api-sports.io/flags/pe.svg" },
  920228: { name: "NWSL (Feminino)", country: "EUA", tier: 3, isMajor: false, flag: "https://media.api-sports.io/flags/us.svg" },

  // EUROPA (CORREÇÃO CRÍTICA ITÁLIA & ALEMANHA)
  53: { name: "Serie A", country: "Itália", tier: 1, isMajor: true, flag: "https://media.api-sports.io/flags/it.svg" },
  65: { name: "Serie B", country: "Itália", tier: 2, isMajor: false, flag: "https://media.api-sports.io/flags/it.svg" },
  141: { name: "Coppa Italia", country: "Itália", tier: 2, isMajor: false, flag: "https://media.api-sports.io/flags/it.svg" },
  54: { name: "Bundesliga", country: "Alemanha", tier: 1, isMajor: true, flag: "https://media.api-sports.io/flags/de.svg" },
  55: { name: "2. Bundesliga", country: "Alemanha", tier: 2, isMajor: false, flag: "https://media.api-sports.io/flags/de.svg" },
  47: { name: "Premier League", country: "Inglaterra", tier: 1, isMajor: true, flag: "https://media.api-sports.io/flags/gb.svg" },
  87: { name: "La Liga", country: "Espanha", tier: 1, isMajor: true, flag: "https://media.api-sports.io/flags/es.svg" },
  9666: { name: "Ligue 1", country: "França", tier: 1, isMajor: true, flag: "https://media.api-sports.io/flags/fr.svg" },
  122: { name: "Eredivisie", country: "Holanda", tier: 1, isMajor: true, flag: "https://media.api-sports.io/flags/nl.svg" },
  61: { name: "Liga Portugal", country: "Portugal", tier: 2, isMajor: false, flag: "https://media.api-sports.io/flags/pt.svg" },
  67: { name: "Allsvenskan", country: "Suécia", tier: 2, isMajor: false, flag: "https://media.api-sports.io/flags/se.svg" },
  924725: { name: "Pro League", country: "Bélgica", tier: 2, isMajor: false, flag: "https://media.api-sports.io/flags/be.svg" },

  // MAIS EUROPA (Ligas Principais e Secundárias)
  929420: { name: "Division 1 Féminine", country: "França", tier: 3, isMajor: false, flag: "https://media.api-sports.io/flags/fr.svg" },
  930062: { name: "Serie B / Playoffs", country: "Itália", tier: 2, isMajor: false, flag: "https://media.api-sports.io/flags/it.svg" },
  933862: { name: "Primera Federación", country: "Espanha", tier: 3, isMajor: false, flag: "https://media.api-sports.io/flags/es.svg" },
  931417: { name: "Regionalliga", country: "Alemanha", tier: 4, isMajor: false, flag: "https://media.api-sports.io/flags/de.svg" },
  931759: { name: "Liga 1", country: "Romênia", tier: 3, isMajor: false, flag: "https://media.api-sports.io/flags/ro.svg" },
  933740: { name: "First League", country: "Bulgária", tier: 3, isMajor: false, flag: "https://media.api-sports.io/flags/bg.svg" },
  925948: { name: "2. Division", country: "Dinamarca", tier: 2, isMajor: false, flag: "https://media.api-sports.io/flags/dk.svg" },
  925949: { name: "3. Division", country: "Dinamarca", tier: 3, isMajor: false, flag: "https://media.api-sports.io/flags/dk.svg" },
  923422: { name: "Besta deild karla", country: "Islândia", tier: 3, isMajor: false, flag: "https://media.api-sports.io/flags/is.svg" },
  923169: { name: "Vysshaya Liga", country: "Bielorrússia", tier: 3, isMajor: false, flag: "https://media.api-sports.io/flags/by.svg" },
  916016: { name: "First Division", country: "Irlanda", tier: 2, isMajor: false, flag: "https://media.api-sports.io/flags/ie.svg" },
  9178: { name: "1. CFL", country: "Montenegro", tier: 3, isMajor: false, flag: "https://media.api-sports.io/flags/me.svg" },
  919794: { name: "3. Division", country: "Noruega", tier: 3, isMajor: false, flag: "https://media.api-sports.io/flags/no.svg" },
  919795: { name: "3. Division", country: "Noruega", tier: 3, isMajor: false, flag: "https://media.api-sports.io/flags/no.svg" },
  916229: { name: "1. Divisjon (Feminino)", country: "Noruega", tier: 3, isMajor: false, flag: "https://media.api-sports.io/flags/no.svg" },
  923619: { name: "Kansallinen Liiga (F)", country: "Finlândia", tier: 3, isMajor: false, flag: "https://media.api-sports.io/flags/fi.svg" },
  920261: { name: "Ykkösliiga", country: "Finlândia", tier: 2, isMajor: false, flag: "https://media.api-sports.io/flags/fi.svg" },
  920263: { name: "Kakkonen", country: "Finlândia", tier: 3, isMajor: false, flag: "https://media.api-sports.io/flags/fi.svg" },

  // COMPLEMENTOS E LIGAS ADICIONAIS DESCOBERTAS
  232: { name: "1. CFL", country: "Montenegro", tier: 3, isMajor: false, flag: "https://media.api-sports.io/flags/me.svg" },
  927414: { name: "1. Liga", country: "República Tcheca", tier: 2, isMajor: false, flag: "https://media.api-sports.io/flags/cz.svg" },
  228: { name: "A Lyga", country: "Lituânia", tier: 3, isMajor: false, flag: "https://media.api-sports.io/flags/lt.svg" },
  920267: { name: "Copa da China / League One", country: "China", tier: 3, isMajor: false, flag: "https://media.api-sports.io/flags/cn.svg" },
  906616: { name: "Premier League", country: "Rússia", tier: 2, isMajor: false, flag: "https://media.api-sports.io/flags/ru.svg" },
  59: { name: "Eliteserien", country: "Noruega", tier: 2, isMajor: false, flag: "https://media.api-sports.io/flags/no.svg" },
  931556: { name: "Eredivisie (Playoffs)", country: "Holanda", tier: 3, isMajor: false, flag: "https://media.api-sports.io/flags/nl.svg" },
  923718: { name: "Torneo Federal A", country: "Argentina", tier: 3, isMajor: false, flag: "https://media.api-sports.io/flags/ar.svg" },
  917951: { name: "Copa do Imperador", country: "Japão", tier: 2, isMajor: false, flag: "https://media.api-sports.io/flags/jp.svg" },

  // RESTO DO MUNDO
  923880: { name: "Premier League", country: "Egito", tier: 3, isMajor: false, flag: "https://media.api-sports.io/flags/eg.svg" },
  920266: { name: "Super League", country: "China", tier: 3, isMajor: false, flag: "https://media.api-sports.io/flags/cn.svg" },
  915708: { name: "Amistosos de Clubes", country: "Mundo", tier: 4, isMajor: false, flag: "https://media.api-sports.io/flags/world.svg" },

  // BACKUP ADICIONAL PEDIDO: Turquia e Arábia
  71: { name: "Süper Lig", country: "Turquia", tier: 2, isMajor: false, flag: "https://media.api-sports.io/flags/tr.svg" },
  902649: { name: "Premier League", country: "Arábia Saudita", tier: 2, isMajor: false, flag: "https://media.api-sports.io/flags/sa.svg" },

  // CHAMPIONS LEAGUE (Masculina e Feminina) e Liga Europa e Libertadores
  42: { name: "UEFA Champions League", country: "Europa", tier: 1, isMajor: true, flag: "https://media.api-sports.io/flags/world.svg" },
  904995: { name: "UEFA Champions League", country: "Europa", tier: 1, isMajor: true, flag: "https://media.api-sports.io/flags/world.svg" },
  73: { name: "UEFA Europa League", country: "Europa", tier: 1, isMajor: true, flag: "https://media.api-sports.io/flags/world.svg" },
  924597: { name: "Copa Libertadores", country: "América do Sul", tier: 1, isMajor: true, flag: "https://media.api-sports.io/flags/world.svg" },
  10032: { name: "Copa Libertadores", country: "América do Sul", tier: 1, isMajor: true, flag: "https://media.api-sports.io/flags/world.svg" },
  10036: { name: "Copa Sudamericana", country: "América do Sul", tier: 1, isMajor: true, flag: "https://media.api-sports.io/flags/world.svg" }
};

export const getLeagueDictEntry = (leagueId: number, rawName?: string): LeagueInfo | undefined => {
  const nameLower = (rawName || "").toLowerCase();

  // ID 132 Conflict: England FA Cup vs Bolivia Primera División
  if (leagueId === 132) {
    if (nameLower.includes("fa cup") || nameLower.includes("england") || nameLower.includes("inglaterra") || nameLower.includes("cup") || nameLower.includes("taça")) {
      return { name: "FA Cup", country: "Inglaterra", tier: 1, isMajor: true, flag: "https://media.api-sports.io/flags/gb.svg" };
    }
    return { name: "Primera División", country: "Bolívia", tier: 2, isMajor: false, flag: "https://media.api-sports.io/flags/bo.svg" };
  }

  // ID 140 Conflict: España La Liga 2 vs Equador Serie A
  if (leagueId === 140) {
    if (nameLower.includes("liga 2") || nameLower.includes("segunda") || nameLower.includes("espanha") || nameLower.includes("spain") || nameLower.includes("laliga")) {
      return { name: "La Liga 2", country: "Espanha", tier: 2, isMajor: false, flag: "https://media.api-sports.io/flags/es.svg" };
    }
    return { name: "Serie A", country: "Equador", tier: 2, isMajor: false, flag: "https://media.api-sports.io/flags/ec.svg" };
  }

  // ID 141 Conflict: Itália Coppa Italia vs Alemanha DFB Pokal
  if (leagueId === 141) {
    if (nameLower.includes("pokal") || nameLower.includes("dfb") || nameLower.includes("alemanha") || nameLower.includes("germany")) {
      return { name: "DFB Pokal", country: "Alemanha", tier: 2, isMajor: false, flag: "https://media.api-sports.io/flags/de.svg" };
    }
    return { name: "Coppa Italia", country: "Itália", tier: 1, isMajor: true, flag: "https://media.api-sports.io/flags/it.svg" };
  }

  return LEAGUE_DICTIONARY[leagueId];
};

export default function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [realTodayDate, setRealTodayDate] = useState(() => getLocalDateString());
  const [selectedDate, setSelectedDate] = useState(() => getLocalDateString());
  const [liveOnly, setLiveOnly] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState("all");
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSimulated, setIsSimulated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [dynamicLeagues, setDynamicLeagues] = useState<Record<number, { name: string; country: string; logo?: string; flag?: string }>>({});

  // Layout View mode Toggle ("games" list vs social fan "feed")
  const [viewMode, setViewMode] = useState<"games" | "feed">("games");
  
  // Sports category state
  const [selectedSport, setSelectedSport] = useState("futebol");
  
  // Favorites toggle state
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  // Favorites state storing leagues (IDs), teams (names), players (names)
  const [favorites, setFavorites] = useState<{
    leagues: number[];
    teams: string[];
    players: string[];
  }>(() => {
    try {
      const saved = localStorage.getItem("worldscore_favorites");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    return { leagues: [], teams: [], players: [] };
  });

  // Automatically save favorites to local storage on changes
  useEffect(() => {
    localStorage.setItem("worldscore_favorites", JSON.stringify(favorites));
  }, [favorites]);

  // Dynamic fetch of resolved leagues dictionary from the backend on load
  useEffect(() => {
    fetch("/api/leagues")
      .then(res => {
        if (res.ok) return res.json();
        throw new Error("Failed to load backend leagues database");
      })
      .then(data => {
        if (data && typeof data === "object") {
          const norm: Record<number, { name: string; country: string; logo?: string; flag?: string }> = {};
          Object.entries(data).forEach(([key, val]: [string, any]) => {
            const leagueId = parseInt(key, 10);
            if (!isNaN(leagueId) && val) {
              norm[leagueId] = {
                name: val.name,
                country: val.country,
                logo: val.logo,
                flag: val.flag
              };
            }
          });
          setDynamicLeagues(norm);
        }
      })
      .catch(err => {
        console.log("[Dynamic leagues fetch error]", err);
      });
  }, []);

  const toggleFavoriteLeague = (leagueId: number) => {
    setFavorites(prev => {
      const exists = prev.leagues.includes(leagueId);
      const nextLeagues = exists 
        ? prev.leagues.filter(id => id !== leagueId)
        : [...prev.leagues, leagueId];
      return { ...prev, leagues: nextLeagues };
    });
  };

  const toggleFavoriteTeam = (teamName: string) => {
    setFavorites(prev => {
      const exists = prev.teams.includes(teamName);
      const nextTeams = exists
        ? prev.teams.filter(t => t !== teamName)
        : [...prev.teams, teamName];
      return { ...prev, teams: nextTeams };
    });
  };

  const toggleFavoritePlayer = (playerName: string) => {
    setFavorites(prev => {
      const exists = prev.players.includes(playerName);
      const nextPlayers = exists
        ? prev.players.filter(p => p !== playerName)
        : [...prev.players, playerName];
      return { ...prev, players: nextPlayers };
    });
  };
  
  // Settings configurations (with Language support)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [config, setConfig] = useState<SettingsConfig>({
    theme: "light",
    country: "Brazil",
    autoCountryDetected: "Brasil (BR)",
    alertsEnabled: true,
    language: "pt_br"
  });

  // User authentication flow states
  const [user, setUser] = useState<string | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Load saved user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("ws_logged_user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.name) {
          setUser(parsed.name);
        }
      } catch (e) {}
    }
  }, []);

  // Collapsible drawers/accordions state corresponding to each country
  const [expandedCountries, setExpandedCountries] = useState<Record<string, boolean>>({});

  // Collapsible sub-drawers for leagues inside country drawers (closed/collapsed by default)
  const [expandedSubLeagues, setExpandedSubLeagues] = useState<Record<string, boolean>>({});

  const toggleSubLeague = (key: string) => {
    setExpandedSubLeagues(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Keep track of score changes to trigger goals toasts
  const [goalToast, setGoalToast] = useState<{
    match: Match;
    teamName: string;
    scorer: string;
    minute: number;
    homeScore: number;
    awayScore: number;
  } | null>(null);

  // Store previously loaded matches to observe score shifts
  const prevMatchesRef = useRef<Match[]>([]);

  // Load and auto-detect country and language config on mount
  useEffect(() => {
    const saved = localStorage.getItem("worldscore_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Default language if not present in older config saved formats, or migrate pt to pt_br
        if (!parsed.language || parsed.language === "pt") parsed.language = "pt_br";
        setConfig(parsed);
      } catch (e) {}
    } else {
      let detectedCountry = "Brazil";
      let detectedLang: Language = "pt_br";

      if (typeof navigator !== "undefined") {
        const blang = (navigator.language || "").toLowerCase();
        const tz = (Intl?.DateTimeFormat()?.resolvedOptions()?.timeZone || "").toLowerCase();
        
        if (blang.includes("es") || tz.includes("madrid") || tz.includes("spain")) {
          detectedCountry = "Spain";
          detectedLang = "es";
        } else if (blang.includes("en") || tz.includes("london") || tz.includes("europe") || tz.includes("america/new_york")) {
          detectedCountry = "England";
          detectedLang = "en";
        } else if (blang.includes("fr")) {
          detectedLang = "fr";
        } else if (blang.includes("it")) {
          detectedLang = "it";
        } else if (blang.includes("de")) {
          detectedLang = "de";
        } else if (blang.includes("pt-pt") || blang.includes("pt-pg") || tz.includes("lisbon") || tz.includes("europe/lisbon")) {
          detectedCountry = "Spain";
          detectedLang = "pt_pt";
        } else {
          detectedCountry = "Brazil";
          detectedLang = "pt_br";
        }
      }
      
      const newCfg: SettingsConfig = {
        theme: "light",
        country: detectedCountry,
        autoCountryDetected: detectedCountry === "Brazil" ? "Brasil" : detectedCountry === "Spain" ? "Espanha" : "Inglaterra",
        alertsEnabled: true,
        language: detectedLang
      };
      setConfig(newCfg);
      localStorage.setItem("worldscore_settings", JSON.stringify(newCfg));
    }

    // Resolve real today date of physical calendar (prioritizing user browser local clock to respect user timezone)
    const resolveRealToday = async () => {
      try {
        const localTodayStr = getLocalDateString();
        setRealTodayDate(localTodayStr);
        setSelectedDate(localTodayStr);
      } catch (err) {
        console.error("Failed to resolve real today date:", err);
      }
    };
    resolveRealToday();
  }, []);

  const language = config.language || "pt_br";
  const isPt = language.startsWith("pt");
  const t = translations[language] || translations.pt_br;

  // Save config on changes
  const handleSaveConfig = (newCfg: SettingsConfig) => {
    setConfig(newCfg);
    localStorage.setItem("worldscore_settings", JSON.stringify(newCfg));
  };

  // Monitor Window size to switch master-detail layout mode dynamically
  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Set initial selected match once fixtures load
  useEffect(() => {
    if (isLargeScreen && matches.length > 0 && !selectedMatch) {
      // Prioritize selecting a Live game, else the first match
      const liveGame = matches.find(m => ["1H", "2H", "HT", "ET"].includes(m.fixture.status.short));
      setSelectedMatch(liveGame || matches[0]);
    }
  }, [matches, isLargeScreen]);

// Main fetch function
  // --- TRADUTOR DA NOVA API FOTMOB PARA O NOSSO SITE ---
  const mapApiToMatch = (item: any): Match => {
    let leagueId = item.leagueId;
    
    const rawLeagueNameCheck = (item.league?.name || item.leagueName || "").toLowerCase();

    // Group Mapping & Inheriting logic
    let parentLeagueId = leagueId;
    let groupName = "";

    // Mapeamento de Grupos - Libertadores
    if ([924595, 924597].includes(leagueId)) {
      parentLeagueId = 10032; // ID Pai da Libertadores (para puxar o Logo)
      if (leagueId === 924595) groupName = "Grupo D";
      if (leagueId === 924597) groupName = "Grupo F";
    }
    // Mapeamento de Grupos - Sudamericana
    else if ([924591, 924596].includes(leagueId)) {
      parentLeagueId = 10036; // ID Pai da Sudamericana
      if (leagueId === 924591) groupName = "Grupo A";
    } else {
      // Fallback caso o nome original da liga contenha "Group" ou "Grupo"
      const matchGroup = rawLeagueNameCheck.match(/(?:group|grupo)\s+([a-z0-9]+)/i);
      if (matchGroup) {
        groupName = "Grupo " + matchGroup[1].toUpperCase();
      }
    }

    const isChampionsLeague = rawLeagueNameCheck.includes("champions league") && 
      !rawLeagueNameCheck.includes("women") && 
      !rawLeagueNameCheck.includes("femin") && 
      leagueId !== 904995;

    if (isChampionsLeague) {
      parentLeagueId = 42;
    }

    // Fallback logic using the smart resolver function on parentLeagueId
    let dictEntry = getLeagueDictEntry(parentLeagueId, item.league?.name || item.leagueName);
    
    if (isChampionsLeague) {
      dictEntry = { 
        name: "UEFA Champions League", 
        country: "Europa", 
        tier: 1, 
        isMajor: true, 
        flag: "https://media.api-sports.io/flags/world.svg" 
      };
    }

    let resolvedName: string;
    let resolvedCountry: string;
    let resolvedTier: number;
    
    if (dictEntry) {
      resolvedName = dictEntry.name;
      resolvedCountry = dictEntry.country;
      resolvedTier = dictEntry.tier || 99;
    } else {
      const dynEntry = dynamicLeagues[parentLeagueId];
      const rawLeagueName = item.league?.name || item.leagueName || dynEntry?.name || `LIGA ${parentLeagueId}`;
      const rawLeagueCountry = item.league?.country || item.leagueCountry || dynEntry?.country || "";
      
      resolvedName = rawLeagueName;
      
      const containsAmistoso = rawLeagueName.toLowerCase().includes("amistoso") || rawLeagueName.toLowerCase().includes("friendly");
      if (containsAmistoso) {
        resolvedCountry = "Mundo";
      } else if (rawLeagueCountry) {
        resolvedCountry = rawLeagueCountry;
      } else {
        resolvedCountry = "Outros Países";
      }
      
      resolvedTier = 99;

      // Smart promotion of continental tournaments (Rule 3)
      const normCheck = rawLeagueName.toLowerCase();
      if (normCheck.includes("libertadores") || 
          normCheck.includes("sudamericana") || 
          normCheck.includes("sulamericana") || 
          normCheck.includes("champions league") || 
          normCheck.includes("europa league")) {
        resolvedTier = 1;
        if (normCheck.includes("libertadores") || normCheck.includes("sudamericana") || normCheck.includes("sulamericana")) {
          resolvedCountry = "América do Sul";
        } else {
          resolvedCountry = "Europa";
        }
      }
    }

    const isFinished = item.status?.finished || false;
    const isOngoing = item.status?.ongoing || false;
    const isCancelled = item.status?.cancelled || false;

    let statusShort = "NS";
    let statusLong = "Not Started";
    let elapsed = 0;

    // Tradução do Status do Jogo (Faz o filtro "Ao Vivo" voltar a funcionar)
    if (isFinished) {
      statusShort = "FT";
      statusLong = "Match Finished";
      elapsed = 90;
    } else if (isOngoing) {
      const liveTimeStr = item.status?.liveTime?.short || "";
      if (liveTimeStr.includes("HT")) {
        statusShort = "HT";
        statusLong = "Halftime";
        elapsed = 45;
      } else {
        statusShort = "2H"; 
        statusLong = "Second Half";
        elapsed = parseInt(liveTimeStr.replace(/\D/g, "")) || 0;
      }
    } else if (isCancelled) {
      statusShort = "CANC";
      statusLong = "Cancelled";
    }

    const homeGoals = item.home?.score ?? null;
    const awayGoals = item.away?.score ?? null;

    let homeWinner = false;
    let awayWinner = false;
    if (isFinished && homeGoals !== null && awayGoals !== null) {
      if (homeGoals > awayGoals) homeWinner = true;
      if (awayGoals > homeGoals) awayWinner = true;
    }

    const homeLogo = `https://images.fotmob.com/image_resources/logo/teamlogo/${item.home?.id}_large.png`;
    const awayLogo = `https://images.fotmob.com/image_resources/logo/teamlogo/${item.away?.id}_large.png`;
    const leagueLogo = parentLeagueId === 904995 ? 'https://images.fotmob.com/image_resources/logo/leaguelogo/42.png' : 'https://images.fotmob.com/image_resources/logo/leaguelogo/' + parentLeagueId + '.png';

    const resolvedCountryDetails = getLocalizedCountryDetails(resolvedCountry);
    const leagueFlag = resolvedCountryDetails?.flag || "https://media.api-sports.io/flags/world.svg";

    return {
      fixture: {
        id: item.id,
        referee: null,
        timezone: "UTC",
        date: item.status?.utcTime || new Date().toISOString(),
        timestamp: item.timeTS ? item.timeTS / 1000 : Date.now() / 1000,
        periods: { first: null, second: null },
        venue: { id: null, name: null, city: null },
        status: { short: statusShort, long: statusLong, elapsed: elapsed }
      },
      league: {
        id: leagueId,
        parentLeagueId: parentLeagueId,
        groupName: groupName,
        name: resolvedName,
        country: resolvedCountry,
        logo: leagueLogo,
        flag: leagueFlag,
        tier: resolvedTier
      },
      teams: {
        home: { id: item.home?.id, name: item.home?.name || "Home", logo: homeLogo, winner: homeWinner },
        away: { id: item.away?.id, name: item.away?.name || "Away", logo: awayLogo, winner: awayWinner }
      },
      goals: { home: homeGoals, away: awayGoals },
      score: {
        halftime: { home: null, away: null },
        fulltime: { home: homeGoals, away: awayGoals },
        extratime: { home: null, away: null },
        penalty: { home: null, away: null }
      },
      tier: resolvedTier,
      events: [], statistics: [], lineups: [], detailsLoaded: false
    };
  };

// --- FUNÇÃO PRINCIPAL DE LIGAÇÃO À RAPIDAPI (COM PENEIRA DE FUSO HORÁRIO) ---
  const fetchMatches = async (date: string, isSilent = false) => {
    if (!isSilent) setLoading(true);
    let nextMatches: Match[] = [];
    try {
      // 1. Calcular o início e fim do dia selecionado no fuso horário local do utilizador
      const localStart = new Date(`${date}T00:00:00`);
      const localEnd = new Date(`${date}T23:59:59`);
      
      // 2. Descobrir quais os dias UTC (Londres) que este dia local abrange
      const utcDay1 = localStart.toISOString().slice(0, 10).replace(/-/g, "");
      const utcDay2 = localEnd.toISOString().slice(0, 10).replace(/-/g, "");

      // 3. Preparar as chamadas à API (1 ou 2 chamadas dependendo do fuso horário)
      const urlsToFetch = [utcDay1];
      if (utcDay1 !== utcDay2) {
        urlsToFetch.push(utcDay2);
      }

      // 4. Fazer o fetch aos 2 dias simultaneamente para não perdermos os jogos noturnos
      let rawResultsSuccessful = false;
      let allRawMatches: any[] = [];
      try {
        const fetchPromises = urlsToFetch.map(utcDate => 
          fetch(`https://free-api-live-football-data.p.rapidapi.com/football-get-matches-by-date?date=${utcDate}`, {
            method: "GET",
            headers: {
              "x-rapidapi-key": "9b9bc4cde1mshac85de8628281aap1fe278jsna8a022da00be",
              "x-rapidapi-host": "free-api-live-football-data.p.rapidapi.com"
            }
          }).then(res => {
            if (!res.ok) throw new Error("Erro de servidor ao buscar jogos");
            return res.json();
          })
        );

        const results = await Promise.all(fetchPromises);
        
        // 5. Juntar todos os jogos num caldeirão e remover duplicados
        const matchIds = new Set();
        results.forEach(data => {
          const matches = data.response?.matches || [];
          matches.forEach((m: any) => {
            if (!matchIds.has(m.id)) {
              matchIds.add(m.id);
              allRawMatches.push(m);
            }
          });
        });
        rawResultsSuccessful = allRawMatches.length > 0;
      } catch (directErr) {
        console.error("Erro na chamada directa à API (tentando fallback local):", directErr);
      }

      if (rawResultsSuccessful) {
        // 6. A GRANDE PENEIRA: Filtrar APENAS os jogos que caem no NOSSO dia local!
        const filteredRawMatches = allRawMatches.filter(m => {
          if (!m.status?.utcTime) return false;
          
          // Transforma a data UTC da API no horário do telemóvel/pc do utilizador
          const matchLocalObj = new Date(m.status.utcTime);
          const yyyy = matchLocalObj.getFullYear();
          const mm = String(matchLocalObj.getMonth() + 1).padStart(2, '0');
          const dd = String(matchLocalObj.getDate()).padStart(2, '0');
          const matchLocalStr = `${yyyy}-${mm}-${dd}`;
          
          // Só passa na peneira se o dia bater certo com o que clicámos no calendário
          return matchLocalStr === date;
        });

        // 7. Passar os jogos filtrados pela nossa máquina de tradução
        nextMatches = filteredRawMatches.map(mapApiToMatch);
      } else {
        // FALLBACK LOCAL PROXY
        console.log(`[App fetchMatches] Chamada directa falhou ou vazia. Buscando do proxy local: /api/fixtures?date=${date}`);
        const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Sao_Paulo";
        const proxyRes = await fetch(`/api/fixtures?date=${date}&timezone=${encodeURIComponent(localTz)}`);
        if (!proxyRes.ok) {
          throw new Error("Falha ao carregar jogos de todas as fontes.");
        }
        const proxyData = await proxyRes.json();
        nextMatches = proxyData.response || [];
      }

      // --- Daqui para baixo é o código original dos Toasts de Golos e Updates ---
      if (prevMatchesRef.current.length > 0 && nextMatches.length > 0) {
        nextMatches.forEach((newM: Match) => {
          const oldM = prevMatchesRef.current.find(o => o.fixture.id === newM.fixture.id);
          if (oldM) {
            const homeDiff = (newM.goals.home ?? 0) - (oldM.goals.home ?? 0);
            const awayDiff = (newM.goals.away ?? 0) - (oldM.goals.away ?? 0);
            if (homeDiff > 0 || awayDiff > 0) {
              setGoalToast({
                match: newM,
                teamName: homeDiff > 0 ? newM.teams.home.name : newM.teams.away.name,
                scorer: "Jogador", // (A API do FotMob envia os marcadores noutro endpoint, usamos genérico por enquanto)
                minute: newM.fixture.status.elapsed,
                homeScore: newM.goals.home ?? 0,
                awayScore: newM.goals.away ?? 0
              });
              setTimeout(() => { setGoalToast(null); }, 6000);
            }
          }
        });
      }

      setMatches(prevList => {
        return nextMatches.map((newM: Match) => {
          const existing = prevList.find(oldM => oldM.fixture.id === newM.fixture.id);
          if (existing) {
            return { ...newM, events: existing.events || [], statistics: existing.statistics || [], lineups: existing.lineups || [], detailsLoaded: existing.detailsLoaded || false };
          }
          return newM;
        });
      });
      prevMatchesRef.current = nextMatches;

      if (selectedMatch) {
        const updatedSelected = nextMatches.find(m => m.fixture.id === selectedMatch.fixture.id);
        if (updatedSelected) {
          setSelectedMatch(prev => {
            if (prev && prev.fixture.id === updatedSelected.fixture.id) {
              return { ...updatedSelected, events: prev.events || [], statistics: prev.statistics || [], lineups: prev.lineups || [], detailsLoaded: prev.detailsLoaded || false };
            }
            return updatedSelected;
          });
        }
      }

      setError(null);
    } catch (err: any) {
      console.error("Erro crítico ao buscar partidas para a página inicial (Home):", err);
      if (!isSilent) {
        setError(err.message || "Erro de conexão ao buscar jogos.");
      }
    } finally {
      if (!isSilent) setLoading(false);
    }
  };


  // Fetch on date changes
  useEffect(() => {
    setSelectedMatch(null);
    setSelectedLeague("all");
    fetchMatches(selectedDate);
  }, [selectedDate]);

  // Load match details dynamically if missing
  useEffect(() => {
    if (!selectedMatch) return;
    
    const isFutebol = selectedSport === "futebol";
    const needsDetails = isFutebol && !selectedMatch.detailsLoaded;

    if (needsDetails) {
      const matchId = selectedMatch.fixture.id;
      const fetchDetails = async () => {
        try {
          let detailData: any = null;
          let success = false;

          // 1. PRIMEIRA TENTATIVA: Query server-side api fixture-detail (cached, secure)
          try {
            const localRes = await fetch(`/api/fixture-detail?id=${matchId}`);
            if (localRes.ok) {
              detailData = await localRes.json();
              if (detailData && (detailData.events || detailData.statistics || detailData.lineups)) {
                success = true;
              }
            }
          } catch (localErr) {
            console.log("[Client] Local proxy /api/fixture-detail failed, falling back to direct RapidAPI:", localErr);
          }

          // 2. SEGUNDA TENTATIVA: Direct RapidAPI (Vercel)
          if (!success) {
            const rapidHeaders = {
              "x-rapidapi-host": "free-api-live-football-data.p.rapidapi.com",
              "x-rapidapi-key": "9b9bc4cde1mshac85de8628281aap1fe278jsna8a022da00be"
            };

            // Fetch incidents, stats, hometeam lineup, awayteam lineup in parallel
            const [detailRes, statsRes, homeLineupRes, awayLineupRes] = await Promise.all([
              fetch(`https://free-api-live-football-data.p.rapidapi.com/football-get-match-detail?eventid=${matchId}`, { headers: rapidHeaders }).catch(() => null),
              fetch(`https://free-api-live-football-data.p.rapidapi.com/football-get-match-all-stats?eventid=${matchId}`, { headers: rapidHeaders }).catch(() => null),
              fetch(`https://free-api-live-football-data.p.rapidapi.com/football-get-hometeam-lineup?eventid=${matchId}`, { headers: rapidHeaders }).catch(() => null),
              fetch(`https://free-api-live-football-data.p.rapidapi.com/football-get-awayteam-lineup?eventid=${matchId}`, { headers: rapidHeaders }).catch(() => null)
            ].map(p => p?.then(r => r && r.ok ? r.json() : null).catch(() => null)));

            const infoData = detailRes || {};
            const homeTeamId = selectedMatch.teams.home.id;
            const homeTeamName = selectedMatch.teams.home.name;
            const awayTeamId = selectedMatch.teams.away.id;
            const awayTeamName = selectedMatch.teams.away.name;

            const homeTeamRef = { id: homeTeamId, name: homeTeamName };
            const awayTeamRef = { id: awayTeamId, name: awayTeamName };

            // Parse Incidents (Events/Incidents)
            let parsedEvents: any[] = [];
            const incidentsList = infoData.response?.incidents || infoData.incidents || [];
            if (Array.isArray(incidentsList)) {
              parsedEvents = incidentsList.map((inc: any) => {
                const isHome = inc.isHome ?? (inc.home === true);
                const team = isHome ? homeTeamRef : awayTeamRef;
                
                let type = "Subst";
                let detail = inc.incidentClass || "";
                if (inc.incidentType === "goal") {
                  type = "Goal";
                  detail = inc.incidentClass === "regular" ? "Normal Goal" : (inc.incidentClass === "penalty" ? "Penalty" : "Own Goal");
                } else if (inc.incidentType === "card") {
                  type = "Card";
                  detail = inc.incidentClass === "yellow" ? "Yellow Card" : "Red Card";
                } else if (inc.incidentType === "substitution") {
                  type = "Subst";
                  detail = `Sai: ${inc.playerOut?.name || "Jogador"} / Entra: ${inc.playerIn?.name || "Jogador"}`;
                }

                return {
                  time: { elapsed: inc.time },
                  team: { id: team.id, name: team.name },
                  player: { name: inc.player?.name || inc.playerIn?.name || "Jogador" },
                  assist: inc.assist ? { name: inc.assist.name } : null,
                  type,
                  detail
                };
              });
            }

            // Parse Lineups
            let parsedLineups: any[] = [];
            const homeLineupBlock = homeLineupRes?.response?.lineup || homeLineupRes?.lineup;
            const awayLineupBlock = awayLineupRes?.response?.lineup || awayLineupRes?.lineup;

            const mapLineupClient = (teamBlock: any, teamRef: any) => {
              if (!teamBlock || !teamBlock.starters) return null;
              const starList = teamBlock.starters || [];
              const subList = teamBlock.subs || [];

              const startXI = starList.map((p: any) => {
                let pos = "M";
                if (p.usualPlayingPositionId === 0) pos = "G";
                else if (p.usualPlayingPositionId === 1) pos = "D";
                else if (p.usualPlayingPositionId === 2) pos = "M";
                else if (p.usualPlayingPositionId === 3) pos = "F";
                return {
                  player: {
                    id: p.id,
                    name: p.name,
                    number: parseInt(p.shirtNumber) || 0,
                    pos,
                    rating: p.performance?.rating || null,
                    gridX: p.verticalLayout?.x ?? p.horizontalLayout?.x ?? 0.5,
                    gridY: p.verticalLayout?.y ?? p.horizontalLayout?.y ?? 0.5
                  }
                };
              });

              const substitutes = subList.map((p: any) => {
                let pos = "M";
                if (p.usualPlayingPositionId === 0) pos = "G";
                else if (p.usualPlayingPositionId === 1) pos = "D";
                else if (p.usualPlayingPositionId === 2) pos = "M";
                else if (p.usualPlayingPositionId === 3) pos = "F";
                return {
                  player: {
                    id: p.id,
                    name: p.name,
                    number: parseInt(p.shirtNumber) || 0,
                    pos,
                    rating: p.performance?.rating || null
                  }
                };
              });

              return {
                team: { ...teamRef, logo: `https://img.sofascore.com/api/v1/team/${teamRef.id}/image` },
                formation: teamBlock.formation || "4-3-3",
                startXI,
                substitutes,
                coach: { name: teamBlock.coach?.name || "Técnico" }
              };
            };

            const mappedH = mapLineupClient(homeLineupBlock, homeTeamRef);
            const mappedA = mapLineupClient(awayLineupBlock, awayTeamRef);
            if (mappedH) parsedLineups.push(mappedH);
            if (mappedA) parsedLineups.push(mappedA);

            // Parse Stats
            let parsedStats: any[] = [];
            const rawStatsList = statsRes?.response?.stats || statsRes?.stats;
            if (rawStatsList) {
              const statTypeMapping: Record<string, string> = {
                "Ball possession": "Ball Possession",
                "Total shots": "Total Shots",
                "Shots on target": "Shots on Goal",
                "Shots off target": "Shots off Goal",
                "Corner kicks": "Corner Kicks",
                "Fouls": "Fouls",
                "Yellow cards": "Yellow Cards",
                "Red cards": "Red Cards",
                "Goalkeeper saves": "Goalkeeper Saves",
                "Passes": "Total passes",
                "Accurate passes": "Passes accurate"
              };

              const homeStatsList: any[] = [];
              const awayStatsList: any[] = [];

              if (Array.isArray(rawStatsList)) {
                rawStatsList.forEach((group: any) => {
                  if (group && Array.isArray(group.stats)) {
                    group.stats.forEach((item: any) => {
                      if (item && item.stats && item.stats.length === 2) {
                        const parentType = item.title;
                        const mappedType = statTypeMapping[parentType] || parentType;
                        homeStatsList.push({ type: mappedType, value: item.stats[0] });
                        awayStatsList.push({ type: mappedType, value: item.stats[1] });
                      }
                    });
                  }
                });
              }

              if (homeStatsList.length > 0) {
                parsedStats = [
                  { team: { ...homeTeamRef, logo: `https://img.sofascore.com/api/v1/team/${homeTeamId}/image` }, statistics: homeStatsList },
                  { team: { ...awayTeamRef, logo: `https://img.sofascore.com/api/v1/team/${awayTeamId}/image` }, statistics: awayStatsList }
                ];
              }
            }

            detailData = {
              events: parsedEvents,
              statistics: parsedStats,
              lineups: parsedLineups
            };
          }

          setSelectedMatch(prev => {
            if (prev && prev.fixture.id === matchId) {
              return {
                ...prev,
                events: detailData.events || [],
                statistics: detailData.statistics || [],
                lineups: detailData.lineups || [],
                detailsLoaded: true
              };
            }
            return prev;
          });

          setMatches(prevList => prevList.map(m => {
            if (m.fixture.id === matchId) {
              return {
                ...m,
                events: detailData.events || [],
                statistics: detailData.statistics || [],
                lineups: detailData.lineups || [],
                detailsLoaded: true
              };
            }
            return m;
          }));
        } catch (err) {
          console.error("Erro ao buscar detalhes estendidos:", err);
          setSelectedMatch(prev => {
            if (prev && prev.fixture.id === matchId) {
              return { ...prev, detailsLoaded: true };
            }
            return prev;
          });
        }
      };

      fetchDetails();
    }
  }, [selectedMatch?.fixture.id, selectedSport]);

  // Periodic polling every 5 seconds to load simulated live match ticks and scores
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMatches(selectedDate, true);
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedDate, selectedMatch]);

  // Stepping calendar date helper
  const handleStepDay = (step: number) => {
    const baseDate = new Date(selectedDate + "T12:00:00");
    baseDate.setDate(baseDate.getDate() + step);
    setSelectedDate(baseDate.toISOString().slice(0, 10));
  };

  // Locale detection for date string and days formatting
  let localeStr = "pt-BR";
  if (language === "en") localeStr = "en-US";
  else if (language === "es") localeStr = "es-ES";
  else if (language === "fr") localeStr = "fr-FR";
  else if (language === "it") localeStr = "it-IT";
  else if (language === "de") localeStr = "de-DE";

  // Helper to resolve descriptive schedule names in active calendar (Ontem, Amanhã, Hoje, or custom formats)
  const getCalendarLabel = (dateStr: string) => {
    const isPt = language.startsWith("pt");
    const isEs = language === "es";
    const isFr = language === "fr";
    const isIt = language === "it";
    const isDe = language === "de";

    if (dateStr === realTodayDate) {
      if (isPt) return "Hoje";
      if (isEs) return "Hoy";
      if (isFr) return "Aujourd'hui";
      if (isIt) return "Oggi";
      if (isDe) return "Heute";
      return "Today";
    }

    // Yesterday
    const yesterdayDate = new Date(realTodayDate + "T12:00:00");
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = getLocalDateString(yesterdayDate);
    if (dateStr === yesterdayStr) {
      if (isPt) return "Ontem";
      if (isEs) return "Ayer";
      if (isFr) return "Hier";
      if (isIt) return "Ieri";
      if (isDe) return "Gestern";
      return "Yesterday";
    }

    // Tomorrow
    const tomorrowDate = new Date(realTodayDate + "T12:00:00");
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrowStr = getLocalDateString(tomorrowDate);
    if (dateStr === tomorrowStr) {
      if (isPt) return "Amanhã";
      if (isEs) return "Mañana";
      if (isFr) return "Demain";
      if (isIt) return "Domani";
      if (isDe) return "Morgen";
      return "Tomorrow";
    }

    // Others: date + day of the week
    const d = new Date(dateStr + "T12:00:00");
    const formattedDate = d.toLocaleDateString(localeStr, { day: "2-digit", month: "2-digit" });
    const weekdayName = d.toLocaleDateString(localeStr, { weekday: "long" })
      .replace("-feira", "")
      .replace("-Feira", "")
      .replace(".", "");
    const capitalizedWeekday = weekdayName.charAt(0).toUpperCase() + weekdayName.slice(1);
    return `${formattedDate} - ${capitalizedWeekday}`;
  };

  // Format date to local readable headers
  const formattedHeaderDate = new Date(selectedDate + "T12:00:00")
    .toLocaleDateString(localeStr, {
      weekday: "long",
      day: "2-digit",
      month: "short"
    })
    .toUpperCase();

  // Resolve correct matches list for the selected sport
  const activeSportMatches = selectedSport === "futebol" ? matches : getMockSportMatches(selectedSport, selectedDate);

  // Extract all distinct leagues list representing currently loaded games to fill dynamic filters
  const distinctLeagues = (Array.from(
    new Map(activeSportMatches.map((m) => [m.league.id, m.league])).values()
  ) as League[]).sort((a, b) => a.name.localeCompare(b.name));

  // Filter logic
  const filteredMatches = activeSportMatches.filter((match) => {
    const isLive = ["1H", "2H", "HT", "ET", "BT", "P", "SUSP", "INT"].includes(
      match.fixture.status.short
    );
    if (liveOnly && !isLive) return false;

    // Filter by favorites if showOnlyFavorites is true
    if (showOnlyFavorites) {
      const isLeagueFav = favorites.leagues.includes(match.league.id);
      const isHomeTeamFav = favorites.teams.includes(match.teams.home.name);
      const isAwayTeamFav = favorites.teams.includes(match.teams.away.name);
      
      const matchLineups = match.lineups || [];
      const hasFavPlayer = matchLineups.some(lineup => {
        const starters = lineup.startXI?.some(xi => favorites.players.includes(xi.player.name)) ?? false;
        const subs = lineup.substitutes?.some(sub => favorites.players.includes(sub.player.name)) ?? false;
        return starters || subs;
      });

      if (!isLeagueFav && !isHomeTeamFav && !isAwayTeamFav && !hasFavPlayer) {
        return false;
      }
    }

    return true;
  });

  // Identify prestigiadas competições (Major International tournaments) to separate them on top
  const isMajorLeague = (leagueName: string, leagueCountry: string, leagueId?: number): boolean => {
    if (leagueId !== undefined) {
      const info = getLeagueDictEntry(leagueId, leagueName) || dynamicLeagues[leagueId];
      if (info !== undefined) {
        return info.isMajor || false;
      }
    }
    const ln = leagueName.toLowerCase();
    const lc = leagueCountry.toLowerCase();
    return (
      ln.includes("libertadores") ||
      ln.includes("sudamericana") ||
      ln.includes("sulamericana") ||
      ln.includes("champions league") ||
      ln.includes("europa league") ||
      ln.includes("conference league") ||
      ln.includes("recopa") ||
      lc.includes("south-america") ||
      lc.includes("américa do sul") ||
      ln.includes("brasileirão") ||
      ln.includes("premier league") ||
      ln.includes("la liga")
    );
  };

  const getStandardTitle = (leagueName: string): string => {
    const ln = leagueName.toLowerCase();
    if (ln.includes("libertadores")) return "CONMEBOL Libertadores";
    if (ln.includes("sudamericana") || ln.includes("sulamericana")) return "CONMEBOL Sudamericana";
    if (ln.includes("champions league")) return "UEFA Champions League";
    if (ln.includes("europa league")) return "UEFA Europa League";
    if (ln.includes("conference league")) return "UEFA Conference League";
    return leagueName;
  };

  const parseGroupName = (leagueName: string, roundName?: string): string => {
    const textToSearch = `${leagueName} ${roundName || ""}`.toLowerCase();
    
    // Check for Group / Grupo patterns
    const matchGroup = 
      textToSearch.match(/grupo\s*([a-h0-9]+)/i) || 
      textToSearch.match(/group\s*([a-h0-9]+)/i) || 
      textToSearch.match(/grp\.?\s*([a-h0-9]+)/i);
      
    if (matchGroup) {
      return `Grupo ${matchGroup[1].toUpperCase()}`;
    }
    
    // Check for Round / Rodada patterns
    const matchRound = 
      textToSearch.match(/rodada\s*([0-9]+)/i) || 
      textToSearch.match(/round\s*([0-9]+)/i);
      
    if (matchRound) {
      return `Rodada ${matchRound[1]}`;
    }

    if (textToSearch.includes("semifinal") || textToSearch.includes("semi-final")) {
      return "Semifinais";
    }
    if (textToSearch.includes("final") && !textToSearch.includes("semifinal") && !textToSearch.includes("oitavas") && !textToSearch.includes("quartas")) {
      return "Final";
    }
    if (textToSearch.includes("quarter") || textToSearch.includes("quartas") || textToSearch.includes("quarte-final")) {
      return "Quartas de Final";
    }
    if (textToSearch.includes("octave") || textToSearch.includes("oitavas") || textToSearch.includes("round of 16")) {
      return "Oitavas de Final";
    }

    if (roundName) {
      return roundName;
    }
    
    return "Fase Geral";
  };

  const getLocalizedCountryDetails = (countryName: string) => {
    const norm = countryName.trim().toLowerCase();
    
    const codeMap: Record<string, { pt: string; code: string }> = {
      "br": { pt: "Brasil", code: "br" },
      "bra": { pt: "Brasil", code: "br" },
      "ar": { pt: "Argentina", code: "ar" },
      "arg": { pt: "Argentina", code: "ar" },
      "cl": { pt: "Chile", code: "cl" },
      "co": { pt: "Colômbia", code: "co" },
      "col": { pt: "Colômbia", code: "co" },
      "ec": { pt: "Equador", code: "ec" },
      "ecu": { pt: "Equador", code: "ec" },
      "py": { pt: "Paraguai", code: "py" },
      "pry": { pt: "Paraguai", code: "py" },
      "uy": { pt: "Uruguai", code: "uy" },
      "ury": { pt: "Uruguai", code: "uy" },
      "pe": { pt: "Peru", code: "pe" },
      "ve": { pt: "Venezuela", code: "ve" },
      "bol": { pt: "Bolívia", code: "bo" },
      "mx": { pt: "México", code: "mx" },
      "mex": { pt: "México", code: "mx" },
      "us": { pt: "EUA", code: "us" },
      "usa": { pt: "EUA", code: "us" },
      "eua": { pt: "EUA", code: "us" },
      "ca": { pt: "Canadá", code: "ca" },
      "es": { pt: "Espanha", code: "es" },
      "esp": { pt: "Espanha", code: "es" },
      "pt": { pt: "Portugal", code: "pt" },
      "por": { pt: "Portugal", code: "pt" },
      "it": { pt: "Itália", code: "it" },
      "ita": { pt: "Itália", code: "it" },
      "fr": { pt: "França", code: "fr" },
      "fra": { pt: "França", code: "fr" },
      "de": { pt: "Alemanha", code: "de" },
      "ger": { pt: "Alemanha", code: "de" },
      "gb": { pt: "Inglaterra", code: "gb-eng" },
      "uk": { pt: "Inglaterra", code: "gb-eng" },
      "eng": { pt: "Inglaterra", code: "gb-eng" },
      "nl": { pt: "Holanda", code: "nl" },
      "ned": { pt: "Holanda", code: "nl" },
      "be": { pt: "Bélgica", code: "be" },
      "bel": { pt: "Bélgica", code: "be" },
      "gr": { pt: "Grécia", code: "gr" },
      "grc": { pt: "Grécia", code: "gr" },
      "tr": { pt: "Turquia", code: "tr" },
      "tur": { pt: "Turquia", code: "tr" },
      "sa": { pt: "Arábia Saudita", code: "sa" },
      "ksa": { pt: "Arábia Saudita", code: "sa" },
      "jp": { pt: "Japão", code: "jp" },
      "jpn": { pt: "Japão", code: "jp" },
      "cn": { pt: "China", code: "cn" },
      "chn": { pt: "China", code: "cn" }
    };

    const nameToDetails: Record<string, { pt: string; code: string }> = {
      "brazil": { pt: "Brasil", code: "br" },
      "brasil": { pt: "Brasil", code: "br" },
      "argentina": { pt: "Argentina", code: "ar" },
      "colombia": { pt: "Colômbia", code: "co" },
      "colômbia": { pt: "Colômbia", code: "co" },
      "chile": { pt: "Chile", code: "cl" },
      "uruguay": { pt: "Uruguai", code: "uy" },
      "uruguai": { pt: "Uruguai", code: "uy" },
      "paraguay": { pt: "Paraguai", code: "py" },
      "paraguai": { pt: "Paraguai", code: "py" },
      "ecuador": { pt: "Equador", code: "ec" },
      "equador": { pt: "Equador", code: "ec" },
      "peru": { pt: "Peru", code: "pe" },
      "venezuela": { pt: "Venezuela", code: "ve" },
      "bolivia": { pt: "Bolívia", code: "bo" },
      "bolívia": { pt: "Bolívia", code: "bo" },
      "mexico": { pt: "México", code: "mx" },
      "méxico": { pt: "México", code: "mx" },
      "eua": { pt: "EUA", code: "us" },
      "usa": { pt: "EUA", code: "us" },
      "united states": { pt: "EUA", code: "us" },
      "estados unidos": { pt: "EUA", code: "us" },
      "canada": { pt: "Canadá", code: "ca" },
      "canadá": { pt: "Canadá", code: "ca" },
      "england": { pt: "Inglaterra", code: "gb-eng" },
      "inglaterra": { pt: "Inglaterra", code: "gb-eng" },
      "spain": { pt: "Espanha", code: "es" },
      "espanha": { pt: "Espanha", code: "es" },
      "portugal": { pt: "Portugal", code: "pt" },
      "italy": { pt: "Itália", code: "it" },
      "italia": { pt: "Itália", code: "it" },
      "itália": { pt: "Itália", code: "it" },
      "montenegro": { pt: "Montenegro", code: "me" },
      "lithuania": { pt: "Lituânia", code: "lt" },
      "lituânia": { pt: "Lituânia", code: "lt" },
      "czechia": { pt: "República Tcheca", code: "cz" },
      "czech republic": { pt: "República Tcheca", code: "cz" },
      "república tcheca": { pt: "República Tcheca", code: "cz" },
      "república checa": { pt: "República Tcheca", code: "cz" },
      "europa": { pt: "Europa", code: "un" },
      "europe": { pt: "Europa", code: "un" },
      "américa do sul": { pt: "América do Sul", code: "un" },
      "america do sul": { pt: "América do Sul", code: "un" },
      "south america": { pt: "América do Sul", code: "un" },
      "france": { pt: "França", code: "fr" },
      "frança": { pt: "França", code: "fr" },
      "germany": { pt: "Alemanha", code: "de" },
      "alemanha": { pt: "Alemanha", code: "de" },
      "netherlands": { pt: "Holanda", code: "nl" },
      "holanda": { pt: "Holanda", code: "nl" },
      "belgium": { pt: "Bélgica", code: "be" },
      "bélgica": { pt: "Bélgica", code: "be" },
      "greece": { pt: "Grécia", code: "gr" },
      "grécia": { pt: "Grécia", code: "gr" },
      "turkey": { pt: "Turquia", code: "tr" },
      "turquia": { pt: "Turquia", code: "tr" },
      "saudi arabia": { pt: "Arábia Saudita", code: "sa" },
      "arábia saudita": { pt: "Arábia Saudita", code: "sa" },
      "japan": { pt: "Japão", code: "jp" },
      "japão": { pt: "Japão", code: "jp" },
      "china": { pt: "China", code: "cn" },
      "russia": { pt: "Rússia", code: "ru" },
      "rússia": { pt: "Rússia", code: "ru" },
      "ukraine": { pt: "Ucrânia", code: "ua" },
      "ucrânia": { pt: "Ucrânia", code: "ua" },
      "croatia": { pt: "Croácia", code: "hr" },
      "croácia": { pt: "Croácia", code: "hr" },
      "sweden": { pt: "Suécia", code: "se" },
      "suécia": { pt: "Suécia", code: "se" },
      "norway": { pt: "Noruega", code: "no" },
      "noruega": { pt: "Noruega", code: "no" },
      "denmark": { pt: "Dinamarca", code: "dk" },
      "dinamarca": { pt: "Dinamarca", code: "dk" },
      "switzerland": { pt: "Suíça", code: "ch" },
      "suíça": { pt: "Suíça", code: "ch" },
      "scotland": { pt: "Escócia", code: "gb-sct" },
      "escócia": { pt: "Escócia", code: "gb-sct" },
      "wales": { pt: "País de Gales", code: "gb-wls" },
      "país de gales": { pt: "País de Gales", code: "gb-wls" },
      "ireland": { pt: "Irlanda", code: "ie" },
      "irlanda": { pt: "Irlanda", code: "ie" },
      "poland": { pt: "Polônia", code: "pl" },
      "polônia": { pt: "Polônia", code: "pl" },
      "austria": { pt: "Áustria", code: "at" },
      "áustria": { pt: "Áustria", code: "at" },
      "morocco": { pt: "Marrocos", code: "ma" },
      "marrocos": { pt: "Marrocos", code: "ma" },
      "egypt": { pt: "Egito", code: "eg" },
      "egito": { pt: "Egito", code: "eg" },
      "south africa": { pt: "África do Sul", code: "za" },
      "áfrica do sul": { pt: "África do Sul", code: "za" },
      "australia": { pt: "Austrália", code: "au" },
      "austrália": { pt: "Austrália", code: "au" },
      "korea": { pt: "Coreia do Sul", code: "kr" },
      "south korea": { pt: "Coreia do Sul", code: "kr" },
      "coreia": { pt: "Coreia do Sul", code: "kr" },
      "qatar": { pt: "Catar", code: "qa" },
      "catar": { pt: "Catar", code: "qa" },
      "world": { pt: "Mundo", code: "un" },
      "mundo": { pt: "Mundo", code: "un" },
      "international": { pt: "Mundo", code: "un" },
      "internacional": { pt: "Mundo", code: "un" },
      "senegal": { pt: "Senegal", code: "sn" },
      "algeria": { pt: "Argélia", code: "dz" },
      "argélia": { pt: "Argélia", code: "dz" },
      "tunisia": { pt: "Tunísia", code: "tn" },
      "tunísia": { pt: "Tunísia", code: "tn" },
      "cameroon": { pt: "Camarões", code: "cm" },
      "camarões": { pt: "Camarões", code: "cm" },
      "ghana": { pt: "Gana", code: "gh" },
      "nigeria": { pt: "Nigéria", code: "ng" },
      "nigéria": { pt: "Nigéria", code: "ng" },
      "costa rica": { pt: "Costa Rica", code: "cr" },
      "cote d'ivoire": { pt: "Costa do Marfim", code: "ci" },
      "ivory coast": { pt: "Costa do Marfim", code: "ci" },
      "costa do marfim": { pt: "Costa do Marfim", code: "ci" },
      "nz": { pt: "Nova Zelândia", code: "nz" },
      "new zealand": { pt: "Nova Zelândia", code: "nz" },
      "nova zelândia": { pt: "Nova Zelândia", code: "nz" }
    };

    if (codeMap[norm]) {
      const match = codeMap[norm];
      return {
        pt: match.pt,
        flag: `https://flagcdn.com/w40/${match.code}.png`
      };
    }

    if (nameToDetails[norm]) {
      const match = nameToDetails[norm];
      return {
        pt: match.pt,
        flag: `https://flagcdn.com/w40/${match.code}.png`
      };
    }

    const capitalized = countryName.charAt(0).toUpperCase() + countryName.slice(1);
    
    // Fallback: If countryName is a 2-letter ISO code, use it directly!
    if (countryName.length === 2) {
      return {
        pt: countryName.toUpperCase(),
        flag: `https://flagcdn.com/w40/${countryName.toLowerCase()}.png`
      };
    }
    
    return {
      pt: capitalized,
      flag: "https://flagcdn.com/w40/un.png"
    };
  };

  // Generic Drawer data interface
  interface GroupedDrawer {
    key: string;
    type: "major_league" | "country";
    title: string;
    logo: string;
    leagues: Record<string, { league: any; matches: Match[] }>;
  }

  // Group all matches strictly by country drawer
  const drawersMap: Record<string, GroupedDrawer> = {};

  filteredMatches.forEach((match) => {
    const countryDetails = getLocalizedCountryDetails(match.league.country || "Mundo");
    const drawerKey = `country-${countryDetails.pt}`;
    
    if (!drawersMap[drawerKey]) {
      drawersMap[drawerKey] = {
        key: drawerKey,
        type: "country",
        title: countryDetails.pt,
        logo: countryDetails.flag,
        leagues: {}
      };
    }
    
    const parentId = match.league.parentLeagueId || match.league.id;
    const leagueKey = `${match.league.name}-${parentId}`;
    if (!drawersMap[drawerKey].leagues[leagueKey]) {
      drawersMap[drawerKey].leagues[leagueKey] = {
        league: {
          ...match.league,
          id: parentId
        },
        matches: []
      };
    }
    drawersMap[drawerKey].leagues[leagueKey].matches.push(match);
  });

  const getCountryDrawerRank = (countryPt: string): number => {
    const norm = countryPt.trim().toLowerCase();
    
    if (norm === "brasil") return 0;
    if (norm === "inglaterra") return 1;
    if (norm === "espanha") return 2;
    if (norm === "itália" || norm === "italia") return 3;
    if (norm === "alemanha") return 4;
    if (norm === "frança") return 5;
    if (norm === "portugal") return 6;
    if (norm === "holanda") return 7;
    
    if (norm === "europa" || norm === "américa do sul" || norm === "américa do sul continental" || norm === "américadosul" || norm === "south america") return 8;
    
    if (norm === "mundo" || norm === "outros países" || norm === "outros" || norm === "outros paises" || norm === "internacional" || norm === "world") return 99;
    
    return 50; // remaining countries
  };

  const getDrawerRankAndCategory = (drawer: GroupedDrawer): { rank: number; subSortValue: string } => {
    return {
      rank: getCountryDrawerRank(drawer.title),
      subSortValue: drawer.title
    };
  };

  const sortedDrawers = Object.values(drawersMap).sort((a, b) => {
    const rankA = getCountryDrawerRank(a.title);
    const rankB = getCountryDrawerRank(b.title);
    
    if (rankA !== rankB) {
      return rankA - rankB;
    }
    
    // Sub-sorting within same rank of 8 (América do Sul vs Europa)
    if (rankA === 8) {
      const normA = a.title.trim().toLowerCase();
      const normB = b.title.trim().toLowerCase();
      const isSAmA = normA.includes("américa do sul") || normA.includes("south america");
      const isSAmB = normB.includes("américa do sul") || normB.includes("south america");
      if (isSAmA && !isSAmB) return -1;
      if (!isSAmA && isSAmB) return 1;
    }
    
    return a.title.localeCompare(b.title);
  });

  // Helper to determine the sort priority weight of each tier 1 pinned league
  const getPinnedLeagueSortWeight = (leagueObj: any): number => {
    const name = (leagueObj.name || "").toLowerCase();
    const country = (leagueObj.country || "").toLowerCase();
    
    if (name.includes("brasileirão") && name.includes("série a")) return 0;
    if (name.includes("copa do brasil")) return 1;
    if (name.includes("libertadores")) return 2;
    if (name.includes("champions league") || name.includes("champions")) return 3;
    if (name.includes("europa league")) return 4;
    if (name.includes("sudamericana")) return 5;
    
    if (country === "brasil") return 10;
    if (country === "inglaterra" || name.includes("premier league")) return 11;
    if (country === "espanha" || name.includes("la liga")) return 12;
    if (country === "itália" || country === "italia" || name.includes("serie a")) return 13;
    if (country === "alemanha" || name.includes("bundesliga")) return 14;
    if (country === "frança" || name.includes("ligue 1")) return 15;
    if (country === "portugal" || name.includes("primeira liga")) return 16;
    if (country === "holanda" || name.includes("eredivisie")) return 17;
    if (country === "europa") return 18;
    if (country === "américa do sul") return 19;
    
    return 100;
  };

  // Logical Dynamic of Highlights (Pinning Logic) - Steps A, B, C, D
  const pinnedLeaguesMap: Record<number, { league: any; matches: Match[] }> = {};
  const hasTier1Matches = filteredMatches.some((match) => match.tier === 1);
  const targetHighlightTier = hasTier1Matches ? 1 : 2;

  filteredMatches.forEach((match) => {
    if (match.tier === targetHighlightTier) {
      const leagueId = match.league.id;
      if (!pinnedLeaguesMap[leagueId]) {
        pinnedLeaguesMap[leagueId] = {
          league: match.league,
          matches: []
        };
      }
      pinnedLeaguesMap[leagueId].matches.push(match);
    }
  });

  // Convert to sorted array of pinned leagues so they render in a clean, consistent ordered way (similar to country ranking)
  const sortedPinnedLeagues = Object.entries(pinnedLeaguesMap).map(([idStr, data]) => ({
    id: parseInt(idStr, 10),
    league: data.league,
    matches: data.matches
  })).sort((a, b) => {
    return getPinnedLeagueSortWeight(a.league) - getPinnedLeagueSortWeight(b.league);
  });

  const toggleCountryDrawer = (drawerKey: string) => {
    setExpandedCountries(prev => ({
      ...prev,
      [drawerKey]: !prev[drawerKey]
    }));
  };

  const getCalendarDays = (centerDateStr: string) => {
    const list = [];
    const centerDate = new Date(centerDateStr + "T12:00:00");
    for (let i = -2; i <= 2; i++) {
      const d = new Date(centerDate);
      d.setDate(d.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const dateStr = `${yyyy}-${mm}-${dd}`;
      
      const weekdayName = d.toLocaleDateString(localeStr, { weekday: "short" }).toUpperCase().replace(".", "");
      
      list.push({
        dateStr,
        dayNum: d.getDate(),
        dayName: weekdayName
      });
    }
    return list;
  };

  const renderPinnedLeague = (leagueId: number, league: any, matches: Match[]) => {
    const key = `pinned-${leagueId}`;
    const isOpen = expandedCountries[key] !== undefined ? expandedCountries[key] : true; // Open/expanded by default!
    
    // Count active/live matches in this league for nice badge display
    const liveCount = matches.filter(m => ["1H", "2H", "HT", "ET", "BT", "INT"].includes(m.fixture.status.short)).length;
    const totalGamesCountStr = isPt ? "jogos" : language === "en" ? "matches" : language === "es" ? "partidos" : language === "fr" ? "matchs" : language === "it" ? "partite" : "Spiele";
    const isLeagueFav = favorites.leagues.includes(leagueId);

    return (
      <div 
        key={key} 
        className={`flex flex-col gap-2 rounded-2xl border transition-all ${
          isOpen 
            ? "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 p-4 shadow-2xs" 
            : "bg-white/80 dark:bg-slate-900/60 border-slate-200/40 dark:border-slate-850 p-3 h-auto"
        }`}
      >
        {/* Collapsible League Header (Rule 1) */}
        <div 
          onClick={() => {
            setExpandedCountries(prev => ({
              ...prev,
              [key]: !isOpen
            }));
          }}
          className="flex items-center justify-between w-full text-left select-none group cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <SafeImage 
               src={league.logo} 
               alt={league.name} 
               className="w-5 h-5 object-contain rounded-md bg-slate-50 dark:bg-slate-800 p-0.5 shrink-0 shadow-2xs"
               fallbackType="league"
            />
            <div className="flex flex-col">
              <h2 className="text-xs font-black text-slate-705 dark:text-slate-205 uppercase tracking-widest leading-none flex items-center gap-1.5 font-sans">
                {league.name}
                
                {liveCount > 0 && (
                  <span className="text-[9px] font-black bg-red-650 text-white px-1.5 py-0.5 rounded-full animate-pulse font-mono ml-1">
                    {liveCount} LIVE
                  </span>
                )}
              </h2>
              {league.country && (
                <span className="text-[9px] text-slate-400 dark:text-slate-505 font-medium mt-0.5">
                  {league.country}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-400 shrink-0">
            {/* Direct League Pin/Star Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleFavoriteLeague(leagueId);
              }}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full cursor-pointer transition-all focus:outline-none"
              title="Favoritar Liga"
            >
              <Star 
                className={`w-3.5 h-3.5 ${
                  isLeagueFav ? "fill-amber-400 text-amber-500 stroke-[2.2]" : "text-slate-300 hover:text-amber-550"
                }`} 
              />
            </button>

            <span className="text-[10px] font-mono opacity-65 group-hover:opacity-100">
              {matches.length} {totalGamesCountStr}
            </span>
            {isOpen ? (
              <ChevronUp className="w-4.5 h-4.5 text-slate-400 dark:text-slate-505 group-hover:text-slate-700 dark:group-hover:text-slate-350 transition-colors" />
            ) : (
              <ChevronDown className="w-4.5 h-4.5 text-slate-400 dark:text-slate-505 group-hover:text-slate-700 dark:group-hover:text-slate-350 transition-colors" />
            )}
          </div>
        </div>

        {/* Custom Pinned Matches List */}
        {isOpen && (
          <div className="flex flex-col gap-2 pt-3 mt-2 border-t border-slate-100 dark:border-slate-850/60 transition-all duration-300">
            {(() => {
              // Group matches inside this pinned league by groupName
              const grouped: Record<string, Match[]> = {};
              matches.forEach(m => {
                const g = m.league.groupName || "";
                if (!grouped[g]) grouped[g] = [];
                grouped[g].push(m);
              });

              return Object.entries(grouped).map(([gName, groupMatches]) => (
                <div key={gName || "all"} className="flex flex-col gap-2">
                  {gName && (
                    <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase py-2 mt-1 first:mt-0 tracking-wider font-sans select-none px-1 border-b border-slate-100 dark:border-slate-800/40">
                      {gName}
                    </div>
                  )}
                  {groupMatches.map((match) => {
                    const isLive = ["1H", "2H", "HT", "ET", "BT", "P", "SUSP", "INT"].includes(
                      match.fixture.status.short
                    );
                    const isFinished = match.fixture.status.short === "FT";
                    const isSelected = selectedMatch?.fixture.id === match.fixture.id;
                    // Unique Key format representing pinned lists to prevent duplicate keys code crashes (Rule 2)
                    const reactKey = `pinned-${match.fixture.id}`;
                    
                    return (
                      <div
                        key={reactKey}
                        onClick={() => setSelectedMatch(match)}
                        className={`rounded-xl shadow-2xs p-3.5 flex items-center justify-between cursor-pointer border transition-all ${
                          isSelected 
                            ? "ring-2 ring-emerald-500/40 border-emerald-500 bg-emerald-50/10 dark:bg-emerald-950/25" 
                            : isLive
                            ? "bg-white dark:bg-slate-900 border-l-4 border-l-[#ffdf00] border-y border-r border-slate-150/80 dark:border-slate-800/80 hover:border-slate-300"
                            : "bg-slate-50/30 dark:bg-slate-950/40 border-slate-200/50 dark:border-slate-850/80 hover:border-slate-300 hover:bg-white dark:hover:bg-slate-900"
                        }`}
                      >
                        <div className="mr-3 shrink-0 select-none bg-slate-100/50 dark:bg-slate-800 p-1 rounded-lg flex items-center justify-center">
                          <SafeImage 
                            src={match.league.logo} 
                            alt={match.league.name} 
                            className="w-5 h-5 object-contain"
                            fallbackType="league"
                          />
                        </div>

                        <div className="flex-1 overflow-hidden pr-3 font-sans">
                          <div className="flex flex-col gap-1.5 py-0.5">
                            {/* Home Team Row */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <SafeImage 
                                  src={match.teams.home.logo} 
                                  alt={match.teams.home.name} 
                                  className="w-4.5 h-4.5 object-contain bg-slate-100/40 dark:bg-slate-800/60 rounded-md p-0.5 shrink-0"
                                  fallbackType="team"
                                />
                                <span className={`text-xs truncate ${
                                  isFinished && match.teams.home.winner === false ? "text-slate-400 dark:text-slate-505 font-medium" : "font-bold text-slate-850 dark:text-slate-105"
                                }`}>
                                  {match.teams.home.name}
                                </span>
                              </div>
                              <span className={`font-mono text-xs font-black pr-1 ${
                                isFinished && match.teams.home.winner === false ? "text-slate-400 dark:text-slate-505" : "text-slate-705 dark:text-slate-200"
                              }`}>
                                {match.goals.home ?? "-"}
                              </span>
                            </div>

                            {/* Away Team Row */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <SafeImage 
                                  src={match.teams.away.logo} 
                                  alt={match.teams.away.name} 
                                  className="w-4.5 h-4.5 object-contain bg-slate-100/40 dark:bg-slate-800/60 rounded-md p-0.5 shrink-0"
                                  fallbackType="team"
                                />
                                <span className={`text-xs truncate ${
                                  isFinished && match.teams.away.winner === false ? "text-slate-400 dark:text-slate-505 font-medium" : "font-bold text-slate-850 dark:text-slate-105"
                                }`}>
                                  {match.teams.away.name}
                                </span>
                              </div>
                              <span className={`font-mono text-xs font-black pr-1 ${
                                isFinished && match.teams.away.winner === false ? "text-slate-400 dark:text-slate-505" : "text-slate-705 dark:text-slate-200"
                              }`}>
                                {match.goals.away ?? "-"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="ml-2 pl-3 border-l border-slate-100/60 dark:border-slate-800/60 flex flex-col items-center justify-center shrink-0 min-w-[#48px] select-none">
                          {isLive ? (
                            <>
                              <span className="text-red-650 dark:text-red-400 text-xs font-black tracking-tighter flex items-center gap-0.5 font-mono">
                                {match.fixture.status.short === "HT" ? (isPt ? "INT" : language === "en" ? "HT" : language === "es" ? "DESC" : language === "fr" ? "MT" : language === "it" ? "INT" : "HZ") : `${match.fixture.status.elapsed}'`}
                              </span>
                              <span className="text-[8px] font-black text-[#009c3b] dark:text-emerald-400 uppercase tracking-wider mt-0.5">
                                {isPt ? "VIVO" : language === "en" ? "LIVE" : language === "es" ? "VIVO" : language === "fr" ? "DIRECT" : language === "it" ? "LIVE" : "LIVE"}
                              </span>
                            </>
                          ) : isFinished ? (
                            <span className="text-slate-404 dark:text-slate-500 text-[10px] font-bold uppercase font-mono">
                              FT
                            </span>
                          ) : (
                            <span className="text-slate-500 dark:text-slate-400 font-mono text-[10.5px] font-bold bg-slate-100/50 dark:bg-slate-900/60 px-1.5 py-0.5 rounded border border-slate-200/10 shadow-3xs">
                              {new Date(match.fixture.date).toLocaleTimeString(localeStr, {
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ));
            })()}
          </div>
        )}
      </div>
    );
  };

  // Sync general HTML tag element dark class for daisy chaining tailwind styles
  const renderDrawer = (drawer: GroupedDrawer, isDestaque = false) => {
    const info = getDrawerRankAndCategory(drawer);
    const isAlwaysOpenDefault = false; // Closed by default to keep the interface absolutely clean!
    const drawerKey = isDestaque ? "destaques" : drawer.key;
    const isOpen = expandedCountries[drawerKey] !== undefined 
      ? expandedCountries[drawerKey] 
      : isAlwaysOpenDefault;
    
    // Count active/live matches in this drawer for nice badge display
    const liveCount = Object.values(drawer.leagues).reduce((sum, current) => {
      return sum + current.matches.filter(m => ["1H", "2H", "HT", "ET", "BT", "INT"].includes(m.fixture.status.short)).length;
    }, 0);

    const totalGamesCountStr = isPt ? "jogos" : language === "en" ? "matches" : language === "es" ? "partidos" : language === "fr" ? "matchs" : language === "it" ? "partite" : "Spiele";
    const firstLeagueEntry = Object.values(drawer.leagues)[0];
    const drawerLeagueId = firstLeagueEntry?.league?.id;

    return (
      <div 
        key={drawerKey} 
        className={`flex flex-col gap-2 rounded-2xl border transition-all ${
          isOpen 
            ? "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 p-4 shadow-2xs" 
            : "bg-white/80 dark:bg-slate-900/60 border-slate-200/40 dark:border-slate-850 p-3 h-auto"
        }`}
      >
        {/* Collapsible Gaveta Header */}
        <div 
          onClick={() => toggleCountryDrawer(drawerKey)}
          className="flex items-center justify-between w-full text-left select-none group cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <SafeImage 
               src={isDestaque ? "https://flagcdn.com/w40/un.png" : drawer.logo} 
               alt={drawer.title} 
               className="w-5 h-5 object-contain rounded-md bg-slate-50 dark:bg-slate-800 p-0.5 shrink-0 shadow-2xs"
               fallbackType="flag"
            />
            <h2 className="text-xs font-black text-slate-705 dark:text-slate-205 uppercase tracking-widest leading-none flex items-center gap-1.5 font-sans">
              {drawer.title}
              
              {liveCount > 0 && (
                <span className="text-[9px] font-black bg-red-650 text-white px-1.5 py-0.5 rounded-full animate-pulse font-mono ml-1">
                  {liveCount} LIVE
                </span>
              )}
            </h2>
          </div>
          <div className="flex items-center gap-2 text-slate-400 shrink-0">
            <span className="text-[10px] font-mono opacity-65 group-hover:opacity-100">
              {Object.values(drawer.leagues).reduce((sum, l) => sum + l.matches.length, 0)} {totalGamesCountStr}
            </span>
            {isOpen ? (
              <ChevronUp className="w-4.5 h-4.5 text-slate-400 dark:text-slate-505 group-hover:text-slate-700 dark:group-hover:text-slate-350 transition-colors" />
            ) : (
              <ChevronDown className="w-4.5 h-4.5 text-slate-400 dark:text-slate-505 group-hover:text-slate-700 dark:group-hover:text-slate-350 transition-colors" />
            )}
          </div>
        </div>

        {/* Collapsible Content */}
        {isOpen && (
          <div className="flex flex-col gap-3.5 pt-3 mt-2 border-t border-slate-100 dark:border-slate-850/60 transition-all duration-300">
            {Object.values(drawer.leagues)
              .sort((a, b) => {
                const tierA = a.league.tier ?? 99;
                const tierB = b.league.tier ?? 99;
                if (tierA !== tierB) {
                  return tierA - tierB;
                }
                return a.league.name.localeCompare(b.league.name);
              })
              .map(({ league, matches: leagueMatches }) => {
                const isLeagueFav = favorites.leagues.includes(league.id);
                const subLeagueKey = `${drawerKey}-${league.name}-${league.id}`;
                const isSubOpen = !!expandedSubLeagues[subLeagueKey]; // Closed (false) by default unless expanded (true)

                return (
                  <div 
                    key={`${drawerKey}-${league.name}-${league.id}`} 
                    className="flex flex-col gap-3 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/15 dark:bg-slate-950/20 shadow-3xs"
                  >
                    {/* League Header / Sub-gaveta Header */}
                    <div 
                      onClick={() => toggleSubLeague(subLeagueKey)}
                      className="flex items-center justify-between select-none cursor-pointer group/sub"
                    >
                      <div className="flex items-center gap-2 text-[10px] font-extrabold text-slate-550 dark:text-slate-350 uppercase tracking-widest leading-none">
                        <SafeImage 
                          src={league.logo} 
                          alt={league.name} 
                          className="w-4.5 h-4.5 object-contain rounded bg-white dark:bg-slate-900 p-0.5 shrink-0 shadow-3xs"
                          fallbackType="league"
                        />
                        <span>{league.name}</span>
                      
                      <div className="flex items-center gap-1 opacity-65 group-hover/sub:opacity-100 ml-1">
                        <span className="text-[9px] font-mono">({leagueMatches.length})</span>
                        {isSubOpen ? (
                          <ChevronUp className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                        ) : (
                          <ChevronDown className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavoriteLeague(league.id);
                      }}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full cursor-pointer transition-all focus:outline-none shrink-0"
                      title="Favoritar Liga"
                    >
                      <Star 
                        className={`w-3.5 h-3.5 ${
                          isLeagueFav ? "fill-amber-400 text-amber-500 stroke-[2.2]" : "text-slate-300 hover:text-amber-550"
                        }`} 
                      />
                    </button>
                  </div>

                  {/* Actual Game Cards (collapsed/expanded conditionally) */}
                  {isSubOpen && (
                    <div className="flex flex-col gap-2">
                      {(() => {
                        const grouped: Record<string, Match[]> = {};
                        leagueMatches.forEach(m => {
                          const g = m.league.groupName || "";
                          if (!grouped[g]) grouped[g] = [];
                          grouped[g].push(m);
                        });

                        return Object.entries(grouped).map(([gName, groupMatches]) => (
                          <div key={gName || "all"} className="flex flex-col gap-2">
                            {gName && (
                              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase py-2 mt-1 first:mt-0 tracking-wider font-sans select-none px-1 border-b border-slate-100 dark:border-slate-800/40">
                                {gName}
                              </div>
                            )}
                            {groupMatches.map((match) => {
                              const isLive = ["1H", "2H", "HT", "ET", "BT", "P", "SUSP", "INT"].includes(
                                match.fixture.status.short
                              );
                              const isFinished = match.fixture.status.short === "FT";
                              const isSelected = selectedMatch?.fixture.id === match.fixture.id;
                              
                              // Explicit distinct format 'country-' to prevent any duplication crash (Rule 2)
                              const reactKey = `country-${match.fixture.id}`;
                              
                              return (
                                <div
                                  key={reactKey}
                                  onClick={() => setSelectedMatch(match)}
                                  className={`rounded-xl shadow-2xs p-3.5 flex items-center justify-between cursor-pointer border transition-all ${
                                    isSelected 
                                      ? "ring-2 ring-emerald-500/40 border-emerald-500 bg-emerald-50/10 dark:bg-emerald-950/25" 
                                      : isLive
                                      ? "bg-white dark:bg-slate-900 border-l-4 border-l-[#ffdf00] border-y border-r border-slate-150/80 dark:border-slate-800/80 hover:border-slate-300"
                                      : "bg-slate-50/30 dark:bg-slate-950/40 border-slate-200/50 dark:border-slate-850/80 hover:border-slate-300 hover:bg-white dark:hover:bg-slate-900"
                                  }`}
                                >
                                  <div className="mr-3 shrink-0 select-none bg-slate-100/50 dark:bg-slate-800 p-1 rounded-lg flex items-center justify-center">
                                    <SafeImage 
                                      src={match.league.logo} 
                                      alt={match.league.name} 
                                      className="w-5 h-5 object-contain"
                                      fallbackType="league"
                                    />
                                  </div>

                                  <div className="flex-1 overflow-hidden pr-3 font-sans">
                                    <div className="flex flex-col gap-1.5 py-0.5">
                                      {/* Home Team Row */}
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                          <SafeImage 
                                            src={match.teams.home.logo} 
                                            alt={match.teams.home.name} 
                                            className="w-4.5 h-4.5 object-contain bg-slate-100/40 dark:bg-slate-800/60 rounded-md p-0.5 shrink-0"
                                            fallbackType="team"
                                          />
                                          <span className={`text-xs truncate ${
                                            isFinished && match.teams.home.winner === false ? "text-slate-400 dark:text-slate-505 font-medium" : "font-bold text-slate-850 dark:text-slate-105"
                                          }`}>
                                            {match.teams.home.name}
                                          </span>
                                        </div>
                                        <span className={`font-mono text-xs font-black pr-1 ${
                                          isFinished && match.teams.home.winner === false ? "text-slate-400 dark:text-slate-505" : "text-slate-705 dark:text-slate-200"
                                        }`}>
                                          {match.goals.home ?? "-"}
                                        </span>
                                      </div>

                                      {/* Away Team Row */}
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                          <SafeImage 
                                            src={match.teams.away.logo} 
                                            alt={match.teams.away.name} 
                                            className="w-4.5 h-4.5 object-contain bg-slate-100/40 dark:bg-slate-800/60 rounded-md p-0.5 shrink-0"
                                            fallbackType="team"
                                          />
                                          <span className={`text-xs truncate ${
                                            isFinished && match.teams.away.winner === false ? "text-slate-400 dark:text-slate-505 font-medium" : "font-bold text-slate-85B dark:text-slate-105"
                                          }`}>
                                            {match.teams.away.name}
                                          </span>
                                        </div>
                                        <span className={`font-mono text-xs font-black pr-1 ${
                                          isFinished && match.teams.away.winner === false ? "text-slate-400 dark:text-slate-505" : "text-slate-705 dark:text-slate-200"
                                        }`}>
                                          {match.goals.away ?? "-"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="ml-2 pl-3 border-l border-slate-100/60 dark:border-slate-800/60 flex flex-col items-center justify-center shrink-0 min-w-[#48px] select-none">
                                    {isLive ? (
                                      <>
                                        <span className="text-red-650 dark:text-red-400 text-xs font-black tracking-tighter flex items-center gap-0.5 font-mono">
                                          {match.fixture.status.short === "HT" ? (isPt ? "INT" : language === "en" ? "HT" : language === "es" ? "DESC" : language === "fr" ? "MT" : language === "it" ? "INT" : "HZ") : `${match.fixture.status.elapsed}'`}
                                        </span>
                                        <span className="text-[8px] font-black text-[#009c3b] dark:text-emerald-400 uppercase tracking-wider mt-0.5">
                                          {isPt ? "VIVO" : language === "en" ? "LIVE" : language === "es" ? "VIVO" : language === "fr" ? "DIRECT" : language === "it" ? "LIVE" : "LIVE"}
                                        </span>
                                      </>
                                    ) : isFinished ? (
                                      <span className="text-slate-404 dark:text-slate-500 text-[10px] font-bold uppercase font-mono">
                                        FT
                                      </span>
                                    ) : (
                                      <span className="text-slate-500 dark:text-slate-400 font-mono text-[10.5px] font-bold bg-slate-100/50 dark:bg-slate-900/60 px-1.5 py-0.5 rounded border border-slate-200/10 shadow-3xs">
                                        {new Date(match.fixture.date).toLocaleTimeString(localeStr, {
                                          hour: "2-digit",
                                          minute: "2-digit"
                                        })}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ));
                      })()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    if (config.theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [config.theme]);

  return (
    <div className={`min-h-screen transition-colors duration-200 flex flex-col font-sans relative overflow-x-hidden antialiased ${
      config.theme === "dark" 
        ? "bg-slate-950 text-slate-100" 
        : "bg-[#f4f7f6] text-slate-800"
    }`}>
      {/* BRAND & SEARCH HEADER */}
      <Header 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        onOpenSettings={() => setIsSettingsOpen(true)}
        viewMode={viewMode}
        setViewMode={setViewMode}
        language={language}
        user={user}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={() => {
          localStorage.removeItem("ws_logged_user");
          setUser(null);
        }}
        matches={matches}
      />

      {/* REAL-TIME CELEBRATORY GOAL TOAST ALERTS */}
      {goalToast && config.alertsEnabled && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 pointer-events-none animate-bounce">
          <div className="bg-[#009c3b] border-4 border-[#ffdf00] shadow-2xl rounded-2xl p-4 flex items-center gap-4 text-white relative overflow-hidden">
            <div className="absolute -right-2 -bottom-2 opacity-15 text-8xl shrink-0 font-display font-black select-none">
              GOAL
            </div>
            
            <div className="p-3 bg-white/10 rounded-full shrink-0 animate-spin">
              <span className="text-2xl">⚽</span>
            </div>

            <div className="flex-1 pointer-events-auto">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#ffdf00] bg-black/20 px-2 py-0.5 rounded-sm">
                {t.goalAnnouncement} • {goalToast.minute}'
              </span>
              <h4 className="font-extrabold text-lg leading-snug mt-1">
                {goalToast.teamName} !!
              </h4>
              <p className="text-xs text-emerald-100 font-medium">
                {isPt ? "Autor" : language === "en" ? "Scorer" : language === "es" ? "Autor" : language === "fr" ? "Buteur" : language === "it" ? "Autore" : "Torschütze"}: <span className="text-white font-bold">{goalToast.scorer}</span>
                <span className="mx-2">•</span>
                <span>{isPt ? "Placar" : language === "en" ? "Score" : language === "es" ? "Marcador" : language === "fr" ? "Score" : language === "it" ? "Risultato" : "Spielstand"}: <b className="font-mono text-[#ffdf00]">{goalToast.homeScore} - {goalToast.awayScore}</b></span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUB-HEADER CONTROL BAR */}
      <div className={`border-b shadow-xs transition-colors py-2 px-4 md:px-6 z-20 ${
        config.theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-800"
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 select-none">
          
          {/* HORIZONTALLY SCROLLS SPORTS DIRECTLY WITHOUT LABELS */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 flex-1 pr-4">
            {[
              { code: "futebol", name: "Futebol", icon: (
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="m12 12-4-3m4 3 4-3m-4 3v5m-4-8 1.5-2.5m6.5 2.5-1.5-2.5m-5 7.5L5 13m10 2 2-2" />
                </svg>
              )},
              { code: "basquete", name: "Basquete", icon: (
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M6.2 6.2c2.4 2.4 2.4 6.4 0 8.8M17.8 6.2c-2.4 2.4-2.4 6.4 0 8.8" />
                </svg>
              )},
              { code: "vôlei", name: "Vôlei", icon: (
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="m12 2 3 10-3 10M2 12h20" />
                </svg>
              )},
              { code: "tênis", name: "Tênis", icon: (
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10" />
                  <path d="M12 2a15.3 15.3 0 0 0-4 10 15.3 15.3 0 0 0 4 10" />
                </svg>
              )},
              { code: "beisebol", name: "Beisebol", icon: (
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2c0 5.5-4.5 10-10 10" />
                  <path d="M22 12c-5.5 0-10 4.5-10 10" />
                </svg>
              )},
              { code: "futebol americano", name: "Fut. Americano", icon: (
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M12 3a18.3 18.3 0 0 0-9 9 18.3 18.3 0 0 0 9 9 18.3 18.3 0 0 0 9-9 18.3 18.3 0 0 0-9-9Z" />
                  <path d="M7.5 16.5 16.5 7.5m-6 6 3-3" />
                </svg>
              )},
              { code: "handebol", name: "Handebol", icon: (
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 12c2.5 0 4-1.5 4-4s-1.5-4-4-4M16 12c-2.5 0-4 1.5-4 4s1.5 4 4 4" />
                </svg>
              )}
            ].map((sp) => {
              const isSpSelected = selectedSport === sp.code;
              return (
                <button
                  key={sp.code}
                  type="button"
                  onClick={() => {
                    setSelectedSport(sp.code);
                    if (isLargeScreen) {
                      const newMatches = sp.code === "futebol" ? matches : getMockSportMatches(sp.code, selectedDate);
                      if (newMatches.length > 0) {
                        setSelectedMatch(newMatches[0]);
                      } else {
                        setSelectedMatch(null);
                      }
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-center transition-all cursor-pointer shrink-0 ${
                    isSpSelected
                      ? "bg-slate-900 border-[#009c3b] font-black text-white dark:bg-emerald-950 dark:border-emerald-400"
                      : "bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
                  }`}
                >
                  <span className="text-[#009c3b] dark:text-emerald-400">{sp.icon}</span>
                  <span className="text-[10px] font-black tracking-tight uppercase whitespace-nowrap">{sp.name}</span>
                </button>
              );
            })}
          </div>

          {/* FIXED RIGHT: FAVORITES STAR TRIGGER (STAR-ONLY VIEW) */}
          <button
            type="button"
            onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
            className={`p-2 px-2.5 rounded-xl border cursor-pointer select-none transition-all flex items-center justify-center shrink-0 h-[38px] ${
              showOnlyFavorites
                ? "bg-amber-500/10 text-amber-500 border-amber-500/40"
                : "bg-slate-50 dark:bg-slate-950 text-slate-400 border-slate-200/50 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900"
            }`}
            title={language === "pt_br" || language === "pt_pt" ? "Ver Favoritos" : "View Favorites"}
          >
            <Star 
              className={`w-4 h-4 ${
                showOnlyFavorites ? "fill-amber-400 text-amber-500 stroke-[2]" : "text-slate-400"
              }`} 
            />
          </button>
        </div>
      </div>

      {/* MAIN CONTENT VIEWER */}
      <Routes>
        <Route path="/team/:teamId" element={
          <div className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-6">
            <TeamPage 
              matches={matches} 
              favorites={favorites} 
              onToggleFavoriteTeam={toggleFavoriteTeam} 
              language={language}
            />
          </div>
        } />
        <Route path="/league/:leagueId" element={
          <div className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-6">
            <LeaguePage 
              matches={matches} 
              favorites={favorites} 
              onToggleFavoriteLeague={toggleFavoriteLeague} 
              language={language}
            />
          </div>
        } />
        <Route path="/player/:playerName" element={
          <div className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-6">
            <PlayerPage 
              favorites={favorites} 
              onToggleFavoritePlayer={toggleFavoritePlayer} 
              language={language}
            />
          </div>
        } />
        <Route path="/*" element={
          viewMode === "feed" ? (
            <main className="flex-1 max-w-4xl mx-auto w-full p-4 lg:p-6">
              <SportsFeed theme={config.theme} language={language} currentUser={user} />
            </main>
          ) : (
            /* MAIN SCREEN WORKSPACE CONTAINER */
            <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-6 flex flex-col lg:flex-row gap-6 overflow-hidden">
          
          {/* LEFT COLUMN: COLLAPSIBLE DRAWERS BY COUNTRY */}
          <div className="w-full lg:w-[420px] xl:w-[450px] flex flex-col gap-4 overflow-y-auto pr-0 lg:pr-1 min-h-[350px]">
            
            {/* EMBEDDED CONTROL CENTER: COMPACT CALENDAR AND AO VIVO */}
            <div className={`p-3 rounded-2xl border flex items-center justify-between gap-3 select-none shrink-0 ${
              config.theme === "dark" 
                ? "bg-slate-900 border-slate-800 text-slate-100 shadow-md" 
                : "bg-white border-slate-200/70 text-slate-800 shadow-2xs"
            }`}>
              
              {/* COMPACT CALENDAR MODULE */}
              <div className={`flex items-center gap-1.5 p-1 rounded-xl border transition-all flex-1 ${
                config.theme === "dark" 
                  ? "bg-slate-950 border-slate-850" 
                  : "bg-slate-50 border-slate-202"
              }`}>
                {/* Prev day stepper */}
                <button 
                  type="button"
                  onClick={() => handleStepDay(-1)}
                  className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer"
                  title={t.dayPrev}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Day display and label formatting according to timezone/browser setting */}
                <div className="px-1 flex items-center justify-center flex-1 text-center min-h-[30px] flex-wrap gap-1.5">
                  <span className="text-[11px] font-black tracking-tight uppercase font-mono text-[#009c3b] dark:text-emerald-400">
                    {getCalendarLabel(selectedDate)}
                  </span>
                  
                  {/* Small link/indicator to reset back to today if not on today */}
                  {selectedDate !== realTodayDate && (
                    <button
                      type="button"
                      onClick={() => setSelectedDate(realTodayDate)}
                      className="text-[8.5px] bg-[#009c3b]/10 text-[#009c3b] dark:text-emerald-400 border border-[#009c3b]/20 px-1 py-0.5 rounded-sm font-black uppercase tracking-wider leading-none hover:bg-[#009c3b] hover:text-white transition-all cursor-pointer shrink-0"
                      title={language.startsWith("pt") ? "Voltar para Hoje" : "Back to Today"}
                    >
                      {language.startsWith("pt") ? "Hoje" : "Today"}
                    </button>
                  )}
                </div>

                {/* Next day stepper */}
                <button 
                  type="button"
                  onClick={() => handleStepDay(1)}
                  className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer"
                  title={t.dayNext}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-0.5" />

                {/* Datepicker icon button */}
                <div className="relative shrink-0 flex items-center justify-center">
                  <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => {
                      if (e.target.value) setSelectedDate(e.target.value);
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <button 
                    type="button"
                    className="p-1 hover:bg-slate-250 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title={t.advancedDate}
                  >
                    <Calendar className="w-4 h-4 text-[#009c3b]" />
                  </button>
                </div>
              </div>

              {/* AO VIVO (LIVE TOGGLE PILL) */}
              <label className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border cursor-pointer select-none transition-all text-xs h-[38px] ${
                liveOnly 
                  ? "bg-red-500/10 text-red-650 dark:text-red-400 border-red-500/25 font-bold animate-fade-in" 
                  : "bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-slate-200/50 dark:border-slate-800 hover:bg-slate-100"
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${liveOnly ? "bg-red-600 animate-pulse" : "bg-slate-400 dark:bg-slate-650"}`} />
                <span className="text-[10px] uppercase font-black tracking-wider">{t.liveCheckbox}</span>
                <input 
                  type="checkbox" 
                  checked={liveOnly}
                  onChange={(e) => setLiveOnly(e.target.checked)}
                  className="sr-only"
                />
              </label>
            </div>

            {isSimulated && (
              <div className="mb-4 bg-emerald-500/10 dark:bg-emerald-950/25 border border-emerald-500/20 text-emerald-800 dark:text-emerald-400 p-3.5 rounded-2xl flex items-center gap-3.5 select-none animate-fade-in shadow-xs">
                <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs ring-4 ring-emerald-500/5">
                  🧪
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-xs">
                    {isPt ? "Partidas Simuladas de Demonstração" : "Interactive Demonstration Simulation"}
                  </p>
                  <p className="text-[10px] text-emerald-600/95 dark:text-emerald-400/80 mt-0.5 leading-tight">
                    {isPt 
                      ? "Os servidores oficiais estão offline ou a quota da API esgotou. Carregando simulações dinâmicas de futebol em tempo real!" 
                      : "The official live API is offline or quota reached. Loading high-fidelity real-time football simulations!"}
                  </p>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 p-6 shadow-2xs select-none">
                <RefreshCw className="w-8 h-8 text-[#009c3b] animate-spin mb-3" />
                <p className="text-sm font-semibold text-slate-500">{t.loadingMatches}</p>
              </div>
            ) : error ? (
              <div className="bg-red-50/70 dark:bg-red-950/20 border border-red-200/70 dark:border-red-900 text-red-700 dark:text-red-400 p-5 rounded-xl text-center select-none">
                <p className="font-bold text-sm">⚠️ {isPt ? "Erro de Conexão" : "Connection Issue"}</p>
                <p className="text-xs mt-1 text-red-600/90">{error}</p>
                <button 
                  onClick={() => fetchMatches(selectedDate)}
                  className="mt-3.5 px-3 py-1 bg-red-650 text-white rounded text-xs font-bold hover:bg-red-700 font-mono cursor-pointer"
                >
                  {isPt ? "Tentar Novamente" : language === "en" ? "Retry" : language === "es" ? "Reintentar" : language === "fr" ? "Réessayer" : language === "it" ? "Riprova" : "Erneut versuchen"}
                </button>
              </div>
            ) : filteredMatches.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 p-8 text-center shadow-2xs select-none">
                <span className="text-4xl mb-3">📡</span>
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                  {isPt ? "Sem partidas registradas"
                   : language === "en" ? "No matches registered"
                   : language === "es" ? "No hay partidos registrados"
                   : language === "fr" ? "Aucun match enregistré"
                   : language === "it" ? "Nessuna partita registrata"
                   : "Keine Spiele registriert"}
                </p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  {t.noMatches}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3.5">
                {/* Ligas Pinned (No Topo Absoluto & Abertas por Padrão) - Rule 1 */}
                {sortedPinnedLeagues.map((pinned) => (
                  renderPinnedLeague(pinned.id, pinned.league, pinned.matches)
                ))}
                
                {/* Lista de Gavetas por País (Abaixo das Ligas Pinned) - Rule 2 */}
                {sortedDrawers.map((drawer) => renderDrawer(drawer, false))}
              </div>
            )}
            {false && (
              sortedDrawers.map((drawer) => {
                const info = getDrawerRankAndCategory(drawer);
                const isAlwaysOpenDefault = info.rank === 1 || info.rank === 2;
                const isOpen = expandedCountries[drawer.key] !== undefined 
                  ? expandedCountries[drawer.key] 
                  : isAlwaysOpenDefault;
                const isMajor = drawer.type === "major_league";
                
                // Count active/live matches in this drawer for nice badge display
                const liveCount = Object.values(drawer.leagues).reduce((sum, current) => {
                  return sum + current.matches.filter(m => ["1H", "2H", "HT", "ET", "BT", "INT"].includes(m.fixture.status.short)).length;
                }, 0);

                const totalGamesCountStr = isPt ? "jogos" : language === "en" ? "matches" : language === "es" ? "partidos" : language === "fr" ? "matchs" : language === "it" ? "partite" : "Spiele";
                const firstLeagueEntry = Object.values(drawer.leagues)[0];
                const drawerLeagueId = firstLeagueEntry?.league?.id;

                return (
                  <div 
                    key={drawer.key} 
                    className={`flex flex-col gap-2 rounded-2xl border transition-all ${
                      isOpen 
                        ? "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 p-4 shadow-2xs" 
                        : "bg-white/80 dark:bg-slate-900/60 border-slate-200/40 dark:border-slate-850 p-3 h-auto"
                    }`}
                  >
                    {/* Collapsible Gaveta Header */}
                    <div 
                      onClick={() => toggleCountryDrawer(drawer.key)}
                      className="flex items-center justify-between w-full text-left select-none group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <SafeImage 
                           src={drawer.logo} 
                           alt={drawer.title} 
                           className="w-5 h-5 object-contain rounded-md bg-slate-50 dark:bg-slate-800 p-0.5 shrink-0 shadow-2xs"
                           fallbackType={drawer.type === "country" ? "flag" : "league"}
                        />
                        <h2 className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest leading-none flex items-center gap-1.5">
                          {drawer.title}
                          
                          {/* Favorite Star directly at Major Drawer Header Level */}
                          {isMajor && drawerLeagueId && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavoriteLeague(drawerLeagueId);
                              }}
                              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full cursor-pointer transition-all"
                              title="Favoritar Liga"
                            >
                              <Star 
                                className={`w-3.5 h-3.5 ${
                                  favorites.leagues.includes(drawerLeagueId) 
                                    ? "fill-amber-400 text-amber-500 stroke-[2.2]" 
                                    : "text-slate-300 hover:text-amber-400"
                                }`} 
                                id={`fav-star-${drawerLeagueId}`}
                              />
                            </button>
                          )}

                          {liveCount > 0 && (
                            <span className="text-[9px] font-black bg-red-650 text-white px-1.5 py-0.5 rounded-full animate-pulse font-mono ml-1">
                              {liveCount} LIVE
                            </span>
                          )}
                        </h2>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 shrink-0">
                        <span className="text-[10px] font-mono opacity-65 group-hover:opacity-100">
                          {Object.values(drawer.leagues).reduce((sum, l) => sum + l.matches.length, 0)} {totalGamesCountStr}
                        </span>
                        {isOpen ? (
                          <ChevronUp className="w-4.5 h-4.5 text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-350 transition-colors" />
                        ) : (
                          <ChevronDown className="w-4.5 h-4.5 text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-350 transition-colors" />
                        )}
                      </div>
                    </div>

                    {/* Collapsible Content */}
                    {isOpen && (
                      <div className="flex flex-col gap-3.5 pt-3 mt-2 border-t border-slate-100 dark:border-slate-850/60 transition-all duration-300">
                        {isMajor ? (
                          // For major leagues: group all of its games together by dynamic groups/rounds
                          (() => {
                            const allDrawerMatches: Match[] = [];
                            Object.values(drawer.leagues).forEach((lEntry) => {
                              allDrawerMatches.push(...lEntry.matches);
                            });

                            const liveMatches = allDrawerMatches.filter((match) => {
                              return ["1H", "2H", "HT", "ET", "BT", "P", "SUSP", "INT"].includes(
                                match.fixture.status.short
                              );
                            });

                            const finishedMatches = allDrawerMatches.filter((match) => {
                              return ["FT", "AET", "PEN"].includes(match.fixture.status.short);
                            });

                            const upcomingMatches = allDrawerMatches.filter((match) => {
                              return !["1H", "2H", "HT", "ET", "BT", "P", "SUSP", "INT", "FT", "AET", "PEN"].includes(
                                match.fixture.status.short
                              );
                            });

                            const groupMatches = (matches: Match[]) => {
                              const map: Record<string, Match[]> = {};
                              matches.forEach((match) => {
                                const groupName = parseGroupName(match.league.name, match.league.round) || "Geral";
                                if (!map[groupName]) {
                                  map[groupName] = [];
                                }
                                map[groupName].push(match);
                              });
                              return map;
                            };

                            const liveGroups = groupMatches(liveMatches);
                            const finishedGroups = groupMatches(finishedMatches);
                            const upcomingGroups = groupMatches(upcomingMatches);

                            const sortedLiveKeys = Object.keys(liveGroups).sort();
                            const sortedFinishedKeys = Object.keys(finishedGroups).sort();
                            const sortedUpcomingKeys = Object.keys(upcomingGroups).sort();

                            const isGroupType = (name: string): boolean => {
                              const lower = name.toLowerCase();
                              return lower.startsWith("grupo") || lower.startsWith("group") || lower.includes("grp.");
                            };

                            return (
                              <div className="flex flex-col gap-5">
                                {/* LIVE SECTION */}
                                {liveMatches.length > 0 && (
                                  <div className="flex flex-col gap-2.5">
                                    <div className="flex items-center gap-1.5 px-1 py-0.5 border-b border-rose-100 dark:border-rose-950/20 pb-1.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-red-650 animate-pulse shrink-0" />
                                      <span className="text-[10px] font-black text-red-650 dark:text-red-400 uppercase tracking-widest leading-none">
                                        {isPt ? "Em andamento" : language === "en" ? "In progress" : language === "es" ? "En progreso" : language === "fr" ? "En cours" : language === "it" ? "In corso" : "Em andamento"}
                                      </span>
                                    </div>
                                    {sortedLiveKeys.map((groupName) => {
                                      const showGroupHeader = isGroupType(groupName);
                                      return (
                                        <div key={`live-${groupName}`} className="flex flex-col gap-1.5">
                                          {showGroupHeader && (
                                            <span className="text-xs font-black text-[#009c3b] dark:text-emerald-400 uppercase tracking-wide pl-1 mb-1 mt-1.5 flex items-center gap-1.5 font-sans select-none">
                                              <span className="w-1.5 h-1.5 rounded-xs bg-[#009c3b] dark:bg-emerald-400" />
                                              {groupName}
                                            </span>
                                          )}
                                          <div className="flex flex-col gap-2">
                                            {liveGroups[groupName].map((match) => {
                                              const isLive = ["1H", "2H", "HT", "ET", "BT", "P", "SUSP", "INT"].includes(
                                                match.fixture.status.short
                                              );
                                              const isSelected = selectedMatch?.fixture.id === match.fixture.id;
                                              return (
                                                <div
                                                  key={match.fixture.id}
                                                  onClick={() => setSelectedMatch(match)}
                                                  className={`rounded-xl shadow-2xs p-3.5 flex items-center justify-between cursor-pointer border transition-all ${
                                                    isSelected 
                                                      ? "ring-2 ring-emerald-500/40 border-emerald-500 bg-emerald-50/10 dark:bg-emerald-950/25" 
                                                      : "bg-white dark:bg-slate-900 border-l-4 border-l-[#ffdf00] border-y border-r border-slate-150/80 dark:border-slate-800/80 hover:border-slate-300"
                                                  }`}
                                                >
                                                  <div className="mr-3 shrink-0 select-none bg-slate-100/50 dark:bg-slate-800 p-1 rounded-lg flex items-center justify-center">
                                                    <SafeImage 
                                                      src={match.league.logo} 
                                                      alt={match.league.name} 
                                                      className="w-5 h-5 object-contain"
                                                      fallbackType="league"
                                                    />
                                                  </div>

                                                  <div className="flex-1 overflow-hidden pr-3 font-sans">
                                                    <div className="flex flex-col gap-1.5 py-0.5">
                                                      {/* Home Team Row */}
                                                      <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-1.5 min-w-0">
                                                          <SafeImage 
                                                            src={match.teams.home.logo} 
                                                            alt={match.teams.home.name} 
                                                            className="w-4.5 h-4.5 object-contain bg-slate-100/40 dark:bg-slate-800/60 rounded-md p-0.5 shrink-0"
                                                            fallbackType="team"
                                                          />
                                                          <span className="font-bold text-slate-800 dark:text-slate-105 text-xs truncate">
                                                            {match.teams.home.name}
                                                          </span>
                                                        </div>
                                                        <span className="font-mono text-xs font-black text-slate-705 dark:text-slate-250 pr-1">
                                                          {match.goals.home !== null ? match.goals.home : "-"}
                                                        </span>
                                                      </div>

                                                      {/* Away Team Row */}
                                                      <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-1.5 min-w-0">
                                                          <SafeImage 
                                                            src={match.teams.away.logo} 
                                                            alt={match.teams.away.name} 
                                                            className="w-4.5 h-4.5 object-contain bg-slate-100/40 dark:bg-slate-800/60 rounded-md p-0.5 shrink-0"
                                                            fallbackType="team"
                                                          />
                                                          <span className="font-bold text-slate-800 dark:text-slate-105 text-xs truncate">
                                                            {match.teams.away.name}
                                                          </span>
                                                        </div>
                                                        <span className="font-mono text-xs font-black text-slate-705 dark:text-slate-250 pr-1">
                                                          {match.goals.away !== null ? match.goals.away : "-"}
                                                        </span>
                                                      </div>
                                                    </div>
                                                  </div>
                                                  <div className="ml-2 pl-3 border-l border-slate-100/60 dark:border-slate-800/60 flex flex-col items-center justify-center shrink-0 min-w-[#48px] select-none">
                                                    <span className="text-red-650 dark:text-red-400 text-xs font-black tracking-tighter flex items-center gap-0.5 font-mono">
                                                      {match.fixture.status.short === "HT" ? (isPt ? "INT" : language === "en" ? "HT" : language === "es" ? "DESC" : language === "fr" ? "MT" : language === "it" ? "INT" : "HZ") : `${match.fixture.status.elapsed}'`}
                                                    </span>
                                                    <span className="text-[8px] font-black text-[#009c3b] dark:text-emerald-400 uppercase tracking-wider mt-0.5">
                                                      {isPt ? "VIVO" : language === "en" ? "LIVE" : language === "es" ? "VIVO" : language === "fr" ? "DIRECT" : language === "it" ? "LIVE" : "LIVE"}
                                                    </span>
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}

                                {/* FINISHED SECTION */}
                                {finishedMatches.length > 0 && (
                                  <div className="flex flex-col gap-2.5">
                                    <div className="flex items-center gap-1.5 px-1 py-0.5 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                                      <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none font-sans">
                                        {isPt ? "Finalizados" : language === "en" ? "Finished" : language === "es" ? "Finalizados" : language === "fr" ? "Terminés" : language === "it" ? "Finalizzati" : "Finalizados"}
                                      </span>
                                    </div>
                                    {sortedFinishedKeys.map((groupName) => {
                                      const showGroupHeader = isGroupType(groupName);
                                      return (
                                        <div key={`finished-${groupName}`} className="flex flex-col gap-1.5">
                                          {showGroupHeader && (
                                            <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wide pl-1 mb-1 mt-1.5 flex items-center gap-1.5 font-sans select-none">
                                              <span className="w-1.5 h-1.5 rounded-xs bg-slate-400 dark:bg-slate-500" />
                                              {groupName}
                                            </span>
                                          )}
                                          <div className="flex flex-col gap-2">
                                            {finishedGroups[groupName].map((match) => {
                                              const isFinished = match.fixture.status.short === "FT";
                                              const isSelected = selectedMatch?.fixture.id === match.fixture.id;
                                              return (
                                                <div
                                                  key={match.fixture.id}
                                                  onClick={() => setSelectedMatch(match)}
                                                  className={`rounded-xl shadow-2xs p-3.5 flex items-center justify-between cursor-pointer border transition-all ${
                                                    isSelected 
                                                      ? "ring-2 ring-emerald-500/40 border-emerald-500 bg-emerald-50/10 dark:bg-emerald-950/25" 
                                                      : "bg-slate-50/30 dark:bg-slate-950/40 border-slate-200/50 dark:border-slate-850/80 hover:border-slate-300 hover:bg-white dark:hover:bg-slate-900"
                                                  }`}
                                                >
                                                  <div className="mr-3 shrink-0 select-none bg-slate-100/50 dark:bg-slate-800 p-1 rounded-lg flex items-center justify-center">
                                                    <SafeImage 
                                                      src={match.league.logo} 
                                                      alt={match.league.name} 
                                                      className="w-5 h-5 object-contain"
                                                      fallbackType="league"
                                                    />
                                                  </div>

                                                  <div className="flex-1 overflow-hidden pr-3 font-sans">
                                                    <div className="flex flex-col gap-1.5 py-0.5">
                                                      {/* Home Team Row */}
                                                      <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-1.5 min-w-0">
                                                          <SafeImage 
                                                            src={match.teams.home.logo} 
                                                            alt={match.teams.home.name} 
                                                            className="w-4.5 h-4.5 object-contain bg-slate-100/40 dark:bg-slate-800/60 rounded-md p-0.5 shrink-0"
                                                            fallbackType="team"
                                                          />
                                                          <span className={`text-xs truncate ${
                                                            isFinished && match.teams.home.winner === false ? "text-slate-400 dark:text-slate-505 font-medium" : "font-bold text-slate-800 dark:text-slate-105"
                                                          }`}>
                                                            {match.teams.home.name}
                                                          </span>
                                                        </div>
                                                        <span className={`font-mono text-xs font-black pr-1 ${
                                                          isFinished && match.teams.home.winner === false ? "text-slate-400 dark:text-slate-505" : "text-slate-705 dark:text-slate-250"
                                                        }`}>
                                                          {match.goals.home !== null ? match.goals.home : "-"}
                                                        </span>
                                                      </div>

                                                      {/* Away Team Row */}
                                                      <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-1.5 min-w-0">
                                                          <SafeImage 
                                                            src={match.teams.away.logo} 
                                                            alt={match.teams.away.name} 
                                                            className="w-4.5 h-4.5 object-contain bg-slate-100/40 dark:bg-slate-800/60 rounded-md p-0.5 shrink-0"
                                                            fallbackType="team"
                                                          />
                                                          <span className={`text-xs truncate ${
                                                            isFinished && match.teams.away.winner === false ? "text-slate-400 dark:text-slate-505 font-medium" : "font-bold text-slate-800 dark:text-slate-105"
                                                          }`}>
                                                            {match.teams.away.name}
                                                          </span>
                                                        </div>
                                                        <span className={`font-mono text-xs font-black pr-1 ${
                                                          isFinished && match.teams.away.winner === false ? "text-slate-400 dark:text-slate-505" : "text-slate-705 dark:text-slate-250"
                                                        }`}>
                                                          {match.goals.away !== null ? match.goals.away : "-"}
                                                        </span>
                                                      </div>
                                                    </div>
                                                  </div>
                                                  <div className="ml-2 pl-3 border-l border-slate-100/60 dark:border-slate-800/60 flex flex-col items-center justify-center shrink-0 min-w-[#48px] select-none">
                                                    <span className="text-slate-404 dark:text-slate-500 text-[10px] font-bold uppercase font-mono">
                                                      FT
                                                    </span>
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}

                                {/* UPCOMING SECTION */}
                                {upcomingMatches.length > 0 && (
                                  <div className="flex flex-col gap-2.5">
                                    <div className="flex items-center gap-1.5 px-1 py-0.5 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                                      <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none font-sans">
                                        {isPt ? "Agendados" : language === "en" ? "Scheduled" : language === "es" ? "Programados" : language === "fr" ? "Programmés" : language === "it" ? "Programmati" : "Agendados"}
                                      </span>
                                    </div>
                                    {sortedUpcomingKeys.map((groupName) => {
                                      const showGroupHeader = isGroupType(groupName);
                                      return (
                                        <div key={`upcoming-${groupName}`} className="flex flex-col gap-1.5">
                                          {showGroupHeader && (
                                            <span className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wide pl-1 mb-1 mt-1.5 flex items-center gap-1.5 font-sans select-none">
                                              <span className="w-1.5 h-1.5 rounded-xs bg-slate-400 dark:bg-slate-500" />
                                              {groupName}
                                            </span>
                                          )}
                                          <div className="flex flex-col gap-2">
                                            {upcomingGroups[groupName].map((match) => {
                                              const isSelected = selectedMatch?.fixture.id === match.fixture.id;
                                              return (
                                                <div
                                                  key={match.fixture.id}
                                                  onClick={() => setSelectedMatch(match)}
                                                  className={`rounded-xl shadow-2xs p-3.5 flex items-center justify-between cursor-pointer border transition-all ${
                                                    isSelected 
                                                      ? "ring-2 ring-emerald-500/40 border-emerald-500 bg-emerald-50/10 dark:bg-emerald-950/25" 
                                                      : "bg-slate-50/30 dark:bg-slate-950/40 border-slate-200/50 dark:border-slate-850/80 hover:border-slate-300 hover:bg-white dark:hover:bg-slate-900"
                                                  }`}
                                                >
                                                  <div className="mr-3 shrink-0 select-none bg-slate-100/50 dark:bg-slate-800 p-1 rounded-lg flex items-center justify-center">
                                                    <SafeImage 
                                                      src={match.league.logo} 
                                                      alt={match.league.name} 
                                                      className="w-5 h-5 object-contain"
                                                      fallbackType="league"
                                                    />
                                                  </div>

                                                  <div className="flex-1 overflow-hidden pr-3 font-sans">
                                                    <div className="flex items-center justify-between w-full h-fit gap-2">
                                                      <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end text-right">
                                                        <span className="font-bold text-slate-800 dark:text-slate-105 text-xs tracking-tight truncate">
                                                          {match.teams.home.name}
                                                        </span>
                                                        <SafeImage 
                                                          src={match.teams.home.logo} 
                                                          alt={match.teams.home.name} 
                                                          className="w-5 h-5 object-contain bg-slate-100/40 dark:bg-slate-800 rounded-md p-0.5 shrink-0"
                                                          fallbackType="team"
                                                        />
                                                      </div>
                                                      <div className="flex items-center gap-1 shrink-0 px-2 py-0.5 bg-slate-100/50 dark:bg-slate-800/40 rounded-lg min-w-[50px] justify-center text-center select-none font-mono border border-slate-100/40 dark:border-slate-800/20">
                                                        <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500">
                                                          -
                                                        </span>
                                                        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold">-</span>
                                                        <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500">
                                                          -
                                                        </span>
                                                      </div>
                                                      <div className="flex items-center gap-1.5 flex-1 min-w-0 text-left">
                                                        <SafeImage 
                                                          src={match.teams.away.logo} 
                                                          alt={match.teams.away.name} 
                                                          className="w-5 h-5 object-contain bg-slate-100/40 dark:bg-slate-800 rounded-md p-0.5 shrink-0"
                                                          fallbackType="team"
                                                        />
                                                        <span className="font-bold text-slate-800 dark:text-slate-105 text-xs tracking-tight truncate">
                                                          {match.teams.away.name}
                                                        </span>
                                                      </div>
                                                    </div>
                                                  </div>
                                                  <div className="ml-2 pl-3 border-l border-slate-100/60 dark:border-slate-800/60 flex flex-col items-center justify-center shrink-0 min-w-[#48px] select-none">
                                                    <span className="text-slate-500 dark:text-slate-400 font-mono text-[10.5px] font-bold bg-slate-100/80 dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200/10 shadow-3xs">
                                                      {new Date(match.fixture.date).toLocaleTimeString(localeStr, {
                                                        hour: "2-digit",
                                                        minute: "2-digit"
                                                      })}
                                                    </span>
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })()
                        ) : (
                          // For standard countries
                          Object.values(drawer.leagues)
                            .sort((a, b) => {
                              const tierA = a.league.tier ?? 99;
                              const tierB = b.league.tier ?? 99;
                              if (tierA !== tierB) {
                                return tierA - tierB;
                              }
                              return a.league.name.localeCompare(b.league.name);
                            })
                            .map(({ league, matches: leagueMatches }) => {
                              const isLeagueFav = favorites.leagues.includes(league.id);
                              return (
                                <div key={`${league.name}-${league.id}`} className="flex flex-col gap-2">
                                <div className="flex items-center justify-between pl-1 select-none">
                                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">
                                    <SafeImage 
                                      src={league.logo} 
                                      alt={league.name} 
                                      className="w-4 h-4 object-contain rounded bg-slate-50 dark:bg-slate-800 p-0.5 shrink-0"
                                      fallbackType="league"
                                    />
                                    <span>{league.name}</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleFavoriteLeague(league.id);
                                    }}
                                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full cursor-pointer transition-all focus:outline-none"
                                    title="Favoritar Liga"
                                  >
                                    <Star 
                                      className={`w-3.5 h-3.5 ${
                                        isLeagueFav ? "fill-amber-400 text-amber-500 stroke-[2.2]" : "text-slate-300 hover:text-amber-500"
                                      }`} 
                                    />
                                  </button>
                                </div>

                                {/* Actual Games Cards */}
                                <div className="flex flex-col gap-2">
                                  {leagueMatches.map((match) => {
                                    const isLive = ["1H", "2H", "HT", "ET", "BT", "P", "SUSP", "INT"].includes(
                                      match.fixture.status.short
                                    );
                                    const isFinished = match.fixture.status.short === "FT";
                                    const isSelected = selectedMatch?.fixture.id === match.fixture.id;
                                    return (
                                      <div
                                        key={match.fixture.id}
                                        onClick={() => setSelectedMatch(match)}
                                        className={`rounded-xl shadow-2xs p-3.5 flex items-center justify-between cursor-pointer border transition-all ${
                                          isSelected 
                                            ? "ring-2 ring-emerald-500/40 border-emerald-500 bg-emerald-50/10 dark:bg-emerald-950/25" 
                                            : isLive
                                            ? "bg-white dark:bg-slate-900 border-l-4 border-l-[#ffdf00] border-y border-r border-slate-150/80 dark:border-slate-800/80 hover:border-slate-300"
                                            : "bg-slate-50/30 dark:bg-slate-950/40 border-slate-200/50 dark:border-slate-850/80 hover:border-slate-300 hover:bg-white dark:hover:bg-slate-900"
                                        }`}
                                      >
                                        <div className="mr-3 shrink-0 select-none bg-slate-100/50 dark:bg-slate-800 p-1 rounded-lg flex items-center justify-center">
                                          <SafeImage 
                                            src={match.league.logo} 
                                            alt={match.league.name} 
                                            className="w-5 h-5 object-contain"
                                            fallbackType="league"
                                          />
                                        </div>

                                                  <div className="flex-1 overflow-hidden pr-3 font-sans">
                                                    <div className="flex flex-col gap-1.5 py-0.5">
                                                      {/* Home Team Row */}
                                                      <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-1.5 min-w-0">
                                                          <SafeImage 
                                                            src={match.teams.home.logo} 
                                                            alt={match.teams.home.name} 
                                                            className="w-4.5 h-4.5 object-contain bg-slate-100/40 dark:bg-slate-800/60 rounded-md p-0.5 shrink-0"
                                                            fallbackType="team"
                                                          />
                                                          <span className={`text-xs truncate ${
                                                            isFinished && match.teams.home.winner === false ? "text-slate-400 dark:text-slate-505 font-medium" : "font-bold text-slate-800 dark:text-slate-105"
                                                          }`}>
                                                            {match.teams.home.name}
                                                          </span>
                                                        </div>
                                                        <span className={`font-mono text-xs font-black pr-1 ${
                                                          isFinished && match.teams.home.winner === false ? "text-slate-400 dark:text-slate-505" : "text-slate-705 dark:text-slate-200"
                                                        }`}>
                                                          {match.goals.home ?? "-"}
                                                        </span>
                                                      </div>

                                                      {/* Away Team Row */}
                                                      <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-1.5 min-w-0">
                                                          <SafeImage 
                                                            src={match.teams.away.logo} 
                                                            alt={match.teams.away.name} 
                                                            className="w-4.5 h-4.5 object-contain bg-slate-100/40 dark:bg-slate-800/60 rounded-md p-0.5 shrink-0"
                                                            fallbackType="team"
                                                          />
                                                          <span className={`text-xs truncate ${
                                                            isFinished && match.teams.away.winner === false ? "text-slate-400 dark:text-slate-505 font-medium" : "font-bold text-slate-800 dark:text-slate-105"
                                                          }`}>
                                                            {match.teams.away.name}
                                                          </span>
                                                        </div>
                                                        <span className={`font-mono text-xs font-black pr-1 ${
                                                          isFinished && match.teams.away.winner === false ? "text-slate-400 dark:text-slate-505" : "text-slate-705 dark:text-slate-200"
                                                        }`}>
                                                          {match.goals.away ?? "-"}
                                                        </span>
                                                      </div>
                                                    </div>
                                                  </div>
                                        <div className="ml-2 pl-3 border-l border-slate-100/60 dark:border-slate-850/60 flex flex-col items-center justify-center shrink-0 min-w-[#48px] select-none">
                                          {isLive ? (
                                            <>
                                              <span className="text-red-650 dark:text-red-400 text-xs font-black tracking-tighter flex items-center gap-0.5 font-mono">
                                                {match.fixture.status.short === "HT" ? (isPt ? "INT" : language === "en" ? "HT" : language === "es" ? "DESC" : language === "fr" ? "MT" : language === "it" ? "INT" : "HZ") : `${match.fixture.status.elapsed}'`}
                                              </span>
                                              <span className="text-[8px] font-black text-[#009c3b] dark:text-emerald-400 uppercase tracking-wider mt-0.5">
                                                {isPt ? "VIVO" : language === "en" ? "LIVE" : language === "es" ? "VIVO" : language === "fr" ? "DIRECT" : language === "it" ? "LIVE" : "LIVE"}
                                              </span>
                                            </>
                                          ) : isFinished ? (
                                            <span className="text-slate-404 dark:text-slate-500 text-[10px] font-bold uppercase font-mono">
                                              FT
                                            </span>
                                          ) : (
                                            <span className="text-slate-500 dark:text-slate-400 font-mono text-[10.5px] font-bold bg-slate-100/80 dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200/10 shadow-3xs">
                                              {new Date(match.fixture.date).toLocaleTimeString(localeStr, {
                                                hour: "2-digit",
                                                minute: "2-digit"
                                              })}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}

          </div>

          {/* RIGHT COLUMN: DETAILED MATCH CENTER (DESKTOP INTEGRATED CARD) */}
          <div className="flex-1 flex flex-col">
            {isLargeScreen ? (
              selectedMatch ? (
                <div className="h-full min-h-[580px]">
                  <MatchDetail 
                    match={selectedMatch} 
                    onClose={() => setSelectedMatch(null)} 
                    isEmbedded={true} 
                    language={language}
                    favorites={favorites}
                    onToggleFavoriteTeam={toggleFavoriteTeam}
                    onToggleFavoritePlayer={toggleFavoritePlayer}
                    matches={matches}
                  />
                </div>
              ) : (
                <div className={`rounded-2xl border p-10 flex flex-col items-center justify-center text-center h-full min-h-[580px] transition-colors select-none ${
                  config.theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                }`}>
                  <div className="w-16 h-16 bg-slate-50 dark:bg-slate-950 rounded-full flex items-center justify-center text-slate-300 mb-4 border border-slate-100 dark:border-slate-850">
                    <Trophy className="w-8 h-8 text-[#009c3b] dark:text-emerald-400" />
                  </div>
                  <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">
                    {isPt ? "Central de Partidas WorldScore" : language === "en" ? "WorldScore Match Center" : language === "es" ? "Centro de Partidos WorldScore" : language === "fr" ? "Centre de Match WorldScore" : language === "it" ? "Centro Partite WorldScore" : "WorldScore Spielcenter"}
                  </h3>
                  <p className="text-xs text-slate-450 dark:text-slate-400 max-w-sm mt-1 mb-6 leading-relaxed">
                    {t.selectMatchPrompt}
                  </p>
                  
                  {/* Quick stats teasers */}
                  <div className="grid grid-cols-2 gap-4 max-w-xs w-full">
                    <div className="bg-slate-50/50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-105 dark:border-slate-850 text-left">
                      <Clock className="w-4 h-4 text-[#009c3b] dark:text-emerald-450 mb-1" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{isPt ? "Simulações" : language === "en" ? "Simulations" : language === "es" ? "Simulaciones" : language === "fr" ? "Simulations" : language === "it" ? "Simulazioni" : "Simulationen"}</span>
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-350 mt-0.5 font-mono">
                        {isPt ? "Minuto a Minuto" : language === "en" ? "Minute by Minute" : language === "es" ? "Minuto a Minuto" : language === "fr" ? "Minute par Minute" : language === "it" ? "Minuto per Minuto" : "Minute für Minute"}
                      </p>
                    </div>
                    <div className="bg-slate-50/50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-105 dark:border-slate-850 text-left">
                      <Target className="w-4 h-4 text-amber-500 mb-1" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.statsTab}</span>
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-350 mt-0.5 font-mono">
                        {isPt ? "Precisão Real" : language === "en" ? "Real Precision" : language === "es" ? "Precisión Real" : language === "fr" ? "Précision Réelle" : language === "it" ? "Precisione Reale" : "Echte Präzision"}
                      </p>
                    </div>
                  </div>
                </div>
              )
            ) : (
              // Mobile sliding drawer (rendered dynamically on click)
              selectedMatch && (
                <MatchDetail 
                  match={selectedMatch} 
                  onClose={() => setSelectedMatch(null)} 
                  isEmbedded={false} 
                  language={language}
                  favorites={favorites}
                  onToggleFavoriteTeam={toggleFavoriteTeam}
                  onToggleFavoritePlayer={toggleFavoritePlayer}
                  matches={matches}
                />
              )
            )}
          </div>

        </main>
          )
        } />
      </Routes>

      {/* QUICK FLOATING SYSTEM INFORMATION FOOTER */}
      <footer className={`border-t mt-auto py-4 text-center select-none text-[11px] font-medium font-mono transition-colors ${
        config.theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-400" : "bg-white border-slate-200 text-slate-450"
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <span>
            {isPt ? "WorldScore © 2026 • Resultados Globais em Tempo Real" 
             : language === "en" ? "WorldScore © 2026 • Global Real-Time Results" 
             : language === "es" ? "WorldScore © 2026 • Resultados Globales en Tiempo Real" 
             : language === "fr" ? "WorldScore © 2026 • Résultats Globaux en Temps Réel" 
             : language === "it" ? "WorldScore © 2026 • Risultati Globali in Tempo Reale" 
             : "WorldScore © 2026 • Globale Live-Ergebnisse in Echtzeit"}
          </span>
          <div className="flex items-center gap-1.5 opacity-75">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 alive-pulse-icon" />
            <span>
              {isPt ? "Servidor Central Ativo" 
               : language === "en" ? "Central Server Active" 
               : language === "es" ? "Servidor Central Activo" 
               : language === "fr" ? "Serveur Central Actif" 
               : language === "it" ? "Server Centrale Attivo" 
               : "Zentralserver Aktiv"}
            </span>
          </div>
        </div>
      </footer>

      {/* Persistent Settings drawer overlay */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onChangeConfig={handleSaveConfig}
      />

      {/* Login modal dialog */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        language={language}
        onLoginSuccess={(userName) => setUser(userName)}
        theme={config.theme}
      />
    </div>
  );
}
