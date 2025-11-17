"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Calendar, TrendingUp, Target, Eye, Download, Search, Filter } from "lucide-react";
import { TestHistorySkeleton } from "@/components/ui/loading-skeletons";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { exportTestResultToPDF } from "@/lib/pdf-export";

interface TestAttempt {
  id: string;
  score: number;
  total: number;
  accuracy: number;
  createdAt: string;
  test: {
    id: string;
    exam: string;
    createdAt: string;
  };
  details: {
    topicBreakdown?: Record<string, { correct: number; total: number }>;
    weakTopics?: string[];
  };
}

export default function TestHistoryPage() {
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterExam, setFilterExam] = useState("");

  useEffect(() => {
    fetchAttempts();
  }, []);

  const fetchAttempts = async () => {
    try {
      const response = await fetch("/api/test-attempts");
      if (!response.ok) {
        throw new Error("Failed to fetch test attempts");
      }
      const data = await response.json();
      setAttempts(data.attempts || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return "text-green-600";
    if (accuracy >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading) {
    return <TestHistorySkeleton />;
  }

  if (error) {
    return <div className="text-center py-12 text-destructive">{error}</div>;
  }

  // Filter attempts
  const filteredAttempts = attempts.filter((attempt) => {
    const matchesSearch = searchQuery === "" || 
      attempt.test.exam.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterExam === "" || attempt.test.exam === filterExam;
    return matchesSearch && matchesFilter;
  });

  // Get unique exam types for filter
  const examTypes = Array.from(new Set(attempts.map((a) => a.test.exam)));

  // Calculate statistics from filtered attempts
  const totalAttempts = filteredAttempts.length;
  const avgAccuracy = totalAttempts > 0
    ? filteredAttempts.reduce((sum, a) => sum + a.accuracy, 0) / totalAttempts
    : 0;
  const bestScore = totalAttempts > 0
    ? Math.max(...filteredAttempts.map((a) => a.accuracy))
    : 0;

  const handleExportPDF = (attempt: TestAttempt) => {
    exportTestResultToPDF({
      score: attempt.score,
      total: attempt.total,
      accuracy: attempt.accuracy,
      exam: attempt.test.exam,
      createdAt: attempt.createdAt,
      topicBreakdown: attempt.details.topicBreakdown,
      weakTopics: attempt.details.weakTopics,
    });
  };

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Test History</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              View your past test attempts and track your progress
            </p>
          </div>
          <Link href="/app/tests">
            <Button>Take New Test</Button>
          </Link>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by exam name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="w-48">
            <Select
              value={filterExam}
              onChange={(e) => setFilterExam(e.target.value)}
            >
              <option value="">All Exams</option>
              {examTypes.map((exam) => (
                <option key={exam} value={exam}>
                  {exam}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {totalAttempts > 0 && (
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalAttempts}</div>
                <p className="text-xs text-muted-foreground">Attempts taken</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Accuracy</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgAccuracy.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">Overall performance</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Best Score</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{bestScore.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">Highest accuracy</p>
              </CardContent>
            </Card>
          </div>
        )}

        {filteredAttempts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                You haven't taken any tests yet.
              </p>
              <Link href="/app/tests">
                <Button>Take Your First Test</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {attempts.map((attempt) => (
              <Card key={attempt.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{attempt.test.exam} Test</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(attempt.createdAt).toLocaleDateString()} at{" "}
                        {new Date(attempt.createdAt).toLocaleTimeString()}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getAccuracyColor(attempt.accuracy)}`}>
                        {attempt.accuracy.toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {attempt.score}/{attempt.total}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {attempt.details.topicBreakdown && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Topic-wise Performance:</p>
                      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                        {Object.entries(attempt.details.topicBreakdown).map(
                          ([topic, stats]: [string, any]) => {
                            const topicAccuracy = (stats.correct / stats.total) * 100;
                            return (
                              <div
                                key={topic}
                                className="p-2 bg-gray-50 rounded text-sm"
                              >
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">{topic}</span>
                                  <span
                                    className={
                                      topicAccuracy >= 80
                                        ? "text-green-600"
                                        : topicAccuracy >= 60
                                        ? "text-yellow-600"
                                        : "text-red-600"
                                    }
                                  >
                                    {topicAccuracy.toFixed(0)}%
                                  </span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {stats.correct}/{stats.total} correct
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  )}
                  {attempt.details.weakTopics &&
                    attempt.details.weakTopics.length > 0 && (
                      <div className="mt-4 p-3 bg-red-50 rounded">
                        <p className="text-sm font-medium text-red-800 mb-1">
                          Areas to Improve:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {attempt.details.weakTopics.map((topic, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExportPDF(attempt)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
    </div>
  );
}

