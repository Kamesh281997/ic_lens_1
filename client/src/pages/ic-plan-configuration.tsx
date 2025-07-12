import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { ArrowLeft, Bot, Settings, Cog } from "lucide-react";

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

export default function IcPlanConfiguration() {
  const { isAuthenticated } = useAuth();
  const [planConfig, setPlanConfig] = useState<PlanConfig>({
    planType: 'Standard Revenue Plan',
    payoutCap: false,
    budgetConstraints: 'none',
    roleFactors: ['Revenue Attainment'],
    ethicalPrioritization: true,
    accelerators: false,
    decelerators: false
  });
  
  const [configurationProgress, setConfigurationProgress] = useState(25);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--gp-surface-base)' }}>
        <div className="gp-card">
          <div className="text-center">
            <h1 className="gp-h1 mb-4">Authentication Required</h1>
            <p className="gp-body-l mb-6">
              Please log in to access IC Plan Configuration
            </p>
            <Link href="/auth?redirect=/ic-plan-configuration">
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
            
            {/* Center: Page Title */}
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white">
                IC Plan Configuration
              </h1>
            </div>
            
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
              AI-Powered IC Plan Configuration
            </h1>
            <p className="gp-body-l">
              Design and optimize your incentive compensation plans with intelligent assistance
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="gp-h2">Configuration Progress</h2>
              <span className="gp-body-s">{configurationProgress}% Complete</span>
            </div>
            <Progress value={configurationProgress} className="h-3" />
          </div>

          {/* Split Layout */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Panel - Configuration Assistant */}
            <div className="gp-card">
              <div className="pb-6">
                <div className="gp-h2 flex items-center">
                  <Bot className="h-6 w-6 mr-2" style={{ color: 'var(--gp-brand-accent)' }} />
                  AI Configuration Assistant
                </div>
                <p className="gp-body-s mt-2">
                  I'll help you design your compensation plan step by step
                </p>
              </div>

              <div className="space-y-6">
                {/* Current Plan Type */}
                <div className="space-y-4">
                  <h3 className="gp-h3">Current Plan Configuration</h3>
                  <div className="gp-card p-4" style={{ backgroundColor: 'var(--gp-surface-raised)' }}>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="gp-body-s font-medium">Plan Type:</span>
                        <span className="gp-body-s">{planConfig.planType}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="gp-body-s font-medium">Payout Cap:</span>
                        <span className="gp-body-s">{planConfig.payoutCap ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="gp-body-s font-medium">Accelerators:</span>
                        <span className="gp-body-s">{planConfig.accelerators ? 'Enabled' : 'Disabled'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="gp-body-s font-medium">Role Factors:</span>
                        <span className="gp-body-s">{planConfig.roleFactors.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-4">
                  <h3 className="gp-h3">Quick Configuration</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      className="gp-btn-secondary"
                      onClick={() => {
                        setPlanConfig(prev => ({ ...prev, planType: 'Revenue Plan' }));
                        setConfigurationProgress(50);
                      }}
                    >
                      Revenue Plan
                    </button>
                    <button 
                      className="gp-btn-secondary"
                      onClick={() => {
                        setPlanConfig(prev => ({ ...prev, planType: 'Matrix Plan' }));
                        setConfigurationProgress(60);
                      }}
                    >
                      Matrix Plan
                    </button>
                    <button 
                      className="gp-btn-secondary"
                      onClick={() => {
                        setPlanConfig(prev => ({ ...prev, planType: 'Tiered Plan' }));
                        setConfigurationProgress(55);
                      }}
                    >
                      Tiered Plan
                    </button>
                    <button 
                      className="gp-btn-secondary"
                      onClick={() => {
                        setPlanConfig(prev => ({ ...prev, planType: 'Volume Plan' }));
                        setConfigurationProgress(45);
                      }}
                    >
                      Volume Plan
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - Configuration Summary */}
            <div className="gp-card">
              <div className="pb-6">
                <div className="gp-h2 flex items-center">
                  <Settings className="h-6 w-6 mr-2" style={{ color: 'var(--gp-brand-accent)' }} />
                  Plan Summary & Tools
                </div>
                <p className="gp-body-s mt-2">
                  Review your configuration and access additional tools
                </p>
              </div>

              <div className="space-y-6">
                {/* Configuration Summary */}
                <div className="space-y-4">
                  <h3 className="gp-h3">Configuration Summary</h3>
                  <div className="gp-card p-4" style={{ backgroundColor: 'var(--gp-surface-raised)' }}>
                    <div className="space-y-3">
                      <div>
                        <h4 className="gp-body-s font-semibold mb-2">Plan Details</h4>
                        <ul className="gp-body-xs space-y-1">
                          <li>• Plan Type: {planConfig.planType}</li>
                          <li>• Ethical Prioritization: {planConfig.ethicalPrioritization ? 'Enabled' : 'Disabled'}</li>
                          <li>• Budget Constraints: {planConfig.budgetConstraints}</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="gp-body-s font-semibold mb-2">Performance Factors</h4>
                        <ul className="gp-body-xs space-y-1">
                          {planConfig.roleFactors.map((factor, index) => (
                            <li key={index}>• {factor}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tools & Actions */}
                <div className="space-y-4">
                  <h3 className="gp-h3">Tools & Actions</h3>
                  <div className="space-y-3">
                    <button 
                      className="gp-btn-primary w-full"
                      onClick={() => {
                        setIsProcessing(true);
                        setTimeout(() => {
                          setConfigurationProgress(100);
                          setIsProcessing(false);
                        }, 2000);
                      }}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Finalize Configuration'}
                    </button>
                    <button className="gp-btn-secondary w-full">
                      Generate Pay Curve
                    </button>
                    <button className="gp-btn-secondary w-full">
                      Run What-If Analysis
                    </button>
                    <button className="gp-btn-ghost w-full">
                      Export Configuration
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Coming Soon Notice */}
          <div className="mt-12 text-center">
            <div className="gp-card max-w-2xl mx-auto">
              <div className="text-center">
                <Cog className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--gp-brand-accent)' }} />
                <h3 className="gp-h2 mb-4">Advanced Features Coming Soon</h3>
                <p className="gp-body-l mb-6">
                  Full AI-powered conversational configuration, advanced analytics, and real-time optimization tools are currently in development.
                </p>
                <div className="flex justify-center space-x-4">
                  <Link href="/ic-processing">
                    <button className="gp-btn-primary">
                      Continue to IC Processing
                    </button>
                  </Link>
                  <Link href="/data-insights">
                    <button className="gp-btn-secondary">
                      View Analytics
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}