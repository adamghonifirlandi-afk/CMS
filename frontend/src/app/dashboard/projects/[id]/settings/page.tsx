"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api";
import { toast } from "sonner";

export default function ProjectSettingsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", description: "", customDomain: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get(`/projects/${params.id}`)
      .then((response) => {
        const project = response.data?.data || response.data;
        setForm({ name: project?.name || "", description: project?.description || "", customDomain: project?.customDomain || "" });
      })
      .catch(() => toast.error("Proyek tidak dapat dimuat"))
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) return toast.error("Nama proyek wajib diisi");
    setSaving(true);
    try {
      await api.put(`/projects/${params.id}`, { name: form.name.trim(), description: form.description.trim() });
      if (form.customDomain.trim()) await api.put(`/projects/${params.id}/custom-domain`, { customDomain: form.customDomain.trim() });
      toast.success("Pengaturan proyek berhasil disimpan");
    } catch (error: unknown) {
      const responseError = error as { response?: { data?: { message?: string } } };
      toast.error(responseError.response?.data?.message || "Gagal menyimpan proyek");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">Project Settings</h1><p className="text-muted-foreground">Kelola detail proyek dan domain demo.</p></div>
      <Card>
        <CardHeader><CardTitle>Informasi proyek</CardTitle><CardDescription>ID: {params.id}</CardDescription></CardHeader>
        <CardContent>
          {loading ? <p className="text-muted-foreground">Memuat...</p> : (
            <form onSubmit={handleSave} className="space-y-5">
              <div className="space-y-2"><Label htmlFor="project-name">Nama proyek</Label><Input id="project-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="space-y-2"><Label htmlFor="project-description">Deskripsi</Label><Textarea id="project-description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="space-y-2"><Label htmlFor="project-domain">Custom domain</Label><Input id="project-domain" placeholder="demo.example.com" value={form.customDomain} onChange={(e) => setForm({ ...form, customDomain: e.target.value })} /></div>
              <div className="flex justify-between gap-3"><Button type="button" variant="outline" onClick={() => router.back()}>Kembali</Button><Button type="submit" disabled={saving} className="bg-violet-600 text-white hover:bg-violet-700">{saving ? "Menyimpan..." : "Simpan perubahan"}</Button></div>
            </form>
          )}
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Tindakan di bawah ini tidak dapat dibatalkan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-destructive/20 rounded-lg bg-destructive/5">
            <div>
              <h4 className="font-medium text-foreground">Hapus Proyek</h4>
              <p className="text-sm text-muted-foreground">Semua model konten dan data di dalamnya akan terhapus.</p>
            </div>
            <Button variant="destructive" onClick={() => toast.error("Hapus melalui halaman Proyek utama untuk konfirmasi.")}>
              Hapus Proyek
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
