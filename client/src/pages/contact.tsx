import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 lg:px-12 py-6">
        <Link href="/">
          <div className="flex items-center space-x-2 cursor-pointer">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#ff4f59' }}>
              <span className="text-white font-bold text-sm">IC</span>
            </div>
            <span className="text-3xl font-bold transition-colors" style={{ color: '#ff4f59' }}>Lens</span>
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
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Contact Us
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed">
              Ready to revolutionize your incentive compensation? Let's talk.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="bg-white dark:bg-gray-900 shadow-xl border border-gray-100 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                  <Send className="h-6 w-6 mr-2 text-blue-600" />
                  Send us a Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">
                        Full Name *
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="mt-1 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:text-white"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                        Email Address *
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="mt-1 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:text-white"
                        placeholder="john@company.com"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="company" className="text-gray-700 dark:text-gray-300">
                      Company
                    </Label>
                    <Input
                      id="company"
                      name="company"
                      type="text"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="mt-1 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:text-white"
                      placeholder="Your Company Name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="subject" className="text-gray-700 dark:text-gray-300">
                      Subject *
                    </Label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      required
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="mt-1 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:text-white"
                      placeholder="How can we help you?"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-gray-700 dark:text-gray-300">
                      Message *
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={handleInputChange}
                      className="mt-1 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:text-white"
                      placeholder="Tell us about your incentive compensation challenges..."
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 font-semibold transform hover:scale-105 transition-all duration-200"
                  >
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-8">
              {/* Contact Details */}
              <Card className="bg-white dark:bg-gray-900 shadow-xl border border-gray-100 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                    Get in Touch
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <Mail className="h-6 w-6 text-blue-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Email</h3>
                      <p className="text-gray-600 dark:text-gray-300">contact@iclens.com</p>
                      <p className="text-gray-600 dark:text-gray-300">support@iclens.com</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <Phone className="h-6 w-6 text-blue-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Phone</h3>
                      <p className="text-gray-600 dark:text-gray-300">+1 (555) 123-4567</p>
                      <p className="text-gray-600 dark:text-gray-300">+1 (555) 987-6543</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <MapPin className="h-6 w-6 text-blue-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Address</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        123 Innovation Drive<br />
                        Tech Valley, CA 94105<br />
                        United States
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <Clock className="h-6 w-6 text-blue-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Business Hours</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Monday - Friday: 9:00 AM - 6:00 PM PST<br />
                        Saturday: 10:00 AM - 2:00 PM PST<br />
                        Sunday: Closed
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Links */}
              <Card className="bg-white dark:bg-gray-900 shadow-xl border border-gray-100 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Link href="/auth">
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 font-semibold">
                      Start Free Trial
                    </Button>
                  </Link>
                  <Link href="/auth">
                    <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 py-3 font-semibold">
                      Schedule Demo
                    </Button>
                  </Link>
                  <Link href="/about">
                    <Button variant="ghost" className="w-full text-gray-600 dark:text-gray-300 py-3">
                      Learn More About Us
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}