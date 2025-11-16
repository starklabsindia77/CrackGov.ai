"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, AlertCircle, CheckCircle, XCircle } from "lucide-react";

interface HealthData {
  providerId: string;
  providerCode: string;
  providerName: string;
  status: string;
  totalKeys: number;
  healthyKeys: number;
  failingKeys: number;
  disabledKeys: number;
  keys: Array<{
    id: string;
    status: string;
    failureCount: number;
    lastUsedAt?: string;
    lastErrorAt?: string;
  }>;
}

export default function HealthPage() {
  const [health, setHealth] = useState<HealthData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHealth();
    // Refresh every 30 seconds
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchHealth = async () => {
    try {
      const res = await fetch("/api/admin/health");
      const data = await res.json();
      setHealth(data.health || []);
    } catch (error) {
      console.error("Error fetching health:", error);
    } finally {
      setLoading(false);
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Health</h1>
          <p className="mt-2 text-gray-600">
            Monitor AI provider and API key health status
          </p>
        </div>

        <div className="grid gap-6">
          {health.map((provider) => {
            const healthPercentage =
              provider.totalKeys > 0
                ? Math.round(
                    (provider.healthyKeys / provider.totalKeys) * 100
                  )
                : 0;

            return (
              <Card key={provider.providerId}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>{provider.providerName}</CardTitle>
                      <CardDescription>{provider.providerCode}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {provider.status === "active" ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-gray-400" />
                      )}
                      <span className="text-sm font-medium">
                        {healthPercentage}% healthy
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Keys</p>
                        <p className="text-2xl font-bold">
                          {provider.totalKeys}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Healthy</p>
                        <p className="text-2xl font-bold text-green-600">
                          {provider.healthyKeys}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Failing</p>
                        <p className="text-2xl font-bold text-red-600">
                          {provider.failingKeys}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Disabled</p>
                        <p className="text-2xl font-bold text-gray-600">
                          {provider.disabledKeys}
                        </p>
                      </div>
                    </div>

                    {provider.keys.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Key Details</p>
                        <div className="space-y-2">
                          {provider.keys.map((key) => (
                            <div
                              key={key.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded"
                            >
                              <div className="flex items-center gap-3">
                                {key.status === "healthy" ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : key.status === "failing" ? (
                                  <AlertCircle className="h-4 w-4 text-red-500" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-gray-400" />
                                )}
                                <span className="text-sm font-medium">
                                  {key.status}
                                </span>
                                {key.failureCount > 0 && (
                                  <span className="text-xs text-red-600">
                                    {key.failureCount} failures
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {key.lastUsedAt && (
                                  <p>
                                    Last used:{" "}
                                    {new Date(key.lastUsedAt).toLocaleString()}
                                  </p>
                                )}
                                {key.lastErrorAt && (
                                  <p className="text-red-600">
                                    Last error:{" "}
                                    {new Date(key.lastErrorAt).toLocaleString()}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {health.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No providers configured. Configure providers to see health status.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}

