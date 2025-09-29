import { type InsertGameSession, type SelectGameSession, GameState, gameSessions } from "@shared/schema";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";

// Database setup
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is required");
}

const sql = neon(databaseUrl);
const db = drizzle(sql);

// Storage interface for MDDS game sessions
export interface IStorage {
  getGameSession(sessionName: string): Promise<SelectGameSession | undefined>;
  createGameSession(sessionName: string, gameState: GameState, sessionInfo?: any, turnStatistics?: any, lastUpdated?: string): Promise<SelectGameSession>;
  updateGameSession(sessionName: string, gameState: GameState, sessionInfo?: any, turnStatistics?: any, lastUpdated?: string): Promise<SelectGameSession>;
  getAllGameSessions(): Promise<SelectGameSession[]>;
  deleteGameSession(sessionName: string): Promise<boolean>;
}

export class DrizzleStorage implements IStorage {
  async getGameSession(sessionName: string): Promise<SelectGameSession | undefined> {
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

  async updateGameSession(sessionName: string, gameState: GameState, sessionInfo?: any, turnStatistics?: any, lastUpdated?: string): Promise<SelectGameSession> {
    try {
      const result = await db
        .update(gameSessions)
        .set({
          gameState,
          sessionInfo,
          turnStatistics,
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
    try {
      return await db.select().from(gameSessions);
    } catch (error) {
      console.error("Error getting all game sessions:", error);
      throw error;
    }
  }

  async deleteGameSession(sessionName: string): Promise<boolean> {
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

export const storage = new DrizzleStorage();
