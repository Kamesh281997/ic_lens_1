import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ThemeToggle } from "@/components/theme-toggle";
import { Link } from "wouter";
import { 
  Calculator, 
  TrendingUp, 
  MapPin, 
  ArrowLeft, 
  Download, 
  RefreshCw,
  DollarSign,
  Filter,
  X,
  User,
  Building2,
  Target,
  BarChart3,
  TrendingDown,
  Settings,
  Percent
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

interface FilterState {
  repId: string;
  repName: string;
  region: string;
  quota: string;
  actualSales: string;
  attainmentPercent: string;
  payoutCurveType: string;
  finalPayout: string;
  percentOfTargetPay: string;
  anyAdjustment: string;
}

export default function PayoutCalculation() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [calculationInProgress, setCalculationInProgress] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    repId: 'all',
    repName: 'all',
    region: 'all',
    quota: 'all',
    actualSales: 'all',
    attainmentPercent: 'all',
    payoutCurveType: 'all',
    finalPayout: 'all',
    percentOfTargetPay: 'all',
    anyAdjustment: 'all'
  });

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

  // Extract unique values for filters
  const filterOptions = useMemo(() => {
    if (!payoutResults?.length) return {};
    
    return {
      repId: [...new Set(payoutResults.map(r => r.repId))].sort(),
      repName: [...new Set(payoutResults.map(r => r.repName))].sort(),
      region: [...new Set(payoutResults.map(r => r.region))].sort(),
      quota: [...new Set(payoutResults.map(r => r.quota.toString()))].sort((a, b) => parseFloat(a) - parseFloat(b)),
      actualSales: [...new Set(payoutResults.map(r => r.actualSales.toString()))].sort((a, b) => parseFloat(a) - parseFloat(b)),
      attainmentPercent: [...new Set(payoutResults.map(r => r.attainmentPercent.toString()))].sort((a, b) => parseFloat(a) - parseFloat(b)),
      payoutCurveType: [...new Set(payoutResults.map(r => r.payoutCurveType))].sort(),
      finalPayout: [...new Set(payoutResults.map(r => r.finalPayout.toString()))].sort((a, b) => parseFloat(a) - parseFloat(b)),
      percentOfTargetPay: [...new Set(payoutResults.map(r => r.percentOfTargetPay.toString()))].sort((a, b) => parseFloat(a) - parseFloat(b)),
      anyAdjustment: [...new Set(payoutResults.map(r => r.anyAdjustment))].sort()
    };
  }, [payoutResults]);

  // Filter results based on selected filters
  const filteredResults = useMemo(() => {
    if (!payoutResults?.length) return [];
    
    return payoutResults.filter(result => {
      return (
        (filters.repId === 'all' || result.repId === filters.repId) &&
        (filters.repName === 'all' || result.repName === filters.repName) &&
        (filters.region === 'all' || result.region === filters.region) &&
        (filters.quota === 'all' || result.quota.toString() === filters.quota) &&
        (filters.actualSales === 'all' || result.actualSales.toString() === filters.actualSales) &&
        (filters.attainmentPercent === 'all' || result.attainmentPercent.toString() === filters.attainmentPercent) &&
        (filters.payoutCurveType === 'all' || result.payoutCurveType === filters.payoutCurveType) &&
        (filters.finalPayout === 'all' || result.finalPayout.toString() === filters.finalPayout) &&
        (filters.percentOfTargetPay === 'all' || result.percentOfTargetPay.toString() === filters.percentOfTargetPay) &&
        (filters.anyAdjustment === 'all' || result.anyAdjustment === filters.anyAdjustment)
      );
    });
  }, [payoutResults, filters]);

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      repId: 'all',
      repName: 'all',
      region: 'all',
      quota: 'all',
      actualSales: 'all',
      attainmentPercent: 'all',
      payoutCurveType: 'all',
      finalPayout: 'all',
      percentOfTargetPay: 'all',
      anyAdjustment: 'all'
    });
  };

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(filter => filter !== 'all');

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
      const response = await fetch("/api/payout/export");
      if (!response.ok) {
        throw new Error("Failed to export results");
      }
      return response.text();
    },
    onSuccess: (csvData) => {
      const blob = new Blob([csvData], { type: 'text/csv' });
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 dark:opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 to-indigo-100/20 dark:from-blue-900/10 dark:to-indigo-900/10"></div>
      </div>
      
      {/* Header */}
      <header className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 lg:px-12 py-6">
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
      <main className="relative px-6 lg:px-12 py-8">
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
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg"
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
              className="px-6 py-3 border-2 border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 shadow-lg"
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

          {/* Main Layout - Table on left, Filters on right */}
          {payoutResults?.length > 0 && (
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
              {/* Payout Results Table - Left Side */}
              <div className="xl:col-span-4">
                <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-2xl border border-gray-200 dark:border-gray-700">
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
                    ) : filteredResults.length > 0 ? (
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
                            {filteredResults.map((result) => (
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
                          No results match the selected filters
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Filter Controls - Right Side */}
              <div className="xl:col-span-1">
                <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-2xl border border-gray-200 dark:border-gray-700 sticky top-6">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl text-gray-900 dark:text-white flex items-center justify-between">
                      <div className="flex items-center">
                        <Filter className="h-5 w-5 mr-2 text-blue-600" />
                        Filter Results
                      </div>
                      {hasActiveFilters && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearFilters}
                          className="flex items-center"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Clear All
                        </Button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Column 1 - First 4 Filters */}
                      <div className="space-y-4">
                        {/* Rep ID Filter */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                            <User className="h-4 w-4 mr-2 text-blue-600" />
                            Rep ID
                          </label>
                          <Select value={filters.repId} onValueChange={(value) => setFilters(prev => ({ ...prev, repId: value }))}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="All Rep IDs" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Rep IDs</SelectItem>
                              {filterOptions.repId?.map(id => (
                                <SelectItem key={id} value={id}>{id}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Rep Name Filter */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                            <User className="h-4 w-4 mr-2 text-green-600" />
                            Rep Name
                          </label>
                          <Select value={filters.repName} onValueChange={(value) => setFilters(prev => ({ ...prev, repName: value }))}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="All Rep Names" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Rep Names</SelectItem>
                              {filterOptions.repName?.map(name => (
                                <SelectItem key={name} value={name}>{name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Region Filter */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-red-600" />
                            Region
                          </label>
                          <Select value={filters.region} onValueChange={(value) => setFilters(prev => ({ ...prev, region: value }))}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="All Regions" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Regions</SelectItem>
                              {filterOptions.region?.map(region => (
                                <SelectItem key={region} value={region}>{region}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Quota Filter */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                            <Target className="h-4 w-4 mr-2 text-purple-600" />
                            Quota
                          </label>
                          <Select value={filters.quota} onValueChange={(value) => setFilters(prev => ({ ...prev, quota: value }))}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="All Quotas" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Quotas</SelectItem>
                              {filterOptions.quota?.map(quota => (
                                <SelectItem key={quota} value={quota}>${parseFloat(quota).toLocaleString()}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Column 2 - Next 4 Filters */}
                      <div className="space-y-4">
                        {/* Actual Sales Filter */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                            <BarChart3 className="h-4 w-4 mr-2 text-yellow-600" />
                            Actual Sales
                          </label>
                          <Select value={filters.actualSales} onValueChange={(value) => setFilters(prev => ({ ...prev, actualSales: value }))}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="All Sales" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Sales</SelectItem>
                              {filterOptions.actualSales?.map(sales => (
                                <SelectItem key={sales} value={sales}>${parseFloat(sales).toLocaleString()}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Attainment % Filter */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                            <Percent className="h-4 w-4 mr-2 text-orange-600" />
                            Attainment %
                          </label>
                          <Select value={filters.attainmentPercent} onValueChange={(value) => setFilters(prev => ({ ...prev, attainmentPercent: value }))}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="All Attainment %" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Attainment %</SelectItem>
                              {filterOptions.attainmentPercent?.map(percent => (
                                <SelectItem key={percent} value={percent}>{parseFloat(percent).toFixed(1)}%</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Payout Curve Type Filter */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                            <TrendingUp className="h-4 w-4 mr-2 text-indigo-600" />
                            Payout Curve Type
                          </label>
                          <Select value={filters.payoutCurveType} onValueChange={(value) => setFilters(prev => ({ ...prev, payoutCurveType: value }))}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="All Curve Types" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Curve Types</SelectItem>
                              {filterOptions.payoutCurveType?.map(type => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Any Adjustment Filter */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                            <Settings className="h-4 w-4 mr-2 text-gray-600" />
                            Any Adjustment
                          </label>
                          <Select value={filters.anyAdjustment} onValueChange={(value) => setFilters(prev => ({ ...prev, anyAdjustment: value }))}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="All Adjustments" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Adjustments</SelectItem>
                              {filterOptions.anyAdjustment?.map(adjustment => (
                                <SelectItem key={adjustment} value={adjustment}>{adjustment}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    
                    {/* Filter Results Summary */}
                    <div className="mt-6 pt-4 border-t dark:border-gray-700">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Showing {filteredResults.length} of {payoutResults.length} results
                        {hasActiveFilters && (
                          <span className="ml-2 text-blue-600 dark:text-blue-400">
                            (filtered)
                          </span>
                        )}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* No Data Message */}
          {!payoutResults?.length && (
            <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-2xl border border-gray-200 dark:border-gray-700">
              <CardContent className="text-center py-12">
                <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  No payout results available. Click "Calculate Payouts" to begin.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}