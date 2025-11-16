"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export default function UpgradePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpgrade = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/subscription/upgrade", {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to upgrade");
      }

      router.push("/app/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    "Unlimited mock tests",
    "Advanced AI study plans",
    "Priority doubt solving",
    "Detailed performance analytics",
    "Access to premium question bank",
    "24/7 AI tutor support",
  ];

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Upgrade to Pro</h1>
          <p className="mt-2 text-gray-600">
            Unlock all premium features and accelerate your exam preparation
          </p>
        </div>

        <Card className="border-2 border-primary">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Pro Plan</CardTitle>
            <div className="mt-4">
              <span className="text-5xl font-bold">₹999</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <CardDescription className="text-base mt-2">
              Everything you need to ace your government exam
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ul className="space-y-3">
              {features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {error && (
              <div className="text-sm text-destructive text-center">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Button
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? "Processing..." : "Upgrade to Pro (Stub)"}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Note: This is a demo. Real payment integration would use Razorpay
                or similar service.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What's Included</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              The Pro plan gives you unlimited access to all features, helping
              you prepare more effectively for your government exam.
            </p>
            <p>
              <strong className="text-foreground">Note:</strong> This MVP
              includes a stubbed payment flow. In production, you would integrate
              with a payment gateway like Razorpay to handle real transactions.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

