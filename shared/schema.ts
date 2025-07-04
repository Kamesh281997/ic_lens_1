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
export const fileTypeEnum = z.enum(["hierarchy", "rep_roster", "rep_territory", "sales_data", "target_pay"]);
export const fileUploadSchema = z.object({
  fileTypes: z.array(fileTypeEnum).min(1, "Please select at least one file type"),
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
export type FileUpload = typeof fileUploads.$inferSelect;
export type InsertFileUpload = z.infer<typeof insertFileUploadSchema>;
export type SalesData = typeof salesData.$inferSelect;
export type InsertSalesData = z.infer<typeof insertSalesDataSchema>;
export type PayoutCalculation = typeof payoutCalculations.$inferSelect;
export type InsertPayoutCalculation = z.infer<typeof insertPayoutCalculationSchema>;

export type FileUploadData = z.infer<typeof fileUploadSchema>;
export type IcPlanSelectionData = z.infer<typeof icPlanSelectionSchema>;
