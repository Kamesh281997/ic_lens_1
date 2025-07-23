import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Plus, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  User, 
  DollarSign, 
  Calendar,
  Eye,
  Download,
  Filter,
  Search,
  ArrowUpDown,
  MoreHorizontal,
  Edit,
  Trash2,
  MessageSquare
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

// Types
interface PayoutAdjustment {
  id: number;
  repId: string;
  repName: string;
  originalPayout: number;
  adjustmentAmount: number;
  finalPayout: number;
  adjustmentType: string;
  adjustmentReason: string;
  businessJustification: string;
  submittedBy: number;
  approvedBy?: number;
  status: 'pending' | 'approved' | 'rejected' | 'applied';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  submittedAt: string;
  reviewedAt?: string;
  appliedAt?: string;
  comments?: string;
  supportingDocuments?: any[];
}

// Form Schema
const adjustmentFormSchema = z.object({
  repId: z.string().min(1, "Rep ID is required"),
  repName: z.string().min(1, "Rep name is required"),
  originalPayout: z.string().min(1, "Original payout is required"),
  adjustmentAmount: z.string().min(1, "Adjustment amount is required"),
  adjustmentType: z.enum(["bonus", "correction", "penalty", "override"], {
    required_error: "Please select an adjustment type"
  }),
  adjustmentReason: z.string().min(10, "Reason must be at least 10 characters"),
  businessJustification: z.string().min(20, "Business justification must be at least 20 characters"),
  priority: z.enum(["low", "normal", "high", "urgent"], {
    required_error: "Please select a priority"
  })
});

type AdjustmentFormData = z.infer<typeof adjustmentFormSchema>;

export default function PayoutAdjustments() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedAdjustment, setSelectedAdjustment] = useState<PayoutAdjustment | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Form
  const form = useForm<AdjustmentFormData>({
    resolver: zodResolver(adjustmentFormSchema),
    defaultValues: {
      priority: "normal"
    }
  });

  // Fetch adjustments
  const { data: adjustments = [], isLoading } = useQuery<PayoutAdjustment[]>({
    queryKey: ["/api/adjustments"],
    enabled: !!user
  });

  // Create adjustment mutation
  const createAdjustmentMutation = useMutation({
    mutationFn: async (data: AdjustmentFormData) => {
      const originalPayout = parseFloat(data.originalPayout);
      const adjustmentAmount = parseFloat(data.adjustmentAmount);
      const finalPayout = originalPayout + adjustmentAmount;

      const payload = {
        ...data,
        originalPayout,
        adjustmentAmount,
        finalPayout
      };

      const response = await fetch("/api/adjustments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error("Failed to create adjustment");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/adjustments"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Adjustment submitted successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit adjustment",
        variant: "destructive"
      });
    }
  });

  // Approve/Reject adjustment mutation
  const updateAdjustmentMutation = useMutation({
    mutationFn: async ({ id, status, comments }: { id: number; status: string; comments?: string }) => {
      const response = await fetch(`/api/adjustments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, comments })
      });
      
      if (!response.ok) {
        throw new Error("Failed to update adjustment");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/adjustments"] });
      toast({
        title: "Success",
        description: "Adjustment updated successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update adjustment",
        variant: "destructive"
      });
    }
  });

  // Filter adjustments
  const filteredAdjustments = adjustments.filter((adjustment: PayoutAdjustment) => {
    const matchesStatus = filterStatus === "all" || adjustment.status === filterStatus;
    const matchesPriority = filterPriority === "all" || adjustment.priority === filterPriority;
    const matchesSearch = searchTerm === "" || 
      adjustment.repName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      adjustment.repId.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesPriority && matchesSearch;
  });

  // Status badge color
  const getStatusBadge = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      applied: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  // Priority badge color
  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
      normal: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      urgent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    };
    return colors[priority as keyof typeof colors] || colors.normal;
  };

  const onSubmit = (data: AdjustmentFormData) => {
    createAdjustmentMutation.mutate(data);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Please log in to access payout adjustments.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Payout Adjustments & Exceptions
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Manage manual payout adjustments with approval workflow
              </p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-red-600 hover:bg-red-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Submit Adjustment
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Submit Payout Adjustment</DialogTitle>
                  <DialogDescription>
                    Create a formal adjustment request with proper justification
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="repId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rep ID</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter rep ID" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="repName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rep Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter rep name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="originalPayout"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Original Payout ($)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" placeholder="0.00" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="adjustmentAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Adjustment Amount ($)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" placeholder="0.00" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="adjustmentType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Adjustment Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="bonus">Bonus</SelectItem>
                                <SelectItem value="correction">Correction</SelectItem>
                                <SelectItem value="penalty">Penalty</SelectItem>
                                <SelectItem value="override">Override</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Priority</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="normal">Normal</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="adjustmentReason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Adjustment Reason</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Provide a clear reason for this adjustment..."
                              className="min-h-20"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="businessJustification"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Justification</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Provide detailed business justification and supporting evidence..."
                              className="min-h-24"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCreateDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={createAdjustmentMutation.isPending}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {createAdjustmentMutation.isPending ? "Submitting..." : "Submit Adjustment"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-gray-500" />
                <Input
                  placeholder="Search by rep name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Adjustments List */}
        <div className="grid gap-4">
          {isLoading ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">Loading adjustments...</p>
              </CardContent>
            </Card>
          ) : filteredAdjustments.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No adjustments found</p>
                  <p className="text-muted-foreground">
                    {searchTerm || filterStatus !== "all" || filterPriority !== "all" 
                      ? "Try adjusting your filters" 
                      : "Submit your first payout adjustment"
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredAdjustments.map((adjustment: PayoutAdjustment) => (
              <Card key={adjustment.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="font-semibold">{adjustment.repName}</span>
                          <span className="text-sm text-gray-500">({adjustment.repId})</span>
                        </div>
                        <Badge className={getStatusBadge(adjustment.status)}>
                          {adjustment.status.charAt(0).toUpperCase() + adjustment.status.slice(1)}
                        </Badge>
                        <Badge className={getPriorityBadge(adjustment.priority)}>
                          {adjustment.priority.charAt(0).toUpperCase() + adjustment.priority.slice(1)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <div>
                            <p className="text-sm text-gray-500">Original Payout</p>
                            <p className="font-semibold">${adjustment.originalPayout.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <ArrowUpDown className="w-4 h-4 text-blue-600" />
                          <div>
                            <p className="text-sm text-gray-500">Adjustment</p>
                            <p className={`font-semibold ${adjustment.adjustmentAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {adjustment.adjustmentAmount >= 0 ? '+' : ''}${adjustment.adjustmentAmount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4 text-purple-600" />
                          <div>
                            <p className="text-sm text-gray-500">Final Payout</p>
                            <p className="font-semibold">${adjustment.finalPayout.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm text-gray-500 mb-1">Type: <span className="font-medium capitalize">{adjustment.adjustmentType}</span></p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{adjustment.adjustmentReason}</p>
                      </div>

                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>Submitted: {format(new Date(adjustment.submittedAt), 'MMM dd, yyyy')}</span>
                        </div>
                        {adjustment.reviewedAt && (
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>Reviewed: {format(new Date(adjustment.reviewedAt), 'MMM dd, yyyy')}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      {adjustment.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-200 hover:bg-green-50"
                            onClick={() => updateAdjustmentMutation.mutate({
                              id: adjustment.id,
                              status: 'approved'
                            })}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => updateAdjustmentMutation.mutate({
                              id: adjustment.id,
                              status: 'rejected'
                            })}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      {adjustment.status === 'approved' && (
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => updateAdjustmentMutation.mutate({
                            id: adjustment.id,
                            status: 'applied'
                          })}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Apply
                        </Button>
                      )}
                      <Button size="sm" variant="ghost">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}