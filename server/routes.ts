import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGameSessionSchema, selectGameSessionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Game Session Management Routes
  
  // Get all game sessions
  app.get("/api/sessions", async (req, res) => {
    try {
      const sessions = await storage.getAllGameSessions();
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching game sessions:", error);
      res.status(500).json({ error: "Failed to fetch game sessions" });
    }
  });

  // Get a specific game session
  app.get("/api/sessions/:sessionName", async (req, res) => {
    try {
      const { sessionName } = req.params;
      const session = await storage.getGameSession(sessionName);
      
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      
      res.json(session);
    } catch (error) {
      console.error("Error fetching game session:", error);
      res.status(500).json({ error: "Failed to fetch game session" });
    }
  });

  // Create a new game session
  app.post("/api/sessions", async (req, res) => {
    try {
      // Validate request body using Zod schema
      const validationResult = insertGameSessionSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid session data", 
          details: validationResult.error.errors 
        });
      }

      const { sessionName, gameState } = validationResult.data;
      const { sessionInfo, turnStatistics, lastUpdated } = req.body;

      // Check if session already exists
      const existingSession = await storage.getGameSession(sessionName);
      if (existingSession) {
        return res.status(409).json({ error: "Session with this name already exists" });
      }

      const session = await storage.createGameSession(sessionName, gameState, sessionInfo, turnStatistics, lastUpdated);
      res.status(201).json(session);
    } catch (error) {
      console.error("Error creating game session:", error);
      res.status(500).json({ error: "Failed to create game session" });
    }
  });

  // Update an existing game session
  app.put("/api/sessions/:sessionName", async (req, res) => {
    try {
      const { sessionName } = req.params;
      
      // Validate request body - allow all optional fields
      const updateSchema = insertGameSessionSchema.partial();
      const validationResult = updateSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid session data", 
          details: validationResult.error.errors 
        });
      }

      const { gameState, sessionInfo, turnStatistics, lastUpdated } = validationResult.data;
      
      // Only update if gameState is provided
      if (!gameState) {
        return res.status(400).json({ error: "gameState is required for updates" });
      }

      const session = await storage.updateGameSession(
        sessionName, 
        gameState, 
        sessionInfo, 
        turnStatistics, 
        lastUpdated || undefined
      );
      res.json(session);
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        return res.status(404).json({ error: "Session not found" });
      }
      console.error("Error updating game session:", error);
      res.status(500).json({ error: "Failed to update game session" });
    }
  });

  // Delete a game session
  app.delete("/api/sessions/:sessionName", async (req, res) => {
    try {
      const { sessionName } = req.params;
      const deleted = await storage.deleteGameSession(sessionName);
      
      if (!deleted) {
        return res.status(404).json({ error: "Session not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting game session:", error);
      res.status(500).json({ error: "Failed to delete game session" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
