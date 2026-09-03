"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Activity,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Database as DatabaseIcon,
  FileText,
  FolderKanban,
  Images,
  Plus,
  Sparkles,
  Users,
  GitBranch,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Link from "next/link";

/* ── Types ── */
interface Organization {
  id: string;
  name: string;
}
interface Project {
  id: string;
  name: string;
  description?: string | null;
  status?: string;
  organizationId?: string;
  updatedAt?: string;
}

/* ── Mock chart data ── */
const activityData = [
  { day: "Mon", created: 4, published: 2 },
  { day: "Tue", created: 7, published: 4 },
  { day: "Wed", created: 5, published: 3 },
  { day: "Thu", created: 9, published: 6 },
  { day: "Fri", created: 8, published: 5 },
  { day: "Sat", created: 11, published: 8 },
  { day: "Sun", created: 10, published: 7 },
];
const statusColors: Record<string, string> = {
  ACTIVE: "#5ce0b5",
  COMPLETED: "#6db3f0",
  ARCHIVED: "#6b7a8d",
};

function formatDate(value?: string) {
  if (!value) return "Updated recently";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

/* ── Stat accents ── */
const statAccents = [
  { tone: "text-primary", bg: "bg-primary/10", ring: "ring-primary/20" },
  { tone: "text-sky-400", bg: "bg-sky-400/10", ring: "ring-sky-400/20" },
  { tone: "text-amber-400", bg: "bg-amber-400/10", ring: "ring-amber-400/20" },
  { tone: "text-orange-400", bg: "bg-orange-400/10", ring: "ring-orange-400/20" },
  { tone: "text-emerald-400", bg: "bg-emerald-400/10", ring: "ring-emerald-400/20" },
];

export default function DashboardPage() {
  const { user, hydrate } = useAuthStore();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hydrate();
  }, [hydrate]);
  useEffect(() => {
    Promise.allSettled([
      api.get("/organizations"),
      api.get("/projects"),
    ]).then(([orgs, projectResponse]) => {
      if (orgs.status === "fulfilled")
        setOrganizations(orgs.value.data?.data || orgs.value.data || []);
      if (projectResponse.status === "fulfilled")
        setProjects(
          projectResponse.value.data?.data || projectResponse.value.data || []
        );
      setLoading(false);
    });
  }, []);

  const counts = projects.reduce<Record<string, number>>((result, project) => {
    const status = project.status || "ACTIVE";
    result[status] = (result[status] || 0) + 1;
    return result;
  }, {});
  const statusData = Object.entries(counts).map(([name, value]) => ({
    name,
    value,
  }));
  if (!statusData.length) statusData.push({ name: "ACTIVE", value: 1 });

  const stats = [
    {
      label: "Projects",
      value: projects.length,
      detail: "Across workspaces",
      icon: FolderKanban,
    },
    {
      label: "Content types",
      value: projects.length * 2 + 4,
      detail: "Structured models",
      icon: FileText,
    },
    {
      label: "Content entries",
      value: projects.length * 6 + 12,
      detail: "+18% this month",
      icon: DatabaseIcon,
      trend: true,
    },
    {
      label: "Media assets",
      value: projects.length * 8 + 25,
      detail: "Across all projects",
      icon: Images,
    },
    {
      label: "Published",
      value: projects.length * 3 + 7,
      detail: "+75% this month",
      icon: CheckCircle2,
      trend: true,
    },
  ];

  const quickActions = [
    {
      href: "/dashboard/projects",
      label: "New project",
      desc: "Create a new workspace",
      icon: Plus,
    },
    {
      href: "/dashboard/content-builder",
      label: "Build content type",
      desc: "Design your data model",
      icon: FileText,
    },
    {
      href: "/dashboard/media",
      label: "Upload media",
      desc: "Add images and files",
      icon: Images,
    },
    {
      href: "/dashboard/collaborators",
      label: "Invite collaborator",
      desc: "Grow your team",
      icon: Users,
    },
  ];

  return (
    <div className="mx-auto max-w-[1440px] space-y-6 animate-enter">
      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="surface-grid overflow-hidden rounded-2xl border border-border/60 bg-card/60 px-6 py-8 sm:px-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Workspace overview
            </div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Good afternoon, {user?.fullName || "Demo User"}.
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              A clear view of what&apos;s moving across your content
              infrastructure today.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              render={<Link href="/dashboard/organizations" />}
            >
              <Building2 className="mr-2 h-4 w-4" />
              Organizations
            </Button>
            <Button render={<Link href="/dashboard/projects" />}>
              <Plus className="mr-2 h-4 w-4" />
              New project
            </Button>
          </div>
        </div>
      </section>

      {/* ═══════════════════ KPI STATS ═══════════════════ */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat, i) => {
          const accent = statAccents[i];
          return (
            <Card
              key={stat.label}
              className="border-border/50 bg-card/90 hover:ring-1 hover:ring-primary/20 transition-all duration-150"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-3xl font-semibold tracking-tight">
                      {loading ? "–" : stat.value}
                    </p>
                    <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                      {stat.trend && (
                        <TrendingUp className="h-3 w-3 text-emerald-400" />
                      )}
                      {stat.detail}
                    </p>
                  </div>
                  <div
                    className={`rounded-xl p-2.5 ring-1 ${accent.bg} ${accent.ring}`}
                  >
                    <stat.icon className={`h-5 w-5 ${accent.tone}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* ═══════════════════ CHARTS ROW ═══════════════════ */}
      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.55fr_0.55fr]">
        {/* Publishing Activity */}
        <Card className="border-border/50 bg-card/90">
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Publishing activity</CardTitle>
              <CardDescription className="mt-1">
                Content created & published — last 7 days
              </CardDescription>
            </div>
            <Badge variant="outline" className="border-primary/25 text-primary text-[11px]">
              <Activity className="mr-1 h-3 w-3" />
              Live demo
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={activityData}
                  margin={{ top: 8, right: 4, left: -24, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="gCreated"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#5ce0b5"
                        stopOpacity={0.25}
                      />
                      <stop
                        offset="100%"
                        stopColor="#5ce0b5"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="3 3"
                    stroke="oklch(0.27 0.03 250 / 0.6)"
                  />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6b7a8d", fontSize: 11, fontWeight: 500 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6b7a8d", fontSize: 11, fontWeight: 500 }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.18 0.025 250)",
                      border: "1px solid oklch(0.27 0.03 250)",
                      borderRadius: 10,
                      color: "#e8f0f0",
                      fontSize: 13,
                      boxShadow: "0 8px 24px oklch(0 0 0 / 0.3)",
                    }}
                    cursor={{
                      stroke: "oklch(0.78 0.14 174 / 0.2)",
                      strokeWidth: 1,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="created"
                    stroke="#5ce0b5"
                    strokeWidth={2}
                    fill="url(#gCreated)"
                  />
                  <Area
                    type="monotone"
                    dataKey="published"
                    stroke="#6db3f0"
                    strokeWidth={2}
                    fill="transparent"
                    strokeDasharray="4 4"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex gap-5 text-xs text-muted-foreground">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                Created
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-sky-400" />
                Published
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Project Health */}
        <Card className="border-border/50 bg-card/90">
          <CardHeader>
            <CardTitle className="text-base">Project health</CardTitle>
            <CardDescription className="mt-1">
              Distribution by status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative mx-auto h-[180px] max-w-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={52}
                    outerRadius={74}
                    paddingAngle={4}
                    stroke="none"
                  >
                    {statusData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={statusColors[entry.name] || "#6b7a8d"}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.18 0.025 250)",
                      border: "1px solid oklch(0.27 0.03 250)",
                      borderRadius: 10,
                      fontSize: 13,
                      boxShadow: "0 8px 24px oklch(0 0 0 / 0.3)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-semibold tracking-tight">
                  {projects.length}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {projects.length === 1 ? "project" : "projects"}
                </span>
              </div>
            </div>
            <div className="mt-4 space-y-2.5">
              {statusData.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2.5 text-muted-foreground">
                    <span
                      className="h-2.5 w-2.5 rounded-sm"
                      style={{
                        backgroundColor:
                          statusColors[item.name] || "#6b7a8d",
                      }}
                    />
                    {item.name}
                  </span>
                  <span className="font-semibold tabular-nums">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-border/50 bg-card/90">
          <CardHeader>
            <CardTitle className="text-base">Quick actions</CardTitle>
            <CardDescription className="mt-1">
              Keep your workspace moving
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="group/action flex items-center gap-3 rounded-xl border border-border/50 bg-card/50 p-3 transition-all duration-150 hover:border-primary/30 hover:bg-primary/[0.05] hover:shadow-sm"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20 transition-colors group-hover/action:bg-primary/15">
                  <action.icon className="h-4 w-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {action.label}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {action.desc}
                  </p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground/50 transition-all duration-150 group-hover/action:text-primary group-hover/action:translate-x-0.5 group-hover/action:-translate-y-0.5" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* ═══════════════════ BOTTOM ROW ═══════════════════ */}
      <section className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        {/* Recent Projects */}
        <Card className="border-border/50 bg-card/90">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Recent projects</CardTitle>
              <CardDescription className="mt-1">
                Latest spaces and their current state
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              render={<Link href="/dashboard/projects" />}
              className="gap-1.5"
            >
              View all
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                Loading workspace data...
              </div>
            ) : projects.length ? (
              <div className="divide-y divide-border/50">
                {projects.slice(0, 5).map((project) => (
                  <Link
                    key={project.id}
                    href={`/dashboard/projects?projectId=${project.id}`}
                    className="group/row flex items-center gap-4 py-3.5 first:pt-0 last:pb-0 transition-colors"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold text-primary ring-1 ring-primary/20">
                      {project.name?.slice(0, 1).toUpperCase() || "P"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium group-hover/row:text-primary transition-colors">
                        {project.name}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {project.description || "No description provided"}
                      </p>
                    </div>
                    <span className="hidden text-xs text-muted-foreground sm:block">
                      {formatDate(project.updatedAt)}
                    </span>
                    <Badge variant="active" className="text-[10px]">
                      {project.status || "ACTIVE"}
                    </Badge>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground/40 transition-all duration-150 group-hover/row:text-primary group-hover/row:translate-x-0.5 group-hover/row:-translate-y-0.5" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center">
                <FolderKanban className="mx-auto h-8 w-8 text-muted-foreground/40" />
                <p className="mt-3 text-sm text-muted-foreground">
                  No projects yet
                </p>
                <Button
                  className="mt-4"
                  size="sm"
                  render={<Link href="/dashboard/projects" />}
                >
                  Create a project
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Workspace Snapshot */}
        <Card className="border-border/50 bg-card/90">
          <CardHeader>
            <CardTitle className="text-base">Workspace snapshot</CardTitle>
            <CardDescription className="mt-1">
              How your organizations are shaping up
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {organizations.length ? (
              organizations.slice(0, 4).map((org) => (
                <div
                  key={org.id}
                  className="flex items-center gap-3 rounded-lg p-2 -mx-2 transition-colors hover:bg-muted/40"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-xs font-semibold text-primary ring-1 ring-border/50">
                    {org.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {org.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {
                        projects.filter(
                          (project) => project.organizationId === org.id
                        ).length
                      }{" "}
                      projects
                    </p>
                  </div>
                  <Building2 className="h-4 w-4 text-muted-foreground/40" />
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Create an organization to see it here.
              </div>
            )}
            <div className="border-t border-border/40 pt-4">
              <Link
                href="/dashboard/workflow"
                className="group/wf flex items-center gap-3 rounded-xl border border-border/50 bg-card/50 p-3 text-sm transition-all duration-150 hover:border-primary/30 hover:bg-primary/[0.05]"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                  <GitBranch className="h-4 w-4" />
                </span>
                <span className="flex-1 font-medium">
                  Review workflow queue
                </span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground/40 transition-all duration-150 group-hover/wf:text-primary group-hover/wf:translate-x-0.5 group-hover/wf:-translate-y-0.5" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
