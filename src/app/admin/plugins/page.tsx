"use client";

import { useEffect, useState } from "react";
import {
    Puzzle,
    Power,
    PowerOff,
    Trash2,
    RefreshCw,
    Search,
    Download,
    CheckCircle2,
    XCircle,
    Package,
} from "lucide-react";

interface Plugin {
    name: string;
    version: string;
    displayName: string;
    description: string;
    author: string;
    category: string;
    icon: string;
    status: string;
    enabled: boolean;
    installed: boolean;
    config: Record<string, any>;
    routes: any[];
    permissions: any[];
}

export default function PluginsPage() {
    const [plugins, setPlugins] = useState<Plugin[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        fetchPlugins();
    }, []);

    const fetchPlugins = async () => {
        try {
            const response = await fetch("/api/admin/plugins");
            const data = await response.json();
            if (data.success) {
                setPlugins(data.plugins);
            }
        } catch (error) {
            console.error("Failed to fetch plugins:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (pluginName: string, action: string) => {
        try {
            const response = await fetch(`/api/admin/plugins/${pluginName}/${action}`, {
                method: "POST",
            });
            const data = await response.json();
            if (data.success) {
                fetchPlugins();
            }
        } catch (error) {
            console.error(`Failed to ${action} plugin:`, error);
        }
    };

    const filteredPlugins = plugins.filter((plugin) => {
        const matchesSearch =
            plugin.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            plugin.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory =
            categoryFilter === "all" || plugin.category === categoryFilter;
        const matchesStatus =
            statusFilter === "all" ||
            (statusFilter === "enabled" && plugin.enabled) ||
            (statusFilter === "disabled" && !plugin.enabled) ||
            (statusFilter === "available" && !plugin.installed);
        return matchesSearch && matchesCategory && matchesStatus;
    });

    const categories = Array.from(new Set(plugins.map((p) => p.category)));
    const stats = {
        total: plugins.length,
        enabled: plugins.filter((p) => p.enabled).length,
        disabled: plugins.filter((p) => !p.enabled && p.installed).length,
        available: plugins.filter((p) => !p.installed).length,
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                    title="Total Plugins"
                    value={stats.total}
                    icon={Package}
                    color="blue"
                />
                <StatCard
                    title="Enabled"
                    value={stats.enabled}
                    icon={CheckCircle2}
                    color="green"
                />
                <StatCard
                    title="Disabled"
                    value={stats.disabled}
                    icon={XCircle}
                    color="orange"
                />
                <StatCard
                    title="Available"
                    value={stats.available}
                    icon={Download}
                    color="purple"
                />
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search plugins..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">All Categories</option>
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </option>
                        ))}
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">All Status</option>
                        <option value="enabled">Enabled</option>
                        <option value="disabled">Disabled</option>
                        <option value="available">Available</option>
                    </select>
                </div>
            </div>

            {/* Plugins Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredPlugins.map((plugin) => (
                    <PluginCard
                        key={plugin.name}
                        plugin={plugin}
                        onAction={handleAction}
                    />
                ))}
            </div>

            {filteredPlugins.length === 0 && (
                <div className="text-center py-12">
                    <Puzzle className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 text-lg">No plugins found</p>
                </div>
            )}
        </div>
    );
}

interface StatCardProps {
    title: string;
    value: number;
    icon: React.ComponentType<{ className?: string }>;
    color: "blue" | "green" | "orange" | "purple";
}

function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
    const colors: Record<string, string> = {
        blue: "from-blue-500 to-blue-600",
        green: "from-green-500 to-green-600",
        orange: "from-orange-500 to-orange-600",
        purple: "from-purple-500 to-purple-600",
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-600">{title}</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
                </div>
                <div
                    className={`h-12 w-12 rounded-lg bg-gradient-to-br ${colors[color]} flex items-center justify-center`}
                >
                    <Icon className="h-6 w-6 text-white" />
                </div>
            </div>
        </div>
    );
}

interface PluginCardProps {
    plugin: Plugin;
    onAction: (pluginName: string, action: string) => Promise<void>;
}

function PluginCard({ plugin, onAction }: PluginCardProps) {
    const statusColors: Record<string, string> = {
        enabled: "bg-green-100 text-green-800",
        disabled: "bg-orange-100 text-orange-800",
        available: "bg-blue-100 text-blue-800",
        error: "bg-red-100 text-red-800",
    };

    const getStatus = () => {
        if (plugin.status === "error") return "error";
        if (plugin.enabled) return "enabled";
        if (plugin.installed) return "disabled";
        return "available";
    };

    const status = getStatus();

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                        <Puzzle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900">{plugin.displayName}</h3>
                        <p className="text-sm text-slate-500">v{plugin.version}</p>
                    </div>
                </div>
                <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}
                >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
            </div>

            <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                {plugin.description}
            </p>

            <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                <span className="flex items-center space-x-1">
                    <span className="font-medium">Category:</span>
                    <span className="capitalize">{plugin.category}</span>
                </span>
                <span>{plugin.routes?.length || 0} routes</span>
            </div>

            <div className="flex items-center space-x-2">
                {!plugin.installed ? (
                    <button
                        onClick={() => onAction(plugin.name, "install")}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                        <Download className="h-4 w-4 inline mr-2" />
                        Install
                    </button>
                ) : plugin.enabled ? (
                    <>
                        <button
                            onClick={() => onAction(plugin.name, "disable")}
                            className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                        >
                            <PowerOff className="h-4 w-4 inline mr-2" />
                            Disable
                        </button>
                        <button
                            onClick={() => onAction(plugin.name, "reload")}
                            className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={() => onAction(plugin.name, "enable")}
                            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                            <Power className="h-4 w-4 inline mr-2" />
                            Enable
                        </button>
                        <button
                            onClick={() => onAction(plugin.name, "uninstall")}
                            className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
