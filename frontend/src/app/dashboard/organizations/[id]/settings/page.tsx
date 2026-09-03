"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import { toast } from "sonner";
import { Building2, AlertTriangle } from "lucide-react";

export default function OrganizationSettingsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get(`/organizations/${params.id}`)
      .then((response) => setName(response.data?.data?.name || response.data?.name || ""))
      .catch(() => toast.error("Failed to load organization details"))
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return toast.error("Organization name is required");
    setSaving(true);
    try {
      await api.put(`/organizations/${params.id}`, { name: name.trim() });
      toast.success("Organization settings saved successfully");
    } catch (error: unknown) {
      const responseError = error as { response?: { data?: { message?: string } } };
      toast.error(responseError.response?.data?.message || "Failed to save organization");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Organization Settings</h1>
        <p className="text-muted-foreground mt-2">Update your organization's core information.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-500" />
            <CardTitle>Organization Details</CardTitle>
          </div>
          <CardDescription>Organization ID: <code className="bg-muted px-1.5 py-0.5 rounded text-xs ml-1">{params.id}</code></CardDescription>
        </CardHeader>
        {loading ? (
          <CardContent className="flex justify-center py-12 text-muted-foreground">
            Loading...
          </CardContent>
        ) : (
          <form onSubmit={handleSave}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="organization-name">Organization Name</Label>
                <Input 
                  id="organization-name" 
                  placeholder="e.g. Acme Corp"
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between gap-3 border-t px-6 py-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
            </CardFooter>
          </form>
        )}
      </Card>

      <Card className="border-red-500/20 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <CardTitle className="text-red-500">Danger Zone</CardTitle>
          </div>
          <CardDescription>
            Destructive actions that cannot be undone. Please proceed with caution.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border border-red-500/20 rounded-xl bg-red-500/5">
            <div>
              <h4 className="font-medium text-foreground">Delete Organization</h4>
              <p className="text-sm text-muted-foreground mt-1">Permanently remove all associated projects, members, and settings.</p>
            </div>
            <Button 
              variant="destructive" 
              className="whitespace-nowrap"
              onClick={() => toast.error("Please delete this organization from the main Organizations overview page.")}
            >
              Delete Organization
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
