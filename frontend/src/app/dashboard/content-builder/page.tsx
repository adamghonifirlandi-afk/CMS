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
  CardFooter
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
import { Database, Plus, Settings2, LayoutTemplate, Layers, AlertCircle, FileType2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useActiveProject } from "@/components/active-project-provider";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import Link from "next/link";

interface Model {
  id: string;
  name: string;
  apiId: string;
  type: string; // 'SINGLE', 'COLLECTION', 'COMPONENT'
  description?: string;
  _count?: {
    fields?: number;
    entries?: number;
  };
}

function ContentBuilderContent() {
  const { activeProject, isLoading: isProjectLoading } = useActiveProject();
  const projectId = activeProject?.id;

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
      
      const singles = (singleRes.data?.data || []).map((m: any) => ({ ...m, type: "SINGLE", apiId: m.apiId || m.slug }));
      const multis = (multiRes.data?.data || []).map((m: any) => ({ ...m, type: "COLLECTION", apiId: m.apiId || m.slug }));
      const comps = (compRes.data?.data || []).map((m: any) => ({ ...m, type: "COMPONENT", apiId: m.apiId || m.slug }));
      
      setModels([...singles, ...multis, ...comps]);
    } catch (err) {
      toast.error("Gagal memuat model/tipe konten");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchModels();
    }
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
      
      // We pass apiId to match backend Prisma schema (which uses apiId, not slug)
      const payload = {
        name: formData.name,
        apiId: formData.slug,
        slug: formData.slug, // Pass both just in case
        description: formData.description,
      };

      await api.post(endpoint, payload);
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

  const handleDeleteModel = async (id: string, type: string) => {
    try {
      let endpoint = `/content-builder/multiple-pages/${id}`;
      if (type === "SINGLE") endpoint = `/content-builder/single-pages/${id}`;
      if (type === "COMPONENT") endpoint = `/content-builder/components/${id}`;

      await api.delete(endpoint);
      toast.success("Tipe konten berhasil dihapus");
      fetchModels();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menghapus tipe konten");
    }
  };

  if (isProjectLoading) {
    return <div className="text-center py-12 text-muted-foreground">Memuat konteks proyek...</div>;
  }

  if (!projectId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 border rounded-xl bg-card border-dashed">
        <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-muted-foreground/50" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Proyek Tidak Ditemukan</h2>
        <p className="text-muted-foreground text-sm max-w-sm text-center mb-8">
          Anda harus memilih proyek terlebih dahulu melalui pemilih proyek di bilah navigasi atas, atau kembali ke halaman Proyek.
        </p>
        <Button className="" render={<Link href="/dashboard/projects" />}>
          Kembali ke Proyek
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Database className="w-6 h-6 text-primary" /> Content Builder
          </h1>
          <p className="text-muted-foreground">Rancang struktur data dan API untuk proyek CMS Anda</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={
            <Button className="">
              <Plus className="w-4 h-4 mr-2" /> Buat Tipe Konten
            </Button>
          } />
          <DialogContent className="sm:max-w-[475px]">
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
                    Cocok untuk konten berulang: Blog posts, produk, portofolio, event, dll.
                  </TabsContent>
                  <TabsContent value="SINGLE" className="text-xs text-muted-foreground pt-2">
                    Cocok untuk konten unik tunggal: Halaman Homepage, About Us, Global SEO.
                  </TabsContent>
                  <TabsContent value="COMPONENT" className="text-xs text-muted-foreground pt-2">
                    Cocok untuk blok modular: Hero section, feature card, SEO meta group.
                  </TabsContent>
                </Tabs>
                
                <div className="space-y-2 pt-2">
                  <Label htmlFor="name">Nama Tipe Konten (Display Name)</Label>
                  <Input
                    id="name"
                    placeholder="Contoh: Artikel Blog"
                    value={formData.name}
                    onChange={handleNameChange}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">API Slug (UID)</Label>
                  <Input
                    id="slug"
                    placeholder="artikel-blog"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="h-11"
                  />
                  <p className="text-[10px] text-muted-foreground">Endpoint API akan berupa: /api/v1/content/{formData.slug}</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={creating} className="">
                  {creating ? "Menyimpan..." : "Buat Model"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Memuat struktur konten...</div>
      ) : models.length > 0 ? (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">Semua Tipe</TabsTrigger>
            <TabsTrigger value="COLLECTION">Collections</TabsTrigger>
            <TabsTrigger value="SINGLE">Single Types</TabsTrigger>
            <TabsTrigger value="COMPONENT">Components</TabsTrigger>
          </TabsList>

          {["all", "COLLECTION", "SINGLE", "COMPONENT"].map(tabValue => (
            <TabsContent key={tabValue} value={tabValue} className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {models.filter(m => tabValue === "all" || m.type === tabValue).map((model) => (
                  <Card key={model.id} className="group relative overflow-hidden border-border/50 hover:border-primary/30 hover:shadow-sm transition-all flex flex-col">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="outline" className={`font-medium ${
                          model.type === 'COLLECTION' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 
                          model.type === 'SINGLE' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                          'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                        }`}>
                          {model.type === 'COLLECTION' ? <Layers className="w-3 h-3 mr-1.5" /> : 
                           model.type === 'SINGLE' ? <LayoutTemplate className="w-3 h-3 mr-1.5" /> :
                           <FileType2 className="w-3 h-3 mr-1.5" />}
                          {model.type === 'COLLECTION' ? 'Collection' : model.type === 'SINGLE' ? 'Single' : 'Component'}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <ConfirmationDialog
                            title="Hapus Model Konten"
                            description={`Apakah Anda yakin ingin menghapus model "${model.name}"? Semua entri konten yang terkait juga akan terhapus.`}
                            confirmText="Hapus"
                            variant="destructive"
                            onConfirm={() => handleDeleteModel(model.id, model.type)}
                            trigger={
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            }
                          />
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Settings2 className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                          </Button>
                        </div>
                      </div>
                      <CardTitle className="text-xl line-clamp-1">{model.name}</CardTitle>
                      <CardDescription className="font-mono text-xs mt-2 bg-muted/50 p-1.5 rounded border border-border/50 truncate">
                        /api/.../{model.apiId}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                       <div className="grid grid-cols-2 gap-4 mt-2">
                        <div className="flex flex-col gap-1 p-3 rounded-lg bg-muted/30 border border-border/50">
                          <div className="flex items-center text-xs text-muted-foreground">
                            Fields
                          </div>
                          <span className="font-semibold text-lg">{model._count?.fields || 0}</span>
                        </div>
                        {model.type === 'COLLECTION' && (
                          <div className="flex flex-col gap-1 p-3 rounded-lg bg-muted/30 border border-border/50">
                            <div className="flex items-center text-xs text-muted-foreground">
                              Entries
                            </div>
                            <span className="font-semibold text-lg">{model._count?.entries || 0}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0 pb-6 px-6 gap-3">
                      <Button variant="outline" className="w-full bg-background">
                        Edit Skema
                      </Button>
                      <Button variant="default" className="w-full " render={<Link href={`/dashboard/content-management?model=${model.apiId}`} />}>
                        Kelola Konten
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-4 border rounded-xl bg-card border-dashed">
          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
            <Database className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Content Builder Masih Kosong</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto text-center mt-1 mb-8">
            Mulai rancang API Anda. Buat Tipe Konten (Model) pertama Anda seperti Artikel, Kategori, atau Konfigurasi Halaman.
          </p>
          <Button onClick={() => setIsDialogOpen(true)} className="">
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
