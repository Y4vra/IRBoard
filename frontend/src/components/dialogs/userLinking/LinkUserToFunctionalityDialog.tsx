import { useCallback, useState } from "react"
import { API_BASE_URL } from "@/lib/globalVars"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Search, Users, Loader2, Wrench, Eye, UserMinus, Check } from "lucide-react"
import LoadingSpinner from "@/components/LoadingSpinner"
import { useBackendResource } from "@/hooks/useBackendResource"
import type { User } from "@/types/User"

interface FunctionalityUsersMap {
  project_managers: User[]
  requirement_engineers: User[]
  stakeholders: User[]
  others: User[]
}

type AssignableRole = "engineers" | "stakeholders"

interface LinkUserToFunctionalityDialogProps {
  projectId: string
  functionalityId: string
  canManage: boolean
}

export function LinkUserToFunctionalityDialog({
  projectId,
  functionalityId,
  canManage,
}: LinkUserToFunctionalityDialogProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [linking, setLinking] = useState<number | null>(null)
  const [unlinking, setUnlinking] = useState<number | null>(null)

  const fetcher = useCallback(
    () =>
      fetch(`${API_BASE_URL}/users/linking/${projectId}/${functionalityId}`, {
        credentials: "include",
      }).then((r) => {
        if (!r.ok) throw new Error("Failed to fetch users")
        return r.json()
      }),
    [projectId, functionalityId]
  )

  const { data: users, loading, refresh } = useBackendResource<FunctionalityUsersMap>({ fetcher })

  const linkUser = async (userId: number, role: AssignableRole) => {
    setLinking(userId)
    try {
      const endpoint = role === "engineers" ? "engineer" : "stakeholder"
      const res = await fetch(
        `${API_BASE_URL}/users/linking/${projectId}/${functionalityId}/${endpoint}`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userId),
        }
      )
      if (!res.ok) throw new Error("Failed to link user")
      refresh()
    } finally {
      setLinking(null)
    }
  }

  const unlinkUser = async (userId: number, role: AssignableRole) => {
    setUnlinking(userId)
    try {
      const endpoint = role === "engineers" ? "engineer" : "stakeholder"
      const res = await fetch(
        `${API_BASE_URL}/users/linking/${projectId}/${functionalityId}/${endpoint}/${userId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      )
      if (!res.ok) throw new Error("Failed to unlink user")
      refresh()
    } finally {
      setUnlinking(null)
    }
  }

  const matchesSearch = (u: User) =>
    `${u.name} ${u.surname}`.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())

  const assignedCount =
    (users?.requirement_engineers.length ?? 0) + (users?.stakeholders.length ?? 0)

  if (!canManage) return null

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) refresh()
        else setSearch("")
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Users className="mr-2 h-4 w-4" />
          Manage Team
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Functionality Team
          </DialogTitle>
          <DialogDescription>
            Assign or remove engineers and stakeholders for this functionality.
          </DialogDescription>
        </DialogHeader>

        <div className="relative mt-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <LoadingSpinner />
          </div>
        ) : (
          <Tabs defaultValue="assign" className="mt-1">
            <TabsList className="w-full">
              <TabsTrigger value="assign" className="flex-1">
                Assign Users
              </TabsTrigger>
              <TabsTrigger value="current" className="flex-1">
                Current Team
                {assignedCount > 0 && (
                  <Badge className="ml-1.5 h-4 px-1.5 text-[10px]" variant="secondary">
                    {assignedCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* ── Assign tab ── */}
            <TabsContent value="assign" className="mt-3 max-h-[380px] overflow-y-auto space-y-1.5 pr-1">
              {(users?.others ?? []).filter(matchesSearch).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8 italic">
                  {search ? "No users match your search." : "No unassigned users available."}
                </p>
              ) : (
                (users?.others ?? []).filter(matchesSearch).map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg border bg-card hover:bg-accent/30 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{u.name} {u.surname}</p>
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    </div>
                    <div className="flex items-center gap-1.5 ml-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1 text-violet-600 border-violet-500/30 hover:bg-violet-500/10"
                        disabled={linking === u.id}
                        onClick={() => linkUser(u.id, "engineers")}
                      >
                        {linking === u.id
                          ? <Loader2 className="h-3 w-3 animate-spin" />
                          : <><Wrench className="h-3 w-3" /> Engineer</>
                        }
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1 text-amber-600 border-amber-500/30 hover:bg-amber-500/10"
                        disabled={linking === u.id}
                        onClick={() => linkUser(u.id, "stakeholders")}
                      >
                        {linking === u.id
                          ? <Loader2 className="h-3 w-3 animate-spin" />
                          : <><Eye className="h-3 w-3" /> Stakeholder</>
                        }
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            {/* ── Current team tab ── */}
            <TabsContent value="current" className="mt-3 max-h-[380px] overflow-y-auto space-y-4 pr-1">
              {/* Project managers — inherited, no remove button */}
              <AssignedSection
                title="Project Managers"
                users={(users?.project_managers ?? []).filter(matchesSearch)}
                role="managers"
              />
              {/* Engineers — removable */}
              <AssignedSection
                title="Engineers"
                users={(users?.requirement_engineers ?? []).filter(matchesSearch)}
                role="engineers"
                unlinking={unlinking}
                onUnlink={(id) => unlinkUser(id, "engineers")}
              />
              {/* Stakeholders — removable */}
              <AssignedSection
                title="Stakeholders"
                users={(users?.stakeholders ?? []).filter(matchesSearch)}
                role="stakeholders"
                unlinking={unlinking}
                onUnlink={(id) => unlinkUser(id, "stakeholders")}
              />
              {assignedCount === 0 && (users?.project_managers ?? []).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8 italic">
                  No team members assigned yet.
                </p>
              )}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}

const roleConfig = {
  managers: {
    label: "Manager",
    badgeClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    rowClass: "bg-emerald-500/5 border-emerald-500/20",
    icon: <Check className="h-3 w-3 mr-1" />,
  },
  engineers: {
    label: "Engineer",
    badgeClass: "bg-violet-500/10 text-violet-600 border-violet-500/20",
    rowClass: "bg-violet-500/5 border-violet-500/20",
    icon: <Wrench className="h-3 w-3 mr-1" />,
  },
  stakeholders: {
    label: "Stakeholder",
    badgeClass: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    rowClass: "bg-amber-500/5 border-amber-500/20",
    icon: <Eye className="h-3 w-3 mr-1" />,
  },
} as const

function AssignedSection({
  title,
  users,
  role,
  unlinking,
  onUnlink,
}: {
  title: string
  users: User[]
  role: keyof typeof roleConfig
  unlinking?: number | null
  onUnlink?: (userId: number) => void
}) {
  if (users.length === 0) return null
  const config = roleConfig[role]

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
        {title}
      </p>
      <div className="space-y-1.5">
        {users.map((u) => (
          <div
            key={u.id}
            className={`flex items-center justify-between px-3 py-2.5 rounded-lg border ${config.rowClass}`}
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{u.name} {u.surname}</p>
              <p className="text-xs text-muted-foreground truncate">{u.email}</p>
            </div>
            <div className="flex items-center gap-2 ml-2 shrink-0">
              <Badge className={`text-xs border flex items-center ${config.badgeClass}`}>
                {config.icon}{config.label}
              </Badge>
              {onUnlink && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 px-2"
                  disabled={unlinking === u.id}
                  onClick={() => onUnlink(u.id)}
                >
                  {unlinking === u.id
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    : <UserMinus className="h-3.5 w-3.5" />
                  }
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}