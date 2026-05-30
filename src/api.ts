// src/api.ts

const fetchApiSports = async (endpoint: string) => {
  try {
    const response = await fetch(`https://v3.football.api-sports.io${endpoint}`, {
      method: "GET",
      headers: {
        "x-rapidapi-key": "9b9bc4cde1mshac85de8628281aap1fe278jsna8a022da00be",
        "x-rapidapi-host": "v3.football.api-sports.io"
      }
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao buscar dados diretamente da API:", error);
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

export const getLeagueStandings = async (leagueId: number) => {
  try {
    // Attempt 1: Direct RapidAPI Call to the correct football-get-list-all-team endpoint with redundant parameters
    const response = await fetch(`https://free-api-live-football-data.p.rapidapi.com/football-get-list-all-team?leagueid=${leagueId}&id=${leagueId}&leagueId=${leagueId}`, {
      method: "GET",
      headers: {
        "x-rapidapi-key": "9b9bc4cde1mshac85de8628281aap1fe278jsna8a022da00be",
        "x-rapidapi-host": "free-api-live-football-data.p.rapidapi.com"
      }
    });

    if (!response.ok) {
      throw new Error(`Direct RapidAPI error: status ${response.status}`);
    }

    const data = await response.json();
    const standingsData = data.response?.list;
    if (standingsData && Array.isArray(standingsData)) {
      return standingsData;
    }

    return [];
  } catch (error) {
    console.warn("Direct RapidAPI call failed, trying local proxy fallback /api/standings:", error);
    try {
      // Attempt 2: Secure server-side proxy fallback
      const proxyResponse = await fetch(`/api/standings/${leagueId}`);
      if (!proxyResponse.ok) {
        throw new Error(`Proxy fallback error: status ${proxyResponse.status}`);
      }
      const proxyData = await proxyResponse.json();
      
      const rawStandings = proxyData.standings;
      if (rawStandings) {
        if (Array.isArray(rawStandings)) {
          // If outer structure has group details
          const first = rawStandings[0];
          if (first && Array.isArray(first.rows)) return first.rows;
          if (first && Array.isArray(first.list)) return first.list;
          return rawStandings;
        }
        if (rawStandings.rows && Array.isArray(rawStandings.rows)) return rawStandings.rows;
        if (rawStandings.list && Array.isArray(rawStandings.list)) return rawStandings.list;
        return rawStandings;
      }
    } catch (proxyError) {
      console.error("Local proxy fallback also failed:", proxyError);
    }
    throw error;
  }
};
