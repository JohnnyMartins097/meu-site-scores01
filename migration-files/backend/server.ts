import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Wrapper HTTP para o Express servir como endpoint e servidor WebSocket
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Em produção, restrinja para o domínio correto do seu front-end Next.js
    methods: ["GET", "POST"]
  }
});

app.use(express.json());

// Permitir requisições de origens cruzadas (CORS) para API convencional
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-RapidAPI-Key, X-RapidAPI-Host");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  next();
});

// Banco de dados em memória para as partidas e simulações
const matchStore: Record<string, any[]> = {};
let lastCleanup = Date.now();
let rapidApiBlockedUntil = 0;

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

// Gerar jogadores aleatórios para gols e cartões na simulação
function getRandomPlayer(teamName: string): string {
  const players: Record<string, string[]> = {
    Flamengo: ["Gabigol", "Arrascaeta", "Pedro", "Gerson", "Bruno Henrique", "Léo Pereira"],
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

// Lógica de avanço das partidas simuladas (Rodando em Background no intervalo global)
function advanceLiveMatches() {
  const now = Date.now();
  // Evitar duplicações em janelas muito estreitas
  if (now - lastCleanup < 4000) return;
  lastCleanup = now;

  Object.keys(matchStore).forEach(dateStr => {
    matchStore[dateStr].forEach(match => {
      const status = match.fixture.status.short;
      const initialHomeGoals = match.goals.home;
      const initialAwayGoals = match.goals.away;
      const initialStatus = status;

      if (['1H', '2H', 'ET'].includes(status)) {
        match.fixture.status.elapsed += 1;
        
        // Controle de intervalo e fim do jogo
        if (match.fixture.status.elapsed >= 45 && status === '1H') {
          match.fixture.status.short = 'HT';
          match.fixture.status.long = 'Halftime';
        } else if (match.fixture.status.elapsed >= 90 && status === '2H') {
          match.fixture.status.short = 'FT';
          match.fixture.status.long = 'Match Finished';
        } else {
          // 4% de chance de gol por tick
          if (Math.random() < 0.04) {
            const scorerHome = Math.random() > 0.5;
            if (scorerHome) {
              match.goals.home = (match.goals.home || 0) + 1;
              match.events.push({
                time: { elapsed: match.fixture.status.elapsed },
                team: match.teams.home,
                player: { name: getRandomPlayer(match.teams.home.name) },
                type: "Goal",
                detail: "Normal Goal"
              });
            } else {
              match.goals.away = (match.goals.away || 0) + 1;
              match.events.push({
                time: { elapsed: match.fixture.status.elapsed },
                team: match.teams.away,
                player: { name: getRandomPlayer(match.teams.away.name) },
                type: "Goal",
                detail: "Normal Goal"
              });
            }
          }

          // 3% de chance de cartões
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
        // 15% de chance do intervalo terminar a cada tick de 10s
        if (Math.random() < 0.15) {
          match.fixture.status.short = '2H';
          match.fixture.status.long = 'Second Half';
          match.fixture.status.elapsed = 46;
        }
      }

      // Verificação de alteração de estado estrutural para acionar WebSocket instantâneo
      const scoreChanged = match.goals.home !== initialHomeGoals || match.goals.away !== initialAwayGoals;
      const statusChanged = match.fixture.status.short !== initialStatus;

      if (scoreChanged || statusChanged) {
        console.log(`[WebSocket] Emitindo atualização para a partida ${match.teams.home.name} vs ${match.teams.away.name}`);
        io.emit("matchUpdate", match);
      }
    });
  });
}

// Inicializa a simulação global em intervalo de 10 segundos
setInterval(() => {
  advanceLiveMatches();
}, 10000);

// Gerador de fixtures para datas simuladas
function generateMockFixturesForDate(dateStr: string, realTodayStr: string): any[] {
  const matches: any[] = [];
  const dateParts = dateStr.split("-");
  const dateIdNum = parseInt(dateParts.join(""), 10) || 20260525;
  let baseId = dateIdNum * 100;

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

  const MATCH_DEFINITIONS = [
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
    {
      league: { id: 39, name: "Premier League", country: "England", logo: "https://media.api-sports.io/football/leagues/39.png", flag: "https://media.api-sports.io/flags/gb.svg", season: 2026, round: "Rodada 35" },
      home: T_LIVERPOOL, away: T_ARSENAL,
      venue: { id: 4001, name: "Anfield", city: "Liverpool" },
      referee: "Anthony Taylor",
      broadcast: "ESPN, Disney+",
      startHour: 15
    },
    {
      league: { id: 140, name: "La Liga", country: "Spain", logo: "https://media.api-sports.io/football/leagues/140.png", flag: "https://media.api-sports.io/flags/es.svg", season: 2026, round: "Rodada 33" },
      home: T_BARCELONA, away: T_REALMADRID, 
      venue: { id: 5001, name: "Camp Nou", city: "Barcelona" },
      referee: "Gil Manzano",
      broadcast: "Disney+, Star+",
      startHour: 17
    },
    {
      league: { id: 13, name: "Copa Libertadores", country: "World", logo: "https://media.api-sports.io/football/leagues/13.png", flag: "https://media.api-sports.io/flags/world.svg", season: 2026, round: "Fase de Grupos" },
      home: T_BOCA, away: T_RIVER, 
      venue: { id: 1001, name: "La Bombonera", city: "Buenos Aires" },
      referee: "Wilmar Roldán",
      broadcast: "ESPN, Star+, Paramount+",
      startHour: 21
    }
  ];

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
        elapsed = 15;
        homeGoals = 0;
        awayGoals = 0;
      } else if (index === 1) {
        statusShort = "2H";
        statusLong = "Second Half";
        elapsed = 62;
        homeGoals = 1;
        awayGoals = 0;
      } else if (index === 2 || index === 5) {
        statusShort = "FT";
        statusLong = "Match Finished";
        elapsed = 90;
        homeGoals = 2;
        awayGoals = 1;
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

// Mapeamento estrutural de dados recebidos diretamente da api do Sofascore
function mapSportEventToFootballMatch(event: any): any {
  if (!event) return null;
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
    } else if (description.includes("half") || description.includes("ht")) {
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
        logo: `https://api.sofascore.app/api/v1/team/${homeId}/image`, 
        winner: homeWinner 
      },
      away: { 
        id: awayId, 
        name: event.awayTeam?.name || "Visitante", 
        logo: `https://api.sofascore.app/api/v1/team/${awayId}/image`, 
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

// Sistema de failover inteligente com rotas diretas para bypass de bloqueio
async function fetchWithFallback(path: string, options: { bypassRapid?: boolean } = {}) {
  const rapidApiKey = process.env.RAPIDAPI_KEY;
  const isRapidDisabled = options.bypassRapid || Date.now() < rapidApiBlockedUntil;

  if (!isRapidDisabled && rapidApiKey) {
    try {
      const url = `https://sportapi7.p.rapidapi.com${path}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": rapidApiKey,
          "X-RapidAPI-Host": "sportapi7.p.rapidapi.com"
        }
      });
      
      if (response.status === 429) {
        console.warn("RapidAPI quota limite atingida (429). Desabilitando caminho RapidAPI por 10 minutos...");
        rapidApiBlockedUntil = Date.now() + 10 * 60 * 1000;
      } else if (response.ok) {
        const data = await response.json().catch(() => null);
        if (data) {
          if (data.message && data.message.includes("quota")) {
            console.warn("RapidAPI quota excedida na resposta. Desabilitando RapidAPI por 10 minutos...");
            rapidApiBlockedUntil = Date.now() + 10 * 60 * 1000;
          } else if (!data.message && (!data.errors || Object.keys(data.errors).length === 0)) {
            return { data, source: "rapidapi" };
          }
        }
      }
    } catch (err: any) {
      console.warn(`Erro na consulta RapidAPI para ${path}:`, err.message);
    }
  }

  // Backup secundário direto nas interfaces mobile do Sofascore
  const appUrl = `https://api.sofascore.app${path}`;
  const comUrl = `https://api.sofascore.com${path}`;

  for (const directUrl of [appUrl, comUrl]) {
    try {
      const response = await fetch(directUrl, {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          "Referer": "https://www.sofascore.com/",
          "Origin": "https://www.sofascore.com",
          "Accept": "*/*",
          "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7"
        }
      });

      if (response.ok) {
        const data = await response.json().catch(() => null);
        if (data) {
          return { data, source: directUrl.includes(".app") ? "sofascore_app" : "sofascore_direct" };
        }
      }
    } catch (err: any) {
      console.warn(`Erro na rota de failover direta (${directUrl}):`, err.message);
    }
  }
  throw new Error(`Ambos os canais de dados (RapidAPI e Sofascore Direct) falharam para: ${path}`);
}

async function getRealTodayDate(): Promise<string> {
  return new Date().toISOString().slice(0, 10);
}

// Endpoints HTTP express primários
app.get("/api/real-today", async (req, res) => {
  const dateStr = await getRealTodayDate();
  return res.json({ date: dateStr });
});

app.get("/api/fixtures", async (req, res) => {
  const dateStr = (req.query.date as string) || new Date().toISOString().slice(0, 10);
  const bypassAPI = req.query.bypass === "true";
  const realToday = await getRealTodayDate();

  if (bypassAPI) {
    if (!matchStore[dateStr]) {
      matchStore[dateStr] = generateMockFixturesForDate(dateStr, realToday);
    }
    return res.json({ response: matchStore[dateStr], _simulated: true });
  }

  try {
    const path = `/api/v1/sport/football/scheduled-events/${dateStr}`;
    const resultPack = await fetchWithFallback(path);
    const data = resultPack.data;

    if (!data || !data.events || data.events.length === 0) {
      if (!matchStore[dateStr]) {
        matchStore[dateStr] = generateMockFixturesForDate(dateStr, realToday);
      }
      return res.json({ response: matchStore[dateStr], _simulated: true, _notice: "Usando simulação (Nenhum evento na API de Produção)" });
    }

    const mappedMatches = data.events.map((evt: any) => mapSportEventToFootballMatch(evt));
    return res.json({ response: mappedMatches, _source: resultPack.source });

  } catch (error: any) {
    if (!matchStore[dateStr]) {
      matchStore[dateStr] = generateMockFixturesForDate(dateStr, realToday);
    }
    return res.json({ response: matchStore[dateStr], _simulated: true, _error: error.message });
  }
});

// Detalhes estendidos do jogo sob demanda (Estatísticas, Escalamento, Incidentes)
app.get("/api/fixture-detail", async (req, res) => {
  const matchId = req.query.id;
  if (!matchId) {
    return res.status(400).json({ error: "O parâmetro ID é obrigatório" });
  }

  try {
    const infoPack = await fetchWithFallback(`/api/v1/event/${matchId}`);
    const event = infoPack?.data?.event;

    if (!event) {
      throw new Error("Partida inexistente no Sofascore.");
    }

    const homeId = event.homeTeam?.id || 100001;
    const homeName = event.homeTeam?.name || "Casa";
    const awayId = event.awayTeam?.id || 100002;
    const awayName = event.awayTeam?.name || "Visitante";

    const homeTeam = { id: homeId, name: homeName, logo: `https://api.sofascore.app/api/v1/team/${homeId}/image` };
    const awayTeam = { id: awayId, name: awayName, logo: `https://api.sofascore.app/api/v1/team/${awayId}/image` };

    const [incidentsRes, statsRes, lineupsRes] = await Promise.all([
      fetchWithFallback(`/api/v1/event/${matchId}/incidents`).catch(() => null),
      fetchWithFallback(`/api/v1/event/${matchId}/statistics`).catch(() => null),
      fetchWithFallback(`/api/v1/event/${matchId}/lineups`).catch(() => null)
    ]);

    let events: any[] = [];
    if (incidentsRes && incidentsRes.data) {
      const incidentsList = incidentsRes.data.incidents || [];
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

    let statistics: any[] = [];
    if (statsRes && statsRes.data) {
      const allGroupStats = statsRes.data.statistics?.find((p: any) => p.period === "ALL")?.groups || [];
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

      allGroupStats.forEach((group: any) => {
        group.statisticsItems?.forEach((item: any) => {
          const parentType = item.name;
          const mappedType = statTypeMapping[parentType] || parentType;
          homeStatsList.push({ type: mappedType, value: item.home });
          awayStatsList.push({ type: mappedType, value: item.away });
        });
      });

      if (homeStatsList.length > 0) {
        statistics = [
          { team: homeTeam, statistics: homeStatsList },
          { team: awayTeam, statistics: awayStatsList }
        ];
      }
    }

    let lineups: any[] = [];
    if (lineupsRes && lineupsRes.data) {
      const lineupsData = lineupsRes.data;
      const mapLineup = (teamBlock: any, teamRef: any) => {
        if (!teamBlock) return null;
        const playersList = teamBlock.players || [];
        
        const startXI = playersList
          .filter((p: any) => !p.substitute)
          .map((p: any) => ({
            player: {
              name: p.player?.name || "Jogador",
              number: p.player?.jerseyNumber || 0,
              pos: p.player?.position || "M"
            }
          }));

        const substitutes = playersList
          .filter((p: any) => p.substitute)
          .map((p: any) => ({
            player: {
              name: p.player?.name || "Jogador",
              number: p.player?.jerseyNumber || 0,
              pos: p.player?.position || "M"
            }
          }));

        return {
          team: teamRef,
          formation: teamBlock.formation || "4-3-3",
          startXI,
          substitutes,
          coach: { name: teamBlock.manager?.name || "Técnico" }
        };
      };

      const mappedHome = mapLineup(lineupsData.home, homeTeam);
      const mappedAway = mapLineup(lineupsData.away, awayTeam);

      if (mappedHome) lineups.push(mappedHome);
      if (mappedAway) lineups.push(mappedAway);
    }

    return res.json({ events, statistics, lineups });

  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Erro de processamento no detalhamento." });
  }
});

// Manipulador de conexões via WebSocket
io.on("connection", (socket) => {
  console.log(`[WebSocket] Cliente conectado ID: ${socket.id}`);
  
  socket.on("disconnect", () => {
    console.log(`[WebSocket] Cliente desconectado ID: ${socket.id}`);
  });
});

// Iniciando o Servidor Desacoplado HTTP + WebSocket
httpServer.listen(PORT, () => {
  console.log(`🚀 Back-end de Alta Performance carregado na porta ${PORT}`);
  console.log(`📡 Endpoints HTTP disponíveis em http://localhost:${PORT}`);
  console.log(`🔌 WebSocket ativo no endereço padrão.`);
});
