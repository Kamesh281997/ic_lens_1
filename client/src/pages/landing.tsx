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
  Award,
  Cog,
  Zap,
  PieChart
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import genpactLogo from "@assets/image_1751975273545.png";
import heroImage from "@assets/image_1751977117038.png";

export default function Landing() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--gp-surface-base)' }}>
      {/* Navigation Bar */}
      <header className="gp-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left: Genpact + ICLens Logos */}
            <div className="flex items-center space-x-6">
              {/* Genpact Logo */}
              <div className="flex items-center space-x-3">
                <img 
                  src={genpactLogo} 
                  alt="Genpact" 
                  className="h-10 w-auto"
                />
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
              <Link href="/" className="gp-nav-link text-lg font-medium">
                Home
              </Link>
              <Link href="/about" className="gp-nav-link text-lg font-medium">
                About
              </Link>
              <a href="#modules" className="gp-nav-link text-lg font-medium cursor-pointer" onClick={(e) => {
                e.preventDefault();
                document.getElementById('modules')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                Modules
              </a>
              <Link href="/contact" className="gp-nav-link text-lg font-medium">
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
                    <button className="gp-btn-primary">
                      Login
                    </button>
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
                <a href="#modules" className="text-lg font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer" onClick={(e) => {
                  e.preventDefault();
                  setIsMobileMenuOpen(false);
                  document.getElementById('modules')?.scrollIntoView({ behavior: 'smooth' });
                }}>
                  Modules
                </a>
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
      <section className="relative py-20 lg:py-32 overflow-hidden" style={{ backgroundColor: 'var(--gp-surface-base)' }}>
        {/* Background Gradient Overlay */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, var(--gp-surface-base) 0%, transparent 40%)'
          }}
        ></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start space-x-8 mb-8">
                {/* Genpact Logo */}
                <div className="flex items-center space-x-3">
                  <div style={{ backgroundColor: 'var(--gp-surface-raised)' }} className="rounded-xl p-4 shadow-lg">
                    <img 
                      src={genpactLogo} 
                      alt="Genpact" 
                      className="h-12 w-auto"
                    />
                  </div>
                </div>
                
                <div className="h-12 w-px" style={{ backgroundColor: 'var(--gp-border-subtle)' }}></div>
                
                {/* ICLens Logo */}
                <div className="flex items-center space-x-3">
                  <div className="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: 'var(--gp-surface-raised)' }}>
                    <span style={{ color: 'var(--gp-brand-accent)' }} className="font-bold text-2xl">IC</span>
                  </div>
                  <span className="text-3xl font-bold" style={{ color: 'var(--gp-content-primary)' }}>ICLens</span>
                </div>
              </div>

              <h1 className="gp-display-l mb-6">
                AI-Powered Incentive Compensation Platform
              </h1>
              <p className="gp-body-l mb-12 max-w-2xl mx-auto lg:mx-0">
                Drive excellence in incentive compensation through intelligent automation, advanced analytics, and seamless processing.
              </p>
              
              {isAuthenticated ? (
                <Link href="/ic-processing">
                  <button className="gp-btn-primary inline-flex items-center">
                    START WORKFLOW
                    <ChevronRight className="ml-2 h-6 w-6" />
                  </button>
                </Link>
              ) : (
                <Link href="/auth">
                  <button className="gp-btn-primary inline-flex items-center">
                    GET STARTED
                    <ChevronRight className="ml-2 h-6 w-6" />
                  </button>
                </Link>
              )}
            </div>

            {/* Right Image */}
            <div className="flex justify-center lg:justify-end">
              <img 
                src={heroImage} 
                alt="Incentive Compensation Analytics" 
                className="max-w-full h-auto rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>
      {/* Modules Section */}
      <section id="modules" className="py-20" style={{ backgroundColor: 'var(--gp-surface-raised)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="gp-h1 mb-6">
              Our Modules
            </h2>
            <p className="gp-body-l max-w-3xl mx-auto">
              Comprehensive tools for incentive compensation management, from configuration to insights
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* IC Plan Configuration */}
            <Link href={isAuthenticated ? "/ic-plan-configuration" : "/auth?redirect=/ic-plan-configuration"}>
              <div className="gp-card text-center cursor-pointer group transition-all duration-300 hover:shadow-xl transform hover:scale-105">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors" style={{ backgroundColor: 'var(--gp-brand-accent)' }}>
                  <Cog className="h-10 w-10" style={{ color: 'var(--gp-surface-base)' }} />
                </div>
                <h3 className="gp-h2 mb-4">IC Configuration</h3>
                <p className="gp-body-l mb-6">
                  Configure and customize incentive compensation plans with automated workflows
                </p>
                <div className="flex items-center justify-center font-semibold" style={{ color: 'var(--gp-brand-accent)' }}>
                  <span>Configure Plans</span>
                  <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* IC Processing */}
            <Link href={isAuthenticated ? "/ic-processing" : "/auth?redirect=/ic-processing"}>
              <div className="gp-card text-center cursor-pointer group transition-all duration-300 hover:shadow-xl transform hover:scale-105">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors" style={{ backgroundColor: 'var(--gp-state-success)' }}>
                  <Zap className="h-10 w-10" style={{ color: 'var(--gp-surface-base)' }} />
                </div>
                <h3 className="gp-h2 mb-4">
                  IC Processing
                </h3>
                <p className="gp-body-l mb-6">
                  Process incentive compensation calculations with automated workflows and validation
                </p>
                <div className="flex items-center justify-center font-semibold" style={{ color: 'var(--gp-brand-accent)' }}>
                  <span>Start Processing</span>
                  <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Payout Insights */}
            <Link href={isAuthenticated ? "/data-insights" : "/auth?redirect=/data-insights"}>
              <div className="gp-card text-center cursor-pointer group transition-all duration-300 hover:shadow-xl transform hover:scale-105">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors" style={{ backgroundColor: 'var(--gp-state-warning)' }}>
                  <PieChart className="h-10 w-10" style={{ color: 'var(--gp-surface-base)' }} />
                </div>
                <h3 className="gp-h2 mb-4">
                  Payout Insights
                </h3>
                <p className="gp-body-l mb-6">
                  Analyze compensation data with comprehensive insights and performance analytics
                </p>
                <div className="flex items-center justify-center font-semibold" style={{ color: 'var(--gp-brand-accent)' }}>
                  <span>View Insights</span>
                  <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>
      {/* Footer Section */}
      <footer style={{ backgroundColor: 'var(--gp-surface-sunken)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Company Info */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <img 
                  src={genpactLogo} 
                  alt="Genpact" 
                  className="h-10 w-auto"
                />
              </div>
              <p className="gp-body-l">
                Driving excellence in incentive compensation through intelligent automation
              </p>
              <div className="flex space-x-4">
                <a href="#" style={{ color: 'var(--gp-content-tertiary)' }} className="transition-colors hover:text-white">
                  <Twitter className="h-6 w-6" />
                </a>
                <a href="#" style={{ color: 'var(--gp-content-tertiary)' }} className="transition-colors hover:text-white">
                  <Linkedin className="h-6 w-6" />
                </a>
                <a href="#" style={{ color: 'var(--gp-content-tertiary)' }} className="transition-colors hover:text-white">
                  <Facebook className="h-6 w-6" />
                </a>
                <a href="#" style={{ color: 'var(--gp-content-tertiary)' }} className="transition-colors hover:text-white">
                  <Youtube className="h-6 w-6" />
                </a>
              </div>
            </div>

            {/* Product */}
            <div className="space-y-6">
              <h3 className="gp-h3">Product</h3>
              <div className="space-y-3">
                <a href="#" className="block gp-body-s transition-colors" style={{ color: 'var(--gp-content-secondary)' }}>
                  Features
                </a>
                <a href="#" className="block gp-body-s transition-colors" style={{ color: 'var(--gp-content-secondary)' }}>
                  Integrations
                </a>
                <a href="#" className="block gp-body-s transition-colors" style={{ color: 'var(--gp-content-secondary)' }}>
                  API Documentation
                </a>
                <a href="#" className="block gp-body-s transition-colors" style={{ color: 'var(--gp-content-secondary)' }}>
                  Demo
                </a>
              </div>
            </div>

            {/* Support */}
            <div className="space-y-6">
              <h3 className="gp-h3">Support</h3>
              <div className="space-y-3">
                <a href="#" className="block gp-body-s transition-colors" style={{ color: 'var(--gp-content-secondary)' }}>
                  Help Center
                </a>
                <a href="#" className="block gp-body-s transition-colors" style={{ color: 'var(--gp-content-secondary)' }}>
                  Community Forum
                </a>
                <a href="#" className="block gp-body-s transition-colors" style={{ color: 'var(--gp-content-secondary)' }}>
                  Status Page
                </a>
                <a href="#" className="block gp-body-s transition-colors" style={{ color: 'var(--gp-content-secondary)' }}>
                  Training
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="pt-8 mt-12" style={{ borderTop: '1px solid var(--gp-border-subtle)' }}>
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="gp-body-s mb-4 md:mb-0" style={{ color: 'var(--gp-content-tertiary)' }}>
                © 2025 Genpact. All rights reserved.
              </p>
              <div className="flex space-x-6">
                <a href="#" className="gp-body-s transition-colors" style={{ color: 'var(--gp-content-tertiary)' }}>
                  Privacy Policy
                </a>
                <a href="#" className="gp-body-s transition-colors" style={{ color: 'var(--gp-content-tertiary)' }}>
                  Terms of Service
                </a>
                <a href="#" className="gp-body-s transition-colors" style={{ color: 'var(--gp-content-tertiary)' }}>
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