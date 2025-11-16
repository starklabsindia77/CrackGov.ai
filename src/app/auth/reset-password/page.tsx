"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid reset token");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (!token) {
      setError("Invalid reset token");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || "Failed to reset password";
        setError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      setSuccess(true);
      toast.success("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (err) {
      const errorMsg = "Something went wrong. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-canvas px-4 py-12">
        <Card className="w-full max-w-md border border-borderSubtle bg-bg-card shadow-lg">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-state-success font-semibold text-body-m">
                Password reset successfully!
              </div>
              <p className="text-body-s text-text-secondary">
                Redirecting to login page...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-canvas px-4 py-12">
      <Card className="w-full max-w-md border border-borderSubtle bg-bg-card shadow-lg">
        <CardHeader>
          <CardTitle className="text-display-h2 text-text-primary">Reset Password</CardTitle>
          <CardDescription className="text-body-m text-text-secondary">
            Enter your new password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-body-m text-text-primary">New Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="border-borderSubtle focus:border-primary-teal"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-body-m text-text-primary">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="border-borderSubtle focus:border-primary-teal"
              />
            </div>
            {error && (
              <div className="text-body-s text-state-error">{error}</div>
            )}
            <Button 
              type="submit" 
              className="w-full bg-primary-teal hover:bg-primary-teal/90 text-white" 
              disabled={loading || !token}
            >
              {loading ? "Resetting..." : "Reset Password"}
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

