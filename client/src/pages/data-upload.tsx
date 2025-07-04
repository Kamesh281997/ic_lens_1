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
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const fileTypeOptions: Array<{
  id: "hierarchy" | "rep_roster" | "rep_territory" | "sales_data" | "target_pay";
  label: string;
  icon: any;
  description: string;
}> = [
  { 
    id: "hierarchy", 
    label: "Hierarchy", 
    icon: FileText, 
    description: "Organizational structure and reporting relationships" 
  },
  { 
    id: "rep_roster", 
    label: "Rep Roster", 
    icon: Users, 
    description: "Sales representative information and details" 
  },
  { 
    id: "rep_territory", 
    label: "Rep Territory Assignment", 
    icon: MapPin, 
    description: "Territory assignments for sales representatives" 
  },
  { 
    id: "sales_data", 
    label: "Sales Data", 
    icon: BarChart3, 
    description: "Sales performance and transaction data" 
  },
  { 
    id: "target_pay", 
    label: "Target Pay", 
    icon: DollarSign, 
    description: "Target compensation and quota information" 
  },
];

export default function DataUpload() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const form = useForm<FileUploadData>({
    resolver: zodResolver(fileUploadSchema),
    defaultValues: {
      fileTypes: [],
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: { fileTypes: string[]; files: File[] }) => {
      const formData = new FormData();
      data.files.forEach((file, index) => {
        formData.append(`file_${index}`, file);
        formData.append(`fileType_${index}`, data.fileTypes[index]);
      });
      
      const response = await apiRequest("POST", "/api/upload", formData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Upload Successful",
        description: `${data.uploadedFiles} files uploaded successfully`,
      });
      navigate("/data-validation");
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload files",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
  };

  const onSubmit = (data: FileUploadData) => {
    if (selectedFiles.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select files to upload",
        variant: "destructive",
      });
      return;
    }

    if (selectedFiles.length !== data.fileTypes.length) {
      toast({
        title: "File Count Mismatch",
        description: "Number of files must match selected file types",
        variant: "destructive",
      });
      return;
    }

    uploadMutation.mutate({
      fileTypes: data.fileTypes,
      files: selectedFiles,
    });
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
                  {/* File Type Selection */}
                  <FormField
                    control={form.control}
                    name="fileTypes"
                    render={() => (
                      <FormItem>
                        <FormLabel className="text-lg font-semibold text-gray-900 dark:text-white">
                          Select File Types
                        </FormLabel>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {fileTypeOptions.map((option) => {
                            const Icon = option.icon;
                            return (
                              <FormField
                                key={option.id}
                                control={form.control}
                                name="fileTypes"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        <Checkbox
                                          checked={field.value?.includes(option.id)}
                                          onCheckedChange={(checked) => {
                                            const currentValues = field.value || [];
                                            const updatedValue = checked
                                              ? [...currentValues, option.id]
                                              : currentValues.filter((value) => value !== option.id);
                                            field.onChange(updatedValue);
                                          }}
                                        />
                                        <Icon className="h-6 w-6 text-blue-600" />
                                        <div className="flex-1">
                                          <Label className="text-sm font-medium text-gray-900 dark:text-white">
                                            {option.label}
                                          </Label>
                                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {option.description}
                                          </p>
                                        </div>
                                      </div>
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            );
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* File Upload */}
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold text-gray-900 dark:text-white">
                      Choose Files
                    </Label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                        Drag and drop your files here, or click to browse
                      </p>
                      <input
                        type="file"
                        multiple
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-upload"
                      />
                      <Label
                        htmlFor="file-upload"
                        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                      >
                        <Upload className="h-5 w-5 mr-2" />
                        Browse Files
                      </Label>
                    </div>
                    
                    {/* Selected Files Display */}
                    {selectedFiles.length > 0 && (
                      <div className="mt-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                          Selected Files ({selectedFiles.length})
                        </h3>
                        <div className="space-y-2">
                          {selectedFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <FileText className="h-5 w-5 text-blue-600" />
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {file.name}
                                  </p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                              </div>
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-center pt-6">
                    <Button
                      type="submit"
                      size="lg"
                      className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
                      disabled={uploadMutation.isPending}
                    >
                      {uploadMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-5 w-5 mr-2" />
                          Upload Files
                        </>
                      )}
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