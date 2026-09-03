export const ACTIVE_PROJECT_KEY = "cms-active-project-id";

export function getActiveProjectId(queryProjectId?: string | null) {
  if (queryProjectId) {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ACTIVE_PROJECT_KEY, queryProjectId);
    }
    return queryProjectId;
  }

  if (typeof window !== "undefined") {
    return window.localStorage.getItem(ACTIVE_PROJECT_KEY);
  }

  return null;
}

export function setActiveProjectId(projectId: string) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(ACTIVE_PROJECT_KEY, projectId);
  }
}
