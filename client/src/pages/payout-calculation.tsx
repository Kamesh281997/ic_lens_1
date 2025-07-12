import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { 
  ArrowLeft, 
  Download, 
  RefreshCw, 
  Calculator, 
  Filter,
  X,
  User,
  MapPin,
  Target,
  BarChart3,
  Percent,
  TrendingUp,
  Settings,
  DollarSign,
  PieChart
} from "lucide-react";
import { Link } from "wouter";

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
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const { data: payoutData, isLoading: payoutLoading } = useQuery<{results: PayoutResult[]}>({
    queryKey: ['/api/payout/results'],
    enabled: isAuthenticated,
  });

  const payoutResults = payoutData?.results || [];

  const exportMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/payout/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ results: payoutResults }),
      });
      
      if (!response.ok) {
        throw new Error('Export failed');
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

  // Calculate filtered results
  const filteredResults = payoutResults.filter(result => {
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

  // Get unique filter options
  const getFilterOptions = () => {
    if (!payoutResults.length) return {};
    
    return {
      repId: [...new Set(payoutResults.map(r => r.repId))],
      repName: [...new Set(payoutResults.map(r => r.repName))],
      region: [...new Set(payoutResults.map(r => r.region))],
      quota: [...new Set(payoutResults.map(r => r.quota.toString()))],
      actualSales: [...new Set(payoutResults.map(r => r.actualSales.toString()))],
      attainmentPercent: [...new Set(payoutResults.map(r => r.attainmentPercent.toString()))],
      payoutCurveType: [...new Set(payoutResults.map(r => r.payoutCurveType))],
      finalPayout: [...new Set(payoutResults.map(r => r.finalPayout.toString()))],
      percentOfTargetPay: [...new Set(payoutResults.map(r => r.percentOfTargetPay.toString()))],
      anyAdjustment: [...new Set(payoutResults.map(r => r.anyAdjustment))],
    };
  };

  const filterOptions = getFilterOptions();

  const hasActiveFilters = Object.values(filters).some(value => value !== 'all');

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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--gp-surface-base)' }}>
        <div className="gp-card">
          <div className="text-center">
            <h1 className="gp-h1 mb-4">Authentication Required</h1>
            <p className="gp-body-l mb-6">
              Please log in to access payout calculations
            </p>
            <Link href="/auth">
              <button className="gp-btn-primary">Go to Login</button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--gp-surface-base)' }}>
      {/* Header */}
      <header className="gp-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left: ICLens Logo */}
            <Link href="/">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">IC</span>
                </div>
                <span className="text-2xl font-bold text-white">Lens</span>
              </div>
            </Link>
            
            {/* Right: Navigation */}
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link href="/data-validation">
                <span className="gp-nav-link text-lg font-medium cursor-pointer">
                  <ArrowLeft className="h-4 w-4 mr-2 inline" />
                  Back to Validation
                </span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative px-4 lg:px-8 py-8">
        <div className="max-w-full mx-auto">
          {/* Page Title */}
          <div className="text-center mb-12">
            <h1 className="gp-display-l mb-4">
              Payout Calculation
            </h1>
            <p className="gp-body-l">
              IC payout results and performance analytics
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 mb-8">
            <button
              onClick={() => exportMutation.mutate()}
              disabled={!payoutResults.length || exportMutation.isPending}
              className="gp-btn-secondary"
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
            </button>

            <button
              onClick={() => window.location.href = '/data-insights'}
              className="gp-btn-primary"
            >
              <PieChart className="h-4 w-4 mr-2" />
              Go to Insights
            </button>
          </div>

          {/* Main Layout */}
          {payoutResults.length > 0 && (
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Filter Controls */}
              <div className="gp-card">
                <div className="pb-6">
                  <div className="gp-h2 flex items-center justify-between">
                    <div className="flex items-center">
                      <Filter className="h-5 w-5 mr-2" style={{ color: 'var(--gp-brand-accent)' }} />
                      Filter Results
                    </div>
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="gp-btn-ghost"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Clear All
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-6 text-center justify-items-center">
                  {/* Rep ID Filter */}
                  <div className="space-y-3">
                    <label className="gp-body-s flex items-center justify-center">
                      <User className="h-4 w-4 mr-2" style={{ color: 'var(--gp-brand-accent)' }} />
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
                  <div className="space-y-3">
                    <label className="gp-body-s flex items-center justify-center">
                      <User className="h-4 w-4 mr-2" style={{ color: 'var(--gp-brand-accent)' }} />
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
                  <div className="space-y-3">
                    <label className="gp-body-s flex items-center justify-center">
                      <MapPin className="h-4 w-4 mr-2" style={{ color: 'var(--gp-brand-accent)' }} />
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
                  <div className="space-y-3">
                    <label className="gp-body-s flex items-center justify-center">
                      <Target className="h-4 w-4 mr-2" style={{ color: 'var(--gp-brand-accent)' }} />
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
                
                {/* Filter Results Summary */}
                <div className="mt-8 pt-6 border-t" style={{ borderColor: 'var(--gp-border-subtle)' }}>
                  <p className="gp-body-l text-center font-medium">
                    Showing {filteredResults.length} of {payoutResults.length} results
                    {hasActiveFilters && (
                      <span className="ml-2" style={{ color: 'var(--gp-brand-accent)' }}>
                        (filtered)
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Payout Results Table */}
              <div className="gp-card w-full">
                <div className="pb-6">
                  <div className="gp-h1 flex items-center">
                    <DollarSign className="h-8 w-8 mr-3" style={{ color: 'var(--gp-state-success)' }} />
                    IC Payout Results
                  </div>
                  <p className="gp-body-l mt-2">
                    Detailed payout calculations for all sales representatives
                  </p>
                </div>

                <div className="overflow-x-auto">
                  {payoutLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <RefreshCw className="h-8 w-8 animate-spin" style={{ color: 'var(--gp-brand-accent)' }} />
                      <span className="ml-3 gp-body-l">
                        Loading payout data...
                      </span>
                    </div>
                  ) : filteredResults.length > 0 ? (
                    <Table className="w-full">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="gp-body-s font-semibold">Rep ID</TableHead>
                          <TableHead className="gp-body-s font-semibold">Rep Name</TableHead>
                          <TableHead className="gp-body-s font-semibold">Region</TableHead>
                          <TableHead className="text-right gp-body-s font-semibold">Quota</TableHead>
                          <TableHead className="text-right gp-body-s font-semibold">Actual Sales</TableHead>
                          <TableHead className="text-right gp-body-s font-semibold">Attainment %</TableHead>
                          <TableHead className="gp-body-s font-semibold">Payout Curve Type</TableHead>
                          <TableHead className="text-right gp-body-s font-semibold">Final Payout ($)</TableHead>
                          <TableHead className="text-right gp-body-s font-semibold">% of Target Pay</TableHead>
                          <TableHead className="gp-body-s font-semibold">Any Adjustment</TableHead>
                          <TableHead className="gp-body-s font-semibold">Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredResults.map((result) => (
                          <TableRow key={result.repId}>
                            <TableCell className="gp-body-s font-medium">{result.repId}</TableCell>
                            <TableCell className="gp-body-s">{result.repName}</TableCell>
                            <TableCell className="gp-body-s">{result.region}</TableCell>
                            <TableCell className="text-right gp-body-s">${result.quota.toLocaleString()}</TableCell>
                            <TableCell className="text-right gp-body-s">${result.actualSales.toLocaleString()}</TableCell>
                            <TableCell className="text-right">
                              <Badge 
                                variant={result.attainmentPercent >= 100 ? "default" : "secondary"}
                                className="gp-body-s"
                              >
                                {result.attainmentPercent.toFixed(1)}%
                              </Badge>
                            </TableCell>
                            <TableCell className="gp-body-s">{result.payoutCurveType}</TableCell>
                            <TableCell className="text-right font-semibold gp-body-s" style={{ color: 'var(--gp-state-success)' }}>
                              ${result.finalPayout.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right gp-body-s">{result.percentOfTargetPay.toFixed(1)}%</TableCell>
                            <TableCell className="gp-body-s">{result.anyAdjustment}</TableCell>
                            <TableCell className="gp-body-s" style={{ color: 'var(--gp-content-secondary)' }}>{result.notes}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-12">
                      <Calculator className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--gp-content-tertiary)' }} />
                      <p className="gp-body-l">
                        No results match the selected filters
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* No Data Message */}
          {!payoutResults.length && (
            <div className="max-w-6xl mx-auto">
              <div className="gp-card text-center">
                <Calculator className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--gp-content-tertiary)' }} />
                <p className="gp-body-l">
                  No payout results available. Please complete the IC processing workflow first.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}