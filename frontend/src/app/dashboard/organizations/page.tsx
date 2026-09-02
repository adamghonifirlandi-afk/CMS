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
import { Building2, Plus, Users, Settings } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Organization {
  id: string;
  name: string;
  planId?: string;
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Organizations</h1>
          <p className="text-muted-foreground">
            Kelola organisasi dan tim kerja Anda
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button className="bg-violet-600 hover:bg-violet-700 text-white" />}>
<Plus className="w-4 h-4 mr-2" />
              Buat Organisasi
</DialogTrigger>
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
            <Card key={org.id} className="hover:border-violet-500/50 transition-colors">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <Button variant="ghost" size="icon" >
                    <Link href={`/dashboard/organizations/${org.id}/settings`}>
                      <Settings className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                    </Link>
                  </Button>
                </div>
                <CardTitle className="text-xl mt-4">{org.name}</CardTitle>
                <CardDescription>Plan: {org.planId ? "Active Subscription" : "Free Plan"}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mt-2">
                  <Button variant="outline" size="sm" className="w-full" >
                    <Link href={`/dashboard/projects?orgId=${org.id}`}>
                      Lihat Proyek
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="w-full" >
                    <Link href={`/dashboard/collaborators?orgId=${org.id}`}>
                      <Users className="w-4 h-4 mr-2" />
                      Tim
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border rounded-lg bg-muted/10 border-dashed">
          <Building2 className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">Belum ada organisasi</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto mt-1 mb-6">
            Buat organisasi pertama Anda untuk mulai berkolaborasi dan mengelola proyek bersama tim.
          </p>
          <Button onClick={() => setIsDialogOpen(true)} className="bg-violet-600 hover:bg-violet-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Buat Organisasi
          </Button>
        </div>
      )}
    </div>
  );
}
