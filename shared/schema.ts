import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb, varchar } from "drizzle-orm/pg-core";
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

// Final Payout Results table - comprehensive payout data
export const finalPayoutResults = pgTable("final_payout_results", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  repId: text("rep_id").notNull(),
  repName: text("rep_name").notNull(),
  region: text("region").notNull(),
  quota: decimal("quota", { precision: 15, scale: 2 }).notNull(),
  actualSales: decimal("actual_sales", { precision: 15, scale: 2 }).notNull(),
  attainmentPercent: decimal("attainment_percent", { precision: 5, scale: 2 }).notNull(),
  payoutCurveType: text("payout_curve_type").notNull(),
  finalPayout: decimal("final_payout", { precision: 15, scale: 2 }).notNull(),
  percentOfTargetPay: decimal("percent_of_target_pay", { precision: 5, scale: 2 }).notNull(),
  anyAdjustment: text("any_adjustment").notNull().default("None"),
  notes: text("notes").notNull().default(""),
  calculatedAt: timestamp("calculated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Enhanced IC Plans table with versioning
export const enhancedIcPlans = pgTable('enhanced_ic_plans', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  planName: varchar('plan_name', { length: 255 }).notNull(),
  planType: varchar('plan_type', { length: 100 }).notNull(),
  description: text('description'),
  currentVersion: integer('current_version').notNull().default(1),
  status: varchar('status', { length: 50 }).notNull().default('draft'), // draft, active, archived
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Version History for IC Plans
export const icPlanVersions = pgTable('ic_plan_versions', {
  id: serial('id').primaryKey(),
  planId: integer('plan_id').notNull().references(() => enhancedIcPlans.id, { onDelete: 'cascade' }),
  versionNumber: integer('version_number').notNull(),
  versionName: varchar('version_name', { length: 255 }),
  configurationData: jsonb('configuration_data').notNull(), // Complete plan configuration
  payCurveData: jsonb('pay_curve_data'), // Pay curve configuration
  simulationResults: jsonb('simulation_results'), // What-if simulation results
  summary: text('summary'), // Human-readable summary of this version
  changeDescription: text('change_description'), // What changed from previous version
  createdBy: integer('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  isSnapshot: boolean('is_snapshot').default(false) // Manual snapshots vs auto-saves
});

// Detailed Audit Trail
export const icPlanAuditLog = pgTable('ic_plan_audit_log', {
  id: serial('id').primaryKey(),
  planId: integer('plan_id').notNull().references(() => enhancedIcPlans.id, { onDelete: 'cascade' }),
  versionId: integer('version_id').references(() => icPlanVersions.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id),
  username: varchar('username', { length: 255 }).notNull(),
  action: varchar('action', { length: 100 }).notNull(), // create, modify, delete, snapshot, restore
  actionCategory: varchar('action_category', { length: 50 }).notNull(), // plan_config, pay_curve, simulation, metadata
  fieldChanged: varchar('field_changed', { length: 255 }), // Specific field that changed
  oldValue: text('old_value'), // Previous value (JSON string if complex)
  newValue: text('new_value'), // New value (JSON string if complex)
  changeSource: varchar('change_source', { length: 50 }).notNull(), // ai_assistant, manual_form, import, api
  userMessage: text('user_message'), // Original user request that triggered change
  aiResponse: text('ai_response'), // AI assistant's interpretation/response
  ipAddress: varchar('ip_address', { length: 45 }), // For security tracking
  userAgent: text('user_agent'), // Browser/client information
  sessionId: varchar('session_id', { length: 255 }), // Session tracking
  timestamp: timestamp('timestamp').defaultNow()
});

// Plan Configuration Components (for granular tracking)
export const icPlanComponents = pgTable('ic_plan_components', {
  id: serial('id').primaryKey(),
  planId: integer('plan_id').notNull().references(() => enhancedIcPlans.id, { onDelete: 'cascade' }),
  versionId: integer('version_id').notNull().references(() => icPlanVersions.id, { onDelete: 'cascade' }),
  componentType: varchar('component_type', { length: 50 }).notNull(), // threshold, cap, accelerator, measure
  componentName: varchar('component_name', { length: 255 }).notNull(),
  value: text('value').notNull(), // JSON string for complex values
  displayOrder: integer('display_order').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow()
});

// Multi-Plan Multi-Period Calculation Engine Tables
export const calculationJobs = pgTable('calculation_jobs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  jobName: varchar('job_name', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 50 }).notNull().default('pending'), // pending, running, completed, failed
  calculationType: varchar('calculation_type', { length: 50 }).notNull(), // monthly, quarterly, annual, ad_hoc
  planIds: jsonb('plan_ids').notNull(), // Array of plan IDs to process
  periodStart: timestamp('period_start').notNull(),
  periodEnd: timestamp('period_end').notNull(),
  progress: integer('progress').default(0), // 0-100 percentage
  totalRecords: integer('total_records').default(0),
  processedRecords: integer('processed_records').default(0),
  errorCount: integer('error_count').default(0),
  warnings: jsonb('warnings'), // Array of warning messages
  createdAt: timestamp('created_at').defaultNow(),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at')
});

// Exception Handling and Adjustment Workflows
export const payoutAdjustments = pgTable('payout_adjustments', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  repId: text('rep_id').notNull(),
  repName: text('rep_name').notNull(),
  originalPayout: decimal('original_payout', { precision: 15, scale: 2 }).notNull(),
  adjustmentAmount: decimal('adjustment_amount', { precision: 15, scale: 2 }).notNull(),
  finalPayout: decimal('final_payout', { precision: 15, scale: 2 }).notNull(),
  adjustmentType: varchar('adjustment_type', { length: 100 }).notNull(), // bonus, correction, penalty, override
  adjustmentReason: text('adjustment_reason').notNull(),
  businessJustification: text('business_justification').notNull(),
  submittedBy: integer('submitted_by').notNull().references(() => users.id),
  approvedBy: integer('approved_by').references(() => users.id),
  status: varchar('status', { length: 50 }).notNull().default('pending'), // pending, approved, rejected, applied
  priority: varchar('priority', { length: 20 }).notNull().default('normal'), // low, normal, high, urgent
  submittedAt: timestamp('submitted_at').defaultNow(),
  reviewedAt: timestamp('reviewed_at'),
  appliedAt: timestamp('applied_at'),
  comments: text('comments'),
  supportingDocuments: jsonb('supporting_documents') // Array of document references
});

// Calculation Traceability and Audit
export const calculationTrace = pgTable('calculation_trace', {
  id: serial('id').primaryKey(),
  jobId: integer('job_id').notNull().references(() => calculationJobs.id, { onDelete: 'cascade' }),
  repId: text('rep_id').notNull(),
  repName: text('rep_name').notNull(),
  planId: integer('plan_id').notNull(),
  planName: text('plan_name').notNull(),
  calculationStep: integer('calculation_step').notNull(), // 1, 2, 3, etc.
  stepName: varchar('step_name', { length: 255 }).notNull(),
  stepDescription: text('step_description').notNull(),
  inputData: jsonb('input_data').notNull(), // Raw input values
  ruleApplied: text('rule_applied').notNull(),
  calculation: text('calculation').notNull(), // Mathematical formula used
  intermediateResult: decimal('intermediate_result', { precision: 15, scale: 2 }),
  finalStepResult: decimal('final_step_result', { precision: 15, scale: 2 }),
  metadata: jsonb('metadata'), // Additional context data
  executedAt: timestamp('executed_at').defaultNow()
});

// AI Anomaly Detection
export const anomalyDetection = pgTable('anomaly_detection', {
  id: serial('id').primaryKey(),
  jobId: integer('job_id').notNull().references(() => calculationJobs.id, { onDelete: 'cascade' }),
  repId: text('rep_id').notNull(),
  repName: text('rep_name').notNull(),
  anomalyType: varchar('anomaly_type', { length: 100 }).notNull(), // outlier, spike, drop, pattern_break
  severityLevel: varchar('severity_level', { length: 20 }).notNull(), // low, medium, high, critical
  currentValue: decimal('current_value', { precision: 15, scale: 2 }).notNull(),
  expectedValue: decimal('expected_value', { precision: 15, scale: 2 }),
  variance: decimal('variance', { precision: 10, scale: 4 }),
  variancePercent: decimal('variance_percent', { precision: 7, scale: 2 }),
  historicalAverage: decimal('historical_average', { precision: 15, scale: 2 }),
  standardDeviation: decimal('standard_deviation', { precision: 15, scale: 2 }),
  confidenceScore: decimal('confidence_score', { precision: 5, scale: 2 }).notNull(), // 0-100
  rootCause: text('root_cause').notNull(),
  recommendation: text('recommendation').notNull(),
  aiAnalysis: jsonb('ai_analysis'), // Detailed AI analysis data
  flaggedAt: timestamp('flagged_at').defaultNow(),
  reviewedAt: timestamp('reviewed_at'),
  status: varchar('status', { length: 50 }).notNull().default('flagged'), // flagged, investigating, resolved, false_positive
  reviewerNotes: text('reviewer_notes')
});

// Performance Metrics for Scalability Monitoring
export const performanceMetrics = pgTable('performance_metrics', {
  id: serial('id').primaryKey(),
  jobId: integer('job_id').references(() => calculationJobs.id, { onDelete: 'cascade' }),
  metricType: varchar('metric_type', { length: 50 }).notNull(), // execution_time, memory_usage, throughput
  metricValue: decimal('metric_value', { precision: 15, scale: 4 }).notNull(),
  unit: varchar('unit', { length: 20 }).notNull(), // seconds, mb, records_per_second
  context: jsonb('context'), // Additional context data
  recordedAt: timestamp('recorded_at').defaultNow()
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

export const insertFinalPayoutResultSchema = createInsertSchema(finalPayoutResults).pick({
  repId: true,
  repName: true,
  region: true,
  quota: true,
  actualSales: true,
  attainmentPercent: true,
  payoutCurveType: true,
  finalPayout: true,
  percentOfTargetPay: true,
  anyAdjustment: true,
  notes: true,
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
export type FinalPayoutResult = typeof finalPayoutResults.$inferSelect;
export type InsertFinalPayoutResult = z.infer<typeof insertFinalPayoutResultSchema>;

export type FileUploadData = z.infer<typeof fileUploadSchema>;
export type IcPlanSelectionData = z.infer<typeof icPlanSelectionSchema>;

// Enhanced IC Plan Versioning Schemas
export const insertEnhancedIcPlanSchema = createInsertSchema(enhancedIcPlans).pick({
  planName: true,
  planType: true,
  description: true,
});

export const insertIcPlanVersionSchema = createInsertSchema(icPlanVersions).pick({
  planId: true,
  versionNumber: true,
  versionName: true,
  configurationData: true,
  payCurveData: true,
  simulationResults: true,
  summary: true,
  changeDescription: true,
  createdBy: true,
  isSnapshot: true
});

export const insertIcPlanAuditLogSchema = createInsertSchema(icPlanAuditLog).pick({
  planId: true,
  versionId: true,
  userId: true,
  username: true,
  action: true,
  actionCategory: true,
  fieldChanged: true,
  oldValue: true,
  newValue: true,
  changeSource: true,
  userMessage: true,
  aiResponse: true,
  ipAddress: true,
  userAgent: true,
  sessionId: true
});

export const insertIcPlanComponentSchema = createInsertSchema(icPlanComponents).pick({
  planId: true,
  versionId: true,
  componentType: true,
  componentName: true,
  value: true,
  displayOrder: true,
  isActive: true
});

// Enhanced IC Processing Schemas
export const insertCalculationJobSchema = createInsertSchema(calculationJobs).pick({
  jobName: true,
  description: true,
  calculationType: true,
  planIds: true,
  periodStart: true,
  periodEnd: true
});

export const insertPayoutAdjustmentSchema = createInsertSchema(payoutAdjustments).pick({
  repId: true,
  repName: true,
  originalPayout: true,
  adjustmentAmount: true,
  finalPayout: true,
  adjustmentType: true,
  adjustmentReason: true,
  businessJustification: true,
  submittedBy: true,
  priority: true,
  supportingDocuments: true
});

export const insertCalculationTraceSchema = createInsertSchema(calculationTrace).pick({
  jobId: true,
  repId: true,
  repName: true,
  planId: true,
  planName: true,
  calculationStep: true,
  stepName: true,
  stepDescription: true,
  inputData: true,
  ruleApplied: true,
  calculation: true,
  intermediateResult: true,
  finalStepResult: true,
  metadata: true
});

export const insertAnomalyDetectionSchema = createInsertSchema(anomalyDetection).pick({
  jobId: true,
  repId: true,
  repName: true,
  anomalyType: true,
  severityLevel: true,
  currentValue: true,
  expectedValue: true,
  variance: true,
  variancePercent: true,
  historicalAverage: true,
  standardDeviation: true,
  confidenceScore: true,
  rootCause: true,
  recommendation: true,
  aiAnalysis: true
});

// Enhanced IC Plan Types
export type EnhancedIcPlan = typeof enhancedIcPlans.$inferSelect;
export type InsertEnhancedIcPlan = z.infer<typeof insertEnhancedIcPlanSchema>;
export type IcPlanVersion = typeof icPlanVersions.$inferSelect;
export type InsertIcPlanVersion = z.infer<typeof insertIcPlanVersionSchema>;
export type IcPlanAuditLog = typeof icPlanAuditLog.$inferSelect;
export type InsertIcPlanAuditLog = z.infer<typeof insertIcPlanAuditLogSchema>;
export type IcPlanComponent = typeof icPlanComponents.$inferSelect;
export type InsertIcPlanComponent = z.infer<typeof insertIcPlanComponentSchema>;

// Enhanced IC Processing Types
export type CalculationJob = typeof calculationJobs.$inferSelect;
export type InsertCalculationJob = z.infer<typeof insertCalculationJobSchema>;
export type PayoutAdjustment = typeof payoutAdjustments.$inferSelect;
export type InsertPayoutAdjustment = z.infer<typeof insertPayoutAdjustmentSchema>;
export type CalculationTrace = typeof calculationTrace.$inferSelect;
export type InsertCalculationTrace = z.infer<typeof insertCalculationTraceSchema>;
export type AnomalyDetection = typeof anomalyDetection.$inferSelect;
export type InsertAnomalyDetection = z.infer<typeof insertAnomalyDetectionSchema>;
export type PerformanceMetrics = typeof performanceMetrics.$inferSelect;

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
