import { useCallback } from "react";
import { useParams, Outlet } from "react-router-dom";
import { API_BASE_URL } from "@/lib/globalVars";
import { useBackendResource } from "@/hooks/useBackendResource";
import { FunctionalitiesProvider } from "@/context/FunctionalitiesContext";
import type { FunctionalitiesResponse } from "@/types/Functionality";

export function FunctionalitiesProviderWrapper() {
  const { projectId } = useParams();

  const fetchFunctionalities = useCallback(
    () => {
      if (!projectId) return Promise.reject("Project ID not available");
      return fetch(`${API_BASE_URL}/projects/${projectId}/functionalities`, {
        credentials: "include",
      }).then((r) => {
        if (!r.ok) throw new Error("Failed to fetch functionalities");
        return r.json();
      });
    },
    [projectId]
  );

  const { data, loading, error, refresh } = useBackendResource<FunctionalitiesResponse>({
    fetcher: fetchFunctionalities,
  });

  return (
    <FunctionalitiesProvider
      functionalities={data ?? null}
      loading={loading}
      error={error}
      refresh={refresh}
    >
      <Outlet />
    </FunctionalitiesProvider>
  );
}