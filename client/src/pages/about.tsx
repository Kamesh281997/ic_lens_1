import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Link } from "wouter";
import { ArrowLeft, Target, Users, Zap, Shield } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--gp-surface-base)' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-6 lg:px-12 py-6" style={{ backgroundColor: 'var(--gp-surface-base)', borderBottom: '1px solid var(--gp-border-subtle)' }}>
        <Link href="/">
          <div className="flex items-center space-x-3 cursor-pointer">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: 'var(--gp-surface-raised)' }}>
              <span style={{ color: 'var(--gp-brand-accent)' }} className="font-bold text-xl">IC</span>
            </div>
            <span className="text-2xl font-bold" style={{ color: 'var(--gp-content-primary)' }}>ICLens</span>
          </div>
        </Link>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <Link href="/">
            <button className="gp-btn-ghost inline-flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 lg:px-12 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="gp-display-l mb-6">
              About ICLens
            </h1>
            <p className="gp-body-l">
              Revolutionizing incentive compensation through AI-powered automation and analytics
            </p>
          </div>

          {/* Mission Section */}
          <div className="gp-card mb-12">
            <div className="p-8 lg:p-12">
              <div className="text-center">
                <Target className="h-16 w-16 mx-auto mb-6" style={{ color: 'var(--gp-brand-accent)' }} />
                <h2 className="gp-h1 mb-6">Our Mission</h2>
                <p className="gp-body-l">
                  To empower organizations with intelligent, automated incentive compensation solutions that drive performance, 
                  ensure accuracy, and provide deep insights into compensation strategies. We believe that fair, transparent, 
                  and efficient compensation management is the foundation of motivated, high-performing teams.
                </p>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <div className="gp-card text-center">
              <div className="p-8">
                <Zap className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--gp-state-warning)' }} />
                <h3 className="gp-h2 mb-3">Automation</h3>
                <p className="gp-body-l">
                  Streamline complex compensation calculations with intelligent automation that reduces errors and saves time.
                </p>
              </div>
            </div>

            <div className="gp-card text-center">
              <div className="p-8">
                <Users className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--gp-state-success)' }} />
                <h3 className="gp-h2 mb-3">Collaboration</h3>
                <p className="gp-body-l">
                  Foster teamwork with transparent compensation processes that align individual goals with company objectives.
                </p>
              </div>
            </div>

            <div className="gp-card text-center">
              <div className="p-8">
                <Shield className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--gp-brand-accent)' }} />
                <h3 className="gp-h2 mb-3">Security</h3>
                <p className="gp-body-l">
                  Protect sensitive compensation data with enterprise-grade security and compliance standards.
                </p>
              </div>
            </div>
          </div>

          {/* Company Story */}
          <div className="gp-card">
            <div className="p-8 lg:p-12">
              <h2 className="gp-h1 mb-6 text-center">Our Story</h2>
              <div className="max-w-none">
                <p className="gp-body-l mb-6">
                  ICLens was born from the recognition that traditional incentive compensation management is fraught with 
                  complexity, inefficiency, and human error. Our founders, experienced professionals in finance and technology, 
                  witnessed firsthand the challenges organizations face in managing compensation plans that are both fair and motivating.
                </p>
                <p className="gp-body-l mb-6">
                  By leveraging cutting-edge AI and machine learning technologies, we've created a platform that not only 
                  automates complex calculations but also provides actionable insights that help organizations optimize their 
                  compensation strategies for maximum impact.
                </p>
                <p className="gp-body-l">
                  Today, ICLens serves organizations of all sizes, from fast-growing startups to Fortune 500 companies, 
                  helping them transform their approach to incentive compensation management.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-16">
            <h2 className="gp-h1 mb-6">
              Ready to Transform Your Compensation Management?
            </h2>
            <Link href="/auth">
              <button className="gp-btn-primary inline-flex items-center">
                Get Started Today
              </button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}