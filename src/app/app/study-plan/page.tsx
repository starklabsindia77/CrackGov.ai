"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Trash2, Calendar, Clock } from "lucide-react";
import { StudyPlanSkeleton } from "@/components/ui/loading-skeletons";
import { toast } from "sonner";

interface StudyPlanDay {
  day: number;
  week: number;
  topics: string[];
  tasks: string[];
  hours: number;
}

interface StudyPlan {
  weeks: {
    week: number;
    days: StudyPlanDay[];
  }[];
}

const EXAM_TYPES = ["SSC", "Banking", "Railways", "UPSC", "State PSC"];

interface SavedStudyPlan {
  id: string;
  exam: string;
  targetDate: string;
  hoursPerDay: number;
  weakTopics: string[];
  createdAt: string;
  updatedAt: string;
}

export default function StudyPlanPage() {
  const [exam, setExam] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [hoursPerDay, setHoursPerDay] = useState("");
  const [weakTopics, setWeakTopics] = useState("");
  const [loading, setLoading] = useState(false);
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [savedPlans, setSavedPlans] = useState<SavedStudyPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSavedPlans();
  }, []);

  const fetchSavedPlans = async () => {
    try {
      const response = await fetch("/api/study-plans");
      if (response.ok) {
        const data = await response.json();
        setSavedPlans(data.studyPlans || []);
      }
    } catch (err) {
      console.error("Error fetching saved plans:", err);
    } finally {
      setLoadingPlans(false);
    }
  };

  const handleLoadPlan = async (planId: string) => {
    try {
      const response = await fetch(`/api/study-plans/${planId}`);
      if (!response.ok) {
        throw new Error("Failed to load plan");
      }
      const data = await response.json();
      setStudyPlan(data.studyPlan.planData as StudyPlan);
      toast.success("Study plan loaded");
    } catch (err: any) {
      const errorMsg = err.message || "Failed to load plan";
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm("Are you sure you want to delete this study plan?")) return;

    try {
      const response = await fetch(`/api/study-plans/${planId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchSavedPlans();
        if (studyPlan) {
          setStudyPlan(null);
        }
        toast.success("Study plan deleted");
      } else {
        toast.error("Failed to delete study plan");
      }
    } catch (err) {
      console.error("Error deleting plan:", err);
      toast.error("Failed to delete study plan");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai/study-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exam,
          targetDate,
          hoursPerDay: parseInt(hoursPerDay),
          weakTopics: weakTopics.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate study plan");
      }

      const data = await response.json();
      setStudyPlan(data.plan);
      fetchSavedPlans(); // Refresh saved plans list
      toast.success("Study plan generated successfully!");
    } catch (err: any) {
      const errorMsg = err.message || "Something went wrong";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Study Plan</h1>
          <p className="mt-2 text-gray-600">
            Get a personalized study plan tailored to your exam and schedule
          </p>
        </div>

        {savedPlans.length > 0 && !studyPlan && (
          <Card>
            <CardHeader>
              <CardTitle>Saved Study Plans</CardTitle>
              <CardDescription>
                Your previously generated study plans
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingPlans ? (
                <div className="text-center py-4">Loading...</div>
              ) : (
                <div className="space-y-2">
                  {savedPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold">{plan.exam}</h3>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(plan.targetDate).toLocaleDateString()}
                          </span>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {plan.hoursPerDay} hrs/day
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Created: {new Date(plan.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleLoadPlan(plan.id)}
                        >
                          Load
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletePlan(plan.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {!studyPlan ? (
          <Card>
            <CardHeader>
              <CardTitle>Generate Your Study Plan</CardTitle>
              <CardDescription>
                Fill in the details below to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="exam">Exam Type</Label>
                  <Select
                    id="exam"
                    value={exam}
                    onChange={(e) => setExam(e.target.value)}
                    required
                  >
                    <option value="">Select an exam</option>
                    {EXAM_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetDate">Target Exam Date</Label>
                  <Input
                    id="targetDate"
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hoursPerDay">Hours Available Per Day</Label>
                  <Input
                    id="hoursPerDay"
                    type="number"
                    min="1"
                    max="12"
                    value={hoursPerDay}
                    onChange={(e) => setHoursPerDay(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weakTopics">
                    Weak Subjects/Topics (comma-separated)
                  </Label>
                  <Textarea
                    id="weakTopics"
                    placeholder="e.g., Mathematics, English Grammar, General Knowledge"
                    value={weakTopics}
                    onChange={(e) => setWeakTopics(e.target.value)}
                  />
                </div>

                {error && (
                  <div className="text-sm text-destructive">{error}</div>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Generating Plan..." : "Generate Study Plan"}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Your Study Plan</h2>
              <Button variant="outline" onClick={() => setStudyPlan(null)}>
                Generate New Plan
              </Button>
            </div>

            {studyPlan.weeks.map((week) => (
              <Card key={week.week}>
                <CardHeader>
                  <CardTitle>Week {week.week}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {week.days.map((day) => (
                      <div
                        key={day.day}
                        className="border-l-4 border-primary pl-4 py-2"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">Day {day.day}</h3>
                          <span className="text-sm text-muted-foreground">
                            {day.hours} hours
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              Topics:
                            </p>
                            <ul className="list-disc list-inside text-sm text-gray-600">
                              {day.topics.map((topic, idx) => (
                                <li key={idx}>{topic}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              Tasks:
                            </p>
                            <ul className="list-disc list-inside text-sm text-gray-600">
                              {day.tasks.map((task, idx) => (
                                <li key={idx}>{task}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
    </div>
  );
}

