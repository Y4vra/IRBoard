import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { ShieldAlert } from "lucide-react"

export default function Forbidden() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <ShieldAlert className="h-16 w-16 text-red-500 mb-4" />
      <h1 className="text-4xl font-bold text-slate-900 mb-2">Access Denied</h1>
      <p className="text-slate-500 max-w-md mb-6">
        You do not have the necessary permissions to view this resource. 
        If you think this is a mistake, please contact your administrator.
      </p>
      <Button asChild>
        <Link to="/home">Return Home</Link>
      </Button>
    </div>
  )
}