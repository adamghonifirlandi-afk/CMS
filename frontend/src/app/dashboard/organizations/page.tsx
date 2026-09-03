"use client";

import { useEffect, useState } from "react";
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
import { Building2, Plus, Users, Settings, FolderKanban, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Organization {
  id: string;
  name: string;
  planId?: string;
  _count?: {
    projects: number;
    members: number;
  };
}

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchOrganizations = async () => {
    try {
      const res = await api.get("/organizations");
      setOrganizations(res.data?.data || res.data || []);
    } catch (err) {
      toast.error("Failed to load organizations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) {
      toast.error("Organization name is required");
      return;
    }
    setCreating(true);
    try {
      await api.post("/organizations", { name: newOrgName });
      toast.success("Organization created successfully");
      setIsDialogOpen(false);
      setNewOrgName("");
      fetchOrganizations();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create organization");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/organizations/${id}`);
      toast.success("Organization deleted");
      fetchOrganizations();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete organization");
    }
  };

  return (
    <div className="mx-auto max-w-[1440px] space-y-8 animate-enter">
      {/* ── Header ── */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Organizations</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your workspaces and team collaboration.
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Organization
            </Button>
          } />
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Organization</DialogTitle>
              <DialogDescription>
                Organizations help you group projects and manage billing together.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateOrg}>
              <div className="space-y-4 py-5">
                <div className="space-y-2">
                  <Label htmlFor="name">Organization Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Acme Corporation"
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={creating}>
                  {creating ? "Creating..." : "Create Organization"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center text-sm text-muted-foreground">Loading organizations...</div>
      ) : organizations.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {organizations.map((org) => (
            <Card 
              key={org.id} 
              className="group relative flex flex-col overflow-hidden bg-card/90 transition-all duration-200 border-border/50 hover:border-primary/30 hover:shadow-sm hover:ring-1 hover:ring-primary/20"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500 ring-1 ring-sky-500/20 mb-3">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div className="flex items-center gap-1">
                    <ConfirmationDialog
                      title="Delete Organization"
                      description={`Are you sure you want to delete "${org.name}"? All projects, content, and data inside will be permanently deleted.`}
                      confirmText="Delete"
                      variant="destructive"
                      onConfirm={() => handleDelete(org.id)}
                      trigger={
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      }
                    />
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground transition-opacity opacity-0 group-hover:opacity-100 hover:text-foreground" render={<Link href={`/dashboard/organizations/${org.id}/settings`} />}>
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-xl font-semibold tracking-tight">{org.name}</CardTitle>
                <CardDescription className="mt-2 flex items-center gap-2">
                  <Badge variant="outline" className={cn(
                    "text-[10px] uppercase font-medium",
                    org.planId ? "border-primary/30 bg-primary/10 text-primary" : "border-border text-muted-foreground"
                  )}>
                    {org.planId ? "Pro Plan" : "Free Plan"}
                  </Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 pb-6 pt-0">
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1 rounded-lg bg-muted/40 p-3 ring-1 ring-border/50">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <FolderKanban className="mr-1.5 h-3.5 w-3.5" /> Projects
                    </div>
                    <span className="text-lg font-semibold tracking-tight">{org._count?.projects || 0}</span>
                  </div>
                  <div className="flex flex-col gap-1 rounded-lg bg-muted/40 p-3 ring-1 ring-border/50">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Users className="mr-1.5 h-3.5 w-3.5" /> Members
                    </div>
                    <span className="text-lg font-semibold tracking-tight">{org._count?.members || 1}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-3 pb-5 pt-0">
                <Button variant="outline" className="w-full bg-transparent hover:bg-muted" render={<Link href={`/dashboard/projects?orgId=${org.id}`} />}>
                  View Projects
                </Button>
                <Button variant="outline" className="w-full bg-transparent hover:bg-muted" render={<Link href={`/dashboard/collaborators?orgId=${org.id}`} />}>
                  Team
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-card/30 p-8 text-center animate-in fade-in-50 zoom-in-95 duration-200">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-muted/50 ring-1 ring-border/50">
            <Building2 className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <h3 className="text-xl font-semibold tracking-tight">No organizations yet</h3>
          <p className="mb-8 mt-2 max-w-sm text-sm text-muted-foreground">
            Create your first organization to start collaborating and managing projects with your team.
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Organization
          </Button>
        </div>
      )}
    </div>
  );
}
