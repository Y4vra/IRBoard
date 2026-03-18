import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FolderPlus, 
  ArrowLeft, 
  LayoutGrid, 
  AlignLeft, 
  UserCircle,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function NewProject() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    client: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API Call
    setTimeout(() => {
      setLoading(false);
      navigate("/projects");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        <button
          onClick={() => navigate(-1)}
          className="group mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to projects
        </button>

        <div className="bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 mb-4">
              <FolderPlus className="h-6 w-6 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Create New Project</h1>
            <p className="text-slate-500 mt-1">Define the basic parameters for your requirement management workspace.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <LayoutGrid className="h-4 w-4 text-slate-400" />
                Project Name
              </label>
              <input
                required
                type="text"
                placeholder="e.g. IR-Board System"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all placeholder:text-slate-300"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <UserCircle className="h-4 w-4 text-slate-400" />
                Client / Organization
              </label>
              <input
                required
                type="text"
                placeholder="e.g. University of Oviedo"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all placeholder:text-slate-300"
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <AlignLeft className="h-4 w-4 text-slate-400" />
                Description
              </label>
              <textarea
                rows={4}
                placeholder="Provide a brief overview of the project's scope..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all placeholder:text-slate-300 resize-none"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="pt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/projects")}
                className="flex-1 px-6 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Initialize Project"
                )}
              </button>
            </div>
          </form>
        </div>
        
        <p className="text-center text-xs text-slate-400 mt-8">
          IR-Board Requirements Management Platform &bull; 2026
        </p>
      </div>
    </div>
  );
}