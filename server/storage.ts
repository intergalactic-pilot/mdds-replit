import { type SharedSession } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getSession(id: string): Promise<SharedSession | undefined>;
  getSessionByName(sessionName: string): Promise<SharedSession | undefined>;
  createSession(session: Omit<SharedSession, 'id' | 'createdAt' | 'lastUpdated'>): Promise<SharedSession>;
  updateSession(id: string, session: Omit<SharedSession, 'id' | 'createdAt'>): Promise<SharedSession | undefined>;
  listSessions(): Promise<SharedSession[]>;
}

export class MemStorage implements IStorage {
  private sessions: Map<string, SharedSession>;

  constructor() {
    this.sessions = new Map();
  }

  async getSession(id: string): Promise<SharedSession | undefined> {
    return this.sessions.get(id);
  }

  async getSessionByName(sessionName: string): Promise<SharedSession | undefined> {
    return Array.from(this.sessions.values()).find(
      (session) => session.sessionInfo.sessionName === sessionName,
    );
  }

  async createSession(sessionData: Omit<SharedSession, 'id' | 'createdAt' | 'lastUpdated'>): Promise<SharedSession> {
    const id = randomUUID();
    const now = new Date();
    const session: SharedSession = { 
      sessionInfo: sessionData.sessionInfo,
      gameState: sessionData.gameState,
      turnStatistics: sessionData.turnStatistics,
      id, 
      createdAt: now,
      lastUpdated: now
    };
    this.sessions.set(id, session);
    return session;
  }

  async updateSession(id: string, updateData: Omit<SharedSession, 'id' | 'createdAt'>): Promise<SharedSession | undefined> {
    const existingSession = this.sessions.get(id);
    if (!existingSession) {
      return undefined;
    }
    
    const updatedSession: SharedSession = {
      ...existingSession,
      ...updateData,
      id, // preserve original id
      createdAt: existingSession.createdAt, // preserve creation date
      lastUpdated: new Date()
    };
    
    this.sessions.set(id, updatedSession);
    return updatedSession;
  }

  async listSessions(): Promise<SharedSession[]> {
    return Array.from(this.sessions.values());
  }
}

export const storage = new MemStorage();
