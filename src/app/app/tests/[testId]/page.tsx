"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Printer, Download } from "lucide-react";
import { exportTestResultToPDF } from "@/lib/pdf-export";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctOption: string;
  explanation?: string;
  topic?: string;
}

interface TestData {
  id: string;
  exam: string;
  questions: Question[];
}

export default function TakeTestPage() {
  const router = useRouter();
  const params = useParams();
  const testId = params.testId as string;

  const [test, setTest] = useState<TestData | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTest();
  }, [testId]);

  const fetchTest = async () => {
    try {
      const response = await fetch(`/api/tests/${testId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch test");
      }
      const data = await response.json();
      setTest(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, option: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await fetch(`/api/tests/${testId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit test");
      }

      const data = await response.json();
      setResults(data);
      toast.success(`Test submitted! Score: ${data.score}/${data.total} (${data.accuracy.toFixed(1)}%)`);
    } catch (err: any) {
      const errorMsg = err.message || "Failed to submit test";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-9 w-64" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-32" />
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  if (error && !test) {
    return (
      <AppLayout>
        <div className="text-center py-12 text-destructive">{error}</div>
      </AppLayout>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    if (!test || !results) return;
    exportTestResultToPDF({
      score: results.score,
      total: results.total,
      accuracy: results.accuracy,
      exam: test.exam,
      createdAt: new Date().toISOString(),
      topicBreakdown: results.topicBreakdown,
      weakTopics: results.weakTopics,
    });
  };

  if (results) {
    return (
      <AppLayout>
        <div className="print:hidden mb-4 flex gap-2">
          <Button onClick={handlePrint} variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button onClick={handleExportPDF} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
        <Card className="print:shadow-none print:border-0">
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {results.score}/{results.total}
                </div>
                <div className="text-sm text-muted-foreground">Score</div>
              </div>
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {results.accuracy.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {results.topicBreakdown
                    ? Object.keys(results.topicBreakdown).length
                    : 0}
                </div>
                <div className="text-sm text-muted-foreground">Topics</div>
              </div>
            </div>

            {results.topicBreakdown && (
              <div>
                <h3 className="font-semibold mb-2">Topic-wise Performance</h3>
                <div className="space-y-2">
                  {Object.entries(results.topicBreakdown).map(
                    ([topic, stats]: [string, any]) => (
                      <div
                        key={topic}
                        className="flex justify-between items-center p-2 bg-gray-50 rounded"
                      >
                        <span>{topic}</span>
                        <span className="text-sm">
                          {stats.correct}/{stats.total} (
                          {((stats.correct / stats.total) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {results.weakTopics && results.weakTopics.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2 text-destructive">
                  Areas to Improve
                </h3>
                <ul className="list-disc list-inside">
                  {results.weakTopics.map((topic: string, idx: number) => (
                    <li key={idx}>{topic}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-4">
              <Button onClick={() => router.push("/app/tests")}>
                Take Another Test
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/app/dashboard")}
              >
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  if (!test) return null;

  const question = test.questions[currentQuestion];
  const totalQuestions = test.questions.length;
  const answeredCount = Object.keys(answers).length;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{test.exam} Mock Test</h1>
            <p className="text-sm text-muted-foreground">
              Question {currentQuestion + 1} of {totalQuestions}
            </p>
          </div>
          <div className="text-sm">
            Answered: {answeredCount}/{totalQuestions}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {question.topic && (
                <span className="text-sm font-normal text-muted-foreground">
                  {question.topic} •{" "}
                </span>
              )}
              Question {currentQuestion + 1}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg">{question.question}</p>

            <RadioGroup
              value={answers[question.id] || ""}
              onValueChange={(value) => handleAnswerChange(question.id, value)}
            >
              {question.options.map((option, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`option-${idx}`} />
                  <Label
                    htmlFor={`option-${idx}`}
                    className="cursor-pointer flex-1"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() =>
                  setCurrentQuestion(Math.max(0, currentQuestion - 1))
                }
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>
              {currentQuestion < totalQuestions - 1 ? (
                <Button
                  onClick={() =>
                    setCurrentQuestion(
                      Math.min(totalQuestions - 1, currentQuestion + 1)
                    )
                  }
                >
                  Next
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Test"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

