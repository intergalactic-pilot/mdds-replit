// MDDS Application Schema
import { z } from "zod";

export type Domain = 'cyber' | 'economy' | 'cognitive' | 'space' | 'joint';
export type CardType = 'asset' | 'permanent' | 'expert';
export type Team = 'NATO' | 'Russia';

export interface CardEffect {
  target: 'self' | 'opponent';   // A = self, B = opponent
  domain: Domain;                // affected domain
  delta: number;                 // signed change to deterrence
}

export interface PermanentMods {
  flatDiscountK: number;         // ALWAYS -50K for listed cards
  appliesToCardIds: string[];    // exact card IDs this permanent discounts
}

export interface Card {
  id: string;                    // from Excel (e.g., J1, CY7, E3, ...)
  name: string;
  domain: Domain;                // inferred from ID prefix
  type: CardType;                // asset | permanent | expert
  baseCostK: number;             // integer K units from Excel
  effects?: CardEffect[];        // only for asset
  permanentMods?: PermanentMods; // only for permanent
  expertInfo?: string;           // only for expert
}

export interface TeamState {
  deterrence: Record<Domain, number>;
  totalDeterrence: number;
  budget: number;
  ownedPermanents: Card[];
  permanentsQueue: Array<{ card: Card; availableTurn: number }>;
  expertsQueue: Array<{ card: Card; availableTurn: number }>;
  cart: Card[];
  recentPurchases: Array<{ cardId: string; purchasedTurn: number }>;
}

export interface GameState {
  turn: number;
  maxTurns: number;
  currentTeam: Team;
  teams: Record<Team, TeamState>;
  phase: 'purchase' | 'commit' | 'advance';
  strategyLog: Array<{
    turn: number;
    team: Team;
    action: string;
    timestamp: Date;
  }>;
}

// Zod schemas for validation
export const cardEffectSchema = z.object({
  target: z.enum(['self', 'opponent']),
  domain: z.enum(['cyber', 'economy', 'cognitive', 'space', 'joint']),
  delta: z.number()
});

export const permanentModsSchema = z.object({
  flatDiscountK: z.number(),
  appliesToCardIds: z.array(z.string())
});

export const cardSchema = z.object({
  id: z.string(),
  name: z.string(),
  domain: z.enum(['cyber', 'economy', 'cognitive', 'space', 'joint']),
  type: z.enum(['asset', 'permanent', 'expert']),
  baseCostK: z.number(),
  effects: z.array(cardEffectSchema).optional(),
  permanentMods: permanentModsSchema.optional(),
  expertInfo: z.string().optional()
});

export type InsertCard = z.infer<typeof cardSchema>;
export type SelectCard = Card;

// Session and statistics schemas
export interface TurnStatistics {
  turn: number;
  natoTotalDeterrence: number;
  russiaTotalDeterrence: number;
  natoDeterrence: Record<Domain, number>;
  russiaDeterrence: Record<Domain, number>;
  timestamp: Date;
}

export interface SessionInfo {
  sessionName: string;
  sessionStarted: boolean;
  participants: Array<{
    name: string;
    country: string;
  }>;
}

export interface SharedSession {
  id: string;                    // unique session identifier for URLs
  sessionInfo: SessionInfo;      // session metadata
  gameState: GameState;          // complete game state
  turnStatistics: TurnStatistics[]; // historical turn data
  createdAt: Date;               // when session was created
  lastUpdated: Date;             // when session was last modified
}

// Zod schemas for validation
export const turnStatisticsSchema = z.object({
  turn: z.number(),
  natoTotalDeterrence: z.number(),
  russiaTotalDeterrence: z.number(),
  natoDeterrence: z.record(z.enum(['cyber', 'economy', 'cognitive', 'space', 'joint']), z.number()),
  russiaDeterrence: z.record(z.enum(['cyber', 'economy', 'cognitive', 'space', 'joint']), z.number()),
  timestamp: z.date()
});

export const sessionInfoSchema = z.object({
  sessionName: z.string(),
  sessionStarted: z.boolean(),
  participants: z.array(z.object({
    name: z.string(),
    country: z.string()
  }))
});

// Team state schema
const teamStateSchema = z.object({
  deterrence: z.object({
    cyber: z.number(),
    economy: z.number(),
    cognitive: z.number(),
    space: z.number(),
    joint: z.number()
  }),
  totalDeterrence: z.number(),
  budget: z.number(),
  ownedPermanents: z.array(cardSchema),
  permanentsQueue: z.array(z.object({
    card: cardSchema,
    availableTurn: z.number()
  })),
  expertsQueue: z.array(z.object({
    card: cardSchema,
    availableTurn: z.number()
  })),
  cart: z.array(cardSchema),
  recentPurchases: z.array(z.object({
    cardId: z.string(),
    purchasedTurn: z.number()
  }))
});

// Game state schema
const gameStateSchema = z.object({
  turn: z.number(),
  maxTurns: z.number(),
  currentTeam: z.enum(['NATO', 'Russia']),
  teams: z.object({
    NATO: teamStateSchema,
    Russia: teamStateSchema
  }),
  phase: z.enum(['purchase', 'commit', 'advance']),
  strategyLog: z.array(z.object({
    turn: z.number(),
    team: z.enum(['NATO', 'Russia']),
    action: z.string(),
    timestamp: z.date()
  }))
});

export const sharedSessionSchema = z.object({
  id: z.string(),
  sessionInfo: sessionInfoSchema,
  gameState: gameStateSchema,
  turnStatistics: z.array(turnStatisticsSchema),
  createdAt: z.date(),
  lastUpdated: z.date()
});

// Insert schemas for API validation
export const createSessionSchema = z.object({
  sessionInfo: sessionInfoSchema,
  gameState: z.object({
    turn: z.number(),
    maxTurns: z.number(),
    currentTeam: z.enum(['NATO', 'Russia']),
    teams: z.object({
      NATO: teamStateSchema,
      Russia: teamStateSchema
    }),
    phase: z.enum(['purchase', 'commit', 'advance']),
    strategyLog: z.array(z.object({
      turn: z.number(),
      team: z.enum(['NATO', 'Russia']),
      action: z.string(),
      timestamp: z.string().transform(str => new Date(str))
    }))
  }),
  turnStatistics: z.array(turnStatisticsSchema.omit({ timestamp: true }).extend({
    timestamp: z.string().transform(str => new Date(str))
  }))
});

export const updateSessionSchema = z.object({
  sessionInfo: sessionInfoSchema,
  gameState: z.object({
    turn: z.number(),
    maxTurns: z.number(),
    currentTeam: z.enum(['NATO', 'Russia']),
    teams: z.object({
      NATO: teamStateSchema,
      Russia: teamStateSchema
    }),
    phase: z.enum(['purchase', 'commit', 'advance']),
    strategyLog: z.array(z.object({
      turn: z.number(),
      team: z.enum(['NATO', 'Russia']),
      action: z.string(),
      timestamp: z.string().transform(str => new Date(str))
    }))
  }),
  turnStatistics: z.array(turnStatisticsSchema.omit({ timestamp: true }).extend({
    timestamp: z.string().transform(str => new Date(str))
  })),
  lastUpdated: z.string().transform(str => new Date(str))
});

export type InsertSharedSession = z.infer<typeof sharedSessionSchema>;
export type SelectSharedSession = SharedSession;
export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;