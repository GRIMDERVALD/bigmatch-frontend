import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types basés sur votre backend FastAPI
export interface Tournament {
  id: string;
  name: string;
  location: string;
  date: string;
  organizer: string;
  share_link: string;
  status: 'setup' | 'pools' | 'active' | 'finished';
  settings: {
    teams_per_pool: number;
    matches_per_team: number;
    score_limit: number;
    time_limit?: number;
  };
  total_players?: number;
  total_teams?: number;
  total_matches?: number;
  completed_matches?: number;
}

export interface Player {
  id: string;
  tournament_id: string;
  name: string;
  contact?: string;
  team_id?: string;
}

export interface Team {
  id: string;
  tournament_id: string;
  pool_id: number;
  name: string;
  players?: Player[];
}

export interface Match {
  id: string;
  tournament_id: string;
  pool_id: number;
  team_a_id: string;
  team_b_id: string;
  score_a: number;
  score_b: number;
  status: 'pending' | 'active' | 'finished';
  winner_id?: string;
  start_time?: string;
  end_time?: string;
  team_a?: Team;
  team_b?: Team;
  winner?: Team;
}

// API Functions (adaptées à vos routes exactes)
export const tournamentApi = {
  create: async (data: {
    name: string;
    location: string;
    date: string;
    organizer: string;
    settings?: any;
  }): Promise<Tournament> => {
    const response = await api.post('/tournaments/', data);
    return response.data;
  },

  getById: async (id: string): Promise<Tournament> => {
    const response = await api.get(`/tournaments/${id}`);
    return response.data;
  },

  getByShareLink: async (shareLink: string): Promise<Tournament> => {
    const response = await api.get(`/tournaments/share/${shareLink}`);
    return response.data;
  },

  createPools: async (tournamentId: string) => {
    const response = await api.post(`/tournaments/${tournamentId}/create-pools`);
    return response.data;
  },

  start: async (tournamentId: string) => {
    const response = await api.post(`/tournaments/${tournamentId}/start`);
    return response.data;
  },
};

export const playerApi = {
  add: async (tournamentId: string, data: { name: string; contact?: string }): Promise<Player> => {
    const response = await api.post(`/players/tournaments/${tournamentId}/players`, data);
    return response.data;
  },

  getAll: async (tournamentId: string): Promise<Player[]> => {
    const response = await api.get(`/players/tournaments/${tournamentId}/players`);
    return response.data;
  },

  remove: async (playerId: string) => {
    const response = await api.delete(`/players/${playerId}`);
    return response.data;
  },
};

export const teamApi = {
  getAll: async (tournamentId: string): Promise<Team[]> => {
    const response = await api.get(`/teams/tournaments/${tournamentId}/teams`);
    return response.data;
  },
};

export const matchApi = {
  getAll: async (tournamentId: string): Promise<Match[]> => {
    const response = await api.get(`/matches/tournaments/${tournamentId}/matches`);
    return response.data;
  },

  updateScore: async (matchId: string, scoreA: number, scoreB: number): Promise<Match> => {
    const response = await api.put(`/matches/${matchId}`, {
      score_a: scoreA,
      score_b: scoreB,
    });
    return response.data;
  },

  start: async (matchId: string) => {
    const response = await api.post(`/matches/${matchId}/start`);
    return response.data;
  },

  finish: async (matchId: string, scoreA: number, scoreB: number) => {
    const response = await api.post(`/matches/${matchId}/finish?score_a=${scoreA}&score_b=${scoreB}`);
    return response.data;
  },
};

export default api;