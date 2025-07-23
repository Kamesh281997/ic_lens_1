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
  Activity,
  History,
  GitBranch,
  Clock,
  RotateCcw,
  FileText,
  Camera,
  Shield,
  Archive,
  X,
  Minimize2,
  Maximize2
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

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

// Versioning and Auditing Types
interface PlanVersion {
  id: number;
  versionNumber: number;
  versionName?: string;
  configurationData: PlanConfig;
  payCurveData?: any;
  simulationResults?: any;
  summary?: string;
  changeDescription?: string;
  createdBy: number;
  createdAt: string;
  isSnapshot: boolean;
}

interface AuditLogEntry {
  id: number;
  planId: number;
  versionId?: number;
  userId: number;
  username: string;
  action: string;
  actionCategory: string;
  fieldChanged?: string;
  oldValue?: string;
  newValue?: string;
  changeSource: string;
  userMessage?: string;
  aiResponse?: string;
  timestamp: string;
}

interface EnhancedPlan {
  id: number;
  planName: string;
  planType: string;
  description?: string;
  currentVersion: number;
  status: string;
  createdAt: string;
  updatedAt: string;
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

  // Versioning and Auditing State
  const [currentPlan, setCurrentPlan] = useState<EnhancedPlan | null>(null);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showAuditTrail, setShowAuditTrail] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<PlanVersion | null>(null);
  const [versionCompareMode, setVersionCompareMode] = useState(false);
  const [compareVersions, setCompareVersions] = useState<[PlanVersion | null, PlanVersion | null]>([null, null]);
  const queryClient = useQueryClient();

  // Simulator state
  const [simulatorData, setSimulatorData] = useState({
    totalPayout: 0,
    avgIncentive: 0,
    motivationScore: 0
  });

  const [configurationProgress, setConfigurationProgress] = useState(0);

  // Initialize current plan for demo purposes
  useEffect(() => {
    if (!currentPlan && user) {
      setCurrentPlan({
        id: 1,
        planName: "Sample IC Plan",
        planType: "Goal Attainment Plan",
        description: "Demo plan for versioning",
        currentVersion: 1,
        status: "draft",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  }, [user, currentPlan]);

  // Versioning API Queries with proper fetch functions
  const { data: planVersions } = useQuery({
    queryKey: ['plan-versions', currentPlan?.id],
    queryFn: async (): Promise<PlanVersion[]> => {
      const response = await fetch(`/api/plans/${currentPlan?.id}/versions`);
      if (!response.ok) throw new Error('Failed to fetch versions');
      return response.json();
    },
    enabled: !!currentPlan?.id
  });

  const { data: auditLog } = useQuery({
    queryKey: ['audit-log', currentPlan?.id],
    queryFn: async (): Promise<AuditLogEntry[]> => {
      const response = await fetch(`/api/plans/${currentPlan?.id}/audit`);
      if (!response.ok) throw new Error('Failed to fetch audit log');
      return response.json();
    },
    enabled: !!currentPlan?.id
  });

  // Version management mutations
  const createSnapshotMutation = useMutation({
    mutationFn: async (data: { planId: number; versionName: string; description: string }) => {
      const response = await fetch(`/api/plans/${data.planId}/snapshot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          versionName: data.versionName,
          changeDescription: data.description,
          configurationData: planConfig,
          payCurveData: payCurve,
          simulationResults: simulatorData,
          isSnapshot: true
        })
      });
      if (!response.ok) throw new Error('Failed to create snapshot');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plan-versions'] });
      toast({ title: 'Snapshot Created', description: 'Plan version saved successfully' });
    }
  });

  const restoreVersionMutation = useMutation({
    mutationFn: async (versionId: number) => {
      const response = await fetch(`/api/plans/restore/${versionId}`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to restore version');
      return response.json();
    },
    onSuccess: (data: PlanVersion) => {
      if (data.configurationData) {
        setPlanConfig(data.configurationData);
      }
      if (data.payCurveData) {
        setPayCurve(data.payCurveData);
      }
      if (data.simulationResults) {
        setSimulatorData(data.simulationResults);
      }
      queryClient.invalidateQueries({ queryKey: ['plan-versions'] });
      toast({ title: 'Version Restored', description: 'Plan restored to selected version' });
    }
  });

  // Auto-save configuration changes and log them for audit trail
  useEffect(() => {
    if (currentPlan && user) {
      const logInteraction = async (field: string, oldValue: any, newValue: any) => {
        try {
          await fetch(`/api/plans/${currentPlan.id}/log-interaction`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'modify',
              actionCategory: 'plan_config',
              fieldChanged: field,
              oldValue: JSON.stringify(oldValue),
              newValue: JSON.stringify(newValue),
              userMessage: `Changed ${field}`,
              aiResponse: `Configuration updated: ${field} changed from ${oldValue} to ${newValue}`
            })
          });
        } catch (error) {
          console.error('Failed to log interaction:', error);
        }
      };

      // Track configuration changes
      const configStringified = JSON.stringify(planConfig);
      if (configStringified !== '{"planType":"","payoutCap":false,"budgetConstraints":"","roleFactors":[],"ethicalPrioritization":false,"accelerators":false,"decelerators":false}') {
        logInteraction('planConfig', 'previous_config', planConfig);
      }
    }
  }, [planConfig, currentPlan, user]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Advanced natural language processing for IC plan configuration
  const processNaturalLanguageRequest = (message: string): {
    intent: string,
    entities: any,
    confidence: number,
    action: string
  } => {
    const lowerMessage = message.toLowerCase();
    
    // Intent detection patterns
    const intents = {
      createPlan: {
        patterns: [
          /create?\s*(a|an)?\s*(new)?\s*plan/i,
          /build?\s*(a|an)?\s*plan/i,
          /design?\s*(a|an)?\s*plan/i,
          /set\s*up\s*(a|an)?\s*plan/i,
          /configure?\s*(a|an)?\s*plan/i,
          /make\s*(a|an)?\s*plan/i,
          /i\s*need\s*(a|an)?\s*plan/i,
          /help\s*me\s*(create|build|design)/i
        ],
        confidence: 0.9
      },
      modifyPlan: {
        patterns: [
          /(modify|change|adjust|update|alter|tweak)\s*(the)?\s*plan/i,
          /change\s*(the)?\s*(threshold|cap|percentage)/i,
          /(increase|decrease|raise|lower)\s*the/i,
          /set\s*the\s*(cap|threshold|percentage)\s*to/i,
          /(add|remove)\s*(a)?\s*(cap|threshold|accelerator)/i,
          /(cap|threshold)\s*(to|at)\s*\\d+/i,
          /(no|remove|delete)\s*(cap|threshold)/i,
          /make\s*it\s*(higher|lower|more|less)/i
        ],
        confidence: 0.85
      },
      generatePayCurve: {
        patterns: [
          /(generate|create|build|design)\s*(a)?\s*(pay\s*curve|paycurve)/i,
          /pay\s*curve/i,
          /performance\s*(vs|versus)\s*payout/i,
          /payout\s*structure/i,
          /(show|display)\s*(the)?\s*curve/i,
          /commission\s*structure/i,
          /(custom|new)\s*(curve|payout)/i,
          /curve\s*(with|at)\s*\\d+/i
        ],
        confidence: 0.9
      },
      runSimulation: {
        patterns: [
          /(run|execute|perform)\s*(a)?\s*simulat/i,
          /what\s*if\s*simulat/i,
          /(test|model|simulate)\s*(the)?\s*plan/i,
          /show\s*me\s*(the)?\s*results/i,
          /calculate\s*(the)?\s*(cost|payout)/i,
          /forecast\s*(the)?\s*budget/i
        ],
        confidence: 0.85
      },
      setPlanType: {
        patterns: [
          /(goal\s*attainment|quota\s*based)/i,
          /(matrix|dual\s*measure|multi\s*measure)/i,
          /(rank|ranking|percentile)/i,
          /(volume|growth|unit)/i,
          /(territory|geographic|region)/i,
          /(commission|tiered)/i
        ],
        confidence: 0.8
      }
    };
    
    // Entity extraction
    const entities: {
      planType?: string,
      percentage?: number,
      threshold?: number,
      cap?: number,
      budget?: string,
      measures: string[]
    } = {
      measures: []
    };
    
    // Extract plan types
    if (/goal\s*attainment|quota\s*based/i.test(message)) {
      entities.planType = 'Goal Attainment Plan';
    } else if (/matrix|dual\s*measure|multi\s*measure/i.test(message)) {
      entities.planType = 'Matrix-Based Plan';
    } else if (/rank|ranking|percentile/i.test(message)) {
      entities.planType = 'Rank-Based Plan';
    } else if (/volume|growth|unit/i.test(message)) {
      entities.planType = 'Volume Growth Plan';
    } else if (/territory|geographic|region/i.test(message)) {
      entities.planType = 'Territory-Based Plan';
    } else if (/commission|tiered/i.test(message)) {
      entities.planType = 'Tiered Commission Plan';
    }
    
    // Extract percentages and numbers (enhanced)
    const percentageMatch = message.match(/(\d+(?:\.\d+)?)\s*%?/);
    if (percentageMatch) {
      entities.percentage = parseFloat(percentageMatch[1]);
    }
    
    // Extract "remove cap" or "no cap" requests
    if (/no\s*cap|remove\s*cap|without\s*cap|uncapped/i.test(message)) {
      entities.cap = 0; // Special value to indicate removal
    }
    
    // Extract range values for thresholds
    const rangeMatch = message.match(/(between|from)\\s*(\\d+).*?(to|and)\\s*(\\d+)/i);
    if (rangeMatch) {
      entities.threshold = parseFloat(rangeMatch[2]);
      entities.cap = parseFloat(rangeMatch[4]);
    }
    
    // Extract thresholds
    const thresholdMatch = message.match(/threshold\s*(?:of|at|to)?\s*(\d+(?:\.\d+)?)\s*%?/i);
    if (thresholdMatch) {
      entities.threshold = parseFloat(thresholdMatch[1]);
    }
    
    // Extract cap values
    const capMatch = message.match(/cap\s*(?:of|at|to)?\s*(\d+(?:\.\d+)?)\s*%?/i);
    if (capMatch) {
      entities.cap = parseFloat(capMatch[1]);
    }
    
    // Extract budget amounts
    const budgetMatch = message.match(/budget\s*(?:of|at|to)?\s*\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/i);
    if (budgetMatch) {
      entities.budget = budgetMatch[1].replace(/,/g, '');
    }
    
    // Intent matching with confidence scoring
    let bestIntent = { intent: 'unknown', confidence: 0, action: 'respond' };
    
    for (const [intentName, intentData] of Object.entries(intents)) {
      for (const pattern of intentData.patterns) {
        if (pattern.test(message)) {
          if (intentData.confidence > bestIntent.confidence) {
            bestIntent = {
              intent: intentName,
              confidence: intentData.confidence,
              action: intentName === 'createPlan' ? 'createPlan' :
                     intentName === 'modifyPlan' ? 'modifyPlan' :
                     intentName === 'generatePayCurve' ? 'generatePayCurve' :
                     intentName === 'runSimulation' ? 'runSimulation' : 'respond'
            };
          }
        }
      }
    }
    
    return { ...bestIntent, entities };
  };

  // Enhanced agentic AI response function with advanced natural language processing
  const generateAIResponse = async (userMessage: string): Promise<string> => {
    setIsUpdatingUI(true);
    setCurrentAction('Analyzing your request...');
    
    // Process natural language request
    await new Promise(resolve => setTimeout(resolve, 600));
    const nlpResult = processNaturalLanguageRequest(userMessage);
    
    setCurrentAction(`Understanding: ${nlpResult.intent} (${Math.round(nlpResult.confidence * 100)}% confidence)`);
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Use NLP results to determine action
    if (nlpResult.action === 'createPlan' || nlpResult.action === 'setPlanType') {
      const planType = nlpResult.entities.planType || 'Goal Attainment Plan';
      setCurrentAction(`Creating ${planType}...`);
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Configure based on extracted entities
      const newConfig: Partial<PlanConfig> = {
        planType: planType,
        accelerators: true,
        acceleratorThreshold: nlpResult.entities.threshold || 100,
        payoutCap: nlpResult.entities.cap !== null,
        capPercentage: nlpResult.entities.cap || undefined,
        budgetConstraints: nlpResult.entities.budget ? `Budget limit: $${nlpResult.entities.budget}` : '',
        ethicalPrioritization: planType.includes('Rank') ? true : false
      };
      
      setPlanConfig(prev => ({ ...prev, ...newConfig }));
      
      // Generate appropriate pay curve based on plan type
      let newPayCurve: PayCurvePoint[] = [];
      
      if (planType.includes('Goal Attainment')) {
        newPayCurve = [
          { performance: 0, payout: 0 },
          { performance: 80, payout: 50 },
          { performance: 100, payout: 100 },
          { performance: 120, payout: 150 },
          { performance: 140, payout: 200 }
        ];
      } else if (planType.includes('Matrix')) {
        newPayCurve = [
          { performance: 0, payout: 0 },
          { performance: 90, payout: 75 },
          { performance: 100, payout: 100 },
          { performance: 110, payout: 125 },
          { performance: 120, payout: 150 }
        ];
      } else if (planType.includes('Rank')) {
        newPayCurve = [
          { performance: 0, payout: 50 },
          { performance: 25, payout: 75 },
          { performance: 50, payout: 100 },
          { performance: 75, payout: 125 },
          { performance: 100, payout: 150 }
        ];
      } else if (planType.includes('Volume')) {
        newPayCurve = [
          { performance: 0, payout: 0 },
          { performance: 95, payout: 80 },
          { performance: 100, payout: 100 },
          { performance: 105, payout: 130 },
          { performance: 115, payout: 165 }
        ];
      } else if (planType.includes('Territory')) {
        newPayCurve = [
          { performance: 0, payout: 0 },
          { performance: 85, payout: 70 },
          { performance: 100, payout: 100 },
          { performance: 115, payout: 135 },
          { performance: 130, payout: 170 }
        ];
      }
      
      setPayCurve(newPayCurve);
      setConfigurationProgress(70);
      
      setIsUpdatingUI(false);
      setCurrentAction('');
      
      return `✅ **${planType} Created Successfully!**\n\n**Configuration Applied:**\n• Plan Type: ${planType}\n• Pay Curve: ${newPayCurve.length} performance points configured\n• Cap: ${nlpResult.entities.cap ? nlpResult.entities.cap + '%' : 'None'}\n• Threshold: ${nlpResult.entities.threshold || 'Standard'}%\n• Budget: ${nlpResult.entities.budget ? '$' + nlpResult.entities.budget : 'Not specified'}\n\n**Confidence:** ${Math.round(nlpResult.confidence * 100)}% - I understood your request perfectly!\n\n**Next Steps:** Ask me to run a simulation, modify settings, or generate additional curves.`;
    }
    
    // Handle plan modifications
    else if (nlpResult.action === 'modifyPlan') {
      setCurrentAction('Modifying plan configuration...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updates: Partial<PlanConfig> = {};
      
      if (nlpResult.entities.cap !== null) {
        updates.payoutCap = true;
        updates.capPercentage = nlpResult.entities.cap;
      }
      
      if (nlpResult.entities.threshold !== null) {
        updates.acceleratorThreshold = nlpResult.entities.threshold;
        updates.accelerators = true;
      }
      
      if (nlpResult.entities.budget !== null) {
        updates.budgetConstraints = `Budget limit: $${nlpResult.entities.budget}`;
      }
      
      setPlanConfig(prev => ({ ...prev, ...updates }));
      setConfigurationProgress(prev => Math.min(prev + 10, 100));
      
      setIsUpdatingUI(false);
      setCurrentAction('');
      
      return `✅ **Plan Modified Successfully!**\n\n**Changes Applied:**\n${Object.entries(updates).map(([key, value]) => `• ${key}: ${value}`).join('\n')}\n\n**Confidence:** ${Math.round(nlpResult.confidence * 100)}% - Modifications completed based on your specifications.\n\n**Current Status:** Your ${planConfig.planType} is now updated with the requested changes.`;
    }
    
    // Handle pay curve generation
    else if (nlpResult.action === 'generatePayCurve') {
      setCurrentAction('Generating custom pay curve...');
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Generate intelligent pay curve based on entities
      const customCurve: PayCurvePoint[] = [];
      const thresholdStart = nlpResult.entities.threshold || 80;
      const capValue = nlpResult.entities.cap || 200;
      
      customCurve.push({ performance: 0, payout: 0 });
      customCurve.push({ performance: thresholdStart, payout: 50 });
      customCurve.push({ performance: 100, payout: 100 });
      customCurve.push({ performance: 120, payout: 140 });
      customCurve.push({ performance: 150, payout: Math.min(capValue, 200) });
      
      setPayCurve(customCurve);
      setConfigurationProgress(prev => Math.min(prev + 15, 100));
      
      setIsUpdatingUI(false);
      setCurrentAction('');
      
      return `✅ **Custom Pay Curve Generated!**\n\n**Curve Configuration:**\n${customCurve.map(point => `• ${point.performance}% performance → ${point.payout}% payout`).join('\n')}\n\n**Features:**\n• Threshold starts at ${thresholdStart}%\n• Target payout at 100% performance\n• ${capValue < 200 ? 'Capped at ' + capValue + '%' : 'Uncapped growth'}\n\n**Confidence:** ${Math.round(nlpResult.confidence * 100)}% - Pay curve customized to your specifications!`;
    }
    
    // Handle simulations
    else if (nlpResult.action === 'runSimulation') {
      setCurrentAction('Running advanced IC simulation...');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Calculate realistic simulation based on current configuration
      const baseReps = 50;
      const avgQuota = 1000000; // $1M average quota
      const performanceDistribution = [0.15, 0.35, 0.40, 0.10]; // Top, Good, Average, Below
      
      let totalPayout = 0;
      let totalReps = 0;
      
      // Simulate payout distribution
      payCurve.forEach((point, index) => {
        if (index < performanceDistribution.length) {
          const repsAtLevel = Math.floor(baseReps * performanceDistribution[index]);
          const payoutPerRep = (avgQuota * 0.15) * (point.payout / 100); // Assuming 15% target incentive
          totalPayout += repsAtLevel * payoutPerRep;
          totalReps += repsAtLevel;
        }
      });
      
      const avgIncentive = totalReps > 0 ? Math.floor(totalPayout / totalReps) : 0;
      const motivationScore = Math.min(95, 60 + (payCurve[payCurve.length - 1].payout / 4));
      
      setSimulatorData({
        totalPayout: Math.floor(totalPayout),
        avgIncentive,
        motivationScore: Math.floor(motivationScore)
      });
      
      setConfigurationProgress(prev => Math.min(prev + 20, 100));
      
      setIsUpdatingUI(false);
      setCurrentAction('');
      
      return `✅ **Simulation Complete!**\n\n**Results for ${planConfig.planType}:**\n• Total Budget: $${Math.floor(totalPayout).toLocaleString()}\n• Average per Rep: $${avgIncentive.toLocaleString()}\n• Motivation Score: ${Math.floor(motivationScore)}/100\n• Projected ROI: ${Math.floor(motivationScore * 0.8)}%\n\n**Performance Distribution:**\n• ${Math.floor(baseReps * 0.15)} top performers (>120%)\n• ${Math.floor(baseReps * 0.35)} good performers (100-120%)\n• ${Math.floor(baseReps * 0.40)} average performers (80-100%)\n• ${Math.floor(baseReps * 0.10)} below threshold (<80%)\n\n**Confidence:** ${Math.round(nlpResult.confidence * 100)}% - Simulation based on industry benchmarks and your plan configuration.`;
    }
    
    const lowerMessage = userMessage.toLowerCase();
    
    // Legacy handlers for backward compatibility (keeping original logic as fallback)
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
    
    // Enhanced default response with natural language examples
    setIsUpdatingUI(false);
    setCurrentAction('');
    return "I'm your **AI-Powered IC Specialist** with advanced natural language understanding! 🤖\n\n**💬 Just tell me what you need in plain English:**\n\n**Plan Creation Examples:**\n• \"Create a goal attainment plan with 150% cap\"\n• \"Build a matrix plan for pharma reps\"\n• \"Design a rank-based plan with threshold at 85%\"\n• \"Set up a territory plan with budget of $2M\"\n\n**Modifications:**\n• \"Change the cap to 180%\"\n• \"Lower the threshold to 75%\"\n• \"Add accelerators at 120%\"\n• \"Remove the payout cap\"\n\n**Analysis & Testing:**\n• \"Run a simulation on this plan\"\n• \"Generate a custom pay curve\"\n• \"Show me the ROI forecast\"\n• \"Test with 50 reps scenario\"\n\n**🎯 Current Confidence:** ${Math.round(nlpResult.confidence * 100)}% - I ${nlpResult.confidence > 0.7 ? 'understood your request well' : 'need more specific details'}\n\n**What would you like to configure today?**";
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
      {/* Background with subtle pattern */}
      <div className="absolute inset-0 bg-black"></div>
      <div className="absolute inset-0 opacity-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)]" 
             style={{ backgroundSize: '20px 20px' }}></div>
      </div>
      
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-6 bg-black/80 backdrop-blur-sm border-b border-gray-700">
        <div className="flex items-center">
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#ff4f59' }}>
                <span className="text-white font-bold text-sm">IC</span>
              </div>
              <span className="text-3xl font-bold transition-colors" style={{ color: '#ff4f59' }}>Lens</span>
            </div>
          </Link>
        </div>
        <div className="flex-1 text-center">
          <div className="text-3xl font-bold text-white">
            IC Plan Configuration
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {/* Versioning Controls */}
          <div className="flex items-center space-x-2">
            <Dialog open={showVersionHistory} onOpenChange={setShowVersionHistory}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="bg-purple-600/20 border-purple-500 text-purple-400 hover:bg-purple-600/30">
                  <History className="h-4 w-4 mr-2" />
                  Version History
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center">
                    <GitBranch className="h-5 w-5 mr-2 text-purple-600" />
                    Complete Version History
                  </DialogTitle>
                  <DialogDescription>
                    View all plan versions, compare changes, and restore any previous version
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {planVersions?.map((version) => (
                    <Card key={version.id} className="border-l-4 border-l-purple-500">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Badge variant={version.isSnapshot ? "default" : "secondary"}>
                              v{version.versionNumber}
                              {version.isSnapshot && <Camera className="h-3 w-3 ml-1" />}
                            </Badge>
                            <div>
                              <h4 className="font-semibold">
                                {version.versionName || `Version ${version.versionNumber}`}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {new Date(version.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedVersion(version)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => restoreVersionMutation.mutate(version.id)}
                              disabled={restoreVersionMutation.isPending}
                            >
                              <RotateCcw className="h-4 w-4 mr-1" />
                              Restore
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {version.changeDescription || version.summary || "No description provided"}
                        </p>
                        {version.configurationData && (
                          <div className="mt-2 text-xs text-gray-500">
                            Plan Type: {version.configurationData.planType} | 
                            Cap: {version.configurationData.payoutCap ? `${version.configurationData.capPercentage}%` : 'None'}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
            
            <Dialog open={showAuditTrail} onOpenChange={setShowAuditTrail}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="bg-orange-600/20 border-orange-500 text-orange-400 hover:bg-orange-600/30">
                  <Shield className="h-4 w-4 mr-2" />
                  Audit Trail
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-orange-600" />
                    Detailed Audit Trail
                  </DialogTitle>
                  <DialogDescription>
                    Complete chronological log of all changes for compliance and transparency
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {auditLog?.map((entry) => (
                      <Card key={entry.id} className="border-l-4 border-l-orange-500">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <Badge variant="outline" className="text-xs">
                                  {entry.action.toUpperCase()}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {entry.actionCategory}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  by {entry.username}
                                </span>
                              </div>
                              
                              {entry.fieldChanged && (
                                <div className="text-sm mb-2">
                                  <strong>Field:</strong> {entry.fieldChanged}
                                  {entry.oldValue && entry.newValue && (
                                    <div className="mt-1 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs">
                                      <div className="text-red-600 dark:text-red-400">
                                        <strong>From:</strong> {entry.oldValue}
                                      </div>
                                      <div className="text-green-600 dark:text-green-400">
                                        <strong>To:</strong> {entry.newValue}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {entry.userMessage && (
                                <div className="text-sm mb-1">
                                  <strong>User Request:</strong> "{entry.userMessage}"
                                </div>
                              )}
                              
                              {entry.aiResponse && (
                                <div className="text-sm text-blue-600 dark:text-blue-400">
                                  <strong>AI Response:</strong> {entry.aiResponse}
                                </div>
                              )}
                            </div>
                            
                            <div className="text-right text-xs text-gray-500 ml-4">
                              <div>{new Date(entry.timestamp).toLocaleString()}</div>
                              <div className="flex items-center mt-1">
                                <Clock className="h-3 w-3 mr-1" />
                                {entry.changeSource}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
            
            <Button
              variant="outline"
              size="sm"
              className="bg-green-600/20 border-green-500 text-green-400 hover:bg-green-600/30"
              onClick={() => {
                const versionName = prompt("Enter snapshot name:");
                const description = prompt("Enter description:");
                if (versionName && description && currentPlan) {
                  createSnapshotMutation.mutate({
                    planId: currentPlan.id,
                    versionName,
                    description
                  });
                }
              }}
            >
              <Camera className="h-4 w-4 mr-2" />
              Create Snapshot
            </Button>
          </div>
          
          <Separator orientation="vertical" className="h-6" />
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
                  
                  {/* Quick Action Buttons */}
                  <div className="mb-3">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Quick Actions:</div>
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setCurrentMessage("Create a goal attainment plan with 150% cap")}
                        className="text-xs"
                      >
                        Goal Plan
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setCurrentMessage("Generate a custom pay curve")}
                        className="text-xs"
                      >
                        Pay Curve
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setCurrentMessage("Run a simulation")}
                        className="text-xs"
                      >
                        Simulate
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setCurrentMessage("Change the cap to 200%")}
                        className="text-xs"
                      >
                        Modify
                      </Button>
                    </div>
                  </div>
                  
                  {/* Input */}
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Ask me anything: 'Create a matrix plan' or 'Set cap to 180%'..."
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