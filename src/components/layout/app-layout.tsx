"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { OnboardingTour } from "@/components/onboarding/onboarding-tour";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (session?.user && pathname === "/app/dashboard") {
      checkOnboardingStatus();
    }
  }, [session, pathname]);

  const checkOnboardingStatus = async () => {
    try {
      const response = await fetch("/api/user/onboarding-status");
      if (response.ok) {
        const data = await response.json();
        if (!data.onboardingCompleted) {
          setShowOnboarding(true);
        }
      }
    } catch (error) {
      console.error("Error checking onboarding status:", error);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  const navItems = [
    { href: "/app/dashboard", label: "Dashboard" },
    { href: "/app/study-plan", label: "Study Plan" },
    { href: "/app/tests", label: "Mock Tests" },
    { href: "/app/question-bank", label: "Question Bank" },
    { href: "/app/flashcards", label: "Flashcards" },
    { href: "/app/study-groups", label: "Study Groups" },
    { href: "/app/test-history", label: "Test History" },
    { href: "/app/analytics", label: "Analytics" },
    { href: "/app/leaderboard", label: "Leaderboard" },
    { href: "/app/doubts", label: "Ask Doubts" },
    { href: "/faq", label: "FAQ" },
  ];

  return (
    <div className="min-h-screen bg-bg-canvas overflow-x-hidden">
      <nav className="bg-bg-card border-b border-borderSubtle sticky top-0 z-50 backdrop-blur-sm bg-bg-card/95 shadow-sm">
        <div className="w-full">
          <div className="flex items-center h-16 gap-4">
            {/* Logo */}
            <div className="flex-shrink-0 px-4 sm:px-6">
              <Link href="/app/dashboard" className="text-display-h2 text-primary-teal font-semibold whitespace-nowrap">
                CrackGov.ai
              </Link>
            </div>

            {/* Desktop Navigation - Horizontally Scrollable */}
            <div className="hidden md:flex flex-1 items-center min-w-0">
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide px-2 flex-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {navItems.map((item) => {
                  const isActive = pathname === item.href || 
                    (item.href === "/faq" && pathname?.startsWith("/faq")) ||
                    (item.href === "/app/doubts" && pathname?.startsWith("/app/doubts"));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`inline-flex items-center px-3 py-2 rounded-lg text-body-s font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                        isActive
                          ? "bg-primary-teal-light text-primary-teal"
                          : "text-text-secondary hover:text-text-primary hover:bg-bg-canvas"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right side actions - Always visible */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 px-4 sm:px-6">
              <NotificationBell />
              <Link href="/app/profile" className="hidden lg:block">
                <span className="text-body-s text-text-primary hover:text-primary-teal cursor-pointer transition-colors truncate max-w-[150px]">
                  {session?.user?.name || session?.user?.email}
                </span>
              </Link>
              {session?.user?.subscriptionStatus === "free" && (
                <Link href="/app/upgrade" className="hidden xl:block">
                  <Button variant="outline" size="sm" className="border-primary-teal text-primary-teal hover:bg-primary-teal hover:text-white whitespace-nowrap">
                    Upgrade to Pro
                  </Button>
                </Link>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => signOut()} 
                className="text-text-secondary hover:text-text-primary whitespace-nowrap"
              >
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">Out</span>
              </Button>
              
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-text-secondary hover:text-text-primary p-2"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-borderSubtle py-4 px-4">
              <div className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-2 rounded-lg text-body-m font-medium transition-colors ${
                      pathname === item.href
                        ? "bg-primary-teal-light text-primary-teal"
                        : "text-text-secondary hover:text-text-primary hover:bg-bg-canvas"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="pt-2 border-t border-borderSubtle mt-2">
                  <Link 
                    href="/app/profile" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 text-body-s text-text-primary"
                  >
                    Profile
                  </Link>
                  {session?.user?.subscriptionStatus === "free" && (
                    <Link 
                      href="/app/upgrade" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-2"
                    >
                      <Button variant="outline" size="sm" className="w-full border-primary-teal text-primary-teal hover:bg-primary-teal hover:text-white">
                        Upgrade to Pro
                      </Button>
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut();
                    }}
                    className="w-full text-left px-4 py-2 text-body-s text-text-secondary hover:text-text-primary"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-x-hidden">
        {children}
        {showOnboarding && (
          <OnboardingTour onComplete={handleOnboardingComplete} />
        )}
      </main>
    </div>
  );
}

