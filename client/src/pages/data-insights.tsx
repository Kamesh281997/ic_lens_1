import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/theme-toggle";
import { Link } from "wouter";
import { 
  ArrowLeft, 
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Target,
  Award,
  MapPin,
  RefreshCw,
  Download
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";

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

export default function DataInsights() {
  const { user, isAuthenticated } = useAuth();

  // Fetch analytics data
  const { data: analyticsData, isLoading, refetch } = useQuery({
    queryKey: ["/api/analytics/insights"],
    queryFn: async () => {
      const response = await fetch("/api/analytics/insights");
      if (!response.ok) throw new Error("Failed to fetch analytics data");
      const data = await response.json();
      return data as AnalyticsData;
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center">Authentication Required</CardTitle>
            <CardDescription className="text-center">
              Please log in to access data insights
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/auth?redirect=/data-insights">
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
          <Link href="/">
            <Button variant="ghost" className="text-gray-600 dark:text-gray-300">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
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
              Data Insights & Analytics
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Comprehensive performance analytics and compensation insights
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 mb-8">
            <Button
              onClick={() => refetch()}
              disabled={isLoading}
              variant="outline"
              className="px-6 py-3"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Data
                </>
              )}
            </Button>

            <Button
              variant="outline"
              className="px-6 py-3"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Insights
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
              <span className="ml-3 text-lg text-gray-600 dark:text-gray-300">
                Loading analytics data...
              </span>
            </div>
          ) : analyticsData ? (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-8">
                <TabsTrigger value="overview" className="flex items-center">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="performance" className="flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Performance
                </TabsTrigger>
                <TabsTrigger value="territory" className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Territory
                </TabsTrigger>
                <TabsTrigger value="distribution" className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Distribution
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {/* Summary Cards */}
                  <Card className="bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Payout</CardTitle>
                      <DollarSign className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        ${analyticsData.summary.totalPayout.toLocaleString()}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Across all representatives
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Average Attainment</CardTitle>
                      <Target className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">
                        {analyticsData.summary.avgQuotaAttainment.toFixed(1)}%
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Quota achievement rate
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Reps</CardTitle>
                      <Users className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-purple-600">
                        {analyticsData.summary.totalReps}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Active representatives
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Top Performer Threshold</CardTitle>
                      <Award className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-600">
                        {analyticsData.summary.topPerformerThreshold.toFixed(1)}%
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Excellence benchmark
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Payout Distribution */}
                <Card className="bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-xl text-gray-900 dark:text-white flex items-center">
                      <DollarSign className="h-5 w-5 mr-3 text-green-600" />
                      Payout Distribution
                    </CardTitle>
                    <CardDescription>
                      Distribution of payouts across different ranges
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analyticsData.payoutDistribution.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="font-medium text-gray-900 dark:text-white min-w-[120px]">
                              {item.range}
                            </div>
                            <Progress value={item.percentage} className="w-32" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {item.percentage}%
                            </span>
                          </div>
                          <Badge variant="outline">
                            {item.count} reps
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Performance Tab */}
              <TabsContent value="performance">
                <Card className="bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-xl text-gray-900 dark:text-white flex items-center">
                      <TrendingUp className="h-5 w-5 mr-3 text-blue-600" />
                      Top Performing Representatives
                    </CardTitle>
                    <CardDescription>
                      Highest earning sales representatives and their performance metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analyticsData.topPerformingReps.map((rep, index) => (
                        <div key={rep.repId} className="flex items-center justify-between p-4 border rounded-lg border-gray-200 dark:border-gray-700">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full">
                              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                {index + 1}
                              </span>
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-white">
                                {rep.repName}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                ID: {rep.repId}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-green-600">
                              ${rep.payoutAmount.toLocaleString()}
                            </div>
                            <Badge variant={rep.quotaAttainment >= 120 ? "default" : "secondary"}>
                              {rep.quotaAttainment.toFixed(1)}% attainment
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Territory Tab */}
              <TabsContent value="territory">
                <Card className="bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-xl text-gray-900 dark:text-white flex items-center">
                      <MapPin className="h-5 w-5 mr-3 text-purple-600" />
                      Territory Effectiveness
                    </CardTitle>
                    <CardDescription>
                      Performance analysis by territory and region
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analyticsData.territoryEffectiveness.map((territory, index) => (
                        <div key={territory.territory} className="p-4 border rounded-lg border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {territory.territory}
                            </div>
                            <Badge variant="outline">
                              {territory.repCount} rep{territory.repCount !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                Average Attainment
                              </div>
                              <div className="font-bold text-blue-600">
                                {territory.avgQuotaAttainment.toFixed(1)}%
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                Total Payout
                              </div>
                              <div className="font-bold text-green-600">
                                ${territory.totalPayout.toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <Progress 
                            value={Math.min(territory.avgQuotaAttainment, 150)} 
                            className="mt-2" 
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Distribution Tab */}
              <TabsContent value="distribution">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-lg text-gray-900 dark:text-white">
                        Payout Range Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analyticsData.payoutDistribution.map((item, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {item.range}
                            </span>
                            <div className="flex items-center space-x-2">
                              <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${item.percentage}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[60px]">
                                {item.count} ({item.percentage}%)
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-lg text-gray-900 dark:text-white">
                        Key Metrics Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">Highest Individual Payout</span>
                          <span className="font-semibold text-green-600">
                            ${Math.max(...analyticsData.topPerformingReps.map(r => r.payoutAmount)).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">Average Payout</span>
                          <span className="font-semibold text-blue-600">
                            ${Math.round(analyticsData.summary.totalPayout / analyticsData.summary.totalReps).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">Top Performers</span>
                          <span className="font-semibold text-purple-600">
                            {analyticsData.topPerformingReps.filter(r => r.quotaAttainment >= analyticsData.summary.topPerformerThreshold).length}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">Quota Achievers</span>
                          <span className="font-semibold text-orange-600">
                            {analyticsData.topPerformingReps.filter(r => r.quotaAttainment >= 100).length}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-gray-600 dark:text-gray-300">
                No analytics data available. Please ensure you have calculated payouts first.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}