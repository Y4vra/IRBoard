import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { API_BASE_URL } from "@/lib/globalVars";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Pencil, ShieldCheck, FileText } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { RequirementStateBadge } from "@/components/RequirementStateBadge";

interface LinkedRequirement {
  id: number;
  identifier: string;
  name: string;
}

interface NonFunctionalRequirementDetail {
  id: number;
  identifier: string;
  name: string;
  description: string;
  state: string;
  pendingReview: boolean;
  linkedRequirements: LinkedRequirement[];
}

function NonFunctionalRequirementDetailView() {
  const { projectId, nfrId } = useParams<{
    projectId: string;
    nfrId: string;
  }>();
  const [requirement, setRequirement] = useState<NonFunctionalRequirementDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequirement = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/projects/${projectId}/nonFunctionalRequirements/${nfrId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        const data = await response.json();
        setRequirement(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequirement();
  }, [projectId, nfrId]);

  if (loading) return <LoadingSpinner />;
  if (!requirement) return (
    <div className="p-8 text-center text-red-500">Non-functional requirement not found.</div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-10 p-6 animate-in fade-in duration-500">
      <nav>
        <Button asChild variant="ghost" size="sm">
          <Link to={`/project/${projectId}/nfr`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Non-Functional Requirements
          </Link>
        </Button>
      </nav>

      <header className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-violet-100 text-violet-700 rounded-xl">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <div>
              <p className="text-xs font-mono text-slate-400 mb-1">{requirement.identifier}</p>
              <h1 className="text-4xl font-black tracking-tight">{requirement.name}</h1>
            </div>
          </div>
          <Button variant="outline" size="sm">
            <Pencil className="mr-2 h-4 w-4" /> Modify Requirement
          </Button>
        </div>
        <div className="flex gap-2">
          <RequirementStateBadge state={requirement.state} />
        </div>
        <p className="text-xl text-muted-foreground leading-relaxed">{requirement.description}</p>
      </header>

      <section className="space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <FileText className="h-5 w-5 text-violet-500" />
          Linked Requirements
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requirement.linkedRequirements?.map((req) => (
            <Card key={req.id} className="hover:border-violet-300 transition-colors cursor-pointer">
              <CardHeader className="p-4">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="font-mono text-[10px]">{req.identifier}</Badge>
                  <CardTitle className="text-sm">{req.name}</CardTitle>
                </div>
              </CardHeader>
            </Card>
          ))}
          {(!requirement.linkedRequirements || requirement.linkedRequirements.length === 0) && (
            <p className="text-sm text-slate-400 italic">No requirements linked to this non-functional requirement.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default NonFunctionalRequirementDetailView;
