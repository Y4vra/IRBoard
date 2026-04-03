import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { API_BASE_URL } from "../lib/globalVars";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Folder, Plus } from "lucide-react";
import { type Project } from "../types/project";
import { cn } from "@/lib/utils";

import { useAuth } from "@/context/AuthContext"

function Home() {
  const [projects, setProjects] = useState<Project[] | null>(null)
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { user, isAuthenticated, loading: authLoading } = useAuth();

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
  }, []);

  if (loading || authLoading) return (
    <div className="flex h-64 flex-col items-center justify-center gap-4 animate-in fade-in duration-500">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      <p className="text-slate-500 font-medium">Loading...</p>
    </div>
  );

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
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      <header className="flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-700">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            Projects
          </h1>
          <p className="text-slate-500 mt-1">Explore the projects you have access to.</p>
        </div>
        {user?.isAdmin && projects && projects.length > 0 && (
          <Button asChild className="shadow-md animate-in zoom-in-95 duration-500">
            <Link to="/projects/new" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Project
            </Link>
          </Button>
        )}
      </header>

      {!projects || projects.length === 0 ? (
        <Card className="p-16 text-center border-dashed bg-slate-50/50 animate-in fade-in zoom-in-95 duration-700">
          <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <Folder className="text-slate-400 h-6 w-6" />
          </div>
          <h3 className="text-lg font-medium text-slate-900">No projects found</h3>
          <p className="text-slate-500 max-w-xs mx-auto mt-2">
            It looks like you don't have any projects assigned yet or the system is empty.
          </p>
          {user?.isAdmin ? (
            <p className="mt-4">
              <Link to="/projects/new" className="text-indigo-600 hover:underline font-medium">
                Create your first project
              </Link>
            </p>
          ) : (
            <p className="mt-4 text-slate-400 text-sm">
              Please contact an administrator to be assigned to a project.
            </p>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
          {projects.map((project, index) => (
            <Card 
              key={project.id} 
              className={cn(
                "group flex flex-col h-full bg-card border-border/60 hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-md",
                "max-w-sm mx-auto w-full",
                index === 0 ? "delay-0" : "delay-75"
              )}
            >
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-none">
                    {project.priorityStyle}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {project.state.toLowerCase()}
                  </Badge>
                </div>
                <CardTitle className="text-xl line-clamp-1">{project.name}</CardTitle>
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
                <Button asChild className="w-full shadow-sm transition-colors">
                  <Link to={`/project/${project.id}`}>
                    More...
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;