"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Search, BookOpen, Filter, Play } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

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

export default function QuestionBankPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    exam: "",
    topic: "",
    difficulty: "",
    subject: "",
    search: "",
  });
  const [availableFilters, setAvailableFilters] = useState({
    exams: [] as string[],
    topics: [] as string[],
    subjects: [] as string[],
    difficulties: [] as string[],
  });

  useEffect(() => {
    fetchQuestions();
  }, [page, filters]);

  useEffect(() => {
    // Fetch available filters on mount
    fetchQuestions(true);
  }, []);

  const fetchQuestions = async (fetchFiltersOnly = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(filters.exam && { exam: filters.exam }),
        ...(filters.topic && { topic: filters.topic }),
        ...(filters.difficulty && { difficulty: filters.difficulty }),
        ...(filters.subject && { subject: filters.subject }),
        ...(filters.search && { search: filters.search }),
      });

      const res = await fetch(`/api/question-bank?${params}`);
      if (res.ok) {
        const data = await res.json();
        if (!fetchFiltersOnly) {
          setQuestions(data.questions || []);
          setTotalPages(data.pagination?.totalPages || 1);
        }
        if (data.filters) {
          setAvailableFilters(data.filters);
        }
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
    setPage(1);
  };

  return (
    <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Question Bank
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Browse and practice from our extensive question library
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search questions..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={filters.exam}
                onChange={(e) => handleFilterChange("exam", e.target.value)}
              >
                <option value="">All Exams</option>
                {availableFilters.exams.map((exam) => (
                  <option key={exam} value={exam}>
                    {exam}
                  </option>
                ))}
              </Select>
              <Select
                value={filters.topic}
                onChange={(e) => handleFilterChange("topic", e.target.value)}
              >
                <option value="">All Topics</option>
                {availableFilters.topics.map((topic) => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                ))}
              </Select>
              <Select
                value={filters.difficulty}
                onChange={(e) => handleFilterChange("difficulty", e.target.value)}
              >
                <option value="">All Difficulties</option>
                {availableFilters.difficulties.map((diff) => (
                  <option key={diff} value={diff}>
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </option>
                ))}
              </Select>
              <Select
                value={filters.subject}
                onChange={(e) => handleFilterChange("subject", e.target.value)}
              >
                <option value="">All Subjects</option>
                {availableFilters.subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Questions List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">Loading questions...</div>
          ) : questions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No questions found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try adjusting your filters
                </p>
              </CardContent>
            </Card>
          ) : (
            questions.map((question) => (
              <Card key={question.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
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
                      </div>
                      <h3 className="font-semibold mb-2">{question.question}</h3>
                      <div className="space-y-1 mb-3">
                        {Array.isArray(question.options) &&
                          question.options.map((option, idx) => (
                            <div
                              key={idx}
                              className="text-sm text-muted-foreground pl-4"
                            >
                              {String.fromCharCode(65 + idx)}. {option}
                            </div>
                          ))}
                      </div>
                      {question.explanation && (
                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                          <p className="text-sm">
                            <strong>Explanation:</strong> {question.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <span className="flex items-center px-4 text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        )}

        {/* Create Custom Test CTA */}
        <Card className="border-primary">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Create Custom Test</h3>
                <p className="text-sm text-muted-foreground">
                  Build a personalized test from selected questions
                </p>
              </div>
              <Link href="/app/tests/custom">
                <Button>
                  <Play className="h-4 w-4 mr-2" />
                  Build Test
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}

