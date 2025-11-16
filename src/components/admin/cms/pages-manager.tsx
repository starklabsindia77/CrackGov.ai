"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { DndSortableList } from "./dnd-sortable-list";

interface Page {
  id: string;
  slug: string;
  title: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  published: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export function PagesManager() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Page | null>(null);
  const [formData, setFormData] = useState({
    slug: "",
    title: "",
    content: "",
    metaTitle: "",
    metaDescription: "",
    published: false,
  });

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const response = await fetch("/api/admin/cms/pages");
      if (!response.ok) throw new Error("Failed to fetch pages");
      const data = await response.json();
      setPages(data.pages || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to load pages");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editing
        ? `/api/admin/cms/pages/${editing.id}`
        : "/api/admin/cms/pages";
      const method = editing ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save page");
      }

      toast.success(editing ? "Page updated" : "Page created");
      setEditing(null);
      setFormData({
        slug: "",
        title: "",
        content: "",
        metaTitle: "",
        metaDescription: "",
        published: false,
      });
      fetchPages();
    } catch (error: any) {
      toast.error(error.message || "Failed to save page");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this page?")) return;

    try {
      const response = await fetch(`/api/admin/cms/pages/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete page");

      toast.success("Page deleted");
      fetchPages();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete page");
    }
  };

  const handleEdit = (page: Page) => {
    setEditing(page);
    setFormData({
      slug: page.slug,
      title: page.title,
      content: page.content,
      metaTitle: page.metaTitle || "",
      metaDescription: page.metaDescription || "",
      published: page.published,
    });
  };

  const handleReorder = async (newOrder: Page[]) => {
    try {
      // Optimistically update UI
      setPages(newOrder);

      // Update order in database
      const response = await fetch("/api/admin/cms/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "pages",
          items: newOrder.map((page, index) => ({
            id: page.id,
            order: index,
          })),
        }),
      });

      if (!response.ok) {
        // Revert on error
        fetchPages();
        throw new Error("Failed to reorder pages");
      }

      toast.success("Order updated");
    } catch (error: any) {
      toast.error(error.message || "Failed to reorder pages");
      fetchPages(); // Refresh to get correct order
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading pages...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editing ? "Edit Page" : "Create New Page"}</CardTitle>
          <CardDescription>
            {editing ? "Update page content" : "Add a new page to your website"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="home, about, terms"
                  required
                  disabled={!!editing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={10}
                required
                placeholder="HTML or Markdown content"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={formData.metaTitle}
                  onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Input
                  id="metaDescription"
                  value={formData.metaDescription}
                  onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
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
              <Button type="submit">{editing ? "Update" : "Create"} Page</Button>
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
          <CardTitle>All Pages</CardTitle>
          <CardDescription>
            Drag and drop to reorder pages. Order affects display sequence.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pages.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No pages yet</p>
          ) : (
            <DndSortableList
              items={pages.sort((a, b) => a.order - b.order)}
              onReorder={handleReorder}
              className="space-y-2"
              itemClassName="p-3 border rounded-lg bg-white dark:bg-gray-800"
              renderItem={(page) => (
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{page.title}</h3>
                      {page.published ? (
                        <Eye className="h-4 w-4 text-green-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">/{page.slug}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(page)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(page.id)}
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

