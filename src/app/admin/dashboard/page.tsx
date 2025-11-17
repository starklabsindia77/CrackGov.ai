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
          <h1 className="text-display-h1 text-text-primary">Admin Dashboard</h1>
          <p className="mt-2 text-body-m text-text-secondary">
            Manage AI providers, keys, and feature configurations
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Card className="border border-borderSubtle bg-bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-body-s text-text-primary font-medium">Providers</CardTitle>
              <Zap className="h-4 w-4 text-primary-teal" />
            </CardHeader>
            <CardContent>
              <div className="text-display-h2 text-text-primary">{providers.length}</div>
              <p className="text-body-s text-text-secondary mt-1">
                {providers.filter((p) => p.status === "active").length} active
              </p>
            </CardContent>
          </Card>

          <Card className="border border-borderSubtle bg-bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-body-s text-text-primary font-medium">API Keys</CardTitle>
              <Key className="h-4 w-4 text-primary-teal" />
            </CardHeader>
            <CardContent>
              <div className="text-display-h2 text-text-primary">{totalKeys}</div>
              <p className="text-body-s text-text-secondary mt-1">
                {healthyKeys} healthy, {failingKeys} failing
              </p>
            </CardContent>
          </Card>

          <Card className="border border-borderSubtle bg-bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-body-s text-text-primary font-medium">Features</CardTitle>
              <Settings className="h-4 w-4 text-primary-teal" />
            </CardHeader>
            <CardContent>
              <div className="text-display-h2 text-text-primary">{features.length}</div>
              <p className="text-body-s text-text-secondary mt-1">
                Configured features
              </p>
            </CardContent>
          </Card>

          <Card className="border border-borderSubtle bg-bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-body-s text-text-primary font-medium">Health</CardTitle>
              <Activity className="h-4 w-4 text-primary-teal" />
            </CardHeader>
            <CardContent>
              <div className="text-display-h2 text-text-primary">
                {totalKeys > 0
                  ? Math.round((healthyKeys / totalKeys) * 100)
                  : 0}
                %
              </div>
              <p className="text-body-s text-text-secondary mt-1">System health</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border border-borderSubtle bg-bg-card">
            <CardHeader>
              <CardTitle className="text-heading-h3 text-text-primary">Quick Actions</CardTitle>
              <CardDescription className="text-body-s text-text-secondary">Common admin tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/admin/providers">
                <Button variant="outline" className="w-full justify-start border-borderSubtle text-text-primary hover:bg-bg-canvas">
                  <Zap className="h-4 w-4 mr-2" />
                  Manage AI Providers
                </Button>
              </Link>
              <Link href="/admin/features">
                <Button variant="outline" className="w-full justify-start border-borderSubtle text-text-primary hover:bg-bg-canvas">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure Features
                </Button>
              </Link>
              <Link href="/admin/health">
                <Button variant="outline" className="w-full justify-start border-borderSubtle text-text-primary hover:bg-bg-canvas">
                  <Activity className="h-4 w-4 mr-2" />
                  View System Health
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border border-borderSubtle bg-bg-card">
            <CardHeader>
              <CardTitle className="text-heading-h3 text-text-primary">Recent Providers</CardTitle>
              <CardDescription className="text-body-s text-text-secondary">Latest AI providers</CardDescription>
            </CardHeader>
            <CardContent>
              {providers.length === 0 ? (
                <p className="text-body-s text-text-secondary">
                  No providers configured yet
                </p>
              ) : (
                <div className="space-y-2">
                  {providers.slice(0, 5).map((provider) => (
                    <div
                      key={provider.id}
                      className="flex justify-between items-center p-3 bg-bg-canvas rounded-lg border border-borderSubtle"
                    >
                      <div>
                        <p className="text-body-s text-text-primary font-medium">{provider.name}</p>
                        <p className="text-body-s text-text-secondary">
                          {provider.code} • {provider._count.keys} keys
                        </p>
                      </div>
                      <span
                        className={`text-label-xs px-2 py-1 rounded-full font-medium ${
                          provider.status === "active"
                            ? "bg-state-success text-white"
                            : "bg-text-secondary text-white"
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

