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
import { Users, UserPlus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
      const res = await api.get(`/collaborators/${orgId}`);
      const responseData = res.data?.data || res.data || [];
      const allCollabs = Array.isArray(responseData) ? responseData : responseData.all || [];
      setCollaborators(allCollabs);
    } catch (err) {
      toast.error("Failed to load collaborators");
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
      toast.error("Email and role are required");
      return;
    }
    setInviting(true);
    try {
      await api.post("/collaborators", {
        organizationId: selectedOrgId,
        email: inviteEmail,
        role: inviteRole,
      });
      toast.success("Invitation sent successfully");
      setIsDialogOpen(false);
      setInviteEmail("");
      fetchCollaborators(selectedOrgId);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to invite collaborator");
    } finally {
      setInviting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this collaborator?")) return;
    try {
      await api.delete(`/collaborators/${id}`);
      toast.success("Collaborator deleted");
      fetchCollaborators(selectedOrgId);
    } catch (err) {
      toast.error("Failed to delete collaborator");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Collaborators</h1>
          <p className="text-muted-foreground">Manage team members within your organization</p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={selectedOrgId} onValueChange={(val) => setSelectedOrgId(val || "")}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Organization" />
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
            <DialogTrigger render={
              <Button disabled={!selectedOrgId}>
                <UserPlus className="w-4 h-4 mr-2" />
                Invite
              </Button>
            } />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Collaborator</DialogTitle>
                <DialogDescription>
                  Invite a teammate to this organization. Ensure their email is registered in the system.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleInvite}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">User Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={inviteRole} onValueChange={(val) => setInviteRole(val || "")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Role" />
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
                    Cancel
                  </Button>
                  <Button type="submit" disabled={inviting}>
                    {inviting ? "Inviting..." : "Send Invitation"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {!selectedOrgId ? (
        <Card className="border-dashed bg-muted/10">
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            Please create or select an organization first.
          </CardContent>
        </Card>
      ) : loading ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            Loading...
          </CardContent>
        </Card>
      ) : collaborators.length > 0 ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {collaborators.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.user?.fullName}</TableCell>
                  <TableCell className="text-muted-foreground">{c.user?.email}</TableCell>
                  <TableCell>
                    <Badge variant={c.role === "OWNER" || c.role === "ADMIN" ? "default" : "secondary"}>
                      {c.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {c.role !== "OWNER" && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDelete(c.id)} 
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <Card className="border-dashed bg-muted/10">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground">No collaborators yet</h3>
            <p className="text-muted-foreground text-sm mt-1">
              This organization doesn't have any other members yet.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function CollaboratorsPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-muted-foreground">Loading parameters...</div>}>
      <CollaboratorsContent />
    </Suspense>
  );
}
