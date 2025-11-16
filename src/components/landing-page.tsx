import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Check, BookOpen, FileQuestion, MessageCircle, TrendingUp, ArrowRight, Sparkles,
  Users, Award, FileText, GraduationCap, Briefcase, Shield, Building2, School,
  PlayCircle, Clock, Target, Zap, BarChart3, Brain
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  HeroIllustration,
  AnimatedGradient,
  GradientBlob,
  PatternDots,
  StatsBackground,
} from "@/components/ui/landing-graphics";

export async function LandingPage() {
  // Try to fetch landing page content from CMS
  let heroContent = {
    title: "Ace Your Government Exams with AI",
    subtitle: "Personalized study plans, mock tests, and instant doubt solving powered by AI",
    cta: "Get Started Free",
  };

  let features = [
    {
      icon: BookOpen,
      title: "AI Study Plans",
      description: "Get personalized study plans tailored to your exam and schedule",
    },
    {
      icon: FileQuestion,
      title: "Mock Tests",
      description: "Practice with AI-generated mock tests and track your progress",
    },
    {
      icon: MessageCircle,
      title: "AI Tutor",
      description: "Get instant answers to your doubts with step-by-step explanations",
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description: "Monitor your performance with detailed analytics and insights",
    },
  ];

  try {
    const homePage = await prisma.page.findUnique({
      where: { slug: "home", published: true },
    });

    if (homePage) {
      // Parse JSON content if stored as JSON, otherwise use as-is
      try {
        const parsed = JSON.parse(homePage.content);
        if (parsed.hero) heroContent = { ...heroContent, ...parsed.hero };
        if (parsed.features) features = parsed.features;
      } catch {
        // Content is not JSON, use as markdown
      }
    }
  } catch (error) {
    console.error("Error fetching CMS content:", error);
  }

  const examCategories = [
    { name: "SSC Exams", icon: Briefcase, count: "28 Exams", color: "bg-primary-teal-light" },
    { name: "Banking Exams", icon: Building2, count: "76 Exams", color: "bg-primary-teal-light" },
    { name: "UPSC", icon: GraduationCap, count: "32 Exams", color: "bg-primary-teal-light" },
    { name: "Railway Exams", icon: School, count: "36 Exams", color: "bg-primary-teal-light" },
    { name: "Defense Exams", icon: Shield, count: "83 Exams", color: "bg-primary-teal-light" },
    { name: "State PSC", icon: Building2, count: "733 Exams", color: "bg-primary-teal-light" },
  ];

  const stats = [
    { label: "Registered Students", value: "50K+", icon: Users },
    { label: "Mock Tests", value: "10K+", icon: FileText },
    { label: "Success Rate", value: "85%+", icon: Award },
    { label: "Study Hours", value: "1M+", icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-bg-canvas relative overflow-hidden">
      {/* Background Graphics */}
      <AnimatedGradient />
      <PatternDots />
      
      {/* Navigation */}
      <nav className="border-b border-borderSubtle bg-bg-card sticky top-0 z-50 backdrop-blur-sm bg-bg-card/95 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-display-h2 text-primary-teal font-semibold">
              CrackGov.ai
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/auth/login">
                <Button variant="ghost" className="text-body-m text-text-secondary hover:text-primary-teal hover:bg-transparent">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-primary-teal hover:bg-primary-teal/90 text-white transition-colors">
                  Get Started For Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
        <GradientBlob className="top-0 right-0" />
        <GradientBlob className="bottom-0 left-0" />
        
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-teal-light text-primary-teal text-body-s mb-8">
              <Sparkles className="h-4 w-4" />
              <span>AI-Powered Exam Preparation</span>
            </div>
            <h1 className="text-display-h1 text-text-primary mb-6 leading-tight">
              One Destination for<br />Complete Exam Preparation
            </h1>
            <div className="flex flex-wrap justify-center lg:justify-start gap-6 mb-8">
              <div className="flex items-center gap-2 text-body-m text-text-secondary">
                <div className="w-2 h-2 rounded-full bg-primary-teal"></div>
                <span>Learn</span>
              </div>
              <div className="flex items-center gap-2 text-body-m text-text-secondary">
                <div className="w-2 h-2 rounded-full bg-primary-teal"></div>
                <span>Practice</span>
              </div>
              <div className="flex items-center gap-2 text-body-m text-text-secondary">
                <div className="w-2 h-2 rounded-full bg-primary-teal"></div>
                <span>Improve</span>
              </div>
              <div className="flex items-center gap-2 text-body-m text-text-secondary">
                <div className="w-2 h-2 rounded-full bg-primary-teal"></div>
                <span>Succeed</span>
              </div>
            </div>
            <p className="text-body-m text-text-secondary mb-12 max-w-2xl mx-auto lg:mx-0">
              Start your preparation for government exams. For Free!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <Link href="/auth/register">
                <Button size="lg" className="bg-primary-teal hover:bg-primary-teal/90 text-white text-body-m px-8 h-12 shadow-lg hover:shadow-xl transition-all">
                  Get Started For Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button size="lg" variant="outline" className="border-borderSubtle text-text-primary text-body-m px-8 h-12 hover:bg-bg-canvas hover:border-borderSubtle transition-all">
                  Sign In
                </Button>
              </Link>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-2 gap-4 max-w-md lg:max-w-none">
              {stats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div key={idx} className="bg-bg-card border border-borderSubtle rounded-lg p-4 text-center hover:shadow-md transition-all">
                    <Icon className="h-6 w-6 text-primary-teal mx-auto mb-2" />
                    <div className="text-display-h2 text-text-primary mb-1">{stat.value}</div>
                    <div className="text-body-s text-text-secondary">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column - Illustration */}
          <div className="hidden lg:block relative">
            <div className="relative">
              <HeroIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* Popular Exams Section */}
      <section className="relative bg-bg-card border-y border-borderSubtle py-20 overflow-hidden">
        <GradientBlob className="top-0 left-0" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-display-h2 text-text-primary mb-4">
              Popular Exams
            </h2>
            <p className="text-body-m text-text-secondary max-w-2xl mx-auto">
              Get exam-ready with concepts, questions and study notes as per the latest pattern
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {examCategories.map((exam, idx) => {
              const Icon = exam.icon;
              return (
                <Link
                  key={idx}
                  href="/app/question-bank"
                  className="bg-bg-canvas border border-borderSubtle rounded-lg p-6 hover:border-primary-teal hover:shadow-lg transition-all group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-teal-light/0 to-primary-teal-light/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg ${exam.color} flex items-center justify-center group-hover:bg-primary-teal transition-colors shadow-sm`}>
                      <Icon className="h-6 w-6 text-primary-teal group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-heading-h3 text-text-primary mb-1 group-hover:text-primary-teal transition-colors">
                        {exam.name}
                      </h3>
                      <p className="text-body-s text-text-secondary">{exam.count}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-text-secondary group-hover:text-primary-teal transition-colors group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="text-center">
            <Link href="/app/question-bank">
              <Button variant="outline" className="border-borderSubtle text-text-primary hover:bg-bg-canvas hover:border-primary-teal/50 transition-all">
                Explore All Exams
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 overflow-hidden">
        <StatsBackground />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-display-h2 text-text-primary mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-body-m text-text-secondary max-w-2xl mx-auto">
              Powerful AI-powered features designed to help you ace your government exams
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="bg-bg-card border border-borderSubtle rounded-lg p-8 hover:border-primary-teal/30 hover:shadow-xl transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary-teal-light rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
                  <div className="relative">
                    <div className="w-12 h-12 rounded-lg bg-primary-teal-light flex items-center justify-center mb-6 group-hover:bg-primary-teal group-hover:scale-110 transition-all shadow-sm">
                      <Icon className="h-6 w-6 text-primary-teal group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-heading-h3 text-text-primary mb-3">{feature.title}</h3>
                    <p className="text-body-s text-text-secondary">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Test Series Section */}
      <section className="relative bg-primary-teal-light py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <PatternDots />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-display-h2 text-text-primary mb-4">
              Enroll in Test Series
            </h2>
            <p className="text-body-m text-text-secondary max-w-2xl mx-auto">
              Get unlimited access to the most relevant Mock Tests, on India's Structured Online Test series platform
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[
              { title: "SSC CHSL Mock Test Series", tests: "2156 Total Tests", users: "972.7k Users", free: "26 Free Tests" },
              { title: "SSC GD Constable Mock Test", tests: "775 Total Tests", users: "89.7k Users", free: "5 Free Tests" },
              { title: "SSC CPO Mock Test Series", tests: "1608 Total Tests", users: "376.4k Users", free: "5 Free Tests" },
            ].map((test, idx) => (
              <Card key={idx} className="border border-borderSubtle bg-bg-card hover:shadow-xl transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary-teal rounded-full blur-2xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <CardHeader className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 rounded-lg bg-primary-teal-light flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary-teal" />
                    </div>
                    <span className="text-label-xs text-text-secondary bg-bg-canvas px-2 py-1 rounded-full">{test.users}</span>
                  </div>
                  <CardTitle className="text-heading-h3 text-text-primary mb-3">
                    {test.title}
                  </CardTitle>
                  <div className="space-y-2">
                    <div className="text-body-s text-text-secondary">{test.tests}</div>
                    <div className="text-body-s text-primary-teal font-medium">{test.free}</div>
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <Link href="/app/tests">
                    <Button className="w-full bg-primary-teal hover:bg-primary-teal/90 text-white shadow-md hover:shadow-lg transition-all">
                      View Test Series
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center">
            <Link href="/app/tests">
              <Button variant="outline" className="border-borderSubtle text-text-primary hover:bg-bg-card hover:border-primary-teal/50 transition-all">
                Explore All Test Series
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-24 bg-bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-display-h2 text-text-primary mb-4">
              Why CrackGov.ai?
            </h2>
            <p className="text-body-m text-text-secondary max-w-2xl mx-auto">
              With thousands of students and one of the best selection rates in India amongst online learning platforms, you can rely on us to excel.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "AI-Powered Learning",
                description: "Personalized study plans and instant doubt solving powered by advanced AI technology"
              },
              {
                icon: Target,
                title: "Exam-Focused",
                description: "Content specifically designed for government exams with latest patterns and syllabus"
              },
              {
                icon: BarChart3,
                title: "Track Progress",
                description: "Monitor your performance with detailed analytics and insights to improve continuously"
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary-teal-light flex items-center justify-center mx-auto mb-6">
                    <Icon className="h-8 w-8 text-primary-teal" />
                  </div>
                  <h3 className="text-heading-h3 text-text-primary mb-3">{item.title}</h3>
                  <p className="text-body-s text-text-secondary">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 overflow-hidden">
        <StatsBackground />
        <div className="relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-display-h2 text-text-primary mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-body-m text-text-secondary max-w-2xl mx-auto">
              Choose the plan that works best for you. Start free, upgrade when ready.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* FREE PLAN */}
            <Card className="border border-borderSubtle shadow-sm relative bg-bg-card">
              <CardHeader className="pb-6 relative">
                <div className="absolute top-0 right-0">
                  <span className="bg-state-success text-white text-label-xs px-2 py-1 rounded-full font-medium">
                    Always Free
                  </span>
                </div>
                <CardTitle className="text-heading-h3 text-text-primary mb-6">Free Plan</CardTitle>
                <div className="mt-6">
                  <span className="text-display-h2 text-text-primary">₹0</span>
                  <span className="text-body-m text-text-secondary ml-1">/forever</span>
                </div>
                <p className="text-body-s text-text-secondary mt-3">
                  Perfect for first-time users and casual learners
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-state-success mt-0.5 flex-shrink-0" />
                    <span className="text-body-s text-text-secondary">1 AI Study Plan / month</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-state-success mt-0.5 flex-shrink-0" />
                    <span className="text-body-s text-text-secondary">1 Mock Test every 15 days</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-state-success mt-0.5 flex-shrink-0" />
                    <span className="text-body-s text-text-secondary">5 AI Doubts per month</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-state-success mt-0.5 flex-shrink-0" />
                    <span className="text-body-s text-text-secondary">Limited PYQ insights</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-state-success mt-0.5 flex-shrink-0" />
                    <span className="text-body-s text-text-secondary">English or Hindi (one language)</span>
                  </li>
                </ul>
                <Link href="/auth/register" className="block">
                  <Button className="w-full bg-white text-text-primary hover:bg-bg-canvas hover:text-text-primary border border-borderSubtle hover:border-primary-teal/30 transition-all">
                    Get Started Free
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* STUDENT PRO PLAN */}
            <Card className="border-2 border-primary-teal shadow-lg relative bg-bg-card z-10 scale-105">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                <span className="bg-primary-teal text-white text-label-xs px-4 py-1 rounded-full font-medium">
                  Most Popular
                </span>
              </div>
              <CardHeader className="pb-6 pt-8">
                <CardTitle className="text-heading-h3 text-text-primary mb-6">Student Pro</CardTitle>
                <div className="mt-6 space-y-2">
                  <div>
                    <span className="text-display-h2 text-text-primary">₹199</span>
                    <span className="text-body-m text-text-secondary ml-1">/month</span>
                  </div>
                  <div className="text-body-s text-text-secondary space-y-1">
                    <div>or ₹499 / 3 months</div>
                    <div>or ₹1,499 / year</div>
                  </div>
                </div>
                <p className="text-body-s text-text-secondary mt-3">
                  Best value for serious exam preparation
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-state-success mt-0.5 flex-shrink-0" />
                    <span className="text-body-s text-text-secondary">Unlimited AI Study Plans</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-state-success mt-0.5 flex-shrink-0" />
                    <span className="text-body-s text-text-secondary">Unlimited Mock Tests</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-state-success mt-0.5 flex-shrink-0" />
                    <span className="text-body-s text-text-secondary">AI Doubt Solver: 100 questions/day</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-state-success mt-0.5 flex-shrink-0" />
                    <span className="text-body-s text-text-secondary">All PYQ Analysis (10 years)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-state-success mt-0.5 flex-shrink-0" />
                    <span className="text-body-s text-text-secondary">Multi-language support (Hindi + English)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-state-success mt-0.5 flex-shrink-0" />
                    <span className="text-body-s text-text-secondary">Weak area tracking</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-state-success mt-0.5 flex-shrink-0" />
                    <span className="text-body-s text-text-secondary">AI flashcards & notes generator</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-state-success mt-0.5 flex-shrink-0" />
                    <span className="text-body-s text-text-secondary">Priority AI model access</span>
                  </li>
                </ul>
                <Link href="/auth/register" className="block">
                  <Button className="w-full bg-primary-teal hover:bg-primary-teal/90 text-white shadow-md hover:shadow-lg transition-all font-medium">
                    Upgrade to Pro
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* TOPPER PLAN */}
            <Card className="border border-borderSubtle shadow-sm relative bg-bg-card">
              <div className="absolute top-0 right-0">
                <span className="bg-primary-teal text-white text-label-xs px-3 py-1 rounded-full font-medium">
                  Advanced AI
                </span>
              </div>
              <CardHeader className="pb-6">
                <CardTitle className="text-heading-h3 text-text-primary mb-6">Topper Plan</CardTitle>
                <div className="mt-6 space-y-2">
                  <div>
                    <span className="text-display-h2 text-text-primary">₹349</span>
                    <span className="text-body-m text-text-secondary ml-1">/month</span>
                  </div>
                  <div className="text-body-s text-text-secondary space-y-1">
                    <div>or ₹899 / 3 months</div>
                    <div>or ₹2,499 / year</div>
                  </div>
                </div>
                <p className="text-body-s text-text-secondary mt-3">
                  For serious aspirants aiming for top ranks
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-primary-teal-light/30 rounded-lg p-3 -mt-2 mb-2">
                  <p className="text-body-s text-primary-teal font-medium">Everything in Pro +</p>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-state-success mt-0.5 flex-shrink-0" />
                    <span className="text-body-s text-text-secondary">AI-generated long notes</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-state-success mt-0.5 flex-shrink-0" />
                    <span className="text-body-s text-text-secondary">AI Video concept explainers</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-state-success mt-0.5 flex-shrink-0" />
                    <span className="text-body-s text-text-secondary">Unlimited doubt solving (Claude/OpenAI)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-state-success mt-0.5 flex-shrink-0" />
                    <span className="text-body-s text-text-secondary">Higher priority AI models</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-state-success mt-0.5 flex-shrink-0" />
                    <span className="text-body-s text-text-secondary">Explain mistakes: "why wrong/why right"</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-state-success mt-0.5 flex-shrink-0" />
                    <span className="text-body-s text-text-secondary">Personalized revision schedule</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-state-success mt-0.5 flex-shrink-0" />
                    <span className="text-body-s text-text-secondary">Time-bound exam simulation</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-state-success mt-0.5 flex-shrink-0" />
                    <span className="text-body-s text-text-secondary">Early access to new features</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-state-success mt-0.5 flex-shrink-0" />
                    <span className="text-body-s text-text-secondary">Support for multiple exams</span>
                  </li>
                </ul>
                <Link href="/auth/register" className="block">
                  <Button className="w-full border-2 border-primary-teal bg-white text-primary-teal hover:bg-primary-teal hover:text-white transition-all font-medium">
                    Upgrade to Topper
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-primary-teal-light py-24 overflow-hidden">
        <GradientBlob className="top-0 left-1/2 transform -translate-x-1/2" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-teal/10 mb-6">
            <Sparkles className="h-10 w-10 text-primary-teal" />
          </div>
          <h2 className="text-display-h2 text-text-primary mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-body-m text-text-secondary mb-8 max-w-2xl mx-auto">
            Join thousands of students preparing for government exams with AI-powered tools
          </p>
          <Link href="/auth/register">
            <Button size="lg" className="bg-primary-teal hover:bg-primary-teal/90 text-white text-body-m px-8 h-12 shadow-lg hover:shadow-xl transition-all">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-borderSubtle bg-bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="text-heading-h3 text-text-primary mb-4">CrackGov.ai</h3>
              <p className="text-body-s text-text-secondary mb-4">
                AI-powered exam preparation platform for government exams.
              </p>
            </div>
            <div>
              <h4 className="text-body-m text-text-primary font-medium mb-4">Products</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/app/tests" className="text-body-s text-text-secondary hover:text-primary-teal transition-colors">
                    Test Series
                  </Link>
                </li>
                <li>
                  <Link href="/app/question-bank" className="text-body-s text-text-secondary hover:text-primary-teal transition-colors">
                    Question Bank
                  </Link>
                </li>
                <li>
                  <Link href="/app/study-plan" className="text-body-s text-text-secondary hover:text-primary-teal transition-colors">
                    Study Plans
                  </Link>
                </li>
                <li>
                  <Link href="/app/doubts" className="text-body-s text-text-secondary hover:text-primary-teal transition-colors">
                    AI Doubt Solver
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-body-m text-text-primary font-medium mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/faq" className="text-body-s text-text-secondary hover:text-primary-teal transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-body-s text-text-secondary hover:text-primary-teal transition-colors">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-body-s text-text-secondary hover:text-primary-teal transition-colors">
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-body-m text-text-primary font-medium mb-4">Support</h4>
              <ul className="space-y-2">
                <li>
                  <a href="mailto:support@crackgov.ai" className="text-body-s text-text-secondary hover:text-primary-teal transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <Link href="/faq" className="text-body-s text-text-secondary hover:text-primary-teal transition-colors">
                    Help Center
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-borderSubtle pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-body-s text-text-secondary">
                © 2024 CrackGov.ai. All rights reserved.
              </p>
              <div className="flex gap-6">
                <Link href="/terms" className="text-body-s text-text-secondary hover:text-primary-teal transition-colors">
                  Terms
                </Link>
                <Link href="/privacy" className="text-body-s text-text-secondary hover:text-primary-teal transition-colors">
                  Privacy
                </Link>
                <Link href="/faq" className="text-body-s text-text-secondary hover:text-primary-teal transition-colors">
                  FAQ
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

