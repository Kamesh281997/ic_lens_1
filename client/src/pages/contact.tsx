import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { Link } from "wouter";
import { ArrowLeft, Mail, Phone, MapPin, Clock, Send } from "lucide-react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    subject: "",
    message: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log("Form submitted:", formData);
    alert("Thank you for your message! We'll get back to you soon.");
    setFormData({
      name: "",
      email: "",
      company: "",
      subject: "",
      message: ""
    });
  };

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
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="gp-display-l mb-6">
              Contact Us
            </h1>
            <p className="gp-body-l">
              Get in touch with our team - we're here to help you succeed
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="gp-card">
              <div className="p-8">
                <h2 className="gp-h1 mb-6">Send us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="gp-body-m" style={{ color: 'var(--gp-content-primary)' }}>
                        Full Name *
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="mt-2"
                        style={{ borderColor: 'var(--gp-border-subtle)' }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="gp-body-m" style={{ color: 'var(--gp-content-primary)' }}>
                        Email Address *
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="mt-2"
                        style={{ borderColor: 'var(--gp-border-subtle)' }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="company" className="gp-body-m" style={{ color: 'var(--gp-content-primary)' }}>
                      Company
                    </Label>
                    <Input
                      id="company"
                      name="company"
                      type="text"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="mt-2"
                      style={{ borderColor: 'var(--gp-border-subtle)' }}
                    />
                  </div>

                  <div>
                    <Label htmlFor="subject" className="gp-body-m" style={{ color: 'var(--gp-content-primary)' }}>
                      Subject *
                    </Label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="mt-2"
                      style={{ borderColor: 'var(--gp-border-subtle)' }}
                    />
                  </div>

                  <div>
                    <Label htmlFor="message" className="gp-body-m" style={{ color: 'var(--gp-content-primary)' }}>
                      Message *
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={5}
                      className="mt-2"
                      style={{ borderColor: 'var(--gp-border-subtle)' }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="gp-btn-primary w-full inline-flex items-center justify-center"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </button>
                </form>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              {/* Contact Details */}
              <div className="gp-card">
                <div className="p-8">
                  <h2 className="gp-h1 mb-6">Get in Touch</h2>
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <Mail className="h-6 w-6 mt-1" style={{ color: 'var(--gp-brand-accent)' }} />
                      <div>
                        <h3 className="gp-h3 mb-1">Email</h3>
                        <p className="gp-body-l" style={{ color: 'var(--gp-content-secondary)' }}>
                          contact@iclens.com
                        </p>
                        <p className="gp-body-l" style={{ color: 'var(--gp-content-secondary)' }}>
                          support@iclens.com
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <Phone className="h-6 w-6 mt-1" style={{ color: 'var(--gp-brand-accent)' }} />
                      <div>
                        <h3 className="gp-h3 mb-1">Phone</h3>
                        <p className="gp-body-l" style={{ color: 'var(--gp-content-secondary)' }}>
                          +1 (555) 123-4567
                        </p>
                        <p className="gp-body-l" style={{ color: 'var(--gp-content-secondary)' }}>
                          +1 (555) 123-4568 (Support)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <MapPin className="h-6 w-6 mt-1" style={{ color: 'var(--gp-brand-accent)' }} />
                      <div>
                        <h3 className="gp-h3 mb-1">Address</h3>
                        <p className="gp-body-l" style={{ color: 'var(--gp-content-secondary)' }}>
                          123 Business District
                        </p>
                        <p className="gp-body-l" style={{ color: 'var(--gp-content-secondary)' }}>
                          San Francisco, CA 94105
                        </p>
                        <p className="gp-body-l" style={{ color: 'var(--gp-content-secondary)' }}>
                          United States
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <Clock className="h-6 w-6 mt-1" style={{ color: 'var(--gp-brand-accent)' }} />
                      <div>
                        <h3 className="gp-h3 mb-1">Business Hours</h3>
                        <p className="gp-body-l" style={{ color: 'var(--gp-content-secondary)' }}>
                          Monday - Friday: 9:00 AM - 6:00 PM PST
                        </p>
                        <p className="gp-body-l" style={{ color: 'var(--gp-content-secondary)' }}>
                          Saturday: 10:00 AM - 2:00 PM PST
                        </p>
                        <p className="gp-body-l" style={{ color: 'var(--gp-content-secondary)' }}>
                          Sunday: Closed
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="gp-card">
                <div className="p-8">
                  <h2 className="gp-h2 mb-6">Quick Actions</h2>
                  <div className="space-y-4">
                    <Link href="/auth">
                      <button className="gp-btn-secondary w-full inline-flex items-center justify-center">
                        Start Free Trial
                      </button>
                    </Link>
                    <Link href="/about">
                      <button className="gp-btn-ghost w-full inline-flex items-center justify-center">
                        Learn More About ICLens
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}