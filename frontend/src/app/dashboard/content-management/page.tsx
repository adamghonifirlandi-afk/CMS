"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Database, Plus, Edit3, Trash2, Search, FileText, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useActiveProject } from "@/components/active-project-provider";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import Link from "next/link";

function ContentManagementContent() {
  const searchParams = useSearchParams();
  const modelFromQuery = searchParams.get("model");
  const { activeProject, isLoading: isProjectLoading } = useActiveProject();
  const projectId = activeProject?.id;

  const [models, setModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any | null>(null);
  const [entryForm, setEntryForm] = useState({ title: "", content: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (projectId) {
      fetchModels();
    }
  }, [projectId]);

  useEffect(() => {
    if (selectedModel) {
      fetchEntries(selectedModel);
    }
  }, [selectedModel]);

  const fetchModels = async () => {
    try {
      const [singleRes, multiRes] = await Promise.all([
        api.get(`/content-builder/projects/${projectId}/single-pages`).catch(() => ({ data: { data: [] } })),
        api.get(`/content-builder/projects/${projectId}/multiple-pages`).catch(() => ({ data: { data: [] } }))
      ]);
      
      const singles = (singleRes.data?.data || []).map((m: any) => ({ ...m, type: "SINGLE" }));
      const multis = (multiRes.data?.data || []).map((m: any) => ({ ...m, type: "COLLECTION" }));
      
      const fetchedModels = [...singles, ...multis];
      setModels(fetchedModels);
      
      if (fetchedModels.length > 0) {
        if (modelFromQuery) {
          const matched = fetchedModels.find(m => m.apiId === modelFromQuery || m.slug === modelFromQuery);
          if (matched) setSelectedModel(matched.id);
          else setSelectedModel(fetchedModels[0].id);
        } else {
          setSelectedModel(fetchedModels[0].id);
        }
      }
    } catch (err) {
      toast.error("Gagal memuat tipe konten");
    }
  };

  const fetchEntries = async (modelId: string) => {
    setLoading(true);
    try {
      const model = models.find(m => m.id === modelId);
      if (!model) {
        setEntries([]);
        return;
      }

      let endpoint = `/content-builder/multiple-pages/${modelId}/entries`;
      if (model.type === "SINGLE") {
        endpoint = `/content-builder/single-pages/${modelId}/content`;
      }
      
      const res = await api.get(endpoint).catch(() => ({ data: [] }));
      let fetchedEntries = res.data?.data || res.data || [];
      
      // If SINGLE type, it might return a single object instead of array
      if (model.type === "SINGLE" && !Array.isArray(fetchedEntries)) {
        fetchedEntries = fetchedEntries.id ? [fetchedEntries] : [];
      }
      
      setEntries(Array.isArray(fetchedEntries) ? fetchedEntries : []);
    } catch (err) {
      toast.error("Gagal memuat entri data");
    } finally {
      setLoading(false);
    }
  };

  const openEntryDialog = (entry?: any) => {
    const data = entry?.data || {};
    setEditingEntry(entry || null);
    setEntryForm({ title: data.title || "", content: data.content || data.body || "" });
    setDialogOpen(true);
  };

  const saveEntry = async (event: React.FormEvent) => {
    event.preventDefault();
    const model = models.find((item) => item.id === selectedModel);
    if (!model || !entryForm.title.trim()) {
      toast.error("Judul wajib diisi");
      return;
    }
    setSaving(true);
    try {
      const data = { title: entryForm.title.trim(), content: entryForm.content.trim() };
      if (model.type === "SINGLE") {
        await api.put(`/content-builder/single-pages/${model.id}/content`, { data });
      } else if (editingEntry) {
        await api.put(`/content-builder/entries/${editingEntry.id}`, { data });
      } else {
        await api.post(`/content-builder/multiple-pages/${model.id}/entries`, { data, published: true });
      }
      toast.success(editingEntry ? "Konten berhasil diperbarui" : "Konten berhasil dibuat");
      setDialogOpen(false);
      await fetchEntries(model.id);
    } catch (error: unknown) {
      const responseError = error as { response?: { data?: { message?: string } } };
      toast.error(responseError.response?.data?.message || "Gagal menyimpan konten");
    } finally {
      setSaving(false);
    }
  };

  const deleteEntry = async (entry: any) => {
    const model = models.find((item) => item.id === selectedModel);
    if (!model) return;
    try {
      if (model.type === "SINGLE") {
        await api.delete(`/content-builder/single-pages/${model.id}/content`);
      } else {
        await api.delete(`/content-builder/entries/${entry.id}`);
      }
      toast.success("Konten berhasil dihapus");
      await fetchEntries(model.id);
    } catch (error: unknown) {
      const responseError = error as { response?: { data?: { message?: string } } };
      toast.error(responseError.response?.data?.message || "Gagal menghapus konten");
    }
  };

  const togglePublish = async (entry: any) => {
    const model = models.find((item) => item.id === selectedModel);
    if (!model) return;
    try {
      if (model.type === "SINGLE") {
        await api.patch(`/content-builder/single-pages/${model.id}/toggle-publish`);
      } else {
        await api.patch(`/content-builder/entries/${entry.id}/toggle-publish`);
      }
      toast.success(entry.published ? "Konten diubah ke Draft" : "Konten berhasil di Publish");
      await fetchEntries(model.id);
    } catch (error: unknown) {
      toast.error("Gagal mengubah status publish");
    }
  };

  if (isProjectLoading) {
    return <div className="text-center py-12 text-muted-foreground">Memuat konteks proyek...</div>;
  }

  if (!projectId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 border rounded-xl bg-card border-dashed">
        <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
          <Database className="w-8 h-8 text-muted-foreground/50" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Proyek Tidak Ditemukan</h2>
        <p className="text-muted-foreground text-sm max-w-sm text-center mb-8">
          Anda harus memilih proyek terlebih dahulu melalui pemilih proyek di bilah navigasi atas, atau kembali ke halaman Proyek.
        </p>
        <Button className="bg-violet-600 hover:bg-violet-700 text-white shadow-md" render={<Link href="/dashboard/projects" />}>
          Kembali ke Proyek
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Content Management</h1>
          <p className="text-muted-foreground">Kelola entri data untuk tipe konten Anda</p>
        </div>
        
        {models.length > 0 && (
          <Button onClick={() => openEntryDialog()} className="bg-violet-600 hover:bg-violet-700 text-white shadow-md">
            <Plus className="w-4 h-4 mr-2" />
            Buat Entri Baru
          </Button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-64 space-y-2 flex-shrink-0 border-r border-border/40 pr-4">
          <h3 className="font-semibold text-xs tracking-wider text-muted-foreground uppercase mb-4 px-2">Tipe Konten</h3>
          <div className="flex flex-col space-y-1">
            {models.map(model => (
              <button
                key={model.id}
                onClick={() => setSelectedModel(model.id)}
                className={`flex items-center gap-2 text-left px-3 py-2 rounded-lg text-sm transition-all ${
                  selectedModel === model.id 
                    ? "bg-violet-500/10 text-violet-500 font-medium" 
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileText className="w-4 h-4 shrink-0" />
                <span className="truncate">{model.name}</span>
              </button>
            ))}
            {models.length === 0 && (
              <div className="text-sm text-muted-foreground italic px-2 p-4 bg-muted/20 rounded border border-dashed text-center">
                Belum ada tipe konten. Buat terlebih dahulu di Content Builder.
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 bg-card border border-border/50 rounded-xl overflow-hidden flex flex-col shadow-sm">
          <div className="p-4 border-b border-border/50 flex items-center justify-between bg-muted/10">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari entri berdasarkan judul..."
                className="pl-9 h-10 bg-background border-border/50 focus-visible:ring-violet-500/30"
              />
            </div>
          </div>
          
          <div className="flex-1">
            {loading ? (
              <div className="text-center py-20 text-muted-foreground">Memuat data...</div>
            ) : entries.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-b-border/50">
                      <TableHead className="w-[300px]">Judul</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Terakhir Diubah</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map((entry) => {
                      const title = entry.data?.title || entry.data?.name || "Tanpa Judul";
                      const dateStr = entry.updatedAt ? new Date(entry.updatedAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleDateString("id-ID");
                      const isPublished = entry.published !== false; // default true in our demo

                      return (
                        <TableRow key={entry.id} className="group border-b-border/40 hover:bg-muted/30">
                          <TableCell className="font-medium text-foreground">
                            {title}
                            <div className="text-xs text-muted-foreground font-mono mt-1 opacity-50 group-hover:opacity-100 transition-opacity">ID: {entry.id.substring(0, 8)}</div>
                          </TableCell>
                          <TableCell>
                            <button onClick={() => togglePublish(entry)} className="outline-none focus:ring-2 focus:ring-violet-500/50 rounded-full">
                              <Badge variant="outline" className={`transition-colors cursor-pointer ${isPublished ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20" : "bg-muted text-muted-foreground border-border/50 hover:bg-muted/80"}`}>
                                {isPublished ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                                {isPublished ? "Published" : "Draft"}
                              </Badge>
                            </button>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">{dateStr}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-500/10" aria-label="Edit konten" onClick={() => openEntryDialog(entry)}>
                                <Edit3 className="w-4 h-4" />
                              </Button>
                              <ConfirmationDialog
                                title="Hapus Entri"
                                description={`Apakah Anda yakin ingin menghapus "${title}"? Data ini tidak dapat dikembalikan.`}
                                confirmText="Hapus"
                                variant="destructive"
                                onConfirm={() => deleteEntry(entry)}
                                trigger={
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" aria-label="Hapus konten">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                }
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 px-4">
                <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
                  <Database className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Belum ada entri</h3>
                <p className="text-muted-foreground text-sm max-w-sm text-center mb-6">
                  Tipe konten ini belum memiliki data. Buat entri pertama untuk mulai mengelola konten.
                </p>
                <Button onClick={() => openEntryDialog()} className="bg-violet-600 hover:bg-violet-700 text-white shadow-sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Buat Entri Pertama
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingEntry ? "Edit Konten" : "Buat Konten Baru"}</DialogTitle>
            <DialogDescription>Masukkan data untuk entri konten ini.</DialogDescription>
          </DialogHeader>
          <form onSubmit={saveEntry} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="entry-title" className="text-sm font-medium">Judul *</label>
              <Input 
                id="entry-title" 
                value={entryForm.title} 
                onChange={(event) => setEntryForm({ ...entryForm, title: event.target.value })} 
                className="h-11"
                placeholder="Masukkan judul..."
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="entry-content" className="text-sm font-medium">Isi Konten (JSON/Teks)</label>
              <Textarea 
                id="entry-content" 
                rows={8} 
                value={entryForm.content} 
                onChange={(event) => setEntryForm({ ...entryForm, content: event.target.value })} 
                className="font-mono text-sm"
                placeholder="Tulis konten..."
              />
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
              <Button type="submit" disabled={saving} className="bg-violet-600 text-white hover:bg-violet-700">
                {saving ? "Menyimpan..." : "Simpan Konten"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ContentManagementPage() {
  return (
    <Suspense fallback={<div className="text-center py-12">Memuat...</div>}>
      <ContentManagementContent />
    </Suspense>
  );
}
