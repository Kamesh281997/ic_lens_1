import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ThemeToggle } from "@/components/theme-toggle";
import { Link } from "wouter";
import { 
  Calculator, 
  TrendingUp, 
  MapPin, 
  PieChart, 
  ArrowLeft, 
  Download, 
  RefreshCw,
  DollarSign,
  Users,
  Target,
  BarChart3
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PayoutResult {
  repId: string;
  repName: string;
  region: string;
  quota: number;
  actualSales: number;
  attainmentPercent: number;
  payoutCurveType: string;
  finalPayout: number;
  percentOfTargetPay: number;
  anyAdjustment: string;
  notes: string;
}

interface AnalyticsData {
  topPerformingReps: Array<{
    repId: string;
    repName: string;
    payoutAmount: number;
    quotaAttainment: number;
  }>;
  territoryEffectiveness: Array<{
    territory: string;
    avgQuotaAttainment: number;
    totalPayout: number;
    repCount: number;
  }>;
  payoutDistribution: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
  summary: {
    totalPayout: number;
    avgQuotaAttainment: number;
    totalReps: number;
    topPerformerThreshold: number;
  };
}

export default function PayoutCalculation() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [calculationInProgress, setCalculationInProgress] = useState(false);

  // Fetch payout results
  const { data: payoutResults, isLoading: payoutLoading, refetch: refetchPayouts } = useQuery({
    queryKey: ["/api/payout/results"],
    queryFn: async () => {
      const response = await fetch("/api/payout/results");
      if (!response.ok) throw new Error("Failed to fetch payout results");
      const data = await response.json();
      return data.results as PayoutResult[];
    },
  });

  // Fetch analytics data
  const { data: analyticsData, isLoading: analyticsLoading, refetch: refetchAnalytics } = useQuery({
    queryKey: ["/api/analytics/insights"],
    queryFn: async () => {
      const response = await fetch("/api/analytics/insights");
      if (!response.ok) throw new Error("Failed to fetch analytics data");
      const data = await response.json();
      return data as AnalyticsData;
    },
  });

  const calculateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/payout/calculate", {});
      return response.json();
    },
    onMutate: () => {
      setCalculationInProgress(true);
    },
    onSuccess: () => {
      toast({
        title: "Calculation Complete",
        description: "IC payouts have been successfully calculated",
      });
      refetchPayouts();
      refetchAnalytics();
    },
    onError: (error: Error) => {
      toast({
        title: "Calculation Failed",
        description: error.message || "Failed to calculate payouts",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setCalculationInProgress(false);
    },
  });

  const exportMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("GET", "/api/payout/export", {});
      return response.blob();
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payout_results_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Export Complete",
        description: "Payout results have been downloaded",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export results",
        variant: "destructive",
      });
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center">Authentication Required</CardTitle>
            <CardDescription className="text-center">
              Please log in to access payout calculations
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
          <Link href="/data-validation">
            <Button variant="ghost" className="text-gray-600 dark:text-gray-300">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Validation
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 lg:px-12 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Payout Calculation
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              IC payout results and performance analytics
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 mb-8">
            <Button
              onClick={() => calculateMutation.mutate()}
              disabled={calculationInProgress}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              {calculationInProgress ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate Payouts
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => exportMutation.mutate()}
              disabled={!payoutResults?.length || exportMutation.isPending}
              className="px-6 py-3"
            >
              {exportMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export Results
                </>
              )}
            </Button>
          </div>

          {/* Content Tabs */}
          <Tabs defaultValue="results" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="results" className="flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Payout Results
              </TabsTrigger>
              <TabsTrigger value="top-performers" className="flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Top Performers
              </TabsTrigger>
              <TabsTrigger value="territory" className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                Territory Analysis
              </TabsTrigger>
              <TabsTrigger value="distribution" className="flex items-center">
                <PieChart className="h-4 w-4 mr-2" />
                Distribution
              </TabsTrigger>
            </TabsList>

            {/* Payout Results Tab */}
            <TabsContent value="results">
              <Card className="bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-2xl text-gray-900 dark:text-white flex items-center">
                    <DollarSign className="h-6 w-6 mr-3 text-green-600" />
                    IC Payout Results
                  </CardTitle>
                  <CardDescription>
                    Detailed payout calculations for all sales representatives
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {payoutLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
                      <span className="ml-3 text-lg text-gray-600 dark:text-gray-300">
                        Loading payout data...
                      </span>
                    </div>
                  ) : payoutResults?.length ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Rep ID</TableHead>
                            <TableHead>Rep Name</TableHead>
                            <TableHead>Region</TableHead>
                            <TableHead className="text-right">Quota</TableHead>
                            <TableHead className="text-right">Actual Sales</TableHead>
                            <TableHead className="text-right">Attainment %</TableHead>
                            <TableHead>Payout Curve Type</TableHead>
                            <TableHead className="text-right">Final Payout ($)</TableHead>
                            <TableHead className="text-right">% of Target Pay</TableHead>
                            <TableHead>Any Adjustment</TableHead>
                            <TableHead>Notes</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {payoutResults.map((result) => (
                            <TableRow key={result.repId}>
                              <TableCell className="font-medium">{result.repId}</TableCell>
                              <TableCell>{result.repName}</TableCell>
                              <TableCell>{result.region}</TableCell>
                              <TableCell className="text-right">${result.quota.toLocaleString()}</TableCell>
                              <TableCell className="text-right">${result.actualSales.toLocaleString()}</TableCell>
                              <TableCell className="text-right">
                                <Badge variant={result.attainmentPercent >= 100 ? "default" : "secondary"}>
                                  {result.attainmentPercent.toFixed(1)}%
                                </Badge>
                              </TableCell>
                              <TableCell>{result.payoutCurveType}</TableCell>
                              <TableCell className="text-right font-semibold text-green-600">
                                ${result.finalPayout.toLocaleString()}
                              </TableCell>
                              <TableCell className="text-right">{result.percentOfTargetPay.toFixed(1)}%</TableCell>
                              <TableCell>{result.anyAdjustment}</TableCell>
                              <TableCell className="text-sm text-gray-600 dark:text-gray-400">{result.notes}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg text-gray-600 dark:text-gray-300">
                        No payout results available. Click "Calculate Payouts" to begin.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Top Performers Tab */}
            <TabsContent value="top-performers">
              <Card className="bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-2xl text-gray-900 dark:text-white flex items-center">
                    <TrendingUp className="h-6 w-6 mr-3 text-blue-600" />
                    Top Performing Reps
                  </CardTitle>
                  <CardDescription>
                    Highest earning sales representatives and their performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {analyticsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
                      <span className="ml-3 text-lg text-gray-600 dark:text-gray-300">
                        Loading analytics...
                      </span>
                    </div>
                  ) : analyticsData?.topPerformingReps?.length ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {analyticsData.topPerformingReps.map((rep, index) => (
                        <Card key={rep.repId} className="border-2 border-blue-200 dark:border-blue-800">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <Badge variant="default" className="bg-blue-600">
                                #{index + 1}
                              </Badge>
                              <Badge variant="outline">
                                {rep.quotaAttainment.toFixed(1)}% Attainment
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                              {rep.repName}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              Rep ID: {rep.repId}
                            </p>
                            <div className="text-2xl font-bold text-green-600">
                              ${rep.payoutAmount.toLocaleString()}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg text-gray-600 dark:text-gray-300">
                        No performance data available.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Territory Analysis Tab */}
            <TabsContent value="territory">
              <Card className="bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-2xl text-gray-900 dark:text-white flex items-center">
                    <MapPin className="h-6 w-6 mr-3 text-purple-600" />
                    Territory Effectiveness
                  </CardTitle>
                  <CardDescription>
                    Performance analysis by sales territory
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {analyticsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
                      <span className="ml-3 text-lg text-gray-600 dark:text-gray-300">
                        Loading territory data...
                      </span>
                    </div>
                  ) : analyticsData?.territoryEffectiveness?.length ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Territory</TableHead>
                            <TableHead className="text-right">Rep Count</TableHead>
                            <TableHead className="text-right">Avg Quota Attainment</TableHead>
                            <TableHead className="text-right">Total Payout</TableHead>
                            <TableHead className="text-right">Avg Payout per Rep</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {analyticsData.territoryEffectiveness.map((territory) => (
                            <TableRow key={territory.territory}>
                              <TableCell className="font-medium">{territory.territory}</TableCell>
                              <TableCell className="text-right">
                                <Badge variant="outline">{territory.repCount}</Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Badge variant={territory.avgQuotaAttainment >= 100 ? "default" : "secondary"}>
                                  {territory.avgQuotaAttainment.toFixed(1)}%
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right font-semibold text-green-600">
                                ${territory.totalPayout.toLocaleString()}
                              </TableCell>
                              <TableCell className="text-right">
                                ${Math.round(territory.totalPayout / territory.repCount).toLocaleString()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg text-gray-600 dark:text-gray-300">
                        No territory data available.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Distribution Tab */}
            <TabsContent value="distribution">
              <Card className="bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-2xl text-gray-900 dark:text-white flex items-center">
                    <PieChart className="h-6 w-6 mr-3 text-orange-600" />
                    Payout Distribution
                  </CardTitle>
                  <CardDescription>
                    Distribution of IC payouts across different ranges
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {analyticsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
                      <span className="ml-3 text-lg text-gray-600 dark:text-gray-300">
                        Loading distribution data...
                      </span>
                    </div>
                  ) : analyticsData?.payoutDistribution?.length ? (
                    <div className="space-y-6">
                      {/* Summary Stats */}
                      {analyticsData.summary && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                            <CardContent className="p-4 text-center">
                              <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                                ${analyticsData.summary.totalPayout.toLocaleString()}
                              </div>
                              <div className="text-sm text-blue-700 dark:text-blue-200">Total Payout</div>
                            </CardContent>
                          </Card>
                          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                            <CardContent className="p-4 text-center">
                              <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
                              <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                                {analyticsData.summary.avgQuotaAttainment.toFixed(1)}%
                              </div>
                              <div className="text-sm text-green-700 dark:text-green-200">Avg Attainment</div>
                            </CardContent>
                          </Card>
                          <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                            <CardContent className="p-4 text-center">
                              <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                                {analyticsData.summary.totalReps}
                              </div>
                              <div className="text-sm text-purple-700 dark:text-purple-200">Total Reps</div>
                            </CardContent>
                          </Card>
                          <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
                            <CardContent className="p-4 text-center">
                              <BarChart3 className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                              <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                                {analyticsData.summary.topPerformerThreshold.toFixed(1)}%
                              </div>
                              <div className="text-sm text-orange-700 dark:text-orange-200">Top Performer</div>
                            </CardContent>
                          </Card>
                        </div>
                      )}

                      {/* Distribution Chart */}
                      <div className="space-y-4">
                        {analyticsData.payoutDistribution.map((range, index) => (
                          <div key={range.range} className="flex items-center space-x-4">
                            <div className="w-32 text-sm font-medium text-gray-900 dark:text-white">
                              {range.range}
                            </div>
                            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 relative">
                              <div
                                className="bg-blue-600 h-6 rounded-full flex items-center justify-end pr-2"
                                style={{ width: `${range.percentage}%` }}
                              >
                                <span className="text-white text-xs font-medium">
                                  {range.percentage.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                            <div className="w-12 text-sm text-gray-600 dark:text-gray-400 text-right">
                              {range.count}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg text-gray-600 dark:text-gray-300">
                        No distribution data available.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}