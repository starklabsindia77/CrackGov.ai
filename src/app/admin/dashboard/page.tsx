"use client";

import { useEffect, useState } from "react";
import {
  Users,
  TrendingUp,
  Activity,
  DollarSign,
  ArrowUp,
  ArrowDown,
  Puzzle,
  FileText,
  MessageCircle,
  BookOpen,
  Zap,
  Target,
} from "lucide-react";

interface DashboardStats {
  totalUsers: number;
  activePlugins: number;
  totalTests: number;
  revenue: number;
}

interface PluginStat {
  name: string;
  usage: number;
  trend: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activePlugins: 0,
    totalTests: 0,
    revenue: 0,
  });

  const [pluginStats, setPluginStats] = useState<PluginStat[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    // Mock data - replace with actual API calls
    setStats({
      totalUsers: 14,
      activePlugins: 4,
      totalTests: 156,
      revenue: 45000,
    });

    setPluginStats([
      { name: "Study Plan", usage: 450, trend: "+12%" },
      { name: "Mock Test", usage: 380, trend: "+8%" },
      { name: "Doubt Chat", usage: 290, trend: "+15%" },
      { name: "Flashcard", usage: 210, trend: "+5%" },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Total Users"
          value={stats.totalUsers}
          change="+12.5%"
          trend="up"
          icon={Users}
          color="blue"
        />
        <DashboardCard
          title="Active Plugins"
          value={stats.activePlugins}
          change="+4"
          trend="up"
          icon={Puzzle}
          color="purple"
        />
        <DashboardCard
          title="Total Tests"
          value={stats.totalTests}
          change="+23.1%"
          trend="up"
          icon={FileText}
          color="pink"
        />
        <DashboardCard
          title="Revenue"
          value={`₹${stats.revenue.toLocaleString()}`}
          change="+18.2%"
          trend="up"
          icon={DollarSign}
          color="green"
        />
      </div>

      {/* Plugin Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Plugins */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Top Plugins by Usage
          </h3>
          <div className="space-y-4">
            {pluginStats.map((plugin, index) => (
              <div key={plugin.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{plugin.name}</p>
                    <p className="text-sm text-slate-500">{plugin.usage} uses</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-green-600">
                  {plugin.trend}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            System Overview
          </h3>
          <div className="space-y-4">
            <QuickStat
              label="Database Status"
              value="Healthy"
              icon={Activity}
              color="green"
            />
            <QuickStat
              label="API Response Time"
              value="45ms"
              icon={Zap}
              color="blue"
            />
            <QuickStat
              label="Cache Hit Rate"
              value="94.2%"
              icon={Target}
              color="purple"
            />
            <QuickStat
              label="Active Sessions"
              value="12"
              icon={Users}
              color="pink"
            />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Recent Activity
        </h3>
        <div className="space-y-4">
          <ActivityItem
            icon={Users}
            title="New user registered"
            description="pro1@example.com joined as Pro user"
            time="2 minutes ago"
            color="blue"
          />
          <ActivityItem
            icon={Puzzle}
            title="Plugin enabled"
            description="Mock Test plugin was enabled"
            time="15 minutes ago"
            color="green"
          />
          <ActivityItem
            icon={FileText}
            title="Test completed"
            description="User completed UPSC Mock Test #45"
            time="1 hour ago"
            color="purple"
          />
          <ActivityItem
            icon={MessageCircle}
            title="Doubt resolved"
            description="AI resolved a History doubt"
            time="2 hours ago"
            color="pink"
          />
        </div>
      </div>
    </div>
  );
}

interface DashboardCardProps {
  title: string;
  value: string | number;
  change: string;
  trend: "up" | "down";
  icon: React.ComponentType<{ className?: string }>;
  color: "blue" | "purple" | "pink" | "green";
}

function DashboardCard({ title, value, change, trend, icon: Icon, color }: DashboardCardProps) {
  const colors: Record<string, { bg: string; text: string; light: string }> = {
    blue: {
      bg: "from-blue-500 to-blue-600",
      text: "text-blue-600",
      light: "bg-blue-50",
    },
    purple: {
      bg: "from-purple-500 to-purple-600",
      text: "text-purple-600",
      light: "bg-purple-50",
    },
    pink: {
      bg: "from-pink-500 to-pink-600",
      text: "text-pink-600",
      light: "bg-pink-50",
    },
    green: {
      bg: "from-green-500 to-green-600",
      text: "text-green-600",
      light: "bg-green-50",
    },
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div
          className={`h-12 w-12 rounded-lg bg-gradient-to-br ${colors[color].bg} flex items-center justify-center`}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div
          className={`flex items-center space-x-1 text-sm font-medium ${trend === "up" ? "text-green-600" : "text-red-600"
            }`}
        >
          {trend === "up" ? (
            <ArrowUp className="h-4 w-4" />
          ) : (
            <ArrowDown className="h-4 w-4" />
          )}
          <span>{change}</span>
        </div>
      </div>
      <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

interface QuickStatProps {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: "blue" | "green" | "purple" | "pink";
}

function QuickStat({ label, value, icon: Icon, color }: QuickStatProps) {
  const colors: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    pink: "bg-pink-100 text-pink-600",
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
      <div className="flex items-center space-x-3">
        <div className={`h-10 w-10 rounded-lg ${colors[color]} flex items-center justify-center`}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-sm font-medium text-slate-700">{label}</span>
      </div>
      <span className="text-sm font-semibold text-slate-900">{value}</span>
    </div>
  );
}

interface ActivityItemProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  time: string;
  color: "blue" | "green" | "purple" | "pink";
}

function ActivityItem({ icon: Icon, title, description, time, color }: ActivityItemProps) {
  const colors: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    pink: "bg-pink-100 text-pink-600",
  };

  return (
    <div className="flex items-start space-x-4 p-4 rounded-lg hover:bg-slate-50 transition-colors">
      <div className={`h-10 w-10 rounded-lg ${colors[color]} flex items-center justify-center flex-shrink-0`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900">{title}</p>
        <p className="text-sm text-slate-600">{description}</p>
      </div>
      <span className="text-xs text-slate-500 flex-shrink-0">{time}</span>
    </div>
  );
}
