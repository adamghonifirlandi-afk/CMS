"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Users, UserPlus, ShieldAlert, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Collaborator {
  id: string;
  userId: string;
  organizationId: string;
  role: string;
  user: {
    fullName: string;
    email: string;
  };
}

interface Organization {
  id: string;
  name: string;
}

function CollaboratorsContent() {
  const searchParams = useSearchParams();
  const initialOrgId = searchParams.get("orgId");

  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>(initialOrgId || "");
  const [loading, setLoading] = useState(true);

  // Invite dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("MEMBER");
  const [inviting, setInviting] = useState(false);

  const fetchOrganizations = async () => {
    try {
      const res = await api.get("/organizations");
      const orgs = res.data?.data || res.data || [];
      setOrganizations(orgs);
      if (!selectedOrgId && orgs.length > 0) {
        setSelectedOrgId(orgs[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCollaborators = async (orgId: string) => {
    if (!orgId) return;
    setLoading(true);
    try {
      // NOTE: Using a query param assuming backend supports it, or filtering client side if the API is different.
      // Usually it's /collaborators?organizationId=orgId or /organizations/:id/collaborators.
      // Let's assume GET /collaborators fetches all and we filter by orgId
      const res = await api.get(`/collaborators/${orgId}`);
      const responseData = res.data?.data || res.data || [];
      const allCollabs = Array.isArray(responseData) ? responseData : responseData.all || [];
      setCollaborators(allCollabs);
    } catch (err) {
      toast.error("Gagal memuat kolaborator");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  useEffect(() => {
    if (selectedOrgId) {
      fetchCollaborators(selectedOrgId);
    }
  }, [selectedOrgId]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !selectedOrgId) {
      toast.error("Email dan peran wajib diisi");
      return;
    }
    setInviting(true);
    try {
      await api.post("/collaborators", {
        organizationId: selectedOrgId,
        email: inviteEmail,
        role: inviteRole,
      });
      toast.success("Undangan berhasil dikirim");
      setIsDialogOpen(false);
      setInviteEmail("");
      fetchCollaborators(selectedOrgId);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal mengundang kolaborator");
    } finally {
      setInviting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus kolaborator ini?")) return;
    try {
      await api.delete(`/collaborators/${id}`);
      toast.success("Kolaborator dihapus");
      fetchCollaborators(selectedOrgId);
    } catch (err) {
      toast.error("Gagal menghapus kolaborator");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kolaborator</h1>
          <p className="text-muted-foreground">Kelola anggota tim dalam organisasi Anda</p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={selectedOrgId} onValueChange={(val) => setSelectedOrgId(val || "")}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Pilih Organisasi" />
            </SelectTrigger>
            <SelectContent>
              {organizations.map((org) => (
                <SelectItem key={org.id} value={org.id}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger render={<Button className="bg-violet-600 hover:bg-violet-700 text-white" disabled={!selectedOrgId} />}>
<UserPlus className="w-4 h-4 mr-2" />
                Undang
</DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Undang Kolaborator</DialogTitle>
                <DialogDescription>
                  Undang rekan satu tim ke organisasi ini. Pastikan email mereka telah terdaftar di sistem.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleInvite}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Pengguna</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@contoh.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Peran (Role)</Label>
                    <Select value={inviteRole} onValueChange={(val) => setInviteRole(val || "")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Peran" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MEMBER">Member</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="REVIEWER">Reviewer</SelectItem>
                        <SelectItem value="PUBLISHER">Publisher</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>
                    Batal
                  </Button>
                  <Button type="submit" disabled={inviting} className="bg-violet-600 hover:bg-violet-700 text-white">
                    {inviting ? "Mengundang..." : "Kirim Undangan"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {!selectedOrgId ? (
        <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/10">
          Silakan buat atau pilih organisasi terlebih dahulu.
        </div>
      ) : loading ? (
        <div className="text-center py-12 text-muted-foreground">Memuat...</div>
      ) : collaborators.length > 0 ? (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Pengguna</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Peran</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {collaborators.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.user?.fullName}</TableCell>
                  <TableCell>{c.user?.email}</TableCell>
                  <TableCell>
                    <Badge variant={c.role === "OWNER" || c.role === "ADMIN" ? "default" : "secondary"}>
                      {c.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {c.role !== "OWNER" && (
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-16 border rounded-lg bg-muted/10 border-dashed">
          <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">Belum ada kolaborator</h3>
          <p className="text-muted-foreground text-sm mt-1 mb-6">
            Organisasi ini belum memiliki anggota lain.
          </p>
        </div>
      )}
    </div>
  );
}

export default function CollaboratorsPage() {
  return (
    <Suspense fallback={<div className="text-center py-12">Memuat parameter...</div>}>
      <CollaboratorsContent />
    </Suspense>
  );
}
