"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { DollarSign, TrendingUp, Users, Percent, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface RevenueData {
  overview: {
    mrr: number;
    arr: number;
    proUsers: number;
    freeUsers: number;
    totalUsers: number;
    conversionRate: number;
    churnRate: number;
    ltv: number;
    newProUsers: number;
  };
  trends: {
    dailyRevenue: Array<{
      date: string;
      newSubscribers: number;
      revenue: number;
    }>;
  };
  cohorts: Array<{
    date: string;
    users: number;
    revenue: number;
  }>;
}

export default function RevenueAnalyticsPage() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30");

  useEffect(() => {
    fetchRevenue();
  }, [period]);

  const fetchRevenue = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/analytics/revenue?period=${period}`);
      if (response.ok) {
        const revenueData = await response.json();
        setData(revenueData);
      }
    } catch (error) {
      console.error("Error fetching revenue analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!data) {
    return (
      <AdminLayout>
        <div className="text-center py-12">Failed to load revenue analytics</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Revenue Analytics
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Revenue metrics and subscription insights
            </p>
          </div>
          <div className="w-48">
            <Select value={period} onChange={(e) => setPeriod(e.target.value)}>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </Select>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Recurring Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{data.overview.mrr.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {data.overview.proUsers} Pro subscribers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Annual Recurring Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{data.overview.arr.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Projected annual revenue
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.overview.conversionRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {data.overview.proUsers} Pro / {data.overview.totalUsers} Total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customer LTV</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{data.overview.ltv.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Estimated lifetime value
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Pro Users</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${(data.overview.proUsers / data.overview.totalUsers) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="font-semibold">{data.overview.proUsers}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Free Users</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gray-400 h-2 rounded-full"
                        style={{
                          width: `${(data.overview.freeUsers / data.overview.totalUsers) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="font-semibold">{data.overview.freeUsers}</span>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Users</span>
                    <span className="font-bold text-lg">{data.overview.totalUsers}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>New Pro Subscribers</span>
                  <span className="font-semibold text-green-600">
                    +{data.overview.newProUsers}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Churn Rate</span>
                  <span className="font-semibold text-red-600">
                    {data.overview.churnRate.toFixed(1)}%
                  </span>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Net growth: {data.overview.newProUsers - (data.overview.churnRate * data.overview.proUsers / 100).toFixed(0)} subscribers
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Revenue Trend */}
        {data.trends.dailyRevenue.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>7-Day Revenue Trend</CardTitle>
              <CardDescription>Daily new subscribers and revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.trends.dailyRevenue.map((day) => (
                  <div
                    key={day.date}
                    className="flex justify-between items-center p-2 border rounded"
                  >
                    <span className="text-sm">
                      {new Date(day.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        {day.newSubscribers} new
                      </span>
                      <span className="font-semibold">
                        ₹{day.revenue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}

