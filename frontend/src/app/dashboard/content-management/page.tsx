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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Database, Plus, Edit3, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getActiveProjectId } from "@/lib/active-project";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function ContentManagementContent() {
  const searchParams = useSearchParams();
  const projectId = getActiveProjectId(searchParams.get("projectId"));

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
        setSelectedModel(fetchedModels[0].id);
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
    if (!model || !confirm("Hapus konten ini? Tindakan ini tidak dapat dibatalkan.")) return;
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

  if (!projectId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Database className="w-12 h-12 text-muted-foreground/50 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Pilih Proyek</h2>
        <p className="text-muted-foreground mb-6">
          Harap pilih proyek terlebih dahulu sebelum mengelola konten.
        </p>
        <Button  className="bg-violet-600">
          <a href="/dashboard/projects">Kembali ke Projects</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Content Management</h1>
          <p className="text-muted-foreground">Kelola entri data untuk tipe konten Anda</p>
        </div>
        
        {models.length > 0 && (
          <Button onClick={() => openEntryDialog()} className="bg-violet-600 hover:bg-violet-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Buat Entri Baru
          </Button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-64 space-y-2 flex-shrink-0">
          <h3 className="font-medium text-sm text-muted-foreground px-2">Tipe Konten</h3>
          <div className="flex flex-col space-y-1">
            {models.map(model => (
              <button
                key={model.id}
                onClick={() => setSelectedModel(model.id)}
                className={`text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  selectedModel === model.id 
                    ? "bg-violet-100 text-violet-700 font-medium dark:bg-violet-900/30 dark:text-violet-400" 
                    : "hover:bg-muted text-muted-foreground"
                }`}
              >
                {model.name}
              </button>
            ))}
            {models.length === 0 && (
              <div className="text-sm text-muted-foreground italic px-2">Belum ada tipe konten.</div>
            )}
          </div>
        </div>

        <div className="flex-1 bg-card border rounded-lg overflow-hidden flex flex-col">
          <div className="p-4 border-b flex items-center justify-between bg-muted/20">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari entri..."
                className="pl-8 bg-background"
              />
            </div>
          </div>
          
          <div className="flex-1">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Memuat data...</div>
            ) : entries.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Terakhir Diubah</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{entry.id.substring(0, 8)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700">Published</Badge>
                      </TableCell>
                      <TableCell>{new Date().toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="text-blue-600" aria-label="Edit konten" onClick={() => openEntryDialog(entry)}>
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-600" aria-label="Hapus konten" onClick={() => deleteEntry(entry)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-16">
                <Database className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium">Belum ada entri</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto mt-1 mb-6">
                  Buat entri pertama untuk tipe konten ini.
                </p>
                <Button variant="outline" onClick={() => openEntryDialog()}>
                  Buat Entri Pertama
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingEntry ? "Edit konten" : "Buat konten baru"}</DialogTitle>
            <DialogDescription>Tambahkan konten demo untuk tipe yang sedang dipilih.</DialogDescription>
          </DialogHeader>
          <form onSubmit={saveEntry} className="space-y-4">
            <div className="space-y-2"><label htmlFor="entry-title" className="text-sm font-medium">Judul</label><Input id="entry-title" value={entryForm.title} onChange={(event) => setEntryForm({ ...entryForm, title: event.target.value })} /></div>
            <div className="space-y-2"><label htmlFor="entry-content" className="text-sm font-medium">Isi konten</label><Textarea id="entry-content" rows={5} value={entryForm.content} onChange={(event) => setEntryForm({ ...entryForm, content: event.target.value })} /></div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button><Button type="submit" disabled={saving} className="bg-violet-600 text-white hover:bg-violet-700">{saving ? "Menyimpan..." : "Simpan"}</Button></DialogFooter>
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
