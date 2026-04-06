import { useState } from "react"
import { API_BASE_URL } from "@/lib/globalVars"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, UserPlus, Mail, ShieldCheck, Copy, Check } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface InviteUserDialogProps {
  onSuccess: () => void;
}

export function InviteUserDialog({ onSuccess }: InviteUserDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [invitationCode, setInvitationCode] = useState<string | null>(null)
  const [isCopied, setIsCopied] = useState(false)

  const [formData, setFormData] = useState({
    email: "",
    name: "",
    surname: "",
    isAdmin: false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/users/invite`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...formData, active: true })
      })

      if (!response.ok) throw new Error('Failed to invite user')

      const result = await response.json()
      setInvitationCode(result.oryId)
      onSuccess()
    } catch (err) {
      alert("Error inviting user")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (invitationCode) {
      navigator.clipboard.writeText(invitationCode)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    }
  }

  const handleClose = () => {
    setOpen(false)
    setInvitationCode(null)
    setFormData({ email: "", name: "", surname: "", isAdmin: false })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => v ? setOpen(true) : handleClose()}>
      <DialogTrigger asChild>
        <Button className="shadow-md">
          <UserPlus className="h-4 w-4 mr-2" />
          Invite New User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite New User</DialogTitle>
          <DialogDescription>
            Enter user details to generate a system identity.
          </DialogDescription>
        </DialogHeader>

        {!invitationCode ? (
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  required 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="surname">Surname</Label>
                <Input 
                  id="surname" 
                  value={formData.surname} 
                  onChange={(e) => setFormData({...formData, surname: e.target.value})} 
                  required 
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input 
                  id="email" 
                  type="email" 
                  className="pl-9"
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  required 
                />
              </div>
            </div>
            <div className="flex items-center space-x-2 py-2">
              <Checkbox 
                id="isAdmin" 
                checked={formData.isAdmin} 
                onCheckedChange={(c) => setFormData({...formData, isAdmin: !!c})} 
              />
              <Label htmlFor="isAdmin" className="text-sm font-medium flex items-center gap-2 cursor-pointer">
                Administrator Privileges <ShieldCheck className="h-4 w-4 text-amber-500" />
              </Label>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate Invitation"}
            </Button>
          </form>
        ) : (
          <div className="space-y-4 pt-4 animate-in zoom-in-95">
            <div className="p-4 bg-indigo-50 border border-indigo-100 border-dashed rounded-lg">
              <Label className="text-[10px] font-bold uppercase text-indigo-600">Identity ID (Ory ID)</Label>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 bg-white p-2 rounded border text-xs font-mono break-all font-bold">
                  {invitationCode}
                </code>
                <Button size="icon" variant="outline" className="h-9 w-9 bg-white" onClick={copyToClipboard}>
                  {isCopied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-slate-400" />}
                </Button>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={handleClose}>
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}