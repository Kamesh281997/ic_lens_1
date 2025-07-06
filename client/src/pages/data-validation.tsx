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
  MessageCircle,
  RefreshCw,
  DollarSign,
  Calculator,
  BarChart3
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ValidationResult {
  fileId: string;
  fileName: string;
  fileType: string;
  status: "validating" | "passed" | "failed";
  errors: Array<{
    row: number;
    column: string;
    message: string;
    severity: "error" | "warning";
  }>;
  recordsProcessed: number;
  totalRecords: number;
}

export default function DataValidation() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [validationProgress, setValidationProgress] = useState(0);

  // Fetch validation results
  const { data: validationResults, isLoading, refetch } = useQuery({
    queryKey: ["/api/validation/results"],
    queryFn: async () => {
      const response = await fetch("/api/validation/results");
      if (!response.ok) throw new Error("Failed to fetch validation results");
      const data = await response.json();
      return data.results as ValidationResult[];
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
              Data Validation
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Reviewing uploaded data for completeness and accuracy
            </p>
          </div>

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

          {/* Validation Results */}
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
            <div className="space-y-6">
              {validationResults?.map((result) => (
                <Card key={result.fileId} className="bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl text-gray-900 dark:text-white flex items-center">
                        <FileText className="h-5 w-5 mr-3 text-blue-600" />
                        {result.fileName}
                      </CardTitle>
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className="capitalize">
                          {result.fileType.replace('_', ' ')}
                        </Badge>
                        {result.status === "validating" && (
                          <Badge variant="secondary" className="flex items-center">
                            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                            Validating
                          </Badge>
                        )}
                        {result.status === "passed" && (
                          <Badge variant="default" className="bg-green-600 flex items-center">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Passed
                          </Badge>
                        )}
                        {result.status === "failed" && (
                          <Badge variant="destructive" className="flex items-center">
                            <XCircle className="h-3 w-3 mr-1" />
                            Failed
                          </Badge>
                        )}
                      </div>
                    </div>
                    {result.status !== "validating" && (
                      <CardDescription>
                        Processed {result.recordsProcessed} of {result.totalRecords} records
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    {result.errors.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500" />
                          Validation Issues ({result.errors.length})
                        </h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {result.errors.map((error, index) => (
                            <Alert key={index} variant={error.severity === "error" ? "destructive" : "default"}>
                              <AlertTriangle className="h-4 w-4" />
                              <AlertTitle>
                                Row {error.row}, Column: {error.column}
                              </AlertTitle>
                              <AlertDescription>{error.message}</AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      </div>
                    )}
                    {result.errors.length === 0 && result.status === "passed" && (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        <span className="font-medium">All validation checks passed</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-6 mt-12">
              {/* Validation Actions */}
              {allValidationComplete && (
                <div className="flex justify-center space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => validateMutation.mutate()}
                    disabled={validateMutation.isPending}
                    className="px-6 py-3"
                  >
                    {validateMutation.isPending ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Re-validating...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Re-validate
                      </>
                    )}
                  </Button>

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