import { create } from 'zustand';
import { GameState, Team, Card, TeamState, Domain } from '@shared/schema';
import { getInitialDeterrence, calculateTotalDeterrence } from '../logic/scoring';
import { commitPurchases, advanceTurn } from '../logic/turnEngine';
import { sanitizeText } from '../logic/guards';

// Statistics tracking interface
interface TurnStatistics {
  turn: number;
  natoTotalDeterrence: number;
  russiaTotalDeterrence: number;
  natoDeterrence: Record<Domain, number>;
  russiaDeterrence: Record<Domain, number>;
  timestamp: Date;
}

// Session information interface
interface SessionInfo {
  sessionName: string;
  committeeNumber: number | string | null;
  participants: Array<{
    name: string;
    country: string;
  }>;
}

interface MDDSStore extends GameState {
  // Statistics tracking
  turnStatistics: TurnStatistics[];
  
  // Session information
  sessionInfo: SessionInfo;
  
  // Database session tracking
  activeDatabaseSession: string | null;
  
  // UI State
  showLoginScreen: boolean;
  
  // Actions
  addToCart: (team: Team, card: Card) => void;
  removeFromCart: (team: Team, cardId: string) => void;
  commitTeamPurchases: (team: Team) => void;
  advanceGameTurn: () => void;
  resetStrategy: () => void;
  concludeStrategy: (team: Team) => void;
  setCurrentTeam: (team: Team) => void;
  
  // Session management
  updateSessionName: (name: string) => void;
  updateCommitteeNumber: (committeeNumber: number | string | null) => void;
  updateParticipant: (index: number, field: 'name' | 'country', value: string) => void;
  addParticipant: () => void;
  removeParticipant: (index: number) => void;
  
  // Database session management
  setActiveDatabaseSession: (sessionName: string | null) => void;
  syncToDatabase: () => Promise<void>;
  
  // UI State
  selectedCard: Card | null;
  setSelectedCard: (card: Card | null) => void;
  setShowLoginScreen: (show: boolean) => void;
  
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
  permanentsQueue: [],
  expertsQueue: [],
  cart: [],
  recentPurchases: []
});

const createInitialState = (): Omit<GameState, 'teams'> & { teams: Record<Team, TeamState>; turnStatistics: TurnStatistics[]; sessionInfo: SessionInfo; activeDatabaseSession: string | null } => {
  const natoTeam = createInitialTeamState();
  const russiaTeam = createInitialTeamState();
  
  return {
    turn: 1,
    maxTurns: 7,
    currentTeam: 'NATO',
    teams: {
      NATO: natoTeam,
      Russia: russiaTeam
    },
    phase: 'purchase',
    strategyLog: [{
      turn: 1,
      team: 'NATO',
      action: sanitizeText('Strategy initiated - Turn 1 begins'),
      timestamp: new Date()
    }],
    sessionInfo: {
      sessionName: '',
      committeeNumber: null,
      participants: [{ name: '', country: '' }, { name: '', country: '' }]
    },
    turnStatistics: [{
      turn: 1,
      natoTotalDeterrence: natoTeam.totalDeterrence,
      russiaTotalDeterrence: russiaTeam.totalDeterrence,
      natoDeterrence: { ...natoTeam.deterrence },
      russiaDeterrence: { ...russiaTeam.deterrence },
      timestamp: new Date()
    }],
    activeDatabaseSession: null
  };
};

export const useMDDSStore = create<MDDSStore>((set, get) => ({
  ...createInitialState(),
  selectedCard: null,
  activeDatabaseSession: null,
  showLoginScreen: true,

  setSelectedCard: (card) => set({ selectedCard: card }),
  
  setShowLoginScreen: (show) => set({ showLoginScreen: show }),

  setCurrentTeam: (team) => {
    set({ currentTeam: team });
    // Sync to database after state change
    setTimeout(() => get().syncToDatabase(), 0);
  },

  addToCart: (team, card) => {
    set((state) => {
      const newTeams = { ...state.teams };
      newTeams[team] = {
        ...newTeams[team],
        cart: [...newTeams[team].cart, card]
      };
      return { teams: newTeams };
    });
    // Sync to database after state change
    setTimeout(() => get().syncToDatabase(), 0);
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
    // Sync to database after state change
    setTimeout(() => get().syncToDatabase(), 0);
  },

  commitTeamPurchases: (team) => {
    set((state) => {
      const newState = commitPurchases(state, team);
      return { ...newState };
    });
    // Sync to database after state change
    setTimeout(() => get().syncToDatabase(), 0);
  },

  advanceGameTurn: () => {
    set((state) => {
      const newState = advanceTurn(state);
      
      // Save deterrence statistics after turn advance
      const newStatistics: TurnStatistics = {
        turn: newState.turn,
        natoTotalDeterrence: newState.teams.NATO.totalDeterrence,
        russiaTotalDeterrence: newState.teams.Russia.totalDeterrence,
        natoDeterrence: { ...newState.teams.NATO.deterrence },
        russiaDeterrence: { ...newState.teams.Russia.deterrence },
        timestamp: new Date()
      };
      
      return { 
        ...newState, 
        turnStatistics: [...state.turnStatistics, newStatistics]
      };
    });
    // Sync to database after state change
    setTimeout(() => get().syncToDatabase(), 0);
  },

  resetStrategy: () => {
    set({ ...createInitialState(), showLoginScreen: true });
    // Clear active database session on reset
    setTimeout(() => {
      const state = get();
      state.setActiveDatabaseSession(null);
      // Save to localStorage to persist the reset state including showLoginScreen: true
      state.saveToLocalStorage();
    }, 0);
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
    // Sync to database after state change
    setTimeout(() => get().syncToDatabase(), 0);
  },

  // Session management functions
  updateSessionName: (name: string) => {
    set((state) => ({
      sessionInfo: {
        ...state.sessionInfo,
        sessionName: name
      }
    }));
    // Sync to database after state change
    setTimeout(() => get().syncToDatabase(), 0);
  },

  updateCommitteeNumber: (committeeNumber: number | string | null) => {
    set((state) => ({
      sessionInfo: {
        ...state.sessionInfo,
        committeeNumber
      }
    }));
    // Sync to database after state change
    setTimeout(() => get().syncToDatabase(), 0);
  },

  updateParticipant: (index: number, field: 'name' | 'country', value: string) => {
    set((state) => ({
      sessionInfo: {
        ...state.sessionInfo,
        participants: state.sessionInfo.participants.map((p, i) => 
          i === index ? { ...p, [field]: value } : p
        )
      }
    }));
    // Sync to database after state change
    setTimeout(() => get().syncToDatabase(), 0);
  },

  addParticipant: () => {
    set((state) => ({
      sessionInfo: {
        ...state.sessionInfo,
        participants: [...state.sessionInfo.participants, { name: '', country: '' }]
      }
    }));
    // Sync to database after state change
    setTimeout(() => get().syncToDatabase(), 0);
  },

  removeParticipant: (index: number) => {
    set((state) => ({
      sessionInfo: {
        ...state.sessionInfo,
        participants: state.sessionInfo.participants.length > 2 
          ? state.sessionInfo.participants.filter((_, i) => i !== index)
          : state.sessionInfo.participants
      }
    }));
    // Sync to database after state change
    setTimeout(() => get().syncToDatabase(), 0);
  },

  setActiveDatabaseSession: (sessionName: string | null) => {
    set({ activeDatabaseSession: sessionName });
  },

  syncToDatabase: async () => {
    const state = get();
    if (!state.activeDatabaseSession) return;

    try {
      const sessionData = {
        sessionName: state.activeDatabaseSession,
        gameState: {
          turn: state.turn,
          maxTurns: state.maxTurns,
          currentTeam: state.currentTeam,
          teams: state.teams,
          phase: state.phase,
          strategyLog: state.strategyLog
        },
        sessionInfo: state.sessionInfo,
        turnStatistics: state.turnStatistics,
        lastUpdated: new Date().toISOString()
      };

      const response = await fetch(`/api/sessions/${state.activeDatabaseSession}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      });

      if (!response.ok) {
        console.error('Failed to sync to database:', response.statusText);
      }
    } catch (error) {
      console.error('Error syncing to database:', error);
    }
  },

  saveToLocalStorage: () => {
    const state = get();
    const saveData = {
      turn: state.turn,
      maxTurns: state.maxTurns,
      currentTeam: state.currentTeam,
      teams: state.teams,
      phase: state.phase,
      strategyLog: state.strategyLog,
      turnStatistics: state.turnStatistics,
      sessionInfo: state.sessionInfo,
      showLoginScreen: state.showLoginScreen
    };
    localStorage.setItem('mdds-strategy', JSON.stringify(saveData));
  },

  loadFromLocalStorage: () => {
    try {
      const saved = localStorage.getItem('mdds-strategy');
      if (saved) {
        const data = JSON.parse(saved);
        // Migrate older save states that don't have permanentsQueue
        if (data.teams) {
          Object.keys(data.teams).forEach(team => {
            if (!data.teams[team].permanentsQueue) {
              data.teams[team].permanentsQueue = [];
            }
          });
        }
        const currentState = get();
        set({
          ...data,
          sessionInfo: data.sessionInfo ? {
            sessionName: data.sessionInfo.sessionName || '',
            committeeNumber: data.sessionInfo.committeeNumber ?? null,
            participants: data.sessionInfo.participants && data.sessionInfo.participants.length > 0 
              ? data.sessionInfo.participants
              : currentState.sessionInfo.participants
          } : currentState.sessionInfo,
          showLoginScreen: data.showLoginScreen !== undefined ? data.showLoginScreen : false // Use saved value or default to false if there's saved data
        });
        return true;
      }
      // Show login screen if no saved data
      set({ showLoginScreen: true });
      return false;
    } catch {
      set({ showLoginScreen: true });
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
      turnStatistics: state.turnStatistics,
      sessionInfo: state.sessionInfo,
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(exportData, null, 2);
  },

  importState: (jsonState) => {
    try {
      const data = JSON.parse(jsonState);
      // Migrate older save states that don't have permanentsQueue
      if (data.teams) {
        Object.keys(data.teams).forEach(team => {
          if (!data.teams[team].permanentsQueue) {
            data.teams[team].permanentsQueue = [];
          }
        });
      }
      const currentState = get();
      set({
        turn: data.turn,
        maxTurns: data.maxTurns,
        currentTeam: data.currentTeam,
        teams: data.teams,
        phase: data.phase,
        strategyLog: data.strategyLog,
        turnStatistics: data.turnStatistics || [],
        sessionInfo: data.sessionInfo ? {
          sessionName: data.sessionInfo.sessionName || '',
          committeeNumber: data.sessionInfo.committeeNumber ?? null,
          participants: data.sessionInfo.participants && data.sessionInfo.participants.length > 0 
            ? data.sessionInfo.participants
            : currentState.sessionInfo.participants
        } : currentState.sessionInfo
      });
      return true;
    } catch {
      return false;
    }
  }
}));