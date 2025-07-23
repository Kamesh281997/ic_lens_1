import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { 
  AlertTriangle, 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  MapPin, 
  User, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Lightbulb,
  BarChart3,
  Activity,
  Eye,
  MessageSquare,
  Zap,
  AlertCircle
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface AnomalyDetection {
  id: number;
  repId: string;
  repName: string;
  anomalyType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidenceScore: number;
  description: string;
  rootCauseAnalysis: string;
  suggestedActions: string[];
  affectedPayout: number;
  expectedPayout: number;
  variance: number;
  variancePercent: number;
  detectedAt: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'false_positive';
  reviewerNotes?: string;
  reviewedAt?: string;
  metadata: any;
}

interface AnomalyDetectionPanelProps {
  payoutResults: any[];
}

export function AnomalyDetectionPanel({ payoutResults }: AnomalyDetectionPanelProps) {
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyDetection | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const queryClient = useQueryClient();

  // Fetch anomalies
  const { data: anomalies = [], isLoading } = useQuery<AnomalyDetection[]>({
    queryKey: ["/api/anomalies/1"], // Using job ID 1 for demo
    enabled: !!payoutResults?.length
  });

  // Run anomaly detection
  const runDetectionMutation = useMutation({
    mutationFn: async () => {
      setIsAnalyzing(true);
      const response = await fetch("/api/anomalies/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payoutData: payoutResults })
      });
      
      if (!response.ok) {
        throw new Error("Failed to analyze anomalies");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/anomalies/1"] });
      setIsAnalyzing(false);
      toast({
        title: "Analysis Complete",
        description: "AI anomaly detection has finished analyzing payout data"
      });
    },
    onError: () => {
      setIsAnalyzing(false);
      toast({
        title: "Analysis Failed",
        description: "Failed to run anomaly detection",
        variant: "destructive"
      });
    }
  });

  // Update anomaly status
  const updateAnomalyMutation = useMutation({
    mutationFn: async ({ id, status, reviewerNotes }: { id: number; status: string; reviewerNotes?: string }) => {
      const response = await fetch(`/api/anomalies/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reviewerNotes })
      });
      
      if (!response.ok) {
        throw new Error("Failed to update anomaly");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/anomalies/1"] });
      toast({
        title: "Updated",
        description: "Anomaly status updated successfully"
      });
    }
  });

  const getSeverityBadge = (severity: string) => {
    const colors = {
      low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    };
    return colors[severity as keyof typeof colors] || colors.medium;
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      reviewed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      resolved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      false_positive: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getAnomalyIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'payout_spike':
        return <TrendingUp className="w-4 h-4 text-red-600" />;
      case 'payout_drop':
        return <TrendingDown className="w-4 h-4 text-blue-600" />;
      case 'quota_mismatch':
        return <Target className="w-4 h-4 text-orange-600" />;
      case 'territory_outlier':
        return <MapPin className="w-4 h-4 text-purple-600" />;
      case 'calculation_error':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const criticalAnomalies = anomalies.filter(a => a.severity === 'critical' && a.status === 'pending');
  const highAnomalies = anomalies.filter(a => a.severity === 'high' && a.status === 'pending');
  const totalPending = anomalies.filter(a => a.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* AI Anomaly Detection Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Brain className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-xl text-purple-900 dark:text-purple-100">
                  AI-Powered Anomaly Detection
                </CardTitle>
                <CardDescription className="text-purple-700 dark:text-purple-300">
                  Intelligent analysis of payout calculations with root cause identification
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={() => runDetectionMutation.mutate()}
              disabled={isAnalyzing || !payoutResults?.length}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isAnalyzing ? (
                <>
                  <Activity className="w-4 h-4 mr-2 animate-pulse" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Run AI Analysis
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-600">{criticalAnomalies.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Critical Issues</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-orange-200 dark:border-orange-800">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-orange-600">{highAnomalies.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">High Priority</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 dark:border-yellow-800">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold text-yellow-600">{totalPending}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {anomalies.length > 0 ? Math.round(anomalies.reduce((acc, a) => acc + a.confidenceScore, 0) / anomalies.length) : 0}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Confidence</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Anomalies List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="w-5 h-5 mr-2" />
            Detected Anomalies
          </CardTitle>
          <CardDescription>
            AI-identified unusual patterns and potential issues in payout calculations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <Activity className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-pulse" />
              <p className="text-gray-600 dark:text-gray-400">Loading anomaly analysis...</p>
            </div>
          ) : anomalies.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <p className="text-xl font-semibold text-green-600 mb-2">No Anomalies Detected</p>
              <p className="text-gray-600 dark:text-gray-400">
                All payout calculations appear normal. Run AI analysis to check for new issues.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {anomalies.map((anomaly) => (
                <Card key={anomaly.id} className="border-l-4 border-l-red-500 hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          {getAnomalyIcon(anomaly.anomalyType)}
                          <div>
                            <h4 className="font-semibold text-lg">{anomaly.repName} ({anomaly.repId})</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                              {anomaly.anomalyType.replace('_', ' ')}
                            </p>
                          </div>
                          <Badge className={getSeverityBadge(anomaly.severity)}>
                            {anomaly.severity.toUpperCase()}
                          </Badge>
                          <Badge className={getStatusBadge(anomaly.status)}>
                            {anomaly.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>

                        <p className="text-gray-700 dark:text-gray-300 mb-4">{anomaly.description}</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <div>
                              <p className="text-sm text-gray-500">Affected Payout</p>
                              <p className="font-semibold">${anomaly.affectedPayout.toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Target className="w-4 h-4 text-blue-600" />
                            <div>
                              <p className="text-sm text-gray-500">Expected Payout</p>
                              <p className="font-semibold">${anomaly.expectedPayout.toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="w-4 h-4 text-orange-600" />
                            <div>
                              <p className="text-sm text-gray-500">Variance</p>
                              <p className={`font-semibold ${anomaly.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {anomaly.variance >= 0 ? '+' : ''}${anomaly.variance.toLocaleString()} ({anomaly.variancePercent.toFixed(1)}%)
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Confidence: {anomaly.confidenceScore}%</span>
                          <span>Detected: {format(new Date(anomaly.detectedAt), 'MMM dd, yyyy HH:mm')}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedAnomaly(anomaly)}
                            >
                              <Lightbulb className="w-4 h-4 mr-1" />
                              Root Cause
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
                            <DialogHeader>
                              <DialogTitle className="flex items-center space-x-2">
                                <Brain className="w-5 h-5 text-purple-600" />
                                <span>AI Analysis: {anomaly.repName}</span>
                              </DialogTitle>
                              <DialogDescription>
                                Detailed root cause analysis and suggested remediation actions
                              </DialogDescription>
                            </DialogHeader>

                            <Tabs defaultValue="analysis" className="w-full">
                              <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="analysis">Root Cause Analysis</TabsTrigger>
                                <TabsTrigger value="actions">Suggested Actions</TabsTrigger>
                                <TabsTrigger value="data">Supporting Data</TabsTrigger>
                              </TabsList>

                              <TabsContent value="analysis" className="max-h-96 overflow-y-auto">
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">AI Root Cause Analysis</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="prose dark:prose-invert max-w-none">
                                      <p className="whitespace-pre-wrap">{anomaly.rootCauseAnalysis}</p>
                                    </div>
                                  </CardContent>
                                </Card>
                              </TabsContent>

                              <TabsContent value="actions" className="max-h-96 overflow-y-auto">
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">Recommended Actions</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="space-y-3">
                                      {anomaly.suggestedActions.map((action, index) => (
                                        <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 text-sm font-bold">
                                            {index + 1}
                                          </div>
                                          <p className="text-blue-900 dark:text-blue-100">{action}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </CardContent>
                                </Card>
                              </TabsContent>

                              <TabsContent value="data" className="max-h-96 overflow-y-auto">
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">Supporting Data</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>Metric</TableHead>
                                          <TableHead>Value</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        <TableRow>
                                          <TableCell>Anomaly Type</TableCell>
                                          <TableCell className="capitalize">{anomaly.anomalyType.replace('_', ' ')}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                          <TableCell>Confidence Score</TableCell>
                                          <TableCell>{anomaly.confidenceScore}%</TableCell>
                                        </TableRow>
                                        <TableRow>
                                          <TableCell>Affected Payout</TableCell>
                                          <TableCell>${anomaly.affectedPayout.toLocaleString()}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                          <TableCell>Expected Payout</TableCell>
                                          <TableCell>${anomaly.expectedPayout.toLocaleString()}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                          <TableCell>Variance Amount</TableCell>
                                          <TableCell className={anomaly.variance >= 0 ? 'text-green-600' : 'text-red-600'}>
                                            {anomaly.variance >= 0 ? '+' : ''}${anomaly.variance.toLocaleString()}
                                          </TableCell>
                                        </TableRow>
                                        <TableRow>
                                          <TableCell>Variance Percentage</TableCell>
                                          <TableCell className={anomaly.variance >= 0 ? 'text-green-600' : 'text-red-600'}>
                                            {anomaly.variancePercent.toFixed(2)}%
                                          </TableCell>
                                        </TableRow>
                                      </TableBody>
                                    </Table>
                                  </CardContent>
                                </Card>
                              </TabsContent>
                            </Tabs>

                            <div className="flex justify-end space-x-2 mt-4">
                              <Button
                                variant="outline"
                                onClick={() => updateAnomalyMutation.mutate({
                                  id: anomaly.id,
                                  status: 'false_positive'
                                })}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                False Positive
                              </Button>
                              <Button
                                onClick={() => updateAnomalyMutation.mutate({
                                  id: anomaly.id,
                                  status: 'reviewed'
                                })}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Mark Reviewed
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {anomaly.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-200 hover:bg-green-50"
                              onClick={() => updateAnomalyMutation.mutate({
                                id: anomaly.id,
                                status: 'resolved'
                              })}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Resolve
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}