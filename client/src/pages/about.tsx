import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowLeft, Target, Users, Zap, Shield } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
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
      <main className="px-6 lg:px-12 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              About ICLens
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed">
              Revolutionizing incentive compensation through AI-powered automation and analytics
            </p>
          </div>

          {/* Mission Section */}
          <Card className="mb-12 bg-white dark:bg-gray-900 shadow-xl border border-gray-100 dark:border-gray-700">
            <CardContent className="p-8 lg:p-12">
              <div className="text-center">
                <Target className="h-16 w-16 text-blue-600 mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Our Mission</h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  To empower organizations with intelligent, automated incentive compensation solutions that drive performance, 
                  ensure accuracy, and provide deep insights into compensation strategies. We believe that fair, transparent, 
                  and efficient compensation management is the foundation of motivated, high-performing teams.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <Card className="bg-white dark:bg-gray-900 shadow-lg border border-gray-100 dark:border-gray-700">
              <CardContent className="p-8 text-center">
                <Zap className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Automation</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Streamline complex compensation calculations with intelligent automation that reduces errors and saves time.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-900 shadow-lg border border-gray-100 dark:border-gray-700">
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Collaboration</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Foster teamwork with transparent compensation processes that align individual goals with company objectives.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-900 shadow-lg border border-gray-100 dark:border-gray-700">
              <CardContent className="p-8 text-center">
                <Shield className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Security</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Protect sensitive compensation data with enterprise-grade security and compliance standards.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Company Story */}
          <Card className="bg-white dark:bg-gray-900 shadow-xl border border-gray-100 dark:border-gray-700">
            <CardContent className="p-8 lg:p-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">Our Story</h2>
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                  ICLens was born from the recognition that traditional incentive compensation management is fraught with 
                  complexity, inefficiency, and human error. Our founders, experienced professionals in finance and technology, 
                  witnessed firsthand the challenges organizations face in managing compensation plans that are both fair and motivating.
                </p>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                  By leveraging cutting-edge AI and machine learning technologies, we've created a platform that not only 
                  automates complex calculations but also provides actionable insights that help organizations optimize their 
                  compensation strategies for maximum impact.
                </p>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Today, ICLens serves organizations of all sizes, from fast-growing startups to Fortune 500 companies, 
                  helping them transform their approach to incentive compensation management.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* CTA Section */}
          <div className="text-center mt-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Ready to Transform Your Compensation Management?
            </h2>
            <Link href="/auth">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg rounded-full font-semibold transform hover:scale-105 transition-all duration-200 shadow-lg">
                Get Started Today
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}