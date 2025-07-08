import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { 
  Settings, 
  RefreshCw, 
  BarChart3, 
  Menu, 
  X, 
  User, 
  LogOut,
  ChevronRight,
  Target,
  TrendingUp,
  Calculator,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  ExternalLink,
  BookOpen,
  Users,
  Activity,
  Award
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export default function Landing() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation Bar */}
      <header className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left: Genpact + ICLens Logos */}
            <div className="flex items-center space-x-6">
              {/* Genpact Logo Placeholder */}
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">G</span>
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">Genpact</span>
              </div>
              
              <div className="h-8 w-px bg-gray-300 dark:bg-gray-600"></div>
              
              {/* ICLens Logo */}
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">IC</span>
                </div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">ICLens</span>
              </div>
            </div>

            {/* Right: Navigation Menu */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-lg font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Home
              </Link>
              <Link href="/about" className="text-lg font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                About
              </Link>
              <Link href="#modules" className="text-lg font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Modules
              </Link>
              <Link href="/contact" className="text-lg font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Contact
              </Link>

              <div className="flex items-center space-x-4 ml-6">
                <ThemeToggle />
                {isAuthenticated ? (
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                      <User className="h-5 w-5" />
                      <span className="text-lg">Welcome, {user?.username}</span>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => logout.mutate()}
                      className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <Link href="/auth">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2">
                      Login
                    </Button>
                  </Link>
                )}
              </div>
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-700 dark:text-gray-300"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4">
              <nav className="flex flex-col space-y-4">
                <Link href="/" className="text-lg font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                  Home
                </Link>
                <Link href="/about" className="text-lg font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                  About
                </Link>
                <Link href="#modules" className="text-lg font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                  Modules
                </Link>
                <Link href="/contact" className="text-lg font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                  Contact
                </Link>
                {isAuthenticated ? (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 mb-4">
                      <User className="h-5 w-5" />
                      <span>Welcome, {user?.username}</span>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => logout.mutate()}
                      className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white w-full"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <Link href="/auth" className="pt-4">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full">
                      Login
                    </Button>
                  </Link>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Background Hero Image */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-indigo-700/90"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1200 800\'%3E%3Crect width=\'1200\' height=\'800\' fill=\'%23f0f9ff\'/%3E%3Cg fill=\'%234f46e5\' opacity=\'0.1\'%3E%3Ccircle cx=\'200\' cy=\'200\' r=\'100\'/%3E%3Ccircle cx=\'800\' cy=\'150\' r=\'80\'/%3E%3Ccircle cx=\'1000\' cy=\'400\' r=\'120\'/%3E%3Ccircle cx=\'400\' cy=\'600\' r=\'90\'/%3E%3C/g%3E%3C/svg%3E")'
          }}
        ></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-8 mb-8">
            {/* Genpact Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-blue-600 font-bold text-2xl">G</span>
              </div>
              <span className="text-2xl font-bold text-white">Genpact</span>
            </div>
            
            <div className="h-12 w-px bg-white/30"></div>
            
            {/* ICLens Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-red-600 font-bold text-2xl">IC</span>
              </div>
              <span className="text-3xl font-bold text-white">ICLens</span>
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Calculate IC Plans
          </h1>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold mb-6 text-blue-100">
            AI-Powered Incentive Compensation Platform
          </h2>
          <p className="text-xl md:text-2xl mb-12 text-blue-100 max-w-3xl mx-auto">
            Drive excellence in incentive compensation through intelligent automation, advanced analytics, and seamless processing.
          </p>
          
          {isAuthenticated ? (
            <Link href="/ic-processing">
              <Button className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 text-xl rounded-full font-semibold transform hover:scale-105 transition-all duration-200 shadow-xl">
                START WORKFLOW
                <ChevronRight className="ml-2 h-6 w-6" />
              </Button>
            </Link>
          ) : (
            <Link href="/auth">
              <Button className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 text-xl rounded-full font-semibold transform hover:scale-105 transition-all duration-200 shadow-xl">
                GET STARTED
                <ChevronRight className="ml-2 h-6 w-6" />
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Modules Section */}
      <section id="modules" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Our Modules
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Comprehensive tools for incentive compensation management, from configuration to insights
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* IC Plan Configuration */}
            <Link href={isAuthenticated ? "/ic-plan-configuration" : "/auth?redirect=/ic-plan-configuration"}>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 border border-blue-200 dark:border-blue-700 rounded-2xl p-8 text-center hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer group">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-700 transition-colors">
                  <Settings className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  IC Plan Configuration
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
                  Configure and customize incentive compensation plans with advanced parameters and rules
                </p>
                <div className="flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold">
                  <span>Configure Plans</span>
                  <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* IC Processing */}
            <Link href={isAuthenticated ? "/ic-processing" : "/auth?redirect=/ic-processing"}>
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 border border-green-200 dark:border-green-700 rounded-2xl p-8 text-center hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer group">
                <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-700 transition-colors">
                  <RefreshCw className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  IC Processing
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
                  Process incentive compensation calculations with automated workflows and validation
                </p>
                <div className="flex items-center justify-center text-green-600 dark:text-green-400 font-semibold">
                  <span>Start Processing</span>
                  <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Payout Insights */}
            <Link href={isAuthenticated ? "/data-insights" : "/auth?redirect=/data-insights"}>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 border border-purple-200 dark:border-purple-700 rounded-2xl p-8 text-center hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer group">
                <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-700 transition-colors">
                  <BarChart3 className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Payout Insights
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
                  Analyze compensation data with comprehensive insights and performance analytics
                </p>
                <div className="flex items-center justify-center text-purple-600 dark:text-purple-400 font-semibold">
                  <span>View Insights</span>
                  <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Company Info */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">G</span>
                </div>
                <span className="text-2xl font-bold">Genpact</span>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed">
                Driving excellence in incentive compensation through intelligent automation
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Linkedin className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Facebook className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Youtube className="h-6 w-6" />
                </a>
              </div>
            </div>

            {/* Product */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold">Product</h3>
              <div className="space-y-3">
                <a href="#" className="block text-gray-300 hover:text-white transition-colors">
                  Features
                </a>
                <a href="#" className="block text-gray-300 hover:text-white transition-colors">
                  Integrations
                </a>
                <a href="#" className="block text-gray-300 hover:text-white transition-colors">
                  API Documentation
                </a>
                <a href="#" className="block text-gray-300 hover:text-white transition-colors">
                  Demo
                </a>
              </div>
            </div>

            {/* Support */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold">Support</h3>
              <div className="space-y-3">
                <a href="#" className="block text-gray-300 hover:text-white transition-colors">
                  Help Center
                </a>
                <a href="#" className="block text-gray-300 hover:text-white transition-colors">
                  Community Forum
                </a>
                <a href="#" className="block text-gray-300 hover:text-white transition-colors">
                  Status Page
                </a>
                <a href="#" className="block text-gray-300 hover:text-white transition-colors">
                  Training
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="border-t border-gray-800 pt-8 mt-12">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 mb-4 md:mb-0">
                © 2025 Genpact. All rights reserved.
              </p>
              <div className="flex space-x-6">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Cookie Notice
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}