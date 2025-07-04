import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// IC Plans table
export const icPlans = pgTable("ic_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  product: text("product").notNull(),
  team: text("team").notNull(),
  role: text("role").notNull(),
  planType: text("plan_type").notNull(), // "Goal Attainment" or "Goal Attainment with Relative Rank"
  rules: jsonb("rules").notNull(), // Store business rules as JSON
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Hierarchy table
export const hierarchy = pgTable("hierarchy", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  teamId: text("team_id").notNull(),
  terrId: text("terr_id").notNull(),
  terrName: text("terr_name").notNull(),
  roleCd: text("role_cd").notNull(),
  level1ParentId: text("level1_parent_id"),
  level1ParentName: text("level1_parent_name"),
  level1ParentRoleCd: text("level1_parent_role_cd"),
  level2ParentId: text("level2_parent_id"),
  level2ParentName: text("level2_parent_name"),
  level2ParentRoleCd: text("level2_parent_role_cd"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// File Uploads table
export const fileUploads = pgTable("file_uploads", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(), // "hierarchy", "rep_roster", "rep_territory", "sales_data", "target_pay"
  fileSize: integer("file_size").notNull(),
  uploadStatus: text("upload_status").notNull().default("pending"), // "pending", "validated", "failed"
  validationErrors: jsonb("validation_errors"), // Store validation errors as JSON
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

// Sales Data table
export const salesData = pgTable("sales_data", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  repId: text("rep_id").notNull(),
  territory: text("territory").notNull(),
  product: text("product").notNull(),
  salesAmount: decimal("sales_amount", { precision: 15, scale: 2 }).notNull(),
  quota: decimal("quota", { precision: 15, scale: 2 }).notNull(),
  period: text("period").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Payout Calculations table
export const payoutCalculations = pgTable("payout_calculations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  icPlanId: integer("ic_plan_id").references(() => icPlans.id).notNull(),
  repId: text("rep_id").notNull(),
  territory: text("territory").notNull(),
  quotaAttainment: decimal("quota_attainment", { precision: 5, scale: 2 }).notNull(),
  payoutAmount: decimal("payout_amount", { precision: 15, scale: 2 }).notNull(),
  targetPay: decimal("target_pay", { precision: 15, scale: 2 }).notNull(),
  calculatedAt: timestamp("calculated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = insertUserSchema.extend({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

// Create schemas for new tables
export const insertIcPlanSchema = createInsertSchema(icPlans).pick({
  name: true,
  product: true,
  team: true,
  role: true,
  planType: true,
  rules: true,
});

export const insertHierarchySchema = createInsertSchema(hierarchy).pick({
  teamId: true,
  terrId: true,
  terrName: true,
  roleCd: true,
  level1ParentId: true,
  level1ParentName: true,
  level1ParentRoleCd: true,
  level2ParentId: true,
  level2ParentName: true,
  level2ParentRoleCd: true,
});

export const insertFileUploadSchema = createInsertSchema(fileUploads).pick({
  fileName: true,
  fileType: true,
  fileSize: true,
});

export const insertSalesDataSchema = createInsertSchema(salesData).pick({
  repId: true,
  territory: true,
  product: true,
  salesAmount: true,
  quota: true,
  period: true,
});

export const insertPayoutCalculationSchema = createInsertSchema(payoutCalculations).pick({
  icPlanId: true,
  repId: true,
  territory: true,
  quotaAttainment: true,
  payoutAmount: true,
  targetPay: true,
});

// File upload validation schema
export const fileTypeEnum = z.enum(["hierarchy", "rep_roster", "rep_territory", "sales_data", "target_pay", "quota_data"]);
export const fileUploadSchema = z.object({
  fileTypes: z.array(fileTypeEnum).min(1, "Please select at least one file type"),
  paycurve: z.enum(["Goal Attainment", "Goal Attainment with Relative Rank"]).optional(),
});

// IC Plan selection schema
export const icPlanSelectionSchema = z.object({
  productName: z.string().min(1, "Product name is required"),
  teamName: z.string().min(1, "Team name is required"),
  planType: z.enum(["Goal Attainment", "Goal Attainment with Relative Rank"]),
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoginData = z.infer<typeof loginSchema>;
export type SignupData = z.infer<typeof signupSchema>;
export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

export type IcPlan = typeof icPlans.$inferSelect;
export type InsertIcPlan = z.infer<typeof insertIcPlanSchema>;
export type Hierarchy = typeof hierarchy.$inferSelect;
export type InsertHierarchy = z.infer<typeof insertHierarchySchema>;
export type FileUpload = typeof fileUploads.$inferSelect;
export type InsertFileUpload = z.infer<typeof insertFileUploadSchema>;
export type SalesData = typeof salesData.$inferSelect;
export type InsertSalesData = z.infer<typeof insertSalesDataSchema>;
export type PayoutCalculation = typeof payoutCalculations.$inferSelect;
export type InsertPayoutCalculation = z.infer<typeof insertPayoutCalculationSchema>;

export type FileUploadData = z.infer<typeof fileUploadSchema>;
export type IcPlanSelectionData = z.infer<typeof icPlanSelectionSchema>;

// Rep Roster table
export const repRoster = pgTable("rep_roster", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  repId: text("rep_id").notNull(),
  repName: text("rep_name").notNull(),
  emailId: text("email_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Rep Assignment table
export const repAssignment = pgTable("rep_assignment", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  terrId: text("terr_id").notNull(),
  repId: text("rep_id").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Sales Data table (detailed with all product columns)
export const salesDataDetailed = pgTable("sales_data_detailed", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  dataMonth: text("data_month").notNull(),
  teamId: text("team_id").notNull(),
  territoryId: text("territory_id").notNull(),
  productId: text("product_id").notNull(),
  dataType: text("data_type").notNull(),
  channel: text("channel").notNull(),
  prod01: decimal("prod01", { precision: 15, scale: 2 }),
  mkt01: decimal("mkt01", { precision: 15, scale: 2 }),
  prod02: decimal("prod02", { precision: 15, scale: 2 }),
  mkt02: decimal("mkt02", { precision: 15, scale: 2 }),
  prod03: decimal("prod03", { precision: 15, scale: 2 }),
  mkt03: decimal("mkt03", { precision: 15, scale: 2 }),
  prod04: decimal("prod04", { precision: 15, scale: 2 }),
  mkt04: decimal("mkt04", { precision: 15, scale: 2 }),
  prod05: decimal("prod05", { precision: 15, scale: 2 }),
  mkt05: decimal("mkt05", { precision: 15, scale: 2 }),
  prod06: decimal("prod06", { precision: 15, scale: 2 }),
  mkt06: decimal("mkt06", { precision: 15, scale: 2 }),
  prod07: decimal("prod07", { precision: 15, scale: 2 }),
  mkt07: decimal("mkt07", { precision: 15, scale: 2 }),
  prod08: decimal("prod08", { precision: 15, scale: 2 }),
  mkt08: decimal("mkt08", { precision: 15, scale: 2 }),
  prod09: decimal("prod09", { precision: 15, scale: 2 }),
  mkt09: decimal("mkt09", { precision: 15, scale: 2 }),
  prod10: decimal("prod10", { precision: 15, scale: 2 }),
  mkt10: decimal("mkt10", { precision: 15, scale: 2 }),
  prod11: decimal("prod11", { precision: 15, scale: 2 }),
  mkt11: decimal("mkt11", { precision: 15, scale: 2 }),
  prod12: decimal("prod12", { precision: 15, scale: 2 }),
  mkt12: decimal("mkt12", { precision: 15, scale: 2 }),
  prod13: decimal("prod13", { precision: 15, scale: 2 }),
  mkt13: decimal("mkt13", { precision: 15, scale: 2 }),
  prod14: decimal("prod14", { precision: 15, scale: 2 }),
  mkt14: decimal("mkt14", { precision: 15, scale: 2 }),
  prod15: decimal("prod15", { precision: 15, scale: 2 }),
  mkt15: decimal("mkt15", { precision: 15, scale: 2 }),
  prod16: decimal("prod16", { precision: 15, scale: 2 }),
  mkt16: decimal("mkt16", { precision: 15, scale: 2 }),
  prod17: decimal("prod17", { precision: 15, scale: 2 }),
  mkt17: decimal("mkt17", { precision: 15, scale: 2 }),
  prod18: decimal("prod18", { precision: 15, scale: 2 }),
  mkt18: decimal("mkt18", { precision: 15, scale: 2 }),
  prod19: decimal("prod19", { precision: 15, scale: 2 }),
  mkt19: decimal("mkt19", { precision: 15, scale: 2 }),
  prod20: decimal("prod20", { precision: 15, scale: 2 }),
  mkt20: decimal("mkt20", { precision: 15, scale: 2 }),
  prod21: decimal("prod21", { precision: 15, scale: 2 }),
  mkt21: decimal("mkt21", { precision: 15, scale: 2 }),
  prod22: decimal("prod22", { precision: 15, scale: 2 }),
  mkt22: decimal("mkt22", { precision: 15, scale: 2 }),
  prod23: decimal("prod23", { precision: 15, scale: 2 }),
  mkt23: decimal("mkt23", { precision: 15, scale: 2 }),
  prod24: decimal("prod24", { precision: 15, scale: 2 }),
  mkt24: decimal("mkt24", { precision: 15, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Quota Data table (same structure as sales data)
export const quotaDataDetailed = pgTable("quota_data_detailed", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  dataMonth: text("data_month").notNull(),
  teamId: text("team_id").notNull(),
  territoryId: text("territory_id").notNull(),
  productId: text("product_id").notNull(),
  dataType: text("data_type").notNull(),
  channel: text("channel").notNull(),
  prod01: decimal("prod01", { precision: 15, scale: 2 }),
  mkt01: decimal("mkt01", { precision: 15, scale: 2 }),
  prod02: decimal("prod02", { precision: 15, scale: 2 }),
  mkt02: decimal("mkt02", { precision: 15, scale: 2 }),
  prod03: decimal("prod03", { precision: 15, scale: 2 }),
  mkt03: decimal("mkt03", { precision: 15, scale: 2 }),
  prod04: decimal("prod04", { precision: 15, scale: 2 }),
  mkt04: decimal("mkt04", { precision: 15, scale: 2 }),
  prod05: decimal("prod05", { precision: 15, scale: 2 }),
  mkt05: decimal("mkt05", { precision: 15, scale: 2 }),
  prod06: decimal("prod06", { precision: 15, scale: 2 }),
  mkt06: decimal("mkt06", { precision: 15, scale: 2 }),
  prod07: decimal("prod07", { precision: 15, scale: 2 }),
  mkt07: decimal("mkt07", { precision: 15, scale: 2 }),
  prod08: decimal("prod08", { precision: 15, scale: 2 }),
  mkt08: decimal("mkt08", { precision: 15, scale: 2 }),
  prod09: decimal("prod09", { precision: 15, scale: 2 }),
  mkt09: decimal("mkt09", { precision: 15, scale: 2 }),
  prod10: decimal("prod10", { precision: 15, scale: 2 }),
  mkt10: decimal("mkt10", { precision: 15, scale: 2 }),
  prod11: decimal("prod11", { precision: 15, scale: 2 }),
  mkt11: decimal("mkt11", { precision: 15, scale: 2 }),
  prod12: decimal("prod12", { precision: 15, scale: 2 }),
  mkt12: decimal("mkt12", { precision: 15, scale: 2 }),
  prod13: decimal("prod13", { precision: 15, scale: 2 }),
  mkt13: decimal("mkt13", { precision: 15, scale: 2 }),
  prod14: decimal("prod14", { precision: 15, scale: 2 }),
  mkt14: decimal("mkt14", { precision: 15, scale: 2 }),
  prod15: decimal("prod15", { precision: 15, scale: 2 }),
  mkt15: decimal("mkt15", { precision: 15, scale: 2 }),
  prod16: decimal("prod16", { precision: 15, scale: 2 }),
  mkt16: decimal("mkt16", { precision: 15, scale: 2 }),
  prod17: decimal("prod17", { precision: 15, scale: 2 }),
  mkt17: decimal("mkt17", { precision: 15, scale: 2 }),
  prod18: decimal("prod18", { precision: 15, scale: 2 }),
  mkt18: decimal("mkt18", { precision: 15, scale: 2 }),
  prod19: decimal("prod19", { precision: 15, scale: 2 }),
  mkt19: decimal("mkt19", { precision: 15, scale: 2 }),
  prod20: decimal("prod20", { precision: 15, scale: 2 }),
  mkt20: decimal("mkt20", { precision: 15, scale: 2 }),
  prod21: decimal("prod21", { precision: 15, scale: 2 }),
  mkt21: decimal("mkt21", { precision: 15, scale: 2 }),
  prod22: decimal("prod22", { precision: 15, scale: 2 }),
  mkt22: decimal("mkt22", { precision: 15, scale: 2 }),
  prod23: decimal("prod23", { precision: 15, scale: 2 }),
  mkt23: decimal("mkt23", { precision: 15, scale: 2 }),
  prod24: decimal("prod24", { precision: 15, scale: 2 }),
  mkt24: decimal("mkt24", { precision: 15, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Pay Curve Goal Attainment table
export const payCurveGoalAttainment = pgTable("pay_curve_goal_attainment", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  percentileRank: decimal("percentile_rank", { precision: 5, scale: 2 }).notNull(),
  bonusAttainment: decimal("bonus_attainment", { precision: 5, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Pay Curve Goal Rank Attainment table
export const payCurveGoalRankAttainment = pgTable("pay_curve_goal_rank_attainment", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  goalAttainment: decimal("goal_attainment", { precision: 5, scale: 2 }).notNull(),
  bonusAttainment: decimal("bonus_attainment", { precision: 5, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas for new tables
export const insertRepRosterSchema = createInsertSchema(repRoster).pick({
  repId: true,
  repName: true,
  emailId: true,
});

export const insertRepAssignmentSchema = createInsertSchema(repAssignment).pick({
  terrId: true,
  repId: true,
  startDate: true,
  endDate: true,
});

export const insertSalesDataDetailedSchema = createInsertSchema(salesDataDetailed).pick({
  dataMonth: true,
  teamId: true,
  territoryId: true,
  productId: true,
  dataType: true,
  channel: true,
});

export const insertQuotaDataDetailedSchema = createInsertSchema(quotaDataDetailed).pick({
  dataMonth: true,
  teamId: true,
  territoryId: true,
  productId: true,
  dataType: true,
  channel: true,
});

export const insertPayCurveGoalAttainmentSchema = createInsertSchema(payCurveGoalAttainment).pick({
  percentileRank: true,
  bonusAttainment: true,
});

export const insertPayCurveGoalRankAttainmentSchema = createInsertSchema(payCurveGoalRankAttainment).pick({
  goalAttainment: true,
  bonusAttainment: true,
});

// Types for new tables
export type RepRoster = typeof repRoster.$inferSelect;
export type InsertRepRoster = z.infer<typeof insertRepRosterSchema>;
export type RepAssignment = typeof repAssignment.$inferSelect;
export type InsertRepAssignment = z.infer<typeof insertRepAssignmentSchema>;
export type SalesDataDetailed = typeof salesDataDetailed.$inferSelect;
export type InsertSalesDataDetailed = z.infer<typeof insertSalesDataDetailedSchema>;
export type QuotaDataDetailed = typeof quotaDataDetailed.$inferSelect;
export type InsertQuotaDataDetailed = z.infer<typeof insertQuotaDataDetailedSchema>;
export type PayCurveGoalAttainment = typeof payCurveGoalAttainment.$inferSelect;
export type InsertPayCurveGoalAttainment = z.infer<typeof insertPayCurveGoalAttainmentSchema>;
export type PayCurveGoalRankAttainment = typeof payCurveGoalRankAttainment.$inferSelect;
export type InsertPayCurveGoalRankAttainment = z.infer<typeof insertPayCurveGoalRankAttainmentSchema>;
