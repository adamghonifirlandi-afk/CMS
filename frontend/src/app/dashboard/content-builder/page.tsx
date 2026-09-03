"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Plus, Settings2, LayoutTemplate, Layers, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { getActiveProjectId } from "@/lib/active-project";

interface Model {
  id: string;
  name: string;
  slug: string;
  type: string; // 'SINGLE', 'COLLECTION', 'COMPONENT'
  description: string;
}

function ContentBuilderContent() {
  const searchParams = useSearchParams();
  const projectId = getActiveProjectId(searchParams.get("projectId"));

  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    type: "COLLECTION",
    description: "",
  });

  const fetchModels = async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const [singleRes, multiRes, compRes] = await Promise.all([
        api.get(`/content-builder/projects/${projectId}/single-pages`).catch(() => ({ data: { data: [] } })),
        api.get(`/content-builder/projects/${projectId}/multiple-pages`).catch(() => ({ data: { data: [] } })),
        api.get(`/content-builder/projects/${projectId}/components`).catch(() => ({ data: { data: [] } }))
      ]);
      
      const singles = (singleRes.data?.data || []).map((m: any) => ({ ...m, type: "SINGLE" }));
      const multis = (multiRes.data?.data || []).map((m: any) => ({ ...m, type: "COLLECTION" }));
      const comps = (compRes.data?.data || []).map((m: any) => ({ ...m, type: "COMPONENT" }));
      
      setModels([...singles, ...multis, ...comps]);
    } catch (err) {
      toast.error("Gagal memuat model/tipe konten");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, [projectId]);

  const handleSlugify = (text: string) => {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData({
      ...formData,
      name,
      slug: handleSlugify(name),
    });
  };

  const handleCreateModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.slug.trim()) {
      toast.error("Nama dan Slug wajib diisi");
      return;
    }
    setCreating(true);
    try {
      let endpoint = `/content-builder/projects/${projectId}/multiple-pages`;
      if (formData.type === "SINGLE") endpoint = `/content-builder/projects/${projectId}/single-pages`;
      if (formData.type === "COMPONENT") endpoint = `/content-builder/projects/${projectId}/components`;
      
      await api.post(endpoint, formData);
      toast.success("Tipe konten berhasil dibuat");
      setIsDialogOpen(false);
      setFormData({ name: "", slug: "", type: "COLLECTION", description: "" });
      fetchModels();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal membuat tipe konten");
    } finally {
      setCreating(false);
    }
  };

  if (!projectId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="w-12 h-12 text-muted-foreground/50 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Proyek Tidak Ditemukan</h2>
        <p className="text-muted-foreground mb-6">
          Anda harus memilih proyek terlebih dahulu dari halaman Projects.
        </p>
        <Button  className="bg-violet-600 hover:bg-violet-700 text-white">
          <a href="/dashboard/projects">Kembali ke Projects</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Database className="w-6 h-6 text-violet-600" /> Content Builder
          </h1>
          <p className="text-muted-foreground">Rancang struktur data dan API untuk proyek CMS Anda</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button className="bg-violet-600 hover:bg-violet-700 text-white" />}>
<Plus className="w-4 h-4 mr-2" />
              Buat Tipe Konten
</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tipe Konten Baru</DialogTitle>
              <DialogDescription>
                Pilih jenis tipe konten: Collection (banyak entri) atau Single (satu entri unik).
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateModel}>
              <div className="space-y-4 py-4">
                <Tabs value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val })}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="COLLECTION">Collection</TabsTrigger>
                    <TabsTrigger value="SINGLE">Single Type</TabsTrigger>
                    <TabsTrigger value="COMPONENT">Component</TabsTrigger>
                  </TabsList>
                  <TabsContent value="COLLECTION" className="text-xs text-muted-foreground pt-2">
                    Cocok untuk: Blog posts, produk, portofolio, dll.
                  </TabsContent>
                  <TabsContent value="SINGLE" className="text-xs text-muted-foreground pt-2">
                    Cocok untuk: Halaman Homepage, About Us, Footer config, dll.
                  </TabsContent>
                  <TabsContent value="COMPONENT" className="text-xs text-muted-foreground pt-2">
                    Cocok untuk: Hero section, feature card, dan section reusable.
                  </TabsContent>
                </Tabs>
                
                <div className="space-y-2 pt-2">
                  <Label htmlFor="name">Nama Tipe Konten (Display Name)</Label>
                  <Input
                    id="name"
                    placeholder="Contoh: Artikel Blog"
                    value={formData.name}
                    onChange={handleNameChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">API Slug (UID)</Label>
                  <Input
                    id="slug"
                    placeholder="artikel-blog"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  />
                  <p className="text-[10px] text-muted-foreground">Endpoint API akan berupa: /api/v1/content/{formData.slug}</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={creating} className="bg-violet-600 hover:bg-violet-700 text-white">
                  {creating ? "Menyimpan..." : "Lanjut merancang field"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Memuat struktur konten...</div>
      ) : models.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {models.map((model) => (
            <Card key={model.id} className="hover:border-violet-500/50 transition-colors">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className={model.type === 'COLLECTION' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-orange-50 text-orange-700 border-orange-200'}>
                    {model.type === 'COLLECTION' ? <Layers className="w-3 h-3 mr-1" /> : <LayoutTemplate className="w-3 h-3 mr-1" />}
                    {model.type}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Settings2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
                <CardTitle>{model.name}</CardTitle>
                <CardDescription className="font-mono text-xs mt-1">/api/.../{model.slug}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="w-full text-xs h-8">
                    Edit Fields (Skema)
                  </Button>
                  <Button variant="default" className="w-full text-xs h-8 bg-violet-600 hover:bg-violet-700">
                    Kelola Konten
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border rounded-lg bg-muted/10 border-dashed">
          <Database className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">Content Builder Masih Kosong</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto mt-1 mb-6">
            Mulai rancang API Anda. Buat Tipe Konten (Model) pertama Anda seperti Artikel, Kategori, atau Konfigurasi Halaman.
          </p>
          <Button onClick={() => setIsDialogOpen(true)} className="bg-violet-600 hover:bg-violet-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Buat Tipe Konten
          </Button>
        </div>
      )}
    </div>
  );
}

export default function ContentBuilderPage() {
  return (
    <Suspense fallback={<div className="text-center py-12">Memuat parameter...</div>}>
      <ContentBuilderContent />
    </Suspense>
  );
}
