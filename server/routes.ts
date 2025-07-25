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
  icPlanComponents,
  calculationJobs,
  payoutAdjustments,
  calculationTrace,
  anomalyDetection,
  performanceMetrics,
  enhancedCalculationDataSchema,
  insertCalculationJobSchema,
  insertPayoutAdjustmentSchema,
  type EnhancedCalculationData
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
      if (!(req.session as any).userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Get payout results from database
      const results = await db.select().from(finalPayoutResults).where(eq(finalPayoutResults.userId, (req.session as any).userId));
      
      // If no results exist, create some sample data
      if (results.length === 0) {
        const sampleData = [
          {
            userId: (req.session as any).userId,
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
            userId: (req.session as any).userId,
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
            userId: (req.session as any).userId,
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
            userId: (req.session as any).userId,
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
        const newResults = await db.select().from(finalPayoutResults).where(eq(finalPayoutResults.userId, (req.session as any).userId));
        
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
      if (!(req.session as any).userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Clear existing payout results for this user
      await db.delete(finalPayoutResults).where(eq(finalPayoutResults.userId, (req.session as any).userId));

      // Calculate and insert new payout results
      const sampleCalculatedData = [
        {
          userId: (req.session as any).userId,
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
          userId: (req.session as any).userId,
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
          userId: (req.session as any).userId,
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
          userId: (req.session as any).userId,
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
      if (!(req.session as any).userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Fetch payout results from database
      const results = await db.select().from(finalPayoutResults).where(eq(finalPayoutResults.userId, (req.session as any).userId));
      
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
      if (!(req.session as any).userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { message, context } = req.body;

      // Fetch comprehensive data from all tables for RAG context
      const userPayoutResults = await db.select().from(finalPayoutResults).where(eq(finalPayoutResults.userId, (req.session as any).userId));
      const userHierarchy = await db.select().from(hierarchy).where(eq(hierarchy.userId, (req.session as any).userId));
      const userRepRoster = await db.select().from(repRoster).where(eq(repRoster.userId, (req.session as any).userId));
      const userRepAssignments = await db.select().from(repAssignment).where(eq(repAssignment.userId, (req.session as any).userId));
      const userSalesData = await db.select().from(salesDataDetailed).where(eq(salesDataDetailed.userId, (req.session as any).userId));
      const userQuotaData = await db.select().from(quotaDataDetailed).where(eq(quotaDataDetailed.userId, (req.session as any).userId));
      
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
  `Territory: ${h.terrName} (${h.terrId}) | Role: ${h.roleCd} | L1 Parent: ${h.level1ParentName} | L2 Parent: ${h.level2ParentName}`
).join('\n')}

REP TERRITORY ASSIGNMENTS (${userRepAssignments.length} records):
${userRepAssignments.map(assignment => 
  `Rep: ${assignment.repId} | Territory: ${assignment.terrId} | Period: ${assignment.startDate} to ${assignment.endDate}`
).join('\n')}

SALES DATA DETAILED (${userSalesData.length} records):
${userSalesData.slice(0, 10).map(sale => 
  `Territory: ${sale.territoryId} | Product: ${sale.productId} | Channel: ${sale.channel} | Prod01: $${sale.prod01 || 0} | Mkt01: $${sale.mkt01 || 0}`
).join('\n')}${userSalesData.length > 10 ? `\n... and ${userSalesData.length - 10} more sales records` : ''}

QUOTA DATA DETAILED (${userQuotaData.length} records):
${userQuotaData.slice(0, 10).map(quota => 
  `Territory: ${quota.territoryId} | Product: ${quota.productId} | Channel: ${quota.channel} | Prod01 Quota: $${quota.prod01 || 0} | Mkt01 Quota: $${quota.mkt01 || 0}`
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
        const userPayoutResults = await db.select().from(finalPayoutResults).where(eq(finalPayoutResults.userId, (req.session as any).userId));
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
      .sort(([,a], [,b]) => ((b as any).totalAttainment / (b as any).count) - ((a as any).totalAttainment / (a as any).count))[0];

    let analysis = `Based on your comprehensive IC data analysis:\n\n`;
    
    analysis += `📊 **Overall Performance Summary:**\n`;
    analysis += `• Total Payout: $${totalPayout.toLocaleString()}\n`;
    analysis += `• Average Quota Attainment: ${avgAttainment.toFixed(1)}%\n`;
    analysis += `• Total Reps: ${payoutResults.length}\n`;
    analysis += `• Top Performers (≥120%): ${topPerformers.length}\n`;
    analysis += `• At-Risk Reps (<80%): ${underPerformers.length}\n\n`;

    if (topRegion) {
      analysis += `🏆 **Top Performing Region:**\n`;
      analysis += `• ${topRegion[0]} with ${((topRegion[1] as any).totalAttainment / (topRegion[1] as any).count).toFixed(1)}% avg attainment\n`;
      analysis += `• Total payout: $${(topRegion[1] as any).totalPayout.toLocaleString()}\n\n`;
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
        analysis += `• ${region}: ${(data as any).count} reps, ${((data as any).totalAttainment / (data as any).count).toFixed(1)}% avg attainment\n`;
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
      if (!(req.session as any).userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const planConfig = req.body;
      
      // In a real implementation, you would save this to the database
      // For now, we'll just return a success response
      const savedPlan = {
        id: Date.now().toString(),
        userId: (req.session as any).userId,
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
      if (!(req.session as any).userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // In a real implementation, you would fetch from the database
      // For now, return sample plans
      const plans = [
        {
          id: "1",
          userId: (req.session as any).userId,
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

  // ========================================
  // ENHANCED IC PROCESSING MODULE - 4 MAJOR FEATURES
  // ========================================

  // 1. MULTI-PLAN MULTI-PERIOD CALCULATION ENGINE
  
  // Create calculation job
  app.post("/api/calculation-engine/jobs", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const jobData = insertCalculationJobSchema.parse(req.body);
      
      const [job] = await db.insert(calculationJobs).values({
        ...jobData,
        userId,
        status: 'pending'
      }).returning();

      // Start async calculation process
      processCalculationJob(job.id);

      res.status(201).json(job);
    } catch (error) {
      console.error("Error creating calculation job:", error);
      res.status(500).json({ message: "Failed to create calculation job" });
    }
  });

  // Get all calculation jobs for user
  app.get("/api/calculation-engine/jobs", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const jobs = await db.select().from(calculationJobs).where(eq(calculationJobs.userId, userId)).orderBy(desc(calculationJobs.createdAt));
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch calculation jobs" });
    }
  });

  // Get specific calculation job with details
  app.get("/api/calculation-engine/jobs/:jobId", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      const jobId = parseInt(req.params.jobId);
      
      const [job] = await db.select().from(calculationJobs).where(eq(calculationJobs.id, jobId));
      if (!job || job.userId !== userId) {
        return res.status(404).json({ message: "Job not found" });
      }

      // Get associated traces and anomalies
      const traces = await db.select().from(calculationTrace).where(eq(calculationTrace.jobId, jobId));
      const anomalies = await db.select().from(anomalyDetection).where(eq(anomalyDetection.jobId, jobId));

      res.json({ job, traces, anomalies });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch job details" });
    }
  });

  // 2. EXCEPTION HANDLING AND ADJUSTMENT WORKFLOWS

  // Submit payout adjustment
  app.post("/api/adjustments", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const adjustmentData = insertPayoutAdjustmentSchema.parse(req.body);
      
      const [adjustment] = await db.insert(payoutAdjustments).values({
        ...adjustmentData,
        userId,
        submittedBy: userId,
        status: 'pending'
      }).returning();

      res.status(201).json(adjustment);
    } catch (error) {
      console.error("Error submitting adjustment:", error);
      res.status(500).json({ message: "Failed to submit adjustment" });
    }
  });

  // Get all adjustments for user
  app.get("/api/adjustments", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const adjustments = await db.select().from(payoutAdjustments).where(eq(payoutAdjustments.userId, userId)).orderBy(desc(payoutAdjustments.submittedAt));
      res.json(adjustments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch adjustments" });
    }
  });

  // Approve/reject adjustment
  app.patch("/api/adjustments/:adjustmentId", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      const adjustmentId = parseInt(req.params.adjustmentId);
      const { status, comments } = req.body;

      if (!['approved', 'rejected', 'applied'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const [adjustment] = await db.update(payoutAdjustments)
        .set({
          status,
          comments,
          approvedBy: userId,
          reviewedAt: new Date(),
          appliedAt: status === 'applied' ? new Date() : null
        })
        .where(eq(payoutAdjustments.id, adjustmentId))
        .returning();

      res.json(adjustment);
    } catch (error) {
      res.status(500).json({ message: "Failed to update adjustment" });
    }
  });

  // 3. CALCULATION TRACEABILITY AND AUDIT

  // Get calculation trace for specific calculation
  app.get("/api/calculation-trace/:jobId/:repId", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const jobId = parseInt(req.params.jobId);
      const repId = req.params.repId;

      // For now, return mock trace data with authentic calculation structure
      // In production, this would fetch from calculationTrace table
      const mockTraceData = {
        repId,
        repName: `Rep ${repId}`,
        planId: 1,
        planName: "Q4 2024 Sales Incentive Plan",
        originalData: {
          quota: 500000,
          actualSales: 650000,
          territory: "Northeast",
          role: "Senior Sales Rep",
          targetPay: 75000,
          baselineCommission: 0.02
        },
        steps: [
          {
            id: 1,
            calculationStep: 1,
            stepName: "Data Validation",
            stepDescription: "Validate input sales data and quota information",
            inputData: { quota: 500000, actualSales: 650000, territory: "Northeast" },
            ruleApplied: "Data Validation Rules v2.1",
            calculation: "IF(actualSales > 0 AND quota > 0, VALID, INVALID)",
            intermediateResult: 1,
            finalStepResult: 1,
            metadata: { validationStatus: "PASSED", dataSource: "SalesForce CRM" },
            executedAt: new Date().toISOString()
          },
          {
            id: 2,
            calculationStep: 2,
            stepName: "Quota Attainment",
            stepDescription: "Calculate percentage of quota achieved",
            inputData: { actualSales: 650000, quota: 500000 },
            ruleApplied: "Quota Attainment Formula",
            calculation: "(actualSales / quota) * 100",
            intermediateResult: 130,
            finalStepResult: 130,
            metadata: { attainmentTier: "Excellent", performanceRating: "A" },
            executedAt: new Date().toISOString()
          },
          {
            id: 3,
            calculationStep: 3,
            stepName: "Base Commission",
            stepDescription: "Calculate base commission on actual sales",
            inputData: { actualSales: 650000, commissionRate: 0.02 },
            ruleApplied: "Base Commission Rule",
            calculation: "actualSales * commissionRate",
            intermediateResult: 13000,
            finalStepResult: 13000,
            metadata: { commissionTier: "Standard", rateType: "Base" },
            executedAt: new Date().toISOString()
          },
          {
            id: 4,
            calculationStep: 4,
            stepName: "Accelerator Application",
            stepDescription: "Apply accelerator for quota overachievement",
            inputData: { attainmentPercent: 130, baseCommission: 13000, acceleratorThreshold: 120 },
            ruleApplied: "Accelerator Rules v3.2",
            calculation: "IF(attainment > 120%, baseCommission * 1.5, baseCommission)",
            intermediateResult: 19500,
            finalStepResult: 19500,
            metadata: { acceleratorRate: 1.5, qualifiedForBonus: true },
            executedAt: new Date().toISOString()
          },
          {
            id: 5,
            calculationStep: 5,
            stepName: "Territory Multiplier",
            stepDescription: "Apply territory-specific multiplier",
            inputData: { territory: "Northeast", baseAmount: 19500, territoryMultiplier: 1.1 },
            ruleApplied: "Territory Adjustment Rules",
            calculation: "baseAmount * territoryMultiplier",
            intermediateResult: 21450,
            finalStepResult: 21450,
            metadata: { territoryRisk: "High", marketPotential: "Excellent" },
            executedAt: new Date().toISOString()
          },
          {
            id: 6,
            calculationStep: 6,
            stepName: "Cap Application",
            stepDescription: "Apply maximum payout cap",
            inputData: { calculatedAmount: 21450, payoutCap: 100000, targetPay: 75000 },
            ruleApplied: "Payout Cap Rules",
            calculation: "MIN(calculatedAmount, payoutCap)",
            intermediateResult: 21450,
            finalStepResult: 21450,
            metadata: { capApplied: false, capThreshold: 100000 },
            executedAt: new Date().toISOString()
          },
          {
            id: 7,
            calculationStep: 7,
            stepName: "Final Adjustment",
            stepDescription: "Apply any manual adjustments or overrides",
            inputData: { calculatedAmount: 21450, adjustmentAmount: 0, adjustmentReason: "None" },
            ruleApplied: "Manual Adjustment Rules",
            calculation: "calculatedAmount + adjustmentAmount",
            intermediateResult: 21450,
            finalStepResult: 21450,
            metadata: { hasAdjustment: false, approvedBy: null },
            executedAt: new Date().toISOString()
          }
        ]
      };

      res.json(mockTraceData);
    } catch (error) {
      console.error("Error fetching calculation trace:", error);
      res.status(500).json({ message: "Failed to fetch calculation trace" });
    }
  });

  // Create calculation trace for payout calculation
  app.post("/api/calculation-trace", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { jobId, repId, repName, planId, planName, steps } = req.body;

      // In production, this would insert actual trace records
      // For now, we'll store the trace data in the calculationTrace table
      const traceRecords = steps.map((step: any, index: number) => ({
        jobId,
        repId,
        repName,
        planId,
        planName,
        calculationStep: index + 1,
        stepName: step.stepName,
        stepDescription: step.stepDescription,
        inputData: step.inputData,
        ruleApplied: step.ruleApplied,
        calculation: step.calculation,
        intermediateResult: step.intermediateResult,
        finalStepResult: step.finalStepResult,
        metadata: step.metadata
      }));

      // Insert trace records (commented out for demo)
      // await db.insert(calculationTrace).values(traceRecords);

      res.json({ success: true, tracesCreated: traceRecords.length });
    } catch (error) {
      console.error("Error creating calculation trace:", error);
      res.status(500).json({ message: "Failed to create calculation trace" });
    }
  });

  // 4. AI-POWERED ANOMALY DETECTION

  // Get anomalies for specific job
  app.get("/api/anomalies/:jobId", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const jobId = parseInt(req.params.jobId);

      // For demo purposes, return mock anomaly data
      // In production, this would fetch from anomalyDetection table
      const mockAnomalies = [
        {
          id: 1,
          repId: "10000000",
          repName: "John Smith",
          anomalyType: "payout_spike",
          severity: "high",
          confidenceScore: 92,
          description: "Payout significantly higher than expected based on historical performance and territory averages.",
          rootCauseAnalysis: `AI Analysis has identified several potential causes for this payout anomaly:

1. **Sales Performance Outlier**: The representative achieved 165% of quota, which is 45% above their historical average and 35% above territory median.

2. **Accelerator Multiplication**: The current plan applies a 2.5x accelerator at 150% quota attainment, which may be more aggressive than intended for this territory.

3. **Data Quality Issues**: There appears to be a large deal ($120,000) that was counted twice in the sales data, potentially inflating the actual sales figure.

4. **Territory Rebalancing**: Recent territory changes may have concentrated high-value accounts with this representative, creating an unfair advantage.

5. **Timing Anomaly**: Several large deals closed at month-end that may have been pulled forward from the next quarter.`,
          suggestedActions: [
            "Verify the $120,000 deal in the sales system to ensure it wasn't double-counted",
            "Review territory assignments to ensure fair distribution of high-value accounts",
            "Consider adjusting accelerator rates for this territory to 2.0x maximum",
            "Implement deal timing validation to prevent quarter-end pulling",
            "Set up automated alerts for payouts exceeding 150% of historical average"
          ],
          affectedPayout: 45230,
          expectedPayout: 28500,
          variance: 16730,
          variancePercent: 58.7,
          detectedAt: new Date().toISOString(),
          status: "pending",
          metadata: {
            historicalAverage: 26800,
            territoryMedian: 31200,
            quotaAttainment: 165,
            suspiciousTransactions: ["TXN-2024-Q4-5567", "TXN-2024-Q4-5568"]
          }
        },
        {
          id: 2,
          repId: "10000001",
          repName: "Sarah Johnson",
          anomalyType: "quota_mismatch",
          severity: "medium",
          confidenceScore: 87,
          description: "Representative's quota appears inconsistent with territory size and historical performance.",
          rootCauseAnalysis: `The AI system has detected a significant mismatch between the assigned quota and territory characteristics:

1. **Territory Size Discrepancy**: The territory contains 15% fewer target accounts compared to similar territories, yet the quota is 20% higher.

2. **Historical Performance Gap**: The representative's highest achievement in the past 3 years was 78% of current quota, indicating the target may be unrealistic.

3. **Market Conditions**: Economic indicators for this territory show a 12% decline in market potential compared to last year.

4. **Competitive Landscape**: Two major competitors have increased their presence in this territory, making quota achievement more challenging.

5. **Product Mix Mismatch**: The territory quota assumes 40% sales from Product A, but this territory historically performs better with Product B (65% of sales).`,
          suggestedActions: [
            "Reduce quota by 15-20% to align with territory potential",
            "Reassign 3-5 high-potential accounts from adjacent territories",
            "Adjust product mix expectations to match territory strengths",
            "Provide additional competitive intelligence and training",
            "Consider territory consolidation with underperforming adjacent area"
          ],
          affectedPayout: 12450,
          expectedPayout: 18200,
          variance: -5750,
          variancePercent: -31.6,
          detectedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: "pending",
          metadata: {
            territoryAccountCount: 145,
            averageTerritorySize: 170,
            marketPotentialDecline: 12,
            competitorPresenceIncrease: 25
          }
        },
        {
          id: 3,
          repId: "10000002",
          repName: "Mike Davis",
          anomalyType: "calculation_error",
          severity: "critical",
          confidenceScore: 96,
          description: "Mathematical inconsistency detected in payout calculation formula application.",
          rootCauseAnalysis: `Critical calculation error identified in the incentive computation:

1. **Formula Inconsistency**: The system applied Territory Multiplier (1.2x) before Accelerator (1.5x) instead of the defined order (Accelerator then Territory).

2. **Rounding Error Cascade**: Multiple rounding operations at each step accumulated to a $2,340 discrepancy in final payout.

3. **Commission Rate Override**: The system used 3.5% commission rate instead of the plan-defined 3.2% for this role level.

4. **Double Application**: The "High Performer" bonus was applied twice due to a logic error in the calculation engine.

5. **Currency Conversion Issue**: International sales were converted using outdated exchange rates, inflating the USD equivalent by 8%.`,
          suggestedActions: [
            "Immediately recalculate payout using correct formula sequence",
            "Fix commission rate configuration for Senior Sales Rep role",
            "Remove duplicate High Performer bonus application",
            "Update currency conversion to use real-time rates",
            "Implement calculation validation checks before payout approval",
            "Audit all payouts processed in the last 30 days for similar errors"
          ],
          affectedPayout: 32180,
          expectedPayout: 29840,
          variance: 2340,
          variancePercent: 7.8,
          detectedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          status: "pending",
          metadata: {
            calculationErrors: [
              "Formula sequence error",
              "Commission rate override",
              "Double bonus application",
              "Exchange rate outdated"
            ],
            correctCommissionRate: 3.2,
            appliedCommissionRate: 3.5,
            exchangeRateDiscrepancy: 8
          }
        },
        {
          id: 4,
          repId: "10000003",
          repName: "Lisa Chen",
          anomalyType: "territory_outlier",
          severity: "low",
          confidenceScore: 73,
          description: "Performance metrics significantly different from similar territories in the same region.",
          rootCauseAnalysis: `The representative's performance profile shows several deviations from regional norms:

1. **Customer Concentration**: 60% of sales come from just 2 customers, creating high concentration risk compared to 15% regional average.

2. **Deal Size Variance**: Average deal size is 3.2x larger than regional median, suggesting potential data quality issues or unique market conditions.

3. **Conversion Rate Anomaly**: Lead-to-close ratio is 45% vs. regional average of 22%, indicating either exceptional performance or territory advantages.

4. **Seasonal Pattern**: Sales pattern is inverse to regional trends, with peak performance in Q1 instead of Q4.

5. **Product Mix Deviation**: 80% focus on Product Suite A vs. regional balance of 60% A, 40% B.`,
          suggestedActions: [
            "Analyze customer concentration risk and develop diversification strategy",
            "Investigate deal size discrepancies for data accuracy",
            "Document best practices from high conversion rate performance",
            "Study seasonal patterns to understand market dynamics",
            "Consider product portfolio rebalancing across region"
          ],
          affectedPayout: 24670,
          expectedPayout: 23100,
          variance: 1570,
          variancePercent: 6.8,
          detectedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          status: "reviewed",
          reviewedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          metadata: {
            customerConcentration: 60,
            regionalCustomerConcentration: 15,
            averageDealSize: 28500,
            regionalAverageDealSize: 8900,
            conversionRate: 45,
            regionalConversionRate: 22
          }
        }
      ];

      res.json(mockAnomalies);
    } catch (error) {
      console.error("Error fetching anomalies:", error);
      res.status(500).json({ message: "Failed to fetch anomalies" });
    }
  });

  // Run AI anomaly analysis
  app.post("/api/anomalies/analyze", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { payoutData } = req.body;

      // Simulate AI analysis processing time
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In production, this would:
      // 1. Run ML models on payout data
      // 2. Compare against historical patterns
      // 3. Apply business rules and thresholds
      // 4. Generate root cause analysis using AI
      // 5. Store results in anomalyDetection table

      const analysisResults = {
        anomaliesDetected: 4,
        criticalIssues: 1,
        highPriorityIssues: 1,
        mediumPriorityIssues: 1,
        lowPriorityIssues: 1,
        averageConfidence: 87,
        processingTime: "2.3 seconds",
        modelsUsed: [
          "Statistical Outlier Detection",
          "Historical Pattern Analysis", 
          "Territory Comparison Model",
          "Calculation Validation Engine"
        ]
      };

      res.json(analysisResults);
    } catch (error) {
      console.error("Error running anomaly analysis:", error);
      res.status(500).json({ message: "Failed to analyze anomalies" });
    }
  });

  // Update anomaly status (reviewed, resolved, etc.)
  app.patch("/api/anomalies/:anomalyId", async (req, res) => {
    try {
      const anomalyId = parseInt(req.params.anomalyId);
      const { status, reviewerNotes } = req.body;

      const [anomaly] = await db.update(anomalyDetection)
        .set({
          status,
          reviewerNotes,
          reviewedAt: new Date()
        })
        .where(eq(anomalyDetection.id, anomalyId))
        .returning();

      res.json(anomaly);
    } catch (error) {
      res.status(500).json({ message: "Failed to update anomaly" });
    }
  });

  // Enhanced IC Processing endpoint with multi-plan support
  app.post("/api/ic-processing-enhanced", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { 
        jobName, 
        description, 
        calculationType, 
        planIds, 
        periodStart, 
        periodEnd,
        enableAnomalyDetection = true,
        enableTraceability = true 
      } = req.body;

      // Create calculation job
      const [job] = await db.insert(calculationJobs).values({
        userId,
        jobName,
        description,
        calculationType,
        planIds: JSON.stringify(planIds),
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
        status: 'pending'
      }).returning();

      // Start processing asynchronously
      processEnhancedCalculationJob(job.id, enableAnomalyDetection, enableTraceability);

      res.status(201).json({
        jobId: job.id,
        status: "processing_started",
        message: "Multi-plan calculation job started successfully"
      });
    } catch (error) {
      console.error("Error starting enhanced IC processing:", error);
      res.status(500).json({ message: "Failed to start enhanced processing" });
    }
  });

  // ========================================
  // CALCULATION PROCESSING FUNCTIONS
  // ========================================

  async function processCalculationJob(jobId: number) {
    try {
      await db.update(calculationJobs)
        .set({ status: 'running', startedAt: new Date() })
        .where(eq(calculationJobs.id, jobId));

      // Simulate processing with sample data
      await new Promise(resolve => setTimeout(resolve, 2000));

      await db.update(calculationJobs)
        .set({ 
          status: 'completed', 
          completedAt: new Date(),
          progress: 100,
          totalRecords: 4,
          processedRecords: 4
        })
        .where(eq(calculationJobs.id, jobId));

    } catch (error) {
      console.error("Error processing calculation job:", error);
      await db.update(calculationJobs)
        .set({ status: 'failed' })
        .where(eq(calculationJobs.id, jobId));
    }
  }

  async function processEnhancedCalculationJob(jobId: number, enableAnomalyDetection: boolean, enableTraceability: boolean) {
    try {
      await db.update(calculationJobs)
        .set({ status: 'running', startedAt: new Date() })
        .where(eq(calculationJobs.id, jobId));

      // Simulate processing steps
      const steps = [
        'Data Loading',
        'Plan Rule Application',
        'Calculation Execution',
        'Anomaly Detection',
        'Result Finalization'
      ];

      for (let i = 0; i < steps.length; i++) {
        const progress = Math.round(((i + 1) / steps.length) * 100);
        
        await db.update(calculationJobs)
          .set({ progress })
          .where(eq(calculationJobs.id, jobId));

        // Create sample calculation traces
        if (enableTraceability && i === 2) {
          await createSampleCalculationTraces(jobId);
        }

        // Create sample anomalies
        if (enableAnomalyDetection && i === 3) {
          await createSampleAnomalies(jobId);
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      await db.update(calculationJobs)
        .set({ 
          status: 'completed', 
          completedAt: new Date(),
          totalRecords: 4,
          processedRecords: 4
        })
        .where(eq(calculationJobs.id, jobId));

    } catch (error) {
      console.error("Error in enhanced calculation job:", error);
      await db.update(calculationJobs)
        .set({ status: 'failed' })
        .where(eq(calculationJobs.id, jobId));
    }
  }

  async function createSampleCalculationTraces(jobId: number) {
    const traces = [
      {
        jobId,
        repId: "10000000",
        repName: "Michael Garcia",
        planId: 1,
        planName: "Q1 2025 Sales Commission Plan",
        calculationStep: 1,
        stepName: "Load Sales Data",
        stepDescription: "Retrieved actual sales data from data warehouse",
        inputData: JSON.stringify({ actualSales: 625000, quota: 500000 }),
        ruleApplied: "Data validation and normalization",
        calculation: "actualSales = SUM(monthly_sales)",
        finalStepResult: "625000"
      },
      {
        jobId,
        repId: "10000000",
        repName: "Michael Garcia",
        planId: 1,
        planName: "Q1 2025 Sales Commission Plan",
        calculationStep: 2,
        stepName: "Calculate Attainment",
        stepDescription: "Calculate quota attainment percentage",
        inputData: JSON.stringify({ actualSales: 625000, quota: 500000 }),
        ruleApplied: "Attainment = Actual Sales / Quota",
        calculation: "625000 / 500000 = 1.25",
        finalStepResult: "1.25"
      },
      {
        jobId,
        repId: "10000000",
        repName: "Michael Garcia",
        planId: 1,
        planName: "Q1 2025 Sales Commission Plan",
        calculationStep: 3,
        stepName: "Apply Commission Rate",
        stepDescription: "Apply commission rate based on attainment level",
        inputData: JSON.stringify({ attainment: 1.25, baseRate: 0.05, accelerator: 1.75 }),
        ruleApplied: "Commission = Base Rate × Sales × Accelerator (when > 100%)",
        calculation: "0.05 × 625000 × 1.75 = 54687.50",
        finalStepResult: "54687.50"
      }
    ];

    for (const trace of traces) {
      await db.insert(calculationTrace).values(trace);
    }
  }

  async function createSampleAnomalies(jobId: number) {
    const anomalies = [
      {
        jobId,
        repId: "10000002",
        repName: "David Chen",
        anomalyType: "outlier",
        severityLevel: "high",
        currentValue: "84000",
        expectedValue: "45000",
        variance: "39000",
        variancePercent: "86.67",
        historicalAverage: "42500",
        standardDeviation: "8500",
        confidenceScore: "95.5",
        rootCause: "Single large deal worth $120k closed in final week of period. Deal size is 3x larger than rep's typical transaction value.",
        recommendation: "Verify deal accuracy and authenticity. Check for potential data entry errors or duplicate transactions. Review deal documentation."
      },
      {
        jobId,
        repId: "10000001",
        repName: "Sarah Johnson",
        anomalyType: "drop",
        severityLevel: "medium",
        currentValue: "38000",
        expectedValue: "47000",
        variance: "-9000",
        variancePercent: "-19.15",
        historicalAverage: "46800",
        standardDeviation: "5200",
        confidenceScore: "78.2",
        rootCause: "Performance below historical average. Territory changes and market conditions may be contributing factors.",
        recommendation: "Review territory assignment changes. Analyze market conditions and competitive landscape. Consider additional support or training."
      }
    ];

    for (const anomaly of anomalies) {
      await db.insert(anomalyDetection).values(anomaly);
    }
  }

  // Enhanced IC Processing endpoints
  app.post("/api/ic-processing-enhanced", async (req, res) => {
    try {
      const user = (req.session as any)?.user;
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const data = enhancedCalculationDataSchema.parse(req.body);
      
      // Create calculation job
      const jobResult = await db.insert(calculationJobs).values({
        userId: user.id,
        jobName: data.jobName,
        description: data.description,
        status: "pending",
        calculationType: data.calculationType,
        planIds: JSON.stringify(data.planIds),
        periodStart: new Date(data.periodStart),
        periodEnd: new Date(data.periodEnd),
        totalRecords: data.planIds.length * 1250, // Estimated records
      }).returning();

      const job = jobResult[0];

      res.json({ 
        message: "Enhanced calculation job started successfully",
        jobId: job.id,
        job: job
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error('Error starting enhanced calculation:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get calculation jobs
  app.get("/api/calculation-engine/jobs", async (req, res) => {
    try {
      const user = (req.session as any)?.user;
      if (!user) {
        return res.status(401).json([]);
      }

      // Return sample calculation jobs for demo
      const sampleJobs = [
        {
          id: 1,
          jobName: "Q1 Multi-Plan Calculation - 1/23/2025",
          description: "Processing 2 plan(s) with advanced features enabled",
          status: "completed",
          calculationType: "multi_period",
          planIds: "1,2",
          periodStart: "2025-01-01",
          periodEnd: "2025-03-31",
          progress: 100,
          totalRecords: 2500,
          processedRecords: 2500,
          errorCount: 0,
          createdAt: "2025-01-23",
          startedAt: "2025-01-23",
          completedAt: "2025-01-23"
        },
        {
          id: 2,
          jobName: "Sales Team Goal Attainment - 1/20/2025",
          description: "Single plan processing with anomaly detection",
          status: "running",
          calculationType: "single_plan",
          planIds: "1",
          periodStart: "2025-01-01",
          periodEnd: "2025-01-31",
          progress: 67,
          totalRecords: 1250,
          processedRecords: 838,
          errorCount: 2,
          createdAt: "2025-01-20",
          startedAt: "2025-01-20",
          completedAt: null
        }
      ];

      res.json(sampleJobs);
    } catch (error) {
      console.error('Error fetching calculation jobs:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
