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
import { FolderKanban, Plus, ExternalLink, Globe, LayoutTemplate, Building2, Trash2, Settings, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useActiveProject } from "@/components/active-project-provider";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { cn } from "@/lib/utils";

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
      toast.error("Failed to load projects");
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
      toast.error("Project name and organization are required");
      return;
    }
    setCreating(true);
    try {
      await api.post("/projects", formData);
      toast.success("Project created successfully");
      setIsDialogOpen(false);
      setFormData({ ...formData, name: "", description: "" });
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/projects/${id}`);
      toast.success("Project deleted");
      if (activeProject?.id === id) {
        clearProject();
      }
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete project");
    }
  };

  const handleOpenCMS = (project: Project) => {
    setActiveProject(project);
    router.push(`/dashboard/content-builder?projectId=${project.id}`);
  };

  return (
    <div className="mx-auto max-w-[1440px] space-y-8 animate-enter">
      {/* ── Header ── */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Projects</h1>
          <p className="mt-1 text-muted-foreground">
            {orgFilter ? "Projects in selected organization" : "Manage all your headless CMS projects"}
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Project
            </Button>
          } />
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                A project is the container for your content models, entries, and assets.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateProject}>
              <div className="space-y-5 py-5">
                <div className="space-y-2">
                  <Label htmlFor="org">Organization *</Label>
                  <Select 
                    value={formData.organizationId} 
                    onValueChange={(val) => setFormData({...formData, organizationId: val || ""})}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select Organization" />
                    </SelectTrigger>
                    <SelectContent>
                      {organizations.map(org => (
                        <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g. E-commerce Blog"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desc">Description</Label>
                  <Textarea
                    id="desc"
                    className="resize-none"
                    placeholder="Brief description of this project..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="template">Base Template</Label>
                  <Select 
                    value={formData.template} 
                    onValueChange={(val) => setFormData({...formData, template: val || ""})}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select Template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BLANK">Blank</SelectItem>
                      <SelectItem value="BLOG">Blog Template</SelectItem>
                      <SelectItem value="PORTFOLIO">Portfolio</SelectItem>
                      <SelectItem value="ECOMMERCE">E-Commerce</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={creating}>
                  {creating ? "Creating..." : "Create Project"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center text-sm text-muted-foreground">Loading projects...</div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const org = organizations.find(o => o.id === project.organizationId);
            const isActive = activeProject?.id === project.id;

            return (
              <Card 
                key={project.id} 
                className={cn(
                  "group relative flex flex-col overflow-hidden bg-card/90 transition-all duration-200",
                  isActive 
                    ? "border-primary/50 shadow-md shadow-primary/10 ring-1 ring-primary/20" 
                    : "border-border/50 hover:border-primary/30 hover:shadow-sm hover:ring-1 hover:ring-primary/20"
                )}
              >
                <CardHeader className="pb-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={project.status === "ACTIVE" ? "active" : "draft"}>
                        {project.status || "ACTIVE"}
                      </Badge>
                      {isActive && (
                        <div className="flex h-5 items-center rounded-full bg-primary px-2 text-[10px] font-medium text-primary-foreground">
                          Current
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <ConfirmationDialog
                        title="Delete Project"
                        description={`Are you sure you want to delete "${project.name}"? All content models, entries, and media will be permanently deleted.`}
                        confirmText="Delete"
                        variant="destructive"
                        onConfirm={() => handleDelete(project.id)}
                        trigger={
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground transition-opacity opacity-0 group-hover:opacity-100 hover:text-foreground" render={<Link href={`/dashboard/projects/${project.id}/settings`} />}>
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                      <FolderKanban className="h-5 w-5" />
                    </div>
                    <div className="pt-0.5">
                      <CardTitle className="line-clamp-1 text-lg font-semibold tracking-tight">{project.name}</CardTitle>
                      <CardDescription className="mt-1 line-clamp-2 min-h-[40px] text-xs">
                        {project.description || "No project description provided."}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 pb-4 pt-0">
                  <div className="space-y-2 rounded-lg bg-muted/40 p-3 ring-1 ring-border/50">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Building2 className="mr-2 h-3.5 w-3.5 text-muted-foreground/60" />
                      <span className="truncate">{org?.name || "Unknown Org"}</span>
                    </div>
                    {project.customDomain && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Globe className="mr-2 h-3.5 w-3.5 text-sky-400" />
                        <a href={`https://${project.customDomain}`} target="_blank" rel="noreferrer" className="truncate hover:text-sky-400 hover:underline">
                          {project.customDomain}
                        </a>
                      </div>
                    )}
                    {project.template && project.template !== "BLANK" && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <LayoutTemplate className="mr-2 h-3.5 w-3.5 text-emerald-500/70" />
                        <span className="truncate capitalize">{project.template.toLowerCase()} Template</span>
                      </div>
                    )}
                  </div>
                </CardContent>
                
                <CardFooter className="pt-0 pb-5">
                  <Button 
                    variant={isActive ? "outline" : "default"} 
                    className="w-full group/btn" 
                    onClick={() => handleOpenCMS(project)}
                  >
                    {isActive ? "Continue in CMS" : "Open CMS"}
                    {!isActive && <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-card/30 p-8 text-center animate-in fade-in-50 zoom-in-95 duration-200">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-muted/50 ring-1 ring-border/50">
            <FolderKanban className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <h3 className="text-xl font-semibold tracking-tight">No projects yet</h3>
          <p className="mb-8 mt-2 max-w-sm text-sm text-muted-foreground">
            Get started by creating your first headless CMS project inside an organization.
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Project
          </Button>
        </div>
      )}
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[300px] items-center justify-center text-sm text-muted-foreground">Loading...</div>}>
      <ProjectsContent />
    </Suspense>
  );
}
