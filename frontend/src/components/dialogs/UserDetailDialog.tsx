import { useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { API_BASE_URL } from "@/lib/globalVars"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  User,
  Mail,
  ShieldCheck,
  FolderKanban,
  Layers,
  Users,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { useBackendResource } from "@/hooks/useBackendResource"
import { useAuth } from "@/context/AuthContext"
import type { User as UserType } from "@/types/User"
import { Button } from "../ui/button"

interface UserDetailDialogProps {
  userId: number
}

function ClickableList({
  items,
  emptyText,
  buildHref,
  icon,
}: {
  items: string[] | null
  emptyText: string
  buildHref: (item: string) => string
  icon: React.ReactNode
}) {
  const navigate = useNavigate()

  if (!items || items.length === 0) {
    return <p className="text-sm text-slate-400 italic py-2">{emptyText}</p>
  }

  return (
    <div className="space-y-1.5">
      {items.map((item) => (
        <button
          key={item}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg border bg-card hover:bg-accent/40 transition-colors cursor-pointer"
          onClick={() => navigate(buildHref(item))}
        >
          <div className="p-1 bg-primary/10 text-primary rounded shrink-0">{icon}</div>
          <span className="text-sm font-mono flex-1 truncate">{item}</span>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />
        </button>
      ))}
    </div>
  )
}

export function UserDetailDialog({ userId}: UserDetailDialogProps) {
  const { isAuthenticated } = useAuth()
  
  const fetchUser = useCallback(
    () =>
      fetch(`${API_BASE_URL}/users/${userId}`, { credentials: "include" }).then((r) => {
        if (!r.ok) throw new Error("Failed to fetch user")
        return r.json()
      }),
    [userId]
  )

  const { data: user, loading, error } = useBackendResource<UserType>({
    fetcher: fetchUser,
    enabled: isAuthenticated,
  })

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-slate-600 hover:text-indigo-600"
          >
          <User className="h-4 w-4 mr-2" />
          View details
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
          </div>
        ) : error || !user ? (
          <div className="flex flex-col items-center py-10 text-center gap-3">
            <AlertCircle className="h-8 w-8 text-red-400" />
            <p className="text-red-500 text-sm">{error ?? "User not found"}</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg font-black">
                    {user.name} {user.surname}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {user.active ? (
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 uppercase text-[10px]">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="uppercase text-[10px]">
                        Deactivated
                      </Badge>
                    )}
                    {user.isAdmin && (
                      <Badge
                        variant="outline"
                        className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1 text-[10px]"
                      >
                        <ShieldCheck className="h-3 w-3" /> Admin
                      </Badge>
                    )}
                  </div>
                </div>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-5 pt-2">
              {/* Contact */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground px-1">
                <Mail className="h-4 w-4 shrink-0" />
                <span>{user.email}</span>
              </div>

              {/* Projects */}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <FolderKanban className="h-3.5 w-3.5" /> Projects as Manager
                  <Badge variant="outline" className="ml-auto font-mono text-[10px]">
                    {user.projectsWhereUserIsManager?.length ?? 0}
                  </Badge>
                </p>
                <ClickableList
                  items={user.projectsWhereUserIsManager}
                  emptyText="Not a manager on any project."
                  buildHref={(id) => `/project/${id}`}
                  icon={<FolderKanban className="h-3 w-3" />}
                />
              </div>

              {/* Engineer */}
              <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Layers className="h-3.5 w-3.5" /> Functionalities as Engineer
                  <Badge variant="outline" className="ml-auto font-mono text-[10px]">
                  {user.functionalitiesWhereUserIsEngineer
                      ? Object.values(user.functionalitiesWhereUserIsEngineer).flat().length
                      : 0}
                  </Badge>
              </p>  
              {user.functionalitiesWhereUserIsEngineer ? (
                  Object.entries(user.functionalitiesWhereUserIsEngineer).map(
                  ([projectId, functionalities]) => (
                      <div key={projectId} className="space-y-1.5">
                      <p className="text-[10px] font-mono text-slate-400 px-2">{`Project ${projectId}`}</p>
                      <ClickableList
                          items={functionalities}
                          emptyText="No functionalities assigned."
                          buildHref={(funcId) => `/project/${projectId}/functionalities/${funcId}`}
                          icon={<Layers className="h-3 w-3" />}
                      />
                      </div>
                  )
                  )
              ) : (
                  <p className="text-sm text-slate-400 italic py-2">Not assigned as engineer on any functionality.</p>
              )}
              </div>  
              {/* Stakeholder */}
              <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Users className="h-3.5 w-3.5" /> Functionalities as Stakeholder
                  <Badge variant="outline" className="ml-auto font-mono text-[10px]">
                  {user.functionalitiesWhereUserIsStakeholder
                      ? Object.values(user.functionalitiesWhereUserIsStakeholder).flat().length
                      : 0}
                  </Badge>
              </p>  
              {user.functionalitiesWhereUserIsStakeholder ? (
                  Object.entries(user.functionalitiesWhereUserIsStakeholder).map(
                  ([projectId, functionalities]) => (
                      <div key={projectId} className="space-y-1.5">
                      <p className="text-[10px] font-mono text-slate-400 px-2">{`Project ${projectId}`}</p>
                      <ClickableList
                          items={functionalities}
                          emptyText="No functionalities assigned."
                          buildHref={(funcId) => `/project/${projectId}/functionalities/${funcId}`}
                          icon={<Users className="h-3 w-3" />}
                      />
                      </div>
                  )
                  )
              ) : (
                  <p className="text-sm text-slate-400 italic py-2">Not assigned as stakeholder on any functionality.</p>
              )}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}