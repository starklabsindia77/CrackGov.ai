"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { MessageCircle, Bot, User } from "lucide-react";
import { toast } from "sonner";

const EXAM_TYPES = ["SSC", "Banking", "Railways", "UPSC", "State PSC"];

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function DoubtsPage() {
  const [exam, setExam] = useState("");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !exam) {
      setError("Please select an exam and enter your question");
      return;
    }

    setError("");
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: question,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai/doubt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionText: userMessage.content, exam }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to get answer");
      }

      const data = await response.json();
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.answer,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMsg = err.message || "Something went wrong";
      setError(errorMsg);
      toast.error(errorMsg);
      // Remove the user message if there was an error
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ask a Doubt</h1>
          <p className="mt-2 text-gray-600">
            Get instant, step-by-step answers from our AI tutor
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Chat
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-12">
                      Start a conversation by asking a question below
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${
                          message.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        {message.role === "assistant" && (
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Bot className="h-4 w-4 text-primary" />
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">
                            {message.content}
                          </p>
                        </div>
                        {message.role === "user" && (
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                            <User className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    ))
                  )}
                  {loading && (
                    <div className="flex gap-3 justify-start">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                      <div className="bg-muted rounded-lg p-3">
                        <p className="text-sm text-muted-foreground">
                          Thinking...
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-2">
                  <div className="flex gap-2">
                    <Select
                      value={exam}
                      onChange={(e) => setExam(e.target.value)}
                      className="w-40"
                    >
                      <option value="">Select exam</option>
                      {EXAM_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </Select>
                    <Textarea
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Ask your doubt here..."
                      className="flex-1 min-h-[60px]"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmit(e);
                        }
                      }}
                    />
                    <Button type="submit" disabled={loading || !question.trim() || !exam}>
                      Ask
                    </Button>
                  </div>
                  {error && (
                    <div className="text-sm text-destructive">{error}</div>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• Be specific with your questions</p>
                <p>• Ask about concepts, formulas, or problem-solving</p>
                <p>• The AI will provide step-by-step explanations</p>
                <p>• Select the relevant exam for better context</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

