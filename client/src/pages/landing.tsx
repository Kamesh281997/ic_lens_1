import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Settings, RefreshCw, BarChart3, Menu, X, User, LogOut } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export default function Landing() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen bg-black dark:bg-gray-950 text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 lg:px-12 py-6">
        <div className="text-3xl font-bold">ICLens</div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8 text-lg">
          <Link href="/" className="text-white hover:text-gray-300 transition-colors">
            Home
          </Link>
          <Link href="/about" className="text-white hover:text-gray-300 transition-colors">
            About
          </Link>
          <Link href="/modules" className="text-white hover:text-gray-300 transition-colors italic">
            Modules
          </Link>
          <Link href="/contact" className="text-white hover:text-gray-300 transition-colors">
            Contact
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-4">
          <ThemeToggle />
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-white">
                <User className="h-5 w-5" />
                <span className="text-lg">Welcome, {user?.username}</span>
              </div>
              <Button
                variant="outline"
                onClick={() => logout.mutate()}
                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2 rounded-full"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          ) : (
            <Link href="/auth">
              <Button className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full text-lg font-medium">
                + Login
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-4">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white hover:text-gray-300"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-800">
          <nav className="flex flex-col space-y-4 px-6 py-6">
            <Link href="/" className="text-white hover:text-gray-300 transition-colors text-lg">
              Home
            </Link>
            <Link href="/about" className="text-white hover:text-gray-300 transition-colors text-lg">
              About
            </Link>
            <Link href="/modules" className="text-white hover:text-gray-300 transition-colors text-lg italic">
              Modules
            </Link>
            <Link href="/contact" className="text-white hover:text-gray-300 transition-colors text-lg">
              Contact
            </Link>
            {isAuthenticated ? (
              <div className="pt-4 space-y-4">
                <div className="flex items-center space-x-2 text-white">
                  <User className="h-5 w-5" />
                  <span className="text-lg">Welcome, {user?.username}</span>
                </div>
                <Button
                  variant="outline"
                  onClick={() => logout.mutate()}
                  className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2 rounded-full w-full"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <Link href="/auth" className="pt-4">
                <Button className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full text-lg font-medium w-full">
                  + Login
                </Button>
              </Link>
            )}
          </nav>
        </div>
      )}

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center px-6 py-16 lg:py-24">
        <div className="text-center max-w-5xl">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold mb-8 leading-tight">
            Welcome to ICLens
          </h1>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-semibold mb-6 text-gray-300">
            AI-Powered Incentive Compensation Platform
          </h2>
          <p className="text-2xl md:text-3xl lg:text-4xl mb-16 text-gray-400 font-light">
            Automate. Analyze. Optimize.
          </p>
          <Link href="/auth">
            <Button className="bg-red-500 hover:bg-red-600 text-white px-12 py-6 text-xl rounded-full font-semibold transform hover:scale-105 transition-all duration-200 shadow-lg">
              GET STARTED
            </Button>
          </Link>
        </div>
      </main>

      {/* Features Section */}
      <section className="px-6 lg:px-12 py-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* IC Plan Configuration */}
          <Link href="/auth">
            <div className="bg-gray-900 dark:bg-gray-800 border border-gray-800 dark:border-gray-700 rounded-xl p-10 text-center hover:bg-gray-800 dark:hover:bg-gray-700 transition-all duration-300 cursor-pointer transform hover:scale-105">
              <div className="flex justify-center mb-8">
                <Settings className="h-20 w-20 text-white" />
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold mb-6">IC Plan Configuration</h3>
              <p className="text-gray-400 text-lg lg:text-xl">
                Set up and manage compensation plans.
              </p>
            </div>
          </Link>

          {/* IC Processing */}
          <Link href="/auth">
            <div className="bg-gray-900 dark:bg-gray-800 border border-gray-800 dark:border-gray-700 rounded-xl p-10 text-center hover:bg-gray-800 dark:hover:bg-gray-700 transition-all duration-300 cursor-pointer transform hover:scale-105">
              <div className="flex justify-center mb-8">
                <RefreshCw className="h-20 w-20 text-white" />
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold mb-6">IC Processing</h3>
              <p className="text-gray-400 text-lg lg:text-xl">
                Efficient incentive calculation and processing.
              </p>
            </div>
          </Link>

          {/* IC Insights and Analytics */}
          <Link href="/auth">
            <div className="bg-gray-900 dark:bg-gray-800 border border-gray-800 dark:border-gray-700 rounded-xl p-10 text-center hover:bg-gray-800 dark:hover:bg-gray-700 transition-all duration-300 cursor-pointer transform hover:scale-105">
              <div className="flex justify-center mb-8">
                <BarChart3 className="h-20 w-20 text-white" />
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold mb-6">IC Insights and Analytics</h3>
              <p className="text-gray-400 text-lg lg:text-xl">
                Gain insights through detailed analytics.
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-6 lg:px-12 py-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-gray-400 text-lg">
            &copy; 2024 ICLens. All rights reserved.
          </div>
          <div className="mt-4 text-gray-500">
            AI-Powered Incentive Compensation Platform
          </div>
        </div>
      </footer>
    </div>
  );
}