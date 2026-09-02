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

function ContentManagementContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");

  const [models, setModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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
          <Button className="bg-violet-600 hover:bg-violet-700 text-white">
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
                        <Button variant="ghost" size="icon" className="text-blue-600">
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-600">
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
                <Button variant="outline">
                  Buat Entri Pertama
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
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
