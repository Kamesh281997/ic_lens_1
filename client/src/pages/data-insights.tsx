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
  ShoppingCart,
  X,
  Minimize2,
  Maximize2
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
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  // Export insights functionality
  const handleExportInsights = () => {
    if (!analyticsData) {
      toast({
        title: "Export Failed",
        description: "No data available to export",
        variant: "destructive",
      });
      return;
    }

    const exportData = {
      summary: analyticsData.summary,
      topPerformingReps: analyticsData.topPerformingReps,
      territoryEffectiveness: analyticsData.territoryEffectiveness,
      payoutDistribution: analyticsData.payoutDistribution,
      salesInsights: analyticsData.salesInsights,
      exportDate: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `ic-insights-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Export Successful",
      description: "Analytics data exported successfully",
      variant: "default",
    });
  };

  // Refresh data functionality
  const handleRefreshData = () => {
    refetch();
    toast({
      title: "Data Refreshed",
      description: "Analytics data has been refreshed",
      variant: "default",
    });
  };
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'assistant',
      content: 'Hello! I\'m your AI analytics assistant trained on all your IC data. I can help you analyze sales performance, compensation trends, territory effectiveness, and provide predictive insights. Ask me anything about your data!',
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

  // AI Chat mutation with comprehensive RAG context
  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/ai/chat", {
        message,
        context: {
          analyticsData,
          timestamp: new Date().toISOString(),
          userProfile: user,
          ragContext: "full_dataset_access" // Indicates AI should access all available data
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
        title: "AI Assistant Error",
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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--gp-surface-base)' }}>
        <div className="gp-card">
          <div className="text-center">
            <h1 className="gp-h1 mb-4">Authentication Required</h1>
            <p className="gp-body-l mb-6">
              Please log in to access data insights
            </p>
            <Link href="/auth?redirect=/data-insights">
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
              <Link href="/">
                <span className="gp-nav-link text-lg font-medium cursor-pointer">
                  <ArrowLeft className="h-4 w-4 mr-2 inline" />
                  Back to Home
                </span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 lg:px-12 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-12">
            <h1 className="gp-display-l mb-4">
              Data Insights & Analytics
            </h1>
            <p className="gp-body-l">
              Comprehensive performance analytics and compensation insights
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 mb-8">
            <button
              onClick={handleExportInsights}
              disabled={isLoading}
              className="gp-btn-secondary"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Insights
            </button>
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
              <TabsList className="grid w-full grid-cols-5 h-16 mb-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                <TabsTrigger value="overview" className="text-lg font-semibold py-4 px-6 data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900 data-[state=active]:text-blue-900 dark:data-[state=active]:text-blue-100 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Overview</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="sales" className="text-lg font-semibold py-4 px-6 data-[state=active]:bg-green-100 dark:data-[state=active]:bg-green-900 data-[state=active]:text-green-900 dark:data-[state=active]:text-green-100 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Sales Insights</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="performance" className="text-lg font-semibold py-4 px-6 data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-purple-900 data-[state=active]:text-purple-900 dark:data-[state=active]:text-purple-100 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <Award className="h-5 w-5" />
                    <span>Performance</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="territory" className="text-lg font-semibold py-4 px-6 data-[state=active]:bg-orange-100 dark:data-[state=active]:bg-orange-900 data-[state=active]:text-orange-900 dark:data-[state=active]:text-orange-100 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5" />
                    <span>Territory</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="distribution" className="text-lg font-semibold py-4 px-6 data-[state=active]:bg-pink-100 dark:data-[state=active]:bg-pink-900 data-[state=active]:text-pink-900 dark:data-[state=active]:text-pink-100 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <PieChart className="h-5 w-5" />
                    <span>Distribution</span>
                  </div>
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

                {/* Payout Distribution with Radial Charts */}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {analyticsData.payoutDistribution.map((item, index) => {
                        const colors = ['text-blue-600', 'text-purple-600', 'text-green-600', 'text-orange-600', 'text-red-600'];
                        const bgColors = ['bg-blue-100 dark:bg-blue-900', 'bg-purple-100 dark:bg-purple-900', 'bg-green-100 dark:bg-green-900', 'bg-orange-100 dark:bg-orange-900', 'bg-red-100 dark:bg-red-900'];
                        const borderColors = ['border-blue-200 dark:border-blue-800', 'border-purple-200 dark:border-purple-800', 'border-green-200 dark:border-green-800', 'border-orange-200 dark:border-orange-800', 'border-red-200 dark:border-red-800'];
                        
                        return (
                          <div key={index} className={`p-6 border-2 rounded-xl ${borderColors[index % 5]} ${bgColors[index % 5]} relative overflow-hidden`}>
                            <div className="flex items-center justify-between mb-4">
                              <div className="font-bold text-xl text-gray-900 dark:text-white">
                                {item.range}
                              </div>
                              <Badge variant="outline" className="text-lg px-3 py-1">
                                {item.count} reps
                              </Badge>
                            </div>
                            
                            {/* Radial Progress Chart */}
                            <div className="flex items-center justify-center mb-4">
                              <div className="relative w-24 h-24">
                                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                                  <circle
                                    cx="50"
                                    cy="50"
                                    r="45"
                                    stroke="currentColor"
                                    strokeWidth="6"
                                    fill="none"
                                    className="text-gray-300 dark:text-gray-600"
                                  />
                                  <circle
                                    cx="50"
                                    cy="50"
                                    r="45"
                                    stroke="currentColor"
                                    strokeWidth="6"
                                    fill="none"
                                    strokeDasharray={`${item.percentage * 2.827}, 282.7`}
                                    className={colors[index % 5]}
                                  />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className={`text-2xl font-bold ${colors[index % 5]}`}>
                                    {item.percentage}%
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-center">
                              <p className="text-lg text-gray-600 dark:text-gray-400">
                                {item.percentage}% of total payouts
                              </p>
                            </div>
                          </div>
                        );
                      })}
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

              {/* Performance Tab with Enhanced Visual Charts */}
              <TabsContent value="performance">
                <div className="space-y-6">
                  {/* Performance Overview Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 shadow-xl border-2 border-blue-200 dark:border-blue-700">
                      <CardHeader className="text-center">
                        <CardTitle className="text-xl text-blue-900 dark:text-blue-100">Top Performers</CardTitle>
                      </CardHeader>
                      <CardContent className="text-center">
                        <div className="text-4xl font-bold text-blue-600 dark:text-blue-300 mb-2">
                          {analyticsData.topPerformingReps.filter(rep => rep.quotaAttainment >= 120).length}
                        </div>
                        <p className="text-blue-700 dark:text-blue-200">≥120% Attainment</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 shadow-xl border-2 border-green-200 dark:border-green-700">
                      <CardHeader className="text-center">
                        <CardTitle className="text-xl text-green-900 dark:text-green-100">Solid Performers</CardTitle>
                      </CardHeader>
                      <CardContent className="text-center">
                        <div className="text-4xl font-bold text-green-600 dark:text-green-300 mb-2">
                          {analyticsData.topPerformingReps.filter(rep => rep.quotaAttainment >= 100 && rep.quotaAttainment < 120).length}
                        </div>
                        <p className="text-green-700 dark:text-green-200">100-120% Attainment</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 shadow-xl border-2 border-orange-200 dark:border-orange-700">
                      <CardHeader className="text-center">
                        <CardTitle className="text-xl text-orange-900 dark:text-orange-100">Improvement Needed</CardTitle>
                      </CardHeader>
                      <CardContent className="text-center">
                        <div className="text-4xl font-bold text-orange-600 dark:text-orange-300 mb-2">
                          {analyticsData.topPerformingReps.filter(rep => rep.quotaAttainment < 100).length}
                        </div>
                        <p className="text-orange-700 dark:text-orange-200">&lt;100% Attainment</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Top Performers with Hexagonal Performance Charts */}
                  <Card className="bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-2xl text-gray-900 dark:text-white flex items-center">
                        <Award className="h-7 w-7 mr-3 text-purple-600" />
                        Top Performing Representatives
                      </CardTitle>
                      <CardDescription className="text-lg">
                        Highest earning sales representatives with performance visualization
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {analyticsData.topPerformingReps.map((rep, index) => {
                          const colors = ['from-purple-500 to-pink-500', 'from-blue-500 to-cyan-500', 'from-green-500 to-emerald-500', 'from-orange-500 to-red-500', 'from-indigo-500 to-purple-500'];
                          const textColors = ['text-purple-600', 'text-blue-600', 'text-green-600', 'text-orange-600', 'text-indigo-600'];
                          
                          return (
                            <div key={rep.repId} className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-4">
                                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${colors[index % 5]} flex items-center justify-center text-white font-bold text-lg`}>
                                    {index + 1}
                                  </div>
                                  <div>
                                    <div className="font-bold text-xl text-gray-900 dark:text-white">
                                      {rep.repName}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                      ID: {rep.repId}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className={`font-bold text-2xl ${textColors[index % 5]}`}>
                                    ${rep.payoutAmount.toLocaleString()}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Hexagonal Performance Chart */}
                              <div className="flex items-center justify-center mb-4">
                                <div className="relative">
                                  <svg width="120" height="120" viewBox="0 0 120 120">
                                    {/* Hexagon Background */}
                                    <polygon
                                      points="60,10 90,30 90,70 60,90 30,70 30,30"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      className="text-gray-300 dark:text-gray-600"
                                    />
                                    {/* Progress Fill */}
                                    <polygon
                                      points="60,10 90,30 90,70 60,90 30,70 30,30"
                                      fill="url(#gradient)"
                                      fillOpacity={rep.quotaAttainment / 200}
                                      className={textColors[index % 5]}
                                    />
                                    <defs>
                                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
                                        <stop offset="100%" stopColor="currentColor" stopOpacity="0.8" />
                                      </linearGradient>
                                    </defs>
                                  </svg>
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                      <div className={`text-xl font-bold ${textColors[index % 5]}`}>
                                        {rep.quotaAttainment.toFixed(0)}%
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        Attainment
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="text-center">
                                <Badge variant={rep.quotaAttainment >= 120 ? "default" : rep.quotaAttainment >= 100 ? "secondary" : "destructive"} className="px-4 py-2">
                                  {rep.quotaAttainment >= 120 ? "🏆 Top Performer" : rep.quotaAttainment >= 100 ? "✅ Goal Achieved" : "📈 Needs Focus"}
                                </Badge>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Territory Tab with Enhanced Visual Charts */}
              <TabsContent value="territory">
                <div className="space-y-6">
                  {/* Territory Overview Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900 dark:to-emerald-800 shadow-xl border-2 border-emerald-200 dark:border-emerald-700">
                      <CardContent className="p-6 text-center">
                        <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-300">
                          {analyticsData.territoryEffectiveness.length}
                        </div>
                        <p className="text-emerald-700 dark:text-emerald-200 font-medium">Active Territories</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900 dark:to-cyan-800 shadow-xl border-2 border-cyan-200 dark:border-cyan-700">
                      <CardContent className="p-6 text-center">
                        <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-300">
                          {analyticsData.territoryEffectiveness.reduce((sum, t) => sum + t.repCount, 0)}
                        </div>
                        <p className="text-cyan-700 dark:text-cyan-200 font-medium">Total Reps</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-900 dark:to-violet-800 shadow-xl border-2 border-violet-200 dark:border-violet-700">
                      <CardContent className="p-6 text-center">
                        <div className="text-3xl font-bold text-violet-600 dark:text-violet-300">
                          {(analyticsData.territoryEffectiveness.reduce((sum, t) => sum + t.avgQuotaAttainment, 0) / analyticsData.territoryEffectiveness.length).toFixed(1)}%
                        </div>
                        <p className="text-violet-700 dark:text-violet-200 font-medium">Avg Attainment</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900 dark:to-amber-800 shadow-xl border-2 border-amber-200 dark:border-amber-700">
                      <CardContent className="p-6 text-center">
                        <div className="text-3xl font-bold text-amber-600 dark:text-amber-300">
                          ${analyticsData.territoryEffectiveness.reduce((sum, t) => sum + t.totalPayout, 0).toLocaleString()}
                        </div>
                        <p className="text-amber-700 dark:text-amber-200 font-medium">Total Payout</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Territory Performance with Bubble Charts */}
                  <Card className="bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-2xl text-gray-900 dark:text-white flex items-center">
                        <MapPin className="h-7 w-7 mr-3 text-purple-600" />
                        Territory Performance Dashboard
                      </CardTitle>
                      <CardDescription className="text-lg">
                        Comprehensive performance analysis by territory with visual indicators
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {analyticsData.territoryEffectiveness.map((territory, index) => {
                          const gradientColors = [
                            'from-purple-500 to-pink-500',
                            'from-blue-500 to-cyan-500', 
                            'from-green-500 to-emerald-500',
                            'from-orange-500 to-red-500',
                            'from-indigo-500 to-purple-500',
                            'from-teal-500 to-blue-500'
                          ];
                          const textColors = [
                            'text-purple-600',
                            'text-blue-600',
                            'text-green-600', 
                            'text-orange-600',
                            'text-indigo-600',
                            'text-teal-600'
                          ];
                          const bgColors = [
                            'bg-purple-50 dark:bg-purple-900/20',
                            'bg-blue-50 dark:bg-blue-900/20',
                            'bg-green-50 dark:bg-green-900/20',
                            'bg-orange-50 dark:bg-orange-900/20',
                            'bg-indigo-50 dark:bg-indigo-900/20',
                            'bg-teal-50 dark:bg-teal-900/20'
                          ];
                          
                          return (
                            <div key={territory.territory} className={`p-6 rounded-xl border-2 ${bgColors[index % 6]} border-gray-200 dark:border-gray-700`}>
                              {/* Territory Header */}
                              <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3">
                                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradientColors[index % 6]} flex items-center justify-center`}>
                                    <MapPin className="h-6 w-6 text-white" />
                                  </div>
                                  <div>
                                    <h3 className="font-bold text-xl text-gray-900 dark:text-white">
                                      {territory.territory}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      {territory.repCount} representative{territory.repCount !== 1 ? 's' : ''}
                                    </p>
                                  </div>
                                </div>
                                <Badge variant={territory.avgQuotaAttainment >= 110 ? "default" : territory.avgQuotaAttainment >= 90 ? "secondary" : "destructive"}>
                                  {territory.avgQuotaAttainment >= 110 ? "🏆 Excellent" : territory.avgQuotaAttainment >= 90 ? "✅ Good" : "📈 Needs Focus"}
                                </Badge>
                              </div>
                              
                              {/* Performance Metrics */}
                              <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="text-center">
                                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                    Quota Attainment
                                  </div>
                                  <div className={`text-3xl font-bold ${textColors[index % 6]}`}>
                                    {territory.avgQuotaAttainment.toFixed(1)}%
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                    Total Payout
                                  </div>
                                  <div className={`text-3xl font-bold ${textColors[index % 6]}`}>
                                    ${territory.totalPayout.toLocaleString()}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Bubble Chart Visualization */}
                              <div className="relative h-32 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                                <div className="absolute inset-0 flex items-center justify-center">
                                  {/* Performance Bubble */}
                                  <div 
                                    className={`rounded-full bg-gradient-to-br ${gradientColors[index % 6]} opacity-70 flex items-center justify-center text-white font-bold`}
                                    style={{
                                      width: `${Math.min(Math.max(territory.avgQuotaAttainment / 2, 40), 120)}px`,
                                      height: `${Math.min(Math.max(territory.avgQuotaAttainment / 2, 40), 120)}px`,
                                      fontSize: '14px'
                                    }}
                                  >
                                    {territory.avgQuotaAttainment.toFixed(0)}%
                                  </div>
                                  
                                  {/* Payout Indicator */}
                                  <div 
                                    className={`absolute rounded-full bg-white dark:bg-gray-900 border-4 ${textColors[index % 6].replace('text-', 'border-')} flex items-center justify-center`}
                                    style={{
                                      width: `${Math.min(Math.max(territory.totalPayout / 50000, 30), 60)}px`,
                                      height: `${Math.min(Math.max(territory.totalPayout / 50000, 30), 60)}px`,
                                      right: '10px',
                                      top: '10px',
                                      fontSize: '10px'
                                    }}
                                  >
                                    <DollarSign className="h-4 w-4" />
                                  </div>
                                </div>
                              </div>
                              
                              {/* Performance Bar */}
                              <div className="mt-4">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm text-gray-600 dark:text-gray-400">Performance Score</span>
                                  <span className={`text-sm font-medium ${textColors[index % 6]}`}>
                                    {territory.avgQuotaAttainment.toFixed(1)}%
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                  <div 
                                    className={`h-3 rounded-full bg-gradient-to-r ${gradientColors[index % 6]} transition-all duration-1000`}
                                    style={{ width: `${Math.min(territory.avgQuotaAttainment, 100)}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
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
        
        {/* Navigation Section at Bottom */}
        <div className="mt-16 py-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-center space-x-4">
            <Link href="/data-validation">
              <Button variant="outline" className="px-8 py-4 text-lg">
                <Activity className="h-5 w-5 mr-2" />
                Go to Data Validation
              </Button>
            </Link>
            <Link href="/payout-calculation">
              <Button variant="outline" className="px-8 py-4 text-lg">
                <DollarSign className="h-5 w-5 mr-2" />
                View Payout Calculation
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* AI Assistant Popup Chatbot */}
      {!isChatOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => setIsChatOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 shadow-lg transition-all duration-200 hover:scale-105"
          >
            <Bot className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* AI Assistant Chat Window - Large Window from Top */}
      {isChatOpen && (
        <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
          isMinimized ? 'w-80 h-16' : 'w-[90vw] max-w-6xl h-[80vh]'
        }`}>
          <Card className="bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-700 h-full flex flex-col">
            {/* Chat Header */}
            <CardHeader className="pb-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-gray-900 dark:text-white flex items-center">
                  <Bot className="h-5 w-5 mr-2 text-blue-600" />
                  AI Analytics Assistant
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    {isMinimized ? (
                      <Maximize2 className="h-4 w-4" />
                    ) : (
                      <Minimize2 className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsChatOpen(false)}
                    className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {!isMinimized && (
                <CardDescription className="text-sm">
                  RAG-powered assistant trained on all your IC data
                </CardDescription>
              )}
            </CardHeader>

            {/* Chat Content */}
            {!isMinimized && (
              <CardContent className="flex-1 flex flex-col p-4 overflow-hidden">
                {/* Chat Messages */}
                <ScrollArea className="flex-1 pr-2 mb-4">
                  <div className="space-y-3">
                    {chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-lg px-3 py-2 ${
                            message.sender === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                          }`}
                        >
                          <div className="flex items-start space-x-2">
                            {message.sender === 'assistant' && (
                              <Bot className="h-4 w-4 mt-0.5 text-blue-600" />
                            )}
                            <div className="flex-1">
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                {message.content}
                              </p>
                              <p className={`text-xs mt-1 ${
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
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
                          <div className="flex items-center space-x-2">
                            <Bot className="h-4 w-4 text-blue-600" />
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
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="flex space-x-2">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Ask about sales trends, territories, payouts..."
                      className="flex-1 text-sm"
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
                      size="sm"
                      className="px-3"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {[
                      "Top sales trends?",
                      "Underperforming territories?",
                      "Compensation analysis?",
                      "Growth predictions?"
                    ].map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-xs px-2 py-1 h-auto"
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
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}