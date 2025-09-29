// MDDS Application Schema
import { z } from "zod";
import { pgTable, varchar, jsonb, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

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

// Database Tables
export const gameSessions = pgTable("game_sessions", {
  sessionName: varchar("session_name", { length: 255 }).primaryKey(),
  gameState: jsonb("game_state").$type<GameState>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

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

// Game Session schemas
export const insertGameSessionSchema = createInsertSchema(gameSessions);
export const selectGameSessionSchema = z.object({
  sessionName: z.string(),
  gameState: z.any(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type InsertGameSession = z.infer<typeof insertGameSessionSchema>;
export type SelectGameSession = z.infer<typeof selectGameSessionSchema>;