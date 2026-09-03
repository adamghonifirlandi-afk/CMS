"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth";

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [form, setForm] = useState({ fullName: "", email: "", company: "", job: "", country: "" });

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName,
        email: user.email,
        company: user.company || "",
        job: user.job || "",
        country: user.country || "",
      });
    }
  }, [user]);

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.fullName.trim() || !form.email.trim()) {
      toast.error("Nama dan email wajib diisi");
      return;
    }
    setUser({ id: user?.id || "", ...form });
    toast.success("Pengaturan akun berhasil disimpan");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground">Kelola informasi profil yang digunakan di workspace Anda.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Profil akun</CardTitle>
          <CardDescription>Perubahan ini disimpan untuk sesi demo Anda.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="fullName">Nama lengkap</Label>
              <Input id="fullName" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Perusahaan</Label>
              <Input id="company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="job">Jabatan</Label>
              <Input id="job" value={form.job} onChange={(e) => setForm({ ...form, job: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Negara</Label>
              <Input id="country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
            </div>
            <div className="flex justify-end sm:col-span-2">
              <Button type="submit" className="bg-primary-600 text-white hover:bg-primary-700">Simpan perubahan</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
