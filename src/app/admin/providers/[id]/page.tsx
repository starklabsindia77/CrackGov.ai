"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Plus, Key, Trash2, AlertCircle } from "lucide-react";

interface ProviderKey {
  id: string;
  label?: string;
  status: string;
  priority: number;
  lastUsedAt?: string;
  lastErrorAt?: string;
  failureCount: number;
}

interface Provider {
  id: string;
  name: string;
  code: string;
  status: string;
  defaultModel?: string;
  keys: ProviderKey[];
}

export default function ProviderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const providerId = params.id as string;

  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddKey, setShowAddKey] = useState(false);
  const [keyForm, setKeyForm] = useState({
    label: "",
    apiKey: "",
    priority: "0",
  });

  useEffect(() => {
    fetchProvider();
  }, [providerId]);

  const fetchProvider = async () => {
    try {
      const res = await fetch(`/api/admin/providers/${providerId}`);
      const data = await res.json();
      setProvider(data.provider);
    } catch (error) {
      console.error("Error fetching provider:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddKey = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/admin/providers/${providerId}/keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...keyForm,
          priority: parseInt(keyForm.priority),
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || "Failed to add key");
        return;
      }

      setShowAddKey(false);
      setKeyForm({ label: "", apiKey: "", priority: "0" });
      fetchProvider();
    } catch (error) {
      console.error("Error adding key:", error);
      alert("Failed to add key");
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    if (!confirm("Are you sure you want to delete this key?")) return;

    try {
      const res = await fetch(
        `/api/admin/providers/${providerId}/keys/${keyId}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        alert("Failed to delete key");
        return;
      }

      fetchProvider();
    } catch (error) {
      console.error("Error deleting key:", error);
      alert("Failed to delete key");
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div>Loading...</div>
      </AdminLayout>
    );
  }

  if (!provider) {
    return (
      <AdminLayout>
        <div>Provider not found</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Button variant="outline" onClick={() => router.back()}>
              ← Back
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 mt-4">
              {provider.name}
            </h1>
            <p className="mt-2 text-gray-600">{provider.code}</p>
          </div>
          <Button onClick={() => setShowAddKey(!showAddKey)}>
            <Plus className="h-4 w-4 mr-2" />
            Add API Key
          </Button>
        </div>

        {showAddKey && (
          <Card>
            <CardHeader>
              <CardTitle>Add API Key</CardTitle>
              <CardDescription>
                Add a new API key for {provider.name}. Maximum 10 keys per
                provider.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddKey} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="label">Label (Optional)</Label>
                  <Input
                    id="label"
                    value={keyForm.label}
                    onChange={(e) =>
                      setKeyForm({ ...keyForm, label: e.target.value })
                    }
                    placeholder="e.g., Production Key #1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={keyForm.apiKey}
                    onChange={(e) =>
                      setKeyForm({ ...keyForm, apiKey: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority (0-9, lower = higher priority)</Label>
                  <Input
                    id="priority"
                    type="number"
                    min="0"
                    max="9"
                    value={keyForm.priority}
                    onChange={(e) =>
                      setKeyForm({ ...keyForm, priority: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Add Key</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddKey(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>API Keys ({provider.keys.length}/10)</CardTitle>
            <CardDescription>
              Manage API keys for {provider.name}. Keys are encrypted at rest.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {provider.keys.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No keys configured. Add your first API key above.
              </div>
            ) : (
              <div className="space-y-4">
                {provider.keys.map((key) => (
                  <div
                    key={key.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {key.label || "Unnamed Key"}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            key.status === "healthy"
                              ? "bg-green-100 text-green-800"
                              : key.status === "failing"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {key.status}
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground space-y-1">
                        <p>Priority: {key.priority}</p>
                        {key.failureCount > 0 && (
                          <p className="flex items-center gap-1 text-red-600">
                            <AlertCircle className="h-3 w-3" />
                            Failures: {key.failureCount}
                          </p>
                        )}
                        {key.lastUsedAt && (
                          <p>Last used: {new Date(key.lastUsedAt).toLocaleString()}</p>
                        )}
                        {key.lastErrorAt && (
                          <p className="text-red-600">
                            Last error: {new Date(key.lastErrorAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteKey(key.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

