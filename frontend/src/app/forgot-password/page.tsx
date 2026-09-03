"use client";

import { useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Layers, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Email is required");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("email", email);
      await api.post("/auth/forgot-password", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSent(true);
      toast.success("Reset link sent to your email");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const message = axiosErr.response?.data?.message || "Failed to send reset email";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8 relative">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0aDR2NEgzNnpNMjAgMjBoNHY0SDIweiIvPjwvZz48L2c+PC9zdmc+')] opacity-[0.03]" />
      
      <div className="w-full max-w-md space-y-8 animate-enter relative z-10">
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_0_24px_oklch(0.78_0.15_174_/_0.22)]">
            <Layers className="w-6 h-6" />
          </div>
          <span className="text-xl font-semibold tracking-tight">Northstar CMS</span>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight">Forgot password?</h2>
          <p className="text-muted-foreground mt-2">
            {sent
              ? "Check your email for a password reset link."
              : "Enter your registered email to reset your password."}
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-5 bg-card/50 p-6 sm:p-8 rounded-2xl border border-border/60 shadow-sm backdrop-blur-sm">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 font-medium mt-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </form>
        ) : (
          <div className="text-center p-8 bg-card/50 border border-border/60 rounded-2xl shadow-sm backdrop-blur-sm">
            <p className="text-sm text-muted-foreground">
              A password reset email has been sent. Please check your inbox and spam folder.
            </p>
          </div>
        )}

        <div className="text-center">
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1.5 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
