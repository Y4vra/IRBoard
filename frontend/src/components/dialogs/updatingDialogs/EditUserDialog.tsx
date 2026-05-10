import { useState, useEffect } from "react"
import { API_BASE_URL } from "@/lib/globalVars"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Pencil, ShieldCheck, AlertCircle, Save } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { User } from "@/types/User"

interface EditUserDialogProps {
  user: User
  onSuccess: () => void
}

type Step = "idle" | "requesting" | "editing" | "saving" | "done" | "error"

export function EditUserDialog({ user, onSuccess }: EditUserDialogProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>("idle")
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: user.name,
    surname: user.surname,
    email: user.email ?? "",
    isAdmin: user.isAdmin ?? false,
  })

  // Request edit lock when dialog opens
  useEffect(() => {
    if (!open) return

    const requestLock = async () => {
      setStep("requesting")
      setError(null)
      try {
        const res = await fetch(`${API_BASE_URL}/users/${user.id}/requestEdit`, {
          credentials: "include",
        })
        if (res.status === 409) {
          setError("This user is currently being edited by another administrator.")
          setStep("error")
          return
        }
        if (!res.ok) {
          setError("Server error while requesting edit lock.")
          setStep("error")
          return
        }
        setStep("editing")
      } catch {
        setError("Could not connect to the server.")
        setStep("error")
      }
    }

    requestLock()
  }, [open, user.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStep("saving")
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/users/${user.id}/modify`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        if (response.status === 403)
          throw new Error("You do not have permission to modify this user.")
        if (response.status === 409)
          throw new Error("The user is being edited by another administrator.")
        throw new Error("An error occurred while saving.")
      }

      setStep("done")
      onSuccess()
      setTimeout(handleClose, 800)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      setStep("editing")
    }
  }

  const handleClose = () => {
    if (step === "saving" || step === "requesting") return
    setOpen(false)
    setError(null)
    setStep("idle")
    // Reset form to current user values in case of cancel
    setFormData({
      name: user.name,
      surname: user.surname,
      email: user.email ?? "",
      isAdmin: user.isAdmin ?? false,
    })
  }

  const isLoading = step === "requesting" || step === "saving"

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : handleClose())}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-slate-600 hover:text-indigo-600">
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Pencil className="h-4 w-4" />
            </div>
            Edit User
          </DialogTitle>
          <DialogDescription>
            Modify details for{" "}
            <span className="font-semibold text-foreground">
              {user.name} {user.surname}
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        {/* Lock requesting state */}
        {step === "requesting" && (
          <div className="flex items-center gap-3 py-8 justify-center text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
            Requesting edit lock...
          </div>
        )}

        {/* Error state (lock conflict or server error) */}
        {step === "error" && (
          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
            <Button variant="outline" className="w-full" onClick={handleClose}>
              Close
            </Button>
          </div>
        )}

        {/* Edit form */}
        {(step === "editing" || step === "saving" || step === "done") && (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-surname">Surname</Label>
                <Input
                  id="edit-surname"
                  value={formData.surname}
                  onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isLoading}
                required
              />
            </div>

            <div className="flex items-center space-x-2 py-2">
              <Checkbox
                id="edit-isAdmin"
                checked={formData.isAdmin}
                onCheckedChange={(c) => setFormData({ ...formData, isAdmin: !!c })}
                disabled={isLoading}
              />
              <Label
                htmlFor="edit-isAdmin"
                className="text-sm font-medium flex items-center gap-2 cursor-pointer"
              >
                Administrator Privileges{" "}
                <ShieldCheck className="h-4 w-4 text-amber-500" />
              </Label>
            </div>

            {error && (
              <div className="flex items-start gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isLoading || step === "done"}
              >
                {step === "saving" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}