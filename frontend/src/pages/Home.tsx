import { useEffect, useState, useMemo, useCallback } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { API_BASE_URL } from "../lib/globalVars";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Link } from "react-router-dom";
import { ArrowRight, Folder, Plus, Search, X, ChevronLeft, ChevronRight, Filter, Archive } from "lucide-react";
import { ProjectStateBadge } from "@/components/badges/ProjectStateBadge";
import { type Project } from "../types/Project";
import { cn } from "@/lib/utils";

import { useAuth } from "@/context/AuthContext"
import LoadingSpinner from "@/components/LoadingSpinner";
import { useLocks } from "@/hooks/useLocks";
import { LockIndicator } from "@/components/LockIndicator";
import { EntityType } from "@/lib/lockUtils";
import type { ViewMode } from "@/types/ViewMode";
import { ViewToggle } from "@/components/ViewToggle";

const PROJECTS_PER_PAGE = 12;
const PAGINATION_THRESHOLD = PROJECTS_PER_PAGE;

type SortOption = "name_asc" | "name_desc" | "state" | "priority";

// ── Home ──────────────────────────────────────────────────────────────────────

function Home() {
  const [projects, setProjects] = useState<Project[] | null>(null)
  const [removedProjects, setRemovedProjects] = useState<Project[] | null>(null)
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingRemoved, setLoadingRemoved] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("active");

  // Search & filter state
  const [search, setSearch] = useState("");
  const [activeStates, setActiveStates] = useState<Set<string>>(new Set());
  const [activePriorities, setActivePriorities] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<SortOption>("name_asc");
  const [currentPage, setCurrentPage] = useState(1);

  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { getLock } = useLocks();

  const isAdmin = user?.isAdmin ?? false;

  // Fetch active projects
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/home`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) throw new Error('Error connecting with the API');
        const result = await response.json();
        setProjects(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    if (API_BASE_URL && !authLoading && isAuthenticated) {
      fetchData();
    } else {
      setError("Enviroment variable 'api_domain' is not properly configured, or the authentication context failed.");
      setLoading(false);
    }
  }, [authLoading, isAuthenticated]);

  // Fetch removed projects — lazy, only fires once on first switch to "removed"
  const fetchRemovedProjects = useCallback(async () => {
    if (removedProjects !== null) return;
    setLoadingRemoved(true);
    try {
      const response = await fetch(`${API_BASE_URL}/projects/removed`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Error fetching removed projects');
      setRemovedProjects(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoadingRemoved(false);
    }
  }, [removedProjects]);

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    setSearch("");
    setActiveStates(new Set());
    setActivePriorities(new Set());
    setSortBy("name_asc");
    if (mode === "removed") fetchRemovedProjects();
  };

  const currentProjects = viewMode === "active" ? projects : removedProjects;

  // Derive unique filter options from the data
  const allStates = useMemo(() => {
    if (!currentProjects) return [];
    return Array.from(new Set(currentProjects.map(p => p.state))).sort();
  }, [currentProjects]);

  const allPriorities = useMemo(() => {
    if (!currentProjects) return [];
    return Array.from(new Set(currentProjects.map(p => p.priorityStyle))).sort();
  }, [currentProjects]);

  // Filtered + sorted list
  const filteredProjects = useMemo(() => {
    if (!currentProjects) return [];

    let result = currentProjects.filter(p => {
      const matchesSearch =
        search.trim() === "" ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.description?.toLowerCase().includes(search.toLowerCase()) ?? false);

      const matchesState = activeStates.size === 0 || activeStates.has(p.state);
      const matchesPriority = activePriorities.size === 0 || activePriorities.has(p.priorityStyle);

      return matchesSearch && matchesState && matchesPriority;
    });

    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "name_asc": return a.name.localeCompare(b.name);
        case "name_desc": return b.name.localeCompare(a.name);
        case "state": return a.state.localeCompare(b.state);
        case "priority": return a.priorityStyle.localeCompare(b.priorityStyle);
        default: return 0;
      }
    });

    return result;
  }, [currentProjects, search, activeStates, activePriorities, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredProjects.length / PROJECTS_PER_PAGE);
  const showPagination = filteredProjects.length > PAGINATION_THRESHOLD;
  const paginatedProjects = showPagination
    ? filteredProjects.slice((currentPage - 1) * PROJECTS_PER_PAGE, currentPage * PROJECTS_PER_PAGE)
    : filteredProjects;

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeStates, activePriorities, sortBy]);

  const toggleSet = (set: Set<string>, value: string): Set<string> => {
    const next = new Set(set);
    if (next.has(value)) { next.delete(value); } else { next.add(value); }
    return next;
  };

  const hasActiveFilters = search.trim() !== "" || activeStates.size > 0 || activePriorities.size > 0;

  const clearFilters = () => {
    setSearch("");
    setActiveStates(new Set());
    setActivePriorities(new Set());
    setSortBy("name_asc");
  };

  if (loading || authLoading || (viewMode === "removed" && loadingRemoved)) return <LoadingSpinner />;

  if (error) return (
    <div className="mx-auto max-w-md mt-10 p-6 bg-red-50 border border-red-100 rounded-xl text-center animate-in zoom-in-95 duration-300">
      <p className="text-red-600 font-semibold">Whoops! Something went wrong</p>
      <p className="text-red-500 text-sm mt-1">{error}</p>
      <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
        Retry
      </Button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-6">
      {/* Header */}
      <header className="flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-700">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">Projects</h1>
          <p className="text-slate-500 mt-1">
            {viewMode === "removed"
              ? "Removed projects archive. Visible to administrators only."
              : "Explore the projects you have access to."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <ViewToggle
              mode={viewMode}
              onChange={handleViewModeChange}
              activeCount={projects?.length}
              removedCount={removedProjects?.length}
            />
          )}
          {isAdmin && viewMode === "active" && projects && projects.length > 0 && (
            <Button asChild className="shadow-md animate-in zoom-in-95 duration-500">
              <Link to="/projects/new" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Project
              </Link>
            </Button>
          )}
        </div>
      </header>

      {/* Removed projects banner */}
      {viewMode === "removed" && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-100 bg-amber-50 px-4 py-2.5 text-sm text-amber-700 animate-in fade-in duration-300">
          <Archive className="h-4 w-4 shrink-0" />
          <span>These projects have been removed and are no longer active. Visible to administrators only.</span>
        </div>
      )}

      {/* Search & Filter bar — only shown when there are projects */}
      {currentProjects && currentProjects.length > 0 && (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-500">
          {/* Search + Sort row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <Input
                placeholder="Search by name or description…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-9"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortOption)}
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring text-slate-700 cursor-pointer"
            >
              <option value="name_asc">Name A → Z</option>
              <option value="name_desc">Name Z → A</option>
              <option value="state">By State</option>
              <option value="priority">By Priority</option>
            </select>
          </div>

          {/* Filter chips */}
          {(allStates.length > 1 || allPriorities.length > 1) && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1 text-xs text-slate-500 font-medium shrink-0">
                <Filter className="h-3 w-3" /> Filter:
              </span>

              {allStates.length > 1 && allStates.map(state => (
                <button
                  key={state}
                  onClick={() => setActiveStates(prev => toggleSet(prev, state))}
                  className={cn(
                    "px-2.5 py-0.5 rounded-full text-xs font-medium border transition-all duration-150 cursor-pointer capitalize",
                    activeStates.has(state)
                      ? "bg-slate-800 text-white border-slate-800 shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                  )}
                >
                  {state.toLowerCase()}
                </button>
              ))}

              {allStates.length > 1 && allPriorities.length > 1 && (
                <span className="w-px h-4 bg-slate-200 mx-1" />
              )}

              {allPriorities.length > 1 && allPriorities.map(priority => (
                <button
                  key={priority}
                  onClick={() => setActivePriorities(prev => toggleSet(prev, priority))}
                  className={cn(
                    "px-2.5 py-0.5 rounded-full text-xs font-medium border transition-all duration-150 cursor-pointer",
                    activePriorities.has(priority)
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                      : "bg-indigo-50 text-indigo-700 border-indigo-100 hover:border-indigo-300"
                  )}
                >
                  {priority}
                </button>
              ))}

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="ml-1 flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="h-3 w-3" /> Clear all
                </button>
              )}
            </div>
          )}

          {/* Result count */}
          <p className="text-xs text-slate-400">
            {hasActiveFilters
              ? `${filteredProjects.length} of ${currentProjects.length} project${currentProjects.length !== 1 ? "s" : ""} match`
              : `${currentProjects.length} project${currentProjects.length !== 1 ? "s" : ""}`}
            {showPagination && ` — page ${currentPage} of ${totalPages}`}
          </p>
        </div>
      )}

      {/* Empty states */}
      {(!currentProjects || currentProjects.length === 0) ? (
        <Card className="p-16 text-center border-dashed bg-slate-50/50 animate-in fade-in zoom-in-95 duration-700">
          <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            {viewMode === "removed"
              ? <Archive className="text-slate-400 h-6 w-6" />
              : <Folder className="text-slate-400 h-6 w-6" />}
          </div>
          <h3 className="text-lg font-medium text-slate-900">
            {viewMode === "removed" ? "No removed projects" : "No projects found"}
          </h3>
          <p className="text-slate-500 max-w-xs mx-auto mt-2">
            {viewMode === "removed"
              ? "There are no removed projects in the system."
              : "It looks like you don't have any projects assigned yet or the system is empty."}
          </p>
          {viewMode === "active" && (
            user?.isAdmin ? (
              <p className="mt-4">
                <Link to="/projects/new" className="text-indigo-600 hover:underline font-medium">
                  Create your first project
                </Link>
              </p>
            ) : (
              <p className="mt-4 text-slate-400 text-sm">
                Please contact an administrator to be assigned to a project.
              </p>
            )
          )}
        </Card>
      ) : filteredProjects.length === 0 ? (
        <Card className="p-12 text-center border-dashed bg-slate-50/50 animate-in fade-in zoom-in-95 duration-300">
          <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <Search className="text-slate-400 h-6 w-6" />
          </div>
          <h3 className="text-lg font-medium text-slate-900">No matches</h3>
          <p className="text-slate-500 max-w-xs mx-auto mt-2">
            No projects match your current search or filters.
          </p>
          <Button variant="outline" className="mt-4" onClick={clearFilters}>
            Clear filters
          </Button>
        </Card>
      ) : (
        <>
          {/* Project grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
            {paginatedProjects.map((project, index) => (
              <Card
                key={project.id}
                className={cn(
                  "group flex flex-col h-full border-border/60 transition-all duration-300 shadow-sm",
                  viewMode === "removed"
                    ? "bg-slate-50/80 opacity-75 hover:opacity-100 hover:border-amber-300/60 hover:shadow-md"
                    : "bg-card hover:border-primary/40 hover:shadow-md",
                  "max-w-sm mx-auto w-full",
                  index === 0 ? "delay-0" : "delay-75"
                )}
              >
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className={cn(
                      "border-none",
                      viewMode === "removed"
                        ? "bg-slate-100 text-slate-500"
                        : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                    )}>
                      {project.priorityStyle}
                    </Badge>
                    <div className="flex items-center gap-2">
                      {viewMode === "active" && (
                        <LockIndicator lock={getLock(EntityType.PROJECT, Number(project.id))} />
                      )}
                      <ProjectStateBadge state={project.state} />
                    </div>
                  </div>
                  <CardTitle className={cn("text-xl line-clamp-1", viewMode === "removed" && "text-slate-500")}>
                    {project.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-3 min-h-[4.5rem]">
                    {project.description || "No description provided."}
                  </CardDescription>
                </CardHeader>

                <CardContent className="mt-auto">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    Reference ID: {project.id.toString().slice(0, 8)}...
                  </div>
                </CardContent>

                <CardFooter className="border-t bg-slate-50/50 p-4">
                  <Button
                    asChild
                    variant={viewMode === "removed" ? "outline" : "default"}
                    className="w-full shadow-sm transition-colors"
                  >
                    <Link to={`/project/${project.id}`}>
                      More...
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {showPagination && (
            <div className="flex items-center justify-center gap-2 pt-2 animate-in fade-in duration-300">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page =>
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 1
                  )
                  .reduce<(number | "...")[]>((acc, page, idx, arr) => {
                    if (idx > 0 && page - (arr[idx - 1] as number) > 1) acc.push("...");
                    acc.push(page);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    item === "..." ? (
                      <span key={`ellipsis-${idx}`} className="px-1 text-slate-400 text-sm select-none">…</span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => setCurrentPage(item as number)}
                        className={cn(
                          "h-8 w-8 rounded-md text-sm font-medium transition-colors",
                          currentPage === item
                            ? "bg-slate-900 text-white"
                            : "text-slate-600 hover:bg-slate-100"
                        )}
                      >
                        {item}
                      </button>
                    )
                  )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Home;