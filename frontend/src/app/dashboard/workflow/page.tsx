"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GitBranch, Clock } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { getActiveProjectId } from "@/lib/active-project";

interface WorkflowItem {
  id: string;
  name: string;
  relatedTo: string;
  keyApprovalStage: string;
  stagesCount: number;
}

function WorkflowContent() {
  const searchParams = useSearchParams();
  const projectId = getActiveProjectId(searchParams.get("projectId"));

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

        const res = await api.get(`/workflow/organizations/${orgId}/workflows`);
        setWorkflows(res.data?.data || []);
      } catch {
        toast.error("Gagal memuat workflow");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [projectId]);

  if (!projectId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <GitBranch className="w-12 h-12 text-muted-foreground/50 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Pilih Proyek</h2>
        <p className="text-muted-foreground mb-6">
          Pilih proyek untuk mengelola alur kerja dan persetujuan (Approval).
        </p>
        <Button render={<a href="/dashboard/projects" />} className="bg-violet-600">
          Kembali ke Projects
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Workflow & Approval</h1>
        <p className="text-muted-foreground">
          Workflow yang terhubung dengan organisasi proyek ini.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Memuat...</div>
      ) : workflows.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflows.map((workflow) => (
            <Card key={workflow.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-violet-500" />
                  {workflow.name}
                </CardTitle>
                <CardDescription>{workflow.relatedTo}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>
                  <span className="text-muted-foreground">Key stage:</span>{" "}
                  {workflow.keyApprovalStage}
                </p>
                <p>
                  <span className="text-muted-foreground">Stages:</span>{" "}
                  {workflow.stagesCount}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="w-5 h-5 text-orange-500" />
              Belum Ada Workflow
            </CardTitle>
            <CardDescription>
              Jalankan seed demo atau buat workflow dari API untuk organisasi proyek ini.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Konten dengan workflow enabled akan melalui tahap Draft → Review → Published.
            </p>
          </CardContent>
        </Card>
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
