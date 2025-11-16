"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, CreditCard, Shield, Zap, Headphones } from "lucide-react";
import { toast } from "sonner";

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

      toast.success("Successfully upgraded to Pro! Welcome to premium features.");
      router.push("/app/dashboard");
      router.refresh();
    } catch (err: any) {
      const errorMsg = err.message || "Something went wrong";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Zap, text: "Unlimited mock tests" },
    { icon: Shield, text: "Advanced AI study plans" },
    { icon: Headphones, text: "Priority doubt solving" },
    { icon: CreditCard, text: "Detailed performance analytics" },
    { icon: Zap, text: "Access to premium question bank" },
    { icon: Headphones, text: "24/7 AI tutor support" },
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
              {features.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <li key={idx} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <span>{feature.text}</span>
                  </li>
                );
              })}
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
                <CreditCard className="h-4 w-4 mr-2" />
                {loading ? "Processing..." : "Upgrade to Pro"}
              </Button>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-center text-blue-800">
                  <strong>Demo Mode:</strong> This is a stubbed payment flow. In production, 
                  this would integrate with Razorpay or similar payment gateway for secure transactions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Why Upgrade?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Unlimited Practice</p>
                  <p className="text-muted-foreground">Take as many tests as you need</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Advanced Analytics</p>
                  <p className="text-muted-foreground">Track your progress in detail</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Priority Support</p>
                  <p className="text-muted-foreground">Get faster AI responses</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Your payment information is processed securely through industry-standard
                encryption. We never store your full payment details.
              </p>
              <p>
                <strong className="text-foreground">Current Status:</strong> Demo mode
                with stubbed payments. Real payment integration coming soon.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

