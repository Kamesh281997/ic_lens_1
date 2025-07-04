import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ThemeToggle } from "@/components/theme-toggle";
import { Link, useLocation } from "wouter";
import { 
  Settings, 
  Target, 
  TrendingUp, 
  ArrowLeft, 
  ArrowRight, 
  Users, 
  Package 
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { icPlanSelectionSchema, type IcPlanSelectionData } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function IcProcessing() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const form = useForm<IcPlanSelectionData>({
    resolver: zodResolver(icPlanSelectionSchema),
    defaultValues: {
      productName: "",
      teamName: "",
      planType: "Goal Attainment",
    },
  });

  const processingMutation = useMutation({
    mutationFn: async (data: IcPlanSelectionData) => {
      const response = await apiRequest("POST", "/api/ic-processing", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "IC Plan Selected",
        description: "Proceeding to data upload",
      });
      navigate("/data-upload");
    },
    onError: (error: Error) => {
      toast({
        title: "Processing Failed",
        description: error.message || "Failed to process IC plan selection",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: IcPlanSelectionData) => {
    processingMutation.mutate(data);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center">Authentication Required</CardTitle>
            <CardDescription className="text-center">
              Please log in to access IC processing
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
              IC Processing
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Configure your incentive compensation plan parameters
            </p>
          </div>

          {/* Processing Form */}
          <Card className="bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900 dark:text-white flex items-center">
                <Settings className="h-6 w-6 mr-3 text-blue-600" />
                Plan Configuration
              </CardTitle>
              <CardDescription>
                Select your product, team, and IC plan type to configure the processing parameters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  {/* Product and Team Configuration */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="productName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                            <Package className="h-5 w-5 mr-2 text-blue-600" />
                            Product Name
                          </FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger className="h-12 text-lg bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500">
                                <SelectValue placeholder="Select product name" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Prevnar-B">Prevnar-B</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="teamName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                            <Users className="h-5 w-5 mr-2 text-blue-600" />
                            Team Name
                          </FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger className="h-12 text-lg bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500">
                                <SelectValue placeholder="Select team name" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="VS">VS</SelectItem>
                                <SelectItem value="VIS">VIS</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* IC Plan Type Selection */}
                  <FormField
                    control={form.control}
                    name="planType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-semibold text-gray-900 dark:text-white">
                          IC Plan Type
                        </FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                          >
                            <div className="flex items-center space-x-3 p-6 border rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border-gray-200 dark:border-gray-700">
                              <RadioGroupItem value="Goal Attainment" id="goal-attainment" />
                              <div className="flex-1">
                                <Label htmlFor="goal-attainment" className="flex items-center cursor-pointer">
                                  <Target className="h-6 w-6 text-blue-600 mr-3" />
                                  <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                      Goal Attainment
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                      Standard goal-based compensation plan with fixed targets
                                    </p>
                                  </div>
                                </Label>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3 p-6 border rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border-gray-200 dark:border-gray-700">
                              <RadioGroupItem value="Goal Attainment with Relative Rank" id="goal-with-rank" />
                              <div className="flex-1">
                                <Label htmlFor="goal-with-rank" className="flex items-center cursor-pointer">
                                  <TrendingUp className="h-6 w-6 text-blue-600 mr-3" />
                                  <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                      Goal Attainment with Relative Rank
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                      Goal-based plan with additional ranking-based adjustments
                                    </p>
                                  </div>
                                </Label>
                              </div>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Plan Details Card */}
                  <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                    <CardHeader>
                      <CardTitle className="text-lg text-blue-900 dark:text-blue-100">
                        Selected Plan Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="font-medium text-blue-800 dark:text-blue-200">Product:</span>
                          <span className="text-blue-900 dark:text-blue-100">
                            {form.watch("productName") || "Not selected"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-blue-800 dark:text-blue-200">Team:</span>
                          <span className="text-blue-900 dark:text-blue-100">
                            {form.watch("teamName") || "Not selected"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-blue-800 dark:text-blue-200">Plan Type:</span>
                          <span className="text-blue-900 dark:text-blue-100">
                            {form.watch("planType")}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Submit Button */}
                  <div className="flex justify-center pt-6">
                    <Button
                      type="submit"
                      size="lg"
                      className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
                      disabled={processingMutation.isPending}
                    >
                      {processingMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Proceed to Validation
                          <ArrowRight className="h-5 w-5 ml-2" />
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