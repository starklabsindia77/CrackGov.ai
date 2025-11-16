"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Plus, RotateCcw, Check, X, Sparkles, BookOpen } from "lucide-react";
import { toast } from "sonner";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  topic?: string;
  exam?: string;
  tags: string[];
  difficulty: number;
  nextReview: string;
  reviewCount: number;
  correctCount: number;
}

export default function FlashcardsPage() {
  const router = useRouter();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [studyMode, setStudyMode] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [dueCards, setDueCards] = useState<Flashcard[]>([]);
  const [formData, setFormData] = useState({
    front: "",
    back: "",
    topic: "",
    exam: "",
    tags: "",
  });

  useEffect(() => {
    fetchFlashcards();
    fetchDueCards();
  }, []);

  const fetchFlashcards = async () => {
    try {
      const res = await fetch("/api/flashcards");
      if (res.ok) {
        const data = await res.json();
        setFlashcards(data.flashcards || []);
      }
    } catch (error) {
      console.error("Error fetching flashcards:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDueCards = async () => {
    try {
      const res = await fetch("/api/flashcards?dueOnly=true");
      if (res.ok) {
        const data = await res.json();
        setDueCards(data.flashcards || []);
      }
    } catch (error) {
      console.error("Error fetching due cards:", error);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()) : [],
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create flashcard");
      }

      toast.success("Flashcard created");
      setShowCreate(false);
      setFormData({ front: "", back: "", topic: "", exam: "", tags: "" });
      fetchFlashcards();
    } catch (error: any) {
      toast.error(error.message || "Failed to create flashcard");
    }
  };

  const handleReview = async (result: "correct" | "incorrect" | "hard") => {
    if (!dueCards[currentIndex]) return;

    try {
      const res = await fetch(
        `/api/flashcards/${dueCards[currentIndex].id}/review`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ result }),
        }
      );

      if (!res.ok) throw new Error("Failed to record review");

      // Move to next card
      if (currentIndex < dueCards.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setShowAnswer(false);
      } else {
        toast.success("All cards reviewed!");
        setStudyMode(false);
        fetchDueCards();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to record review");
    }
  };

  const handleGenerate = async () => {
    try {
      const res = await fetch("/api/flashcards/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: 10 }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate flashcards");
      }

      toast.success("Flashcards generated from your weak topics!");
      fetchFlashcards();
    } catch (error: any) {
      toast.error(error.message || "Failed to generate flashcards");
    }
  };

  if (studyMode && dueCards.length > 0) {
    const currentCard = dueCards[currentIndex];
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Card {currentIndex + 1} of {dueCards.length}
            </p>
          </div>

          <Card className="min-h-[400px] flex flex-col">
            <CardContent className="flex-1 flex items-center justify-center p-8">
              <div className="text-center space-y-4 w-full">
                <div className="text-2xl font-semibold mb-8">
                  {showAnswer ? currentCard.back : currentCard.front}
                </div>
                {!showAnswer && (
                  <Button onClick={() => setShowAnswer(true)} variant="outline">
                    Show Answer
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {showAnswer && (
            <div className="flex gap-4 justify-center">
              <Button
                variant="destructive"
                onClick={() => handleReview("incorrect")}
              >
                <X className="h-4 w-4 mr-2" />
                Incorrect
              </Button>
              <Button
                variant="outline"
                onClick={() => handleReview("hard")}
              >
                Hard
              </Button>
              <Button
                variant="default"
                onClick={() => handleReview("correct")}
              >
                <Check className="h-4 w-4 mr-2" />
                Correct
              </Button>
            </div>
          )}

          <Button
            variant="ghost"
            onClick={() => {
              setStudyMode(false);
              setCurrentIndex(0);
              setShowAnswer(false);
            }}
          >
            Exit Study Mode
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Flashcards
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Study with spaced repetition flashcards
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleGenerate}>
              <Sparkles className="h-4 w-4 mr-2" />
              Auto-Generate
            </Button>
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Card
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Total Cards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{flashcards.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Due for Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dueCards.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Mastery Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {flashcards.length > 0
                  ? Math.round(
                      (flashcards.reduce((sum, f) => sum + f.correctCount, 0) /
                        flashcards.reduce((sum, f) => sum + f.reviewCount, 1)) *
                        100
                    )
                  : 0}
                %
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Study Mode CTA */}
        {dueCards.length > 0 && (
          <Card className="border-primary">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Ready to Study</h3>
                  <p className="text-sm text-muted-foreground">
                    {dueCards.length} card(s) due for review
                  </p>
                </div>
                <Button onClick={() => setStudyMode(true)}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Start Study Session
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create Form */}
        {showCreate && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Flashcard</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="front">Front (Question) *</Label>
                  <Textarea
                    id="front"
                    value={formData.front}
                    onChange={(e) =>
                      setFormData({ ...formData, front: e.target.value })
                    }
                    required
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="back">Back (Answer) *</Label>
                  <Textarea
                    id="back"
                    value={formData.back}
                    onChange={(e) =>
                      setFormData({ ...formData, back: e.target.value })
                    }
                    required
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                  <div className="space-y-2">
                    <Label htmlFor="exam">Exam</Label>
                    <Input
                      id="exam"
                      value={formData.exam}
                      onChange={(e) =>
                        setFormData({ ...formData, exam: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) =>
                      setFormData({ ...formData, tags: e.target.value })
                    }
                    placeholder="tag1, tag2, tag3"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Create Flashcard</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreate(false);
                      setFormData({
                        front: "",
                        back: "",
                        topic: "",
                        exam: "",
                        tags: "",
                      });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Flashcards List */}
        <Card>
          <CardHeader>
            <CardTitle>All Flashcards</CardTitle>
            <CardDescription>
              {flashcards.length} total flashcard(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : flashcards.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No flashcards yet. Create your first one!
              </div>
            ) : (
              <div className="space-y-4">
                {flashcards.map((card) => (
                  <Card key={card.id} className="cursor-pointer hover:shadow-md">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {card.topic && (
                              <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800">
                                {card.topic}
                              </span>
                            )}
                            {card.exam && (
                              <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">
                                {card.exam}
                              </span>
                            )}
                          </div>
                          <p className="font-semibold mb-2">{card.front}</p>
                          <p className="text-sm text-muted-foreground">
                            {card.back.substring(0, 100)}
                            {card.back.length > 100 ? "..." : ""}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>
                              Reviews: {card.reviewCount} ({card.correctCount} correct)
                            </span>
                            <span>
                              Next review:{" "}
                              {new Date(card.nextReview).toLocaleDateString()}
                            </span>
                          </div>
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
    </AppLayout>
  );
}

