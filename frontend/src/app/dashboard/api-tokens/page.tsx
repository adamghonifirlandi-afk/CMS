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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { KeyRound, Plus, Copy, Trash2, Shield, Terminal, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface ApiToken {
  id: string;
  name: string;
  tokenPrefix: string;
  status: string;
  expiresAt: string;
  env?: string;
}

const MOCK_TOKENS: ApiToken[] = [
  {
    id: "mock-1",
    name: "Production API Key",
    tokenPrefix: "pk_live_8f92",
    status: "ACTIVE",
    expiresAt: "Never",
    env: "Production",
  },
  {
    id: "mock-2",
    name: "Staging Token",
    tokenPrefix: "sk_test_4b21",
    status: "REVOKED",
    expiresAt: "2024-12-31",
    env: "Staging",
  },
];

export default function ApiTokensPage() {
  const [organizations, setOrganizations] = useState<{ id: string; name: string }[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState("");
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [tokenName, setTokenName] = useState("");
  const [newToken, setNewToken] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    api
      .get("/organizations")
      .then((res) => {
        const orgs = res.data?.data || res.data || [];
        setOrganizations(orgs);
        if (orgs.length > 0) setSelectedOrgId(orgs[0].id);
      })
      .catch(() => toast.error("Failed to load organizations"))
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
      toast.error("Token name is required");
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
      toast.success("API token created successfully");
      setTokenName("");
      const listRes = await api.get(`/api-tokens/organizations/${selectedOrgId}/tokens`);
      setTokens(listRes.data?.data || []);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast.error(axiosErr.response?.data?.message || "Failed to create token");
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = (text: string, id: string = "new") => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const displayTokens = tokens.length > 0 ? tokens : MOCK_TOKENS;

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <KeyRound className="w-8 h-8 text-primary" />
            API Tokens
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage developer tokens for external API access and integrations.
          </p>
        </div>
        <Select value={selectedOrgId} onValueChange={(v) => setSelectedOrgId(v || "")}>
          <SelectTrigger className="w-[240px] bg-card">
            <SelectValue placeholder="Select organization" />
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

      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Terminal className="w-5 h-5 text-primary" /> Generate New Token
          </CardTitle>
          <CardDescription>
            Create a new API token for your applications. Tokens are shown only once upon creation.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 space-y-2 w-full">
            <Label htmlFor="tokenName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Token Name</Label>
            <Input
              id="tokenName"
              placeholder="e.g. Production Read-Only Key"
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              className="font-mono text-sm"
            />
          </div>
          <Button
            onClick={handleCreate}
            disabled={creating || !selectedOrgId}
            className="w-full sm:w-auto gap-2"
          >
            <Plus className="w-4 h-4" />
            {creating ? "Generating..." : "Generate Token"}
          </Button>
        </CardContent>
      </Card>

      {newToken && (
        <Card className="border-primary/50 bg-primary/5 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-primary flex items-center gap-2 text-lg">
              <Shield className="w-5 h-5" /> Secure Your Token
            </CardTitle>
            <CardDescription className="text-primary/80">
              Please copy this token and store it securely. It will not be shown again after you leave this page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 p-1 bg-background border rounded-md">
              <code className="flex-1 px-3 py-2 text-sm font-mono break-all text-foreground">
                {newToken}
              </code>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(newToken)}
                className="shrink-0 mr-1 text-muted-foreground hover:text-foreground"
              >
                {copiedId === "new" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-semibold tracking-tight border-b pb-2 flex items-center gap-2">
          Active Tokens
          {tokens.length === 0 && !loading && (
            <Badge variant="outline" className="ml-2 text-xs font-normal border-dashed">Example Data</Badge>
          )}
        </h3>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-card border rounded-lg border-dashed">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
            <p>Loading tokens...</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {displayTokens.map((token) => (
              <Card key={token.id} className="group overflow-hidden transition-all hover:border-primary/30 hover:shadow-sm">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 gap-4">
                    <div className="flex items-start gap-4">
                      <div className="mt-1 p-2 bg-primary/10 rounded-md">
                        <KeyRound className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">{token.name}</p>
                          {token.env && (
                            <Badge variant="outline" className="text-[10px] uppercase tracking-wider py-0 px-1.5 h-5 bg-background">
                              {token.env}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-xs font-mono text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                            {token.tokenPrefix}••••••••••••
                          </code>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-2 sm:mt-0">
                      <Badge 
                        variant={token.status.toLowerCase() === "active" ? "active" : "archived"}
                        className={token.status.toLowerCase() === "active" ? "" : "opacity-70"}
                      >
                        {token.status}
                      </Badge>
                      
                      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => copyToClipboard(token.tokenPrefix, token.id)}
                          title="Copy Prefix"
                        >
                          {copiedId === token.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          title="Revoke Token"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

