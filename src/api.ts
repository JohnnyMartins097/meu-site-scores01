// src/api.ts

// ⚠️ COLOQUE A SUA CHAVE DA API SPORTS AQUI
const API_KEY = "9b9bc4cde1mshac85de8628281aap1fe278jsna8a022da00be"; 
const BASE_URL = "https://v3.football.api-sports.io";

export const fetchApiSports = async (endpoint: string) => {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "GET",
      headers: {
        "x-apisports-key": API_KEY,
        "x-apisports-host": "v3.football.api-sports.io"
      }
    });

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Erro ao buscar ${endpoint}:`, error);
    throw error;
  }
};

// Funções prontas para os seus componentes usarem:

export const getMatchesByDate = async (date: string) => {
  const data = await fetchApiSports(`/fixtures?date=${date}`);
  return data.response || [];
};

export const getMatchDetails = async (fixtureId: number) => {
  const data = await fetchApiSports(`/fixtures?id=${fixtureId}`);
  return data.response?.[0] || null;
};

export const getStandings = async (leagueId: number, season: number) => {
  const data = await fetchApiSports(`/standings?league=${leagueId}&season=${season}`);
  return data.response?.[0]?.league?.standings?.[0] || [];
};

export const getH2H = async (teamA: number, teamB: number) => {
  const data = await fetchApiSports(`/fixtures/headtohead?h2h=${teamA}-${teamB}`);
  return data.response || [];
};

export const searchTeams = async (query: string) => {
  const data = await fetchApiSports(`/teams?search=${encodeURIComponent(query)}`);
  return data.response || [];
};