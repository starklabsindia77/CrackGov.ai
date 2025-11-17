"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Settings,
  Key,
  Zap,
  Activity,
  LayoutDashboard,
  LogOut,
  FileText,
  BarChart3,
  Users,
  CreditCard,
  Shield,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/admin/analytics/revenue", label: "Revenue", icon: BarChart3 },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/segments", label: "Segments", icon: Users },
    { href: "/admin/question-bank", label: "Question Bank", icon: FileText },
    { href: "/admin/campaigns", label: "Campaigns", icon: FileText },
    { href: "/admin/payment-config", label: "Payment Config", icon: CreditCard },
    { href: "/admin/providers", label: "AI Providers", icon: Zap },
    { href: "/admin/features", label: "Features", icon: Settings },
    { href: "/admin/health", label: "Health", icon: Activity },
    { href: "/admin/cms", label: "CMS", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-bg-canvas flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-bg-card border-r border-borderSubtle transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-borderSubtle">
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary-teal" />
              <span className="text-display-h2 text-primary-teal font-semibold">
                Admin Panel
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-text-secondary hover:text-text-primary"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <div className="px-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-body-m font-medium transition-colors ${
                      isActive
                        ? "bg-primary-teal-light text-primary-teal"
                        : "text-text-secondary hover:text-text-primary hover:bg-bg-canvas"
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span>{item.label}</span>
                    {isActive && (
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-borderSubtle">
            <div className="px-3 py-2 mb-2">
              <p className="text-body-s text-text-primary font-medium truncate">
                {session?.user?.name || session?.user?.email}
              </p>
              <p className="text-body-s text-text-secondary">Administrator</p>
            </div>
            <Link href="/app/dashboard" className="block">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start border-borderSubtle text-text-secondary hover:text-primary-teal"
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                User View
              </Button>
            </Link>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-bg-card border-b border-borderSubtle sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-text-secondary hover:text-text-primary p-2"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex-1" />
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
                className="text-body-s text-text-secondary hover:text-text-primary"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

