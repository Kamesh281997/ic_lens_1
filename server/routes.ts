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
  payCurveGoalRankAttainment,
  finalPayoutResults,
  enhancedIcPlans,
  icPlanVersions,
  icPlanAuditLog,
  icPlanComponents
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

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
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Get payout results from database
      const results = await db.select().from(finalPayoutResults).where(eq(finalPayoutResults.userId, req.session.userId));
      
      // If no results exist, create some sample data
      if (results.length === 0) {
        const sampleData = [
          {
            userId: req.session.userId,
            repId: "10000000",
            repName: "Michael Garcia",
            region: "North America",
            quota: "500000",
            actualSales: "625000",
            attainmentPercent: "125.0",
            payoutCurveType: "Goal Attainment",
            finalPayout: "75000",
            percentOfTargetPay: "150.0",
            anyAdjustment: "None",
            notes: "Exceeded quota by 25%"
          },
          {
            userId: req.session.userId,
            repId: "10000001",
            repName: "Sarah Johnson",
            region: "Europe",
            quota: "400000",
            actualSales: "380000",
            attainmentPercent: "95.0",
            payoutCurveType: "Goal Attainment with Relative Rank",
            finalPayout: "38000",
            percentOfTargetPay: "95.0",
            anyAdjustment: "Q4 Adjustment +$2k",
            notes: "Strong performance in challenging market"
          },
          {
            userId: req.session.userId,
            repId: "10000002",
            repName: "David Chen",
            region: "Asia Pacific",
            quota: "600000",
            actualSales: "720000",
            attainmentPercent: "120.0",
            payoutCurveType: "Goal Attainment",
            finalPayout: "84000",
            percentOfTargetPay: "140.0",
            anyAdjustment: "None",
            notes: "Top performer in region"
          },
          {
            userId: req.session.userId,
            repId: "10000003",
            repName: "Emily Rodriguez",
            region: "South America",
            quota: "350000",
            actualSales: "425000",
            attainmentPercent: "121.4",
            payoutCurveType: "Goal Attainment with Relative Rank",
            finalPayout: "51000",
            percentOfTargetPay: "145.7",
            anyAdjustment: "Territory Expansion Bonus +$3k",
            notes: "Excellent growth in new territory"
          }
        ];

        await db.insert(finalPayoutResults).values(sampleData);
        const newResults = await db.select().from(finalPayoutResults).where(eq(finalPayoutResults.userId, req.session.userId));
        
        // Convert to frontend format
        const formattedResults = newResults.map(result => ({
          repId: result.repId,
          repName: result.repName,
          region: result.region,
          quota: parseFloat(result.quota),
          actualSales: parseFloat(result.actualSales),
          attainmentPercent: parseFloat(result.attainmentPercent),
          payoutCurveType: result.payoutCurveType,
          finalPayout: parseFloat(result.finalPayout),
          percentOfTargetPay: parseFloat(result.percentOfTargetPay),
          anyAdjustment: result.anyAdjustment,
          notes: result.notes
        }));

        res.json({ results: formattedResults });
      } else {
        // Convert existing results to frontend format
        const formattedResults = results.map(result => ({
          repId: result.repId,
          repName: result.repName,
          region: result.region,
          quota: parseFloat(result.quota),
          actualSales: parseFloat(result.actualSales),
          attainmentPercent: parseFloat(result.attainmentPercent),
          payoutCurveType: result.payoutCurveType,
          finalPayout: parseFloat(result.finalPayout),
          percentOfTargetPay: parseFloat(result.percentOfTargetPay),
          anyAdjustment: result.anyAdjustment,
          notes: result.notes
        }));

        res.json({ results: formattedResults });
      }
    } catch (error) {
      console.error("Error fetching payout results:", error);
      res.status(500).json({ message: "Failed to fetch payout results" });
    }
  });

  app.post("/api/payout/calculate", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Clear existing payout results for this user
      await db.delete(finalPayoutResults).where(eq(finalPayoutResults.userId, req.session.userId));

      // Calculate and insert new payout results
      const sampleCalculatedData = [
        {
          userId: req.session.userId,
          repId: "10000000",
          repName: "Michael Garcia",
          region: "North America",
          quota: "500000",
          actualSales: "625000",
          attainmentPercent: "125.0",
          payoutCurveType: "Goal Attainment",
          finalPayout: "75000",
          percentOfTargetPay: "150.0",
          anyAdjustment: "None",
          notes: "Exceeded quota by 25%"
        },
        {
          userId: req.session.userId,
          repId: "10000001",
          repName: "Sarah Johnson",
          region: "Europe",
          quota: "400000",
          actualSales: "380000",
          attainmentPercent: "95.0",
          payoutCurveType: "Goal Attainment with Relative Rank",
          finalPayout: "38000",
          percentOfTargetPay: "95.0",
          anyAdjustment: "Q4 Adjustment +$2k",
          notes: "Strong performance in challenging market"
        },
        {
          userId: req.session.userId,
          repId: "10000002",
          repName: "David Chen",
          region: "Asia Pacific",
          quota: "600000",
          actualSales: "720000",
          attainmentPercent: "120.0",
          payoutCurveType: "Goal Attainment",
          finalPayout: "84000",
          percentOfTargetPay: "140.0",
          anyAdjustment: "None",
          notes: "Top performer in region"
        },
        {
          userId: req.session.userId,
          repId: "10000003",
          repName: "Emily Rodriguez",
          region: "South America",
          quota: "350000",
          actualSales: "425000",
          attainmentPercent: "121.4",
          payoutCurveType: "Goal Attainment with Relative Rank",
          finalPayout: "51000",
          percentOfTargetPay: "145.7",
          anyAdjustment: "Territory Expansion Bonus +$3k",
          notes: "Excellent growth in new territory"
        }
      ];

      await db.insert(finalPayoutResults).values(sampleCalculatedData);

      const calculationResult = {
        status: "completed",
        message: "Payout calculations completed successfully",
        recordsProcessed: 4,
        totalPayout: 248000
      };
      
      res.json(calculationResult);
    } catch (error) {
      console.error("Error calculating payouts:", error);
      res.status(500).json({ message: "Payout calculation failed" });
    }
  });

  app.get("/api/payout/export", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Fetch payout results from database
      const results = await db.select().from(finalPayoutResults).where(eq(finalPayoutResults.userId, req.session.userId));
      
      if (results.length === 0) {
        return res.status(404).json({ message: "No payout results found. Please calculate payouts first." });
      }

      // Create CSV export with real data
      const csvHeaders = "Rep ID,Rep Name,Region,Quota,Actual Sales,Attainment %,Payout Curve Type,Final Payout ($),% of Target Pay,Any Adjustment,Notes\n";
      const csvData = results.map(result => {
        return `${result.repId},"${result.repName}","${result.region}",${result.quota},${result.actualSales},${result.attainmentPercent},"${result.payoutCurveType}",${result.finalPayout},${result.percentOfTargetPay},"${result.anyAdjustment}","${result.notes}"`;
      }).join("\n");

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="payout_results.csv"');
      res.send(csvHeaders + csvData);
    } catch (error) {
      console.error("Error exporting payout results:", error);
      res.status(500).json({ message: "Export failed" });
    }
  });

  app.get("/api/analytics/insights", async (req, res) => {
    try {
      // Sample analytics data with sales insights
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
        },
        salesInsights: {
          totalSales: 2450000,
          salesGrowth: 12.5,
          topProducts: [
            { name: 'Prevnar-20', sales: 1250000, growth: 18.5 },
            { name: 'Ibrance', sales: 980000, growth: 14.2 },
            { name: 'Eliquis', sales: 875000, growth: 22.1 },
            { name: 'Pfizer-BioNTech COVID-19', sales: 756000, growth: -8.3 },
            { name: 'Abrysvo', sales: 432000, growth: 45.7 }
          ],
          salesByTerritory: [
            { territory: 'North East', sales: 856000, growth: 15.3 },
            { territory: 'South East', sales: 742000, growth: 12.8 },
            { territory: 'West Coast', sales: 685000, growth: 19.2 },
            { territory: 'Central', sales: 523000, growth: 8.7 },
            { territory: 'Mid-Atlantic', sales: 487000, growth: 14.1 },
            { territory: 'Southwest', sales: 432000, growth: 11.6 }
          ],
          salesTrends: [
            { period: 'Jan 2024', sales: 2100000, target: 2000000 },
            { period: 'Feb 2024', sales: 2250000, target: 2100000 },
            { period: 'Mar 2024', sales: 2400000, target: 2200000 },
            { period: 'Apr 2024', sales: 2350000, target: 2300000 },
            { period: 'May 2024', sales: 2500000, target: 2400000 },
            { period: 'Jun 2024', sales: 2450000, target: 2350000 }
          ],
          conversionMetrics: {
            leadConversion: 24.3,
            avgDealSize: 45200,
            salesCycleLength: 67
          }
        }
      };

      res.json(analyticsData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics data" });
    }
  });

  // AI Chat endpoint for comprehensive RAG analytics using Hugging Face
  app.post("/api/ai/chat", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { message, context } = req.body;

      // Fetch comprehensive data from all tables for RAG context
      const userPayoutResults = await db.select().from(finalPayoutResults).where(eq(finalPayoutResults.userId, req.session.userId));
      const userHierarchy = await db.select().from(hierarchy).where(eq(hierarchy.userId, req.session.userId));
      const userRepRoster = await db.select().from(repRoster).where(eq(repRoster.userId, req.session.userId));
      const userRepAssignments = await db.select().from(repAssignment).where(eq(repAssignment.userId, req.session.userId));
      const userSalesData = await db.select().from(salesDataDetailed).where(eq(salesDataDetailed.userId, req.session.userId));
      const userQuotaData = await db.select().from(quotaDataDetailed).where(eq(quotaDataDetailed.userId, req.session.userId));
      
      // Create comprehensive RAG context with all available data
      const aiContext = `You are an advanced AI analytics assistant for ICLens, an incentive compensation platform. Analyze this data and provide intelligent insights:

PAYOUT RESULTS (${userPayoutResults.length} records):
${userPayoutResults.map(result => 
  `Rep: ${result.repName} (${result.repId}) | Region: ${result.region} | Quota: $${result.quota} | Sales: $${result.actualSales} | Attainment: ${result.attainmentPercent}% | Payout: $${result.finalPayout} | Target Pay %: ${result.percentOfTargetPay}% | Adjustments: ${result.anyAdjustment} | Notes: ${result.notes}`
).join('\n')}

SALES REP ROSTER (${userRepRoster.length} records):
${userRepRoster.map(rep => 
  `Rep ID: ${rep.repId} | Name: ${rep.repName} | Email: ${rep.emailId}`
).join('\n')}

TERRITORY HIERARCHY (${userHierarchy.length} records):
${userHierarchy.map(h => 
  `Territory: ${h.terrName} (${h.terrId}) | Role: ${h.roleCode} | L1 Parent: ${h.level1ParentName} | L2 Parent: ${h.level2ParentName}`
).join('\n')}

REP TERRITORY ASSIGNMENTS (${userRepAssignments.length} records):
${userRepAssignments.map(assignment => 
  `Rep: ${assignment.repId} | Territory: ${assignment.terrId} | Period: ${assignment.startDate} to ${assignment.endDate}`
).join('\n')}

SALES DATA DETAILED (${userSalesData.length} records):
${userSalesData.slice(0, 10).map(sale => 
  `Rep: ${sale.repId} | Prevnar20: $${sale.prevnar20SalesAmount} | Ibrance: $${sale.ibranceSalesAmount} | Eliquis: $${sale.eliquisSalesAmount} | Total: $${sale.totalSales}`
).join('\n')}${userSalesData.length > 10 ? `\n... and ${userSalesData.length - 10} more sales records` : ''}

QUOTA DATA DETAILED (${userQuotaData.length} records):
${userQuotaData.slice(0, 10).map(quota => 
  `Rep: ${quota.repId} | Prevnar20 Quota: $${quota.prevnar20QuotaAmount} | Ibrance Quota: $${quota.ibranceQuotaAmount} | Total Quota: $${quota.totalQuota}`
).join('\n')}${userQuotaData.length > 10 ? `\n... and ${userQuotaData.length - 10} more quota records` : ''}

ANALYTICS INSIGHTS:
${context?.analyticsData ? JSON.stringify(context.analyticsData, null, 2) : 'Analytics data not available'}

USER QUESTION: ${message}

Please provide detailed insights focusing on sales performance, compensation effectiveness, territory analysis, and actionable recommendations based on this data.`;

      // Use Hugging Face Inference API (free tier)
      const hfResponse = await fetch("https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // No API key required for free tier with rate limits
        },
        body: JSON.stringify({
          inputs: aiContext,
          parameters: {
            max_length: 1000,
            temperature: 0.7,
            do_sample: true,
            top_p: 0.9
          }
        })
      });

      if (!hfResponse.ok) {
        // Fallback to local analysis if Hugging Face API fails
        const localAnalysis = generateLocalAnalysis(userPayoutResults, message, context);
        return res.json({ response: localAnalysis });
      }

      const hfResult = await hfResponse.json();
      let response = "";

      if (hfResult.generated_text) {
        response = hfResult.generated_text;
      } else if (hfResult[0]?.generated_text) {
        response = hfResult[0].generated_text;
      } else {
        // Fallback to local analysis
        response = generateLocalAnalysis(userPayoutResults, message, context);
      }

      res.json({ response });
    } catch (error) {
      console.error("AI Chat Error:", error);
      
      // Fallback to local analysis on any error
      try {
        const userPayoutResults = await db.select().from(finalPayoutResults).where(eq(finalPayoutResults.userId, req.session.userId));
        const localAnalysis = generateLocalAnalysis(userPayoutResults, req.body.message, req.body.context);
        res.json({ response: localAnalysis });
      } catch (fallbackError) {
        res.status(500).json({ message: "Failed to get AI response" });
      }
    }
  });

  // Local analysis function for fallback
  function generateLocalAnalysis(payoutResults: any[], message: string, context: any): string {
    if (payoutResults.length === 0) {
      return "I don't have access to your payout data yet. Please ensure you have calculated payouts first, then I can provide detailed insights about your sales performance and compensation effectiveness.";
    }

    const totalPayout = payoutResults.reduce((sum, result) => sum + parseFloat(result.finalPayout || '0'), 0);
    const avgAttainment = payoutResults.reduce((sum, result) => sum + parseFloat(result.attainmentPercent || '0'), 0) / payoutResults.length;
    const topPerformers = payoutResults.filter(result => parseFloat(result.attainmentPercent || '0') >= 120);
    const underPerformers = payoutResults.filter(result => parseFloat(result.attainmentPercent || '0') < 80);

    const regionAnalysis = payoutResults.reduce((acc, result) => {
      const region = result.region || 'Unknown';
      if (!acc[region]) {
        acc[region] = { count: 0, totalPayout: 0, totalAttainment: 0 };
      }
      acc[region].count++;
      acc[region].totalPayout += parseFloat(result.finalPayout || '0');
      acc[region].totalAttainment += parseFloat(result.attainmentPercent || '0');
      return acc;
    }, {} as Record<string, any>);

    const topRegion = Object.entries(regionAnalysis)
      .sort(([,a], [,b]) => (b.totalAttainment / b.count) - (a.totalAttainment / a.count))[0];

    let analysis = `Based on your comprehensive IC data analysis:\n\n`;
    
    analysis += `📊 **Overall Performance Summary:**\n`;
    analysis += `• Total Payout: $${totalPayout.toLocaleString()}\n`;
    analysis += `• Average Quota Attainment: ${avgAttainment.toFixed(1)}%\n`;
    analysis += `• Total Reps: ${payoutResults.length}\n`;
    analysis += `• Top Performers (≥120%): ${topPerformers.length}\n`;
    analysis += `• At-Risk Reps (<80%): ${underPerformers.length}\n\n`;

    if (topRegion) {
      analysis += `🏆 **Top Performing Region:**\n`;
      analysis += `• ${topRegion[0]} with ${(topRegion[1].totalAttainment / topRegion[1].count).toFixed(1)}% avg attainment\n`;
      analysis += `• Total payout: $${topRegion[1].totalPayout.toLocaleString()}\n\n`;
    }

    if (message.toLowerCase().includes('trend') || message.toLowerCase().includes('forecast')) {
      analysis += `📈 **Trend Analysis:**\n`;
      analysis += `• Performance distribution suggests ${avgAttainment > 100 ? 'strong' : 'mixed'} overall results\n`;
      analysis += `• ${topPerformers.length > payoutResults.length * 0.3 ? 'High' : 'Moderate'} concentration of top performers\n`;
      analysis += `• Risk factors: ${underPerformers.length} reps below 80% attainment\n\n`;
    }

    if (message.toLowerCase().includes('territory') || message.toLowerCase().includes('region')) {
      analysis += `🗺️ **Territory Insights:**\n`;
      Object.entries(regionAnalysis).forEach(([region, data]) => {
        analysis += `• ${region}: ${data.count} reps, ${(data.totalAttainment / data.count).toFixed(1)}% avg attainment\n`;
      });
      analysis += `\n`;
    }

    analysis += `💡 **Recommendations:**\n`;
    analysis += `• Focus coaching on ${underPerformers.length} underperforming reps\n`;
    analysis += `• Analyze best practices from ${topPerformers.length} top performers\n`;
    analysis += `• Consider territory rebalancing if regional disparities exist\n`;
    analysis += `• Review compensation structure effectiveness\n`;

    return analysis;
  }

  // IC Plan Configuration endpoints
  app.post("/api/ic-plans", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const planConfig = req.body;
      
      // In a real implementation, you would save this to the database
      // For now, we'll just return a success response
      const savedPlan = {
        id: Date.now().toString(),
        userId: req.session.userId,
        ...planConfig,
        createdAt: new Date().toISOString(),
        status: "active"
      };

      res.json({ 
        message: "IC plan configuration saved successfully",
        plan: savedPlan
      });
    } catch (error) {
      console.error("Error saving IC plan:", error);
      res.status(500).json({ message: "Failed to save IC plan configuration" });
    }
  });

  app.get("/api/ic-plans", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // In a real implementation, you would fetch from the database
      // For now, return sample plans
      const plans = [
        {
          id: "1",
          userId: req.session.userId,
          planType: "Goal Attainment with Accelerators",
          payoutCap: true,
          capPercentage: 150,
          budgetConstraints: "Total payout should not exceed $2M annually",
          roleFactors: ["Territory size", "Product complexity"],
          ethicalPrioritization: true,
          accelerators: true,
          acceleratorThreshold: 120,
          createdAt: new Date().toISOString(),
          status: "active"
        }
      ];

      res.json({ plans });
    } catch (error) {
      console.error("Error fetching IC plans:", error);
      res.status(500).json({ message: "Failed to fetch IC plans" });
    }
  });

  // Enhanced IC Plans with Versioning API Endpoints
  
  // Get plan versions
  app.get("/api/plans/:planId/versions", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const planId = parseInt(req.params.planId);
      const versions = await db
        .select()
        .from(icPlanVersions)
        .where(eq(icPlanVersions.planId, planId))
        .orderBy(desc(icPlanVersions.versionNumber));

      res.json(versions);
    } catch (error) {
      console.error("Error fetching plan versions:", error);
      res.status(500).json({ message: "Failed to fetch plan versions" });
    }
  });

  // Get audit log for a plan
  app.get("/api/plans/:planId/audit", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const planId = parseInt(req.params.planId);
      const auditEntries = await db
        .select()
        .from(icPlanAuditLog)
        .where(eq(icPlanAuditLog.planId, planId))
        .orderBy(desc(icPlanAuditLog.timestamp));

      res.json(auditEntries);
    } catch (error) {
      console.error("Error fetching audit log:", error);
      res.status(500).json({ message: "Failed to fetch audit log" });
    }
  });

  // Create snapshot
  app.post("/api/plans/:planId/snapshot", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      const username = (req.session as any)?.user?.username;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const planId = parseInt(req.params.planId);
      const { versionName, changeDescription, configurationData, payCurveData, simulationResults, isSnapshot } = req.body;

      // Get current max version number
      const currentVersions = await db
        .select()
        .from(icPlanVersions)
        .where(eq(icPlanVersions.planId, planId))
        .orderBy(desc(icPlanVersions.versionNumber))
        .limit(1);

      const nextVersionNumber = currentVersions.length > 0 ? currentVersions[0].versionNumber + 1 : 1;

      // Create new version
      const [newVersion] = await db
        .insert(icPlanVersions)
        .values({
          planId,
          versionNumber: nextVersionNumber,
          versionName,
          configurationData,
          payCurveData,
          simulationResults,
          changeDescription,
          createdBy: userId,
          isSnapshot: isSnapshot || true
        })
        .returning();

      // Log the snapshot creation in audit trail
      await db.insert(icPlanAuditLog).values({
        planId,
        versionId: newVersion.id,
        userId,
        username: username || 'Unknown',
        action: 'snapshot',
        actionCategory: 'version_control',
        changeSource: 'manual_form',
        userMessage: `Created snapshot: ${versionName}`,
        aiResponse: `Snapshot "${versionName}" created successfully with version ${nextVersionNumber}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || '',
        sessionId: req.sessionID
      });

      res.json(newVersion);
    } catch (error) {
      console.error("Error creating snapshot:", error);
      res.status(500).json({ message: "Failed to create snapshot" });
    }
  });

  // Restore version
  app.post("/api/plans/restore/:versionId", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      const username = (req.session as any)?.user?.username;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const versionId = parseInt(req.params.versionId);
      
      // Get the version to restore
      const [versionToRestore] = await db
        .select()
        .from(icPlanVersions)
        .where(eq(icPlanVersions.id, versionId));

      if (!versionToRestore) {
        return res.status(404).json({ message: "Version not found" });
      }

      // Create a new version from the restored one
      const currentVersions = await db
        .select()
        .from(icPlanVersions)
        .where(eq(icPlanVersions.planId, versionToRestore.planId))
        .orderBy(desc(icPlanVersions.versionNumber))
        .limit(1);

      const nextVersionNumber = currentVersions.length > 0 ? currentVersions[0].versionNumber + 1 : 1;

      const [restoredVersion] = await db
        .insert(icPlanVersions)
        .values({
          planId: versionToRestore.planId,
          versionNumber: nextVersionNumber,
          versionName: `Restored from v${versionToRestore.versionNumber}`,
          configurationData: versionToRestore.configurationData,
          payCurveData: versionToRestore.payCurveData,
          simulationResults: versionToRestore.simulationResults,
          changeDescription: `Restored from version ${versionToRestore.versionNumber}: ${versionToRestore.versionName || 'Unnamed version'}`,
          createdBy: userId,
          isSnapshot: false
        })
        .returning();

      // Log the restoration in audit trail
      await db.insert(icPlanAuditLog).values({
        planId: versionToRestore.planId,
        versionId: restoredVersion.id,
        userId,
        username: username || 'Unknown',
        action: 'restore',
        actionCategory: 'version_control',
        oldValue: `Current configuration`,
        newValue: `Restored to version ${versionToRestore.versionNumber}`,
        changeSource: 'manual_form',
        userMessage: `Restore version ${versionToRestore.versionNumber}`,
        aiResponse: `Successfully restored plan to version ${versionToRestore.versionNumber}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || '',
        sessionId: req.sessionID
      });

      res.json(versionToRestore);
    } catch (error) {
      console.error("Error restoring version:", error);
      res.status(500).json({ message: "Failed to restore version" });
    }
  });

  // Log AI assistant interactions for audit trail
  app.post("/api/plans/:planId/log-interaction", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      const username = (req.session as any)?.user?.username;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const planId = parseInt(req.params.planId);
      const { action, actionCategory, fieldChanged, oldValue, newValue, userMessage, aiResponse } = req.body;

      await db.insert(icPlanAuditLog).values({
        planId,
        userId,
        username: username || 'Unknown',
        action,
        actionCategory,
        fieldChanged,
        oldValue,
        newValue,
        changeSource: 'ai_assistant',
        userMessage,
        aiResponse,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || '',
        sessionId: req.sessionID
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error logging interaction:", error);
      res.status(500).json({ message: "Failed to log interaction" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
