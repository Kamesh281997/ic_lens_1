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
  Percent,
  PieChart,
  Edit,
  Eye,
  FileText
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CalculationTraceDialog } from "@/components/calculation-trace";

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
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
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
    <div className="min-h-screen bg-black text-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)]" 
             style={{ backgroundSize: '20px 20px' }}></div>
      </div>
      {/* Header */}
      <header className="relative bg-black/80 backdrop-blur-sm shadow-lg border-b border-gray-700 flex items-center justify-between px-6 lg:px-12 py-6">
        <Link href="/">
          <div className="flex items-center space-x-2 cursor-pointer">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#ff4f59' }}>
              <span className="text-white font-bold text-sm">IC</span>
            </div>
            <span className="text-3xl font-bold transition-colors" style={{ color: '#ff4f59' }}>Lens</span>
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
      <main className="relative px-1 lg:px-2 py-8">
        <div className="max-w-full mx-auto">
          {/* Page Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Payout Calculation with Full Traceability
            </h1>
            <p className="text-xl text-gray-300">
              IC payout results with complete audit trail and calculation transparency
            </p>
            <div className="mt-4 flex justify-center">
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-lg px-4 py-2">
                <Eye className="w-4 h-4 mr-1" />
                Full Audit Trail Available
              </Badge>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 mb-8">
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

            <Button
              onClick={() => window.location.href = '/data-insights'}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold shadow-lg"
            >
              <PieChart className="h-4 w-4 mr-2" />
              Go to Insights
            </Button>

            <Button
              onClick={() => window.location.href = '/payout-adjustments'}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold shadow-lg"
            >
              <Edit className="h-4 w-4 mr-2" />
              Manage Adjustments
            </Button>

            <Button
              variant="outline"
              className="px-6 py-3 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 shadow-lg"
            >
              <FileText className="h-4 w-4 mr-2" />
              Calculation Engine
            </Button>
          </div>

          {/* Main Layout - Centered Table with Top Filters */}
          {payoutResults?.length > 0 && (
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Filter Controls - Top Section */}
              <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-2xl border border-gray-200 dark:border-gray-700">
                <CardHeader className="pb-6">
                  <CardTitle className="text-2xl text-gray-900 dark:text-white flex items-center justify-between">
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
                <CardContent className="px-8 py-6 pl-[20px] pr-[20px] text-center">
                  <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-6 text-center justify-items-center">
                    {/* Rep ID Filter */}
                    <div className="space-y-3">
                      <label className="text-lg font-medium text-gray-700 dark:text-gray-300 flex items-center justify-center">
                        <User className="h-6 w-6 mr-2 text-blue-600" />
                        Rep ID
                      </label>
                      <Select value={filters.repId} onValueChange={(value) => setFilters(prev => ({ ...prev, repId: value }))}>
                        <SelectTrigger className="w-full text-lg h-12">
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
                    <div className="space-y-3">
                      <label className="text-lg font-medium text-gray-700 dark:text-gray-300 flex items-center justify-center">
                        <User className="h-6 w-6 mr-2 text-green-600" />
                        Rep Name
                      </label>
                      <Select value={filters.repName} onValueChange={(value) => setFilters(prev => ({ ...prev, repName: value }))}>
                        <SelectTrigger className="w-full text-lg h-12">
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
                    <div className="space-y-3">
                      <label className="text-lg font-medium text-gray-700 dark:text-gray-300 flex items-center justify-center">
                        <MapPin className="h-6 w-6 mr-2 text-red-600" />
                        Region
                      </label>
                      <Select value={filters.region} onValueChange={(value) => setFilters(prev => ({ ...prev, region: value }))}>
                        <SelectTrigger className="w-full text-lg h-12">
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
                    <div className="space-y-3">
                      <label className="text-lg font-medium text-gray-700 dark:text-gray-300 flex items-center justify-center">
                        <Target className="h-6 w-6 mr-2 text-purple-600" />
                        Quota
                      </label>
                      <Select value={filters.quota} onValueChange={(value) => setFilters(prev => ({ ...prev, quota: value }))}>
                        <SelectTrigger className="w-full text-lg h-12">
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
                  
                  {/* Filter Results Summary */}
                  <div className="mt-8 pt-6 border-t dark:border-gray-700">
                    <p className="text-lg text-gray-600 dark:text-gray-400 text-center font-medium">
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

              {/* Payout Results Table - Centered */}
              <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-2xl border border-gray-200 dark:border-gray-700 w-full">
                <CardHeader className="pb-6">
                  <CardTitle className="text-3xl text-gray-900 dark:text-white flex items-center">
                    <DollarSign className="h-8 w-8 mr-3 text-green-600" />
                    IC Payout Results
                  </CardTitle>
                  <CardDescription className="text-lg text-gray-600 dark:text-gray-400">
                    Detailed payout calculations for all sales representatives
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-8 py-6">
                  <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Calculator className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold text-blue-900 dark:text-blue-100">
                          Calculation Engine Status
                        </span>
                      </div>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Active
                      </Badge>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
                      All payouts calculated with full traceability. Click "Trace" button on any row to view complete calculation steps.
                    </p>
                  </div>

                  {payoutLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
                      <span className="ml-3 text-lg text-gray-600 dark:text-gray-300">
                        Loading payout data...
                      </span>
                    </div>
                  ) : filteredResults.length > 0 ? (
                    <div className="w-full min-w-0">
                      <Table className="w-full table-fixed">
                        <TableHeader>
                          <TableRow className="h-14">
                            <TableHead className="text-lg font-semibold w-24">Rep ID</TableHead>
                            <TableHead className="text-lg font-semibold w-32">Rep Name</TableHead>
                            <TableHead className="text-lg font-semibold w-28">Region</TableHead>
                            <TableHead className="text-right text-lg font-semibold w-28">Quota</TableHead>
                            <TableHead className="text-right text-lg font-semibold w-32">Actual Sales</TableHead>
                            <TableHead className="text-right text-lg font-semibold w-28">Attainment %</TableHead>
                            <TableHead className="text-lg font-semibold w-36">Payout Curve Type</TableHead>
                            <TableHead className="text-right text-lg font-semibold w-32">Final Payout ($)</TableHead>
                            <TableHead className="text-right text-lg font-semibold w-28">% of Target Pay</TableHead>
                            <TableHead className="text-lg font-semibold w-28">Any Adjustment</TableHead>
                            <TableHead className="text-lg font-semibold w-32">Notes</TableHead>
                            <TableHead className="text-lg font-semibold w-20">Trace</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredResults.map((result) => (
                            <TableRow key={result.repId} className="h-16">
                              <TableCell className="font-medium text-lg truncate">{result.repId}</TableCell>
                              <TableCell className="text-lg truncate">{result.repName}</TableCell>
                              <TableCell className="text-lg truncate">{result.region}</TableCell>
                              <TableCell className="text-right text-lg">${result.quota.toLocaleString()}</TableCell>
                              <TableCell className="text-right text-lg">${result.actualSales.toLocaleString()}</TableCell>
                              <TableCell className="text-right">
                                <Badge variant={result.attainmentPercent >= 100 ? "default" : "secondary"} className="text-base px-3 py-2">
                                  {result.attainmentPercent.toFixed(1)}%
                                </Badge>
                              </TableCell>
                              <TableCell className="text-lg truncate">{result.payoutCurveType}</TableCell>
                              <TableCell className="text-right font-semibold text-green-600 text-lg">
                                ${result.finalPayout.toLocaleString()}
                              </TableCell>
                              <TableCell className="text-right text-lg">{result.percentOfTargetPay.toFixed(1)}%</TableCell>
                              <TableCell className="text-lg truncate">{result.anyAdjustment}</TableCell>
                              <TableCell className="text-lg text-gray-600 dark:text-gray-400 truncate">{result.notes}</TableCell>
                              <TableCell>
                                <CalculationTraceDialog 
                                  repId={result.repId}
                                  repName={result.repName}
                                  finalPayout={result.finalPayout}
                                />
                              </TableCell>
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
          )}

          {/* No Data Message */}
          {!payoutResults?.length && (
            <div className="max-w-6xl mx-auto">
              <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-2xl border border-gray-200 dark:border-gray-700">
                <CardContent className="text-center py-12">
                  <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg text-gray-600 dark:text-gray-300">
                    No payout results available. Click "Calculate Payouts" to begin.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}