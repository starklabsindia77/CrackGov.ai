"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { DndSortableList } from "./dnd-sortable-list";

interface Faq {
  id: string;
  question: string;
  answer: string;
  category?: string;
  order: number;
  published: boolean;
}

export function FaqsManager() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Faq | null>(null);
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "",
    order: 0,
    published: true,
  });

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const response = await fetch("/api/admin/cms/faqs");
      if (!response.ok) throw new Error("Failed to fetch FAQs");
      const data = await response.json();
      setFaqs(data.faqs || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to load FAQs");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editing
        ? `/api/admin/cms/faqs/${editing.id}`
        : "/api/admin/cms/faqs";
      const method = editing ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save FAQ");
      }

      toast.success(editing ? "FAQ updated" : "FAQ created");
      setEditing(null);
      setFormData({
        question: "",
        answer: "",
        category: "",
        order: 0,
        published: true,
      });
      fetchFaqs();
    } catch (error: any) {
      toast.error(error.message || "Failed to save FAQ");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;

    try {
      const response = await fetch(`/api/admin/cms/faqs/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete FAQ");

      toast.success("FAQ deleted");
      fetchFaqs();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete FAQ");
    }
  };

  const handleEdit = (faq: Faq) => {
    setEditing(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || "",
      order: faq.order,
      published: faq.published,
    });
  };

  const handleReorder = async (newOrder: Faq[]) => {
    try {
      // Optimistically update UI
      setFaqs(newOrder);

      // Update order in database
      const response = await fetch("/api/admin/cms/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "faqs",
          items: newOrder.map((faq, index) => ({
            id: faq.id,
            order: index,
          })),
        }),
      });

      if (!response.ok) {
        // Revert on error
        fetchFaqs();
        throw new Error("Failed to reorder FAQs");
      }

      toast.success("Order updated");
    } catch (error: any) {
      toast.error(error.message || "Failed to reorder FAQs");
      fetchFaqs(); // Refresh to get correct order
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading FAQs...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editing ? "Edit FAQ" : "Create New FAQ"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="question">Question *</Label>
              <Input
                id="question"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="answer">Answer *</Label>
              <Textarea
                id="answer"
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                rows={6}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="general, subscription, technical"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="order">Order</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="published"
                checked={formData.published}
                onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="published">Published</Label>
            </div>
            <div className="flex gap-2">
              <Button type="submit">{editing ? "Update" : "Create"} FAQ</Button>
              {editing && (
                <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All FAQs</CardTitle>
          <CardDescription>
            Drag and drop to reorder FAQs. Order affects display sequence.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {faqs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No FAQs yet</p>
          ) : (
            <DndSortableList
              items={faqs.sort((a, b) => a.order - b.order)}
              onReorder={handleReorder}
              className="space-y-2"
              itemClassName="p-3 border rounded-lg bg-white dark:bg-gray-800"
              renderItem={(faq) => (
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{faq.question}</h3>
                      {faq.published ? (
                        <Eye className="h-4 w-4 text-green-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    {faq.category && (
                      <span className="text-xs text-muted-foreground">{faq.category}</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(faq)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(faq.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

