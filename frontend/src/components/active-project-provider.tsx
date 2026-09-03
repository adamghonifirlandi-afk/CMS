"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/api";

const ACTIVE_PROJECT_KEY = "cms-active-project-id";

export interface Project {
  id: string;
  name: string;
  organizationId: string;
  customDomain?: string | null;
  status: string;
}

interface ActiveProjectContextType {
  activeProject: Project | null;
  setActiveProject: (project: Project) => void;
  clearProject: () => void;
  isLoading: boolean;
}

const ActiveProjectContext = createContext<ActiveProjectContextType | undefined>(undefined);

export function ActiveProjectProvider({ children }: { children: React.ReactNode }) {
  const [activeProject, setActiveProjectState] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadActiveProject = async () => {
      const queryProjectId = new URLSearchParams(window.location.search).get("projectId");
      const storedId = queryProjectId || localStorage.getItem(ACTIVE_PROJECT_KEY);
      if (storedId) {
        try {
          const response = await api.get(`/projects/${storedId}`);
          setActiveProjectState(response.data?.data || response.data);
          localStorage.setItem(ACTIVE_PROJECT_KEY, storedId);
        } catch (error) {
          console.error("Failed to load active project:", error);
          localStorage.removeItem(ACTIVE_PROJECT_KEY);
        }
      }
      setIsLoading(false);
    };
    loadActiveProject();
  }, []);

  useEffect(() => {
    const queryProjectId = new URLSearchParams(window.location.search).get("projectId");
    if (!queryProjectId) return;

    api.get(`/projects/${queryProjectId}`)
      .then((response) => {
        const project = response.data?.data || response.data;
        if (project?.id) setActiveProject(project);
      })
      .catch(() => undefined);
  }, []);

  const setActiveProject = (project: Project) => {
    localStorage.setItem(ACTIVE_PROJECT_KEY, project.id);
    setActiveProjectState(project);
  };

  const clearProject = () => {
    localStorage.removeItem(ACTIVE_PROJECT_KEY);
    setActiveProjectState(null);
  };

  return (
    <ActiveProjectContext.Provider value={{ activeProject, setActiveProject, clearProject, isLoading }}>
      {children}
    </ActiveProjectContext.Provider>
  );
}

export function useActiveProject() {
  const context = useContext(ActiveProjectContext);
  if (context === undefined) {
    throw new Error("useActiveProject must be used within an ActiveProjectProvider");
  }
  return context;
}
