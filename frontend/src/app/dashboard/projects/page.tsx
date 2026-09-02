"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
import { FolderKanban, Plus, ExternalLink, Globe, LayoutTemplate, Building2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

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
  const searchParams = useSearchParams();
  const orgFilter = searchParams.get("orgId");
  
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            {orgFilter ? "Proyek dalam organisasi terpilih" : "Kelola semua proyek headless CMS Anda"}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button className="bg-violet-600 hover:bg-violet-700 text-white" />}>
<Plus className="w-4 h-4 mr-2" />
              Buat Proyek
</DialogTrigger>
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
                    <SelectTrigger>
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
                    <SelectTrigger>
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
            return (
              <Card key={project.id} className="hover:border-violet-500/50 transition-colors flex flex-col">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={project.status === "ACTIVE" ? "default" : "secondary"}>
                      {project.status || "ACTIVE"}
                    </Badge>
                    {project.template && project.template !== "BLANK" && (
                      <Badge variant="outline" className="text-xs font-normal">
                        <LayoutTemplate className="w-3 h-3 mr-1" />
                        {project.template}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl line-clamp-1">{project.name}</CardTitle>
                  <CardDescription className="line-clamp-2 min-h-[40px]">
                    {project.description || "Tidak ada deskripsi"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-end">
                  <div className="space-y-3">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Building2 className="w-3.5 h-3.5 mr-1.5" />
                      {org?.name || "Unknown Org"}
                    </div>
                    {project.customDomain && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Globe className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
                        <a href={`https://${project.customDomain}`} target="_blank" rel="noreferrer" className="hover:underline">
                          {project.customDomain}
                        </a>
                      </div>
                    )}
                    <div className="pt-4 flex gap-2">
                      <Button variant="default" className="flex-1 bg-violet-600 hover:bg-violet-700" >
                        <Link href={`/dashboard/content-builder?projectId=${project.id}`}>
                          Buka CMS
                        </Link>
                      </Button>
                      <Button variant="outline" size="icon" >
                        <Link href={`/dashboard/projects/${project.id}/settings`}>
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 border rounded-lg bg-muted/10 border-dashed">
          <FolderKanban className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">Belum ada proyek</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto mt-1 mb-6">
            Mulai kelola konten dengan membuat proyek CMS pertama Anda.
          </p>
          <Button onClick={() => setIsDialogOpen(true)} className="bg-violet-600 hover:bg-violet-700 text-white">
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
