import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { API_BASE_URL } from "../../lib/globalVars";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowLeft, Pencil, User, FileText, AlertTriangle } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

interface Requirement {
  id: number;
  identifier: string;
  name: string;
}

interface StakeholderDetail {
  id: number;
  identifier: string;
  name: string;
  description: string;
  active: boolean;
  pendingReview: boolean;
  linkedRequirements: Requirement[];
}

function StakeholderDetailView() {
  const { projectId, stakeholderId } = useParams<{ projectId: string; stakeholderId: string }>();
  const [stakeholder, setStakeholder] = useState<StakeholderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStakeholder = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/projects/${projectId}/stakeholders/${stakeholderId}`, {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        setStakeholder(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStakeholder();
  }, [projectId, stakeholderId]);

  if (loading) return <LoadingSpinner />;
  if (!stakeholder) return <div className="p-8 text-center text-red-500">Stakeholder not found.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-10 p-6 animate-in fade-in duration-500">
      <nav>
        <Button asChild variant="ghost" size="sm">
          <Link to={`/project/${projectId}/stakeholders`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Stakeholders
          </Link>
        </Button>
      </nav>

      <header className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl">
              <User className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-black tracking-tight">{stakeholder.name}</h1>
          </div>
          <Button variant="outline" size="sm">
            <Pencil className="mr-2 h-4 w-4" /> Modify Stakeholder
          </Button>
        </div>
        <div className="flex gap-2">
          {stakeholder.pendingReview && (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              <AlertTriangle className="h-3 w-3 mr-1" /> Pending Review
            </Badge>
          )}
          <Badge className={stakeholder.active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}>
            {stakeholder.active ? "Active" : "Deactivated"}
          </Badge>
        </div>
        <p className="text-xl text-muted-foreground leading-relaxed">{stakeholder.description}</p>
      </header>

      <section className="space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <FileText className="h-5 w-5 text-indigo-500" />
          Linked Requirements
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stakeholder.linkedRequirements.map((req) => (
            <Card key={req.id} className="hover:border-indigo-300 transition-colors cursor-pointer">
              <CardHeader className="p-4">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="font-mono text-[10px]">{req.identifier}</Badge>
                  <CardTitle className="text-sm">{req.name}</CardTitle>
                </div>
              </CardHeader>
            </Card>
          ))}
          {stakeholder.linkedRequirements.length === 0 && (
            <p className="text-sm text-slate-400 italic">No requirements linked to this stakeholder.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default StakeholderDetailView;