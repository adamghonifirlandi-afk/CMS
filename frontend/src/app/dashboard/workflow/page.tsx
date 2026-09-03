"use client";

import { Suspense, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GitBranch, Clock, AlertCircle } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useActiveProject } from "@/components/active-project-provider";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface WorkflowItem {
  id: string;
  name: string;
  relatedTo: string;
  keyApprovalStage: string;
  stagesCount: number;
}

function WorkflowContent() {
  const { activeProject, isLoading: isProjectLoading } = useActiveProject();
  const projectId = activeProject?.id;

  const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!projectId) return;

    const load = async () => {
      setLoading(true);
      try {
        const projectRes = await api.get(`/projects/${projectId}`);
        const project = projectRes.data?.data || projectRes.data;
        const orgId = project?.organizationId || project?.organization?.id;
        if (!orgId) {
          toast.error("Organisasi proyek tidak ditemukan");
          return;
        }

        const res = await api.get(`/workflow/organizations/${orgId}/workflows`).catch(() => ({ data: [] }));
        setWorkflows(res.data?.data || res.data || []);
      } catch {
        toast.error("Gagal memuat workflow");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [projectId]);

  if (isProjectLoading) {
    return <div className="text-center py-12 text-muted-foreground">Memuat konteks proyek...</div>;
  }

  if (!projectId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 border rounded-xl bg-card border-dashed">
        <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-muted-foreground/50" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Proyek Tidak Ditemukan</h2>
        <p className="text-muted-foreground text-sm max-w-sm text-center mb-8">
          Anda harus memilih proyek terlebih dahulu untuk mengelola alur kerja dan persetujuan (Approval).
        </p>
        <Button className="bg-violet-600 hover:bg-violet-700 text-white shadow-md" render={<Link href="/dashboard/projects" />}>
          Kembali ke Proyek
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Workflow & Approval</h1>
        <p className="text-muted-foreground">
          Alur kerja moderasi dan persetujuan yang terhubung dengan organisasi proyek ini.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Memuat...</div>
      ) : workflows.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflows.map((workflow) => (
            <Card key={workflow.id} className="border-border/50 hover:border-violet-500/50 transition-colors">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-violet-500/10 text-violet-500 rounded-lg flex items-center justify-center">
                      <GitBranch className="w-4 h-4" />
                    </div>
                    <span className="line-clamp-1">{workflow.name}</span>
                  </div>
                </CardTitle>
                <CardDescription className="pt-2">{workflow.relatedTo || "Terkait dengan konten"}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex flex-col gap-1 p-3 rounded-lg bg-muted/30 border border-border/50">
                  <span className="text-xs text-muted-foreground">Key Approval Stage</span>
                  <span className="font-medium text-foreground">{workflow.keyApprovalStage || "Final Review"}</span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Jumlah Tahapan:</span>
                  <Badge variant="secondary">{workflow.stagesCount || 3} Stages</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-4 border rounded-xl bg-card border-dashed">
          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
            <Clock className="w-8 h-8 text-orange-500/70" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Belum Ada Workflow</h3>
          <p className="text-muted-foreground text-sm max-w-sm text-center mb-8">
            Fitur workflow memungkinkan konten melalui tahap Draft → Review → Published. Buat workflow melalui API untuk organisasi ini.
          </p>
          <Button variant="outline" className="text-violet-500 border-violet-500/20 hover:bg-violet-500/10">
            <GitBranch className="w-4 h-4 mr-2" />
            Dokumentasi Workflow API
          </Button>
        </div>
      )}
    </div>
  );
}

export default function WorkflowPage() {
  return (
    <Suspense fallback={<div className="text-center py-12">Memuat...</div>}>
      <WorkflowContent />
    </Suspense>
  );
}
