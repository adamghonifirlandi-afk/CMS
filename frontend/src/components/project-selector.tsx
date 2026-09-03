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
          className="h-9 w-[210px] justify-between gap-2 rounded-lg border-border/60 bg-card/60 px-3 text-foreground hover:bg-accent hover:border-border transition-all"
        >
          <div className="flex items-center gap-2 truncate">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-primary/15 text-primary">
              <FolderKanban className="h-3 w-3" />
            </span>
            {activeProject && (
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
            )}
            <span className="truncate text-sm font-medium">
              {isLoading ? "Loading..." : activeProject?.name || "Select project..."}
            </span>
          </div>
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        </Button>
      } />
      <DropdownMenuContent className="w-[240px]" align="start">
        <DropdownMenuLabel className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
          My Projects
        </DropdownMenuLabel>
        {projects.length === 0 ? (
          <div className="px-3 py-4 text-sm text-center text-muted-foreground">No projects yet</div>
        ) : (
          projects.map((project) => (
            <DropdownMenuItem
              key={project.id}
              onClick={() => {
                setActiveProject(project);
                router.push("/dashboard/content-builder");
              }}
              className="flex items-center justify-between cursor-pointer"
            >
              <span className="truncate">{project.name}</span>
              {activeProject?.id === project.id && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-primary focus:text-primary focus:bg-primary/10"
          onClick={() => router.push("/dashboard/projects")}
        >
          <Plus className="mr-2 h-4 w-4" />
          <span>New Project</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
