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
  AlertTriangle 
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="flex items-center justify-between px-6 lg:px-12 py-6">
        <Link href="/">
          <div className="text-3xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
            ICLens
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
      <main className="px-6 lg:px-12 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Data Upload
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Upload your sales data and configuration files to begin IC processing
            </p>
          </div>

          {/* Upload Form */}
          <Card className="bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900 dark:text-white flex items-center">
                <Upload className="h-6 w-6 mr-3 text-blue-600" />
                Upload Files
              </CardTitle>
              <CardDescription>
                Select the file types you want to upload and choose the corresponding files
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  {/* Individual File Upload Sections */}
                  <div className="space-y-6">
                    <div className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      File Upload Options
                    </div>
                    {fileTypeOptions.map((option) => {
                      const Icon = option.icon;
                      const isUploaded = uploadedFiles.has(option.id);
                      const selectedFile = selectedFiles[option.id];
                      const isOptional = !option.mandatory;
                      
                      return (
                        <div 
                          key={option.id} 
                          className={`p-6 border rounded-lg transition-colors ${
                            isOptional 
                              ? 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 opacity-75' 
                              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <Icon className={`h-6 w-6 ${isOptional ? 'text-gray-400' : 'text-blue-600'}`} />
                              <div>
                                <Label className={`text-lg font-medium ${
                                  isOptional ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'
                                }`}>
                                  {option.label}
                                  {option.mandatory && <span className="text-red-500 ml-1">*</span>}
                                  {isOptional && <span className="text-sm text-gray-400 ml-2">(Optional)</span>}
                                </Label>
                                <p className={`text-sm ${
                                  isOptional ? 'text-gray-400' : 'text-gray-600 dark:text-gray-400'
                                } mt-1`}>
                                  {option.description}
                                </p>
                              </div>
                            </div>
                            {isUploaded && (
                              <CheckCircle className="h-6 w-6 text-green-500" />
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <input
                              type="file"
                              accept=".csv,.xlsx,.xls"
                              onChange={(e) => handleFileSelect(option.id, e)}
                              className="hidden"
                              id={`file-upload-${option.id}`}
                            />
                            <Label
                              htmlFor={`file-upload-${option.id}`}
                              className={`inline-flex items-center px-4 py-2 border rounded-lg cursor-pointer transition-colors ${
                                isOptional 
                                  ? 'border-gray-300 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700' 
                                  : 'border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                              }`}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              {selectedFile ? 'Change File' : 'Choose File'}
                            </Label>
                            
                            {selectedFile && (
                              <div className="flex-1 flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                  {selectedFile.name}
                                </span>
                                <Button
                                  type="button"
                                  onClick={() => handleUpload(option.id)}
                                  disabled={uploadMutation.isPending || isUploaded}
                                  className="ml-4"
                                  size="sm"
                                >
                                  {uploadMutation.isPending ? 'Uploading...' : isUploaded ? 'Uploaded' : 'Upload'}
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Paycurve Selection - Only show if IC plan type is available */}
                  {icPlanType && (
                    <div className="p-6 border rounded-lg bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
                      <div className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Paycurve Selection
                      </div>
                      <p className="text-sm text-blue-600 dark:text-blue-400 mb-4">
                        Based on your IC Plan Type: <span className="font-semibold">{icPlanType}</span>
                      </p>
                      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-blue-300 dark:border-blue-600">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{icPlanType}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {icPlanType === "Goal Attainment" 
                                ? "Standard goal attainment paycurve" 
                                : "Performance-based ranking system"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      className="flex-1 px-8 py-3"
                      onClick={() => navigate("/")}
                    >
                      Back to Home
                    </Button>
                    <Button
                      type="submit"
                      size="lg"
                      className="flex-1 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                      disabled={uploadMutation.isPending}
                    >
                      Proceed to Validation
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}