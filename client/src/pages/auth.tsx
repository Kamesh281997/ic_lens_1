import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, User, Lock, Mail, ArrowLeft, Sun, Moon } from "lucide-react";
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
import { useLocation } from "wouter";

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
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Theme Toggle */}
        <div className="flex justify-end mb-4">
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
          <p className="text-ilens-slate dark:text-slate-300">Vision Intelligence Platform</p>
        </div>

        {/* Main Auth Card */}
        <Card className="bg-white dark:bg-gray-900 shadow-xl border border-gray-100 dark:border-gray-700">
          <CardContent className="p-8">
            {currentView === "login" && renderLoginForm()}
            {currentView === "signup" && renderSignupForm()}
            {currentView === "forgot" && renderForgotForm()}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
          <p>&copy; 2024 ICLens. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
