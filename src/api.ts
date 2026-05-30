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

export const getLeagueStandings = async (leagueId: number, tab: "Geral" | "Casa" | "Fora" = "Geral") => {
  try {
    // 1. Tenda buscar pelo proxy local primeiro
    const proxyResponse = await fetch(`/api/standings/${leagueId}?tab=${tab}`);
    let rawList: any[] = [];
    
    if (proxyResponse.ok) {
      const proxyData = await proxyResponse.json();
      // Ler de response.standing conforme especificado
      if (proxyData.response?.standing && Array.isArray(proxyData.response.standing)) {
        rawList = proxyData.response.standing;
      } else if (proxyData.standings && Array.isArray(proxyData.standings)) {
        rawList = proxyData.standings;
      } else if (proxyData.response?.list && Array.isArray(proxyData.response.list)) {
        rawList = proxyData.response.list;
      }
    }
    
    if (!rawList || rawList.length === 0) {
      // 2. Direct call alternate fallback
      let path = "football-get-standing-all";
      if (tab === "Casa") path = "football-get-standing-home";
      if (tab === "Fora") path = "football-get-standing-away";
      
      const response = await fetch(`https://free-api-live-football-data.p.rapidapi.com/${path}?leagueid=${leagueId}`, {
        method: "GET",
        headers: {
          "x-rapidapi-key": "9b9bc4cde1mshac85de8628281aap1fe278jsna8a022da00be",
          "x-rapidapi-host": "free-api-live-football-data.p.rapidapi.com"
        }
      });
      if (response.ok) {
        const directData = await response.json();
        if (directData.response?.standing && Array.isArray(directData.response.standing)) {
          rawList = directData.response.standing;
        } else if (directData.response?.list && Array.isArray(directData.response.list)) {
          rawList = directData.response.list;
        }
      }
    }

    if (rawList && Array.isArray(rawList)) {
      return rawList.map((team: any, idx: number) => {
        const tId = team.id ?? team.teamId ?? (50000 + idx);
        const position = team.idx ?? team.position ?? team.pos ?? (idx + 1);
        const name = team.name ?? team.teamName ?? "";
        return {
          ...team,
          id: tId,
          teamId: tId,
          idx: position,
          pos: position,
          position: position,
          name: name,
          teamName: name,
          played: team.played ?? team.matches ?? ((team.wins ?? 0) + (team.draws ?? 0) + (team.losses ?? 0)),
          wins: team.wins ?? team.win ?? 0,
          draws: team.draws ?? team.draw ?? 0,
          losses: team.losses ?? team.lose ?? team.loss ?? 0,
          goalConDiff: team.goalConDiff ?? team.gd ?? team.goalDifference ?? 0,
          gd: team.goalConDiff ?? team.gd ?? team.goalDifference ?? 0,
          pts: team.pts ?? team.points ?? 0,
          points: team.pts ?? team.points ?? 0,
          logo: team.logo ?? `https://images.fotmob.com/image_resources/logo/teamlogo/${tId}.png`,
          scoresStr: team.scoresStr ?? `${team.gf ?? team.goalsFor ?? 0}-${team.ga ?? team.goalsAgainst ?? 0}`
        };
      });
    }

    return [];
  } catch (error) {
    console.error("Erro ao buscar classificação:", error);
    return [];
  }
};
