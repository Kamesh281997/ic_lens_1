import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema, signupSchema, forgotPasswordSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import csv from "csv-parser";
import { Readable } from "stream";
import { db } from "./db";
import { 
  hierarchy, 
  repRoster, 
  repAssignment, 
  salesDataDetailed, 
  quotaDataDetailed, 
  payCurveGoalAttainment, 
  payCurveGoalRankAttainment 
} from "@shared/schema";

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

      // Process CSV files based on type
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
              // Process different file types
              if (fileType === 'hierarchy') {
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
              } else if (fileType === 'rep_roster') {
                for (const row of csvData) {
                  await db.insert(repRoster).values({
                    userId: userId,
                    repId: row.REP_ID || row.Rep_ID || '',
                    repName: row.REP_NAME || row.Rep_Name || '',
                    emailId: row.EMAIL_ID || row.Email_ID || '',
                  });
                }
              } else if (fileType === 'rep_territory') {
                for (const row of csvData) {
                  await db.insert(repAssignment).values({
                    userId: userId,
                    terrId: row.TERR_ID || row.Territory_ID || '',
                    repId: row.REP_ID || row.Rep_ID || '',
                    startDate: row.START_DATE || row.Start_Date || '',
                    endDate: row.END_DATE || row.End_Date || '',
                  });
                }
              } else if (fileType === 'sales_data') {
                for (const row of csvData) {
                  await db.insert(salesDataDetailed).values({
                    userId: userId,
                    dataMonth: row.DATA_MONTH || row.Data_Month || '',
                    teamId: row.TEAM_ID || row.Team_ID || '',
                    territoryId: row.TERRITORY_ID || row.Territory_ID || '',
                    productId: row.PRODUCT_ID || row.Product_ID || '',
                    dataType: row.DATA_TYPE || row.Data_Type || '',
                    channel: row.CHANNEL || row.Channel || '',
                    prod01: row.PROD01 || null,
                    mkt01: row.MKT01 || null,
                    prod02: row.PROD02 || null,
                    mkt02: row.MKT02 || null,
                    prod03: row.PROD03 || null,
                    mkt03: row.MKT03 || null,
                    prod04: row.PROD04 || null,
                    mkt04: row.MKT04 || null,
                    prod05: row.PROD05 || null,
                    mkt05: row.MKT05 || null,
                    prod06: row.PROD06 || null,
                    mkt06: row.MKT06 || null,
                    prod07: row.PROD07 || null,
                    mkt07: row.MKT07 || null,
                    prod08: row.PROD08 || null,
                    mkt08: row.MKT08 || null,
                    prod09: row.PROD09 || null,
                    mkt09: row.MKT09 || null,
                    prod10: row.PROD10 || null,
                    mkt10: row.MKT10 || null,
                    prod11: row.PROD11 || null,
                    mkt11: row.MKT11 || null,
                    prod12: row.PROD12 || null,
                    mkt12: row.MKT12 || null,
                    prod13: row.PROD13 || null,
                    mkt13: row.MKT13 || null,
                    prod14: row.PROD14 || null,
                    mkt14: row.MKT14 || null,
                    prod15: row.PROD15 || null,
                    mkt15: row.MKT15 || null,
                    prod16: row.PROD16 || null,
                    mkt16: row.MKT16 || null,
                    prod17: row.PROD17 || null,
                    mkt17: row.MKT17 || null,
                    prod18: row.PROD18 || null,
                    mkt18: row.MKT18 || null,
                    prod19: row.PROD19 || null,
                    mkt19: row.MKT19 || null,
                    prod20: row.PROD20 || null,
                    mkt20: row.MKT20 || null,
                    prod21: row.PROD21 || null,
                    mkt21: row.MKT21 || null,
                    prod22: row.PROD22 || null,
                    mkt22: row.MKT22 || null,
                    prod23: row.PROD23 || null,
                    mkt23: row.MKT23 || null,
                    prod24: row.PROD24 || null,
                    mkt24: row.MKT24 || null,
                  });
                }
              } else if (fileType === 'quota_data') {
                for (const row of csvData) {
                  await db.insert(quotaDataDetailed).values({
                    userId: userId,
                    dataMonth: row.DATA_MONTH || row.Data_Month || '',
                    teamId: row.TEAM_ID || row.Team_ID || '',
                    territoryId: row.TERRITORY_ID || row.Territory_ID || '',
                    productId: row.PRODUCT_ID || row.Product_ID || '',
                    dataType: row.DATA_TYPE || row.Data_Type || '',
                    channel: row.CHANNEL || row.Channel || '',
                    prod01: row.PROD01 || null,
                    mkt01: row.MKT01 || null,
                    prod02: row.PROD02 || null,
                    mkt02: row.MKT02 || null,
                    prod03: row.PROD03 || null,
                    mkt03: row.MKT03 || null,
                    prod04: row.PROD04 || null,
                    mkt04: row.MKT04 || null,
                    prod05: row.PROD05 || null,
                    mkt05: row.MKT05 || null,
                    prod06: row.PROD06 || null,
                    mkt06: row.MKT06 || null,
                    prod07: row.PROD07 || null,
                    mkt07: row.MKT07 || null,
                    prod08: row.PROD08 || null,
                    mkt08: row.MKT08 || null,
                    prod09: row.PROD09 || null,
                    mkt09: row.MKT09 || null,
                    prod10: row.PROD10 || null,
                    mkt10: row.MKT10 || null,
                    prod11: row.PROD11 || null,
                    mkt11: row.MKT11 || null,
                    prod12: row.PROD12 || null,
                    mkt12: row.MKT12 || null,
                    prod13: row.PROD13 || null,
                    mkt13: row.MKT13 || null,
                    prod14: row.PROD14 || null,
                    mkt14: row.MKT14 || null,
                    prod15: row.PROD15 || null,
                    mkt15: row.MKT15 || null,
                    prod16: row.PROD16 || null,
                    mkt16: row.MKT16 || null,
                    prod17: row.PROD17 || null,
                    mkt17: row.MKT17 || null,
                    prod18: row.PROD18 || null,
                    mkt18: row.MKT18 || null,
                    prod19: row.PROD19 || null,
                    mkt19: row.MKT19 || null,
                    prod20: row.PROD20 || null,
                    mkt20: row.MKT20 || null,
                    prod21: row.PROD21 || null,
                    mkt21: row.MKT21 || null,
                    prod22: row.PROD22 || null,
                    mkt22: row.MKT22 || null,
                    prod23: row.PROD23 || null,
                    mkt23: row.MKT23 || null,
                    prod24: row.PROD24 || null,
                    mkt24: row.MKT24 || null,
                  });
                }
              } else if (fileType === 'goal_attainment') {
                for (const row of csvData) {
                  await db.insert(payCurveGoalAttainment).values({
                    userId: userId,
                    percentileRank: row['Percentile Rank'] || row.Percentile_Rank || '0',
                    bonusAttainment: row['Bonus Attainment (%)'] || row.Bonus_Attainment || '0',
                  });
                }
              } else if (fileType === 'goal_attainment_with_rank') {
                for (const row of csvData) {
                  await db.insert(payCurveGoalRankAttainment).values({
                    userId: userId,
                    goalAttainment: row['Goal Attainment (%)'] || row.Goal_Attainment || '0',
                    bonusAttainment: row['Bonus Attainment (%)'] || row.Bonus_Attainment || '0',
                  });
                }
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
        message: `${fileType} file uploaded successfully. Processed ${csvData.length} records.`,
        fileType: fileType,
        fileName: fileName,
        recordsProcessed: csvData.length
      });
      
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

  // Payout calculation endpoints
  app.get("/api/payout/results", async (req, res) => {
    try {
      // Sample payout results data with new column structure
      const sampleResults = [
        {
          repId: "10000000",
          repName: "Michael Garcia",
          region: "North America",
          quota: 500000,
          actualSales: 625000,
          attainmentPercent: 125.0,
          payoutCurveType: "Goal Attainment",
          finalPayout: 75000,
          percentOfTargetPay: 150.0,
          anyAdjustment: "None",
          notes: "Exceeded quota by 25%"
        },
        {
          repId: "10000001",
          repName: "Sarah Johnson",
          region: "Europe",
          quota: 400000,
          actualSales: 380000,
          attainmentPercent: 95.0,
          payoutCurveType: "Goal Attainment with Relative Rank",
          finalPayout: 38000,
          percentOfTargetPay: 95.0,
          anyAdjustment: "Q4 Adjustment +$2k",
          notes: "Strong performance in challenging market"
        },
        {
          repId: "10000002",
          repName: "David Chen",
          region: "Asia Pacific",
          quota: 600000,
          actualSales: 720000,
          attainmentPercent: 120.0,
          payoutCurveType: "Goal Attainment",
          finalPayout: 84000,
          percentOfTargetPay: 140.0,
          anyAdjustment: "None",
          notes: "Top performer in region"
        },
        {
          repId: "10000003",
          repName: "Emily Rodriguez",
          region: "South America",
          quota: 350000,
          actualSales: 425000,
          attainmentPercent: 121.4,
          payoutCurveType: "Goal Attainment with Relative Rank",
          finalPayout: 51000,
          percentOfTargetPay: 145.7,
          anyAdjustment: "Territory Expansion Bonus +$3k",
          notes: "Excellent growth in new territory"
        }
      ];

      res.json({ results: sampleResults });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payout results" });
    }
  });

  app.post("/api/payout/calculate", async (req, res) => {
    try {
      // Simulate calculation process
      const calculationResult = {
        status: "completed",
        message: "Payout calculations completed successfully",
        recordsProcessed: 4,
        totalPayout: 248000
      };
      
      res.json(calculationResult);
    } catch (error) {
      res.status(500).json({ message: "Payout calculation failed" });
    }
  });

  app.get("/api/payout/export", async (req, res) => {
    try {
      // Create CSV export
      const csvHeaders = "Rep ID,Rep Name,Region,Quota,Actual Sales,Attainment %,Payout Curve Type,Final Payout ($),% of Target Pay,Any Adjustment,Notes\n";
      const csvData = [
        "10000000,Michael Garcia,North America,500000,625000,125.0,Goal Attainment,75000,150.0,None,Exceeded quota by 25%",
        "10000001,Sarah Johnson,Europe,400000,380000,95.0,Goal Attainment with Relative Rank,38000,95.0,Q4 Adjustment +$2k,Strong performance in challenging market",
        "10000002,David Chen,Asia Pacific,600000,720000,120.0,Goal Attainment,84000,140.0,None,Top performer in region",
        "10000003,Emily Rodriguez,South America,350000,425000,121.4,Goal Attainment with Relative Rank,51000,145.7,Territory Expansion Bonus +$3k,Excellent growth in new territory"
      ].join("\n");

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="payout_results.csv"');
      res.send(csvHeaders + csvData);
    } catch (error) {
      res.status(500).json({ message: "Export failed" });
    }
  });

  app.get("/api/analytics/insights", async (req, res) => {
    try {
      // Sample analytics data
      const analyticsData = {
        topPerformingReps: [
          { repId: "10000002", repName: "David Chen", payoutAmount: 84000, quotaAttainment: 120.0 },
          { repId: "10000000", repName: "Michael Garcia", payoutAmount: 75000, quotaAttainment: 125.0 },
          { repId: "10000003", repName: "Emily Rodriguez", payoutAmount: 51000, quotaAttainment: 121.4 }
        ],
        territoryEffectiveness: [
          { territory: "Asia Pacific", avgQuotaAttainment: 120.0, totalPayout: 84000, repCount: 1 },
          { territory: "North America", avgQuotaAttainment: 125.0, totalPayout: 75000, repCount: 1 },
          { territory: "South America", avgQuotaAttainment: 121.4, totalPayout: 51000, repCount: 1 },
          { territory: "Europe", avgQuotaAttainment: 95.0, totalPayout: 38000, repCount: 1 }
        ],
        payoutDistribution: [
          { range: "$75,000+", count: 2, percentage: 50 },
          { range: "$50,000-$74,999", count: 1, percentage: 25 },
          { range: "$25,000-$49,999", count: 1, percentage: 25 }
        ],
        summary: {
          totalPayout: 248000,
          avgQuotaAttainment: 115.4,
          totalReps: 4,
          topPerformerThreshold: 120.0
        }
      };

      res.json(analyticsData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
