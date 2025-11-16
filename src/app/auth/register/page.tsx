"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || "Registration failed";
        setError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      toast.success("Account created successfully! Please log in.");
      router.push("/auth/login?registered=true");
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
          <CardTitle className="text-display-h2 text-text-primary">Register</CardTitle>
          <CardDescription className="text-body-m text-text-secondary">
            Create an account to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-body-m text-text-primary">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="border-borderSubtle focus:border-primary-teal"
              />
            </div>
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
              disabled={loading}
            >
              {loading ? "Creating account..." : "Register"}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <div className="text-body-s text-text-secondary">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-primary-teal hover:underline font-medium">
                Login
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

