"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

interface Question {
  id: string;
  exam: string;
  subject?: string;
  topic?: string;
  question: string;
  options: string[];
  correctOption: string;
  explanation?: string;
  difficulty: string;
  source?: string;
  year?: number;
  tags: string[];
  usageCount: number;
}

export default function QuestionBankManagementPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Question | null>(null);
  const [filters, setFilters] = useState({
    exam: "",
    topic: "",
    difficulty: "",
    search: "",
  });
  const [formData, setFormData] = useState({
    exam: "",
    subject: "",
    topic: "",
    question: "",
    option1: "",
    option2: "",
    option3: "",
    option4: "",
    correctOption: "",
    explanation: "",
    difficulty: "medium",
    source: "",
    year: "",
    tags: "",
  });

  useEffect(() => {
    fetchQuestions();
  }, [filters]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...(filters.exam && { exam: filters.exam }),
        ...(filters.topic && { topic: filters.topic }),
        ...(filters.difficulty && { difficulty: filters.difficulty }),
      });
      const res = await fetch(`/api/admin/question-bank?${params}`);
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions || []);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const options = [
        formData.option1,
        formData.option2,
        formData.option3,
        formData.option4,
      ].filter(Boolean);

      if (options.length !== 4) {
        throw new Error("All 4 options are required");
      }

      const payload: any = {
        exam: formData.exam,
        question: formData.question,
        options,
        correctOption: formData.correctOption,
        difficulty: formData.difficulty,
      };

      if (formData.subject) payload.subject = formData.subject;
      if (formData.topic) payload.topic = formData.topic;
      if (formData.explanation) payload.explanation = formData.explanation;
      if (formData.source) payload.source = formData.source;
      if (formData.year) payload.year = parseInt(formData.year);
      if (formData.tags) {
        payload.tags = formData.tags.split(",").map((t) => t.trim());
      }

      const url = editing
        ? `/api/admin/question-bank/${editing.id}`
        : "/api/admin/question-bank";
      const method = editing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save question");
      }

      toast.success(editing ? "Question updated" : "Question created");
      setShowCreate(false);
      setEditing(null);
      resetForm();
      fetchQuestions();
    } catch (error: any) {
      toast.error(error.message || "Failed to save question");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    try {
      const res = await fetch(`/api/admin/question-bank/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete question");

      toast.success("Question deleted");
      fetchQuestions();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete question");
    }
  };

  const handleEdit = (question: Question) => {
    setEditing(question);
    const options = Array.isArray(question.options) ? question.options : [];
    setFormData({
      exam: question.exam,
      subject: question.subject || "",
      topic: question.topic || "",
      question: question.question,
      option1: options[0] || "",
      option2: options[1] || "",
      option3: options[2] || "",
      option4: options[3] || "",
      correctOption: question.correctOption,
      explanation: question.explanation || "",
      difficulty: question.difficulty,
      source: question.source || "",
      year: question.year?.toString() || "",
      tags: question.tags.join(", "),
    });
    setShowCreate(true);
  };

  const resetForm = () => {
    setFormData({
      exam: "",
      subject: "",
      topic: "",
      question: "",
      option1: "",
      option2: "",
      option3: "",
      option4: "",
      correctOption: "",
      explanation: "",
      difficulty: "medium",
      source: "",
      year: "",
      tags: "",
    });
  };

  const filteredQuestions = questions.filter((q) => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        q.question.toLowerCase().includes(searchLower) ||
        q.topic?.toLowerCase().includes(searchLower) ||
        q.subject?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Question Bank Management
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage the question bank library
            </p>
          </div>
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search questions..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  className="pl-10"
                />
              </div>
              <Select
                value={filters.exam}
                onChange={(e) =>
                  setFilters({ ...filters, exam: e.target.value })
                }
              >
                <option value="">All Exams</option>
                <option value="UPSC">UPSC</option>
                <option value="SSC">SSC</option>
                <option value="Banking">Banking</option>
                <option value="Railway">Railway</option>
              </Select>
              <Select
                value={filters.difficulty}
                onChange={(e) =>
                  setFilters({ ...filters, difficulty: e.target.value })
                }
              >
                <option value="">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </Select>
              <Input
                placeholder="Topic filter..."
                value={filters.topic}
                onChange={(e) =>
                  setFilters({ ...filters, topic: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Create/Edit Form */}
        {showCreate && (
          <Card>
            <CardHeader>
              <CardTitle>
                {editing ? "Edit Question" : "Create New Question"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="exam">Exam *</Label>
                    <Input
                      id="exam"
                      value={formData.exam}
                      onChange={(e) =>
                        setFormData({ ...formData, exam: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="topic">Topic</Label>
                    <Input
                      id="topic"
                      value={formData.topic}
                      onChange={(e) =>
                        setFormData({ ...formData, topic: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="question">Question *</Label>
                  <Textarea
                    id="question"
                    value={formData.question}
                    onChange={(e) =>
                      setFormData({ ...formData, question: e.target.value })
                    }
                    rows={3}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="option1">Option A *</Label>
                    <Input
                      id="option1"
                      value={formData.option1}
                      onChange={(e) =>
                        setFormData({ ...formData, option1: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="option2">Option B *</Label>
                    <Input
                      id="option2"
                      value={formData.option2}
                      onChange={(e) =>
                        setFormData({ ...formData, option2: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="option3">Option C *</Label>
                    <Input
                      id="option3"
                      value={formData.option3}
                      onChange={(e) =>
                        setFormData({ ...formData, option3: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="option4">Option D *</Label>
                    <Input
                      id="option4"
                      value={formData.option4}
                      onChange={(e) =>
                        setFormData({ ...formData, option4: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="correctOption">Correct Option *</Label>
                  <Input
                    id="correctOption"
                    value={formData.correctOption}
                    onChange={(e) =>
                      setFormData({ ...formData, correctOption: e.target.value })
                    }
                    placeholder="Must match one of the options exactly"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="explanation">Explanation</Label>
                  <Textarea
                    id="explanation"
                    value={formData.explanation}
                    onChange={(e) =>
                      setFormData({ ...formData, explanation: e.target.value })
                    }
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select
                      id="difficulty"
                      value={formData.difficulty}
                      onChange={(e) =>
                        setFormData({ ...formData, difficulty: e.target.value })
                      }
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="source">Source</Label>
                    <Input
                      id="source"
                      value={formData.source}
                      onChange={(e) =>
                        setFormData({ ...formData, source: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      type="number"
                      value={formData.year}
                      onChange={(e) =>
                        setFormData({ ...formData, year: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) =>
                        setFormData({ ...formData, tags: e.target.value })
                      }
                      placeholder="tag1, tag2"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">
                    {editing ? "Update" : "Create"} Question
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreate(false);
                      setEditing(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Questions List */}
        <Card>
          <CardHeader>
            <CardTitle>Questions ({filteredQuestions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading questions...</div>
            ) : filteredQuestions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No questions found
              </div>
            ) : (
              <div className="space-y-4">
                {filteredQuestions.map((question) => (
                  <Card key={question.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">
                              {question.exam}
                            </span>
                            {question.topic && (
                              <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800">
                                {question.topic}
                              </span>
                            )}
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                question.difficulty === "easy"
                                  ? "bg-green-100 text-green-800"
                                  : question.difficulty === "medium"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {question.difficulty}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Used {question.usageCount} times
                            </span>
                          </div>
                          <p className="font-semibold mb-2">{question.question}</p>
                          <div className="text-sm space-y-1">
                            {Array.isArray(question.options) &&
                              question.options.map((opt, idx) => (
                                <div key={idx} className="text-muted-foreground">
                                  {String.fromCharCode(65 + idx)}. {opt}
                                  {opt === question.correctOption && (
                                    <span className="ml-2 text-green-600 font-semibold">
                                      ✓ Correct
                                    </span>
                                  )}
                                </div>
                              ))}
                          </div>
                          {question.explanation && (
                            <p className="text-sm text-muted-foreground mt-2">
                              <strong>Explanation:</strong> {question.explanation}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(question)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(question.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

