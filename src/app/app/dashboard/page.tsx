import { requireAuth } from "@/lib/auth";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BookOpen, FileQuestion, MessageCircle, History, TrendingUp, Target } from "lucide-react";
import { ProgressDashboard } from "@/components/progress-dashboard";

export default async function DashboardPage() {
  const session = await requireAuth();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {session.user.name || session.user.email}!
          </h1>
          <p className="mt-2 text-gray-600">
            Ready to ace your government exam? Let's get started.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <CardTitle>Today's Plan</CardTitle>
              </div>
              <CardDescription>
                Get your personalized AI study plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/app/study-plan">
                <Button className="w-full">View Study Plan</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <FileQuestion className="h-5 w-5 text-primary" />
                <CardTitle>Next Mock Test</CardTitle>
              </div>
              <CardDescription>
                Practice with AI-generated mock tests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/app/tests">
                <Button className="w-full">Take Mock Test</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                <CardTitle>Ask a Doubt</CardTitle>
              </div>
              <CardDescription>
                Get instant answers from AI tutor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/app/doubts">
                <Button className="w-full">Ask Question</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <History className="h-5 w-5 text-primary" />
              <CardTitle>Test History</CardTitle>
            </div>
            <CardDescription>
              View your past test attempts and track progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/app/test-history">
              <Button variant="outline" className="w-full">
                View Test History
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <ProgressDashboard />
    </AppLayout>
  );
}

