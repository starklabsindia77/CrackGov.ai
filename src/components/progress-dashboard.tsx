"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Target, BarChart3, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ProgressData {
  totalTests: number;
  avgAccuracy: number;
  recentAvgAccuracy: number;
  recentTestCount: number;
  examStats: Record<string, { count: number; avgAccuracy: number }>;
  trend: Array<{ date: string; accuracy: number }>;
  activePlans: number;
  totalPlans: number;
}

export function ProgressDashboard() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const response = await fetch("/api/analytics/progress");
      if (response.ok) {
        const progressData = await response.json();
        setData(progressData);
      }
    } catch (error) {
      console.error("Error fetching progress:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const accuracyChange = data.recentAvgAccuracy - data.avgAccuracy;
  const isImproving = accuracyChange > 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalTests}</div>
            <p className="text-xs text-muted-foreground">
              {data.recentTestCount} in last 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Accuracy</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.avgAccuracy.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              {isImproving ? (
                <>
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-green-600">
                    +{accuracyChange.toFixed(1)}% recent
                  </span>
                </>
              ) : (
                <>
                  <span className="text-red-600">
                    {accuracyChange.toFixed(1)}% recent
                  </span>
                </>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.recentAvgAccuracy.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Last 7 days average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Study Plans</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activePlans}</div>
            <p className="text-xs text-muted-foreground">
              {data.totalPlans} total plans
            </p>
          </CardContent>
        </Card>
      </div>

      {Object.keys(data.examStats).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Performance by Exam</CardTitle>
            <CardDescription>
              Your average accuracy for each exam type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(data.examStats).map(([exam, stats]) => (
                <div key={exam} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{exam}</span>
                    <span className="text-sm text-muted-foreground">
                      {stats.avgAccuracy.toFixed(1)}% ({stats.count} tests)
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(stats.avgAccuracy, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {data.trend.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Trend</CardTitle>
            <CardDescription>
              Your accuracy over the last {data.trend.length} tests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.trend.map((point, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {new Date(point.date).toLocaleDateString()}
                  </span>
                  <span className="font-medium">{point.accuracy.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

