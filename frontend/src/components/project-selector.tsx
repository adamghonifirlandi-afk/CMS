"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useActiveProject, Project } from "@/components/active-project-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown, FolderKanban, Plus, Check } from "lucide-react";

export function ProjectSelector() {
  const router = useRouter();
  const { activeProject, setActiveProject, isLoading } = useActiveProject();
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    // Fetch all projects for the selector
    api.get("/projects")
      .then((res) => {
        setProjects(res.data?.data || res.data || []);
      })
      .catch((err) => console.error("Failed to load projects for selector", err));
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={
        <Button
          variant="outline"
          role="combobox"
          className="w-[200px] justify-between bg-card text-card-foreground border-border/40 hover:bg-accent hover:text-accent-foreground"
        >
          <div className="flex items-center gap-2 truncate">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm bg-violet-500/10 text-violet-500">
              <FolderKanban className="h-3.5 w-3.5" />
            </div>
            <span className="truncate text-sm font-medium">
              {isLoading ? "Memuat..." : activeProject?.name || "Pilih Proyek..."}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      } />
      <DropdownMenuContent className="w-[240px]" align="start">
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          Proyek Saya
        </DropdownMenuLabel>
        {projects.length === 0 ? (
          <div className="p-2 text-sm text-muted-foreground text-center">Belum ada proyek</div>
        ) : (
          projects.map((project) => (
            <DropdownMenuItem
              key={project.id}
              onClick={() => {
                setActiveProject(project);
                // Optionally redirect to content builder when changing projects
                router.push("/dashboard/content-builder");
              }}
              className="flex items-center justify-between cursor-pointer"
            >
              <span className="truncate">{project.name}</span>
              {activeProject?.id === project.id && (
                <Check className="h-4 w-4 text-violet-500" />
              )}
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-violet-500 focus:text-violet-600 focus:bg-violet-500/10"
          onClick={() => router.push("/dashboard/projects")}
        >
          <Plus className="mr-2 h-4 w-4" />
          <span>Buat Proyek Baru</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
