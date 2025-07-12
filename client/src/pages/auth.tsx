import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, User, Lock, Mail, ArrowLeft, Sun, Moon, Home, BarChart3, TrendingUp, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/use-auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { loginSchema, signupSchema, forgotPasswordSchema } from "@shared/schema";
import type { LoginData, SignupData, ForgotPasswordData } from "@shared/schema";
import { useLocation, Link } from "wouter";

type AuthView = "login" | "signup" | "forgot";

export default function Auth() {
  const [currentView, setCurrentView] = useState<AuthView>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [, navigate] = useLocation();
  const { login, signup, forgotPassword } = useAuth();

  // Get redirect parameter from URL
  const urlParams = new URLSearchParams(window.location.search);
  const redirectTo = urlParams.get('redirect') || '/';

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const signupForm = useForm<SignupData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const forgotForm = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onLoginSubmit = (data: LoginData) => {
    login.mutate(data, {
      onSuccess: () => {
        navigate(redirectTo);
      }
    });
  };

  const onSignupSubmit = (data: SignupData) => {
    signup.mutate(data, {
      onSuccess: () => {
        navigate(redirectTo);
      }
    });
  };

  const onForgotSubmit = (data: ForgotPasswordData) => {
    forgotPassword.mutate(data);
  };

  const renderLoginForm = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Welcome back</h2>
        <p className="text-ilens-slate dark:text-slate-300">Sign in to your account</p>
      </div>

      <Form {...loginForm}>
        <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
          <FormField
            control={loginForm.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      {...field}
                      placeholder="Enter your username"
                      className="pl-10 py-3 bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-ilens-blue focus:ring-2 focus:ring-ilens-blue dark:text-white"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={loginForm.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="pl-10 pr-12 py-3 bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-ilens-blue focus:ring-2 focus:ring-ilens-blue dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox id="remember" />
              <Label htmlFor="remember" className="text-sm text-gray-700 dark:text-gray-300">
                Remember me
              </Label>
            </div>
            <Button
              type="button"
              variant="ghost"
              className="text-sm text-ilens-blue hover:text-ilens-sky p-0"
              onClick={() => setCurrentView("forgot")}
            >
              Forgot password?
            </Button>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#ff4f59] hover:bg-blue-700 text-white py-3 font-medium transform hover:scale-[1.02] transition-all duration-200"
            disabled={login.isPending}
          >
            {login.isPending ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </Form>

      <div className="flex items-center">
        <div className="flex-1 border-t border-gray-300"></div>
        <span className="px-4 text-sm text-gray-500">or</span>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>

      <div className="text-center">
        <p className="text-gray-600 dark:text-gray-300">
          Don't have an account?{" "}
          <Button
            variant="ghost"
            className="text-ilens-blue hover:text-ilens-sky font-medium p-0"
            onClick={() => setCurrentView("signup")}
          >
            Sign up
          </Button>
        </p>
      </div>
    </div>
  );

  const renderSignupForm = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Create account</h2>
        <p className="text-ilens-slate dark:text-slate-300">Join ICLens today</p>
      </div>

      <Form {...signupForm}>
        <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
          <FormField
            control={signupForm.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      {...field}
                      placeholder="Choose a username"
                      className="pl-10 py-3 bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-ilens-blue focus:ring-2 focus:ring-ilens-blue dark:text-white"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={signupForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      {...field}
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10 py-3 bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-ilens-blue focus:ring-2 focus:ring-ilens-blue dark:text-white"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={signupForm.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      className="pl-10 pr-12 py-3 bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-ilens-blue focus:ring-2 focus:ring-ilens-blue dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={signupForm.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      {...field}
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      className="pl-10 pr-12 py-3 bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-ilens-blue focus:ring-2 focus:ring-ilens-blue dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-start space-x-2">
            <Checkbox id="terms" className="mt-1" />
            <Label htmlFor="terms" className="text-sm text-gray-700 dark:text-gray-300">
              I agree to the{" "}
              <a href="#" className="text-ilens-blue hover:text-ilens-sky">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-ilens-blue hover:text-ilens-sky">
                Privacy Policy
              </a>
            </Label>
          </div>

          <Button
            type="submit"
            className="w-full bg-ilens-blue hover:bg-blue-700 text-white py-3 font-medium transform hover:scale-[1.02] transition-all duration-200"
            disabled={signup.isPending}
          >
            {signup.isPending ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
      </Form>

      <div className="text-center">
        <p className="text-gray-600 dark:text-gray-300">
          Already have an account?{" "}
          <Button
            variant="ghost"
            className="text-ilens-blue hover:text-ilens-sky font-medium p-0"
            onClick={() => setCurrentView("login")}
          >
            Sign in
          </Button>
        </p>
      </div>
    </div>
  );

  const renderForgotForm = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Reset password</h2>
        <p className="text-ilens-slate dark:text-slate-300">Enter your email to reset your password</p>
      </div>

      <Form {...forgotForm}>
        <form onSubmit={forgotForm.handleSubmit(onForgotSubmit)} className="space-y-6">
          <FormField
            control={forgotForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      {...field}
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10 py-3 bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-ilens-blue focus:ring-2 focus:ring-ilens-blue dark:text-white"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full bg-ilens-blue hover:bg-blue-700 text-white py-3 font-medium transform hover:scale-[1.02] transition-all duration-200"
            disabled={forgotPassword.isPending}
          >
            {forgotPassword.isPending ? "Sending..." : "Send Reset Email"}
          </Button>
        </form>
      </Form>

      <div className="text-center">
        <Button
          variant="ghost"
          className="text-ilens-blue hover:text-ilens-sky font-medium"
          onClick={() => setCurrentView("login")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to sign in
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-purple-900/20 to-blue-900/20"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, rgba(255,79,89,0.1) 2px, transparent 0),
                           radial-gradient(circle at 75px 75px, rgba(255,79,89,0.05) 1px, transparent 0)`,
          backgroundSize: '100px 100px'
        }}></div>
      </div>

      {/* Floating Analytics Icons */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}>
          <BarChart3 className="h-8 w-8 text-red-500 opacity-20" />
        </div>
        <div className="absolute top-40 right-20 animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}>
          <TrendingUp className="h-6 w-6 text-blue-500 opacity-20" />
        </div>
        <div className="absolute bottom-40 left-20 animate-bounce" style={{ animationDelay: '2s', animationDuration: '5s' }}>
          <Target className="h-7 w-7 text-purple-500 opacity-20" />
        </div>
        <div className="absolute bottom-20 right-10 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '3.5s' }}>
          <BarChart3 className="h-5 w-5 text-green-500 opacity-20" />
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* Header with Back to Home Button */}
          <div className="flex items-center justify-between mb-6">
            <Link href="/">
              <Button 
                variant="ghost" 
                className="text-white hover:text-red-400 hover:bg-red-900/20 transition-colors"
              >
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <ThemeToggle />
          </div>
          
          {/* Logo and Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center space-x-2 mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#ff4f59' }}>
                <span className="text-white font-bold text-lg">IC</span>
              </div>
              <span className="text-4xl font-bold" style={{ color: '#ff4f59' }}>Lens</span>
            </div>
            <p className="text-gray-300">Incentive Compensation Intelligence Platform</p>
          </div>

          {/* Main Auth Card */}
          <Card className="bg-gray-900/80 backdrop-blur-sm shadow-2xl border border-gray-700/50">
            <CardContent className="p-8">
              {currentView === "login" && renderLoginForm()}
              {currentView === "signup" && renderSignupForm()}
              {currentView === "forgot" && renderForgotForm()}
            </CardContent>
          </Card>

          {/* Feature Highlights */}
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center mb-2">
                <BarChart3 className="h-5 w-5 text-red-400" />
              </div>
              <span className="text-xs text-gray-400">Analytics</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mb-2">
                <TrendingUp className="h-5 w-5 text-blue-400" />
              </div>
              <span className="text-xs text-gray-400">Insights</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mb-2">
                <Target className="h-5 w-5 text-purple-400" />
              </div>
              <span className="text-xs text-gray-400">Targets</span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-sm text-gray-500">
            <p>&copy; 2024 ICLens. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
