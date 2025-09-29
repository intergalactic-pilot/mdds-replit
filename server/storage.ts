import { type InsertGameSession, type SelectGameSession, GameState } from "@shared/schema";

// Storage interface for MDDS game sessions
export interface IStorage {
  getGameSession(sessionName: string): Promise<SelectGameSession | undefined>;
  createGameSession(sessionName: string, gameState: GameState): Promise<SelectGameSession>;
  updateGameSession(sessionName: string, gameState: GameState): Promise<SelectGameSession>;
  getAllGameSessions(): Promise<SelectGameSession[]>;
  deleteGameSession(sessionName: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private sessions: Map<string, SelectGameSession>;

  constructor() {
    this.sessions = new Map();
  }

  async getGameSession(sessionName: string): Promise<SelectGameSession | undefined> {
    return this.sessions.get(sessionName);
  }

  async createGameSession(sessionName: string, gameState: GameState): Promise<SelectGameSession> {
    const now = new Date();
    const session: SelectGameSession = {
      sessionName,
      gameState,
      createdAt: now,
      updatedAt: now,
    };
    this.sessions.set(sessionName, session);
    return session;
  }

  async updateGameSession(sessionName: string, gameState: GameState): Promise<SelectGameSession> {
    const existingSession = this.sessions.get(sessionName);
    if (!existingSession) {
      throw new Error(`Session ${sessionName} not found`);
    }
    
    const updatedSession: SelectGameSession = {
      ...existingSession,
      gameState,
      updatedAt: new Date(),
    };
    this.sessions.set(sessionName, updatedSession);
    return updatedSession;
  }

  async getAllGameSessions(): Promise<SelectGameSession[]> {
    return Array.from(this.sessions.values());
  }

  async deleteGameSession(sessionName: string): Promise<boolean> {
    return this.sessions.delete(sessionName);
  }
}

export const storage = new MemStorage();
