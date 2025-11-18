import { requireAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BookOpen, FileQuestion, MessageCircle, History, TrendingUp, Layers, Users, Trophy, HelpCircle, LayoutDashboard } from "lucide-react";
import { ProgressDashboard } from "@/components/progress-dashboard";

export default async function DashboardPage() {
  const session = await requireAuth();

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-display-h1 text-text-primary">
            Welcome back, {session.user.name || session.user.email}!
          </h1>
          <p className="mt-2 text-body-m text-text-secondary">
            Ready to ace your government exam? Let's get started.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-lg transition-shadow border border-borderSubtle bg-bg-card cursor-pointer" data-onboarding="study-plan">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-primary-teal" />
                <CardTitle className="text-heading-h3 text-text-primary">Study Plan</CardTitle>
              </div>
              <CardDescription className="text-body-s text-text-secondary">
                Get your personalized AI study plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/app/study-plan">
                <Button className="w-full bg-primary-teal hover:bg-primary-teal/90 text-white">View Study Plan</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border border-borderSubtle bg-bg-card cursor-pointer" data-onboarding="mock-tests">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <FileQuestion className="h-5 w-5 text-primary-teal" />
                <CardTitle className="text-heading-h3 text-text-primary">Mock Tests</CardTitle>
              </div>
              <CardDescription className="text-body-s text-text-secondary">
                Practice with AI-generated mock tests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/app/tests">
                <Button className="w-full bg-primary-teal hover:bg-primary-teal/90 text-white">Take Mock Test</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border border-borderSubtle bg-bg-card cursor-pointer">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-primary-teal" />
                <CardTitle className="text-heading-h3 text-text-primary">Question Bank</CardTitle>
              </div>
              <CardDescription className="text-body-s text-text-secondary">
                Browse and practice from question library
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/app/question-bank">
                <Button variant="outline" className="w-full border-borderSubtle text-text-primary hover:bg-bg-canvas">Browse Questions</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border border-borderSubtle bg-bg-card cursor-pointer">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Layers className="h-5 w-5 text-primary-teal" />
                <CardTitle className="text-heading-h3 text-text-primary">Flashcards</CardTitle>
              </div>
              <CardDescription className="text-body-s text-text-secondary">
                Study with spaced repetition flashcards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/app/flashcards">
                <Button variant="outline" className="w-full border-borderSubtle text-text-primary hover:bg-bg-canvas">Study Flashcards</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border border-borderSubtle bg-bg-card cursor-pointer">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary-teal" />
                <CardTitle className="text-heading-h3 text-text-primary">Study Groups</CardTitle>
              </div>
              <CardDescription className="text-body-s text-text-secondary">
                Join or create study groups for collaboration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/app/study-groups">
                <Button variant="outline" className="w-full border-borderSubtle text-text-primary hover:bg-bg-canvas">View Groups</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border border-borderSubtle bg-bg-card cursor-pointer">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-primary-teal" />
                <CardTitle className="text-heading-h3 text-text-primary">Analytics</CardTitle>
              </div>
              <CardDescription className="text-body-s text-text-secondary">
                View detailed performance insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/app/analytics">
                <Button variant="outline" className="w-full border-borderSubtle text-text-primary hover:bg-bg-canvas">View Analytics</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border border-borderSubtle bg-bg-card cursor-pointer">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-primary-teal" />
                <CardTitle className="text-heading-h3 text-text-primary">Leaderboard</CardTitle>
              </div>
              <CardDescription className="text-body-s text-text-secondary">
                See how you rank against other students
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/app/leaderboard">
                <Button variant="outline" className="w-full border-borderSubtle text-text-primary hover:bg-bg-canvas">View Leaderboard</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border border-borderSubtle bg-bg-card cursor-pointer" data-onboarding="doubts">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5 text-primary-teal" />
                <CardTitle className="text-heading-h3 text-text-primary">Ask a Doubt</CardTitle>
              </div>
              <CardDescription className="text-body-s text-text-secondary">
                Get instant answers from AI tutor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/app/doubts">
                <Button className="w-full bg-primary-teal hover:bg-primary-teal/90 text-white">Ask Question</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border border-borderSubtle bg-bg-card cursor-pointer">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <HelpCircle className="h-5 w-5 text-primary-teal" />
                <CardTitle className="text-heading-h3 text-text-primary">FAQ</CardTitle>
              </div>
              <CardDescription className="text-body-s text-text-secondary">
                Find answers to frequently asked questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/faq">
                <Button variant="outline" className="w-full border-borderSubtle text-text-primary hover:bg-bg-canvas">View FAQ</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border border-borderSubtle bg-bg-card cursor-pointer" data-onboarding="test-history">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <History className="h-5 w-5 text-primary-teal" />
                <CardTitle className="text-heading-h3 text-text-primary">Test History</CardTitle>
              </div>
              <CardDescription className="text-body-s text-text-secondary">
                View your past test attempts and track progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/app/test-history">
                <Button variant="outline" className="w-full border-borderSubtle text-text-primary hover:bg-bg-canvas">
                  View Test History
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border border-borderSubtle bg-bg-card cursor-pointer">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <LayoutDashboard className="h-5 w-5 text-primary-teal" />
                <CardTitle className="text-heading-h3 text-text-primary">Dashboard</CardTitle>
              </div>
              <CardDescription className="text-body-s text-text-secondary">
                Return to your main dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/app/dashboard">
                <Button variant="outline" className="w-full border-borderSubtle text-text-primary hover:bg-bg-canvas">
                  Go to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      <ProgressDashboard />
    </>
  );
}

