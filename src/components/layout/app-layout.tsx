"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { OnboardingTour } from "@/components/onboarding/onboarding-tour";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // Show back button when not on dashboard
  const showBackButton = pathname !== "/app/dashboard";

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

  return (
    <div className="min-h-screen bg-bg-canvas overflow-x-hidden">
      <nav className="bg-bg-card border-b border-borderSubtle sticky top-0 z-50 backdrop-blur-sm bg-bg-card/95 shadow-sm">
        <div className="w-full">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Left side - Back button and Logo */}
            <div className="flex items-center gap-3 flex-shrink-0 px-4 sm:px-6">
              {showBackButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  className="text-text-secondary hover:text-text-primary p-2"
                  aria-label="Go back"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
              <Link href="/app/dashboard" className="text-display-h2 text-primary-teal font-semibold whitespace-nowrap">
                CrackGov.ai
              </Link>
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
            </div>
          </div>
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

