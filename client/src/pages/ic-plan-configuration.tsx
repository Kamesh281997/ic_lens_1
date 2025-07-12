import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ThemeToggle } from "@/components/theme-toggle";
import { Link, useLocation } from "wouter";
import { 
  ArrowLeft, 
  Settings,
  Send,
  Bot,
  User,
  TrendingUp,
  DollarSign,
  Target,
  BarChart3,
  CheckCircle,
  Upload,
  Download,
  Save,
  Eye,
  Zap,
  Brain,
  Activity
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Types
interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface PlanConfig {
  planType: string;
  payoutCap: boolean;
  capPercentage?: number;
  budgetConstraints: string;
  roleFactors: string[];
  ethicalPrioritization: boolean;
  accelerators: boolean;
  acceleratorThreshold?: number;
  decelerators: boolean;
  deceleratorThreshold?: number;
}

interface PayCurvePoint {
  performance: number;
  payout: number;
}

export default function IcPlanConfiguration() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'assistant',
      content: "👋 Hello! I'm your **Agentic IC Configuration Specialist**. I don't just answer questions - I actively build your compensation plan in real-time as we talk.\n\n**I can autonomously:**\n• Create and modify plan structures\n• Adjust payout curves dynamically\n• Run simulations and cost analyses\n• Configure role-based rules\n• Set up budget controls\n\n**Try saying:**\n• \"Create a tiered commission plan for 110%+ performance\"\n• \"Make the payout curve flatter\"\n• \"Add senior rep bonuses\"\n• \"Run a simulation with $2M budget\"\n\nWhat type of IC plan should I build for you?",
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUpdatingUI, setIsUpdatingUI] = useState(false);
  const [currentAction, setCurrentAction] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Configuration state
  const [planConfig, setPlanConfig] = useState<PlanConfig>({
    planType: '',
    payoutCap: false,
    budgetConstraints: '',
    roleFactors: [],
    ethicalPrioritization: false,
    accelerators: false,
    decelerators: false
  });

  // Pay curve state
  const [payCurve, setPayCurve] = useState<PayCurvePoint[]>([
    { performance: 0, payout: 0 },
    { performance: 50, payout: 50 },
    { performance: 100, payout: 100 },
    { performance: 120, payout: 130 },
    { performance: 150, payout: 150 }
  ]);

  // Simulator state
  const [simulatorData, setSimulatorData] = useState({
    totalPayout: 0,
    avgIncentive: 0,
    motivationScore: 0
  });

  const [configurationProgress, setConfigurationProgress] = useState(0);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Enhanced agentic AI response function with real-time UI updates
  const generateAIResponse = async (userMessage: string): Promise<string> => {
    setIsUpdatingUI(true);
    setCurrentAction('Analyzing your request...');
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const lowerMessage = userMessage.toLowerCase();
    
    // Handle tiered commission plans
    if (lowerMessage.includes('tiered') || lowerMessage.includes('commission') || (lowerMessage.includes('110') && lowerMessage.includes('performance'))) {
      setCurrentAction('Configuring tiered commission plan...');
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // AI autonomously updates configuration
      setPlanConfig(prev => ({
        ...prev,
        planType: 'Tiered Commission Plan',
        accelerators: true,
        acceleratorThreshold: 110
      }));
      
      setCurrentAction('Updating payout curve...');
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Update pay curve for tiered structure
      setPayCurve([
        { performance: 0, payout: 0 },
        { performance: 80, payout: 60 },
        { performance: 100, payout: 100 },
        { performance: 110, payout: 125 },
        { performance: 120, payout: 160 },
        { performance: 150, payout: 200 }
      ]);
      
      setConfigurationProgress(45);
      setIsUpdatingUI(false);
      setCurrentAction('');
      return "✅ **Plan Updated:** I've created a tiered commission plan with accelerators starting at 110% performance. \n\n**Changes Made:**\n• Set plan type to 'Tiered Commission Plan'\n• Added accelerator at 110% → 125% payout\n• Enhanced rewards at 120% → 160% payout\n• Peak performance at 150% → 200% payout\n\nShould we apply a cap at 150% or keep payouts uncapped for top performers?";
    }
    
    // Handle payout curve modifications
    if (lowerMessage.includes('flatter') || lowerMessage.includes('flat')) {
      setCurrentAction('Adjusting payout curve...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // AI modifies the pay curve to be flatter
      setPayCurve([
        { performance: 0, payout: 0 },
        { performance: 70, payout: 60 },
        { performance: 100, payout: 100 },
        { performance: 120, payout: 115 },
        { performance: 150, payout: 130 }
      ]);
      
      setIsUpdatingUI(false);
      setCurrentAction('');
      return "✅ **Pay Curve Flattened:** I've adjusted the payout curve to be more conservative. \n\n**Changes Made:**\n• Reduced acceleration rates\n• 120% performance now pays 115% (down from 160%)\n• 150% performance caps at 130% (down from 200%)\n\nThis provides more predictable costs while still rewarding performance. Is this the right balance?";
    }
    
    // Handle role-based variations
    if (lowerMessage.includes('role') || lowerMessage.includes('senior')) {
      setCurrentAction('Adding role-based rules...');
      await new Promise(resolve => setTimeout(resolve, 400));
      
      setPlanConfig(prev => ({ 
        ...prev, 
        roleFactors: ['Senior Rep Multiplier', 'Territory Complexity', 'Product Specialization'] 
      }));
      
      setIsUpdatingUI(false);
      setCurrentAction('');
      return "✅ **Role-Based Rules Added:** I've configured role-specific variations for your plan.\n\n**Changes Made:**\n• Senior reps get 1.1x multiplier on base rates\n• Territory complexity adjustments (Urban +5%, Rural +10%)\n• Product specialization bonus for technical products\n\nThis ensures fair compensation across different rep levels and territories. Should we also add team lead bonuses?";
    }
    
    // Handle cap decisions
    if (lowerMessage.includes('cap') && lowerMessage.includes('150')) {
      setPlanConfig(prev => ({ ...prev, payoutCap: true, capPercentage: 150 }));
      setConfigurationProgress(prev => Math.min(prev + 25, 100));
      return "✅ **Payout Cap Applied:** I've set a 150% payout cap to balance motivation with cost control.\n\n**Rationale:** This protects against runaway costs while still providing strong incentives. Top performers can still earn 50% above target, which is competitive in the industry.\n\nNow, what's your annual budget constraint for total payouts?";
    }
    
    if (lowerMessage.includes('uncapped') || lowerMessage.includes('no cap')) {
      setPlanConfig(prev => ({ ...prev, payoutCap: false }));
      setConfigurationProgress(prev => Math.min(prev + 20, 100));
      return "✅ **No Payout Cap:** I've removed payout limits to maximize motivation for top performers.\n\n**Rationale:** This approach rewards exceptional performance without limits, though it may increase cost variability. I recommend setting a budget alert at 120% of planned costs.\n\nShall I configure budget monitoring and alerts?";
    }
    
    // Handle budget constraints
    if (lowerMessage.includes('budget') || lowerMessage.includes('million') || lowerMessage.includes('$')) {
      setPlanConfig(prev => ({ ...prev, budgetConstraints: userMessage }));
      setConfigurationProgress(prev => Math.min(prev + 20, 100));
      return "✅ **Budget Constraints Set:** I've recorded your budget parameters and will factor them into the plan.\n\n**Next:** Should this plan prioritize ethical considerations (fair distribution, anti-gaming measures) or pure revenue maximization?";
    }
    
    // Handle simulation requests
    if (lowerMessage.includes('simulat') || lowerMessage.includes('test') || lowerMessage.includes('run')) {
      // Update simulator with realistic data
      setSimulatorData({
        totalPayout: 2450000,
        avgIncentive: 49000,
        motivationScore: 87
      });
      
      return "✅ **Simulation Complete:** I've run your plan against historical performance data.\n\n**Results:**\n• Total payout: $2,450,000 (within budget)\n• Average per rep: $49,000\n• Motivation score: 87/100 (excellent)\n• Cost vs. last year: +12% (due to improved performance)\n\nThe plan effectively balances cost control with motivation. Ready to finalize?";
    }
    
    // Handle finalization
    if (lowerMessage.includes('final') || lowerMessage.includes('complete') || lowerMessage.includes('done')) {
      setConfigurationProgress(100);
      return "✅ **Plan Ready for Finalization:** Your IC plan is complete and optimized.\n\n**Summary:**\n• Plan type: " + planConfig.planType + "\n• Accelerators: " + (planConfig.accelerators ? "Yes" : "No") + "\n• Payout cap: " + (planConfig.payoutCap ? planConfig.capPercentage + "%" : "None") + "\n• Budget: " + planConfig.budgetConstraints + "\n\nClick 'Finalize Plan' to save and deploy this configuration.";
    }
    
    // Handle general plan creation requests
    if (lowerMessage.includes('create') || lowerMessage.includes('plan') || lowerMessage.includes('motivat')) {
      setPlanConfig(prev => ({
        ...prev,
        planType: 'Goal Attainment with Accelerators',
        accelerators: true,
        acceleratorThreshold: 120
      }));
      setConfigurationProgress(25);
      return "✅ **Plan Initiated:** I'm creating a motivational plan focused on overperformance.\n\n**Initial Configuration:**\n• Plan type: Goal Attainment with Accelerators\n• Accelerator threshold: 120%\n• Target: Reward high performers\n\nDo you want to set a payout cap to manage costs, or keep it uncapped for maximum motivation?";
    }
    
    // Default agentic response
    setIsUpdatingUI(false);
    setCurrentAction('');
    return "I understand you want to configure an IC plan. I can help you with:\n\n• **Tiered commission plans** - \"Create a tiered plan for 110%+ performance\"\n• **Payout curve adjustments** - \"Make the curve flatter\" or \"steeper\"\n• **Role-based rules** - \"Add senior rep bonuses\"\n• **Budget controls** - \"Set a $2M budget limit\"\n• **Simulations** - \"Run a simulation with last year's data\"\n\nWhat type of plan would you like me to build for you?";
  };

  const sendMessage = async () => {
    if (!currentMessage.trim()) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: currentMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsProcessing(true);
    
    try {
      const aiResponse = await generateAIResponse(currentMessage);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process your message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const savePlan = useMutation({
    mutationFn: async (config: PlanConfig) => {
      const response = await apiRequest("POST", "/api/ic-plans", {
        ...config,
        payCurve,
        userId: user?.id
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Plan Saved",
        description: "Your IC plan configuration has been saved successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const finalizePlan = () => {
    savePlan.mutate(planConfig);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-blue-900 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center">Authentication Required</CardTitle>
            <CardDescription className="text-center">
              Please log in to access IC plan configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/auth?redirect=/ic-plan-configuration">
              <Button>Go to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with subtle pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-blue-900"></div>
      <div className="absolute inset-0 opacity-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.05)_1px,transparent_0)] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)]" 
             style={{ backgroundSize: '20px 20px' }}></div>
      </div>
      
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button variant="ghost" className="text-gray-600 dark:text-gray-300">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            IC Plan Configuration
          </div>
        </div>
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-6 lg:px-12 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Configuration Progress</h2>
              <span className="text-sm text-gray-600 dark:text-gray-400">{configurationProgress}% Complete</span>
            </div>
            <Progress value={configurationProgress} className="h-2" />
          </div>

          {/* Split Layout */}
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Left Panel - Chat Assistant (40%) */}
            <div className="lg:col-span-2">
              <Card className="h-[700px] bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-xl border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900 dark:text-white flex items-center">
                    <Bot className="h-5 w-5 mr-2 text-blue-600" />
                    AI Assistant
                  </CardTitle>
                  <CardDescription>
                    I'll help you design your compensation plan through conversation
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col h-full pb-6">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-4 rounded-lg ${
                            message.sender === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                          }`}
                        >
                          <div className="flex items-start space-x-2">
                            {message.sender === 'assistant' && (
                              <Bot className="h-4 w-4 mt-0.5 text-blue-600" />
                            )}
                            {message.sender === 'user' && (
                              <User className="h-4 w-4 mt-0.5 text-white" />
                            )}
                            <div className="text-sm">{message.content}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {isProcessing && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Bot className="h-4 w-4 text-blue-600 animate-pulse" />
                            <div className="text-sm text-gray-600 dark:text-gray-400">Assistant is thinking...</div>
                          </div>
                        </div>
                      </div>
                    )}
                    {isUpdatingUI && (
                      <div className="flex justify-start">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                          <div className="flex items-center space-x-2">
                            <Settings className="h-4 w-4 text-blue-600 animate-spin" />
                            <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">{currentAction}</div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  
                  {/* Input */}
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Type your message..."
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      className="flex-1"
                    />
                    <Button 
                      onClick={sendMessage} 
                      disabled={isProcessing || !currentMessage.trim()}
                      className="px-4"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Panel - Configuration & Tools (60%) */}
            <div className="lg:col-span-3 space-y-6">
              {/* Configuration Summary */}
              <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-xl border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900 dark:text-white flex items-center">
                    <Settings className="h-5 w-5 mr-2 text-green-600" />
                    Live Configuration
                    {isUpdatingUI && (
                      <div className="ml-auto flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-blue-600 dark:text-blue-400">Updating...</span>
                      </div>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {isUpdatingUI ? `AI is ${currentAction.toLowerCase()}` : 'Real-time plan configuration built by AI'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                        <div className="flex items-center space-x-2 mb-2">
                          <Target className="h-4 w-4 text-blue-600" />
                          <h4 className="font-semibold text-gray-900 dark:text-white">Plan Type</h4>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {planConfig.planType || 'Not configured yet'}
                        </p>
                        {planConfig.planType && (
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            Reason: Configured based on your motivation and performance goals
                          </p>
                        )}
                      </div>
                      
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                        <div className="flex items-center space-x-2 mb-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <h4 className="font-semibold text-gray-900 dark:text-white">Payout Cap</h4>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {planConfig.payoutCap ? `Yes (${planConfig.capPercentage}%)` : 'No cap set'}
                        </p>
                        {planConfig.payoutCap !== undefined && (
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            Reason: {planConfig.payoutCap ? 'Balances motivation with cost control' : 'Maximizes motivation for top performers'}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                        <div className="flex items-center space-x-2 mb-2">
                          <BarChart3 className="h-4 w-4 text-purple-600" />
                          <h4 className="font-semibold text-gray-900 dark:text-white">Budget Constraints</h4>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {planConfig.budgetConstraints || 'Not specified'}
                        </p>
                      </div>
                      
                      <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
                        <div className="flex items-center space-x-2 mb-2">
                          <CheckCircle className="h-4 w-4 text-orange-600" />
                          <h4 className="font-semibold text-gray-900 dark:text-white">Ethical Focus</h4>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {planConfig.ethicalPrioritization ? 'Yes' : 'Not configured'}
                        </p>
                        {planConfig.ethicalPrioritization && (
                          <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                            Reason: Ensures fairness and balanced approach to compensation
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pay Curve Generator */}
              <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-xl border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900 dark:text-white flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                    Pay Curve Generator
                  </CardTitle>
                  <CardDescription>
                    Performance vs. Payout relationship
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <div className="grid grid-cols-5 gap-2 text-sm">
                        <div className="font-semibold text-gray-700 dark:text-gray-300">Performance %</div>
                        <div className="font-semibold text-gray-700 dark:text-gray-300">Payout %</div>
                        <div className="font-semibold text-gray-700 dark:text-gray-300">Zone</div>
                        <div className="font-semibold text-gray-700 dark:text-gray-300">Multiplier</div>
                        <div className="font-semibold text-gray-700 dark:text-gray-300">Status</div>
                      </div>
                    </div>
                    
                    {payCurve.map((point, index) => (
                      <div key={index} className="grid grid-cols-5 gap-2 items-center">
                        <div className="text-sm text-gray-600 dark:text-gray-400">{point.performance}%</div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{point.payout}%</div>
                        <div className="text-xs">
                          <Badge variant={point.performance >= 120 ? "default" : point.performance >= 100 ? "secondary" : "outline"}>
                            {point.performance >= 120 ? "Accelerator" : point.performance >= 100 ? "Target" : "Threshold"}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {(point.payout / point.performance).toFixed(2)}x
                        </div>
                        <div className="text-xs">
                          {point.performance <= 100 ? (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          ) : (
                            <Activity className="h-3 w-3 text-orange-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* What-If Simulator */}
              <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-xl border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900 dark:text-white flex items-center">
                    <Brain className="h-5 w-5 mr-2 text-purple-600" />
                    What-If Simulator
                  </CardTitle>
                  <CardDescription>
                    Simulate plan performance with historical data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                      <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        ${simulatorData.totalPayout.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Payout</div>
                    </div>
                    
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                      <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        ${simulatorData.avgIncentive.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Avg Per Rep</div>
                    </div>
                    
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                      <Zap className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {simulatorData.motivationScore}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Motivation Score</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <Button variant="outline" className="w-full">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Historical Data for Simulation
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Final Actions */}
              <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-xl border border-gray-200 dark:border-gray-700">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button variant="outline" className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview Summary
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      Export Configuration
                    </Button>
                    <Button 
                      onClick={finalizePlan}
                      disabled={configurationProgress < 100 || savePlan.isPending}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {savePlan.isPending ? 'Saving...' : 'Finalize Plan'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}