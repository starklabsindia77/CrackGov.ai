"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { TrendingUp, TrendingDown, Target, BarChart3, Award, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface AnalyticsData {
  overview: {
    totalTests: number;
    totalQuestions: number;
    totalCorrect: number;
    avgAccuracy: number;
    improvement: number;
  };
  topicBreakdown: Array<{
    topic: string;
    accuracy: number;
    correct: number;
    total: number;
    attempts: number;
  }>;
  examBreakdown: Array<{
    exam: string;
    tests: number;
    avgAccuracy: number;
    totalQuestions: number;
  }>;
  trends: Array<{
    date: string;
    accuracy: number;
    tests: number;
  }>;
  weakTopics: Array<{
    topic: string;
    accuracy: number;
    attempts: number;
  }>;
  strongTopics: Array<{
    topic: string;
    accuracy: number;
    attempts: number;
  }>;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30");

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics/performance?days=${period}`);
      if (response.ok) {
        const analyticsData = await response.json();
        setData(analyticsData);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-4">
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
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">Failed to load analytics</div>
    );
  }

  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Performance Analytics
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Detailed insights into your test performance
            </p>
          </div>
          <div className="w-48">
            <Select value={period} onChange={(e) => setPeriod(e.target.value)}>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </Select>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.overview.totalTests}</div>
              <p className="text-xs text-muted-foreground">
                {data.overview.totalQuestions} questions attempted
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Accuracy</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.overview.avgAccuracy.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {data.overview.totalCorrect}/{data.overview.totalQuestions} correct
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Improvement</CardTitle>
              {data.overview.improvement >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                data.overview.improvement >= 0 ? "text-green-600" : "text-red-600"
              }`}>
                {data.overview.improvement >= 0 ? "+" : ""}
                {data.overview.improvement.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Compared to earlier attempts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {((data.overview.totalCorrect / data.overview.totalQuestions) * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Overall success rate
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Weak Topics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                Areas to Improve
              </CardTitle>
              <CardDescription>Topics with accuracy below 50%</CardDescription>
            </CardHeader>
            <CardContent>
              {data.weakTopics.length > 0 ? (
                <div className="space-y-3">
                  {data.weakTopics.map((topic) => (
                    <div key={topic.topic} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{topic.topic}</p>
                        <p className="text-xs text-muted-foreground">
                          {topic.attempts} attempt(s)
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-orange-600">
                          {topic.accuracy.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  No weak topics identified
                </p>
              )}
            </CardContent>
          </Card>

          {/* Strong Topics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-green-600" />
                Strong Areas
              </CardTitle>
              <CardDescription>Topics with accuracy above 80%</CardDescription>
            </CardHeader>
            <CardContent>
              {data.strongTopics.length > 0 ? (
                <div className="space-y-3">
                  {data.strongTopics.map((topic) => (
                    <div key={topic.topic} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{topic.topic}</p>
                        <p className="text-xs text-muted-foreground">
                          {topic.attempts} attempt(s)
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          {topic.accuracy.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  No strong topics identified yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Topic Breakdown */}
        {data.topicBreakdown.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Topic-wise Performance</CardTitle>
              <CardDescription>Detailed breakdown by topic</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.topicBreakdown
                  .sort((a, b) => b.accuracy - a.accuracy)
                  .slice(0, 10)
                  .map((topic) => (
                    <div key={topic.topic}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">{topic.topic}</span>
                        <span className="text-sm font-semibold">
                          {topic.accuracy.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            topic.accuracy >= 80
                              ? "bg-green-600"
                              : topic.accuracy >= 50
                              ? "bg-yellow-600"
                              : "bg-red-600"
                          }`}
                          style={{ width: `${topic.accuracy}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {topic.correct}/{topic.total} correct • {topic.attempts} attempt(s)
                      </p>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Exam Breakdown */}
        {data.examBreakdown.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Performance by Exam Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.examBreakdown.map((exam) => (
                  <div key={exam.exam} className="flex justify-between items-center p-2 border rounded">
                    <div>
                      <p className="font-medium">{exam.exam}</p>
                      <p className="text-xs text-muted-foreground">
                        {exam.tests} test(s) • {exam.totalQuestions} questions
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{exam.avgAccuracy.toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Performance Trend */}
        {data.trends.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>7-Day Performance Trend</CardTitle>
              <CardDescription>Daily accuracy and test count</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.trends.map((day) => (
                  <div key={day.date} className="flex justify-between items-center">
                    <span className="text-sm">
                      {new Date(day.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        {day.tests} test(s)
                      </span>
                      <span className="font-semibold w-16 text-right">
                        {day.accuracy.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
}

