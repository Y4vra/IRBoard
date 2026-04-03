import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { API_BASE_URL } from "../../lib/globalVars";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Settings, 
  Users, 
  ShieldAlert, 
  FileText, 
  Box, 
  ArrowLeft, 
  ChevronRight,
  Activity
} from "lucide-react";
import { type Project } from "../../types/project";

function ProjectView() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
          method: 'GET',
          credentials: 'include',
        });
        if (!response.ok) throw new Error('Failed to fetch project details');
        const data = await response.json();
        setProject(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    </div>
  );

  if (error || !project) return (
    <div className="p-8 text-center">
      <p className="text-destructive font-semibold">Error: {error || "Project not found"}</p>
      <Button asChild variant="link" className="mt-4">
        <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
      </Button>
    </div>
  );

  const navigationLinks = [
    {
      title: "Functionalities",
      description: "Manage core features and functional requirements.",
      href: `/project/${id}/functionalities`,
      icon: <Box className="h-6 w-6" />
    },
    {
      title: "Stakeholders",
      description: "Identify and manage project actors and interest groups.",
      href: `/project/${id}/stakeholders`,
      icon: <Users className="h-6 w-6" />
    },
    {
      title: "Non-Functional Requirements",
      description: "Security, performance, and technical constraints.",
      href: `/project/${id}/nfr`,
      icon: <ShieldAlert className="h-6 w-6" />
    },
    {
      title: "Documents",
      description: "Technical documentation and linked project files.",
      href: `/project/${id}/documents`,
      icon: <FileText className="h-6 w-6" />
    }
  ];

  return (
    <div className="max-w-[1600px] mx-auto space-y-12 animate-in fade-in duration-500">
      <nav className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects</Link>
        </Button>
        {user?.isAdmin && (
          <Button asChild variant="outline" size="sm">
            <Link to={`/project/${id}/edit`}>
              <Settings className="mr-2 h-4 w-4" /> Edit Project
            </Link>
          </Button>
        )}
      </nav>

      <header className="space-y-4">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-black tracking-tight">{project.name}</h1>
          <Badge className="bg-primary/10 text-primary border-none uppercase text-xs">
            {project.priorityStyle}
          </Badge>
        </div>
        <p className="text-xl text-muted-foreground max-w-4xl leading-relaxed">
          {project.description || "No project description available."}
        </p>
        <div className="flex items-center gap-6 text-sm text-muted-foreground pt-2">
          <div className="flex items-center gap-1.5 font-bold text-foreground/80">
            <Activity className="h-4 w-4" />
            {project.state}
          </div>
          <div className="font-mono opacity-50">
            REF: {project.id.toString().slice(0, 12)}
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {navigationLinks.map((link) => (
          <Link key={link.href} to={link.href} className="group">
            <Card className="h-full transition-all duration-300 hover:border-primary hover:shadow-lg hover:shadow-primary/5 group-hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-primary/5 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {link.icon}
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold">{link.title}</CardTitle>
                    <CardDescription className="mt-1">{link.description}</CardDescription>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardHeader>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  );
}

export default ProjectView;