"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import { Badge } from "@/components/ui/badge";
import { FolderKanban, Plus, ExternalLink, Globe, LayoutTemplate, Building2, Trash2, Settings } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useActiveProject } from "@/components/active-project-provider";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  template: string | null;
  customDomain: string | null;
  organizationId: string;
}

interface Organization {
  id: string;
  name: string;
}

function ProjectsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orgFilter = searchParams.get("orgId");
  const { setActiveProject, activeProject, clearProject } = useActiveProject();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    organizationId: orgFilter || "",
    template: "BLANK",
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [projRes, orgRes] = await Promise.all([
        api.get("/projects"),
        api.get("/organizations"),
      ]);
      
      let allProjects = projRes.data?.data || projRes.data || [];
      if (orgFilter) {
        allProjects = allProjects.filter((p: Project) => p.organizationId === orgFilter);
      }
      
      setProjects(allProjects);
      
      const orgs = orgRes.data?.data || orgRes.data || [];
      setOrganizations(orgs);
      
      if (!formData.organizationId && orgs.length > 0) {
        setFormData(prev => ({ ...prev, organizationId: orgs[0].id }));
      }
    } catch {
      toast.error("Gagal memuat data proyek");
    } finally {
      setLoading(false);
    }
  }, [orgFilter, formData.organizationId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.organizationId) {
      toast.error("Nama proyek dan organisasi wajib diisi");
      return;
    }
    setCreating(true);
    try {
      await api.post("/projects", formData);
      toast.success("Proyek berhasil dibuat");
      setIsDialogOpen(false);
      setFormData({ ...formData, name: "", description: "" });
      fetchData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal membuat proyek";
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast.error(axiosErr.response?.data?.message || message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/projects/${id}`);
      toast.success("Proyek berhasil dihapus");
      if (activeProject?.id === id) {
        clearProject();
      }
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menghapus proyek");
    }
  };

  const handleOpenCMS = (project: Project) => {
    setActiveProject(project);
    router.push(`/dashboard/content-builder?projectId=${project.id}`);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            {orgFilter ? "Proyek dalam organisasi terpilih" : "Kelola semua proyek headless CMS Anda"}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={
            <Button className="bg-violet-600 hover:bg-violet-700 text-white shadow-md">
              <Plus className="w-4 h-4 mr-2" /> Buat Proyek
            </Button>
          } />
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Buat Proyek Baru</DialogTitle>
              <DialogDescription>
                Proyek adalah wadah untuk konten, media, dan API Anda.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateProject}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="org">Organisasi *</Label>
                  <Select 
                    value={formData.organizationId} 
                    onValueChange={(val) => setFormData({...formData, organizationId: val || ""})}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Pilih Organisasi" />
                    </SelectTrigger>
                    <SelectContent>
                      {organizations.map(org => (
                        <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Proyek *</Label>
                  <Input
                    id="name"
                    placeholder="Contoh: Blog E-commerce"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desc">Deskripsi</Label>
                  <Textarea
                    id="desc"
                    placeholder="Deskripsi singkat proyek ini..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="template">Template Dasar</Label>
                  <Select 
                    value={formData.template} 
                    onValueChange={(val) => setFormData({...formData, template: val || ""})}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Pilih Template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BLANK">Kosong (Blank)</SelectItem>
                      <SelectItem value="BLOG">Blog Template</SelectItem>
                      <SelectItem value="PORTFOLIO">Portfolio</SelectItem>
                      <SelectItem value="ECOMMERCE">E-Commerce</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={creating} className="bg-violet-600 hover:bg-violet-700 text-white">
                  {creating ? "Menyimpan..." : "Buat Proyek"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Memuat...</div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const org = organizations.find(o => o.id === project.organizationId);
            const isActive = activeProject?.id === project.id;

            return (
              <Card key={project.id} className={`group relative overflow-hidden transition-all flex flex-col ${isActive ? 'border-violet-500 shadow-sm shadow-violet-500/10' : 'border-border/50 hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/5'}`}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Badge variant={project.status === "ACTIVE" ? "default" : "secondary"} className={project.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20" : ""}>
                        {project.status || "ACTIVE"}
                      </Badge>
                      {isActive && (
                        <Badge variant="outline" className="border-violet-500 text-violet-500 bg-violet-500/5">Active</Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <ConfirmationDialog
                        title="Hapus Proyek"
                        description={`Apakah Anda yakin ingin menghapus proyek "${project.name}"? Semua model konten, data, dan media di dalamnya akan terhapus secara permanen.`}
                        confirmText="Hapus"
                        variant="destructive"
                        onConfirm={() => handleDelete(project.id)}
                        trigger={
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        }
                      />
                      <Button variant="ghost" size="icon" className="h-8 w-8" render={<Link href={`/dashboard/projects/${project.id}/settings`} />}>
                        <Settings className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-violet-500/10 text-violet-500 rounded-lg flex items-center justify-center shrink-0">
                      <FolderKanban className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-xl line-clamp-1">{project.name}</CardTitle>
                      <CardDescription className="line-clamp-2 mt-1 min-h-[40px]">
                        {project.description || "Tidak ada deskripsi proyek."}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-end">
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/50 space-y-2">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Building2 className="w-3.5 h-3.5 mr-2 text-muted-foreground/70" />
                      <span className="truncate">{org?.name || "Unknown Org"}</span>
                    </div>
                    {project.customDomain && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Globe className="w-3.5 h-3.5 mr-2 text-blue-500/70" />
                        <a href={`https://${project.customDomain}`} target="_blank" rel="noreferrer" className="hover:underline hover:text-blue-500 truncate">
                          {project.customDomain}
                        </a>
                      </div>
                    )}
                    {project.template && project.template !== "BLANK" && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <LayoutTemplate className="w-3.5 h-3.5 mr-2 text-muted-foreground/70" />
                        <span className="truncate capitalize">{project.template.toLowerCase()} Template</span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="pt-2 pb-6 px-6">
                  <Button 
                    variant={isActive ? "secondary" : "default"} 
                    className={isActive ? "w-full" : "w-full bg-violet-600 hover:bg-violet-700"} 
                    onClick={() => handleOpenCMS(project)}
                  >
                    {isActive ? "Lanjutkan di CMS" : "Buka CMS"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-4 border rounded-xl bg-card border-dashed">
          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
            <FolderKanban className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Belum ada proyek</h3>
          <p className="text-muted-foreground text-sm max-w-sm text-center mb-8">
            Mulai kelola konten dengan membuat proyek CMS pertama Anda di dalam organisasi.
          </p>
          <Button onClick={() => setIsDialogOpen(true)} className="bg-violet-600 hover:bg-violet-700 text-white shadow-md">
            <Plus className="w-4 h-4 mr-2" />
            Buat Proyek Baru
          </Button>
        </div>
      )}
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={<div className="text-center py-12">Memuat parameter...</div>}>
      <ProjectsContent />
    </Suspense>
  );
}
