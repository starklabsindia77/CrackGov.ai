"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const EXAM_TYPES = ["SSC", "Banking", "Railways", "UPSC", "State PSC"];

export default function TestsPage() {
  const router = useRouter();
  const [exam, setExam] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!exam) {
      setError("Please select an exam type");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/tests/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exam }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate test");
      }

      const data = await response.json();
      router.push(`/app/tests/${data.testId}`);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mock Tests</h1>
          <p className="mt-2 text-gray-600">
            Practice with AI-generated mock tests tailored to your exam
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Generate New Mock Test</CardTitle>
            <CardDescription>
              Create a 20-question mock test for your selected exam
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="exam">Exam Type</Label>
              <Select
                id="exam"
                value={exam}
                onChange={(e) => setExam(e.target.value)}
              >
                <option value="">Select an exam</option>
                {EXAM_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
            </div>

            {error && (
              <div className="text-sm text-destructive">{error}</div>
            )}

            <Button
              onClick={handleGenerate}
              disabled={loading || !exam}
              className="w-full"
            >
              {loading ? "Generating Test..." : "Generate 20-Question Test"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

