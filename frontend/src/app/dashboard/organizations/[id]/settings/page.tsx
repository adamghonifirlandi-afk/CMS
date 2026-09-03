"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import { toast } from "sonner";

export default function OrganizationSettingsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get(`/organizations/${params.id}`)
      .then((response) => setName(response.data?.data?.name || response.data?.name || ""))
      .catch(() => toast.error("Organisasi tidak dapat dimuat"))
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return toast.error("Nama organisasi wajib diisi");
    setSaving(true);
    try {
      await api.put(`/organizations/${params.id}`, { name: name.trim() });
      toast.success("Pengaturan organisasi berhasil disimpan");
    } catch (error: unknown) {
      const responseError = error as { response?: { data?: { message?: string } } };
      toast.error(responseError.response?.data?.message || "Gagal menyimpan organisasi");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Organization Settings</h1>
        <p className="text-muted-foreground">Perbarui informasi organisasi Anda.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Informasi organisasi</CardTitle><CardDescription>ID: {params.id}</CardDescription></CardHeader>
        <CardContent>
          {loading ? <p className="text-muted-foreground">Memuat...</p> : (
            <form onSubmit={handleSave} className="space-y-5">
              <div className="space-y-2"><Label htmlFor="organization-name">Nama organisasi</Label><Input id="organization-name" value={name} onChange={(e) => setName(e.target.value)} /></div>
              <div className="flex justify-between gap-3"><Button type="button" variant="outline" onClick={() => router.back()}>Kembali</Button><Button type="submit" disabled={saving} className="bg-violet-600 text-white hover:bg-violet-700">{saving ? "Menyimpan..." : "Simpan perubahan"}</Button></div>
            </form>
          )}
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Tindakan di bawah ini tidak dapat dibatalkan. Pastikan Anda yakin sebelum melanjutkan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-destructive/20 rounded-lg bg-destructive/5">
            <div>
              <h4 className="font-medium text-foreground">Hapus Organisasi</h4>
              <p className="text-sm text-muted-foreground">Semua proyek, anggota, dan pengaturan akan dihapus secara permanen.</p>
            </div>
            <Button variant="destructive" onClick={() => toast.error("Hapus melalui halaman Organisasi utama untuk konfirmasi.")}>
              Hapus Organisasi
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
