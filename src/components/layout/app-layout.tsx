"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { OnboardingTour } from "@/components/onboarding/onboarding-tour";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { ThemeToggle } from "@/components/theme-toggle";
import { useState, useEffect } from "react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [showOnboarding, setShowOnboarding] = useState(false);

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
    { href: "/faq", label: "Help" },
  ];

  return (
    <div className="min-h-screen bg-bg-canvas">
      <nav className="bg-bg-card border-b border-borderSubtle sticky top-0 z-50 backdrop-blur-sm bg-bg-card/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/app/dashboard" className="text-display-h2 text-primary-teal font-semibold">
                  CrackGov.ai
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-body-m font-medium transition-colors ${
                      pathname === item.href
                        ? "border-primary-teal text-text-primary"
                        : "border-transparent text-text-secondary hover:text-text-primary hover:border-borderSubtle"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <NotificationBell />
              <Link href="/app/profile">
                <span className="text-body-s text-text-primary hover:text-primary-teal cursor-pointer transition-colors">
                  {session?.user?.name || session?.user?.email}
                </span>
              </Link>
              {session?.user?.subscriptionStatus === "free" && (
                <Link href="/app/upgrade">
                  <Button variant="outline" size="sm" className="border-primary-teal text-primary-teal hover:bg-primary-teal hover:text-white">
                    Upgrade to Pro
                  </Button>
                </Link>
              )}
              <Button variant="ghost" size="sm" onClick={() => signOut()} className="text-text-secondary hover:text-text-primary">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
        {showOnboarding && (
          <OnboardingTour onComplete={handleOnboardingComplete} />
        )}
      </main>
    </div>
  );
}

