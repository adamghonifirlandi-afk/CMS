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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Copy, Key, Plus, ShieldOff } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

interface ApiToken {
  id: string;
  name: string;
  tokenPrefix: string;
  status: string;
  expiresAt: string;
}

export default function ApiTokensPage() {
  const [organizations, setOrganizations] = useState<{ id: string; name: string }[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState("");
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [tokenName, setTokenName] = useState("");
  const [newToken, setNewToken] = useState<string | null>(null);

  useEffect(() => {
    api
      .get("/organizations")
      .then((res) => {
        const orgs = res.data?.data || res.data || [];
        setOrganizations(orgs);
        if (orgs.length > 0) setSelectedOrgId(orgs[0].id);
      })
      .catch(() => toast.error("Gagal memuat organisasi"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedOrgId) return;
    api
      .get(`/api-tokens/organizations/${selectedOrgId}/tokens`)
      .then((res) => setTokens(res.data?.data || []))
      .catch(() => setTokens([]));
  }, [selectedOrgId]);

  const handleCreate = async () => {
    if (!selectedOrgId || !tokenName.trim()) {
      toast.error("Nama token wajib diisi");
      return;
    }
    setCreating(true);
    try {
      const res = await api.post(`/api-tokens/organizations/${selectedOrgId}/tokens`, {
        name: tokenName.trim(),
        validityPeriod: 30,
        accessScope: "READ_ONLY",
      });
      const created = res.data?.data;
      if (created?.rawToken) {
        setNewToken(created.rawToken);
      }
      toast.success("API token berhasil dibuat");
      setTokenName("");
      const listRes = await api.get(`/api-tokens/organizations/${selectedOrgId}/tokens`);
      setTokens(listRes.data?.data || []);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast.error(axiosErr.response?.data?.message || "Gagal membuat token");
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = async (token: ApiToken) => {
    await navigator.clipboard?.writeText(newToken || `${token.tokenPrefix}_demo_token`);
    toast.success("Token disalin ke clipboard");
  };

  const handleRevoke = async (token: ApiToken) => {
    try {
      await api.delete(`/api-tokens/tokens/${token.id}`);
      setTokens((current) => current.map((item) => item.id === token.id ? { ...item, status: "REVOKED" } : item));
      toast.success("Token berhasil dicabut");
    } catch {
      toast.error("Gagal mencabut token");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">API Tokens</h1>
          <p className="text-muted-foreground">Kelola token untuk akses API eksternal</p>
        </div>
        <Select value={selectedOrgId} onValueChange={(v) => setSelectedOrgId(v || "")}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Pilih organisasi" />
          </SelectTrigger>
          <SelectContent>
            {organizations.map((org) => (
              <SelectItem key={org.id} value={org.id}>
                {org.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" /> Buat Token Baru
          </CardTitle>
          <CardDescription>Token hanya ditampilkan sekali saat dibuat.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 space-y-2">
            <Label htmlFor="tokenName">Nama Token</Label>
            <Input
              id="tokenName"
              placeholder="Contoh: Portfolio Read Token"
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
            />
          </div>
          <Button
            className="self-end bg-violet-600 hover:bg-violet-700"
            onClick={handleCreate}
            disabled={creating || !selectedOrgId}
          >
            {creating ? "Membuat..." : "Buat Token"}
          </Button>
        </CardContent>
      </Card>

      {newToken && (
        <Card className="border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
          <CardHeader>
            <CardTitle className="text-amber-700 dark:text-amber-400">Simpan Token Ini</CardTitle>
            <CardDescription>Token tidak akan ditampilkan lagi setelah Anda meninggalkan halaman ini.</CardDescription>
          </CardHeader>
          <CardContent>
            <code className="block p-3 bg-background rounded border text-sm break-all">{newToken}</code>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Memuat...</div>
      ) : tokens.length > 0 ? (
        <div className="grid gap-4">
          {tokens.map((token) => (
            <Card key={token.id}>
              <CardContent className="pt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <Key className="w-5 h-5 text-violet-500" />
                  <div>
                    <p className="font-medium">{token.name}</p>
                    <p className="text-sm text-muted-foreground">Prefix: {token.tokenPrefix}...</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => handleCopy(token)}><Copy className="mr-1.5 h-3.5 w-3.5" /> Copy</Button>
                {token.status === "ACTIVE" && <ConfirmationDialog title="Revoke API token" description={`Revoke ${token.name}? Integrations using this token will stop working.`} confirmText="Revoke token" variant="destructive" onConfirm={() => handleRevoke(token)} trigger={<Button variant="destructive" size="sm"><ShieldOff className="mr-1.5 h-3.5 w-3.5" /> Revoke</Button>} />}
                <Badge variant={token.status === "ACTIVE" ? "default" : "secondary"}>
                  {token.status}
                </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
          Belum ada API token untuk organisasi ini.
        </div>
      )}
    </div>
  );
}
