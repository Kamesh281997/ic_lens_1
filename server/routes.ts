import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema, signupSchema, forgotPasswordSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import csv from "csv-parser";
import { Readable } from "stream";
import { db } from "./db";
import { hierarchy } from "@shared/schema";

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

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

  // IC Processing endpoint
  app.post("/api/ic-processing", async (req, res) => {
    try {
      // Simulate IC processing
      const processingResult = {
        planId: "plan_" + Date.now(),
        status: "configured",
        message: "IC plan configured successfully"
      };
      
      res.json(processingResult);
    } catch (error) {
      res.status(500).json({ message: "IC processing failed" });
    }
  });

  // File upload endpoint
  app.post("/api/upload", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      if (!(req.session as any).userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const userId = (req.session as any).userId;
      const fileType = req.body.fileType;
      const fileName = req.file.originalname;
      const fileSize = req.file.size;

      // Process hierarchy files
      if (fileType === 'hierarchy') {
        const csvData: any[] = [];
        const stream = Readable.from(req.file.buffer.toString());
        
        await new Promise((resolve, reject) => {
          stream
            .pipe(csv())
            .on('data', (data) => {
              csvData.push(data);
            })
            .on('end', async () => {
              try {
                // Process and insert hierarchy data
                for (const row of csvData) {
                  await db.insert(hierarchy).values({
                    userId: userId,
                    teamId: row.TeamID || row.TEAM_ID || '',
                    terrId: row.TERR_ID || '',
                    terrName: row.TERR_NAME || '',
                    roleCd: row.ROLE_CD || '',
                    level1ParentId: row.LEVEL1_PARENT_ID || null,
                    level1ParentName: row.LEVEL1_PARENT_NAME || null,
                    level1ParentRoleCd: row.LEVEL_1_PARENT_ROLE_CD || null,
                    level2ParentId: row.LEVEL2_PARENT_ID || null,
                    level2ParentName: row.LEVEL2_PARENT_NAME || null,
                    level2ParentRoleCd: row.LEVEL_2_PARENT_ROLE_CD || null,
                  });
                }
                resolve(csvData);
              } catch (error) {
                reject(error);
              }
            })
            .on('error', reject);
        });

        res.json({
          status: "uploaded",
          message: `Hierarchy file uploaded successfully. Processed ${csvData.length} records.`,
          fileType: fileType,
          fileName: fileName,
          recordsProcessed: csvData.length
        });
      } else {
        // For other file types, just acknowledge the upload for now
        res.json({
          status: "uploaded",
          message: `${fileType} file uploaded successfully`,
          fileType: fileType,
          fileName: fileName,
          fileSize: fileSize
        });
      }
      
    } catch (error) {
      console.error('File upload error:', error);
      res.status(500).json({ message: "File upload failed" });
    }
  });

  // Data validation endpoint
  app.post("/api/validation/proceed", async (req, res) => {
    try {
      // Simulate validation completion
      const validationResult = {
        status: "validated",
        message: "Data validation completed successfully"
      };
      
      res.json(validationResult);
    } catch (error) {
      res.status(500).json({ message: "Validation failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
