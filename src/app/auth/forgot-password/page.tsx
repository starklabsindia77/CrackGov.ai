"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || "Failed to send reset email";
        setError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      const successMsg = data.message || "If an account exists, a password reset link has been sent.";
      setMessage(successMsg);
      toast.success(successMsg);
    } catch (err) {
      const errorMsg = "Something went wrong. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-canvas px-4 py-12">
      <Card className="w-full max-w-md border border-borderSubtle bg-bg-card shadow-lg">
        <CardHeader>
          <CardTitle className="text-display-h2 text-text-primary">Forgot Password</CardTitle>
          <CardDescription className="text-body-m text-text-secondary">
            Enter your email to receive a password reset link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-body-m text-text-primary">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-borderSubtle focus:border-primary-teal"
              />
            </div>
            {error && (
              <div className="text-body-s text-state-error">{error}</div>
            )}
            {message && (
              <div className="text-body-s text-state-success">{message}</div>
            )}
            <Button 
              type="submit" 
              className="w-full bg-primary-teal hover:bg-primary-teal/90 text-white" 
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <Link href="/auth/login" className="text-body-s text-primary-teal hover:underline">
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

