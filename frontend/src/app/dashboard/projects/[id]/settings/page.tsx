"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api";
import { toast } from "sonner";
import { FolderKanban, AlertTriangle } from "lucide-react";

export default function ProjectSettingsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", description: "", customDomain: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get(`/projects/${params.id}`)
      .then((response) => {
        const project = response.data?.data || response.data;
        setForm({ name: project?.name || "", description: project?.description || "", customDomain: project?.customDomain || "" });
      })
      .catch(() => toast.error("Failed to load project details"))
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) return toast.error("Project name is required");
    setSaving(true);
    try {
      await api.put(`/projects/${params.id}`, { name: form.name.trim(), description: form.description.trim() });
      if (form.customDomain.trim()) await api.put(`/projects/${params.id}/custom-domain`, { customDomain: form.customDomain.trim() });
      toast.success("Project settings saved successfully");
    } catch (error: unknown) {
      const responseError = error as { response?: { data?: { message?: string } } };
      toast.error(responseError.response?.data?.message || "Failed to save project");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Project Settings</h1>
        <p className="text-muted-foreground mt-2">Manage project details, environments, and custom domains.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-indigo-500" />
            <CardTitle>General Information</CardTitle>
          </div>
          <CardDescription>Project ID: <code className="bg-muted px-1.5 py-0.5 rounded text-xs ml-1">{params.id}</code></CardDescription>
        </CardHeader>
        {loading ? (
          <CardContent className="flex justify-center py-12 text-muted-foreground">
            Loading...
          </CardContent>
        ) : (
          <form onSubmit={handleSave}>
            <CardContent className="grid gap-6">
              <div className="space-y-2">
                <Label htmlFor="project-name">Project Name</Label>
                <Input 
                  id="project-name" 
                  placeholder="e.g. Acme Corp Marketing Site"
                  value={form.name} 
                  onChange={(e) => setForm({ ...form, name: e.target.value })} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-description">Description</Label>
                <Textarea 
                  id="project-description" 
                  placeholder="Brief description of this project's purpose..."
                  value={form.description} 
                  onChange={(e) => setForm({ ...form, description: e.target.value })} 
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-domain">Custom Domain</Label>
                <Input 
                  id="project-domain" 
                  placeholder="demo.example.com" 
                  value={form.customDomain} 
                  onChange={(e) => setForm({ ...form, customDomain: e.target.value })} 
                  className="font-mono"
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
            Destructive actions that cannot be undone. Proceed with caution.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border border-red-500/20 rounded-xl bg-red-500/5">
            <div>
              <h4 className="font-medium text-foreground">Delete Project</h4>
              <p className="text-sm text-muted-foreground mt-1">Permanently remove this project and all of its content models, entries, and assets.</p>
            </div>
            <Button 
              variant="destructive" 
              className="whitespace-nowrap"
              onClick={() => toast.error("Please delete this project from the main Projects overview page.")}
            >
              Delete Project
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
