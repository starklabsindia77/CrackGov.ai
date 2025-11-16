"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        const errorMsg = "Invalid email or password";
        setError(errorMsg);
        toast.error(errorMsg);
      } else {
        toast.success("Logged in successfully!");
        router.push("/app/dashboard");
        router.refresh();
      }
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
          <CardTitle className="text-display-h2 text-text-primary">Login</CardTitle>
          <CardDescription className="text-body-m text-text-secondary">
            Enter your credentials to access your account
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
            <div className="space-y-2">
              <Label htmlFor="password" className="text-body-m text-text-primary">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-borderSubtle focus:border-primary-teal"
              />
            </div>
            {error && (
              <div className="text-body-s text-state-error">{error}</div>
            )}
            <Button 
              type="submit" 
              className="w-full bg-primary-teal hover:bg-primary-teal/90 text-white" 
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
          <div className="mt-6 space-y-2 text-center">
            <div className="text-body-s text-text-secondary">
              Don't have an account?{" "}
              <Link href="/auth/register" className="text-primary-teal hover:underline font-medium">
                Register
              </Link>
            </div>
            <div>
              <Link href="/auth/forgot-password" className="text-body-s text-primary-teal hover:underline">
                Forgot your password?
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

