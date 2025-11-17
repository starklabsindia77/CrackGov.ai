"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, CreditCard, Shield, Zap, Headphones } from "lucide-react";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function UpgradePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleUpgrade = async () => {
    setError("");
    setLoading(true);

    try {
      // Create Razorpay order
      const orderResponse = await fetch("/api/subscription/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 99900, currency: "INR" }),
      });

      if (!orderResponse.ok) {
        const data = await orderResponse.json();
        // If Razorpay not configured, fallback to stub
        if (data.error?.includes("RAZORPAY") || !data.orderId) {
          const stubResponse = await fetch("/api/subscription/upgrade", {
            method: "POST",
          });
          if (stubResponse.ok) {
            toast.success("Successfully upgraded to Pro! (Demo Mode)");
            router.push("/app/dashboard");
            router.refresh();
            return;
          }
        }
        throw new Error(data.error || "Failed to create order");
      }

      const orderData = await orderResponse.json();

      // Initialize Razorpay checkout
      if (window.Razorpay) {
        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "CrackGov.ai",
          description: "Pro Subscription",
          order_id: orderData.orderId,
          handler: async function (response: any) {
            // Verify payment
            const verifyResponse = await fetch("/api/subscription/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (verifyResponse.ok) {
              toast.success("Payment successful! Welcome to Pro!");
              router.push("/app/dashboard");
              router.refresh();
            } else {
              const data = await verifyResponse.json();
              toast.error(data.error || "Payment verification failed");
            }
          },
          prefill: {
            email: session?.user?.email || "",
            name: session?.user?.name || "",
          },
          theme: {
            color: "#3b82f6",
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.on("payment.failed", function (response: any) {
          toast.error(`Payment failed: ${response.error.description}`);
          setLoading(false);
        });
        razorpay.open();
      } else {
        throw new Error("Razorpay SDK not loaded");
      }
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
  );
}

