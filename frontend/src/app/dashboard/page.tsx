"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  FolderKanban,
  FileText,
  Users,
  ArrowUpRight,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Link from "next/link";

const COLORS = ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"];

interface OrgItem {
  id: string;
  name: string;
}

interface ProjectItem {
  id: string;
  name: string;
  description?: string | null;
  status?: string;
  organizationId?: string;
}

interface DashboardData {
  organizations: OrgItem[];
  projects: ProjectItem[];
}

export default function DashboardPage() {
  const { user, hydrate } = useAuthStore();
  const [data, setData] = useState<DashboardData>({
    organizations: [],
    projects: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orgsRes, projRes] = await Promise.allSettled([
          api.get("/organizations"),
          api.get("/projects"),
        ]);

        setData({
          organizations:
            orgsRes.status === "fulfilled" ? orgsRes.value.data?.data || orgsRes.value.data || [] : [],
          projects:
            projRes.status === "fulfilled" ? projRes.value.data?.data || projRes.value.data || [] : [],
        });
      } catch (e) {
        console.error("Dashboard fetch error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const orgCount = Array.isArray(data.organizations) ? data.organizations.length : 0;
  const projCount = Array.isArray(data.projects) ? data.projects.length : 0;

  // Pie chart data: project statuses
  const projectStatusCounts: Record<string, number> = {};
  if (Array.isArray(data.projects)) {
    data.projects.forEach((p) => {
      const status = p.status || "ACTIVE";
      projectStatusCounts[status] = (projectStatusCounts[status] || 0) + 1;
    });
  }
  const pieData = Object.entries(projectStatusCounts).map(([name, value]) => ({
    name,
    value,
  }));
  if (pieData.length === 0) {
    pieData.push({ name: "No Projects", value: 1 });
  }

  // Bar chart data: projects per org
  const barData = Array.isArray(data.organizations)
    ? data.organizations.slice(0, 6).map((org) => ({
        name: (org.name || "Org").slice(0, 12),
        projects: Array.isArray(data.projects)
          ? data.projects.filter((p) => p.organizationId === org.id).length
          : 0,
      }))
    : [];

  const stats = [
    {
      label: "Organizations",
      value: orgCount,
      icon: Building2,
      color: "text-violet-500",
      bg: "bg-violet-500/10",
    },
    {
      label: "Projects",
      value: projCount,
      icon: FolderKanban,
      color: "text-cyan-500",
      bg: "bg-cyan-500/10",
    },
    {
      label: "Content Types",
      value: "—",
      icon: FileText,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Collaborators",
      value: "—",
      icon: Users,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Selamat Datang, {user?.fullName || "User"} 👋
        </h1>
        <p className="text-muted-foreground">
          Berikut ringkasan aktivitas CMS Anda.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="relative overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1">{loading ? "..." : stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Status Proyek</CardTitle>
            <CardDescription>Distribusi status proyek Anda</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${((percent || 0) * 100).toFixed(0)}%`
                    }
                  >
                    {pieData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Proyek per Organisasi</CardTitle>
            <CardDescription>Jumlah proyek di setiap organisasi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              {barData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="projects" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  Belum ada data organisasi
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Proyek Terbaru</CardTitle>
            <CardDescription>Daftar proyek yang baru dibuat</CardDescription>
          </div>
          <Link
            href="/dashboard/projects"
            className="text-sm text-violet-500 hover:text-violet-400 flex items-center gap-1"
          >
            Lihat Semua
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-sm">Memuat...</p>
          ) : Array.isArray(data.projects) && data.projects.length > 0 ? (
            <div className="space-y-3">
              {data.projects.slice(0, 5).map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                      {(project.name || "P")[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{project.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {project.description?.slice(0, 50) || "No description"}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {project.status || "ACTIVE"}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FolderKanban className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Belum ada proyek. Buat proyek pertama Anda!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
