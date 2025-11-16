import { requireAdmin } from "@/lib/admin-auth";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Zap, Settings, Activity, Key } from "lucide-react";

export default async function AdminDashboardPage() {
  await requireAdmin();

  const [providers, features, healthStats] = await Promise.all([
    prisma.aiProvider.findMany({
      include: {
        _count: {
          select: { keys: true },
        },
      },
    }),
    prisma.aiFeatureConfig.findMany({
      include: {
        primaryProvider: true,
        secondaryProvider: true,
      },
    }),
    prisma.aiProviderKey.groupBy({
      by: ["status"],
      _count: true,
    }),
  ]);

  const totalKeys = healthStats.reduce((sum, stat) => sum + stat._count, 0);
  const healthyKeys =
    healthStats.find((s) => s.status === "healthy")?._count || 0;
  const failingKeys =
    healthStats.find((s) => s.status === "failing")?._count || 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Manage AI providers, keys, and feature configurations
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Providers</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{providers.length}</div>
              <p className="text-xs text-muted-foreground">
                {providers.filter((p) => p.status === "active").length} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">API Keys</CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalKeys}</div>
              <p className="text-xs text-muted-foreground">
                {healthyKeys} healthy, {failingKeys} failing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Features</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{features.length}</div>
              <p className="text-xs text-muted-foreground">
                Configured features
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Health</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalKeys > 0
                  ? Math.round((healthyKeys / totalKeys) * 100)
                  : 0}
                %
              </div>
              <p className="text-xs text-muted-foreground">System health</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common admin tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/admin/providers">
                <Button variant="outline" className="w-full justify-start">
                  <Zap className="h-4 w-4 mr-2" />
                  Manage AI Providers
                </Button>
              </Link>
              <Link href="/admin/features">
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure Features
                </Button>
              </Link>
              <Link href="/admin/health">
                <Button variant="outline" className="w-full justify-start">
                  <Activity className="h-4 w-4 mr-2" />
                  View System Health
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Providers</CardTitle>
              <CardDescription>Latest AI providers</CardDescription>
            </CardHeader>
            <CardContent>
              {providers.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No providers configured yet
                </p>
              ) : (
                <div className="space-y-2">
                  {providers.slice(0, 5).map((provider) => (
                    <div
                      key={provider.id}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded"
                    >
                      <div>
                        <p className="text-sm font-medium">{provider.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {provider.code} • {provider._count.keys} keys
                        </p>
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
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

