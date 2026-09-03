"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, ArrowUpRight, Building2, CheckCircle2, Database as DatabaseIcon, FileText, FolderKanban, ImageIcon, Plus, Sparkles, Users, Workflow } from "lucide-react";
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Link from "next/link";

interface Organization { id: string; name: string; }
interface Project { id: string; name: string; description?: string | null; status?: string; organizationId?: string; updatedAt?: string; }

const activityData = [
  { day: "Mon", created: 4, published: 2 }, { day: "Tue", created: 7, published: 4 },
  { day: "Wed", created: 5, published: 3 }, { day: "Thu", created: 9, published: 6 },
  { day: "Fri", created: 8, published: 5 }, { day: "Sat", created: 11, published: 8 }, { day: "Sun", created: 10, published: 7 },
];
const statusColors: Record<string, string> = { ACTIVE: "#74e0c2", COMPLETED: "#77b9f4", ARCHIVED: "#77849a" };

function formatDate(value?: string) {
  if (!value) return "Updated recently";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(value));
}

export default function DashboardPage() {
  const { user, hydrate } = useAuthStore();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { hydrate(); }, [hydrate]);
  useEffect(() => {
    Promise.allSettled([api.get("/organizations"), api.get("/projects")]).then(([orgs, projectResponse]) => {
      if (orgs.status === "fulfilled") setOrganizations(orgs.value.data?.data || orgs.value.data || []);
      if (projectResponse.status === "fulfilled") setProjects(projectResponse.value.data?.data || projectResponse.value.data || []);
      setLoading(false);
    });
  }, []);

  const counts = projects.reduce<Record<string, number>>((result, project) => {
    const status = project.status || "ACTIVE";
    result[status] = (result[status] || 0) + 1;
    return result;
  }, {});
  const statusData = Object.entries(counts).map(([name, value]) => ({ name, value }));
  if (!statusData.length) statusData.push({ name: "ACTIVE", value: 1 });
  const stats = [
    { label: "Projects", value: projects.length, detail: "Across your workspaces", icon: FolderKanban, tone: "text-primary", bg: "bg-primary/10" },
    { label: "Content types", value: projects.length * 2 + 4, detail: "Structured models", icon: FileText, tone: "text-sky-300", bg: "bg-sky-400/10" },
    { label: "Content entries", value: projects.length * 6 + 12, detail: "+18% this month", icon: DatabaseIcon, tone: "text-amber-300", bg: "bg-amber-400/10" },
    { label: "Media assets", value: projects.length * 8 + 25, detail: "Across all projects", icon: ImageIcon, tone: "text-orange-300", bg: "bg-orange-400/10" },
    { label: "Published", value: projects.length * 3 + 7, detail: "+75% this month", icon: CheckCircle2, tone: "text-emerald-300", bg: "bg-emerald-400/10" },
  ];

  return (
    <div className="mx-auto max-w-[1440px] space-y-8 animate-enter">
      <section className="surface-grid overflow-hidden rounded-2xl border border-border/80 bg-card/70 px-6 py-7 sm:px-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div><div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-primary"><Sparkles className="h-4 w-4" /> Workspace overview</div><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Good afternoon, {user?.fullName || "Demo User"}.</h1><p className="mt-2 max-w-xl text-sm text-muted-foreground">A clear view of what is moving across your content infrastructure today.</p></div>
          <div className="flex gap-3"><Button variant="outline" render={<Link href="/dashboard/organizations" />}><Building2 className="mr-2 h-4 w-4" /> Organizations</Button><Button render={<Link href="/dashboard/projects" />}><Plus className="mr-2 h-4 w-4" /> New project</Button></div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{stats.map((stat) => <Card key={stat.label} className="border-border/80 bg-card/80 transition-colors hover:border-primary/40"><CardContent className="p-5"><div className="flex items-start justify-between"><div><p className="text-sm text-muted-foreground">{stat.label}</p><p className="mt-3 text-3xl font-semibold tracking-tight">{loading ? "-" : stat.value}</p><p className="mt-2 text-xs text-muted-foreground">{stat.detail}</p></div><div className={`rounded-xl p-3 ${stat.bg}`}><stat.icon className={`h-5 w-5 ${stat.tone}`} /></div></div></CardContent></Card>)}</section>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.55fr_0.55fr]">
        <Card className="border-border/80 bg-card/80"><CardHeader className="flex-row items-start justify-between space-y-0"><div><CardTitle>Publishing activity</CardTitle><CardDescription>Content created and published over the last 7 days</CardDescription></div><Badge variant="outline" className="border-primary/30 text-primary"><Activity className="mr-1.5 h-3.5 w-3.5" /> Live demo</Badge></CardHeader><CardContent><div className="h-[260px]"><ResponsiveContainer width="100%" height="100%"><AreaChart data={activityData} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}><defs><linearGradient id="created" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#74e0c2" stopOpacity={0.3} /><stop offset="100%" stopColor="#74e0c2" stopOpacity={0} /></linearGradient></defs><CartesianGrid vertical={false} stroke="hsl(var(--border) / .55)" /><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#78869b", fontSize: 12 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: "#78869b", fontSize: 12 }} /><Tooltip contentStyle={{ background: "#182130", border: "1px solid #334154", borderRadius: 10, color: "#edf5f5" }} /><Area type="monotone" dataKey="created" stroke="#74e0c2" strokeWidth={2} fill="url(#created)" /><Area type="monotone" dataKey="published" stroke="#77b9f4" strokeWidth={2} fill="transparent" /></AreaChart></ResponsiveContainer></div><div className="mt-2 flex gap-5 text-xs text-muted-foreground"><span><i className="mr-2 inline-block h-2 w-2 rounded-full bg-primary" />Created</span><span><i className="mr-2 inline-block h-2 w-2 rounded-full bg-sky-300" />Published</span></div></CardContent></Card>
        <Card className="border-border/80 bg-card/80"><CardHeader><CardTitle>Project health</CardTitle><CardDescription>Distribution by current status</CardDescription></CardHeader><CardContent><div className="relative mx-auto h-[190px] max-w-[240px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={statusData} dataKey="value" nameKey="name" innerRadius={56} outerRadius={78} paddingAngle={5} stroke="none">{statusData.map((entry) => <Cell key={entry.name} fill={statusColors[entry.name] || "#77849a"} />)}</Pie><Tooltip contentStyle={{ background: "#182130", border: "1px solid #334154", borderRadius: 10 }} /></PieChart></ResponsiveContainer><div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-3xl font-semibold">{projects.length}</span><span className="text-xs text-muted-foreground">projects</span></div></div><div className="mt-3 space-y-2">{statusData.map((item) => <div key={item.name} className="flex items-center justify-between text-sm"><span className="flex items-center gap-2 text-muted-foreground"><i className="h-2 w-2 rounded-full" style={{ backgroundColor: statusColors[item.name] || "#77849a" }} />{item.name}</span><span className="font-medium">{item.value}</span></div>)}</div></CardContent></Card>
        <Card className="border-border/80 bg-card/80"><CardHeader><CardTitle>Quick actions</CardTitle><CardDescription>Keep your workspace moving</CardDescription></CardHeader><CardContent className="space-y-2">{[["/dashboard/projects", "New project", Plus], ["/dashboard/content-builder", "Build content type", FileText], ["/dashboard/media", "Upload media", ImageIcon], ["/dashboard/collaborators", "Invite collaborator", Users]].map(([href, label, Icon]) => <Link key={label as string} href={href as string} className="flex items-center gap-3 rounded-xl border border-border/70 p-3 text-sm transition-colors hover:border-primary/40 hover:bg-primary/5"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="h-4 w-4" /></span><span className="flex-1">{label as string}</span><ArrowUpRight className="h-4 w-4 text-muted-foreground" /></Link>)}</CardContent></Card>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <Card className="border-border/80 bg-card/80"><CardHeader className="flex-row items-center justify-between space-y-0"><div><CardTitle>Recent projects</CardTitle><CardDescription>Your latest spaces and their current state</CardDescription></div><Button variant="ghost" size="sm" render={<Link href="/dashboard/projects" />}>View all <ArrowUpRight className="ml-1.5 h-4 w-4" /></Button></CardHeader><CardContent>{loading ? <div className="py-10 text-center text-sm text-muted-foreground">Loading workspace data...</div> : projects.length ? <div className="divide-y divide-border/70">{projects.slice(0, 5).map((project) => <Link key={project.id} href={`/dashboard/projects?projectId=${project.id}`} className="group flex items-center gap-4 py-4 first:pt-1 last:pb-1"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-sm font-semibold text-primary">{project.name?.slice(0, 1).toUpperCase() || "P"}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium group-hover:text-primary">{project.name}</p><p className="mt-1 truncate text-xs text-muted-foreground">{project.description || "No description provided"}</p></div><span className="hidden text-xs text-muted-foreground sm:block">{formatDate(project.updatedAt)}</span><Badge variant="outline" className="border-primary/20 text-[10px] text-primary">{project.status || "ACTIVE"}</Badge><ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" /></Link>)}</div> : <div className="py-10 text-center"><FolderKanban className="mx-auto h-8 w-8 text-muted-foreground" /><p className="mt-3 text-sm text-muted-foreground">No projects yet</p><Button className="mt-4" size="sm" render={<Link href="/dashboard/projects" />}>Create a project</Button></div>}</CardContent></Card>
        <Card className="border-border/80 bg-card/80"><CardHeader><CardTitle>Workspace snapshot</CardTitle><CardDescription>How your organizations are shaping up</CardDescription></CardHeader><CardContent className="space-y-5">{organizations.length ? organizations.slice(0, 4).map((org) => <div key={org.id} className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-xs font-semibold text-primary">{org.name.slice(0, 2).toUpperCase()}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{org.name}</p><p className="text-xs text-muted-foreground">{projects.filter((project) => project.organizationId === org.id).length} projects</p></div><Building2 className="h-4 w-4 text-muted-foreground" /></div>) : <div className="py-6 text-center text-sm text-muted-foreground">Create an organization to see it here.</div>}<div className="border-t border-border/70 pt-5"><Link href="/dashboard/workflow" className="flex items-center gap-3 rounded-xl border border-border/70 p-3 text-sm transition-colors hover:border-primary/40 hover:bg-primary/5"><Workflow className="h-5 w-5 text-primary" /><span className="flex-1">Review workflow queue</span><ArrowUpRight className="h-4 w-4 text-muted-foreground" /></Link></div></CardContent></Card>
      </section>
    </div>
  );
}
