"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, Layers } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    company: "",
    job: "",
    country: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState<string[]>([]);

  useEffect(() => {
    api
      .get("/auth")
      .then((res) => {
        const data = res.data?.data || res.data || [];
        setCountries(Array.isArray(data) ? data : []);
      })
      .catch(() => setCountries([]));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.password) {
      toast.error("Name, email, and password are required");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("fullName", form.fullName);
      formData.append("email", form.email);
      formData.append("company", form.company);
      formData.append("job", form.job);
      formData.append("country", form.country);
      formData.append("password", form.password);

      await api.post("/auth/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Registration successful! Please log in.");
      router.push("/login");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const message = axiosErr.response?.data?.message || "Registration failed";
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
            Start shaping<br />your content today.
          </h1>
          <p className="max-w-md text-base leading-7 text-muted-foreground mt-4">
            Create a free account and start building your digital projects with our platform.
          </p>
        </div>
      </div>

      {/* Right Panel - Register Form */}
      <div className="flex items-center justify-center px-6 py-12 sm:px-10 h-screen overflow-y-auto">
        <div className="w-full max-w-md space-y-6 animate-enter pb-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 justify-center mb-4 pt-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-semibold">Northstar CMS</span>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-semibold tracking-tight">Create an account</h2>
            <p className="text-muted-foreground mt-2">
              Fill in your details below to register
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                name="fullName"
                placeholder="John Doe"
                value={form.fullName}
                onChange={handleChange}
                className="h-11"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email address *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@company.com"
                value={form.email}
                onChange={handleChange}
                className="h-11"
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  name="company"
                  placeholder="Acme Inc"
                  value={form.company}
                  onChange={handleChange}
                  className="h-11"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job">Job Title</Label>
                <Input
                  id="job"
                  name="job"
                  placeholder="Developer"
                  value={form.job}
                  onChange={handleChange}
                  className="h-11"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <select
                id="country"
                name="country"
                value={form.country}
                onChange={handleChange}
                className="flex h-11 w-full rounded-md border border-input bg-card px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                disabled={loading}
              >
                <option value="">Select Country</option>
                {countries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  className="h-11 pr-10"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Repeat password"
                value={form.confirmPassword}
                onChange={handleChange}
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
                  Registering...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground pt-4">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
