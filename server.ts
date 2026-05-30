import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory mock databases for fixtures, statistics, events, and lineups
// Keyed by date "YYYY-MM-DD"
const matchStore: Record<string, any[]> = {};
let lastCleanup = Date.now();

const TEAM_LIST = [
  { id: 127, name: "Flamengo", logo: "https://media.api-sports.io/football/teams/127.png" },
  { id: 121, name: "Palmeiras", logo: "https://media.api-sports.io/football/teams/121.png" },
  { id: 126, name: "São Paulo", logo: "https://media.api-sports.io/football/teams/126.png" },
  { id: 131, name: "Corinthians", logo: "https://media.api-sports.io/football/teams/131.png" },
  { id: 120, name: "Botafogo", logo: "https://media.api-sports.io/football/teams/120.png" },
  { id: 119, name: "Internacional", logo: "https://media.api-sports.io/football/teams/119.png" },
  { id: 124, name: "Fluminense", logo: "https://media.api-sports.io/football/teams/124.png" },
  { id: 118, name: "Grêmio", logo: "https://media.api-sports.io/football/teams/118.png" },
  { id: 130, name: "Vasco da Gama", logo: "https://media.api-sports.io/football/teams/130.png" },
  { id: 541, name: "Real Madrid", logo: "https://media.api-sports.io/football/teams/541.png" },
  { id: 529, name: "Barcelona", logo: "https://media.api-sports.io/football/teams/529.png" },
  { id: 50, name: "Manchester City", logo: "https://media.api-sports.io/football/teams/50.png" },
  { id: 40, name: "Liverpool", logo: "https://media.api-sports.io/football/teams/40.png" },
  { id: 42, name: "Arsenal", logo: "https://media.api-sports.io/football/teams/42.png" },
  { id: 157, name: "Bayern Munich", logo: "https://media.api-sports.io/football/teams/157.png" },
  { id: 85, name: "PSG", logo: "https://media.api-sports.io/football/teams/85.png" },
  { id: 435, name: "River Plate", logo: "https://media.api-sports.io/football/teams/435.png" },
  { id: 451, name: "Boca Juniors", logo: "https://media.api-sports.io/football/teams/451.png" }
];

const LEAGUE_LIST = [
  { id: 71, name: "Brasileirão Série A", country: "Brazil", logo: "https://media.api-sports.io/football/leagues/71.png", flag: "https://media.api-sports.io/flags/br.svg" },
  { id: 13, name: "Copa Libertadores", country: "World", logo: "https://media.api-sports.io/football/leagues/13.png", flag: "https://media.api-sports.io/flags/world.svg" },
  { id: 2, name: "UEFA Champions League", country: "World", logo: "https://media.api-sports.io/football/leagues/2.png", flag: "https://media.api-sports.io/flags/world.svg" },
  { id: 39, name: "Premier League", country: "England", logo: "https://media.api-sports.io/football/leagues/39.png", flag: "https://media.api-sports.io/flags/gb.svg" },
  { id: 140, name: "La Liga", country: "Spain", logo: "https://media.api-sports.io/football/leagues/140.png", flag: "https://media.api-sports.io/flags/es.svg" }
];

// Helper to update state of live games
function advanceLiveMatches() {
  const now = Date.now();
  // Throttle changes to avoid updates faster than every 5 seconds
  if (now - lastCleanup < 5000) return;
  lastCleanup = now;

  Object.keys(matchStore).forEach(dateStr => {
    matchStore[dateStr].forEach(match => {
      const status = match.fixture.status.short;
      if (['1H', '2H', 'ET'].includes(status)) {
        // Tick time
        match.fixture.status.elapsed += 1;
        if (match.fixture.status.elapsed >= 45 && status === '1H') {
          match.fixture.status.short = 'HT';
          match.fixture.status.long = 'Halftime';
        } else if (match.fixture.status.elapsed >= 90 && status === '2H') {
          match.fixture.status.short = 'FT';
          match.fixture.status.long = 'Match Finished';
        } else {
          // 4% chance of a goal in each tick
          if (Math.random() < 0.04) {
            const scorerHome = Math.random() > 0.5;
            if (scorerHome) {
              match.goals.home += 1;
              match.events.push({
                time: { elapsed: match.fixture.status.elapsed },
                team: match.teams.home,
                player: { name: getRandomPlayer(match.teams.home.name) },
                type: "Goal",
                detail: "Normal Goal"
              });
            } else {
              match.goals.away += 1;
              match.events.push({
                time: { elapsed: match.fixture.status.elapsed },
                team: match.teams.away,
                player: { name: getRandomPlayer(match.teams.away.name) },
                type: "Goal",
                detail: "Normal Goal"
              });
            }
          }

          // 3% chance of card
          if (Math.random() < 0.03) {
            const isHome = Math.random() > 0.5;
            const team = isHome ? match.teams.home : match.teams.away;
            const cardDetail = Math.random() > 0.85 ? "Red Card" : "Yellow Card";
            match.events.push({
              time: { elapsed: match.fixture.status.elapsed },
              team: team,
              player: { name: getRandomPlayer(team.name) },
              type: "Card",
              detail: cardDetail
            });
          }
        }
      } else if (status === 'HT') {
        // 10% chance halftime ends
        if (Math.random() < 0.15) {
          match.fixture.status.short = '2H';
          match.fixture.status.long = 'Second Half';
          match.fixture.status.elapsed = 46;
        }
      }
    });
  });
}

function getRandomPlayer(teamName: string): string {
  const players: Record<string, string[]> = {
    Flamengo: ["Gabigol", "Arrascaeta", "De la Cruz", "Gerson", "Bruno Henrique", "Léo Pereira"],
    Palmeiras: ["Rony", "Raphael Veiga", "Dudu", "Estêvão", "Richard Ríos", "Murilo"],
    "São Paulo": ["Calleri", "Lucas Moura", "Luciano", "Alisson", "Nestor", "Arboleda"],
    Corinthians: ["Garro", "Yuri Alberto", "Depay", "Romero", "Raniele", "Gustavo Henrique"],
    Botafogo: ["Luiz Henrique", "Igor Jesus", "Almada", "Savarino", "Tiquinho", "Adryelson"],
    Internacional: ["Enner Valencia", "Alan Patrick", "Wanderson", "Borré", "Rochet"],
    Fluminense: ["Ganso", "Cano", "Jhon Arias", "Marcelo", "Thiago Silva", "Martinelli"],
    Grêmio: ["Pavon", "Soteldo", "Diego Costa", "Cristaldo", "Kannemann"],
    "Vasco da Gama": ["Vegetti", "Coutinho", "Payet", "Léo Jardim", "Piton"],
    "Real Madrid": ["Vini Jr.", "Mbappé", "Bellingham", "Rodrygo", "Modrić", "Valverde"],
    Barcelona: ["Lewandowski", "Lamine Yamal", "Raphinha", "Pedri", "Gavi", "Frenkie de Jong"],
    "Manchester City": ["Haaland", "De Bruyne", "Foden", "Bernardo Silva", "Rodri", "Grealish"],
    Liverpool: ["Salah", "Luis Díaz", "Darwin Núñez", "Mac Allister", "Szoboszlai", "Van Dijk"],
    Arsenal: ["Saka", "Odegaard", "Martinelli", "Havertz", "Rice", "Gabriel Jesus"],
    "Bayern Munich": ["Harry Kane", "Musiala", "Sané", "Müller", "Kimmich", "Davies"],
    PSG: ["Dembélé", "Barcola", "Asensio", "Vitinha", "Hakimi", "Marquinhos"],
    "River Plate": ["Borja", "Lanzini", "Echeverri", "Meza", "Pezzella"],
    "Boca Juniors": ["Cavani", "Merentiel", "Zenón", "Advíncula", "Rojo"]
  };
  const list = players[teamName] || ["Jogador A", "Jogador B", "Jogador C", "Jogador D"];
  return list[Math.floor(Math.random() * list.length)];
}

function generateMockFixturesForDate(dateStr: string, realTodayStr: string): any[] {
  const matches: any[] = [];
  
  // Deterministic ID base derived from date string
  const dateParts = dateStr.split("-");
  const dateIdNum = parseInt(dateParts.join(""), 10) || 20260525;
  let baseId = dateIdNum * 100;

  // Real teams definitions to match up securely
  const T_FLAMENGO = { id: 127, name: "Flamengo", logo: "https://media.api-sports.io/football/teams/127.png" };
  const T_PALMEIRAS = { id: 121, name: "Palmeiras", logo: "https://media.api-sports.io/football/teams/121.png" };
  const T_SAOPAULO = { id: 126, name: "São Paulo", logo: "https://media.api-sports.io/football/teams/126.png" };
  const T_CORINTHIANS = { id: 131, name: "Corinthians", logo: "https://media.api-sports.io/football/teams/131.png" };
  const T_BOTAFOGO = { id: 120, name: "Botafogo", logo: "https://media.api-sports.io/football/teams/120.png" };
  const T_INTERNACIONAL = { id: 119, name: "Internacional", logo: "https://media.api-sports.io/football/teams/119.png" };
  const T_FLUMINENSE = { id: 124, name: "Fluminense", logo: "https://media.api-sports.io/football/teams/124.png" };
  const T_GREMIO = { id: 118, name: "Grêmio", logo: "https://media.api-sports.io/football/teams/118.png" };
  const T_VASCO = { id: 130, name: "Vasco da Gama", logo: "https://media.api-sports.io/football/teams/130.png" };
  
  const T_REALMADRID = { id: 541, name: "Real Madrid", logo: "https://media.api-sports.io/football/teams/541.png" };
  const T_BARCELONA = { id: 529, name: "Barcelona", logo: "https://media.api-sports.io/football/teams/529.png" };
  const T_MANCITY = { id: 50, name: "Manchester City", logo: "https://media.api-sports.io/football/teams/50.png" };
  const T_LIVERPOOL = { id: 40, name: "Liverpool", logo: "https://media.api-sports.io/football/teams/40.png" };
  const T_ARSENAL = { id: 42, name: "Arsenal", logo: "https://media.api-sports.io/football/teams/42.png" };
  const T_BAYERN = { id: 157, name: "Bayern Munich", logo: "https://media.api-sports.io/football/teams/157.png" };
  const T_PSG = { id: 85, name: "PSG", logo: "https://media.api-sports.io/football/teams/85.png" };
  const T_RIVER = { id: 435, name: "River Plate", logo: "https://media.api-sports.io/football/teams/435.png" };
  const T_BOCA = { id: 451, name: "Boca Juniors", logo: "https://media.api-sports.io/football/teams/451.png" };

  // Define potential matches in structures
  const MATCH_DEFINITIONS = [
    // 1. Brasileirão Série A
    {
      league: { id: 71, name: "Brasileirão Série A", country: "Brazil", logo: "https://media.api-sports.io/football/leagues/71.png", flag: "https://media.api-sports.io/flags/br.svg", season: 2026, round: "Série A - Rodada 8" },
      home: T_FLAMENGO, away: T_PALMEIRAS,
      venue: { id: 2001, name: "Maracanã", city: "Rio de Janeiro" },
      referee: "Wilton Pereira Sampaio",
      broadcast: "Rede Globo, Premiere",
      startHour: 16
    },
    {
      league: { id: 71, name: "Brasileirão Série A", country: "Brazil", logo: "https://media.api-sports.io/football/leagues/71.png", flag: "https://media.api-sports.io/flags/br.svg", season: 2026, round: "Série A - Rodada 8" },
      home: T_SAOPAULO, away: T_CORINTHIANS,
      venue: { id: 2002, name: "MorumBIS", city: "São Paulo" },
      referee: "Raphael Claus",
      broadcast: "CazéTV, Premiere",
      startHour: 18
    },
    {
      league: { id: 71, name: "Brasileirão Série A", country: "Brazil", logo: "https://media.api-sports.io/football/leagues/71.png", flag: "https://media.api-sports.io/flags/br.svg", season: 2026, round: "Série A - Rodada 8" },
      home: T_GREMIO, away: T_INTERNACIONAL,
      venue: { id: 2003, name: "Arena do Grêmio", city: "Porto Alegre" },
      referee: "Anderson Daronco",
      broadcast: "Sportv, Premiere",
      startHour: 16
    },
    {
      league: { id: 71, name: "Brasileirão Série A", country: "Brazil", logo: "https://media.api-sports.io/football/leagues/71.png", flag: "https://media.api-sports.io/flags/br.svg", season: 2026, round: "Série A - Rodada 8" },
      home: T_BOTAFOGO, away: T_FLUMINENSE,
      venue: { id: 2004, name: "Estádio Nilton Santos", city: "Rio de Janeiro" },
      referee: "Ramon Abatti Abel",
      broadcast: "Premiere, CazéTV",
      startHour: 20
    },
    {
      league: { id: 71, name: "Brasileirão Série A", country: "Brazil", logo: "https://media.api-sports.io/football/leagues/71.png", flag: "https://media.api-sports.io/flags/br.svg", season: 2026, round: "Série A - Rodada 8" },
      home: T_VASCO, away: T_SAOPAULO, 
      venue: { id: 2005, name: "São Januário", city: "Rio de Janeiro" },
      referee: "Braulio da Silva Machado",
      broadcast: "Premiere",
      startHour: 21
    },

    // 2. UEFA Champions League
    {
      league: { id: 2, name: "UEFA Champions League", country: "World", logo: "https://media.api-sports.io/football/leagues/2.png", flag: "https://media.api-sports.io/flags/world.svg", season: 2026, round: "Semifinais - Ida" },
      home: T_REALMADRID, away: T_MANCITY,
      venue: { id: 3001, name: "Santiago Bernabéu", city: "Madrid" },
      referee: "Szymon Marciniak",
      broadcast: "TNT, HBO Max",
      startHour: 19
    },
    {
      league: { id: 2, name: "UEFA Champions League", country: "World", logo: "https://media.api-sports.io/football/leagues/2.png", flag: "https://media.api-sports.io/flags/world.svg", season: 2026, round: "Semifinais - Ida" },
      home: T_PSG, away: T_BAYERN,
      venue: { id: 3002, name: "Parc des Princes", city: "Paris" },
      referee: "Michael Oliver",
      broadcast: "Space, HBO Max",
      startHour: 19
    },

    // 3. Premier League
    {
      league: { id: 39, name: "Premier League", country: "England", logo: "https://media.api-sports.io/football/leagues/39.png", flag: "https://media.api-sports.io/flags/gb.svg", season: 2026, round: "Rodada 35" },
      home: T_LIVERPOOL, away: T_ARSENAL,
      venue: { id: 4001, name: "Anfield", city: "Liverpool" },
      referee: "Anthony Taylor",
      broadcast: "ESPN, Disney+",
      startHour: 15
    },

    // 4. La Liga
    {
      league: { id: 140, name: "La Liga", country: "Spain", logo: "https://media.api-sports.io/football/leagues/140.png", flag: "https://media.api-sports.io/flags/es.svg", season: 2026, round: "Rodada 33" },
      home: T_BARCELONA, away: T_REALMADRID, 
      venue: { id: 5001, name: "Camp Nou", city: "Barcelona" },
      referee: "Gil Manzano",
      broadcast: "Disney+, Star+",
      startHour: 17
    },

    // 5. Copa Libertadores
    {
      league: { id: 13, name: "Copa Libertadores", country: "World", logo: "https://media.api-sports.io/football/leagues/13.png", flag: "https://media.api-sports.io/flags/world.svg", season: 2026, round: "Fase de Grupos" },
      home: T_BOCA, away: T_RIVER, 
      venue: { id: 1001, name: "La Bombonera", city: "Buenos Aires" },
      referee: "Wilmar Roldán",
      broadcast: "ESPN, Star+, Paramount+",
      startHour: 21
    }
  ];

  // We want to generate actual matches for the selected date!
  const isToday = (dateStr === realTodayStr);

  MATCH_DEFINITIONS.forEach((def, index) => {
    const matchId = baseId + index;
    let statusShort = "NS";
    let statusLong = "Not Started";
    let elapsed = 0;
    let homeGoals: number | null = null;
    let awayGoals: number | null = null;

    if (isToday) {
      if (index === 0) {
        statusShort = "1H";
        statusLong = "First Half";
        elapsed = Math.floor(Math.random() * 20) + 10;
        homeGoals = Math.floor(Math.random() * 2);
        awayGoals = Math.floor(Math.random() * 2);
      } else if (index === 1) {
        statusShort = "2H";
        statusLong = "Second Half";
        elapsed = Math.floor(Math.random() * 30) + 50;
        homeGoals = Math.floor(Math.random() * 3);
        awayGoals = Math.floor(Math.random() * 2);
      } else if (index === 2 || index === 5) {
        statusShort = "FT";
        statusLong = "Match Finished";
        elapsed = 90;
        homeGoals = Math.floor(Math.random() * 3) + 1;
        awayGoals = Math.floor(Math.random() * 2);
      } else {
        statusShort = "NS";
        statusLong = "Not Started";
        elapsed = 0;
        homeGoals = null;
        awayGoals = null;
      }
    } else {
      const isPast = dateStr < realTodayStr;
      if (isPast) {
        statusShort = "FT";
        statusLong = "Match Finished";
        elapsed = 90;
        homeGoals = (index % 3);
        awayGoals = (index % 2);
      } else {
        statusShort = "NS";
        statusLong = "Not Started";
        elapsed = 0;
        homeGoals = null;
        awayGoals = null;
      }
    }

    const events: any[] = [];
    if (homeGoals !== null && awayGoals !== null) {
      for (let g = 0; g < homeGoals; g++) {
        events.push({
          time: { elapsed: Math.max(1, Math.floor(Math.random() * (elapsed || 90))) },
          team: def.home,
          player: { name: getRandomPlayer(def.home.name) },
          type: "Goal",
          detail: "Normal Goal"
        });
      }
      for (let g = 0; g < awayGoals; g++) {
        events.push({
          time: { elapsed: Math.max(1, Math.floor(Math.random() * (elapsed || 90))) },
          team: def.away,
          player: { name: getRandomPlayer(def.away.name) },
          type: "Goal",
          detail: "Normal Goal"
        });
      }
    }

    const generateStatsValue = (homeVal: number, awayVal: number) => [
      { type: "Shots on Goal", value: homeVal },
      { type: "Shots off Goal", value: awayVal },
      { type: "Total Shots", value: homeVal + awayVal + 2 },
      { type: "Fouls", value: Math.floor(Math.random() * 10) + 5 },
      { type: "Corner Kicks", value: Math.floor(Math.random() * 7) + 2 },
      { type: "Ball Possession", value: `${Math.floor(Math.random() * 20) + 40}%` },
      { type: "Yellow Cards", value: Math.floor(Math.random() * 3) },
      { type: "Red Cards", value: Math.random() > 0.95 ? 1 : 0 },
      { type: "Goalkeeper Saves", value: Math.floor(Math.random() * 5) }
    ];

    const statistics = [
      { team: def.home, statistics: generateStatsValue(Math.floor(Math.random() * 6) + 2, Math.floor(Math.random() * 6) + 2) },
      { team: def.away, statistics: generateStatsValue(Math.floor(Math.random() * 6) + 2, Math.floor(Math.random() * 6) + 2) }
    ];

    const lineups = [
      {
        team: def.home,
        formation: "4-3-3",
        coach: { name: "Técnico " + def.home.name },
        startXI: [
          { player: { name: "Goleiro Titular", number: 1, pos: "G" } },
          { player: { name: "Lateral Direito", number: 2, pos: "D" } },
          { player: { name: "Zagueiro Principal 1", number: 3, pos: "D" } },
          { player: { name: "Zagueiro Principal 2", number: 4, pos: "D" } },
          { player: { name: "Lateral Esquerdo", number: 6, pos: "D" } },
          { player: { name: "Volante de Marcação", number: 5, pos: "M" } },
          { player: { name: "Meio-Campo Criativo", number: 8, pos: "M" } },
          { player: { name: "Meia-Armador Classista", number: 10, pos: "M" } },
          { player: { name: "Ponta Veloz Direita", number: 7, pos: "F" } },
          { player: { name: "Ponta Habilidoso Esquerda", number: 11, pos: "F" } },
          { player: { name: "Artilheiro Centroavante", number: 9, pos: "F" } }
        ],
        substitutes: [
          { player: { name: "Goleiro Reserva", number: 12, pos: "G" } },
          { player: { name: "Zagueiro Reserva", number: 13, pos: "D" } },
          { player: { name: "Volante Reserva", number: 15, pos: "M" } },
          { player: { name: "Centroavante Reserva", number: 18, pos: "F" } }
        ]
      },
      {
        team: def.away,
        formation: "4-4-2",
        coach: { name: "Técnico " + def.away.name },
        startXI: [
          { player: { name: "Arqueiro Principal", number: 1, pos: "G" } },
          { player: { name: "Lateral Dir.", number: 2, pos: "D" } },
          { player: { name: "Zagueiro de Área 1", number: 3, pos: "D" } },
          { player: { name: "Zagueiro de Área 2", number: 4, pos: "D" } },
          { player: { name: "Lateral Esq.", number: 6, pos: "D" } },
          { player: { name: "Médio Apoiador", number: 5, pos: "M" } },
          { player: { name: "Meia Armador Central", number: 8, pos: "M" } },
          { player: { name: "Ponta Infiltrador", number: 10, pos: "M" } },
          { player: { name: "Ala Ofensivo", number: 7, pos: "M" } },
          { player: { name: "Atacante de Referência", number: 9, pos: "F" } },
          { player: { name: "Segundo Atacante", number: 11, pos: "F" } }
        ],
        substitutes: [
          { player: { name: "Goleiro Suplente", number: 12, pos: "G" } },
          { player: { name: "Defensor Polivalente", number: 14, pos: "D" } },
          { player: { name: "Meio-Campo de Transição", number: 16, pos: "M" } },
          { player: { name: "Pontas Velocistas", number: 17, pos: "F" } }
        ]
      }
    ];

    matches.push({
      fixture: {
        id: matchId,
        referee: def.referee,
        timezone: "UTC",
        date: `${dateStr}T${def.startHour}:00:00+00:00`,
        timestamp: Math.floor(new Date(`${dateStr}T${def.startHour}:00:00+00:00`).getTime() / 1000),
        periods: { first: null, second: null },
        venue: def.venue,
        status: { long: statusLong, short: statusShort, elapsed: elapsed }
      },
      league: def.league,
      teams: {
        home: { id: def.home.id, name: def.home.name, logo: def.home.logo, winner: homeGoals !== null && awayGoals !== null ? homeGoals > awayGoals : null },
        away: { id: def.away.id, name: def.away.name, logo: def.away.logo, winner: homeGoals !== null && awayGoals !== null ? awayGoals > homeGoals : null }
      },
      goals: { home: homeGoals, away: awayGoals },
      score: {
        halftime: { home: homeGoals !== null ? Math.max(0, homeGoals - 1) : null, away: awayGoals !== null ? Math.max(0, awayGoals - 1) : null },
        fulltime: { home: homeGoals, away: awayGoals },
        extratime: { home: null, away: null },
        penalty: { home: null, away: null }
      },
      events,
      statistics,
      lineups,
      broadcast: def.broadcast
    });
  });

  return matches;
}

interface CachedLeague {
  id: number;
  name: string;
  country: string;
  logo: string;
  flag: string;
}

const leagueCache: Record<number, CachedLeague> = {
  71: { id: 71, name: "Brasileirão Série A", country: "Brasil", logo: "https://media.api-sports.io/football/leagues/71.png", flag: "https://media.api-sports.io/flags/br.svg" },
  13: { id: 13, name: "Copa Libertadores", country: "América do Sul", logo: "https://media.api-sports.io/football/leagues/13.png", flag: "https://media.api-sports.io/flags/world.svg" },
  2: { id: 2, name: "UEFA Champions League", country: "Mundo", logo: "https://media.api-sports.io/football/leagues/2.png", flag: "https://media.api-sports.io/flags/world.svg" },
  39: { id: 39, name: "Premier League", country: "Inglaterra", logo: "https://media.api-sports.io/football/leagues/39.png", flag: "https://media.api-sports.io/flags/gb.svg" },
  140: { id: 140, name: "La Liga", country: "Espanha", logo: "https://media.api-sports.io/football/leagues/140.png", flag: "https://media.api-sports.io/flags/es.svg" }
};

async function fillLeagueCacheForEvents(events: any[]) {
  if (!events || !Array.isArray(events)) return;
  
  // Find all unique leagueIds that are not in the cache
  const uniqueLeagueIds = Array.from(new Set(events.map(e => e.leagueId).filter(id => id !== undefined && id !== null)));
  const idsToFetch = uniqueLeagueIds.filter(id => !leagueCache[id]);

  if (idsToFetch.length === 0) return;

  console.log(`[League Cache] Tentando buscar detalhes de ${idsToFetch.length} novas IDs de ligas:`, idsToFetch);

  // Fetch details concurrently for a sample match of each new leagueId, catch errors gracefully
  await Promise.all(idsToFetch.map(async (leagueId) => {
    const sampleEvent = events.find(e => e.leagueId === leagueId);
    if (!sampleEvent || !sampleEvent.id) return;

    try {
      const result = await fetchWithFallback(`/football-get-match-detail?eventid=${sampleEvent.id}`);
      if (result && result.data && result.data.response && result.data.response.detail) {
        const detail = result.data.response.detail;
        
        let name = detail.leagueName || "Campeonato";
        let country = "Internacional";
        let logo = `https://www.sofascore.com/api/v1/unique-tournament/${leagueId}/image`;
        let flag = "https://media.api-sports.io/flags/world.svg";

        const code = (detail.countryCode || "").toLowerCase();
        if (code === "br" || name.toLowerCase().includes("brasileir") || name.toLowerCase().includes("brazil")) {
          country = "Brasil";
          flag = "https://media.api-sports.io/flags/br.svg";
        } else if (code === "ar") {
          country = "Argentina";
          flag = "https://media.api-sports.io/flags/ar.svg";
        } else if (code === "es") {
          country = "Espanha";
          flag = "https://media.api-sports.io/flags/es.svg";
        } else if (code === "gb" || code === "eng") {
          country = "Inglaterra";
          flag = "https://media.api-sports.io/flags/gb.svg";
        } else if (code === "int" || code === "int-2" || code === "south-america" || name.toLowerCase().includes("libertadores") || name.toLowerCase().includes("sudamericana") || name.toLowerCase().includes("sulamericana")) {
          country = "América do Sul";
          flag = "https://media.api-sports.io/flags/world.svg";
        } else if (detail.countryCode) {
          country = detail.countryCode.toUpperCase();
          flag = `https://flagcdn.com/w40/${code}.png`;
        }

        if (name.toLowerCase().includes("libertadores")) {
          name = "CONMEBOL Libertadores";
          country = "América do Sul";
          logo = "https://img.sofascore.com/api/v1/unique-tournament/45/image";
          flag = "https://media.api-sports.io/flags/world.svg";
        } else if (name.toLowerCase().includes("sudamericana") || name.toLowerCase().includes("sulamericana")) {
          name = "CONMEBOL Sudamericana";
          country = "América do Sul";
          logo = "https://img.sofascore.com/api/v1/unique-tournament/48/image";
          flag = "https://media.api-sports.io/flags/world.svg";
        } else {
          const parentId = detail.parentLeagueId || detail.uniqueTournamentId;
          if (parentId) {
            logo = `https://www.sofascore.com/api/v1/unique-tournament/${parentId}/image`;
          }
        }

        leagueCache[leagueId] = {
          id: leagueId,
          name,
          country,
          logo,
          flag
        };
        console.log(`[League Cache] Cache criado com sucesso para liga ${leagueId}: "${name}" (${country})`);
      } else {
        // Safe fallback when result is returned but detail is missing
        leagueCache[leagueId] = {
          id: leagueId,
          name: "Campeonato",
          country: "Internacional",
          logo: `https://www.sofascore.com/api/v1/unique-tournament/${leagueId}/image`,
          flag: "https://media.api-sports.io/flags/world.svg"
        };
      }
    } catch (err: any) {
      console.log(`[League Cache] Falha ao carregar info para liga ${leagueId} (aplicando fallback de segurança):`, err.message);
      // Cache the fallback so we don't spam requests for this failing league ID again
      leagueCache[leagueId] = {
        id: leagueId,
        name: "Campeonato",
        country: "Internacional",
        logo: `https://www.sofascore.com/api/v1/unique-tournament/${leagueId}/image`,
        flag: "https://media.api-sports.io/flags/world.svg"
      };
    }
  }));
}

// API router to get fixtures/matches
function mapSportEventToFootballMatch(event: any): any {
  if (!event) return null;

  // Differentiate RapidAPI style vs original Sofascore endpoint style
  const isRapid = event.home !== undefined && event.away !== undefined;

  if (isRapid) {
    const isFinished = event.status?.finished === true;
    const isLive = event.status?.ongoing === true;

    let statusShort = "NS";
    let statusLong = "Not Started";
    let elapsed = 0;

    if (isFinished) {
      statusShort = "FT";
      statusLong = "Match Finished";
      elapsed = 90;
    } else if (isLive) {
      const shortTime = event.status?.liveTime?.short || "";
      if (shortTime.includes("HT") || shortTime.includes("intervalo") || shortTime.includes("Intervalo") || shortTime.includes("half") || shortTime.includes("Half")) {
        statusShort = "HT";
        statusLong = "Halftime";
        elapsed = 45;
      } else {
        const numericPart = parseInt(shortTime.replace(/[^0-9]/g, ""), 10) || 45;
        elapsed = numericPart;
        statusShort = elapsed <= 45 ? "1H" : "2H";
        statusLong = elapsed <= 45 ? "First Half" : "Second Half";
      }
    } else if (event.status?.cancelled) {
      statusShort = "CANCL";
      statusLong = "Cancelled";
    }

    const startTimestamp = event.timeTS ? Math.floor(event.timeTS / 1000) : Math.floor(Date.now() / 1000);
    const matchDate = event.status?.utcTime || (event.timeTS ? new Date(event.timeTS).toISOString() : new Date().toISOString());

    const homeGoals = event.home?.score !== undefined ? event.home.score : null;
    const awayGoals = event.away?.score !== undefined ? event.away.score : null;

    const homeWinner = (homeGoals !== null && awayGoals !== null && isFinished) ? (homeGoals > awayGoals) : null;
    const awayWinner = (homeGoals !== null && awayGoals !== null && isFinished) ? (awayGoals > homeGoals) : null;

    const homeId = event.home?.id || 100001;
    const awayId = event.away?.id || 100002;

    const leagueId = event.leagueId || 999;
    const cacheMatched = leagueCache[leagueId];
    const matchedLeague = LEAGUE_LIST.find(l => l.id === leagueId);
    
    const leagueName = cacheMatched ? cacheMatched.name : (matchedLeague ? matchedLeague.name : "Competição");
    const leagueCountry = cacheMatched ? cacheMatched.country : (matchedLeague ? matchedLeague.country : "Outros");
    const leagueLogo = cacheMatched ? cacheMatched.logo : (matchedLeague ? matchedLeague.logo : `https://www.sofascore.com/api/v1/unique-tournament/${leagueId}/image`);
    const leagueFlag = cacheMatched ? cacheMatched.flag : (matchedLeague ? matchedLeague.flag : "https://media.api-sports.io/flags/world.svg");

    return {
      fixture: {
        id: event.id || Math.floor(Math.random() * 100000),
        referee: "Árbitro",
        timezone: "UTC",
        date: matchDate,
        timestamp: startTimestamp,
        periods: { first: null, second: null },
        venue: { 
          id: 1, 
          name: "Estádio Esportivo", 
          city: "Cidade" 
        },
        status: { 
          long: statusLong, 
          short: statusShort, 
          elapsed: elapsed
        }
      },
      league: {
        id: leagueId,
        name: leagueName,
        country: leagueCountry,
        logo: leagueLogo,
        flag: leagueFlag,
        season: 2026,
        round: "Rodada"
      },
      teams: {
        home: { 
          id: homeId, 
          name: event.home?.name || event.home?.longName || "Casa", 
          logo: `https://img.sofascore.com/api/v1/team/${homeId}/image`, 
          winner: homeWinner 
        },
        away: { 
          id: awayId, 
          name: event.away?.name || event.away?.longName || "Visitante", 
          logo: `https://img.sofascore.com/api/v1/team/${awayId}/image`, 
          winner: awayWinner 
        }
      },
      goals: { home: homeGoals, away: awayGoals },
      score: {
        halftime: { 
          home: (isFinished || isLive) && homeGoals !== null ? Math.max(0, homeGoals - 1) : null, 
          away: (isFinished || isLive) && awayGoals !== null ? Math.max(0, awayGoals - 1) : null 
        },
        fulltime: { home: homeGoals, away: awayGoals },
        extratime: { home: null, away: null },
        penalty: { home: null, away: null }
      },
      events: [],
      statistics: [],
      lineups: []
    };
  }

  const isFinished = event.status?.type === "finished";
  const isLive = event.status?.type === "inprogress";
  
  let statusShort = "NS";
  let statusLong = "Not Started";
  const description = (event.status?.description || "").toLowerCase();
  
  if (isFinished) {
    statusShort = "FT";
    statusLong = "Match Finished";
  } else if (isLive) {
    if (description.includes("1st") || description.includes("1h")) {
      statusShort = "1H";
      statusLong = "First Half";
    } else if (description.includes("2nd") || description.includes("2h")) {
      statusShort = "2H";
      statusLong = "Second Half";
    } else if (description.includes("half") || description.includes("ht") || description.includes("intervalo")) {
      statusShort = "HT";
      statusLong = "Halftime";
    } else {
      statusShort = "1H";
      statusLong = "Live";
    }
  }

  const startTimestamp = event.startTimestamp;
  const matchDate = startTimestamp ? new Date(startTimestamp * 1000).toISOString() : new Date().toISOString();

  const homeGoals = event.homeScore?.current !== undefined ? event.homeScore.current : null;
  const awayGoals = event.awayScore?.current !== undefined ? event.awayScore.current : null;

  const homeWinner = (homeGoals !== null && awayGoals !== null && isFinished) ? (homeGoals > awayGoals) : null;
  const awayWinner = (homeGoals !== null && awayGoals !== null && isFinished) ? (awayGoals > homeGoals) : null;

  const countryAlpha = event.tournament?.category?.alpha2 || "";
  const flagUrl = countryAlpha 
    ? `https://flagcdn.com/w40/${countryAlpha.toLowerCase()}.png` 
    : "https://media.api-sports.io/flags/world.svg";

  const homeId = event.homeTeam?.id || 100001;
  const awayId = event.awayTeam?.id || 100002;

  return {
    fixture: {
      id: event.id || Math.floor(Math.random() * 100000),
      referee: event.referee?.name || "Árbitro",
      timezone: "UTC",
      date: matchDate,
      timestamp: startTimestamp || Math.floor(Date.now() / 1000),
      periods: { first: null, second: null },
      venue: { 
        id: event.venue?.id || 1, 
        name: event.venue?.name || "Estádio Esportivo", 
        city: event.venue?.city || "Cidade" 
      },
      status: { 
        long: statusLong, 
        short: statusShort, 
        elapsed: event.statusTime?.elapsed || (isFinished ? 90 : (isLive ? 45 : 0)) 
      }
    },
    league: {
      id: event.tournament?.uniqueTournament?.id || event.tournament?.id || 999,
      name: event.tournament?.uniqueTournament?.name || event.tournament?.name || "Campeonato",
      country: event.tournament?.category?.name || "Mundo",
      logo: `https://www.sofascore.com/api/v1/unique-tournament/${event.tournament?.uniqueTournament?.id || event.tournament?.id || 999}/image`,
      flag: flagUrl,
      season: event.season?.id || 2026,
      round: "Rodada"
    },
    teams: {
      home: { 
        id: homeId, 
        name: event.homeTeam?.name || "Casa", 
        logo: `https://img.sofascore.com/api/v1/team/${homeId}/image`, 
        winner: homeWinner 
      },
      away: { 
        id: awayId, 
        name: event.awayTeam?.name || "Visitante", 
        logo: `https://img.sofascore.com/api/v1/team/${awayId}/image`, 
        winner: awayWinner 
      }
    },
    goals: { home: homeGoals, away: awayGoals },
    score: {
      halftime: { 
        home: event.homeScore?.period1 !== undefined ? event.homeScore.period1 : null, 
        away: event.awayScore?.period1 !== undefined ? event.awayScore.period1 : null 
      },
      fulltime: { home: homeGoals, away: awayGoals },
      extratime: { home: null, away: null },
      penalty: { home: null, away: null }
    },
    events: [],
    statistics: [],
    lineups: []
  };
}

let rapidApiBlockedUntil = 0;

interface CacheEntry {
  data: any;
  timestamp: number;
}
const apiCache: Record<string, CacheEntry> = {};
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes in-memory caching

// Helper to query Free API Live Football Data via RapidAPI
async function fetchWithFallback(path: string, options: { bypassRapid?: boolean; ttl?: number } = {}) {
  const rapidApiKey = process.env.RAPIDAPI_KEY || "9b9bc4cde1mshac85de8628281aap1fe278jsna8a022da00be";
  
  const cacheKey = path;
  const now = Date.now();
  const ttl = options.ttl ?? CACHE_TTL;

  if (!options.bypassRapid && apiCache[cacheKey] && (now - apiCache[cacheKey].timestamp) < ttl) {
    console.log(`[API Cache] Cache hit para: ${path}`);
    return { data: apiCache[cacheKey].data, source: "rapidapi" };
  }
  
  const isRapidDisabled = options.bypassRapid || now < rapidApiBlockedUntil;

  if (!isRapidDisabled && rapidApiKey) {
    try {
      const url = `https://free-api-live-football-data.p.rapidapi.com${path}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "x-rapidapi-key": rapidApiKey,
          "x-rapidapi-host": "free-api-live-football-data.p.rapidapi.com",
          "Content-Type": "application/json"
        }
      });
      
      // If we are rate-limited or quota exceeded, disable RapidAPI callouts for a 10-minute window
      if (response.status === 429) {
        console.log("RapidAPI rate limit or quota exceeded (429). Disabling RapidAPI request path for 10 minutes...");
        rapidApiBlockedUntil = now + 10 * 60 * 1000;
      } else if (response.ok) {
        const data = await response.json().catch(() => null);
        if (data) {
          if (data.message && data.message.includes("quota")) {
            console.log("RapidAPI quota exceeded in message. Disabling RapidAPI for 10 minutes...");
            rapidApiBlockedUntil = now + 10 * 60 * 1000;
          } else if (!data.message && (!data.errors || Object.keys(data.errors).length === 0)) {
            // Save in cache
            apiCache[cacheKey] = { data, timestamp: now };
            return { data, source: "rapidapi" };
          }
        }
      }
    } catch (err: any) {
      console.log(`RapidAPI failure on path ${path}:`, err.message);
      // If the fetch fails entirely (offline system, network unreachable, rate limit error, etc.),
      // temporarily back off and disable RapidAPI queries for 5 minutes.
      // This prevents subsequent requests from stalling or lagging on the same network issue.
      console.log("Disabling RapidAPI request path for 5 minutes to prevent stalling...");
      rapidApiBlockedUntil = now + 5 * 60 * 1000;
    }
  }

  // Check if we have an expired cache entry to use as stale fallback
  if (apiCache[cacheKey]) {
    console.log(`[API Cache] Usando cache expirado como fallback para: ${path}`);
    return { data: apiCache[cacheKey].data, source: "rapidapi" };
  }

  throw new Error(`RapidAPI request failed or returned empty data for path ${path}`);
}

// Helper to resolve the true real-world calendar date (instantly using physical container clock bounds)
async function getRealTodayDate(): Promise<string> {
  const localDateStr = new Date().toISOString().slice(0, 10);
  return localDateStr;
}

function getLocalDateStringInTimezone(timestampMs: number, timezone: string): string {
  try {
    const date = new Date(timestampMs);
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    });
    const parts = formatter.formatToParts(date);
    const year = parts.find(p => p.type === "year")?.value;
    const month = parts.find(p => p.type === "month")?.value;
    const day = parts.find(p => p.type === "day")?.value;
    return `${year}-${month}-${day}`;
  } catch (err) {
    const d = new Date(timestampMs);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }
}

function getOffsetDates(dateStr: string): string[] {
  try {
    const baseDate = new Date(`${dateStr}T12:00:00Z`);
    const dMinus1 = new Date(baseDate.getTime() - 24 * 60 * 60 * 1000);
    const dPlus1 = new Date(baseDate.getTime() + 24 * 60 * 60 * 1000);

    const format = (d: Date) => {
      const yyyy = d.getUTCFullYear();
      const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
      const dd = String(d.getUTCDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    };

    return [format(dMinus1), dateStr, format(dPlus1)];
  } catch (err) {
    return [dateStr];
  }
}

// Endpoint to proxy images and bypass CORS or referrer checks
app.get("/api/proxy-image", async (req, res) => {
  const url = req.query.url as string;
  if (!url) {
    return res.status(400).send("No URL provided");
  }

  // Whitelist to prevent server abuse
  const allowed = ["sofascore", "api-sports", "flagcdn", "githubusercontent", "wikimedia"];
  const isAllowed = allowed.some(domain => url.includes(domain));
  if (!isAllowed) {
    return res.status(403).send("Domain not permitted");
  }

  try {
    const headers: Record<string, string> = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
    };

    if (url.includes("sofascore")) {
      headers["Referer"] = "https://www.sofascore.com/";
    } else if (url.includes("api-sports")) {
      headers["Referer"] = "https://media.api-sports.io/";
    }

    const response = await fetch(url, { method: "GET", headers });

    if (response.ok) {
      const contentType = response.headers.get("content-type") || "image/png";
      const buffer = await response.arrayBuffer();
      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "public, max-age=604800, immutable"); // Cache for 7 days
      return res.send(Buffer.from(buffer));
    } else {
      console.log(`[Proxy Image] Error fetching ${url}: ${response.status}`);
      return res.status(response.status).send(`Failed to fetch image: status ${response.status}`);
    }
  } catch (err: any) {
    console.log(`[Proxy Image] Exception fetching ${url}:`, err.message);
    return res.status(500).send("Internal image proxy error");
  }
});

// Endpoint to resolve current physical calendar date
app.get("/api/real-today", async (req, res) => {
  const dateStr = await getRealTodayDate();
  return res.json({ date: dateStr });
});

// Endpoint to fetch dynamic leagueCache dictionary of league names and logos
app.get("/api/leagues", (req, res) => {
  return res.json(leagueCache || {});
});

// API router to get fixtures/matches by date
app.get("/api/fixtures", async (req, res) => {
  const dateStr = (req.query.date as string) || new Date().toISOString().slice(0, 10);
  const clientToday = (req.query.today as string) || dateStr;
  const timezone = (req.query.timezone as string) || "America/Sao_Paulo";

  console.log(`[API /api/fixtures] Buscando partidas para a data ${dateStr} no fuso horário ${timezone}`);

  try {
    const datesToQuery = getOffsetDates(dateStr);
    console.log(`[API /api/fixtures] Consultando as seguintes datas UTC para cobrir fuso horário:`, datesToQuery);

    const queryPromises = datesToQuery.map(async (dStr) => {
      const formatted = dStr.replace(/-/g, "");
      const path = `/football-get-matches-by-date?date=${formatted}`;
      try {
        const resultPack = await fetchWithFallback(path);
        return { dateStr: dStr, data: resultPack.data, source: resultPack.source };
      } catch (err: any) {
        console.log(`[API /api/fixtures] Falha ao consultar data UTC ${dStr}:`, err.message);
        return { dateStr: dStr, data: null, source: null };
      }
    });

    const results = await Promise.all(queryPromises);

    let allEvents: any[] = [];
    let activeSource = "simulation";

    for (const r of results) {
      const data = r.data;
      if (r.source) activeSource = r.source;

      if (data) {
        let eventsForDate: any[] = [];
        if (Array.isArray(data)) {
          eventsForDate = data;
        } else if (data.response) {
          if (Array.isArray(data.response)) {
            eventsForDate = data.response;
          } else if (typeof data.response === "object" && data.response !== null) {
            const obj = data.response;
            if (obj.live && Array.isArray(obj.live)) {
              eventsForDate = eventsForDate.concat(obj.live);
            }
            if (obj.matches && Array.isArray(obj.matches)) {
              eventsForDate = eventsForDate.concat(obj.matches);
            }
            if (obj.fixtures && Array.isArray(obj.fixtures)) {
              eventsForDate = eventsForDate.concat(obj.fixtures);
            }
            if (eventsForDate.length === 0) {
              const keys = Object.keys(obj);
              for (const k of keys) {
                if (Array.isArray(obj[k])) {
                  eventsForDate = eventsForDate.concat(obj[k]);
                }
              }
            }
          }
        } else if (data && typeof data === "object") {
          if (data.events && Array.isArray(data.events)) {
            eventsForDate = eventsForDate.concat(data.events);
          }
          if (data.matches && Array.isArray(data.matches)) {
            eventsForDate = eventsForDate.concat(data.matches);
          }
          if (data.live && Array.isArray(data.live)) {
            eventsForDate = eventsForDate.concat(data.live);
          }
          if (data.fixtures && Array.isArray(data.fixtures)) {
            eventsForDate = eventsForDate.concat(data.fixtures);
          }
          if (eventsForDate.length === 0) {
            const keys = Object.keys(data);
            for (const k of keys) {
              if (Array.isArray(data[k])) {
                eventsForDate = eventsForDate.concat(data[k]);
              }
            }
          }
        }
        allEvents = allEvents.concat(eventsForDate);
      }
    }

    if (allEvents.length === 0) {
      console.log(`[API /api/fixtures] Nenhum jogo retornado da API real para as datas estimadas de ${dateStr}. Retornando lista vazia.`);
      return res.json({ response: [], _simulated: false });
    }

    // Load league details cache concurrently before mapping
    await fillLeagueCacheForEvents(allEvents);

    const mappedMatches = allEvents
      .map((evt: any) => mapSportEventToFootballMatch(evt))
      .filter((m: any) => m !== null);

    // Filter to retain matches that fall exactly on the requested local date string in the target timezone
    const filteredMatches = mappedMatches.filter((match: any) => {
      const timestampMs = match.fixture.timestamp * 1000;
      const matchDateLocal = getLocalDateStringInTimezone(timestampMs, timezone);
      return matchDateLocal === dateStr;
    });

    console.log(`[API /api/fixtures] Mapeamento concluído: ${mappedMatches.length} jogos totais nas datas UTC, refinados para ${filteredMatches.length} jogos no fuso ${timezone} do dia ${dateStr}.`);

    return res.json({ response: filteredMatches, _source: activeSource });

  } catch (error: any) {
    console.log("=== ERRO DETECTADO NA CHAMADA DA API REAL ===");
    console.log(error);
    console.log("=======================================================================");
    
    return res.status(500).json({ response: [], _simulated: false, error: "Erro ao buscar partidas", _error: error.message });
  }
});

// API router to get live matches
app.get("/api/live", async (req, res) => {
  const bypassAPI = req.query.bypass === "true";
  const realToday = await getRealTodayDate();

  advanceLiveMatches();

  if (bypassAPI) {
    return res.json({ response: [], _simulated: false });
  }

  try {
    const path = "/football-current-live";
    const resultPack = await fetchWithFallback(path);
    const data = resultPack.data;
    
    let events: any[] = [];
    if (data) {
      if (Array.isArray(data)) {
        events = data;
      } else if (data.response) {
        if (Array.isArray(data.response)) {
          events = data.response;
        } else if (typeof data.response === "object" && data.response !== null) {
          const obj = data.response;
          if (obj.live && Array.isArray(obj.live)) {
            events = events.concat(obj.live);
          }
          if (obj.matches && Array.isArray(obj.matches)) {
            events = events.concat(obj.matches);
          }
          if (obj.fixtures && Array.isArray(obj.fixtures)) {
            events = events.concat(obj.fixtures);
          }
          if (events.length === 0) {
            const keys = Object.keys(obj);
            for (const k of keys) {
              if (Array.isArray(obj[k])) {
                events = events.concat(obj[k]);
              }
            }
          }
        }
      } else if (data && typeof data === "object") {
        if (data.events && Array.isArray(data.events)) {
          events = events.concat(data.events);
        }
        if (data.matches && Array.isArray(data.matches)) {
          events = events.concat(data.matches);
        }
        if (data.live && Array.isArray(data.live)) {
          events = events.concat(data.live);
        }
        if (data.fixtures && Array.isArray(data.fixtures)) {
          events = events.concat(data.fixtures);
        }
        if (events.length === 0) {
          const keys = Object.keys(data);
          for (const k of keys) {
            if (Array.isArray(data[k])) {
              events = events.concat(data[k]);
            }
          }
        }
      }
    }

    if (!events || events.length === 0) {
      console.log("No live events returned from RapidAPI.");
      return res.json({
        response: [],
        _simulated: false,
        _notice: "No live games found on API"
      });
    }

    // Load league details cache concurrently before mapping
    await fillLeagueCacheForEvents(events);

    const mappedMatches = events
      .map((evt: any) => mapSportEventToFootballMatch(evt))
      .filter((m: any) => m !== null);

    return res.json({ response: mappedMatches, _source: resultPack.source });
  } catch (error: any) {
    console.log("Live API failed:", error.message);
    return res.status(500).json({ response: [], _simulated: false, error: "Erro ao buscar jogos ao vivo", _error: error.message });
  }
});

// API router to get league standings
app.get("/api/standings/:leagueid", async (req, res) => {
  const leagueId = req.params.leagueid;
  if (!leagueId) {
    return res.status(400).json({ error: "Parâmetro ID da liga é obrigatório" });
  }

  try {
    const tab = req.query.tab as string;
    let path = `/football-get-standing-all?leagueid=${leagueId}`;
    if (tab === "Casa") {
      path = `/football-get-standing-home?leagueid=${leagueId}`;
    } else if (tab === "Fora") {
      path = `/football-get-standing-away?leagueid=${leagueId}`;
    } else if (!tab) {
      path = `/football-get-list-all-team?leagueid=${leagueId}&id=${leagueId}&leagueId=${leagueId}`;
    }
    
    const resultPack = await fetchWithFallback(path);
    const responseData = resultPack.data?.response || {};
    const standingsList = responseData.standing || responseData.list || resultPack.data;
    
    return res.json({ 
      standings: standingsList, 
      response: responseData, 
      _source: resultPack.source 
    });
  } catch (error: any) {
    console.log(`Standing API failed for league ${leagueId}:`, error.message);
    return res.status(500).json({ error: "Classificação não disponível para esta competição", _error: error.message });
  }
});

// Proxy to get details about a single team
app.get("/api/team/:teamid", async (req, res) => {
  const teamId = req.params.teamid;
  if (!teamId) {
    return res.status(400).json({ error: "Parâmetro ID do time é obrigatório" });
  }

  try {
    const path = `/football-league-team?teamid=${teamId}`;
    const resultPack = await fetchWithFallback(path);
    return res.json({
      data: resultPack.data,
      _source: resultPack.source
    });
  } catch (error: any) {
    console.log(`Team API failed for team ${teamId}:`, error.message);
    return res.status(500).json({ error: "Detalhes do time não disponíveis", _error: error.message });
  }
});

// Proxy to get squad/players of a single team
app.get("/api/team-squad/:teamid", async (req, res) => {
  const teamId = req.params.teamid;
  if (!teamId) {
    return res.status(400).json({ error: "Parâmetro ID do time é obrigatório" });
  }

  try {
    const path = `/football-get-list-player?teamid=${teamId}`;
    const resultPack = await fetchWithFallback(path);
    return res.json({
      data: resultPack.data,
      _source: resultPack.source
    });
  } catch (error: any) {
    console.log(`Team Squad API failed for team ${teamId}:`, error.message);
    return res.status(500).json({ error: "Elenco do time não disponível", _error: error.message });
  }
});

// Proxy to get league leaders (goals, assists, ratings)
app.get("/api/league-leaders/goals/:leagueId", async (req, res) => {
  const leagueId = req.params.leagueId;
  if (!leagueId) {
    return res.status(400).json({ error: "Parâmetro ID da liga é obrigatório" });
  }
  try {
    const path = `/football-get-top-players-by-goals?leagueid=${leagueId}`;
    const resultPack = await fetchWithFallback(path);
    return res.json(resultPack.data);
  } catch (error: any) {
    console.log(`Goals Leader API failed for league ${leagueId}:`, error.message);
    return res.status(500).json({ error: "Artilheiros não disponíveis", _error: error.message });
  }
});

app.get("/api/league-leaders/assists/:leagueId", async (req, res) => {
  const leagueId = req.params.leagueId;
  if (!leagueId) {
    return res.status(400).json({ error: "Parâmetro ID da liga é obrigatório" });
  }
  try {
    const path = `/football-get-top-players-by-assists?leagueid=${leagueId}`;
    const resultPack = await fetchWithFallback(path);
    return res.json(resultPack.data);
  } catch (error: any) {
    console.log(`Assists Leader API failed for league ${leagueId}:`, error.message);
    return res.status(500).json({ error: "Líderes de assistências não disponíveis", _error: error.message });
  }
});

app.get("/api/league-leaders/rating/:leagueId", async (req, res) => {
  const leagueId = req.params.leagueId;
  if (!leagueId) {
    return res.status(400).json({ error: "Parâmetro ID da liga é obrigatório" });
  }
  try {
    const path = `/football-get-top-players-by-rating?leagueid=${leagueId}`;
    const resultPack = await fetchWithFallback(path);
    return res.json(resultPack.data);
  } catch (error: any) {
    console.log(`Rating Leader API failed for league ${leagueId}:`, error.message);
    return res.status(500).json({ error: "Melhores notas não disponíveis", _error: error.message });
  }
});

// Proxy to get player details
app.get("/api/player/:playerid", async (req, res) => {
  const playerId = req.params.playerid;
  if (!playerId) {
    return res.status(400).json({ error: "Parâmetro ID do jogador é obrigatório" });
  }

  try {
    const path = `/football-get-player-detail?playerid=${playerId}`;
    const resultPack = await fetchWithFallback(path);
    return res.json({
      data: resultPack.data,
      _source: resultPack.source
    });
  } catch (error: any) {
    console.log(`Player Detail API failed for player ${playerId}:`, error.message);
    return res.status(500).json({ error: "Detalhes do jogador não disponíveis", _error: error.message });
  }
});

app.get("/api/football-get-match-detail", async (req, res) => {
  const eventid = req.query.eventid;
  if (!eventid) return res.status(400).json({ error: "Missing eventid" });
  try {
    const result = await fetchWithFallback(`/football-get-match-detail?eventid=${eventid}`);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.get("/api/football-get-match-score", async (req, res) => {
  const eventid = req.query.eventid;
  if (!eventid) return res.status(400).json({ error: "Missing eventid" });
  try {
    const result = await fetchWithFallback(`/football-get-match-score?eventid=${eventid}`);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.get("/api/football-get-match-status", async (req, res) => {
  const eventid = req.query.eventid;
  if (!eventid) return res.status(400).json({ error: "Missing eventid" });
  try {
    const result = await fetchWithFallback(`/football-get-match-status?eventid=${eventid}`);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.get("/api/football-get-match-location", async (req, res) => {
  const eventid = req.query.eventid;
  if (!eventid) return res.status(400).json({ error: "Missing eventid" });
  try {
    const result = await fetchWithFallback(`/football-get-match-location?eventid=${eventid}`);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.get("/api/football-get-match-all-stats", async (req, res) => {
  const eventid = req.query.eventid;
  if (!eventid) return res.status(400).json({ error: "Missing eventid" });
  try {
    const result = await fetchWithFallback(`/football-get-match-all-stats?eventid=${eventid}`);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.get("/api/football-get-match-referee", async (req, res) => {
  const eventid = req.query.eventid;
  if (!eventid) return res.status(400).json({ error: "Missing eventid" });
  try {
    const result = await fetchWithFallback(`/football-get-match-referee?eventid=${eventid}`);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Dynamic Match Detail Fetcher for Free API Live Football Data (Lineups, Incidents, Statistics on Demand)
app.get("/api/fixture-detail", async (req, res) => {
  const matchId = req.query.id;

  if (!matchId) {
    return res.status(400).json({ error: "Parâmetro ID da partida é obrigatório" });
  }

  // Check if it's simulated
  const parsedId = parseInt(matchId as string, 10);
  if (!isNaN(parsedId) && parsedId >= 2000000000) {
    // This is a simulated fixture ID, find it in matchStore
    let foundMatch: any = null;
    for (const d of Object.keys(matchStore)) {
      const match = matchStore[d]?.find(m => m.fixture.id === parsedId);
      if (match) {
        foundMatch = match;
        break;
      }
    }
    if (foundMatch) {
      return res.json({
        events: foundMatch.events || [],
        statistics: foundMatch.statistics || [],
        lineups: foundMatch.lineups || []
      });
    }
  }

  try {
    // 1. Fetch event general info to get team IDs and names
    const infoPack = await fetchWithFallback(`/football-get-match-detail?eventid=${matchId}`);
    const event = infoPack?.data?.response?.detail || infoPack?.data?.event || infoPack?.data;

    if (!event) {
      throw new Error("Partida não encontrada na API do futebol.");
    }

    const homeId = event.homeTeam?.id || event.home?.id || 100001;
    const homeName = event.homeTeam?.name || event.home?.name || event.home?.longName || "Casa";
    const awayId = event.awayTeam?.id || event.away?.id || 100002;
    const awayName = event.awayTeam?.name || event.away?.name || event.away?.longName || "Visitante";

    const homeTeam = { id: homeId, name: homeName, logo: `https://img.sofascore.com/api/v1/team/${homeId}/image` };
    const awayTeam = { id: awayId, name: awayName, logo: `https://img.sofascore.com/api/v1/team/${awayId}/image` };

    // 2. Fetch incidents, stats, lineups in parallel utilizing the new proxy structure
    const [statsRes, homeLineupRes, awayLineupRes] = await Promise.all([
      fetchWithFallback(`/football-get-match-all-stats?eventid=${matchId}`).catch(() => null),
      fetchWithFallback(`/football-get-hometeam-lineup?eventid=${matchId}`).catch(() => null),
      fetchWithFallback(`/football-get-awayteam-lineup?eventid=${matchId}`).catch(() => null)
    ]);

    // Parse Lineups
    let lineups: any[] = [];
    if (homeLineupRes || awayLineupRes) {
      const lineupsData = {
        home: homeLineupRes?.data?.response?.lineup || {},
        away: awayLineupRes?.data?.response?.lineup || {}
      };

      const mapLineup = (teamBlock: any, teamRef: any) => {
        if (!teamBlock || !teamBlock.starters) return null;
        
        const startersList = teamBlock.starters || [];
        const subsList = teamBlock.subs || [];
        
        const startXI = startersList.map((p: any) => {
          let pos = "M"; // default midfielder
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

        const substitutes = subsList.map((p: any) => {
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
          team: teamRef,
          formation: teamBlock.formation || "4-3-3",
          startXI,
          substitutes,
          coach: { name: teamBlock.coach?.name || "Técnico" },
          averageStarterAge: teamBlock.averageStarterAge || null,
          totalStarterMarketValue: teamBlock.totalStarterMarketValue || null
        };
      };

      const mappedHome = mapLineup(lineupsData.home, homeTeam);
      const mappedAway = mapLineup(lineupsData.away, awayTeam);

      if (mappedHome) lineups.push(mappedHome);
      if (mappedAway) lineups.push(mappedAway);
    }

    // Parse Incidents (Goals, Cards, Substitutions)
    let events: any[] = [];
    const incidentsList = infoPack?.data?.response?.incidents || infoPack?.data?.incidents || [];
    
    if (incidentsList && incidentsList.length > 0) {
      events = incidentsList.map((inc: any) => {
        const isHome = inc.isHome ?? (inc.home === true);
        const team = isHome ? homeTeam : awayTeam;
        
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

    // Fallback Simulated Incidents (Play-by-play / Lance-a-lance)
    if (events.length === 0) {
      // Look up current score and status from matchStore
      let homeScore = 0;
      let awayScore = 0;
      let isLiveOrFinished = false;

      const parsedId = parseInt(matchId as string, 10);
      for (const d of Object.keys(matchStore)) {
        const match = matchStore[d]?.find(m => m.fixture.id === parsedId);
        if (match) {
          homeScore = match.goals?.home ?? 0;
          awayScore = match.goals?.away ?? 0;
          if (["1H", "2H", "HT", "FT", "AET", "PEN"].includes(match.fixture?.status?.short)) {
            isLiveOrFinished = true;
          }
          break;
        }
      }

      if (isLiveOrFinished || homeScore > 0 || awayScore > 0) {
        const hLineup = lineups.find(l => l.team.id === homeTeam.id);
        const aLineup = lineups.find(l => l.team.id === awayTeam.id);
        
        const getHomeStartersNames = () => hLineup?.startXI?.map((x: any) => x.player.name) || [homeTeam.name + " Atacante", homeTeam.name + " Meia"];
        const getHomeSubsNames = () => hLineup?.substitutes?.map((x: any) => x.player.name) || [homeTeam.name + " Reserva 1", homeTeam.name + " Reserva 2"];
        const getAwayStartersNames = () => aLineup?.startXI?.map((x: any) => x.player.name) || [awayTeam.name + " Atacante", awayTeam.name + " Meia"];
        const getAwaySubsNames = () => aLineup?.substitutes?.map((x: any) => x.player.name) || [awayTeam.name + " Reserva 1", awayTeam.name + " Reserva 2"];

        const homeStarters = getHomeStartersNames();
        const homeSubs = getHomeSubsNames();
        const awayStarters = getAwayStartersNames();
        const awaySubs = getAwaySubsNames();

        // 1. Generate Goals (Home)
        for (let i = 0; i < homeScore; i++) {
          const minute = Math.floor(Math.random() * 85) + 5;
          const scorer = homeStarters[Math.floor(Math.random() * homeStarters.length)] || "Jogador";
          const assister = homeStarters[Math.floor(Math.random() * homeStarters.length)] || "Jogador";
          events.push({
            time: { elapsed: minute },
            team: { id: homeTeam.id, name: homeTeam.name },
            player: { name: scorer },
            assist: assister !== scorer ? { name: assister } : null,
            type: "Goal",
            detail: "Normal Goal"
          });
        }

        // 2. Generate Goals (Away)
        for (let i = 0; i < awayScore; i++) {
          const minute = Math.floor(Math.random() * 85) + 5;
          const scorer = awayStarters[Math.floor(Math.random() * awayStarters.length)] || "Jogador";
          const assister = awayStarters[Math.floor(Math.random() * awayStarters.length)] || "Jogador";
          events.push({
            time: { elapsed: minute },
            team: { id: awayTeam.id, name: awayTeam.name },
            player: { name: scorer },
            assist: assister !== scorer ? { name: assister } : null,
            type: "Goal",
            detail: "Normal Goal"
          });
        }

        // 3. Generate Cards (2-4 random cards)
        const totalCards = Math.floor(Math.random() * 3) + 2;
        for (let i = 0; i < totalCards; i++) {
          const isHomeCard = Math.random() > 0.5;
          const cardTeam = isHomeCard ? homeTeam : awayTeam;
          const cardPlayers = isHomeCard ? homeStarters : awayStarters;
          const minute = Math.floor(Math.random() * 88) + 2;
          const cardPlayerName = cardPlayers[Math.floor(Math.random() * cardPlayers.length)] || "Jogador";
          
          events.push({
            time: { elapsed: minute },
            team: { id: cardTeam.id, name: cardTeam.name },
            player: { name: cardPlayerName },
            assist: null,
            type: "Card",
            detail: "Yellow Card"
          });
        }

        // 4. Generate substitutions (2 subs per team in the second half)
        for (let i = 0; i < 2; i++) {
          if (homeStarters.length > 0 && homeSubs.length > 0) {
            const minute = 55 + Math.floor(Math.random() * 30);
            const playerOut = homeStarters[Math.floor(Math.random() * homeStarters.length)];
            const playerIn = homeSubs[Math.floor(Math.random() * homeSubs.length)];
            events.push({
              time: { elapsed: minute },
              team: { id: homeTeam.id, name: homeTeam.name },
              player: { name: playerIn },
              assist: null,
              type: "Subst",
              detail: `Sai: ${playerOut} / Entra: ${playerIn}`
            });
          }
          if (awayStarters.length > 0 && awaySubs.length > 0) {
            const minute = 55 + Math.floor(Math.random() * 30);
            const playerOut = awayStarters[Math.floor(Math.random() * awayStarters.length)];
            const playerIn = awaySubs[Math.floor(Math.random() * awaySubs.length)];
            events.push({
              time: { elapsed: minute },
              team: { id: awayTeam.id, name: awayTeam.name },
              player: { name: playerIn },
              assist: null,
              type: "Subst",
              detail: `Sai: ${playerOut} / Entra: ${playerIn}`
            });
          }
        }

        events.sort((a, b) => a.time.elapsed - b.time.elapsed);
      }
    }

    // Parse Statistics
    let statistics: any[] = [];
    if (statsRes && statsRes.data && statsRes.data.response?.stats) {
      const statsList = statsRes.data.response.stats;
      const homeStatsList: any[] = [];
      const awayStatsList: any[] = [];

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

      if (Array.isArray(statsList)) {
        statsList.forEach((group: any) => {
          if (group && Array.isArray(group.stats)) {
            group.stats.forEach((item: any) => {
              if (item && item.stats && item.stats.length === 2) {
                const parentType = item.title;
                const mappedType = statTypeMapping[parentType] || parentType;
                
                homeStatsList.push({
                  type: mappedType,
                  value: item.stats[0]
                });
                awayStatsList.push({
                  type: mappedType,
                  value: item.stats[1]
                });
              }
            });
          }
        });
      }

      if (homeStatsList.length > 0) {
        statistics = [
          { team: homeTeam, statistics: homeStatsList },
          { team: awayTeam, statistics: awayStatsList }
        ];
      }
    }

    return res.json({
      events,
      statistics,
      lineups
    });

  } catch (error: any) {
    console.log("Erro ao carregar detalhes adicionais:", error);
    return res.status(500).json({ error: error.message || "Erro no servidor ao buscar detalhes da partida" });
  }
});

// Start server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`WorldScore Full-Stack Server running at http://localhost:${PORT}`);
  });
}

startServer();
