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
    let endpoint = 'football-get-standing-all';
    if (tab === 'Casa') endpoint = 'football-get-standing-home';
    if (tab === 'Fora') endpoint = 'football-get-standing-away';

    const url = `https://free-api-live-football-data.p.rapidapi.com/${endpoint}?leagueid=${leagueId}`;
    
    // 1. Tenta buscar pelo proxy local primeiro
    const proxyResponse = await fetch(`/api/standings/${leagueId}?tab=${tab}`);
    let data: any = null;
    
    if (proxyResponse.ok) {
      data = await proxyResponse.json();
    } else {
      // 2. Direct call alternate fallback
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "x-rapidapi-key": "9b9bc4cde1mshac85de8628281aap1fe278jsna8a022da00be",
          "x-rapidapi-host": "free-api-live-football-data.p.rapidapi.com"
        },
        cache: "no-store"
      });
      if (response.ok) {
        data = await response.json();
      }
    }

    if (data?.response?.standing && Array.isArray(data.response.standing)) {
      return data.response.standing.map((team: any, idx: number) => {
        const tId = team.id ?? (50000 + idx);
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
          logo: team.id ? `https://images.fotmob.com/image_resources/logo/teamlogo/${team.id}.png` : '/fallback-shield.png',
          scoresStr: team.scoresStr ?? `${team.gf ?? team.goalsFor ?? 0}-${team.ga ?? team.goalsAgainst ?? 0}`
        };
      });
    } else {
      // Se tiver outros caminhos (por ex: standingsList diretamente) tentamos mapear também
      const otherList = data?.standings || data?.response?.list;
      if (otherList && Array.isArray(otherList)) {
        return otherList.map((team: any, idx: number) => {
          const tId = team.id ?? (50000 + idx);
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
            logo: team.id ? `https://images.fotmob.com/image_resources/logo/teamlogo/${team.id}.png` : '/fallback-shield.png',
            scoresStr: team.scoresStr ?? `${team.gf ?? team.goalsFor ?? 0}-${team.ga ?? team.goalsAgainst ?? 0}`
          };
        });
      }
    }

    return [];
  } catch (error) {
    console.error("Erro ao buscar classificação:", error);
    return [];
  }
};

export const getTeamDetails = async (teamId: number) => {
  try {
    const url = `https://free-api-live-football-data.p.rapidapi.com/football-league-team?teamid=${teamId}`;
    let data: any = null;

    // 1. Try to fetch from local server proxy first
    const proxyResponse = await fetch(`/api/team/${teamId}`);
    if (proxyResponse.ok) {
      const resJson = await proxyResponse.json();
      data = resJson.data;
    } else {
      // 2. Direct call as a fallback
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "x-rapidapi-key": "9b9bc4cde1mshac85de8628281aap1fe278jsna8a022da00be",
          "x-rapidapi-host": "free-api-live-football-data.p.rapidapi.com"
        },
        cache: "no-store"
      });
      if (response.ok) {
        data = await response.json();
      }
    }
    return data;
  } catch (error) {
    console.error("Erro ao buscar detalhes do time:", error);
    return null;
  }
};

export const getTeamSquad = async (teamId: number) => {
  try {
    const url = `https://free-api-live-football-data.p.rapidapi.com/football-team-player?teamid=${teamId}`;
    let data: any = null;

    // 1. Try to fetch from local server proxy first
    const proxyResponse = await fetch(`/api/team-squad/${teamId}`);
    if (proxyResponse.ok) {
      const resJson = await proxyResponse.json();
      data = resJson.data;
    } else {
      // 2. Direct call as a fallback
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "x-rapidapi-key": "9b9bc4cde1mshac85de8628281aap1fe278jsna8a022da00be",
          "x-rapidapi-host": "free-api-live-football-data.p.rapidapi.com"
        },
        cache: "no-store"
      });
      if (response.ok) {
        data = await response.json();
      }
    }
    return data;
  } catch (error) {
    console.error("Erro ao buscar elenco do time:", error);
    return null;
  }
};
