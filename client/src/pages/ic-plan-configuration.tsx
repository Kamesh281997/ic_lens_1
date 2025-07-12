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
      content: "Hi! I'm your Life Sciences IC Specialist. I can help you create compensation plans.\n\nI can build: Goal Attainment Plans, Matrix-Based Plans, Rank-Based Plans, Volume Growth Plans, and Territory-Based Plans.\n\nWhat type of plan do you need?",
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

  // Enhanced agentic AI response function with life sciences IC plan expertise
  const generateAIResponse = async (userMessage: string): Promise<string> => {
    setIsUpdatingUI(true);
    setCurrentAction('Analyzing your request...');
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const lowerMessage = userMessage.toLowerCase();
    
    // Handle Goal Attainment Plans
    if (lowerMessage.includes('goal attainment') || lowerMessage.includes('quota') || lowerMessage.includes('target')) {
      setCurrentAction('Configuring Goal Attainment Plan...');
      await new Promise(resolve => setTimeout(resolve, 600));
      
      setPlanConfig(prev => ({
        ...prev,
        planType: 'Goal Attainment Plan',
        accelerators: true,
        acceleratorThreshold: 100
      }));
      
      setCurrentAction('Setting up performance thresholds...');
      await new Promise(resolve => setTimeout(resolve, 400));
      
      setPayCurve([
        { performance: 0, payout: 0 },
        { performance: 80, payout: 50 },
        { performance: 100, payout: 100 },
        { performance: 120, payout: 150 },
        { performance: 140, payout: 200 }
      ]);
      
      setConfigurationProgress(60);
      setIsUpdatingUI(false);
      setCurrentAction('');
      return "✅ **Goal Attainment Plan Created:** Standard life sciences plan with threshold-based payouts.\n\n**Configuration:**\n• Threshold: 80% of quota (50% payout)\n• Target: 100% of quota (100% payout)\n• Accelerator: 120% quota (150% payout)\n• Excellence: 140% quota (200% payout)\n\nThis is the most common life sciences IC structure. Should we add decelerators for underperformance or keep minimum thresholds?";
    }
    
    // Handle Matrix-Based Plans
    if (lowerMessage.includes('matrix') || lowerMessage.includes('dual') || lowerMessage.includes('multi-measure')) {
      setCurrentAction('Building Matrix-Based Plan...');
      await new Promise(resolve => setTimeout(resolve, 600));
      
      setPlanConfig(prev => ({
        ...prev,
        planType: 'Matrix-Based Plan',
        roleFactors: ['Revenue Attainment', 'Volume Attainment', 'Strategic Objectives']
      }));
      
      setCurrentAction('Configuring dual-axis matrix...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPayCurve([
        { performance: 0, payout: 0 },
        { performance: 90, payout: 75 },
        { performance: 100, payout: 100 },
        { performance: 110, payout: 125 },
        { performance: 120, payout: 150 }
      ]);
      
      setConfigurationProgress(65);
      setIsUpdatingUI(false);
      setCurrentAction('');
      return "✅ **Matrix-Based Plan Configured:** Dual-measure compensation structure common in pharma.\n\n**Matrix Structure:**\n• Revenue Attainment (60% weight)\n• Volume Attainment (30% weight)\n• Strategic Objectives (10% weight)\n\n**Multiplier Logic:**\n• Both measures at 100% = 100% payout\n• High revenue + low volume = Reduced payout\n• Balanced performance = Optimized payout\n\nShould we adjust the weighting or add additional measures like market share?";
    }
    
    // Handle Rank Plans
    if (lowerMessage.includes('rank') || lowerMessage.includes('ranking') || lowerMessage.includes('percentile')) {
      setCurrentAction('Designing Rank-Based Plan...');
      await new Promise(resolve => setTimeout(resolve, 600));
      
      setPlanConfig(prev => ({
        ...prev,
        planType: 'Rank-Based Plan',
        ethicalPrioritization: true
      }));
      
      setCurrentAction('Setting up peer ranking system...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPayCurve([
        { performance: 0, payout: 50 },
        { performance: 25, payout: 75 },
        { performance: 50, payout: 100 },
        { performance: 75, payout: 125 },
        { performance: 100, payout: 150 }
      ]);
      
      setConfigurationProgress(70);
      setIsUpdatingUI(false);
      setCurrentAction('');
      return "✅ **Rank-Based Plan Created:** Peer-comparison compensation structure.\n\n**Ranking Structure:**\n• Top 10% of reps: 150% payout\n• Top 25% of reps: 125% payout\n• Middle 50% of reps: 100% payout\n• Bottom 25% of reps: 75% payout\n• Bottom 10% of reps: 50% payout\n\n**Benefits:** Drives competitive performance, normalized for market conditions.\n**Considerations:** Can create internal competition. Should we add team collaboration bonuses?";
    }
    
    // Handle Volume Growth Plans
    if (lowerMessage.includes('volume') || lowerMessage.includes('growth') || lowerMessage.includes('unit')) {
      setCurrentAction('Configuring Volume Growth Plan...');
      await new Promise(resolve => setTimeout(resolve, 600));
      
      setPlanConfig(prev => ({
        ...prev,
        planType: 'Volume Growth Plan',
        accelerators: true,
        acceleratorThreshold: 105
      }));
      
      setCurrentAction('Setting up volume-based incentives...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPayCurve([
        { performance: 0, payout: 0 },
        { performance: 95, payout: 70 },
        { performance: 100, payout: 100 },
        { performance: 105, payout: 140 },
        { performance: 110, payout: 180 }
      ]);
      
      setConfigurationProgress(65);
      setIsUpdatingUI(false);
      setCurrentAction('');
      return "✅ **Volume Growth Plan Established:** Unit-based compensation for life sciences.\n\n**Volume Structure:**\n• Based on prescription volume/units sold\n• Threshold: 95% of volume target (70% payout)\n• Target: 100% of volume target (100% payout)\n• Growth: 105% of volume target (140% payout)\n• Excellence: 110% of volume target (180% payout)\n\n**Ideal for:** New product launches, generic competition markets. Should we add market share protection bonuses?";
    }
    
    // Handle Tiered Commission Plans
    if (lowerMessage.includes('tiered') || lowerMessage.includes('commission') || lowerMessage.includes('tier')) {
      setCurrentAction('Creating Tiered Commission Plan...');
      await new Promise(resolve => setTimeout(resolve, 600));
      
      setPlanConfig(prev => ({
        ...prev,
        planType: 'Tiered Commission Plan',
        accelerators: true,
        acceleratorThreshold: 110
      }));
      
      setCurrentAction('Configuring progressive tiers...');
      await new Promise(resolve => setTimeout(resolve, 400));
      
      setPayCurve([
        { performance: 0, payout: 0 },
        { performance: 80, payout: 60 },
        { performance: 100, payout: 100 },
        { performance: 110, payout: 125 },
        { performance: 120, payout: 160 },
        { performance: 150, payout: 200 }
      ]);
      
      setConfigurationProgress(55);
      setIsUpdatingUI(false);
      setCurrentAction('');
      return "✅ **Tiered Commission Plan Built:** Progressive rate structure for life sciences.\n\n**Commission Tiers:**\n• 0-80%: 0.75% commission rate\n• 80-100%: 1.00% commission rate\n• 100-110%: 1.25% commission rate\n• 110-120%: 1.60% commission rate\n• 120%+: 2.00% commission rate\n\n**Benefits:** Rewards incremental performance gains. Should we cap at 150% or allow unlimited upside?";
    }
    
    // Handle Budget/Territory-Based Plans
    if (lowerMessage.includes('territory') || lowerMessage.includes('geography') || lowerMessage.includes('region')) {
      setCurrentAction('Designing Territory-Based Plan...');
      await new Promise(resolve => setTimeout(resolve, 600));
      
      setPlanConfig(prev => ({
        ...prev,
        planType: 'Territory-Based Plan',
        roleFactors: ['Territory Complexity', 'Market Potential', 'Geographic Adjustments']
      }));
      
      setConfigurationProgress(60);
      setIsUpdatingUI(false);
      setCurrentAction('');
      return "✅ **Territory-Based Plan Created:** Geographic compensation structure for life sciences.\n\n**Territory Features:**\n• Market potential adjustments\n• Geographic complexity multipliers\n• Physician density considerations\n• Competitive landscape factors\n\n**Multipliers:**\n• Urban territories: 1.0x baseline\n• Suburban territories: 1.1x baseline\n• Rural territories: 1.2x baseline\n• High-competition areas: 1.15x baseline\n\nShould we add travel expense reimbursement or mileage bonuses?";
    }
    
    // Handle Plan Modifications
    if (lowerMessage.includes('modify') || lowerMessage.includes('adjust') || lowerMessage.includes('change')) {
      setCurrentAction('Modifying existing plan...');
      await new Promise(resolve => setTimeout(resolve, 400));
      
      setIsUpdatingUI(false);
      setCurrentAction('');
      return "✅ **Plan Modification Ready:** I can adjust your current " + planConfig.planType + ".\n\n**Available Modifications:**\n• Adjust payout thresholds\n• Change acceleration rates\n• Add/remove caps\n• Modify weighting factors\n• Update territory multipliers\n\n**Tell me specifically:** What aspect would you like to modify? (e.g., \"Lower the threshold to 85%\" or \"Add a 200% cap\")";
    }
    
    // Handle Simulation/Testing
    if (lowerMessage.includes('simulat') || lowerMessage.includes('test') || lowerMessage.includes('model')) {
      setCurrentAction('Running IC plan simulation...');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setSimulatorData({
        totalPayout: 2450000,
        avgIncentive: 49000,
        motivationScore: 87
      });
      
      setIsUpdatingUI(false);
      setCurrentAction('');
      return "✅ **Simulation Complete:** Tested your " + planConfig.planType + " against historical data.\n\n**Results:**\n• Total payout: $2,450,000\n• Average per rep: $49,000\n• Motivation score: 87/100\n• Cost predictability: High\n• Gaming risk: Low\n\n**Performance Distribution:**\n• 15% of reps exceed 120% quota\n• 35% of reps achieve 100-120% quota\n• 40% of reps achieve 80-100% quota\n• 10% of reps below 80% quota\n\nReady to finalize or need adjustments?";
    }
    
    // Handle Finalization
    if (lowerMessage.includes('final') || lowerMessage.includes('complete') || lowerMessage.includes('save')) {
      setCurrentAction('Finalizing plan configuration...');
      await new Promise(resolve => setTimeout(resolve, 600));
      
      setConfigurationProgress(100);
      setIsUpdatingUI(false);
      setCurrentAction('');
      return "✅ **Plan Finalized:** Your " + planConfig.planType + " is ready for deployment.\n\n**Summary:**\n• Plan type: " + planConfig.planType + "\n• Accelerators: " + (planConfig.accelerators ? "Yes" : "No") + "\n• Payout cap: " + (planConfig.payoutCap ? planConfig.capPercentage + "%" : "None") + "\n• Role factors: " + planConfig.roleFactors.length + " configured\n\n**Next Steps:**\n• Export to Excel for review\n• Generate compliance documentation\n• Schedule stakeholder approval\n• Deploy to payroll system\n\nClick 'Export Plan' to download configuration files.";
    }
    
    // Default intelligent response
    setIsUpdatingUI(false);
    setCurrentAction('');
    return "I'm your **Life Sciences IC Specialist**. I can configure any standard pharma/biotech compensation plan:\n\n**📊 Standard Plans:**\n• **Goal Attainment Plans** - \"Create a goal attainment plan\"\n• **Matrix-Based Plans** - \"Build a dual-measure matrix plan\"\n• **Rank-Based Plans** - \"Design a peer ranking plan\"\n• **Volume Growth Plans** - \"Configure a volume-based plan\"\n• **Tiered Commission Plans** - \"Create a tiered commission structure\"\n• **Territory-Based Plans** - \"Build a geographic territory plan\"\n\n**🔧 I can also:**\n• Modify existing plans\n• Run simulations\n• Add compliance features\n• Configure role-based rules\n\nWhat type of IC plan do you need?";
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

  const handleUploadData = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.csv,.xlsx,.json';
    fileInput.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        toast({
          title: "File Uploaded",
          description: `${file.name} has been uploaded for simulation`,
        });
        // Update simulator data with realistic values
        setSimulatorData({
          totalPayout: 3250000,
          avgIncentive: 65000,
          motivationScore: 92
        });
      }
    };
    fileInput.click();
  };

  const handlePreviewSummary = () => {
    const summary = `
IC PLAN CONFIGURATION SUMMARY
============================

Plan Type: ${planConfig.planType || 'Not configured'}
Payout Cap: ${planConfig.payoutCap ? `Yes (${planConfig.capPercentage}%)` : 'No cap set'}
Budget Constraints: ${planConfig.budgetConstraints || 'Not specified'}
Ethical Focus: ${planConfig.ethicalPrioritization ? 'Yes' : 'Not configured'}

Pay Curve Points:
${payCurve.map(point => `${point.performance}% performance → ${point.payout}% payout`).join('\n')}

Simulation Results:
- Total Payout: $${simulatorData.totalPayout.toLocaleString()}
- Average Incentive: $${simulatorData.avgIncentive.toLocaleString()}
- Motivation Score: ${simulatorData.motivationScore}/100

Configuration Progress: ${configurationProgress}%
`;
    
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ic-plan-summary.txt';
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Summary Downloaded",
      description: "IC plan summary has been downloaded as a text file",
    });
  };

  const handleExportConfiguration = () => {
    const config = {
      planConfiguration: planConfig,
      payCurve: payCurve,
      simulatorData: simulatorData,
      progress: configurationProgress,
      exportDate: new Date().toISOString(),
      exportVersion: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ic-plan-configuration.json';
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Configuration Exported",
      description: "IC plan configuration has been exported as JSON file",
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
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
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <Link href="/">
            <Button variant="ghost" className="text-gray-600 dark:text-gray-300">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
        <div className="flex-1 text-center">
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
              {/* Top Row - Live Configuration and What If Simulator */}
              <div className="grid lg:grid-cols-2 gap-6">
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
                    <div className="space-y-4">
                      {/* First Row - Plan Type and Payout Cap */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      
                      {/* Second Row - Budget Constraints and Ethical Focus */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                {/* What-If Simulator */}
                <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-xl border border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-xl text-gray-900 dark:text-white flex items-center">
                      <Brain className="h-5 w-5 mr-2 text-purple-600" />
                      What-If Simulator
                    </CardTitle>
                    <CardDescription>
                      Cost analysis and motivation predictions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                          <div className="flex items-center space-x-2 mb-2">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <h4 className="font-medium text-gray-900 dark:text-white">Total Payout</h4>
                          </div>
                          <p className="text-2xl font-bold text-green-600">
                            ${simulatorData.totalPayout.toLocaleString()}
                          </p>
                        </div>
                        
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                          <div className="flex items-center space-x-2 mb-2">
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                            <h4 className="font-medium text-gray-900 dark:text-white">Avg Incentive</h4>
                          </div>
                          <p className="text-2xl font-bold text-blue-600">
                            ${simulatorData.avgIncentive.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                        <div className="flex items-center space-x-2 mb-2">
                          <Activity className="h-4 w-4 text-purple-600" />
                          <h4 className="font-medium text-gray-900 dark:text-white">Motivation Score</h4>
                        </div>
                        <div className="flex items-center space-x-4">
                          <p className="text-2xl font-bold text-purple-600">
                            {simulatorData.motivationScore}/100
                          </p>
                          <Progress value={simulatorData.motivationScore} className="flex-1" />
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t">
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={handleUploadData}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Data for Simulation
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

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



              {/* Final Actions */}
              <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-xl border border-gray-200 dark:border-gray-700">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={handlePreviewSummary}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview Summary
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={handleExportConfiguration}
                    >
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