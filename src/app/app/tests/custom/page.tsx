"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Play } from "lucide-react";
import { toast } from "sonner";

const EXAM_TYPES = ["UPSC", "SSC", "Banking", "Railway", "Defense", "State PSC"];

export default function CustomTestBuilderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    exam: "",
    questionCount: 20,
    difficulty: "mixed" as "easy" | "medium" | "hard" | "mixed",
    timeLimit: "",
    topics: [] as string[],
    subject: "",
  });
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);

  useEffect(() => {
    if (formData.exam) {
      fetchFilters();
    }
  }, [formData.exam]);

  const fetchFilters = async () => {
    try {
      const res = await fetch(`/api/question-bank?exam=${formData.exam}&limit=1`);
      if (res.ok) {
        const data = await res.json();
        setAvailableTopics(data.filters?.topics || []);
        setAvailableSubjects(data.filters?.subjects || []);
      }
    } catch (error) {
      console.error("Error fetching filters:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: any = {
        exam: formData.exam,
        questionCount: formData.questionCount,
        difficulty: formData.difficulty,
      };

      if (formData.topics.length > 0) {
        payload.topics = formData.topics;
      }

      if (formData.subject) {
        payload.subject = formData.subject;
      }

      if (formData.timeLimit) {
        payload.timeLimit = parseInt(formData.timeLimit);
      }

      const res = await fetch("/api/tests/custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create test");
      }

      const data = await res.json();
      toast.success("Custom test created successfully!");
      router.push(`/app/tests/${data.testId}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to create test");
    } finally {
      setLoading(false);
    }
  };

  const toggleTopic = (topic: string) => {
    setFormData((prev) => ({
      ...prev,
      topics: prev.topics.includes(topic)
        ? prev.topics.filter((t) => t !== topic)
        : [...prev.topics, topic],
    }));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Custom Test Builder
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Create a personalized test with your preferred topics and difficulty
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Test Configuration</CardTitle>
            <CardDescription>
              Configure your custom test parameters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="exam">Exam Type *</Label>
                <Select
                  id="exam"
                  value={formData.exam}
                  onChange={(e) =>
                    setFormData({ ...formData, exam: e.target.value, topics: [], subject: "" })
                  }
                  required
                >
                  <option value="">Select Exam</option>
                  {EXAM_TYPES.map((exam) => (
                    <option key={exam} value={exam}>
                      {exam}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="questionCount">Number of Questions *</Label>
                  <Input
                    id="questionCount"
                    type="number"
                    min="5"
                    max="50"
                    value={formData.questionCount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        questionCount: parseInt(e.target.value) || 20,
                      })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select
                    id="difficulty"
                    value={formData.difficulty}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        difficulty: e.target.value as any,
                      })
                    }
                  >
                    <option value="mixed">Mixed</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </Select>
                </div>
              </div>

              {formData.exam && availableSubjects.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject (Optional)</Label>
                  <Select
                    id="subject"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                  >
                    <option value="">All Subjects</option>
                    {availableSubjects.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </Select>
                </div>
              )}

              {formData.exam && availableTopics.length > 0 && (
                <div className="space-y-2">
                  <Label>Select Topics (Optional)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-4 border rounded-lg max-h-60 overflow-y-auto">
                    {availableTopics.map((topic) => (
                      <div key={topic} className="flex items-center space-x-2">
                        <Checkbox
                          id={`topic-${topic}`}
                          checked={formData.topics.includes(topic)}
                          onCheckedChange={() => toggleTopic(topic)}
                        />
                        <Label
                          htmlFor={`topic-${topic}`}
                          className="text-sm cursor-pointer"
                        >
                          {topic}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {formData.topics.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {formData.topics.length} topic(s) selected
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="timeLimit">Time Limit (minutes, optional)</Label>
                <Input
                  id="timeLimit"
                  type="number"
                  min="5"
                  value={formData.timeLimit}
                  onChange={(e) =>
                    setFormData({ ...formData, timeLimit: e.target.value })
                  }
                  placeholder="e.g., 30"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Test...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Create Test
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
    </div>
  );
}

