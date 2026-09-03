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
      toast.error("Gagal memuat daftar organisasi");
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
      toast.error("Nama organisasi wajib diisi");
      return;
    }
    setCreating(true);
    try {
      await api.post("/organizations", { name: newOrgName });
      toast.success("Organisasi berhasil dibuat");
      setIsDialogOpen(false);
      setNewOrgName("");
      fetchOrganizations();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal membuat organisasi");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/organizations/${id}`);
      toast.success("Organisasi berhasil dihapus");
      fetchOrganizations();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menghapus organisasi");
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Organizations</h1>
          <p className="text-muted-foreground">
            Kelola organisasi dan tim kerja Anda
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={
            <Button className="bg-violet-600 hover:bg-violet-700 text-white shadow-md">
              <Plus className="w-4 h-4 mr-2" /> Buat Organisasi
            </Button>
          } />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Buat Organisasi Baru</DialogTitle>
              <DialogDescription>
                Organisasi membantu Anda mengelompokkan proyek dan kolaborator.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateOrg}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Organisasi</Label>
                  <Input
                    id="name"
                    placeholder="Contoh: PT Digital Inovasi"
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    className="h-11"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={creating} className="bg-violet-600 hover:bg-violet-700 text-white">
                  {creating ? "Menyimpan..." : "Simpan"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Memuat...</div>
      ) : organizations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizations.map((org) => (
            <Card key={org.id} className="group relative overflow-hidden border-border/50 hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/5 transition-all flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 bg-violet-500/10 text-violet-500 rounded-xl flex items-center justify-center mb-3">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-1">
                    <ConfirmationDialog
                      title="Hapus Organisasi"
                      description={`Apakah Anda yakin ingin menghapus organisasi "${org.name}"? Semua proyek dan data di dalamnya akan terhapus secara permanen.`}
                      confirmText="Hapus"
                      variant="destructive"
                      onConfirm={() => handleDelete(org.id)}
                      trigger={
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      }
                    />
                    <Button variant="ghost" size="icon" className="h-8 w-8" render={<Link href={`/dashboard/organizations/${org.id}/settings`} />}>
                      <Settings className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-xl">{org.name}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="bg-muted text-muted-foreground hover:bg-muted font-normal text-xs">
                    {org.planId ? "Active Subscription" : "Free Plan"}
                  </Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="flex flex-col gap-1 p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <FolderKanban className="w-3 h-3 mr-1" /> Proyek
                    </div>
                    <span className="font-semibold text-lg">{org._count?.projects || 0}</span>
                  </div>
                  <div className="flex flex-col gap-1 p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Users className="w-3 h-3 mr-1" /> Anggota
                    </div>
                    <span className="font-semibold text-lg">{org._count?.members || 1}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0 pb-6 px-6 gap-3">
                <Button variant="outline" className="w-full bg-background" render={<Link href={`/dashboard/projects?orgId=${org.id}`} />}>
                  Lihat Proyek
                </Button>
                <Button variant="outline" className="w-full bg-background" render={<Link href={`/dashboard/collaborators?orgId=${org.id}`} />}>
                  Kelola Tim
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-4 border rounded-xl bg-card border-dashed">
          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Belum ada organisasi</h3>
          <p className="text-muted-foreground text-sm max-w-sm text-center mb-8">
            Buat organisasi pertama Anda untuk mulai berkolaborasi dan mengelola proyek bersama tim.
          </p>
          <Button onClick={() => setIsDialogOpen(true)} className="bg-violet-600 hover:bg-violet-700 text-white shadow-md">
            <Plus className="w-4 h-4 mr-2" />
            Buat Organisasi Baru
          </Button>
        </div>
      )}
    </div>
  );
}
