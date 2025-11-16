"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { CreditCard, Save, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function PaymentConfigPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showKeySecret, setShowKeySecret] = useState(false);
  const [formData, setFormData] = useState({
    keyId: "",
    keySecret: "",
    environment: "test",
    isActive: true,
  });
  const [currentConfig, setCurrentConfig] = useState<any>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/payment-config");
      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          setCurrentConfig(data.config);
          setFormData({
            keyId: data.config.keyId,
            keySecret: "", // Don't populate secret for security
            environment: data.config.environment,
            isActive: data.config.isActive,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching payment config:", error);
      toast.error("Failed to load payment configuration");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (!formData.keyId || !formData.keySecret) {
        throw new Error("Key ID and Key Secret are required");
      }

      const res = await fetch("/api/admin/payment-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save configuration");
      }

      const data = await res.json();
      toast.success("Payment configuration saved successfully!");
      setCurrentConfig(data.config);
      setFormData({
        ...formData,
        keySecret: "", // Clear secret after saving
      });
      fetchConfig();
    } catch (error: any) {
      toast.error(error.message || "Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-8">Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Payment Gateway Configuration
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage Razorpay payment gateway credentials
          </p>
        </div>

        {/* Current Status */}
        {currentConfig && (
          <Card className={currentConfig.isActive ? "border-green-500" : "border-gray-300"}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {currentConfig.isActive ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-gray-400" />
                )}
                Current Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={currentConfig.isActive ? "text-green-600 font-semibold" : "text-gray-400"}>
                    {currentConfig.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Environment:</span>
                  <span className="font-semibold capitalize">{currentConfig.environment}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Key ID:</span>
                  <span className="font-mono text-xs">{currentConfig.keyId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated:</span>
                  <span>{new Date(currentConfig.updatedAt).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Configuration Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Razorpay Configuration
            </CardTitle>
            <CardDescription>
              Enter your Razorpay API credentials. Keys are encrypted and stored securely.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="keyId">Key ID *</Label>
                <Input
                  id="keyId"
                  type="text"
                  value={formData.keyId}
                  onChange={(e) =>
                    setFormData({ ...formData, keyId: e.target.value })
                  }
                  placeholder="rzp_test_..."
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Your Razorpay Key ID from the dashboard
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="keySecret">Key Secret *</Label>
                <div className="relative">
                  <Input
                    id="keySecret"
                    type={showKeySecret ? "text" : "password"}
                    value={formData.keySecret}
                    onChange={(e) =>
                      setFormData({ ...formData, keySecret: e.target.value })
                    }
                    placeholder="Enter key secret"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowKeySecret(!showKeySecret)}
                  >
                    {showKeySecret ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your Razorpay Key Secret (will be encrypted)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="environment">Environment</Label>
                  <Select
                    id="environment"
                    value={formData.environment}
                    onChange={(e) =>
                      setFormData({ ...formData, environment: e.target.value })
                    }
                  >
                    <option value="test">Test</option>
                    <option value="production">Production</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="isActive">Status</Label>
                  <Select
                    id="isActive"
                    value={formData.isActive ? "true" : "false"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isActive: e.target.value === "true",
                      })
                    }
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </Select>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Security Note:</strong> Your credentials are encrypted using AES-256-CBC
                  before being stored in the database. The key secret is never displayed after
                  saving.
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Configuration"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Get Razorpay Credentials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <ol className="list-decimal list-inside space-y-2">
              <li>Log in to your Razorpay Dashboard</li>
              <li>Navigate to Settings → API Keys</li>
              <li>Generate a new API key or use existing one</li>
              <li>Copy the Key ID and Key Secret</li>
              <li>Paste them in the form above</li>
            </ol>
            <p className="mt-4 text-xs text-muted-foreground">
              <strong>Test Mode:</strong> Use test credentials for development. Switch to
              production credentials when ready to accept real payments.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

