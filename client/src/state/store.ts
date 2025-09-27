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
  sessionStarted: boolean;
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
  startSession: () => void;
  updateParticipant: (index: number, field: 'name' | 'country', value: string) => void;
  addParticipant: () => void;
  removeParticipant: (index: number) => void;
  
  // UI State
  selectedCard: Card | null;
  setSelectedCard: (card: Card | null) => void;
  
  // Persistence
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => boolean;
  exportState: () => string;
  importState: (jsonState: string) => boolean;
  
  // Session sharing
  createShareableSession: () => any;
  shareSession: () => Promise<string | null>;
  shareStatistics: () => Promise<string | null>;
  loadSharedSession: (sessionData: any) => void;
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

const createInitialState = (): Omit<GameState, 'teams'> & { teams: Record<Team, TeamState>; turnStatistics: TurnStatistics[]; sessionInfo: SessionInfo } => {
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
      sessionStarted: false,
      participants: [{ name: '', country: '' }, { name: '', country: '' }]
    },
    turnStatistics: [{
      turn: 1,
      natoTotalDeterrence: natoTeam.totalDeterrence,
      russiaTotalDeterrence: russiaTeam.totalDeterrence,
      natoDeterrence: { ...natoTeam.deterrence },
      russiaDeterrence: { ...russiaTeam.deterrence },
      timestamp: new Date()
    }]
  };
};

export const useMDDSStore = create<MDDSStore>((set, get) => ({
  ...createInitialState(),
  selectedCard: null,

  setSelectedCard: (card) => set({ selectedCard: card }),

  setCurrentTeam: (team) => set({ currentTeam: team }),

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

  // Session management functions
  updateSessionName: (name: string) => {
    set((state) => ({
      sessionInfo: {
        ...state.sessionInfo,
        sessionName: name
      }
    }));
  },

  startSession: () => {
    set((state) => ({
      sessionInfo: {
        ...state.sessionInfo,
        sessionStarted: true
      }
    }));
    // Auto-save when session is started
    const saveToLocalStorage = get().saveToLocalStorage;
    saveToLocalStorage();
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
  },

  addParticipant: () => {
    set((state) => ({
      sessionInfo: {
        ...state.sessionInfo,
        participants: [...state.sessionInfo.participants, { name: '', country: '' }]
      }
    }));
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
      sessionInfo: state.sessionInfo
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
            sessionStarted: data.sessionInfo.sessionStarted || false,
            participants: data.sessionInfo.participants && data.sessionInfo.participants.length > 0 
              ? data.sessionInfo.participants
              : currentState.sessionInfo.participants
          } : currentState.sessionInfo
        });
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
          sessionStarted: data.sessionInfo.sessionStarted || false,
          participants: data.sessionInfo.participants && data.sessionInfo.participants.length > 0 
            ? data.sessionInfo.participants
            : currentState.sessionInfo.participants
        } : currentState.sessionInfo
      });
      return true;
    } catch {
      return false;
    }
  },

  createShareableSession: () => {
    const state = get();
    return {
      sessionInfo: state.sessionInfo,
      gameState: {
        turn: state.turn,
        maxTurns: state.maxTurns,
        currentTeam: state.currentTeam,
        teams: state.teams,
        phase: state.phase,
        strategyLog: state.strategyLog
      },
      turnStatistics: state.turnStatistics
    };
  },

  shareSession: async () => {
    try {
      const state = get();
      const sessionData = {
        sessionInfo: state.sessionInfo,
        gameState: {
          turn: state.turn,
          maxTurns: state.maxTurns,
          currentTeam: state.currentTeam,
          teams: state.teams,
          phase: state.phase,
          strategyLog: state.strategyLog
        },
        turnStatistics: state.turnStatistics
      };

      // Create the session
      const sessionResponse = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      });

      if (!sessionResponse.ok) {
        return null;
      }

      const session = await sessionResponse.json();
      const fullUrl = `${window.location.origin}/session/${session.id}`;

      // Shorten the URL
      const shortenResponse = await fetch('/api/shorten-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: fullUrl }),
      });

      if (shortenResponse.ok) {
        const shortUrlData = await shortenResponse.json();
        return shortUrlData.shortUrl;
      } else {
        // If URL shortening fails, return the original full URL
        console.warn('URL shortening failed, using full URL');
        return fullUrl;
      }
    } catch (error) {
      console.error('Failed to share session:', error);
      return null;
    }
  },

  shareStatistics: async () => {
    try {
      const state = get();
      const sessionData = {
        sessionInfo: state.sessionInfo,
        gameState: {
          turn: state.turn,
          maxTurns: state.maxTurns,
          currentTeam: state.currentTeam,
          teams: state.teams,
          phase: state.phase,
          strategyLog: state.strategyLog
        },
        turnStatistics: state.turnStatistics
      };

      // Create the session
      const sessionResponse = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      });

      if (!sessionResponse.ok) {
        return null;
      }

      const session = await sessionResponse.json();
      const fullUrl = `${window.location.origin}/statistics/${session.id}`;

      // Shorten the URL
      const shortenResponse = await fetch('/api/shorten-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: fullUrl }),
      });

      if (shortenResponse.ok) {
        const shortUrlData = await shortenResponse.json();
        return shortUrlData.shortUrl;
      } else {
        // If URL shortening fails, return the original full URL
        console.warn('URL shortening failed, using full URL');
        return fullUrl;
      }
    } catch (error) {
      console.error('Failed to share statistics:', error);
      return null;
    }
  },

  loadSharedSession: (sessionData: any) => {
    try {
      const gameState = sessionData.gameState;
      // Migrate older save states that don't have permanentsQueue
      if (gameState.teams) {
        Object.keys(gameState.teams).forEach(team => {
          if (!gameState.teams[team].permanentsQueue) {
            gameState.teams[team].permanentsQueue = [];
          }
        });
      }
      const currentState = get();
      set({
        turn: gameState.turn,
        maxTurns: gameState.maxTurns,
        currentTeam: gameState.currentTeam,
        teams: gameState.teams,
        phase: gameState.phase,
        strategyLog: gameState.strategyLog,
        turnStatistics: sessionData.turnStatistics || [],
        sessionInfo: sessionData.sessionInfo ? {
          sessionName: sessionData.sessionInfo.sessionName || '',
          sessionStarted: true, // Mark as started when loading shared session
          participants: sessionData.sessionInfo.participants && sessionData.sessionInfo.participants.length > 0 
            ? sessionData.sessionInfo.participants
            : currentState.sessionInfo.participants
        } : currentState.sessionInfo
      });
      return true;
    } catch (error) {
      console.error('Failed to load shared session:', error);
      return false;
    }
  }
}));