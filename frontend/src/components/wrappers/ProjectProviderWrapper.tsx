import { useParams, Outlet } from "react-router-dom";
import { useCallback } from "react";
import { API_BASE_URL } from "../../lib/globalVars";
import { useBackendResource } from "@/hooks/useBackendResource";
import { ProjectProvider } from "@/context/ProjectContext";
import LoadingSpinner from "@/components/LoadingSpinner";
import type { Project } from "@/types/Project";

export const ProjectProviderWrapper = () => {
  const { projectId } = useParams();

  const fetchProject = useCallback(
    () => fetch(`${API_BASE_URL}/projects/${projectId}`, { credentials: "include" })
      .then(r => { if (!r.ok) throw new Error("Failed to fetch project"); return r.json(); }),
    [projectId]
  );

  const { data, loading, refresh } = useBackendResource<Project>({ fetcher: fetchProject });

  if (loading) return <LoadingSpinner />;
  if (!data) return <Outlet />;

  return (
    <ProjectProvider value={{...data,refresh}}>
      <Outlet />
    </ProjectProvider>
  );
};