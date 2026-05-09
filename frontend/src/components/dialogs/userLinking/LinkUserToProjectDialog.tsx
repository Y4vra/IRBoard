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
import { Search, ShieldCheck, Users, Check, Loader2 } from "lucide-react"
import LoadingSpinner from "@/components/LoadingSpinner"
import { useBackendResource } from "@/hooks/useBackendResource"
import type { User } from "@/types/User"

interface ProjectUsersMap {
  managers: User[]
  not_managers: User[]
}

interface LinkUserToProjectDialogProps {
  projectId: string
}

export function LinkUserToProjectDialog({ projectId }: LinkUserToProjectDialogProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [linking, setLinking] = useState<number | null>(null)

  const fetcher = useCallback(
    () =>
      fetch(`${API_BASE_URL}/users/linking/${projectId}`, {
        credentials: "include",
      }).then((r) => {
        if (!r.ok) throw new Error("Failed to fetch users")
        return r.json()
      }),
    [projectId]
  )

  const { data: users, loading, refresh } = useBackendResource<ProjectUsersMap>({
    fetcher,
  })

  const linkUser = async (userId: number) => {
    setLinking(userId)
    try {
      const res = await fetch(`${API_BASE_URL}/users/linking/${projectId}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userId),
      })
      if (!res.ok) throw new Error("Failed to link user")
      refresh()
    } finally {
      setLinking(null)
    }
  }

  const matchesSearch = (u: User) =>
    `${u.name} ${u.surname}`.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())

  const filteredManagers = (users?.managers ?? []).filter(matchesSearch)
  const filteredNonManagers = (users?.not_managers ?? []).filter(matchesSearch)

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
          Manage Members
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Project Members
          </DialogTitle>
          <DialogDescription>
            Grant manager access to users for this project.
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
          <div className="space-y-5 max-h-[420px] overflow-y-auto pr-1">

            {/* Current managers */}
            {filteredManagers.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                  Current Managers
                </p>
                <div className="space-y-1.5">
                  {filteredManagers.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{u.name} {u.surname}</p>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      </div>
                      <Badge className="ml-2 shrink-0 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs flex items-center">
                        <Check className="h-3 w-3 mr-1" /> Manager
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Users to add */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                Add as Manager
              </p>
              {filteredNonManagers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6 italic">
                  {search ? "No users match your search." : "All users are already managers."}
                </p>
              ) : (
                <div className="space-y-1.5">
                  {filteredNonManagers.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between px-3 py-2.5 rounded-lg border bg-card hover:bg-accent/40 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{u.name} {u.surname}</p>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="ml-2 shrink-0 h-7 text-xs"
                        disabled={linking === u.id}
                        onClick={() => linkUser(u.id)}
                      >
                        {linking === u.id
                          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          : "Add"
                        }
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}