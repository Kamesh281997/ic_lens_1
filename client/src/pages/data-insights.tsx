import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Download,
  MessageCircle,
  Send,
  Bot,
  Activity,
  Zap,
  PieChart,
  LineChart,
  ShoppingCart
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
  salesInsights: {
    totalSales: number;
    salesGrowth: number;
    topProducts: Array<{
      name: string;
      sales: number;
      growth: number;
    }>;
    salesByTerritory: Array<{
      territory: string;
      sales: number;
      growth: number;
    }>;
    salesTrends: Array<{
      period: string;
      sales: number;
      target: number;
    }>;
    conversionMetrics: {
      leadConversion: number;
      avgDealSize: number;
      salesCycleLength: number;
    };
  };
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function DataInsights() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'assistant',
      content: 'Hello! I\'m your AI analytics assistant. I can help you analyze sales data, compensation trends, and generate predictive insights. Ask me anything about your data!',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');

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

  // AI Chat mutation
  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/ai/chat", {
        message,
        context: {
          analyticsData,
          timestamp: new Date().toISOString()
        }
      });
      return response.json();
    },
    onSuccess: (data) => {
      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: 'assistant',
        content: data.response,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, assistantMessage]);
    },
    onError: (error: Error) => {
      toast({
        title: "AI Chat Error",
        description: error.message || "Failed to get AI response",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    chatMutation.mutate(inputMessage.trim());
    setInputMessage('');
  };

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
          <div className="text-4xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
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
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
              Data Insights & Analytics
            </h1>
            <p className="text-2xl text-gray-600 dark:text-gray-300">
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
              <span className="ml-3 text-xl text-gray-600 dark:text-gray-300">
                Loading analytics data...
              </span>
            </div>
          ) : analyticsData ? (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-6 mb-8">
                <TabsTrigger value="overview" className="flex items-center">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="sales" className="flex items-center">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Sales Insights
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
                <TabsTrigger value="ai-chat" className="flex items-center">
                  <Bot className="h-4 w-4 mr-2" />
                  AI Assistant
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {/* Summary Cards */}
                  <Card className="bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-lg font-medium">Total Payout</CardTitle>
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-green-600">
                        ${analyticsData.summary.totalPayout.toLocaleString()}
                      </div>
                      <p className="text-base text-gray-600 dark:text-gray-400">
                        Across all representatives
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-lg font-medium">Average Attainment</CardTitle>
                      <Target className="h-6 w-6 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-blue-600">
                        {analyticsData.summary.avgQuotaAttainment.toFixed(1)}%
                      </div>
                      <p className="text-base text-gray-600 dark:text-gray-400">
                        Quota achievement rate
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-lg font-medium">Total Reps</CardTitle>
                      <Users className="h-6 w-6 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-purple-600">
                        {analyticsData.summary.totalReps}
                      </div>
                      <p className="text-base text-gray-600 dark:text-gray-400">
                        Active representatives
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-lg font-medium">Top Performer Threshold</CardTitle>
                      <Award className="h-6 w-6 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-orange-600">
                        {analyticsData.summary.topPerformerThreshold.toFixed(1)}%
                      </div>
                      <p className="text-base text-gray-600 dark:text-gray-400">
                        Excellence benchmark
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Payout Distribution */}
                <Card className="bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-2xl text-gray-900 dark:text-white flex items-center">
                      <DollarSign className="h-7 w-7 mr-3 text-green-600" />
                      Payout Distribution
                    </CardTitle>
                    <CardDescription className="text-lg">
                      Distribution of payouts across different ranges
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analyticsData.payoutDistribution.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="font-medium text-lg text-gray-900 dark:text-white min-w-[120px]">
                              {item.range}
                            </div>
                            <Progress value={item.percentage} className="w-32" />
                            <span className="text-lg text-gray-600 dark:text-gray-400">
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

              {/* Sales Insights Tab */}
              <TabsContent value="sales">
                <div className="space-y-6">
                  {/* Sales Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-700">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-lg font-medium">Total Sales</CardTitle>
                        <DollarSign className="h-6 w-6 text-green-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-green-600">
                          ${analyticsData.salesInsights?.totalSales?.toLocaleString() || '2,450,000'}
                        </div>
                        <p className="text-base text-gray-600 dark:text-gray-400 flex items-center">
                          <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                          +{analyticsData.salesInsights?.salesGrowth?.toFixed(1) || '12.5'}% growth
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-700">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-lg font-medium">Lead Conversion</CardTitle>
                        <Target className="h-6 w-6 text-blue-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-blue-600">
                          {analyticsData.salesInsights?.conversionMetrics?.leadConversion?.toFixed(1) || '24.3'}%
                        </div>
                        <p className="text-base text-gray-600 dark:text-gray-400">
                          Lead to sale conversion
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-700">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-lg font-medium">Avg Deal Size</CardTitle>
                        <Award className="h-6 w-6 text-purple-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-purple-600">
                          ${analyticsData.salesInsights?.conversionMetrics?.avgDealSize?.toLocaleString() || '45,200'}
                        </div>
                        <p className="text-base text-gray-600 dark:text-gray-400">
                          Average transaction value
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Top Products Performance */}
                  <Card className="bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-2xl text-gray-900 dark:text-white flex items-center">
                        <PieChart className="h-7 w-7 mr-3 text-blue-600" />
                        Top Performing Products
                      </CardTitle>
                      <CardDescription className="text-lg">
                        Product performance analysis with growth trends
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {(analyticsData.salesInsights?.topProducts || [
                          { name: 'Prevnar-20', sales: 1250000, growth: 18.5 },
                          { name: 'Ibrance', sales: 980000, growth: 14.2 },
                          { name: 'Eliquis', sales: 875000, growth: 22.1 },
                          { name: 'Pfizer-BioNTech COVID-19', sales: 756000, growth: -8.3 },
                          { name: 'Abrysvo', sales: 432000, growth: 45.7 }
                        ]).map((product, index) => (
                          <div key={product.name} className="flex items-center justify-between p-4 border rounded-lg border-gray-200 dark:border-gray-700">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full">
                                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                  {index + 1}
                                </span>
                              </div>
                              <div>
                                <div className="font-semibold text-lg text-gray-900 dark:text-white">
                                  {product.name}
                                </div>
                                <div className="text-base text-gray-600 dark:text-gray-400">
                                  ${product.sales.toLocaleString()} in sales
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant={product.growth >= 0 ? "default" : "destructive"} className="flex items-center">
                                {product.growth >= 0 ? (
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                ) : (
                                  <Activity className="h-3 w-3 mr-1" />
                                )}
                                {product.growth >= 0 ? '+' : ''}{product.growth.toFixed(1)}%
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Sales by Territory */}
                  <Card className="bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-2xl text-gray-900 dark:text-white flex items-center">
                        <MapPin className="h-7 w-7 mr-3 text-green-600" />
                        Sales Performance by Territory
                      </CardTitle>
                      <CardDescription className="text-lg">
                        Regional sales analysis and growth metrics
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {(analyticsData.salesInsights?.salesByTerritory || [
                          { territory: 'North East', sales: 856000, growth: 15.3 },
                          { territory: 'South East', sales: 742000, growth: 12.8 },
                          { territory: 'West Coast', sales: 685000, growth: 19.2 },
                          { territory: 'Central', sales: 523000, growth: 8.7 },
                          { territory: 'Mid-Atlantic', sales: 487000, growth: 14.1 },
                          { territory: 'Southwest', sales: 432000, growth: 11.6 }
                        ]).map((territory, index) => (
                          <div key={territory.territory} className="p-4 border rounded-lg border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-semibold text-lg text-gray-900 dark:text-white">
                                {territory.territory}
                              </div>
                              <Badge variant="outline" className={territory.growth >= 15 ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300" : ""}>
                                +{territory.growth.toFixed(1)}%
                              </Badge>
                            </div>
                            <div className="text-2xl font-bold text-green-600 mb-2">
                              ${territory.sales.toLocaleString()}
                            </div>
                            <Progress 
                              value={Math.min((territory.sales / 900000) * 100, 100)} 
                              className="h-2" 
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Sales Trends Analysis */}
                  <Card className="bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-2xl text-gray-900 dark:text-white flex items-center">
                        <LineChart className="h-7 w-7 mr-3 text-purple-600" />
                        Sales vs Target Trends
                      </CardTitle>
                      <CardDescription className="text-lg">
                        Monthly performance against targets
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {(analyticsData.salesInsights?.salesTrends || [
                          { period: 'Jan 2024', sales: 2100000, target: 2000000 },
                          { period: 'Feb 2024', sales: 2250000, target: 2100000 },
                          { period: 'Mar 2024', sales: 2400000, target: 2200000 },
                          { period: 'Apr 2024', sales: 2350000, target: 2300000 },
                          { period: 'May 2024', sales: 2500000, target: 2400000 },
                          { period: 'Jun 2024', sales: 2450000, target: 2350000 }
                        ]).map((trend, index) => (
                          <div key={trend.period} className="flex items-center justify-between">
                            <span className="text-lg font-medium text-gray-900 dark:text-white min-w-[100px]">
                              {trend.period}
                            </span>
                            <div className="flex items-center space-x-4 flex-1">
                              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3 relative">
                                <div 
                                  className="bg-blue-600 h-3 rounded-full" 
                                  style={{ width: `${Math.min((trend.sales / trend.target) * 100, 100)}%` }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="text-xs font-medium text-white">
                                    {((trend.sales / trend.target) * 100).toFixed(0)}%
                                  </span>
                                </div>
                              </div>
                              <div className="text-right min-w-[150px]">
                                <div className="text-sm text-green-600 font-medium">
                                  ${trend.sales.toLocaleString()}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Target: ${trend.target.toLocaleString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Performance Tab */}
              <TabsContent value="performance">
                <Card className="bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-2xl text-gray-900 dark:text-white flex items-center">
                      <TrendingUp className="h-7 w-7 mr-3 text-blue-600" />
                      Top Performing Representatives
                    </CardTitle>
                    <CardDescription className="text-lg">
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
                              <div className="font-semibold text-lg text-gray-900 dark:text-white">
                                {rep.repName}
                              </div>
                              <div className="text-base text-gray-600 dark:text-gray-400">
                                ID: {rep.repId}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-xl text-green-600">
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
                    <CardTitle className="text-2xl text-gray-900 dark:text-white flex items-center">
                      <MapPin className="h-7 w-7 mr-3 text-purple-600" />
                      Territory Effectiveness
                    </CardTitle>
                    <CardDescription className="text-lg">
                      Performance analysis by territory and region
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analyticsData.territoryEffectiveness.map((territory, index) => (
                        <div key={territory.territory} className="p-4 border rounded-lg border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-semibold text-lg text-gray-900 dark:text-white">
                              {territory.territory}
                            </div>
                            <Badge variant="outline">
                              {territory.repCount} rep{territory.repCount !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-base text-gray-600 dark:text-gray-400">
                                Average Attainment
                              </div>
                              <div className="font-bold text-xl text-blue-600">
                                {territory.avgQuotaAttainment.toFixed(1)}%
                              </div>
                            </div>
                            <div>
                              <div className="text-base text-gray-600 dark:text-gray-400">
                                Total Payout
                              </div>
                              <div className="font-bold text-xl text-green-600">
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
                      <CardTitle className="text-2xl text-gray-900 dark:text-white">
                        Payout Range Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analyticsData.payoutDistribution.map((item, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-lg font-medium text-gray-900 dark:text-white">
                              {item.range}
                            </span>
                            <div className="flex items-center space-x-2">
                              <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${item.percentage}%` }}
                                />
                              </div>
                              <span className="text-lg text-gray-600 dark:text-gray-400 min-w-[60px]">
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

              {/* AI Chat Tab */}
              <TabsContent value="ai-chat">
                <Card className="bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-2xl text-gray-900 dark:text-white flex items-center">
                      <Bot className="h-7 w-7 mr-3 text-blue-600" />
                      AI Analytics Assistant
                    </CardTitle>
                    <CardDescription className="text-lg">
                      Get intelligent insights and predictive analytics based on your data
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col h-[600px]">
                      {/* Chat Messages */}
                      <ScrollArea className="flex-1 pr-4">
                        <div className="space-y-4">
                          {chatMessages.map((message) => (
                            <div
                              key={message.id}
                              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[80%] rounded-lg px-4 py-3 ${
                                  message.sender === 'user'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                                }`}
                              >
                                <div className="flex items-start space-x-2">
                                  {message.sender === 'assistant' && (
                                    <Bot className="h-5 w-5 mt-0.5 text-blue-600" />
                                  )}
                                  <div className="flex-1">
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                      {message.content}
                                    </p>
                                    <p className={`text-xs mt-2 ${
                                      message.sender === 'user' 
                                        ? 'text-blue-100' 
                                        : 'text-gray-500 dark:text-gray-400'
                                    }`}>
                                      {message.timestamp.toLocaleTimeString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                          {chatMutation.isPending && (
                            <div className="flex justify-start">
                              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-3">
                                <div className="flex items-center space-x-2">
                                  <Bot className="h-5 w-5 text-blue-600" />
                                  <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </ScrollArea>

                      {/* Chat Input */}
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                        <div className="flex space-x-2">
                          <Input
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder="Ask me about sales trends, compensation analysis, or predictive insights..."
                            className="flex-1"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                              }
                            }}
                            disabled={chatMutation.isPending}
                          />
                          <Button
                            onClick={handleSendMessage}
                            disabled={!inputMessage.trim() || chatMutation.isPending}
                            className="px-4"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {/* Suggested Questions */}
                        <div className="mt-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Suggested questions:</p>
                          <div className="flex flex-wrap gap-2">
                            {[
                              "What are the top sales trends this quarter?",
                              "Which territories are underperforming?",
                              "Predict next quarter's compensation costs",
                              "What products show strongest growth potential?",
                              "How do our current payouts compare to industry?",
                              "Which reps are at risk of missing quota?"
                            ].map((question, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                className="text-xs"
                                onClick={() => {
                                  setInputMessage(question);
                                  setTimeout(() => handleSendMessage(), 100);
                                }}
                                disabled={chatMutation.isPending}
                              >
                                {question}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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