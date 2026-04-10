/**
 * 
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { API_BASE_URL } from "../../lib/globalVars";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    ArrowLeft,
    Plus,
    Pencil,
    PowerOff,
    Power,
    Box,
    AlertCircle,
} from "lucide-react";
import { type Functionality } from "../../types/functionality";
import LoadingSpinner from "@/components/LoadingSpinner";
import { cn } from "@/lib/utils";

type ModalMode = "create" | "edit" | null;

interface FormState {
    name: string;
    identifier: string;
    description: string;
}

const EMPTY_FORM: FormState = { name: "", identifier: "", description: "" };

function deriveIdentifier(name: string, existingIdentifiers: string[], currentLength = 1): string {
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (!words.length) return "";
    const candidate = words.map((w) => w[0]?.toUpperCase() ?? "").join("").slice(0, currentLength * words.length > name.length ? undefined : currentLength);
    // take first `currentLength` chars of each word
    const id = words.map((w) => w.slice(0, currentLength).toUpperCase()).join("");
    if (!existingIdentifiers.includes(id)) return id;
    if (currentLength > 10) return "";
    return deriveIdentifier(name, existingIdentifiers, currentLength + 1);
}

function FunctionalitiesView() {
  const { id: projectId } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  const [functionalities, setFunctionalities] = useState<Functionality[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [identifierTouched, setIdentifierTouched] = useState(false);
  
  const isProjectManager = user?.isAdmin || user?.projectRole === "ProjectManager";
  
  useEffect(() => {
    fetchFunctionalities();
  }, [projectId]);

  const fetchFunctionalities = async () => {
    try {
        const res = await fetch(`${API_BASE_URL}/projects/${projectId}/functionalities`, {
            credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to load functionalities");
        setFunctionalities(await res.json());
    } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
        setLoading(false);
    }
};

const openCreate = () => {
    setForm(EMPTY_FORM);
    setIdentifierTouched(false);
    setFormError(null);
    setEditingId(null);
    setModalMode("create");
};

const openEdit = (f: Functionality) => {
    setForm({ name: f.name, identifier: f.identifier, description: f.description ?? "" });
    setIdentifierTouched(true);
    setFormError(null);
    setEditingId(f.id);
    setModalMode("edit");
};

const handleNameChange = (value: string) => {
    setForm((prev) => {
      const existing = functionalities
      .filter((f) => f.id !== editingId)
        .map((f) => f.identifier);
        const autoId = identifierTouched ? prev.identifier : deriveIdentifier(value, existing);
        return { ...prev, name: value, identifier: autoId };
    });
};

const handleIdentifierChange = (value: string) => {
    setIdentifierTouched(true);
    setForm((prev) => ({ ...prev, identifier: value.toUpperCase().replace(/[^A-Z]/g, "") }));
};

const handleSubmit = async () => {
    if (!form.name.trim()) return setFormError("Name is required.");
    if (!form.identifier.trim()) return setFormError("Identifier is required.");
    const conflicting = functionalities.find(
        (f) => f.identifier === form.identifier && f.id !== editingId
    );
    if (conflicting) return setFormError("Identifier is already in use by another functionality.");
    
    setSubmitting(true);
    setFormError(null);
    try {
        const url =
        modalMode === "create"
        ? `${API_BASE_URL}/projects/${projectId}/functionalities`
        : `${API_BASE_URL}/projects/${projectId}/functionalities/${editingId}`;
        const res = await fetch(url, {
            method: modalMode === "create" ? "POST" : "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data?.message ?? "Request failed");
        }
        await fetchFunctionalities();
        setModalMode(null);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Unknown error");
    } finally {
        setSubmitting(false);
    }
};

const toggleState = async (f: Functionality) => {
    const isDeactivating = f.state === "ACTIVE";
    try {
        const res = await fetch(
            `${API_BASE_URL}/projects/${projectId}/functionalities/${f.id}/${isDeactivating ? "deactivate" : "activate"}`,
            { method: "PATCH", credentials: "include" }
        );
        if (!res.ok) throw new Error("Failed to update state");
        await fetchFunctionalities();
    } catch (err) {
        console.error(err);
    }
};

if (loading) return <LoadingSpinner />;

if (error)
return (
<div className="mx-auto max-w-md mt-10 p-6 bg-red-50 border border-red-100 rounded-xl text-center">
<p className="text-red-600 font-semibold">Something went wrong</p>
<p className="text-red-500 text-sm mt-1">{error}</p>
<Button variant="outline" className="mt-4" onClick={fetchFunctionalities}>
Retry
</Button>
</div>
);

return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
    <nav>
    <Button asChild variant="ghost" size="sm">
    <Link to={`/project/${projectId}`}>
    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Project
    </Link>
    </Button>
    </nav>
    
    <header className="flex items-center justify-between">
    <div>
    <h1 className="text-3xl font-extrabold text-slate-900">Functionalities</h1>
    <p className="text-slate-500 mt-1">Manage the functional areas of this project.</p>
    </div>
    {isProjectManager && (
        <Button onClick={openCreate} className="shadow-md">
        <Plus className="h-4 w-4 mr-2" /> New Functionality
        </Button>
    )}
    </header>
    
    {functionalities.length === 0 ? (
        <Card className="p-16 text-center border-dashed bg-slate-50/50">
        <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <Box className="text-slate-400 h-6 w-6" />
        </div>
        <h3 className="text-lg font-medium text-slate-900">No functionalities yet</h3>
        <p className="text-slate-500 max-w-xs mx-auto mt-2">
        Add the first functional area to start organizing requirements.
        </p>
        {isProjectManager && (
            <Button onClick={openCreate} className="mt-6">
            <Plus className="h-4 w-4 mr-2" /> Add Functionality
            </Button>
        )}
        </Card>
    ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {functionalities.map((f) => (
            <Card
              key={f.id}
              className={cn(
                "group flex flex-col h-full border-border/60 transition-all duration-300 shadow-sm hover:shadow-md",
                f.state === "DEACTIVATED" && "opacity-60"
            )}
            >
              <CardHeader>
              <div className="flex justify-between items-start mb-2">
              <Badge
              variant="secondary"
              className="font-mono text-xs bg-indigo-50 text-indigo-700 border-none"
              >
              {f.identifier}
              </Badge>
              <Badge
              variant="outline"
              className={cn(
                "capitalize text-xs",
                f.state === "ACTIVE"
                ? "border-green-200 text-green-700"
                : "border-slate-200 text-slate-500"
            )}
            >
            {f.state.toLowerCase()}
            </Badge>
            </div>
            <CardTitle className="text-lg line-clamp-1">{f.name}</CardTitle>
            <CardDescription className="line-clamp-3 min-h-[3.5rem]">
            {f.description || "No description provided."}
            </CardDescription>
            </CardHeader>
            
              <CardContent className="mt-auto">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              ID: {f.id.toString().slice(0, 8)}...
              </div>
              </CardContent>
              
              {isProjectManager && (
                <CardFooter className="border-t bg-slate-50/50 p-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEdit(f)}
                    >
                    <Pencil className="h-3.5 w-3.5 mr-1.5" /> Edit
                    </Button>
                    <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                        "flex-1",
                        f.state === "ACTIVE"
                        ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                        : "text-green-600 hover:text-green-700 hover:bg-green-50"
                    )}
                    onClick={() => toggleState(f)}
                    >
                    {f.state === "ACTIVE" ? (
                        <>
                        <PowerOff className="h-3.5 w-3.5 mr-1.5" /> Deactivate
                        </>
                    ) : (
                        <>
                        <Power className="h-3.5 w-3.5 mr-1.5" /> Reactivate
                        </>
                    )}
                    </Button>
                    </CardFooter>
                )}
                </Card>
            ))}
        </div>
    )}

    <Dialog open={modalMode !== null} onOpenChange={(open) => !open && setModalMode(null)}>
    <DialogContent className="sm:max-w-md">
    <DialogHeader>
    <DialogTitle>
    {modalMode === "create" ? "New Functionality" : "Edit Functionality"}
    </DialogTitle>
    <DialogDescription>
    {modalMode === "create"
    ? "Add a new functional area to this project."
    : "Update the details of this functionality."}
    </DialogDescription>
    </DialogHeader>
    
    <div className="space-y-4 py-2">
    <div className="space-y-1.5">
    <Label htmlFor="fn-name">Name</Label>
    <Input
                id="fn-name"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. User Management"
                />
                </div>
                
                <div className="space-y-1.5">
              <Label htmlFor="fn-id">
              Identifier{" "}
              <span className="text-xs text-muted-foreground font-normal">
                  (auto-generated, must be unique)
                  </span>
                  </Label>
                  <Input
                  id="fn-id"
                  value={form.identifier}
                  onChange={(e) => handleIdentifierChange(e.target.value)}
                  placeholder="e.g. UM"
                  className="font-mono uppercase"
                  maxLength={10}
                  />
                  </div>
                  
                  <div className="space-y-1.5">
                  <Label htmlFor="fn-desc">Description</Label>
                  <Textarea
                  id="fn-desc"
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Describe what this functionality covers..."
                  rows={3}
                  />
                  </div>
                  
                  {formError && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-md text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    {formError}
                    </div>
                )}
                </div>
                
                <DialogFooter>
                <Button variant="outline" onClick={() => setModalMode(null)} disabled={submitting}>
                Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Saving..." : modalMode === "create" ? "Create" : "Save Changes"}
                </Button>
                </DialogFooter>
                </DialogContent>
                </Dialog>
                </div>
            );
        }

export default FunctionalitiesView;
        */