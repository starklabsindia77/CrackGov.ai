"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import Link from "next/link";
import { Plus, Key, Edit, Trash2 } from "lucide-react";

interface Provider {
  id: string;
  name: string;
  code: string;
  status: string;
  defaultModel?: string;
  _count: { keys: number };
}

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    status: "active",
    defaultModel: "",
  });

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const res = await fetch("/api/admin/providers");
      const data = await res.json();
      setProviders(data.providers || []);
    } catch (error) {
      console.error("Error fetching providers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          code: formData.code.toUpperCase(),
          defaultModel: formData.defaultModel || undefined,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || "Failed to create provider");
        return;
      }

      setShowCreate(false);
      setFormData({ name: "", code: "", status: "active", defaultModel: "" });
      fetchProviders();
    } catch (error) {
      console.error("Error creating provider:", error);
      alert("Failed to create provider");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this provider?")) return;

    try {
      const res = await fetch(`/api/admin/providers/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        alert("Failed to delete provider");
        return;
      }

      fetchProviders();
    } catch (error) {
      console.error("Error deleting provider:", error);
      alert("Failed to delete provider");
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div>Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Providers</h1>
            <p className="mt-2 text-gray-600">
              Manage AI provider configurations
            </p>
          </div>
          <Button onClick={() => setShowCreate(!showCreate)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Provider
          </Button>
        </div>

        {showCreate && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Provider</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Provider Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., OpenAI"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Provider Code</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="e.g., OPENAI"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    id="status"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultModel">Default Model (Optional)</Label>
                  <Input
                    id="defaultModel"
                    value={formData.defaultModel}
                    onChange={(e) =>
                      setFormData({ ...formData, defaultModel: e.target.value })
                    }
                    placeholder="e.g., gpt-4o-mini"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Create</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreate(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {providers.map((provider) => (
            <Card key={provider.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{provider.name}</CardTitle>
                    <CardDescription>{provider.code}</CardDescription>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      provider.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {provider.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {provider.defaultModel && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Default Model:
                    </p>
                    <p className="text-sm font-medium">
                      {provider.defaultModel}
                    </p>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Key className="h-4 w-4" />
                    {provider._count.keys} keys
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/admin/providers/${provider.id}`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(provider.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {providers.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No providers configured yet. Create one to get started.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}

