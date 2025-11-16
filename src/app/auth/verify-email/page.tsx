"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification token");
      return;
    }

    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus("error");
        setMessage(data.error || "Failed to verify email");
        toast.error(data.error || "Failed to verify email");
        return;
      }

      setStatus("success");
      setMessage(data.message || "Email verified successfully");
      toast.success("Email verified successfully!");
      
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (err) {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-canvas px-4 py-12">
      <Card className="w-full max-w-md border border-borderSubtle bg-bg-card shadow-lg">
        <CardHeader>
          <CardTitle className="text-display-h2 text-text-primary">Email Verification</CardTitle>
          <CardDescription className="text-body-m text-text-secondary">
            Verifying your email address
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            {status === "loading" && (
              <>
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary-teal" />
                <p className="text-body-m text-text-secondary">Verifying your email...</p>
              </>
            )}
            {status === "success" && (
              <>
                <CheckCircle className="h-12 w-12 mx-auto text-state-success" />
                <p className="text-state-success font-semibold text-body-m">{message}</p>
                <p className="text-body-s text-text-secondary">
                  Redirecting to login page...
                </p>
              </>
            )}
            {status === "error" && (
              <>
                <XCircle className="h-12 w-12 mx-auto text-state-error" />
                <p className="text-state-error font-semibold text-body-m">{message}</p>
                <div className="pt-4">
                  <Link href="/auth/login">
                    <Button className="bg-primary-teal hover:bg-primary-teal/90 text-white">
                      Go to Login
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

