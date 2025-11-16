"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Plus, Edit, Trash2, Users, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface Segment {
  id: string;
  name: string;
  description?: string;
  criteria: any;
  userCount: number;
  createdAt: string;
}

export default function SegmentsPage() {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Segment | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    subscriptionStatus: "",
    role: "",
    emailVerified: "",
  });

  useEffect(() => {
    fetchSegments();
  }, []);

  const fetchSegments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/segments");
      if (res.ok) {
        const data = await res.json();
        setSegments(data.segments || []);
      }
    } catch (error) {
      console.error("Error fetching segments:", error);
      toast.error("Failed to load segments");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const criteria: any = {};
      if (formData.subscriptionStatus) {
        criteria.subscriptionStatus = formData.subscriptionStatus;
      }
      if (formData.role) {
        criteria.role = formData.role;
      }
      if (formData.emailVerified) {
        criteria.emailVerified = formData.emailVerified === "true";
      }

      const url = editing
        ? `/api/admin/segments/${editing.id}`
        : "/api/admin/segments";
      const method = editing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          criteria,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save segment");
      }

      toast.success(editing ? "Segment updated" : "Segment created");
      setShowCreate(false);
      setEditing(null);
      setFormData({
        name: "",
        description: "",
        subscriptionStatus: "",
        role: "",
        emailVerified: "",
      });
      fetchSegments();
    } catch (error: any) {
      toast.error(error.message || "Failed to save segment");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this segment?")) return;

    try {
      const res = await fetch(`/api/admin/segments/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete segment");

      toast.success("Segment deleted");
      fetchSegments();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete segment");
    }
  };

  const handlePopulate = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/segments/${id}/populate`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Failed to populate segment");

      const data = await res.json();
      toast.success(`Segment populated with ${data.userCount} users`);
      fetchSegments();
    } catch (error: any) {
      toast.error(error.message || "Failed to populate segment");
    }
  };

  const handleEdit = (segment: Segment) => {
    setEditing(segment);
    setFormData({
      name: segment.name,
      description: segment.description || "",
      subscriptionStatus: (segment.criteria as any)?.subscriptionStatus || "",
      role: (segment.criteria as any)?.role || "",
      emailVerified:
        (segment.criteria as any)?.emailVerified !== undefined
          ? String((segment.criteria as any).emailVerified)
          : "",
    });
    setShowCreate(true);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-8">Loading segments...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              User Segmentation
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Create and manage user segments for targeted actions
            </p>
          </div>
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Segment
          </Button>
        </div>

        {/* Create/Edit Form */}
        {showCreate && (
          <Card>
            <CardHeader>
              <CardTitle>{editing ? "Edit Segment" : "Create New Segment"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Segment Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subscriptionStatus">Subscription Status</Label>
                    <Select
                      id="subscriptionStatus"
                      value={formData.subscriptionStatus}
                      onChange={(e) =>
                        setFormData({ ...formData, subscriptionStatus: e.target.value })
                      }
                    >
                      <option value="">Any</option>
                      <option value="free">Free</option>
                      <option value="pro">Pro</option>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      id="role"
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                    >
                      <option value="">Any</option>
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emailVerified">Email Verified</Label>
                    <Select
                      id="emailVerified"
                      value={formData.emailVerified}
                      onChange={(e) =>
                        setFormData({ ...formData, emailVerified: e.target.value })
                      }
                    >
                      <option value="">Any</option>
                      <option value="true">Verified</option>
                      <option value="false">Not Verified</option>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">
                    {editing ? "Update" : "Create"} Segment
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreate(false);
                      setEditing(null);
                      setFormData({
                        name: "",
                        description: "",
                        subscriptionStatus: "",
                        role: "",
                        emailVerified: "",
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

        {/* Segments List */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {segments.map((segment) => (
            <Card key={segment.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{segment.name}</span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(segment)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(segment.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardTitle>
                {segment.description && (
                  <CardDescription>{segment.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Users</span>
                    <span className="font-semibold flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {segment.userCount}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <p>
                      <strong>Criteria:</strong>{" "}
                      {Object.entries(segment.criteria as any)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(", ") || "None"}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handlePopulate(segment.id)}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Users
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {segments.length === 0 && !showCreate && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No segments created yet</p>
                <Button
                  className="mt-4"
                  onClick={() => setShowCreate(true)}
                >
                  Create First Segment
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

