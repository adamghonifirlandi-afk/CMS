"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, Layers } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Email dan password wajib diisi");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data.token, res.data.user);
      toast.success("Login berhasil!");
      router.push("/dashboard");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const message = axiosErr.response?.data?.message || "Login gagal";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[1.1fr_0.9fr]">
      {/* Left Panel - Branding */}
      <div className="surface-grid relative hidden overflow-hidden border-r border-border/80 bg-card/50 lg:flex">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0aDR2NEgzNnpNMjAgMjBoNHY0SDIweiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="relative z-10 flex flex-col justify-center px-16 text-foreground xl:px-24">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_0_24px_oklch(0.78_0.15_174_/_0.22)]">
              <Layers className="w-7 h-7" />
            </div>
            <span className="text-xl font-semibold tracking-tight">Northstar CMS</span>
          </div>
          <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight">
            Your content,<br />in motion.
          </h1>
          <p className="max-w-md text-base leading-7 text-muted-foreground">
            Shape structured content, ship across channels, and keep every team aligned from one calm workspace.
          </p>
          <div className="mt-12 grid max-w-lg grid-cols-3 gap-3">
            <div className="rounded-xl border border-border/80 bg-background/40 p-4"><div className="text-xl font-semibold text-primary">24/7</div><div className="mt-1 text-xs text-muted-foreground">Availability</div>
            </div>
            <div className="rounded-xl border border-border/80 bg-background/40 p-4"><div className="text-xl font-semibold text-sky-300">REST</div><div className="mt-1 text-xs text-muted-foreground">API first</div>
            </div>
            <div className="rounded-xl border border-border/80 bg-background/40 p-4"><div className="text-xl font-semibold text-amber-300">∞</div><div className="mt-1 text-xs text-muted-foreground">Possibilities</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-md space-y-8 animate-enter">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 justify-center mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-semibold">Northstar CMS</span>
          </div>

          <div className="text-center lg:text-left">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-primary">Welcome back</p>
            <h2 className="text-3xl font-semibold tracking-tight">Sign in to your workspace</h2>
            <p className="text-muted-foreground mt-2">
              Continue managing your projects and content.
            </p>
            {process.env.NEXT_PUBLIC_DEMO_EMAIL && (
              <p className="mt-3 text-sm rounded-lg border border-violet-200 bg-violet-50 dark:bg-violet-950/30 px-3 py-2 text-violet-700 dark:text-violet-300">
                Demo: gunakan email{" "}
                <span className="font-medium">{process.env.NEXT_PUBLIC_DEMO_EMAIL}</span>
                {" "}(password disediakan di halaman portfolio)
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:underline transition-colors"
                >
                  Lupa password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 pr-10"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="h-11 w-full font-medium"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Masuk...
                </>
              ) : (
                "Masuk"
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                OR
              </span>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="font-medium text-primary hover:underline transition-colors"
            >
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
