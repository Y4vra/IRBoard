import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../../lib/globalVars";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Pencil, User, FileText, AlertTriangle, ChevronRight } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import type { FunctionalRequirementSummaryDTO, RequirementSummaryDTO } from "@/types/RequirementSummaryDTO";
import type { Stakeholder } from "@/types/Stakeholder";

function isFR(r: RequirementSummaryDTO): r is FunctionalRequirementSummaryDTO {
  return r.requirementType === "FR";
}

function requirementPath(r: RequirementSummaryDTO, projectId: string): string {
  if (isFR(r)) {
    return `/project/${projectId}/functionalities/${r.functionalityId}/functionalRequirements/${r.id}`;
  }
  return `/project/${projectId}/nfr/${r.id}`;
}

function StakeholderDetailView() {
  const { projectId, stakeholderId } = useParams<{ projectId: string; stakeholderId: string }>();
  const navigate = useNavigate();
  const [stakeholder, setStakeholder] = useState<Stakeholder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStakeholder = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/projects/${projectId}/stakeholders/${stakeholderId}`,
          { method: "GET", credentials: "include" }
        );
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

  const frRequirements = stakeholder.observers.filter(isFR);
  const nfrRequirements = stakeholder.observers.filter((r) => !isFR(r));

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
          <Badge className={stakeholder.state === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}>
            {stakeholder.state === "ACTIVE" ? "Active" : "Deactivated"}
          </Badge>
        </div>
        <p className="text-xl text-muted-foreground leading-relaxed">{stakeholder.description}</p>
      </header>

      <section className="space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <FileText className="h-5 w-5 text-indigo-500" />
          Linked Requirements
        </h2>

        {stakeholder.observers.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No requirements linked to this stakeholder.</p>
        ) : (
          <div className="space-y-6">

            {frRequirements.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Functional
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {frRequirements.map((r) => (
                    <Card
                      key={r.id}
                      className="hover:border-blue-300 transition-colors cursor-pointer"
                      onClick={() => navigate(requirementPath(r, projectId!))}
                    >
                      <CardHeader className="p-4">
                        <div className="flex items-center gap-3">
                          <Badge className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-semibold shrink-0">
                            FR
                          </Badge>
                          <CardTitle className="text-sm flex-1 truncate">{r.name}</CardTitle>
                          <Badge
                            variant="outline"
                            className="text-[10px] shrink-0"
                          >
                            {r.state}
                          </Badge>
                          <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
                        </div>
                        {r.description && (
                          <p className="text-xs text-slate-400 truncate mt-1 pl-9">{r.description}</p>
                        )}
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {nfrRequirements.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Non-functional
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {nfrRequirements.map((r) => (
                    <Card
                      key={r.id}
                      className="hover:border-green-300 transition-colors cursor-pointer"
                      onClick={() => navigate(requirementPath(r, projectId!))}
                    >
                      <CardHeader className="p-4">
                        <div className="flex items-center gap-3">
                          <Badge className="bg-green-50 text-green-700 border border-green-200 text-[10px] font-semibold shrink-0">
                            NFR
                          </Badge>
                          <CardTitle className="text-sm flex-1 truncate">{r.name}</CardTitle>
                          <Badge
                            variant="outline"
                            className="text-[10px] shrink-0"
                          >
                            {r.state}
                          </Badge>
                          <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
                        </div>
                        {r.description && (
                          <p className="text-xs text-slate-400 truncate mt-1 pl-9">{r.description}</p>
                        )}
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </section>
    </div>
  );
}

export default StakeholderDetailView;