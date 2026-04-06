import { useEffect, useState } from "react"
import { kratos } from "@/lib/kratos"
import { 
  type UiNodeInputAttributes,
  type UpdateLoginFlowBody
} from "@ory/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { API_BASE_URL } from "@/lib/globalVars"

function Registration() {
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { isAuthenticated, loading, checkSession } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/", { replace: true })
    }
  }, [isAuthenticated, loading, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    if (password !== confirmPassword) {
      alert("Passwords do not match")
      return
    }

    setIsSubmitting(true)

    try {
      const activateResponse = await fetch(`${API_BASE_URL}/auth/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: email, 
          code: code, 
          password: password
        })
      })

      if (!activateResponse.ok) {
        throw new Error("Activation failed")
      }

      const { data: loginFlow } = await kratos.createBrowserLoginFlow()
      const loginCsrf = (loginFlow.ui.nodes.find(
        (n: any) => n.attributes.name === "csrf_token"
      )?.attributes as UiNodeInputAttributes)?.value as string

      await kratos.updateLoginFlow({
        flow: loginFlow.id,
        updateLoginFlowBody: {
          method: "password",
          csrf_token: loginCsrf,
          identifier: email,
          password: password,
        } as UpdateLoginFlowBody,
      })

      await checkSession()
      navigate("/")

    } catch (err: any) {
      console.error(err)
      alert("Activation failed. Verify your credentials.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Account Activation</CardTitle>
          <CardDescription>Enter your invitation details to set up your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} id="registrationForm" className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="user@domain.com"
                required 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="code">Security Code</Label>
              <Input 
                id="code" 
                type="text" 
                value={code} 
                onChange={(e) => setCode(e.target.value)} 
                placeholder="000000"
                required 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">New Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                minLength={15} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input 
                id="confirmPassword" 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
              />
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button 
            type="submit" 
            form="registrationForm" 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Complete Registration"}
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            Already registered?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Click here
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

export default Registration