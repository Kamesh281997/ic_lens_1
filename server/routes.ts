import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema, signupSchema, forgotPasswordSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      const isValidPassword = await storage.validatePassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      // Store user session
      (req.session as any).userId = user.id;
      (req.session as any).user = { id: user.id, username: user.username, email: user.email };

      // Don't send password back to client
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, message: "Login successful" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Signup endpoint
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { username, email, password } = signupSchema.parse(req.body);
      
      // Check if username already exists
      const existingUserByUsername = await storage.getUserByUsername(username);
      if (existingUserByUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Check if email already exists
      const existingUserByEmail = await storage.getUserByEmail(email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const user = await storage.createUser({ username, email, password });
      
      // Store user session
      (req.session as any).userId = user.id;
      (req.session as any).user = { id: user.id, username: user.username, email: user.email };
      
      // Don't send password back to client
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json({ user: userWithoutPassword, message: "Account created successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Forgot password endpoint
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if email exists or not for security
        return res.json({ message: "If an account with that email exists, we've sent a password reset link." });
      }

      // TODO: Implement email sending logic here
      // For now, just return success message
      res.json({ message: "If an account with that email exists, we've sent a password reset link." });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Check current user endpoint
  app.get("/api/auth/me", async (req, res) => {
    const session = req.session as any;
    if (!session?.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const user = await storage.getUser(session.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  });

  // Logout endpoint
  app.post("/api/auth/logout", async (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
