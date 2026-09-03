"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useActiveProject } from "@/components/active-project-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Copy, ExternalLink, FolderKanban, Pencil, Rocket, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Project = { id: string; name: string; description?: string | null; status: string; customDomain?: string | null; organizationId: string };

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { setActiveProject } = useActiveProject();
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => { api.get(`/projects/${params.id}`).then((response) => setProject(response.data?.data || response.data)).catch(() => setProject(null)); }, [params.id]);
  if (!project) return <div className="py-20 text-center text-sm text-muted-foreground">Loading project...</div>;
  const domain = project.customDomain || `${project.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.northstar.dev`;
  const enterProject = () => { setActiveProject(project); router.push(`/dashboard/content-builder?projectId=${project.id}`); };
  return <div className="mx-auto max-w-5xl space-y-6 animate-enter">
    <Link href="/dashboard/projects" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"><ArrowLeft className="h-4 w-4" /> Back to projects</Link>
    <section className="flex flex-col justify-between gap-5 rounded-2xl border border-border/80 bg-card/80 p-6 sm:flex-row sm:items-start"><div className="flex gap-4"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"><FolderKanban className="h-7 w-7" /></div><div><div className="flex items-center gap-3"><h1 className="text-2xl font-semibold">{project.name}</h1><Badge className="bg-emerald-400/10 text-emerald-300">{project.status || "ACTIVE"}</Badge></div><p className="mt-2 text-sm text-muted-foreground">{project.description || "No description provided."}</p><p className="mt-3 font-mono text-xs text-muted-foreground">{project.id}</p></div></div><Button onClick={enterProject}><Rocket className="mr-2 h-4 w-4" /> Enter project</Button></section>
    <div className="grid gap-5 md:grid-cols-2"><Card className="border-border/80 bg-card/80"><CardHeader><CardTitle>Project information</CardTitle><CardDescription>Core details for this workspace.</CardDescription></CardHeader><CardContent className="space-y-4 text-sm"><div><p className="text-xs text-muted-foreground">Project ID</p><p className="mt-1 font-mono">{project.id}</p></div><div><p className="text-xs text-muted-foreground">Status</p><p className="mt-1">{project.status || "ACTIVE"}</p></div><Button variant="outline" render={<Link href={`/dashboard/projects/${project.id}/settings`} />}><Pencil className="mr-2 h-4 w-4" /> Edit project</Button></CardContent></Card><Card className="border-border/80 bg-card/80"><CardHeader><CardTitle>Domain</CardTitle><CardDescription>Your project endpoint.</CardDescription></CardHeader><CardContent><div className="flex items-center justify-between rounded-xl border border-border/70 bg-background/40 p-3"><span className="truncate font-mono text-sm">{domain}</span><Button variant="ghost" size="icon" onClick={() => { navigator.clipboard?.writeText(domain); toast.success("Domain copied"); }} aria-label="Copy domain"><Copy className="h-4 w-4" /></Button></div><a className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:underline" href={`https://${domain}`} target="_blank" rel="noreferrer">Open domain <ExternalLink className="h-3.5 w-3.5" /></a></CardContent></Card></div>
    <Card className="border-destructive/30 bg-destructive/5"><CardHeader><CardTitle className="text-destructive">Danger zone</CardTitle><CardDescription>Delete this demo project and its content.</CardDescription></CardHeader><CardContent><ConfirmationDialog title="Delete project" description={`Delete ${project.name}? This removes its demo content.`} confirmText="Delete project" variant="destructive" onConfirm={async () => { await api.delete(`/projects/${project.id}`); toast.success("Project deleted"); router.push("/dashboard/projects"); }} trigger={<Button variant="destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete project</Button>} /></CardContent></Card>
  </div>;
}