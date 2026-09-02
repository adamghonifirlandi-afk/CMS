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
      toast.error("Email wajib diisi");
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
      toast.success("Link reset password telah dikirim ke email Anda");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const message = axiosErr.response?.data?.message || "Gagal mengirim email reset";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex items-center gap-3 justify-center mb-4">
          <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold">Headless CMS</span>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Lupa Password</h2>
          <p className="text-muted-foreground mt-2">
            {sent
              ? "Cek email Anda untuk link reset password"
              : "Masukkan email terdaftar untuk reset password"}
          </p>
        </div>

        {!sent ? (
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

            <Button
              type="submit"
              className="w-full h-11 bg-violet-600 hover:bg-violet-700 text-white font-medium"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Mengirim...
                </>
              ) : (
                "Kirim Link Reset"
              )}
            </Button>
          </form>
        ) : (
          <div className="text-center p-6 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Email reset password telah dikirim. Silakan cek inbox atau folder spam Anda.
            </p>
          </div>
        )}

        <div className="text-center">
          <Link
            href="/login"
            className="text-sm text-violet-500 hover:text-violet-400 inline-flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Login
          </Link>
        </div>
      </div>
    </div>
  );
}
