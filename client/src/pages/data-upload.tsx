import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { Link, useLocation } from "wouter";
import { 
  Upload, 
  FileText, 
  Users, 
  MapPin, 
  BarChart3, 
  DollarSign, 
  ArrowLeft, 
  CheckCircle, 
  AlertTriangle,
  Database,
  Cloud,
  Activity,
  TrendingUp,
  Target,
  HelpCircle,
  Info,
  Shield,
  Zap
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { fileUploadSchema, type FileUploadData } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const fileTypeOptions: Array<{
  id: "hierarchy" | "rep_roster" | "rep_territory" | "sales_data" | "target_pay" | "quota_data";
  label: string;
  icon: any;
  description: string;
  mandatory: boolean;
}> = [
  { 
    id: "hierarchy", 
    label: "Hierarchy", 
    icon: FileText, 
    description: "Organizational structure and reporting relationships",
    mandatory: false
  },
  { 
    id: "rep_roster", 
    label: "Rep Roster", 
    icon: Users, 
    description: "Sales representative information and details",
    mandatory: true
  },
  { 
    id: "rep_territory", 
    label: "Rep Territory Assignment", 
    icon: MapPin, 
    description: "Territory assignments for sales representatives",
    mandatory: true
  },
  { 
    id: "sales_data", 
    label: "Sales Data", 
    icon: BarChart3, 
    description: "Sales performance and transaction data",
    mandatory: true
  },
  { 
    id: "target_pay", 
    label: "Target Pay", 
    icon: DollarSign, 
    description: "Target compensation and quota information",
    mandatory: false
  },
  { 
    id: "quota_data", 
    label: "Quota Data", 
    icon: BarChart3, 
    description: "Quota targets and performance metrics",
    mandatory: true
  },
];

export default function DataUpload() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File | null>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Set<string>>(new Set());
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  
  // Get IC plan type from localStorage to determine which paycurve option to disable
  const [icPlanType, setIcPlanType] = useState<string | null>(
    localStorage.getItem('icPlanType') || null
  );

  const form = useForm<FileUploadData>({
    resolver: zodResolver(fileUploadSchema),
    defaultValues: {
      fileTypes: [],
      paycurve: icPlanType as "Goal Attainment" | "Goal Attainment with Relative Rank" | undefined,
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: { fileType: string; file: File }) => {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('fileType', data.fileType);
      
      const response = await apiRequest("POST", "/api/upload", formData);
      return response.json();
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Upload Successful",
        description: `${variables.fileType} file uploaded successfully`,
      });
      setUploadedFiles(prev => {
        const newSet = new Set(prev);
        newSet.add(variables.fileType);
        return newSet;
      });
    },
    onError: (error: Error, variables) => {
      toast({
        title: "Upload Failed",
        description: `Failed to upload ${variables.fileType}: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (fileType: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFiles(prev => ({
        ...prev,
        [fileType]: file
      }));
    }
  };

  const handleUpload = (fileType: string) => {
    const file = selectedFiles[fileType];
    if (file) {
      uploadMutation.mutate({ fileType, file });
    }
  };

  const onSubmit = (data: FileUploadData) => {
    // Check if all mandatory files are uploaded
    const mandatoryOptions = fileTypeOptions.filter(opt => opt.mandatory);
    const missingMandatory = mandatoryOptions.filter(opt => !uploadedFiles.has(opt.id));
    
    if (missingMandatory.length > 0) {
      toast({
        title: "Missing Required Files",
        description: `Please upload: ${missingMandatory.map(opt => opt.label).join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    navigate("/data-validation");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center">Authentication Required</CardTitle>
            <CardDescription className="text-center">
              Please log in to access the data upload feature
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
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
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
          <Link href="/ic-processing">
            <Button variant="ghost" className="text-gray-600 dark:text-gray-300">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to IC Processing
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-6 lg:px-12 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section with Images */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Upload Your Dataset for Processing
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                Securely submit your sales data and configuration files to begin comprehensive IC analysis and processing
              </p>
              
              {/* Progress indicator */}
              <div className="flex items-center space-x-4 mb-8">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">IC Processing</span>
                </div>
                <div className="w-8 h-0.5 bg-blue-600"></div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-white">2</span>
                  </div>
                  <span className="text-sm font-medium text-blue-600">Data Upload</span>
                </div>
                <div className="w-8 h-0.5 bg-gray-300"></div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-600">3</span>
                  </div>
                  <span className="text-sm font-medium text-gray-600">Validation</span>
                </div>
              </div>
            </div>
            
            {/* Hero Image */}
            <div className="relative">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                    <Cloud className="h-12 w-12 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-center mb-4">Secure Cloud Processing</h3>
                <p className="text-center text-blue-100">
                  Your data is processed with enterprise-grade security and encryption
                </p>
              </div>
            </div>
          </div>

          {/* Upload Form with full width layout */}
          <div className="mb-12">
            <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-xl border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-900 dark:text-white flex items-center">
                  <Upload className="h-6 w-6 mr-3 text-blue-600" />
                  Upload Files
                </CardTitle>
                <CardDescription>
                  Upload your dataset files to begin comprehensive IC processing and analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {/* Upload Guidelines Banner */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Shield className="h-5 w-5 text-green-500" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">Secure Upload</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Activity className="h-5 w-5 text-blue-500" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">Real-time Processing</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Zap className="h-5 w-5 text-yellow-500" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">Fast Analysis</span>
                        </div>
                        <div className="flex items-center space-x-2 ml-auto">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Supported:</span>
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs">.CSV</span>
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs">.XLSX</span>
                          <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs">.XLS</span>
                        </div>
                      </div>
                    </div>

                    {/* Upload Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {fileTypeOptions.map((option) => {
                        const Icon = option.icon;
                        const isUploaded = uploadedFiles.has(option.id);
                        const selectedFile = selectedFiles[option.id];
                        const isRequired = option.mandatory;
                        
                        return (
                          <Card 
                            key={option.id} 
                            className={`relative transition-all hover:shadow-lg ${
                              isRequired 
                                ? 'border-2 border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10 hover:border-red-300 dark:hover:border-red-700' 
                                : 'border-2 border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                          >
                            {isRequired && (
                              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">*</span>
                              </div>
                            )}
                            {isUploaded && (
                              <div className="absolute -top-2 -left-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-4 w-4 text-white" />
                              </div>
                            )}
                            
                            <CardHeader className="pb-3">
                              <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                  isRequired ? 'bg-red-100 dark:bg-red-900/30' : 'bg-gray-100 dark:bg-gray-800'
                                }`}>
                                  <Icon className={`h-5 w-5 ${isRequired ? 'text-red-600' : 'text-gray-500'}`} />
                                </div>
                                <div className="flex-1">
                                  <CardTitle className={`text-lg ${
                                    isRequired ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                                  }`}>
                                    {option.label}
                                  </CardTitle>
                                  <p className={`text-sm ${
                                    isRequired ? 'text-gray-600 dark:text-gray-400' : 'text-gray-500 dark:text-gray-400'
                                  } mt-1`}>
                                    {option.description}
                                  </p>
                                </div>
                              </div>
                            </CardHeader>
                            
                            <CardContent className="pt-0">
                              <div className="space-y-3">
                                <input
                                  type="file"
                                  accept=".csv,.xlsx,.xls"
                                  onChange={(e) => handleFileSelect(option.id, e)}
                                  className="hidden"
                                  id={`file-upload-${option.id}`}
                                />
                                
                                <Label
                                  htmlFor={`file-upload-${option.id}`}
                                  className={`inline-flex items-center justify-center w-full px-4 py-3 border-2 rounded-lg cursor-pointer transition-colors font-medium ${
                                    isRequired 
                                      ? 'border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20' 
                                      : 'border-gray-300 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                                  }`}
                                >
                                  <Upload className="h-4 w-4 mr-2" />
                                  {selectedFile ? 'Change File' : 'Choose File'}
                                </Label>
                                
                                {selectedFile && (
                                  <div className="space-y-2">
                                    <div className="text-sm text-gray-600 dark:text-gray-400 truncate bg-white dark:bg-gray-800 px-3 py-2 rounded border">
                                      {selectedFile.name}
                                    </div>
                                    <Button
                                      type="button"
                                      onClick={() => handleUpload(option.id)}
                                      disabled={uploadMutation.isPending || isUploaded}
                                      className={`w-full ${
                                        isRequired 
                                          ? 'bg-red-600 hover:bg-red-700' 
                                          : 'bg-gray-600 hover:bg-gray-700'
                                      }`}
                                      size="sm"
                                    >
                                      {uploadMutation.isPending ? 'Uploading...' : isUploaded ? 'Uploaded' : 'Upload'}
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>

                    {/* Paycurve Selection - Only show if IC plan type is available */}
                    {icPlanType && (
                      <Card className="border-2 border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10">
                        <CardHeader>
                          <CardTitle className="text-lg text-gray-900 dark:text-white flex items-center">
                            <Target className="h-5 w-5 mr-2 text-green-600" />
                            Paycurve Configuration
                          </CardTitle>
                          <CardDescription>
                            Based on your IC Plan selection
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                              <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                              <Label className="text-lg font-semibold text-gray-900 dark:text-white">
                                {icPlanType}
                              </Label>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {icPlanType === "Goal Attainment" 
                                  ? "Standard goal attainment paycurve configuration" 
                                  : "Performance-based ranking system with relative positioning"}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        className="flex-1 px-8 py-4 text-lg font-medium"
                        onClick={() => navigate("/")}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Home
                      </Button>
                      <Button
                        type="submit"
                        size="lg"
                        className="flex-1 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg"
                        disabled={uploadMutation.isPending}
                      >
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Proceed to Validation
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
          
          {/* Additional Visual Elements */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Database className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Data Security</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Enterprise-grade encryption and security protocols protect your sensitive data
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Real-time Processing</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Advanced algorithms process your data instantly for immediate insights
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Smart Analytics</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  AI-powered insights help optimize your incentive compensation plans
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}