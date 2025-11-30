import { type InsertGameSession, type SelectGameSession, GameState, gameSessions } from "@shared/schema";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";

// Database setup (optional - falls back to in-memory if not available)
const databaseUrl = process.env.DATABASE_URL;
let sql: ReturnType<typeof neon> | null = null;
let db: ReturnType<typeof drizzle> | null = null;

if (databaseUrl) {
  sql = neon(databaseUrl);
  db = drizzle(sql);
  console.log("Database connection initialized");
} else {
  console.warn("DATABASE_URL not found. Using in-memory storage.");
}

// Storage interface for MDDS game sessions
export interface IStorage {
  getGameSession(sessionName: string): Promise<SelectGameSession | undefined>;
  createGameSession(sessionName: string, gameState: GameState, sessionInfo?: any, turnStatistics?: any, lastUpdated?: string): Promise<SelectGameSession>;
  updateGameSession(sessionName: string, gameState: GameState, sessionInfo?: any, turnStatistics?: any, finalReport?: string, lastUpdated?: string): Promise<SelectGameSession>;
  getAllGameSessions(): Promise<SelectGameSession[]>;
  deleteGameSession(sessionName: string): Promise<boolean>;
}

export class DrizzleStorage implements IStorage {
  async getGameSession(sessionName: string): Promise<SelectGameSession | undefined> {
    if (!db) {
      throw new Error("Database not initialized");
    }
    try {
      const result = await db
        .select()
        .from(gameSessions)
        .where(eq(gameSessions.sessionName, sessionName))
        .limit(1);
      
      return result[0] || undefined;
    } catch (error) {
      console.error("Error getting game session:", error);
      throw error;
    }
  }

  async createGameSession(sessionName: string, gameState: GameState, sessionInfo?: any, turnStatistics?: any, lastUpdated?: string): Promise<SelectGameSession> {
    if (!db) {
      throw new Error("Database not initialized");
    }
    try {
      const result = await db
        .insert(gameSessions)
        .values({
          sessionName,
          gameState,
          sessionInfo,
          turnStatistics,
          lastUpdated,
        })
        .returning();
      
      return result[0];
    } catch (error) {
      console.error("Error creating game session:", error);
      throw error;
    }
  }

  async updateGameSession(sessionName: string, gameState: GameState, sessionInfo?: any, turnStatistics?: any, finalReport?: string, lastUpdated?: string): Promise<SelectGameSession> {
    if (!db) {
      throw new Error("Database not initialized");
    }
    try {
      const result = await db
        .update(gameSessions)
        .set({
          gameState,
          sessionInfo,
          turnStatistics,
          finalReport,
          lastUpdated,
          updatedAt: new Date(),
        })
        .where(eq(gameSessions.sessionName, sessionName))
        .returning();
      
      if (result.length === 0) {
        throw new Error(`Session ${sessionName} not found`);
      }
      
      return result[0];
    } catch (error) {
      console.error("Error updating game session:", error);
      throw error;
    }
  }

  async getAllGameSessions(): Promise<SelectGameSession[]> {
    if (!db) {
      throw new Error("Database not initialized");
    }
    try {
      return await db.select().from(gameSessions);
    } catch (error) {
      console.error("Error getting all game sessions:", error);
      throw error;
    }
  }

  async deleteGameSession(sessionName: string): Promise<boolean> {
    if (!db) {
      throw new Error("Database not initialized");
    }
    try {
      const result = await db
        .delete(gameSessions)
        .where(eq(gameSessions.sessionName, sessionName))
        .returning();
      
      return result.length > 0;
    } catch (error) {
      console.error("Error deleting game session:", error);
      throw error;
    }
  }
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private sessions: Map<string, SelectGameSession> = new Map();

  async getGameSession(sessionName: string): Promise<SelectGameSession | undefined> {
    return this.sessions.get(sessionName);
  }

  async createGameSession(sessionName: string, gameState: GameState, sessionInfo?: any, turnStatistics?: any, lastUpdated?: string): Promise<SelectGameSession> {
    const now = new Date();
    const session: SelectGameSession = {
      sessionName,
      gameState,
      sessionInfo: sessionInfo || null,
      turnStatistics: turnStatistics || null,
      finalReport: null,
      lastUpdated: lastUpdated || null,
      createdAt: now,
      updatedAt: now,
    };
    
    this.sessions.set(sessionName, session);
    return session;
  }

  async updateGameSession(sessionName: string, gameState: GameState, sessionInfo?: any, turnStatistics?: any, finalReport?: string, lastUpdated?: string): Promise<SelectGameSession> {
    const existing = this.sessions.get(sessionName);
    if (!existing) {
      throw new Error(`Session ${sessionName} not found`);
    }

    const updated: SelectGameSession = {
      ...existing,
      gameState,
      sessionInfo: sessionInfo !== undefined ? sessionInfo : existing.sessionInfo,
      turnStatistics: turnStatistics !== undefined ? turnStatistics : existing.turnStatistics,
      finalReport: finalReport !== undefined ? finalReport : existing.finalReport,
      lastUpdated: lastUpdated !== undefined ? lastUpdated : existing.lastUpdated,
      updatedAt: new Date(),
    };

    this.sessions.set(sessionName, updated);
    return updated;
  }

  async getAllGameSessions(): Promise<SelectGameSession[]> {
    return Array.from(this.sessions.values());
  }

  async deleteGameSession(sessionName: string): Promise<boolean> {
    return this.sessions.delete(sessionName);
  }
}

// Export storage instance - use database if available, otherwise use in-memory
export const storage: IStorage = databaseUrl ? new DrizzleStorage() : new MemStorage();
