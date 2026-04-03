import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FolderPlus, 
  ArrowLeft, 
  LayoutGrid, 
  AlignLeft, 
  UserCircle,
  Loader2,
  AlertCircle,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "../../lib/globalVars";
import { Button } from "../../components/ui/button";

export default function NewProject() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    client: "",
    priorityStyle: "TERNARY" // Valor por defecto
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!API_BASE_URL) {
      setError("La variable de entorno 'api_domain' no está configurada.");
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/projects/new`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("You must be an admin to perform this action.");
        }
        throw new Error('An error occurred while creating the project');
      }

      navigate("/projects");
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8 flex flex-col items-center justify-center text-foreground">
      <div className="w-full max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        <button
          onClick={() => navigate(-1)}
          className="group mb-6 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors bg-transparent border-none cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to projects
        </button>

        <div className="bg-card border border-border rounded-3xl shadow-xl overflow-hidden">
          <div className="p-8 border-b border-border bg-muted/20">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 mb-4">
              <FolderPlus className="h-6 w-6 text-primary"/>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Create New Project</h1>
            <p className="text-muted-foreground mt-1">Define the basic parameters for your requirement management workspace.</p>
          </div>

          {error && (
            <div className="mx-8 mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3 text-destructive animate-in zoom-in-95">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <LayoutGrid className="h-4 w-4 text-muted-foreground"/>
                Project Name
              </label>
              <input
                required
                type="text"
                placeholder="e.g. IR-Board System"
                className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all placeholder:text-muted-foreground/50"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <UserCircle className="h-4 w-4 text-muted-foreground" />
                Client / Organization
              </label>
              <input
                required
                type="text"
                placeholder="e.g. University of Oviedo"
                className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all placeholder:text-muted-foreground/50"
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                Priority Strategy
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, priorityStyle: "TERNARY" })}
                  className={cn(
                    "px-4 py-3 rounded-xl border text-sm font-medium transition-all",
                    formData.priorityStyle === "TERNARY" 
                      ? "bg-primary text-primary-foreground border-primary shadow-md" 
                      : "bg-background text-muted-foreground border-input hover:border-primary/50"
                  )}
                >
                  Ternary (High/Med/Low)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, priorityStyle: "MOSCOW" })}
                  className={cn(
                    "px-4 py-3 rounded-xl border text-sm font-medium transition-all",
                    formData.priorityStyle === "MOSCOW" 
                      ? "bg-primary text-primary-foreground border-primary shadow-md" 
                      : "bg-background text-muted-foreground border-input hover:border-primary/50"
                  )}
                >
                  MoSCoW Method
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <AlignLeft className="h-4 w-4 text-muted-foreground" />
                Description
              </label>
              <textarea
                rows={4}
                placeholder="Provide a brief overview of the project's scope..."
                className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all placeholder:text-muted-foreground/50 resize-none"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="pt-4 flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/projects")}
                className="flex-1 rounded-xl h-12"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-xl h-12 shadow-lg"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Initialize Project"
                )}
              </Button>
            </div>
          </form>
        </div>
        
        <p className="text-center text-xs text-muted-foreground/60 mt-8 uppercase tracking-widest">
          IR-Board Requirements Management &bull; 2026
        </p>
      </div>
    </div>
  );
}