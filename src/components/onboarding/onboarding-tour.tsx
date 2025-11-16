"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, X } from "lucide-react";
import { toast } from "sonner";

interface OnboardingTourProps {
  onComplete: () => void;
}

const steps: Step[] = [
  {
    target: "[data-onboarding='dashboard']",
    content: "Welcome to CrackGov.ai! This is your dashboard where you can access all features.",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: "[data-onboarding='study-plan']",
    content: "Generate personalized AI study plans based on your exam and schedule.",
    placement: "right",
  },
  {
    target: "[data-onboarding='mock-tests']",
    content: "Take AI-generated mock tests to practice and track your progress.",
    placement: "right",
  },
  {
    target: "[data-onboarding='doubts']",
    content: "Ask questions and get instant answers from our AI tutor.",
    placement: "right",
  },
  {
    target: "[data-onboarding='test-history']",
    content: "View your test history and track your performance over time.",
    placement: "top",
  },
];

export function OnboardingTour({ onComplete }: OnboardingTourProps) {
  const { data: session } = useSession();
  const [run, setRun] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    checkOnboardingStatus();
  }, [session]);

  const checkOnboardingStatus = async () => {
    if (!session?.user) return;

    try {
      const response = await fetch("/api/user/onboarding-status");
      if (response.ok) {
        const data = await response.json();
        if (!data.onboardingCompleted) {
          setShowWelcome(true);
        }
      }
    } catch (error) {
      console.error("Error checking onboarding status:", error);
    }
  };

  const handleStartTour = () => {
    setShowWelcome(false);
    setRun(true);
  };

  const handleSkip = async () => {
    await markOnboardingComplete();
    setShowWelcome(false);
  };

  const handleJoyrideCallback = async (data: CallBackProps) => {
    const { status } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      await markOnboardingComplete();
      setRun(false);
      if (status === STATUS.FINISHED) {
        toast.success("Welcome to CrackGov.ai! Let's get started.");
      }
    }
  };

  const markOnboardingComplete = async () => {
    try {
      await fetch("/api/user/complete-onboarding", {
        method: "POST",
      });
      onComplete();
    } catch (error) {
      console.error("Error marking onboarding complete:", error);
    }
  };

  if (!showWelcome && !run) {
    return null;
  }

  return (
    <>
      {showWelcome && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">Welcome to CrackGov.ai! 🎉</CardTitle>
                  <CardDescription className="mt-2">
                    Let's take a quick tour to help you get started
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>AI-powered study plans</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Mock tests with detailed analytics</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Instant doubt solving</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleStartTour} className="flex-1">
                  Start Tour
                </Button>
                <Button variant="outline" onClick={handleSkip} className="flex-1">
                  Skip Tour
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Joyride
        steps={steps}
        run={run}
        continuous
        showProgress
        showSkipButton
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: "#3b82f6",
            zIndex: 10000,
          },
        }}
        locale={{
          back: "Back",
          close: "Close",
          last: "Finish",
          next: "Next",
          skip: "Skip",
        }}
      />
    </>
  );
}

