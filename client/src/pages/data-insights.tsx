import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Link, useLocation } from "wouter";
import { 
  ArrowLeft, 
  BarChart3,
  TrendingUp,
  Calendar,
  Clock
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function DataInsights() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center">Authentication Required</CardTitle>
            <CardDescription className="text-center">
              Please log in to access data insights
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/auth?redirect=/data-insights">
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
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Data Insights</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center space-y-8">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-6">
              <BarChart3 className="h-16 w-16 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          {/* Welcome Message */}
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
              Welcome to Data Insights, {user?.username}!
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Advanced analytics and compensation insights are being prepared for you.
            </p>
          </div>

          {/* Coming Soon Card */}
          <Card className="max-w-2xl mx-auto bg-white dark:bg-gray-800 shadow-lg">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-orange-100 dark:bg-orange-900 rounded-full p-4">
                  <Clock className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <CardTitle className="text-2xl text-gray-900 dark:text-white">
                Coming Soon
              </CardTitle>
              <CardDescription className="text-lg text-gray-600 dark:text-gray-300">
                Your personalized insights will be available in a few days
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Performance Analytics</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Detailed compensation metrics</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Interactive Dashboards</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Real-time data visualization</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  <div>
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                      We're building something amazing
                    </h3>
                    <p className="text-blue-700 dark:text-blue-300">
                      Our team is working hard to deliver comprehensive insights tailored to your compensation data. 
                      You'll receive an email notification when your insights are ready.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 pt-8">
            <Link href="/">
              <Button variant="outline" size="lg" className="px-8">
                Return to Home
              </Button>
            </Link>
            <Link href="/data-validation">
              <Button size="lg" className="px-8 bg-blue-600 hover:bg-blue-700">
                Continue Workflow
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}