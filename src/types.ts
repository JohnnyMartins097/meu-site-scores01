export interface Team {
  id: number;
  name: string;
  logo: string;
  winner?: boolean | null;
}

export interface League {
  id: number;
  name: string;
  country: string;
  logo: string;
  flag: string | null;
  season?: number;
  round?: string;
}

export interface MatchPeriod {
  first: number | null;
  second: number | null;
}

export interface Venue {
  id: number | null;
  name: string | null;
  city: string | null;
}

export interface MatchStatus {
  long: string;
  short: string;
  elapsed: number;
}

export interface Fixture {
  id: number;
  referee: string | null;
  timezone: string;
  date: string;
  timestamp: number;
  periods: MatchPeriod;
  venue: Venue;
  status: MatchStatus;
}

export interface GoalScore {
  home: number | null;
  away: number | null;
}

export interface ScoreDetail {
  halftime: GoalScore;
  fulltime: GoalScore;
  extratime: GoalScore;
  penalty: GoalScore;
}

export interface MatchEvent {
  time: {
    elapsed: number;
    extra?: number | null;
  };
  team: {
    id: number;
    name: string;
    logo?: string;
  };
  player: {
    id?: number | null;
    name: string;
  };
  assist?: {
    id?: number | null;
    name: string | null;
  };
  type: string; // "Goal", "Card", "subst", "Var"
  detail: string; // e.g., "Normal Goal", "Yellow Card", "Substitution 1", etc.
  comments?: string | null;
}

export interface StatValue {
  type: string;
  value: string | number | null;
}

export interface TeamStatistics {
  team: {
    id: number;
    name: string;
    logo: string;
  };
  statistics: StatValue[];
}

export interface LineupPlayer {
  player: {
    id?: number | null;
    name: string;
    number: number;
    pos: string;
    grid?: string | null;
  };
}

export interface TeamLineup {
  team: {
    id: number;
    name: string;
    logo: string;
    colors?: any;
  };
  coach: {
    id?: number | null;
    name: string;
  };
  formation: string;
  startXI: LineupPlayer[];
  substitutes: LineupPlayer[];
}

export interface Match {
  fixture: Fixture;
  league: League;
  teams: {
    home: Team;
    away: Team;
  };
  goals: GoalScore;
  score: ScoreDetail;
  // Included directly in full-featured mode
  events?: MatchEvent[];
  statistics?: TeamStatistics[];
  lineups?: TeamLineup[];
  broadcast?: string;
  detailsLoaded?: boolean;
}
