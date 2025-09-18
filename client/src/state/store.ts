import { create } from 'zustand';
import { GameState, Team, Card, TeamState } from '@shared/schema';
import { getInitialDeterrence, calculateTotalDeterrence } from '../logic/scoring';
import { commitPurchases, advanceTurn } from '../logic/turnEngine';
import { sanitizeText } from '../logic/guards';

interface MDDSStore extends GameState {
  // Actions
  addToCart: (team: Team, card: Card) => void;
  removeFromCart: (team: Team, cardId: string) => void;
  commitTeamPurchases: (team: Team) => void;
  advanceGameTurn: () => void;
  resetStrategy: () => void;
  concludeStrategy: (team: Team) => void;
  
  // UI State
  selectedCard: Card | null;
  setSelectedCard: (card: Card | null) => void;
  
  // Persistence
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => boolean;
  exportState: () => string;
  importState: (jsonState: string) => boolean;
}

const createInitialTeamState = (): TeamState => ({
  deterrence: getInitialDeterrence(),
  totalDeterrence: 500, // 100 per domain * 5 domains
  budget: 1000, // Turn 1 will be restricted to 200K per domain
  ownedPermanents: [],
  expertsQueue: [],
  cart: []
});

const createInitialState = (): Omit<GameState, 'teams'> & { teams: Record<Team, TeamState> } => ({
  turn: 1,
  maxTurns: 8,
  currentTeam: 'NATO',
  teams: {
    NATO: createInitialTeamState(),
    Russia: createInitialTeamState()
  },
  phase: 'purchase',
  strategyLog: [{
    turn: 1,
    team: 'NATO',
    action: sanitizeText('Strategy initiated - Turn 1 begins'),
    timestamp: new Date()
  }]
});

export const useMDDSStore = create<MDDSStore>((set, get) => ({
  ...createInitialState(),
  selectedCard: null,

  setSelectedCard: (card) => set({ selectedCard: card }),

  addToCart: (team, card) => {
    set((state) => {
      const newTeams = { ...state.teams };
      newTeams[team] = {
        ...newTeams[team],
        cart: [...newTeams[team].cart, card]
      };
      return { teams: newTeams };
    });
  },

  removeFromCart: (team, cardId) => {
    set((state) => {
      const newTeams = { ...state.teams };
      newTeams[team] = {
        ...newTeams[team],
        cart: newTeams[team].cart.filter(card => card.id !== cardId)
      };
      return { teams: newTeams };
    });
  },

  commitTeamPurchases: (team) => {
    set((state) => {
      const newState = commitPurchases(state, team);
      return { ...newState };
    });
  },

  advanceGameTurn: () => {
    set((state) => {
      const newState = advanceTurn(state);
      return { ...newState };
    });
  },

  resetStrategy: () => {
    set(createInitialState());
  },

  concludeStrategy: (team) => {
    set((state) => ({
      ...state,
      strategyLog: [
        ...state.strategyLog,
        {
          turn: state.turn,
          team,
          action: sanitizeText(`Strategy concluded by ${team}`),
          timestamp: new Date()
        }
      ]
    }));
  },

  saveToLocalStorage: () => {
    const state = get();
    const saveData = {
      turn: state.turn,
      maxTurns: state.maxTurns,
      currentTeam: state.currentTeam,
      teams: state.teams,
      phase: state.phase,
      strategyLog: state.strategyLog
    };
    localStorage.setItem('mdds-strategy', JSON.stringify(saveData));
  },

  loadFromLocalStorage: () => {
    try {
      const saved = localStorage.getItem('mdds-strategy');
      if (saved) {
        const data = JSON.parse(saved);
        set(data);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  exportState: () => {
    const state = get();
    const exportData = {
      turn: state.turn,
      maxTurns: state.maxTurns,
      currentTeam: state.currentTeam,
      teams: state.teams,
      phase: state.phase,
      strategyLog: state.strategyLog,
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(exportData, null, 2);
  },

  importState: (jsonState) => {
    try {
      const data = JSON.parse(jsonState);
      set({
        turn: data.turn,
        maxTurns: data.maxTurns,
        currentTeam: data.currentTeam,
        teams: data.teams,
        phase: data.phase,
        strategyLog: data.strategyLog
      });
      return true;
    } catch {
      return false;
    }
  }
}));