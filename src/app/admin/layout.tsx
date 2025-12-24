"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as LucideIcons from "lucide-react";

// Icon mapping for dynamic navigation
const iconMap: Record<string, any> = {
  LayoutDashboard: LucideIcons.LayoutDashboard,
  Users: LucideIcons.Users,
  Puzzle: LucideIcons.Puzzle,
  BarChart3: LucideIcons.BarChart3,
  BarChart: LucideIcons.BarChart,
  Database: LucideIcons.Database,
  Mail: LucideIcons.Mail,
  FileText: LucideIcons.FileText,
  Shield: LucideIcons.Shield,
  Activity: LucideIcons.Activity,
  CreditCard: LucideIcons.CreditCard,
  ChevronLeft: LucideIcons.ChevronLeft,
  ChevronRight: LucideIcons.ChevronRight,
  LogOut: LucideIcons.LogOut,
  Bell: LucideIcons.Bell,
  Menu: LucideIcons.Menu,
  X: LucideIcons.X,
  BookOpen: LucideIcons.BookOpen,
  Calendar: LucideIcons.Calendar,
  MessageCircle: LucideIcons.MessageCircle,
  Bookmark: LucideIcons.Bookmark,
  Target: LucideIcons.Target,
  Trophy: LucideIcons.Trophy,
  Zap: LucideIcons.Zap,
  Settings: LucideIcons.Settings,
  Search: LucideIcons.Search,
  Image: LucideIcons.Image,
  File: LucideIcons.File,
  Globe: LucideIcons.Globe,
  Eye: LucideIcons.Eye,
};

interface NavigationItem {
  label: string;
  href: string;
  icon?: string;
  order?: number;
}

// Fallback navigation (used while loading or on error)
const fallbackNavigation: NavigationItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "LayoutDashboard", order: 0 },
  { label: "Plugins", href: "/admin/plugins", icon: "Puzzle", order: 1 },
  { label: "Users", href: "/admin/users", icon: "Users", order: 100 },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navigation, setNavigation] = useState<NavigationItem[]>(fallbackNavigation);
  const [isLoadingNav, setIsLoadingNav] = useState(true);
  const pathname = usePathname();

  // Fetch dynamic navigation on mount
  useEffect(() => {
    const fetchNavigation = async () => {
      try {
        const response = await fetch("/api/admin/navigation");
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.navigation) {
            setNavigation(data.navigation);
          }
        }
      } catch (error) {
        console.error("Failed to fetch navigation:", error);
        // Keep using fallback navigation
      } finally {
        setIsLoadingNav(false);
      }
    };

    fetchNavigation();
  }, []);

  const currentPage = navigation.find((item) => item.href === pathname);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg border border-slate-200"
      >
        {mobileMenuOpen ? (
          <LucideIcons.X className="h-6 w-6 text-slate-600" />
        ) : (
          <LucideIcons.Menu className="h-6 w-6 text-slate-600" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen transition-all duration-300 ${sidebarOpen ? "w-64" : "w-20"
          } ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0`}
      >
        <div className="flex h-full flex-col bg-white shadow-xl border-r border-slate-200">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200">
            {sidebarOpen && (
              <Link
                href="/admin/dashboard"
                className="flex items-center space-x-2"
              >
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                  <LucideIcons.Shield className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Admin Panel
                </span>
              </Link>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:block rounded-lg p-2 hover:bg-slate-100 transition-colors"
            >
              {sidebarOpen ? (
                <LucideIcons.ChevronLeft className="h-5 w-5 text-slate-600" />
              ) : (
                <LucideIcons.ChevronRight className="h-5 w-5 text-slate-600" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const IconComponent = item.icon ? iconMap[item.icon] : null;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${isActive
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/50"
                      : "text-slate-700 hover:bg-slate-100"
                    }`}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  {IconComponent && <IconComponent className="h-5 w-5 flex-shrink-0" />}
                  {sidebarOpen && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="border-t border-slate-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold">
                A
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    Admin User
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    admin@crackgov.ai
                  </p>
                </div>
              )}
            </div>
            {sidebarOpen && (
              <button className="mt-3 w-full flex items-center justify-center space-x-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors">
                <LucideIcons.LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : "lg:ml-20"
          }`}
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-slate-200 shadow-sm">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="ml-12 lg:ml-0">
              <h1 className="text-2xl font-bold text-slate-900">
                {currentPage?.label || "Admin"}
              </h1>
              <p className="text-sm text-slate-500">
                Manage your CrackGov.ai platform
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative rounded-lg p-2 hover:bg-slate-100 transition-colors">
                <LucideIcons.Bell className="h-5 w-5 text-slate-600" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
              </button>
              <button className="hidden md:block rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/50">
                Quick Actions
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
