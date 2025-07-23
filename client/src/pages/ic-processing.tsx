import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ThemeToggle } from "@/components/theme-toggle";
import { Link, useLocation } from "wouter";
import { 
  Settings, 
  Target, 
  TrendingUp, 
  ArrowLeft, 
  ArrowRight, 
  Users, 
  Package,
  Calendar,
  Database,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  Play,
  Pause
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { icPlanSelectionSchema, type IcPlanSelectionData } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

interface CalculationJob {
  id: number;
  jobName: string;
  description: string;
  status: string;
  calculationType: string;
  planIds: string;
  periodStart: string;
  periodEnd: string;
  progress: number;
  totalRecords: number;
  processedRecords: number;
  errorCount: number;
  createdAt: string;
  startedAt: string;
  completedAt: string;
}

interface EnhancedCalculationData {
  jobName: string;
  description: string;
  calculationType: string;
  planIds: number[];
  periodStart: string;
  periodEnd: string;
  enableAnomalyDetection: boolean;
  enableTraceability: boolean;
}

export default function IcProcessing() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("basic");
  const [selectedPlans, setSelectedPlans] = useState<number[]>([1]);
  const [enabledFeatures, setEnabledFeatures] = useState({
    anomalyDetection: true,
    traceability: true,
    adjustmentWorkflow: true,
    performanceMonitoring: true
  });

  const form = useForm<IcPlanSelectionData>({
    resolver: zodResolver(icPlanSelectionSchema),
    defaultValues: {
      productName: "",
      teamName: "",
      planType: "Goal Attainment",
    },
  });

  // Fetch existing calculation jobs
  const { data: calculationJobs = [] } = useQuery({
    queryKey: ["/api/calculation-engine/jobs"],
  });

  const processingMutation = useMutation({
    mutationFn: async (data: IcPlanSelectionData) => {
      const response = await apiRequest("POST", "/api/ic-processing", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "IC Plan Selected",
        description: "Proceeding to data upload",
      });
      navigate("/data-upload");
    },
    onError: (error: Error) => {
      toast({
        title: "Processing Failed",
        description: error.message || "Failed to process IC plan selection",
        variant: "destructive",
      });
    },
  });

  const enhancedProcessingMutation = useMutation({
    mutationFn: async (data: EnhancedCalculationData) => {
      const response = await apiRequest("POST", "/api/ic-processing-enhanced", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Enhanced Processing Started",
        description: `Multi-plan calculation job ${data.jobId} initiated successfully`,
      });
      setActiveTab("monitor");
    },
    onError: (error: Error) => {
      toast({
        title: "Enhanced Processing Failed",
        description: error.message || "Failed to start enhanced processing",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: IcPlanSelectionData) => {
    // Store the plan type in localStorage for the data upload page
    localStorage.setItem('icPlanType', data.planType);
    processingMutation.mutate(data);
  };

  const onEnhancedSubmit = () => {
    const enhancedData: EnhancedCalculationData = {
      jobName: `Multi-Plan Calculation - ${new Date().toLocaleDateString()}`,
      description: `Processing ${selectedPlans.length} plan(s) with advanced features enabled`,
      calculationType: "multi_period",
      planIds: selectedPlans,
      periodStart: "2025-01-01",
      periodEnd: "2025-03-31",
      enableAnomalyDetection: enabledFeatures.anomalyDetection,
      enableTraceability: enabledFeatures.traceability
    };
    
    enhancedProcessingMutation.mutate(enhancedData);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'running': return <Play className="h-4 w-4 text-blue-500" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "default",
      running: "secondary", 
      failed: "destructive",
      pending: "outline"
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center">Authentication Required</CardTitle>
            <CardDescription className="text-center">
              Please log in to access IC processing
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
      {/* Header */}
      <header className="flex items-center justify-between px-6 lg:px-12 py-6">
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
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Enhanced IC Processing
            </h1>
            <p className="text-xl text-gray-300">
              Multi-Plan & Multi-Period Calculation Engine with Advanced Features
            </p>
          </div>

          {/* Enhanced Multi-Plan Processing Interface */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-gray-100 dark:bg-gray-800 h-12">
              <TabsTrigger value="basic" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Basic Setup</span>
              </TabsTrigger>
              <TabsTrigger value="multiplan" className="flex items-center space-x-2">
                <Database className="h-4 w-4" />
                <span>Multi-Plan Engine</span>
              </TabsTrigger>
              <TabsTrigger value="features" className="flex items-center space-x-2">
                <Zap className="h-4 w-4" />
                <span>Advanced Features</span>
              </TabsTrigger>
              <TabsTrigger value="monitor" className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Job Monitor</span>
              </TabsTrigger>
            </TabsList>

            {/* Basic Setup Tab */}
            <TabsContent value="basic">
              <Card className="bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-2xl text-gray-900 dark:text-white flex items-center">
                    <Settings className="h-6 w-6 mr-3 text-blue-600" />
                    Basic Plan Configuration
                  </CardTitle>
                  <CardDescription>
                    Traditional single plan setup for basic IC processing
                  </CardDescription>
                </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  {/* Product and Team Configuration */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="productName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                            <Package className="h-5 w-5 mr-2 text-blue-600" />
                            Product Name
                          </FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger className="h-12 text-lg bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500">
                                <SelectValue placeholder="Select product name" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Prevnar-B">Prevnar-B</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="teamName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                            <Users className="h-5 w-5 mr-2 text-blue-600" />
                            Team Name
                          </FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger className="h-12 text-lg bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500">
                                <SelectValue placeholder="Select team name" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="VS">VS</SelectItem>
                                <SelectItem value="VIS">VIS</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* IC Plan Type Selection */}
                  <FormField
                    control={form.control}
                    name="planType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-semibold text-gray-900 dark:text-white">
                          IC Plan Type
                        </FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                          >
                            <div className="flex items-center space-x-3 p-6 border rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border-gray-200 dark:border-gray-700">
                              <RadioGroupItem value="Goal Attainment" id="goal-attainment" />
                              <div className="flex-1">
                                <Label htmlFor="goal-attainment" className="flex items-center cursor-pointer">
                                  <Target className="h-6 w-6 text-blue-600 mr-3" />
                                  <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                      Goal Attainment
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                      Standard goal-based compensation plan with fixed targets
                                    </p>
                                  </div>
                                </Label>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3 p-6 border rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border-gray-200 dark:border-gray-700">
                              <RadioGroupItem value="Goal Attainment with Relative Rank" id="goal-with-rank" />
                              <div className="flex-1">
                                <Label htmlFor="goal-with-rank" className="flex items-center cursor-pointer">
                                  <TrendingUp className="h-6 w-6 text-blue-600 mr-3" />
                                  <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                      Goal Attainment with Relative Rank
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                      Goal-based plan with additional ranking-based adjustments
                                    </p>
                                  </div>
                                </Label>
                              </div>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Plan Details Card */}
                  <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                    <CardHeader>
                      <CardTitle className="text-lg text-blue-900 dark:text-blue-100">
                        Selected Plan Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="font-medium text-blue-800 dark:text-blue-200">Product:</span>
                          <span className="text-blue-900 dark:text-blue-100">
                            {form.watch("productName") || "Not selected"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-blue-800 dark:text-blue-200">Team:</span>
                          <span className="text-blue-900 dark:text-blue-100">
                            {form.watch("teamName") || "Not selected"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-blue-800 dark:text-blue-200">Plan Type:</span>
                          <span className="text-blue-900 dark:text-blue-100">
                            {form.watch("planType")}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                    <Button
                      type="submit"
                      size="lg"
                      className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
                      disabled={processingMutation.isPending}
                    >
                      {processingMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Proceed to Data Upload
                          <ArrowRight className="h-5 w-5 ml-2" />
                        </>
                      )}
                    </Button>
                    
                    <Link href="/data-validation">
                      <Button
                        variant="outline"
                        size="lg"
                        className="px-8 py-3 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        Skip to Data Validation
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </form>
              </Form>
            </CardContent>
              </Card>
            </TabsContent>

            {/* Multi-Plan Engine Tab */}
            <TabsContent value="multiplan">
              <Card className="bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-2xl text-gray-900 dark:text-white flex items-center">
                    <Database className="h-6 w-6 mr-3 text-green-600" />
                    Multi-Plan & Multi-Period Engine
                  </CardTitle>
                  <CardDescription>
                    Configure multiple IC plans for simultaneous processing across different time periods
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Plan Selection */}
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold text-gray-900 dark:text-white">
                      Select IC Plans to Process
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { id: 1, name: "Q1 Sales Team - Goal Attainment", team: "Sales", period: "Q1 2025" },
                        { id: 2, name: "Q1 Marketing Team - Rank-based", team: "Marketing", period: "Q1 2025" },
                        { id: 3, name: "Monthly Regional - Goal Attainment", team: "Regional", period: "Jan 2025" },
                        { id: 4, name: "Executive Bonus - Complex Formula", team: "Executive", period: "Q1 2025" },
                      ].map((plan) => (
                        <div key={plan.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-gray-200 dark:border-gray-700">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              checked={selectedPlans.includes(plan.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedPlans([...selectedPlans, plan.id]);
                                } else {
                                  setSelectedPlans(selectedPlans.filter(id => id !== plan.id));
                                }
                              }}
                            />
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 dark:text-white">{plan.name}</h4>
                              <div className="flex space-x-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                <span>Team: {plan.team}</span>
                                <span>Period: {plan.period}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Selected {selectedPlans.length} plan(s) for processing
                    </p>
                  </div>

                  {/* Period Configuration */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-lg font-semibold text-gray-900 dark:text-white">Period Start</Label>
                      <Input
                        type="date"
                        defaultValue="2025-01-01"
                        className="mt-2 h-12 text-lg bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                      />
                    </div>
                    <div>
                      <Label className="text-lg font-semibold text-gray-900 dark:text-white">Period End</Label>
                      <Input
                        type="date"
                        defaultValue="2025-03-31"
                        className="mt-2 h-12 text-lg bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                      />
                    </div>
                  </div>

                  {/* Calculation Summary */}
                  <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                    <CardHeader>
                      <CardTitle className="text-lg text-green-900 dark:text-green-100 flex items-center">
                        <Target className="h-5 w-5 mr-2" />
                        Processing Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium text-green-800 dark:text-green-200">Plans Selected:</span>
                          <span className="text-green-900 dark:text-green-100">{selectedPlans.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-green-800 dark:text-green-200">Processing Type:</span>
                          <span className="text-green-900 dark:text-green-100">Multi-Period Batch</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-green-800 dark:text-green-200">Estimated Records:</span>
                          <span className="text-green-900 dark:text-green-100">{selectedPlans.length * 1250} reps</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Button
                    onClick={onEnhancedSubmit}
                    disabled={selectedPlans.length === 0 || enhancedProcessingMutation.isPending}
                    className="w-full h-12 text-lg bg-green-600 hover:bg-green-700 text-white font-semibold"
                  >
                    {enhancedProcessingMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                        Starting Multi-Plan Processing...
                      </>
                    ) : (
                      <>
                        <Play className="h-5 w-5 mr-2" />
                        Start Multi-Plan Processing
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Advanced Features Tab */}
            <TabsContent value="features">
              <Card className="bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-2xl text-gray-900 dark:text-white flex items-center">
                    <Zap className="h-6 w-6 mr-3 text-purple-600" />
                    Advanced Features Configuration
                  </CardTitle>
                  <CardDescription>
                    Enable advanced IC processing capabilities and AI-powered enhancements
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Feature Toggles */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Core Features</h3>
                      
                      <div className="flex items-center justify-between p-4 border rounded-lg border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-3">
                          <AlertTriangle className="h-5 w-5 text-yellow-600" />
                          <div>
                            <Label className="font-medium text-gray-900 dark:text-white">AI Anomaly Detection</Label>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Automatically flag unusual payouts</p>
                          </div>
                        </div>
                        <Checkbox
                          checked={enabledFeatures.anomalyDetection}
                          onCheckedChange={(checked) => 
                            setEnabledFeatures(prev => ({ ...prev, anomalyDetection: !!checked }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-3">
                          <Database className="h-5 w-5 text-blue-600" />
                          <div>
                            <Label className="font-medium text-gray-900 dark:text-white">Full Traceability</Label>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Complete audit trail for calculations</p>
                          </div>
                        </div>
                        <Checkbox
                          checked={enabledFeatures.traceability}
                          onCheckedChange={(checked) => 
                            setEnabledFeatures(prev => ({ ...prev, traceability: !!checked }))
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Workflow Features</h3>
                      
                      <div className="flex items-center justify-between p-4 border rounded-lg border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-3">
                          <Settings className="h-5 w-5 text-green-600" />
                          <div>
                            <Label className="font-medium text-gray-900 dark:text-white">Adjustment Workflows</Label>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Manager override and approval system</p>
                          </div>
                        </div>
                        <Checkbox
                          checked={enabledFeatures.adjustmentWorkflow}
                          onCheckedChange={(checked) => 
                            setEnabledFeatures(prev => ({ ...prev, adjustmentWorkflow: !!checked }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-3">
                          <TrendingUp className="h-5 w-5 text-red-600" />
                          <div>
                            <Label className="font-medium text-gray-900 dark:text-white">Performance Monitoring</Label>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Real-time processing metrics</p>
                          </div>
                        </div>
                        <Checkbox
                          checked={enabledFeatures.performanceMonitoring}
                          onCheckedChange={(checked) => 
                            setEnabledFeatures(prev => ({ ...prev, performanceMonitoring: !!checked }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Feature Summary */}
                  <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                    <CardHeader>
                      <CardTitle className="text-lg text-purple-900 dark:text-purple-100">
                        Enabled Features Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(enabledFeatures).map(([key, enabled]) => (
                          enabled && (
                            <Badge key={key} variant="secondary" className="bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-100">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </Badge>
                          )
                        ))}
                        {Object.values(enabledFeatures).every(v => !v) && (
                          <span className="text-purple-700 dark:text-purple-300">No advanced features enabled</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Job Monitor Tab */}
            <TabsContent value="monitor">
              <Card className="bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-2xl text-gray-900 dark:text-white flex items-center">
                    <Calendar className="h-6 w-6 mr-3 text-orange-600" />
                    Processing Job Monitor
                  </CardTitle>
                  <CardDescription>
                    Track and monitor your IC calculation jobs in real-time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {calculationJobs.length > 0 ? (
                      calculationJobs.map((job: CalculationJob) => (
                        <Card key={job.id} className="border border-gray-200 dark:border-gray-700">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                {getStatusIcon(job.status)}
                                <div>
                                  <h4 className="font-semibold text-gray-900 dark:text-white">{job.jobName}</h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{job.description}</p>
                                </div>
                              </div>
                              {getStatusBadge(job.status)}
                            </div>
                            
                            {job.status === 'running' && (
                              <div className="mb-3">
                                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                                  <span>Progress: {job.processedRecords} / {job.totalRecords} records</span>
                                  <span>{job.progress}%</span>
                                </div>
                                <Progress value={job.progress} className="h-2" />
                              </div>
                            )}
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-gray-600 dark:text-gray-400">Type:</span>
                                <p className="text-gray-900 dark:text-white">{job.calculationType}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-600 dark:text-gray-400">Plans:</span>
                                <p className="text-gray-900 dark:text-white">{job.planIds}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-600 dark:text-gray-400">Period:</span>
                                <p className="text-gray-900 dark:text-white">{job.periodStart} to {job.periodEnd}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-600 dark:text-gray-400">Started:</span>
                                <p className="text-gray-900 dark:text-white">{job.startedAt}</p>
                              </div>
                            </div>
                            
                            {job.errorCount > 0 && (
                              <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                                <span className="text-red-800 dark:text-red-200 text-sm">
                                  {job.errorCount} errors encountered during processing
                                </span>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Processing Jobs</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Start a multi-plan calculation to see job status here
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}