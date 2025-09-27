import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { sharedSessionSchema, sessionInfoSchema, turnStatisticsSchema, createSessionSchema, updateSessionSchema } from "@shared/schema";
import { z } from 'zod';

export async function registerRoutes(app: Express): Promise<Server> {
  // Session management routes
  
  // GET /api/sessions - List all sessions
  app.get("/api/sessions", async (req, res) => {
    try {
      const sessions = await storage.listSessions();
      res.json(sessions);
    } catch (error) {
      console.error('Error listing sessions:', error);
      res.status(500).json({ error: "Failed to list sessions" });
    }
  });

  // GET /api/sessions/:id - Get specific session by ID
  app.get("/api/sessions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const session = await storage.getSession(id);
      
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      
      res.json(session);
    } catch (error) {
      console.error('Error getting session:', error);
      res.status(500).json({ error: "Failed to get session" });
    }
  });

  // GET /api/sessions/by-name/:name - Get session by name
  app.get("/api/sessions/by-name/:name", async (req, res) => {
    try {
      const { name } = req.params;
      const session = await storage.getSessionByName(decodeURIComponent(name));
      
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      
      res.json(session);
    } catch (error) {
      console.error('Error getting session by name:', error);
      res.status(500).json({ error: "Failed to get session" });
    }
  });

  // POST /api/sessions - Create new session
  app.post("/api/sessions", async (req, res) => {
    try {
      // Validate request body using Zod schema
      const parseResult = createSessionSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: "Invalid session data", 
          details: parseResult.error.issues 
        });
      }

      const sessionData = parseResult.data;
      const session = await storage.createSession(sessionData);
      
      // Convert dates back to ISO strings for JSON response
      const responseSession = {
        ...session,
        createdAt: session.createdAt.toISOString(),
        lastUpdated: session.lastUpdated.toISOString(),
        turnStatistics: session.turnStatistics.map(stat => ({
          ...stat,
          timestamp: stat.timestamp.toISOString()
        })),
        gameState: {
          ...session.gameState,
          strategyLog: session.gameState.strategyLog.map(log => ({
            ...log,
            timestamp: log.timestamp.toISOString()
          }))
        }
      };
      
      res.status(201).json(responseSession);
    } catch (error) {
      console.error('Error creating session:', error);
      res.status(500).json({ error: "Failed to create session" });
    }
  });

  // PUT /api/sessions/:id - Update existing session
  app.put("/api/sessions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Validate request body using Zod schema
      const parseResult = updateSessionSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: "Invalid session data", 
          details: parseResult.error.issues 
        });
      }

      const updateData = parseResult.data;
      const updatedSession = await storage.updateSession(id, updateData);
      
      if (!updatedSession) {
        return res.status(404).json({ error: "Session not found" });
      }
      
      // Convert dates back to ISO strings for JSON response
      const responseSession = {
        ...updatedSession,
        createdAt: updatedSession.createdAt.toISOString(),
        lastUpdated: updatedSession.lastUpdated.toISOString(),
        turnStatistics: updatedSession.turnStatistics.map(stat => ({
          ...stat,
          timestamp: stat.timestamp.toISOString()
        })),
        gameState: {
          ...updatedSession.gameState,
          strategyLog: updatedSession.gameState.strategyLog.map(log => ({
            ...log,
            timestamp: log.timestamp.toISOString()
          }))
        }
      };
      
      res.json(responseSession);
    } catch (error) {
      console.error('Error updating session:', error);
      res.status(500).json({ error: "Failed to update session" });
    }
  });

  // URL shortening route
  app.post("/api/shorten-url", async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: "URL is required and must be a string" });
      }

      // Validate URL format
      try {
        new URL(url);
      } catch {
        return res.status(400).json({ error: "Invalid URL format" });
      }

      // Use Ulvis.net free API for URL shortening
      const response = await fetch('https://ulvis.net/api/v1/urls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url
        })
      });

      if (!response.ok) {
        console.error('Ulvis.net API error:', response.status, response.statusText);
        return res.status(500).json({ error: "URL shortening service unavailable" });
      }

      const data = await response.json();
      
      if (data.short) {
        res.json({ shortUrl: data.short, originalUrl: url });
      } else {
        console.error('Unexpected response from Ulvis.net:', data);
        res.status(500).json({ error: "Failed to create short URL" });
      }
    } catch (error) {
      console.error('Error shortening URL:', error);
      res.status(500).json({ error: "Failed to shorten URL" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
