import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { ThemeToggle } from "@/components/theme-toggle";
import { Link, useLocation } from "wouter";
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  ArrowLeft, 
  ArrowRight, 
  FileText, 
  Users,
  MapPin,
  BarChart3,
  DollarSign,
  Target,
  RefreshCw,
  Calculator,
  Database,
  AlertCircle,
  Info,
  Activity
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ValidationResult {
  fileId: string;
  fileName: string;
  fileType: "hierarchy" | "rep_roster" | "rep_territory" | "sales_data" | "target_pay" | "quota_data";
  status: "validating" | "passed" | "failed" | "not_uploaded";
  errors: Array<{
    row: number;
    column: string;
    message: string;
    severity: "error" | "warning";
  }>;
  recordsProcessed: number;
  totalRecords: number;
  validationChecks: {
    nullChecks: { passed: boolean; issues: number };
    formatChecks: { passed: boolean; issues: number };
    dataQuality: { passed: boolean; issues: number };
    businessRules: { passed: boolean; issues: number };
  };
}

interface DatasetConfig {
  id: "hierarchy" | "rep_roster" | "rep_territory" | "sales_data" | "target_pay" | "quota_data";
  label: string;
  icon: any;
  description: string;
  mandatory: boolean;
  expectedColumns: string[];
  validationRules: string[];
}

const datasetConfigs: DatasetConfig[] = [
  {
    id: "hierarchy",
    label: "Hierarchy",
    icon: FileText,
    description: "Organizational structure and reporting relationships",
    mandatory: false,
    expectedColumns: ["TeamID", "TERR_ID", "TERR_NAME", "ROLE_CD", "LEVEL1_PARENT_ID", "LEVEL1_PARENT_NAME", "LEVEL_1_PARENT_ROLE_CD", "LEVEL2_PARENT_ID", "LEVEL2_PARENT_NAME", "LEVEL_2_PARENT_ROLE_CD"],
    validationRules: ["No null values in key fields", "Valid role codes", "Parent-child relationships consistent", "No circular references"]
  },
  {
    id: "rep_roster",
    label: "Rep Roster",
    icon: Users,
    description: "Sales representative information and details",
    mandatory: true,
    expectedColumns: ["REP_ID", "REP_NAME", "EMAIL_ID"],
    validationRules: ["All REP_ID values unique", "Valid email format", "No null names", "REP_ID format consistency"]
  },
  {
    id: "rep_territory",
    label: "Rep Territory Assignment",
    icon: MapPin,
    description: "Territory assignments for sales representatives",
    mandatory: true,
    expectedColumns: ["TERR_ID", "REP_ID", "START_DATE", "END_DATE"],
    validationRules: ["Valid date formats", "Start date before end date", "No territory overlaps", "REP_ID exists in roster"]
  },
  {
    id: "sales_data",
    label: "Sales Data",
    icon: BarChart3,
    description: "Sales performance and transaction data",
    mandatory: true,
    expectedColumns: ["REP_ID", "PRODUCT_1", "PRODUCT_2", "PRODUCT_3", "MARKET_1", "MARKET_2", "MARKET_3", "TOTAL_SALES"],
    validationRules: ["Numeric values only", "No negative sales", "Product totals consistent", "REP_ID exists in roster"]
  },
  {
    id: "target_pay",
    label: "Target Pay",
    icon: DollarSign,
    description: "Target compensation and quota information",
    mandatory: false,
    expectedColumns: ["REP_ID", "TARGET_PAY", "QUOTA_AMOUNT", "TERRITORY_COMPLEXITY"],
    validationRules: ["Positive pay amounts", "Realistic quota values", "Valid complexity factors", "REP_ID exists in roster"]
  },
  {
    id: "quota_data",
    label: "Quota Data",
    icon: Target,
    description: "Quota targets and performance metrics",
    mandatory: true,
    expectedColumns: ["REP_ID", "QUOTA_AMOUNT", "PRODUCT_QUOTA_1", "PRODUCT_QUOTA_2", "PRODUCT_QUOTA_3", "TERRITORY_QUOTA"],
    validationRules: ["Positive quota values", "Sum of product quotas logical", "Territory alignment", "REP_ID exists in roster"]
  }
];

export default function DataValidation() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [validationProgress, setValidationProgress] = useState(0);

  // Generate mock validation results based on dataset configurations
  const generateMockValidationResults = (): ValidationResult[] => {
    return datasetConfigs.map(config => {
      const isUploaded = Math.random() > 0.3; // 70% chance of being uploaded
      const hasErrors = isUploaded ? Math.random() > 0.7 : false; // 30% chance of errors if uploaded
      
      return {
        fileId: `file_${config.id}`,
        fileName: `${config.label.toLowerCase().replace(/\s+/g, '_')}.csv`,
        fileType: config.id,
        status: !isUploaded ? "not_uploaded" : hasErrors ? "failed" : "passed",
        errors: hasErrors ? [
          {
            row: Math.floor(Math.random() * 10) + 1,
            column: config.expectedColumns[Math.floor(Math.random() * config.expectedColumns.length)],
            message: config.validationRules[Math.floor(Math.random() * config.validationRules.length)] + " - validation failed",
            severity: Math.random() > 0.5 ? "error" : "warning"
          }
        ] : [],
        recordsProcessed: isUploaded ? Math.floor(Math.random() * 1000) + 100 : 0,
        totalRecords: isUploaded ? Math.floor(Math.random() * 1000) + 100 : 0,
        validationChecks: {
          nullChecks: { passed: !hasErrors || Math.random() > 0.5, issues: hasErrors ? Math.floor(Math.random() * 5) : 0 },
          formatChecks: { passed: !hasErrors || Math.random() > 0.5, issues: hasErrors ? Math.floor(Math.random() * 3) : 0 },
          dataQuality: { passed: !hasErrors || Math.random() > 0.5, issues: hasErrors ? Math.floor(Math.random() * 2) : 0 },
          businessRules: { passed: !hasErrors || Math.random() > 0.5, issues: hasErrors ? Math.floor(Math.random() * 4) : 0 }
        }
      };
    });
  };

  // Fetch validation results
  const { data: validationResults, isLoading, refetch } = useQuery({
    queryKey: ["/api/validation/results"],
    queryFn: async () => {
      // For now, return mock data. In production, this would fetch from the API
      return generateMockValidationResults();
    },
    refetchInterval: 5000, // Poll every 5 seconds during validation
  });

  const validateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/validation/start", {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Validation Started",
        description: "Data validation process has begun",
      });
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: "Validation Failed to Start",
        description: error.message || "Failed to start validation process",
        variant: "destructive",
      });
    },
  });

  const proceedMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/validation/proceed", {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Proceeding to Calculation",
        description: "Moving to payout calculation phase",
      });
      navigate("/payout-calculation");
    },
    onError: (error: Error) => {
      toast({
        title: "Cannot Proceed",
        description: error.message || "Validation errors must be resolved first",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (validationResults) {
      const totalFiles = validationResults.length;
      const completedFiles = validationResults.filter(r => r.status !== "validating").length;
      const progress = totalFiles > 0 ? (completedFiles / totalFiles) * 100 : 0;
      setValidationProgress(progress);
    }
  }, [validationResults]);

  const hasErrors = validationResults?.some(result => 
    result.status === "failed" || result.errors.some(error => error.severity === "error")
  );

  const allValidationComplete = validationResults?.every(result => result.status !== "validating");

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center">Authentication Required</CardTitle>
            <CardDescription className="text-center">
              Please log in to access data validation
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/auth">
              <Button>Go to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="flex items-center justify-between px-6 lg:px-12 py-6">
        <Link href="/">
          <div className="text-3xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
            ICLens
          </div>
        </Link>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <Link href="/ic-processing">
            <Button variant="ghost" className="text-gray-600 dark:text-gray-300">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Processing
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 lg:px-12 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Data Validation Dashboard
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Comprehensive validation of uploaded datasets with detailed quality checks
            </p>
          </div>

          {/* Validation Summary */}
          <Card className="bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-700 mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900 dark:text-white flex items-center">
                <Database className="h-6 w-6 mr-3 text-blue-600" />
                Validation Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {validationResults?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Datasets</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {validationResults?.filter(r => r.status === "passed").length || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Passed Validation</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600 mb-2">
                    {validationResults?.filter(r => r.status === "failed").length || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Failed Validation</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-600 dark:text-gray-400 mb-2">
                    {validationResults?.filter(r => r.status === "not_uploaded").length || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Not Uploaded</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Validation Progress */}
          <Card className="bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-700 mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900 dark:text-white flex items-center">
                <RefreshCw className="h-6 w-6 mr-3 text-blue-600" />
                Validation Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium text-gray-900 dark:text-white">
                    Overall Progress
                  </span>
                  <span className="text-lg font-semibold text-blue-600">
                    {Math.round(validationProgress)}%
                  </span>
                </div>
                <Progress value={validationProgress} className="h-3" />
                {!allValidationComplete && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Validation in progress... This may take a few minutes.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Dataset Validation Cards */}
          {isLoading ? (
            <Card className="bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-700">
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <RefreshCw className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
                  <p className="text-lg text-gray-600 dark:text-gray-300">
                    Loading validation results...
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {validationResults?.map((result) => {
                const config = datasetConfigs.find(c => c.id === result.fileType);
                if (!config) return null;
                
                const IconComponent = config.icon;
                const isUploaded = result.status !== "not_uploaded";
                const hasPassed = result.status === "passed";
                const hasFailed = result.status === "failed";
                
                return (
                  <Card key={result.fileId} className={`bg-white dark:bg-gray-900 shadow-xl border-2 transition-all duration-200 hover:shadow-2xl ${
                    !isUploaded ? 'border-gray-300 dark:border-gray-600' :
                    hasPassed ? 'border-green-300 dark:border-green-600' :
                    hasFailed ? 'border-red-300 dark:border-red-600' :
                    'border-blue-300 dark:border-blue-600'
                  }`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${
                            !isUploaded ? 'bg-gray-100 dark:bg-gray-800' :
                            hasPassed ? 'bg-green-100 dark:bg-green-900/30' :
                            hasFailed ? 'bg-red-100 dark:bg-red-900/30' :
                            'bg-blue-100 dark:bg-blue-900/30'
                          }`}>
                            <IconComponent className={`h-5 w-5 ${
                              !isUploaded ? 'text-gray-500' :
                              hasPassed ? 'text-green-600' :
                              hasFailed ? 'text-red-600' :
                              'text-blue-600'
                            }`} />
                          </div>
                          <div>
                            <CardTitle className="text-lg text-gray-900 dark:text-white">
                              {config.label}
                            </CardTitle>
                            <div className="flex items-center space-x-2 mt-1">
                              {config.mandatory && (
                                <Badge variant="outline" className="text-xs px-2 py-0.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700">
                                  Required
                                </Badge>
                              )}
                              {!config.mandatory && (
                                <Badge variant="outline" className="text-xs px-2 py-0.5 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                  Optional
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {!isUploaded && (
                            <div className="flex items-center text-gray-500">
                              <AlertCircle className="h-6 w-6" />
                            </div>
                          )}
                          {hasPassed && (
                            <div className="flex items-center text-green-600">
                              <CheckCircle className="h-6 w-6" />
                            </div>
                          )}
                          {hasFailed && (
                            <div className="flex items-center text-red-600">
                              <XCircle className="h-6 w-6" />
                            </div>
                          )}
                          {result.status === "validating" && (
                            <div className="flex items-center text-blue-600">
                              <RefreshCw className="h-6 w-6 animate-spin" />
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <CardDescription className="text-sm">
                        {config.description}
                      </CardDescription>
                      
                      {/* Upload Status */}
                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Upload Status</h4>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {!isUploaded ? "Not Uploaded" : result.fileName}
                          </span>
                          {isUploaded && (
                            <Badge variant="outline" className="text-xs">
                              {result.recordsProcessed} records
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Validation Checks */}
                      {isUploaded && (
                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Validation Checks</h4>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-600 dark:text-gray-400">Null Checks</span>
                              <div className="flex items-center space-x-1">
                                {result.validationChecks.nullChecks.passed ? (
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                ) : (
                                  <XCircle className="h-3 w-3 text-red-500" />
                                )}
                                {result.validationChecks.nullChecks.issues > 0 && (
                                  <span className="text-xs text-red-600">{result.validationChecks.nullChecks.issues}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-600 dark:text-gray-400">Format Checks</span>
                              <div className="flex items-center space-x-1">
                                {result.validationChecks.formatChecks.passed ? (
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                ) : (
                                  <XCircle className="h-3 w-3 text-red-500" />
                                )}
                                {result.validationChecks.formatChecks.issues > 0 && (
                                  <span className="text-xs text-red-600">{result.validationChecks.formatChecks.issues}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-600 dark:text-gray-400">Data Quality</span>
                              <div className="flex items-center space-x-1">
                                {result.validationChecks.dataQuality.passed ? (
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                ) : (
                                  <XCircle className="h-3 w-3 text-red-500" />
                                )}
                                {result.validationChecks.dataQuality.issues > 0 && (
                                  <span className="text-xs text-red-600">{result.validationChecks.dataQuality.issues}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-600 dark:text-gray-400">Business Rules</span>
                              <div className="flex items-center space-x-1">
                                {result.validationChecks.businessRules.passed ? (
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                ) : (
                                  <XCircle className="h-3 w-3 text-red-500" />
                                )}
                                {result.validationChecks.businessRules.issues > 0 && (
                                  <span className="text-xs text-red-600">{result.validationChecks.businessRules.issues}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Expected Columns */}
                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Expected Columns</h4>
                        <div className="flex flex-wrap gap-1">
                          {config.expectedColumns.slice(0, 3).map(col => (
                            <Badge key={col} variant="secondary" className="text-xs">
                              {col}
                            </Badge>
                          ))}
                          {config.expectedColumns.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{config.expectedColumns.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Validation Errors */}
                      {result.errors.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-semibold text-red-800 dark:text-red-200 text-sm flex items-center">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Issues ({result.errors.length})
                          </h4>
                          <div className="space-y-1 max-h-20 overflow-y-auto">
                            {result.errors.map((error, index) => (
                              <div key={index} className="text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                                Row {error.row}: {error.message}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-6 mt-12">
              {/* Validation Actions */}
              {allValidationComplete && (
                <div className="flex justify-center space-x-4">
                  

                  <Button
                    onClick={() => proceedMutation.mutate()}
                    disabled={hasErrors || proceedMutation.isPending}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                  >
                    {proceedMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Proceed to Calculation
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Navigation Options after Validation */}
              <div className="border-t dark:border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-4">
                  Or Navigate Directly To:
                </h3>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/payout-calculation">
                    <Button
                      variant="outline"
                      size="lg"
                      className="px-8 py-3 border-green-300 dark:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-700 dark:text-green-300"
                    >
                      <Calculator className="h-5 w-5 mr-2" />
                      Payout Calculation Table
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>

                  <Link href="/data-insights">
                    <Button
                      variant="outline"
                      size="lg"
                      className="px-8 py-3 border-purple-300 dark:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-700 dark:text-purple-300"
                    >
                      <BarChart3 className="h-5 w-5 mr-2" />
                      Insights Page
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

          {hasErrors && allValidationComplete && (
            <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 mt-8">
              <CardHeader>
                <CardTitle className="text-red-800 dark:text-red-200 flex items-center">
                  <XCircle className="h-5 w-5 mr-2" />
                  Validation Errors Detected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-700 dark:text-red-300">
                  Please resolve all validation errors before proceeding to payout calculation. 
                  You may need to correct your data files and re-upload them.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}