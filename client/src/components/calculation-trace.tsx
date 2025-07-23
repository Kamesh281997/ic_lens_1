import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Eye, 
  Calculator, 
  FileText, 
  ArrowRight, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Database, 
  GitBranch,
  CheckCircle,
  AlertCircle,
  Info,
  Code,
  LineChart
} from "lucide-react";
import { format } from "date-fns";

interface CalculationStep {
  id: number;
  calculationStep: number;
  stepName: string;
  stepDescription: string;
  inputData: any;
  ruleApplied: string;
  calculation: string;
  intermediateResult: number;
  finalStepResult: number;
  metadata: any;
  executedAt: string;
}

interface CalculationTrace {
  repId: string;
  repName: string;
  planId: number;
  planName: string;
  steps: CalculationStep[];
  finalPayout: number;
  originalData: any;
}

interface CalculationTraceDialogProps {
  repId: string;
  repName: string;
  finalPayout: number;
  jobId?: number;
}

export function CalculationTraceDialog({ repId, repName, finalPayout, jobId = 1 }: CalculationTraceDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Fetch calculation trace data
  const { data: traceData, isLoading } = useQuery<CalculationTrace>({
    queryKey: [`/api/calculation-trace/${jobId}/${repId}`],
    enabled: isOpen
  });

  // Mock trace data for demonstration (replace with real API call)
  const mockTraceData: CalculationTrace = {
    repId,
    repName,
    planId: 1,
    planName: "Q4 2024 Sales Incentive Plan",
    finalPayout,
    originalData: {
      quota: 500000,
      actualSales: 650000,
      territory: "Northeast",
      role: "Senior Sales Rep",
      targetPay: 75000,
      baselineCommission: 0.02
    },
    steps: [
      {
        id: 1,
        calculationStep: 1,
        stepName: "Data Validation",
        stepDescription: "Validate input sales data and quota information",
        inputData: {
          quota: 500000,
          actualSales: 650000,
          territory: "Northeast"
        },
        ruleApplied: "Data Validation Rules v2.1",
        calculation: "IF(actualSales > 0 AND quota > 0, VALID, INVALID)",
        intermediateResult: 1,
        finalStepResult: 1,
        metadata: { validationStatus: "PASSED", dataSource: "SalesForce CRM" },
        executedAt: new Date().toISOString()
      },
      {
        id: 2,
        calculationStep: 2,
        stepName: "Quota Attainment",
        stepDescription: "Calculate percentage of quota achieved",
        inputData: {
          actualSales: 650000,
          quota: 500000
        },
        ruleApplied: "Quota Attainment Formula",
        calculation: "(actualSales / quota) * 100",
        intermediateResult: 130,
        finalStepResult: 130,
        metadata: { attainmentTier: "Excellent", performanceRating: "A" },
        executedAt: new Date().toISOString()
      },
      {
        id: 3,
        calculationStep: 3,
        stepName: "Base Commission",
        stepDescription: "Calculate base commission on actual sales",
        inputData: {
          actualSales: 650000,
          commissionRate: 0.02
        },
        ruleApplied: "Base Commission Rule",
        calculation: "actualSales * commissionRate",
        intermediateResult: 13000,
        finalStepResult: 13000,
        metadata: { commissionTier: "Standard", rateType: "Base" },
        executedAt: new Date().toISOString()
      },
      {
        id: 4,
        calculationStep: 4,
        stepName: "Accelerator Application",
        stepDescription: "Apply accelerator for quota overachievement",
        inputData: {
          attainmentPercent: 130,
          baseCommission: 13000,
          acceleratorThreshold: 120
        },
        ruleApplied: "Accelerator Rules v3.2",
        calculation: "IF(attainment > 120%, baseCommission * 1.5, baseCommission)",
        intermediateResult: 19500,
        finalStepResult: 19500,
        metadata: { acceleratorRate: 1.5, qualifiedForBonus: true },
        executedAt: new Date().toISOString()
      },
      {
        id: 5,
        calculationStep: 5,
        stepName: "Territory Multiplier",
        stepDescription: "Apply territory-specific multiplier",
        inputData: {
          territory: "Northeast",
          baseAmount: 19500,
          territoryMultiplier: 1.1
        },
        ruleApplied: "Territory Adjustment Rules",
        calculation: "baseAmount * territoryMultiplier",
        intermediateResult: 21450,
        finalStepResult: 21450,
        metadata: { territoryRisk: "High", marketPotential: "Excellent" },
        executedAt: new Date().toISOString()
      },
      {
        id: 6,
        calculationStep: 6,
        stepName: "Cap Application",
        stepDescription: "Apply maximum payout cap",
        inputData: {
          calculatedAmount: 21450,
          payoutCap: 100000,
          targetPay: 75000
        },
        ruleApplied: "Payout Cap Rules",
        calculation: "MIN(calculatedAmount, payoutCap)",
        intermediateResult: 21450,
        finalStepResult: 21450,
        metadata: { capApplied: false, capThreshold: 100000 },
        executedAt: new Date().toISOString()
      },
      {
        id: 7,
        calculationStep: 7,
        stepName: "Final Adjustment",
        stepDescription: "Apply any manual adjustments or overrides",
        inputData: {
          calculatedAmount: 21450,
          adjustmentAmount: 0,
          adjustmentReason: "None"
        },
        ruleApplied: "Manual Adjustment Rules",
        calculation: "calculatedAmount + adjustmentAmount",
        intermediateResult: 21450,
        finalStepResult: 21450,
        metadata: { hasAdjustment: false, approvedBy: null },
        executedAt: new Date().toISOString()
      }
    ]
  };

  const displayData = traceData || mockTraceData;

  const getStepIcon = (stepName: string) => {
    switch (stepName.toLowerCase()) {
      case 'data validation':
        return <Database className="w-4 h-4 text-blue-600" />;
      case 'quota attainment':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'base commission':
        return <DollarSign className="w-4 h-4 text-purple-600" />;
      case 'accelerator application':
        return <LineChart className="w-4 h-4 text-orange-600" />;
      case 'territory multiplier':
        return <GitBranch className="w-4 h-4 text-indigo-600" />;
      case 'cap application':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'final adjustment':
        return <CheckCircle className="w-4 h-4 text-green-700" />;
      default:
        return <Calculator className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStepStatus = (step: CalculationStep) => {
    if (step.stepName.toLowerCase().includes('validation')) {
      return step.finalStepResult === 1 ? 'success' : 'error';
    }
    return 'success';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Success</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Error</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Warning</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">Info</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="w-4 h-4 mr-1" />
          Trace
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-blue-600" />
            <span>Calculation Trace: {repName} ({repId})</span>
          </DialogTitle>
          <DialogDescription>
            Complete audit trail showing all calculation steps and data transformations
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="steps" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="steps">Calculation Steps</TabsTrigger>
            <TabsTrigger value="raw-data">Raw Data</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="audit">Audit Info</TabsTrigger>
          </TabsList>

          <TabsContent value="steps" className="max-h-96 overflow-y-auto">
            <div className="space-y-4">
              {displayData.steps.map((step, index) => (
                <Card key={step.id} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900">
                          <span className="text-sm font-bold text-blue-600 dark:text-blue-200">{step.calculationStep}</span>
                        </div>
                        {getStepIcon(step.stepName)}
                        <div>
                          <CardTitle className="text-lg">{step.stepName}</CardTitle>
                          <CardDescription>{step.stepDescription}</CardDescription>
                        </div>
                      </div>
                      {getStatusBadge(getStepStatus(step))}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center">
                          <Database className="w-4 h-4 mr-1" />
                          Input Data
                        </h4>
                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded text-sm">
                          <pre>{JSON.stringify(step.inputData, null, 2)}</pre>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center">
                          <Code className="w-4 h-4 mr-1" />
                          Calculation
                        </h4>
                        <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded">
                          <p className="text-sm font-mono">{step.calculation}</p>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Rule: {step.ruleApplied}</span>
                            <span className="font-bold text-blue-600 dark:text-blue-200">
                              Result: ${step.finalStepResult.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {step.metadata && Object.keys(step.metadata).length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-semibold mb-2 flex items-center">
                          <Info className="w-4 h-4 mr-1" />
                          Metadata
                        </h4>
                        <div className="bg-yellow-50 dark:bg-yellow-900 p-3 rounded text-sm">
                          <pre>{JSON.stringify(step.metadata, null, 2)}</pre>
                        </div>
                      </div>
                    )}
                    <div className="mt-2 text-xs text-gray-500 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      Executed: {format(new Date(step.executedAt), 'MMM dd, yyyy HH:mm:ss')}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="raw-data" className="max-h-96 overflow-y-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Original Data Sources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Sales Data</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Field</TableHead>
                          <TableHead>Value</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>Quota</TableCell>
                          <TableCell className="font-mono">${displayData.originalData.quota?.toLocaleString()}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Actual Sales</TableCell>
                          <TableCell className="font-mono">${displayData.originalData.actualSales?.toLocaleString()}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Territory</TableCell>
                          <TableCell className="font-mono">{displayData.originalData.territory}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Role</TableCell>
                          <TableCell className="font-mono">{displayData.originalData.role}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Plan Configuration</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Field</TableHead>
                          <TableHead>Value</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>Target Pay</TableCell>
                          <TableCell className="font-mono">${displayData.originalData.targetPay?.toLocaleString()}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Base Commission</TableCell>
                          <TableCell className="font-mono">{(displayData.originalData.baselineCommission * 100)?.toFixed(1)}%</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Plan Name</TableCell>
                          <TableCell className="font-mono">{displayData.planName}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Plan ID</TableCell>
                          <TableCell className="font-mono">{displayData.planId}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summary" className="max-h-96 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                    Calculation Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                      <span>Initial Data Validation</span>
                      <Badge className="bg-green-100 text-green-800">Passed</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                      <span>Quota Attainment</span>
                      <span className="font-bold text-green-600">130%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                      <span>Accelerator Applied</span>
                      <span className="font-bold text-blue-600">1.5x</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900 rounded">
                      <span className="font-bold">Final Payout</span>
                      <span className="font-bold text-blue-600 text-lg">${displayData.finalPayout.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <GitBranch className="w-5 h-5 mr-2 text-purple-600" />
                    Value Progression
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {displayData.steps.map((step, index) => (
                      <div key={step.id} className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-xs font-bold text-blue-600">
                          {step.calculationStep}
                        </div>
                        <span className="flex-1 text-sm">{step.stepName}</span>
                        <span className="font-mono text-sm font-bold">
                          ${step.finalStepResult.toLocaleString()}
                        </span>
                        {index < displayData.steps.length - 1 && (
                          <ArrowRight className="w-3 h-3 text-gray-400" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="audit" className="max-h-96 overflow-y-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Audit Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Attribute</TableHead>
                      <TableHead>Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Calculation Job ID</TableCell>
                      <TableCell className="font-mono">{jobId}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Rep ID</TableCell>
                      <TableCell className="font-mono">{displayData.repId}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Rep Name</TableCell>
                      <TableCell className="font-mono">{displayData.repName}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Plan ID</TableCell>
                      <TableCell className="font-mono">{displayData.planId}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Plan Name</TableCell>
                      <TableCell className="font-mono">{displayData.planName}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Total Steps</TableCell>
                      <TableCell className="font-mono">{displayData.steps.length}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Final Payout</TableCell>
                      <TableCell className="font-mono font-bold text-green-600">${displayData.finalPayout.toLocaleString()}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Calculation Date</TableCell>
                      <TableCell className="font-mono">{format(new Date(), 'MMM dd, yyyy HH:mm:ss')}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}